package main

import (
	"bufio"
	"bytes"
	"crypto/ed25519"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"flag"
	"fmt"
	"html"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"portside-launcher/relay/protocol"
)

const (
	MasterPublicKeyHex   = "1bdcfab94991fad858ce7bfae23fe559a80239d9f6b88085acb6c4e6534716cd"
	FallbackPublicKeyHex = "c3e7e558bd41300347cba5823bba9d4f8eb31d66138b943e243a805ed47cc9f9"
)

type SessionTicketPayload struct {
	Email     string   `json:"email"`
	MachineId string   `json:"machineId"`
	IssuedAt  int64    `json:"issuedAt"`
	ExpiresAt int64    `json:"expiresAt"`
	Tier      string   `json:"tier"`
	Features  []string `json:"features"`
	Nonce     string   `json:"nonce"`
}

type VirtualStream struct {
	id          uint32
	pipeReader  *io.PipeReader
	pipeWriter  *io.PipeWriter
	respHeaderC chan *http.Response
	closed      int32
}

func newVirtualStream(id uint32) *VirtualStream {
	pr, pw := io.Pipe()
	return &VirtualStream{
		id:          id,
		pipeReader:  pr,
		pipeWriter:  pw,
		respHeaderC: make(chan *http.Response, 1),
	}
}

func (s *VirtualStream) close() {
	if atomic.CompareAndSwapInt32(&s.closed, 0, 1) {
		_ = s.pipeWriter.Close()
	}
}

type ClientSession struct {
	conn       net.Conn
	handle     string
	domain     string
	machineId  string
	email      string
	streams    map[uint32]*VirtualStream
	streamsMu  sync.RWMutex
	lastActive time.Time
	mu         sync.Mutex
	closed     bool
}

func (c *ClientSession) writeFrame(frameType byte, streamId uint32, payload []byte) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.closed {
		return net.ErrClosed
	}
	_ = c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
	return protocol.WriteFrame(c.conn, frameType, streamId, payload)
}

func (c *ClientSession) getStream(id uint32) *VirtualStream {
	c.streamsMu.RLock()
	defer c.streamsMu.RUnlock()
	return c.streams[id]
}

func (c *ClientSession) addStream(s *VirtualStream) {
	c.streamsMu.Lock()
	c.streams[s.id] = s
	c.streamsMu.Unlock()
}

func (c *ClientSession) removeStream(id uint32) {
	c.streamsMu.Lock()
	if s, ok := c.streams[id]; ok {
		delete(c.streams, id)
		s.close()
	}
	c.streamsMu.Unlock()
}

type ProfilePayload struct {
	Profile struct {
		Handle            string   `json:"handle"`
		Name              string   `json:"name"`
		Title             string   `json:"title"`
		Bio               string   `json:"bio"`
		AvatarUrl         string   `json:"avatarUrl"`
		BannerUrl         string   `json:"bannerUrl"`
		AccentColor       string   `json:"accentColor"`
		Location          string   `json:"location"`
		Pronouns          string   `json:"pronouns"`
		Organization      string   `json:"organization"`
		StatusText        string   `json:"statusText"`
		StatusIndicator   string   `json:"statusIndicator"`
		VerifiedBadgeText string   `json:"verifiedBadgeText"`
		Skills            []string `json:"skills"`
		Github            string   `json:"github"`
		Twitter           string   `json:"twitter"`
		Buymeacoffee      string   `json:"buymeacoffee"`
		Website           string   `json:"website"`
		Discord           string   `json:"discord"`
		Telegram          string   `json:"telegram"`
		CustomLinks       []struct {
			ID          string `json:"id"`
			Label       string `json:"label"`
			URL         string `json:"url"`
			Description string `json:"description"`
		} `json:"customLinks"`
		ShowProjects     bool     `json:"showProjects"`
		ProjectsTitle    string   `json:"projectsTitle"`
		ProjectsSubtitle string   `json:"projectsSubtitle"`
		VisibleServices  []string `json:"visibleServices"`
	} `json:"profile"`
	Services []struct {
		ID       int    `json:"id"`
		Name     string `json:"name"`
		Hostname string `json:"hostname"`
		Port     int    `json:"port"`
		Protocol string `json:"protocol"`
	} `json:"services"`
	IsSupporter bool `json:"isSupporter"`
}

type RelayServer struct {
	clientAddr   string
	httpAddr     string
	baseDomain   string
	cacheDir     string
	clients      map[string]*ClientSession
	clientsMu    sync.RWMutex
	nextStreamId uint32
}

func NewRelayServer(clientAddr, httpAddr, baseDomain, cacheDir string) *RelayServer {
	if cacheDir == "" {
		cacheDir = "/opt/portside-relay/cache"
	}
	_ = os.MkdirAll(cacheDir, 0755)
	return &RelayServer{
		clientAddr: clientAddr,
		httpAddr:   httpAddr,
		baseDomain: strings.ToLower(strings.TrimSpace(baseDomain)),
		cacheDir:   cacheDir,
		clients:    make(map[string]*ClientSession),
	}
}

func verifySessionTicket(ticket string, machineId string) (bool, *SessionTicketPayload) {
	parts := strings.Split(ticket, ".")
	if len(parts) != 3 || parts[0] != "PST1" {
		return false, nil
	}
	payloadBytes, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		payloadBytes, err = base64.URLEncoding.DecodeString(parts[1])
		if err != nil {
			return false, nil
		}
	}
	sigBytes, err := base64.RawURLEncoding.DecodeString(parts[2])
	if err != nil {
		sigBytes, err = base64.URLEncoding.DecodeString(parts[2])
		if err != nil {
			return false, nil
		}
	}

	pubKeys := []string{MasterPublicKeyHex, FallbackPublicKeyHex}
	valid := false
	for _, hexKey := range pubKeys {
		rawPub, _ := hex.DecodeString(hexKey)
		if len(rawPub) == ed25519.PublicKeySize && ed25519.Verify(rawPub, payloadBytes, sigBytes) {
			valid = true
			break
		}
	}

	if !valid {
		return false, nil
	}

	var payload SessionTicketPayload
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return false, nil
	}

	if payload.ExpiresAt < time.Now().Unix() {
		return false, nil
	}

	if payload.MachineId != "" && payload.MachineId != machineId {
		return false, nil
	}

	return true, &payload
}

func (s *RelayServer) Start() error {
	clientLn, err := net.Listen("tcp", s.clientAddr)
	if err != nil {
		return fmt.Errorf("failed to bind client tunnel port: %w", err)
	}
	log.Printf("[Direct Relay] Client control tunnel listening on %s", s.clientAddr)

	go func() {
		for {
			conn, err := clientLn.Accept()
			if err != nil {
				log.Printf("[Direct Relay] Accept error: %v", err)
				return
			}
			go s.handleClientConn(conn)
		}
	}()

	httpServer := &http.Server{
		Addr:         s.httpAddr,
		Handler:      s,
		ReadTimeout:  120 * time.Second,
		WriteTimeout: 120 * time.Second,
		IdleTimeout:  120 * time.Second,
	}
	log.Printf("[Direct Relay] HTTP reverse proxy ingress listening on %s (wildcard: *.%s)", s.httpAddr, s.baseDomain)
	return httpServer.ListenAndServe()
}

func (s *RelayServer) saveProfileSnapshot(handle string, p *protocol.ProfileSyncPayload) {
	if handle == "" {
		return
	}
	dir := filepath.Join(s.cacheDir, handle)
	_ = os.MkdirAll(dir, 0755)

	if p.ProfileJSON != "" {
		_ = os.WriteFile(filepath.Join(dir, "profile.json"), []byte(p.ProfileJSON), 0644)
		log.Printf("[Direct Relay] Persisted 24/7 profile JSON for '%s'", handle)
	}
	if p.HTML != "" {
		_ = os.WriteFile(filepath.Join(dir, "profile.html"), []byte(p.HTML), 0644)
	}
}

func (s *RelayServer) handleClientConn(conn net.Conn) {
	_ = conn.SetReadDeadline(time.Now().Add(15 * time.Second))
	frameType, _, payload, err := protocol.ReadFrame(conn)
	if err != nil || frameType != protocol.TypeHandshake {
		log.Printf("[Direct Relay] Handshake failed from %s: %v", conn.RemoteAddr(), err)
		_ = conn.Close()
		return
	}

	var hs protocol.HandshakePayload
	if err := json.Unmarshal(payload, &hs); err != nil {
		_ = conn.Close()
		return
	}

	handle := strings.ToLower(strings.TrimSpace(hs.Handle))
	if handle == "" {
		handle = "pact"
	}

	// Verify cryptographic session ticket or allow pact machine master override
	isPact := hs.MachineId == "PS-CABDA074-A01FD367" || hs.MachineId == "PS-1A017FC9-CB830519" || hs.MachineId == "PS-DA91FEBA-0D079FFA"
	validTicket, ticketPayload := verifySessionTicket(hs.SessionTicket, hs.MachineId)

	// Strictly verify that reserved handles can only be registered by authorized identities
	isReserved := handle == "pact" || handle == "letsmakepact" || handle == "admin" || handle == "root" || handle == "portside" || handle == "social"
	if isReserved && !isPact && (ticketPayload == nil || ticketPayload.Email != "pact@virtuoushigh.com") {
		ack := protocol.HandshakeAckPayload{
			Success: false,
			Error:   "Unauthorized: handle is reserved by platform administration",
		}
		ackBytes, _ := protocol.EncodeJSON(ack)
		_ = protocol.WriteFrame(conn, protocol.TypeHandshakeAck, 0, ackBytes)
		_ = conn.Close()
		log.Printf("[Direct Relay] Rejected reserved handle spoof attempt: '%s' from %s", handle, hs.MachineId)
		return
	}

	if !validTicket && !isPact {
		ack := protocol.HandshakeAckPayload{
			Success: false,
			Error:   "Unauthorized: valid PortSide session ticket required",
		}
		ackBytes, _ := protocol.EncodeJSON(ack)
		_ = protocol.WriteFrame(conn, protocol.TypeHandshakeAck, 0, ackBytes)
		_ = conn.Close()
		log.Printf("[Direct Relay] Rejected unauthenticated client: %s (%s)", hs.MachineId, handle)
		return
	}

	assignedDomain := fmt.Sprintf("%s.%s", handle, s.baseDomain)
	session := &ClientSession{
		conn:       conn,
		handle:     handle,
		domain:     assignedDomain,
		machineId:  hs.MachineId,
		email:      hs.Email,
		streams:    make(map[uint32]*VirtualStream),
		lastActive: time.Now(),
	}

	// Register client session, safely replacing any stale connection for this handle
	s.clientsMu.Lock()
	if old, exists := s.clients[handle]; exists {
		old.mu.Lock()
		old.closed = true
		_ = old.conn.Close()
		old.mu.Unlock()
		log.Printf("[Direct Relay] Replaced existing session for subdomain '%s'", handle)
	}
	s.clients[handle] = session
	s.clientsMu.Unlock()

	// Persist claim marker so handle is recognized as claimed even when offline
	claimDir := filepath.Join(s.cacheDir, handle)
	_ = os.MkdirAll(claimDir, 0755)
	_ = os.WriteFile(filepath.Join(claimDir, "claimed"), []byte(time.Now().Format(time.RFC3339)), 0644)

	ack := protocol.HandshakeAckPayload{
		Success:        true,
		AssignedDomain: assignedDomain,
	}
	ackBytes, _ := protocol.EncodeJSON(ack)
	if err := session.writeFrame(protocol.TypeHandshakeAck, 0, ackBytes); err != nil {
		_ = conn.Close()
		return
	}

	log.Printf("[Direct Relay] Connected subdomain: %s -> %s (machine: %s)", assignedDomain, conn.RemoteAddr(), hs.MachineId)

	// Keepalive ping loop (every 15s) to guarantee no edge/firewall timeouts
	stopPing := make(chan struct{})
	go func() {
		ticker := time.NewTicker(15 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := session.writeFrame(protocol.TypePing, 0, nil); err != nil {
					_ = conn.Close()
					return
				}
			case <-stopPing:
				return
			}
		}
	}()

	// Inbound frame reader loop
	for {
		_ = conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		fType, sId, fPayload, err := protocol.ReadFrame(conn)
		if err != nil {
			break
		}
		session.lastActive = time.Now()

		switch fType {
		case protocol.TypePong:
			// Heartbeat acknowledged

		case protocol.TypePing:
			_ = session.writeFrame(protocol.TypePong, 0, nil)

		case protocol.TypeProfileSync:
			var syncPayload protocol.ProfileSyncPayload
			if err := json.Unmarshal(fPayload, &syncPayload); err == nil {
				s.saveProfileSnapshot(session.handle, &syncPayload)
			}

		case protocol.TypeStreamData:
			if st := session.getStream(sId); st != nil {
				_, _ = st.pipeWriter.Write(fPayload)
			}

		case protocol.TypeStreamClose:
			if st := session.getStream(sId); st != nil {
				session.removeStream(sId)
			}
		}
	}

	close(stopPing)
	session.mu.Lock()
	session.closed = true
	_ = conn.Close()
	session.mu.Unlock()

	// Clean up registration if this session is still the active one
	s.clientsMu.Lock()
	if current, exists := s.clients[handle]; exists && current == session {
		delete(s.clients, handle)
		log.Printf("[Direct Relay] Disconnected subdomain: %s (standby profile remains active 24/7)", assignedDomain)
	}
	s.clientsMu.Unlock()
}

func (s *RelayServer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	host := strings.ToLower(r.Host)
	if idx := strings.Index(host, ":"); idx != -1 {
		host = host[:idx]
	}

	// Extract subdomain handle: e.g. "pact.portside.lol" -> "pact"
	handle := ""
	if strings.HasSuffix(host, "."+s.baseDomain) {
		handle = strings.TrimSuffix(host, "."+s.baseDomain)
	} else if host == s.baseDomain {
		handle = "pact"
	}

	if handle == "" {
		http.Error(w, "Invalid hostname", http.StatusBadRequest)
		return
	}

	s.clientsMu.RLock()
	client, ok := s.clients[handle]
	s.clientsMu.RUnlock()

	if !ok || client == nil {
		s.handleOfflineRequest(w, r, host, handle)
		return
	}

	streamId := atomic.AddUint32(&s.nextStreamId, 1)
	st := newVirtualStream(streamId)
	client.addStream(st)
	defer client.removeStream(streamId)

	// Serialize HTTP request to raw wire format to stream to developer's local port 80
	var reqBuf bytes.Buffer
	if err := r.Write(&reqBuf); err != nil {
		http.Error(w, "Failed to serialize request", http.StatusInternalServerError)
		return
	}

	// Send StreamOpen frame with initial request
	if err := client.writeFrame(protocol.TypeStreamOpen, streamId, reqBuf.Bytes()); err != nil {
		http.Error(w, "Tunnel upstream error", http.StatusBadGateway)
		return
	}

	// Read HTTP response stream from client
	respReader := bufio.NewReader(st.pipeReader)
	resp, err := http.ReadResponse(respReader, r)
	if err != nil {
		http.Error(w, "Empty response from PortSide node", http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy response headers
	for k, vv := range resp.Header {
		for _, v := range vv {
			w.Header().Add(k, v)
		}
	}
	w.WriteHeader(resp.StatusCode)

	// Stream body chunks in real-time
	buf := make([]byte, 32*1024)
	for {
		n, rErr := resp.Body.Read(buf)
		if n > 0 {
			_, _ = w.Write(buf[:n])
			if flusher, ok := w.(http.Flusher); ok {
				flusher.Flush()
			}
		}
		if rErr != nil {
			break
		}
	}
}

func (s *RelayServer) handleOfflineRequest(w http.ResponseWriter, r *http.Request, host, handle string) {
	path := r.URL.Path

	// 1. Intercept Next.js static chunks to prevent red 502 console flood in DevTools
	if strings.HasPrefix(path, "/_next/static/") {
		if strings.HasSuffix(path, ".css") {
			w.Header().Set("Content-Type", "text/css; charset=utf-8")
			w.Header().Set("Cache-Control", "public, max-age=3600")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("/* offline showcase */"))
			return
		}
		if strings.HasSuffix(path, ".js") {
			w.Header().Set("Content-Type", "application/javascript; charset=utf-8")
			w.Header().Set("Cache-Control", "public, max-age=3600")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte("/* offline showcase */"))
			return
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// 2. Webmanifest
	if path == "/manifest.webmanifest" {
		w.Header().Set("Content-Type", "application/manifest+json; charset=utf-8")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"name":"PortSide Developer Showcase","short_name":"PortSide","start_url":"/","display":"standalone","background_color":"#030712","theme_color":"#030712"}`))
		return
	}

	// 3. Favicon & icons
	if path == "/favicon.ico" || strings.HasPrefix(path, "/icon") || strings.HasPrefix(path, "/apple-icon") {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	// 4. If domain is not claimed, render the unclaimed domain purchase promotion page
	if !s.isHandleClaimed(host, handle) {
		s.renderUnclaimedDomainPage(w, host, handle)
		return
	}

	// 5. Standalone Showcase page for Profile requests on claimed domains
	if path == "/" || path == "/profile" || path == "/@me" || path == "/about" {
		if s.renderCachedShowcase(w, handle) {
			return
		}
	}

	// 6. Standby for claimed nodes that are offline
	s.renderOfflinePage(w, host, handle)
}

func (s *RelayServer) renderCachedShowcase(w http.ResponseWriter, handle string) bool {
	dir := filepath.Join(s.cacheDir, handle)
	jsonPath := filepath.Join(dir, "profile.json")
	data, err := os.ReadFile(jsonPath)
	if err != nil {
		// Fallback to profile.html if exists
		htmlPath := filepath.Join(dir, "profile.html")
		if hData, hErr := os.ReadFile(htmlPath); hErr == nil && len(hData) > 0 {
			w.Header().Set("Content-Type", "text/html; charset=utf-8")
			w.Header().Set("X-Portside-Showcase", "CACHED-24-7")
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write(hData)
			return true
		}
		return false
	}

	var payload ProfilePayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return false
	}
	p := payload.Profile

	name := p.Name
	if name == "" {
		name = p.Handle
	}
	if name == "" {
		name = handle
	}

	title := p.Title
	if title == "" {
		title = "Software Engineer & Builder"
	}

	bio := p.Bio
	if bio == "" {
		bio = "Building local infrastructure and developer tools."
	}

	avatar := p.AvatarUrl
	if avatar == "" {
		avatar = fmt.Sprintf("https://github.com/%s.png", handle)
	}

	wallpaper := p.BannerUrl

	statusText := p.StatusText
	if statusText == "" {
		statusText = "Standby Mode · 24/7 Showcase Active"
	}

	var skillsHtml strings.Builder
	for _, skill := range p.Skills {
		if strings.TrimSpace(skill) == "" {
			continue
		}
		skillsHtml.WriteString(fmt.Sprintf(`<span class="skill-pill">%s</span>`, html.EscapeString(skill)))
	}

	var linksHtml strings.Builder
	addLink := func(label, url, iconSvg string) {
		if url == "" {
			return
		}
		linksHtml.WriteString(fmt.Sprintf(`
		<a href="%s" target="_blank" rel="noopener noreferrer" class="link-btn">
			%s
			<span>%s</span>
			<svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
		</a>`, html.EscapeString(url), iconSvg, html.EscapeString(label)))
	}

	// GitHub
	addLink("GitHub", p.Github, `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`)

	// X / Twitter
	addLink("X / Twitter", p.Twitter, `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`)

	// Telegram
	addLink("Telegram", p.Telegram, `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>`)

	// Discord
	addLink("Discord", p.Discord, `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>`)

	// BuyMeACoffee
	addLink("Buy Me a Coffee", p.Buymeacoffee, `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>`)

	// Website
	addLink("Personal Website", p.Website, `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`)

	// Custom Links
	for _, cl := range p.CustomLinks {
		if cl.URL == "" {
			continue
		}
		desc := ""
		if cl.Description != "" {
			desc = fmt.Sprintf(`<div class="link-desc">%s</div>`, html.EscapeString(cl.Description))
		}
		linksHtml.WriteString(fmt.Sprintf(`
		<a href="%s" target="_blank" rel="noopener noreferrer" class="link-btn custom-link">
			<div class="custom-link-content">
				<div class="link-title">%s</div>
				%s
			</div>
			<svg class="arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
		</a>`, html.EscapeString(cl.URL), html.EscapeString(cl.Label), desc))
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.Header().Set("Cache-Control", "public, max-age=60")
	w.Header().Set("X-Portside-Showcase", "CACHED-24-7")
	w.WriteHeader(http.StatusOK)

	wallpaperStyle := ""
	if wallpaper != "" {
		wallpaperStyle = fmt.Sprintf(`background-image: url('%s');`, html.EscapeString(wallpaper))
	}

	fmt.Fprintf(w, `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
  <title>%s (@%s) &middot; PortSide Developer Showcase</title>
  <meta name="description" content="%s">
  <meta name="theme-color" content="#030712">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #050811;
      %s
      background-attachment: fixed;
      background-position: center top;
      background-repeat: no-repeat;
      background-size: cover;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.5;
      position: relative;
      -webkit-font-smoothing: antialiased;
    }
    .backdrop-overlay {
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(5, 8, 17, 0.4) 0%%, rgba(3, 7, 18, 0.88) 100%%);
      pointer-events: none;
      z-index: 1;
    }
    .container {
      width: 100%%;
      max-width: 680px;
      padding: 60px 20px 48px;
      position: relative;
      z-index: 10;
    }
    .card {
      background: rgba(11, 15, 25, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 32px 28px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
    }
    .header-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }
    .avatar-wrapper {
      position: relative;
      width: 96px;
      height: 96px;
      border-radius: 22px;
      padding: 3px;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      box-shadow: 0 8px 24px rgba(56, 189, 248, 0.35);
    }
    .avatar-wrapper img {
      width: 100%%;
      height: 100%%;
      object-fit: cover;
      border-radius: 19px;
      background: #0b101b;
      display: block;
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      padding: 6px 14px;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      color: #38bdf8;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .title-section {
      margin-top: 18px;
    }
    .name-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .verified-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 6px;
      font-size: 11px;
      font-weight: 600;
      color: #34d399;
    }
    .user-handle {
      font-family: ui-monospace, SFMono-Regular, monospace;
      font-size: 13px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .headline {
      font-size: 14px;
      font-weight: 500;
      color: #cbd5e1;
      margin-top: 6px;
    }
    .bio {
      font-size: 14px;
      color: #94a3b8;
      margin-top: 12px;
      line-height: 1.6;
    }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 14px;
      font-size: 12px;
      color: #64748b;
      flex-wrap: wrap;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      margin: 28px 0 12px;
    }
    .skills-wrap {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .skill-pill {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      font-size: 12px;
      color: #cbd5e1;
      font-family: ui-monospace, SFMono-Regular, monospace;
    }
    .links-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }
    .link-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      color: #e2e8f0;
      text-decoration: none;
      font-size: 14px;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .link-btn:hover {
      background: rgba(255, 255, 255, 0.07);
      border-color: rgba(56, 189, 248, 0.4);
      transform: translateY(-1px);
      color: #ffffff;
    }
    .link-btn svg:not(.arrow) {
      flex-shrink: 0;
      color: #38bdf8;
    }
    .link-btn .arrow {
      margin-left: auto;
      color: #64748b;
      transition: transform 0.15s ease;
    }
    .link-btn:hover .arrow {
      color: #38bdf8;
      transform: translate(2px, -2px);
    }
    .custom-link {
      padding: 14px 16px;
    }
    .custom-link-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .link-title {
      font-size: 14px;
      font-weight: 600;
      color: #f1f5f9;
    }
    .link-desc {
      font-size: 12px;
      color: #94a3b8;
      font-weight: 400;
    }
    footer {
      margin-top: 36px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      display: flex;
      flex-direction: column;
      gap: 6px;
      align-items: center;
    }
    footer a {
      color: #38bdf8;
      text-decoration: none;
      font-weight: 500;
    }
    footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="backdrop-overlay"></div>
  <div class="container">
    <div class="card">
      <div class="header-row">
        <div class="avatar-wrapper">
          <img src="%s" alt="%s" onerror="this.src='https://github.com/letsmakepact.png'">
        </div>
        <div class="status-badge">
          <span>%s</span>
        </div>
      </div>

      <div class="title-section">
        <div class="name-row">
          <h1>%s</h1>
          <span class="verified-tag">✓ Verified Supporter</span>
        </div>
        <div class="user-handle">@%s</div>
        <div class="headline">%s</div>
        <div class="bio">%s</div>
      </div>

      <div class="section-title">Verified Developer Links</div>
      <div class="links-grid">
        %s
      </div>

      <div class="section-title">Core Technologies</div>
      <div class="skills-wrap">
        %s
      </div>
    </div>

    <footer>
      <div>Powered 24/7 by <a href="https://portside.lol" target="_blank">PortSide Primary Edge Relay</a></div>
      <div>Direct Device Routing &middot; Encrypted Edge Mesh</div>
    </footer>
  </div>
</body>
</html>`,
		html.EscapeString(name),
		html.EscapeString(handle),
		html.EscapeString(bio),
		wallpaperStyle,
		html.EscapeString(avatar),
		html.EscapeString(name),
		html.EscapeString(statusText),
		html.EscapeString(name),
		html.EscapeString(handle),
		html.EscapeString(title),
		html.EscapeString(bio),
		linksHtml.String(),
		skillsHtml.String(),
	)
	return true
}

func (s *RelayServer) isHandleClaimed(host, handle string) bool {
	handle = strings.ToLower(strings.TrimSpace(handle))
	if handle == "" {
		return false
	}

	// Reserved platform handles are always claimed
	if handle == "pact" || handle == "letsmakepact" || handle == "admin" || handle == "root" || handle == "portside" || handle == "social" {
		return true
	}

	// Active tunnel session
	s.clientsMu.RLock()
	_, active := s.clients[handle]
	s.clientsMu.RUnlock()
	if active {
		return true
	}

	// Local cache directory check
	dir := filepath.Join(s.cacheDir, handle)
	if fi, err := os.Stat(dir); err == nil && fi.IsDir() {
		if _, err := os.Stat(filepath.Join(dir, "profile.json")); err == nil {
			return true
		}
		if _, err := os.Stat(filepath.Join(dir, "profile.html")); err == nil {
			return true
		}
		if _, err := os.Stat(filepath.Join(dir, "claimed")); err == nil {
			return true
		}
	}

	// Authoritative verification via central web API
	client := &http.Client{Timeout: 2 * time.Second}
	verifyUrl := fmt.Sprintf("https://%s/api/host/verify?host=%s", s.baseDomain, url.QueryEscape(host))
	resp, err := client.Get(verifyUrl)
	if err == nil {
		defer resp.Body.Close()
		if resp.StatusCode == http.StatusOK {
			var res struct {
				Known bool `json:"known"`
			}
			if err := json.NewDecoder(resp.Body).Decode(&res); err == nil && res.Known {
				_ = os.MkdirAll(dir, 0755)
				_ = os.WriteFile(filepath.Join(dir, "claimed"), []byte("true"), 0644)
				return true
			}
		}
	}

	return false
}

func (s *RelayServer) renderUnclaimedDomainPage(w http.ResponseWriter, host, handle string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)

	fullDomain := fmt.Sprintf("%s.%s", handle, s.baseDomain)
	if host != "" {
		fullDomain = host
	}
	escapedHandle := html.EscapeString(handle)
	escapedDomain := html.EscapeString(fullDomain)

	fmt.Fprintf(w, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PortSide &middot; Claim %s</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body {
      background: #030712;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      position: relative;
      overflow-x: hidden;
    }
    body::before {
      content: "";
      position: absolute;
      top: 20%%;
      left: 50%%;
      transform: translate(-50%%, -50%%);
      width: 520px;
      height: 360px;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.14) 0%%, rgba(16, 185, 129, 0.08) 50%%, transparent 75%%);
      filter: blur(60px);
      z-index: 0;
      pointer-events: none;
    }
    .card {
      position: relative;
      z-index: 1;
      background: #0b0f19;
      border: 1px solid rgba(56, 189, 248, 0.22);
      border-radius: 24px;
      max-width: 520px;
      width: 100%%;
      padding: 40px 32px;
      box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(56, 189, 248, 0.05);
      text-align: center;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 9999px;
      color: #34d399;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 24px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 9999px;
      background: #34d399;
      box-shadow: 0 0 10px #34d399;
      animation: pulse 2s infinite ease-in-out;
    }
    @keyframes pulse {
      0%%, 100%% { opacity: 1; transform: scale(1); }
      50%% { opacity: 0.4; transform: scale(0.85); }
    }
    h1 {
      font-size: 26px;
      font-weight: 800;
      margin: 0 0 12px 0;
      color: #ffffff;
      letter-spacing: -0.02em;
    }
    .domain-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 15px;
      background: #111827;
      padding: 8px 18px;
      border-radius: 12px;
      color: #38bdf8;
      border: 1px solid #1e293b;
      margin-bottom: 20px;
    }
    .desc {
      color: #94a3b8;
      font-size: 14px;
      line-height: 1.65;
      margin: 0 0 24px 0;
    }
    .features {
      text-align: left;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid #1e293b;
      border-radius: 16px;
      padding: 16px 20px;
      margin-bottom: 28px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #cbd5e1;
    }
    .check {
      color: #38bdf8;
      font-weight: bold;
      font-size: 14px;
    }
    .btn-claim {
      display: block;
      width: 100%%;
      background: linear-gradient(135deg, #0284c7 0%%, #2563eb 100%%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 24px;
      border-radius: 14px;
      font-size: 15px;
      font-weight: 700;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
      box-shadow: 0 4px 20px rgba(2, 132, 199, 0.4);
    }
    .btn-claim:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 25px rgba(2, 132, 199, 0.55);
    }
    .btn-secondary {
      display: inline-block;
      margin-top: 16px;
      color: #64748b;
      text-decoration: none;
      font-size: 13px;
      transition: color 0.15s ease;
    }
    .btn-secondary:hover {
      color: #94a3b8;
    }
    .footnote {
      margin-top: 20px;
      font-size: 11px;
      color: #475569;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Domain Available to Claim</div>
    <h1>Claim %s</h1>
    <div class="domain-pill">%s</div>
    <p class="desc">This vanity subdomain is currently unclaimed on the PortSide edge network. Claim it to unlock your custom address, developer showcase, and direct encrypted tunnels.</p>
    
    <div class="features">
      <div class="feature-item"><span class="check">&#10003;</span> Exclusive vanity address (<strong>%s</strong>)</div>
      <div class="feature-item"><span class="check">&#10003;</span> 24/7 Developer Showcase with custom backgrounds</div>
      <div class="feature-item"><span class="check">&#10003;</span> Live local port tunnels &amp; sub-services</div>
      <div class="feature-item"><span class="check">&#10003;</span> Automated edge TLS certificates</div>
    </div>

    <a href="https://buymeacoffee.com/pacts" class="btn-claim" target="_blank" rel="noopener noreferrer">Claim %s ($5.99/mo)</a>
    <a href="https://portside.lol" class="btn-secondary">Explore PortSide Network &rarr;</a>
    <div class="footnote">Already a supporter? Launch PortSide on your workstation and link your handle to activate.</div>
  </div>
</body>
</html>`, escapedDomain, escapedDomain, escapedDomain, escapedDomain, escapedHandle)
}

func (s *RelayServer) renderOfflinePage(w http.ResponseWriter, host, handle string) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusServiceUnavailable)
	fmt.Fprintf(w, `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portside &middot; Node Standby</title>
  <style>
    body { background: #030712; color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 24px; }
    .card { background: #0b0f19; border: 1px solid #1e293b; border-radius: 20px; max-width: 480px; width: 100%%; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 9999px; color: #38bdf8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 20px; }
    .dot { width: 8px; height: 8px; border-radius: 9999px; background: #38bdf8; box-shadow: 0 0 8px #38bdf8; }
    h1 { font-size: 22px; font-weight: 700; margin: 0 0 10px 0; color: #fff; }
    p { color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
    .host { font-family: monospace; background: #111827; padding: 6px 12px; border-radius: 8px; color: #38bdf8; border: 1px solid #1e293b; display: inline-block; margin-bottom: 20px; }
    .btn { display: inline-block; background: #0284c7; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; transition: background 0.15s; }
    .btn:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge"><span class="dot"></span> Node in Standby</div>
    <h1>Service Awaiting Node Reconnection</h1>
    <div class="host">%s</div>
    <p>The primary PortSide instance for <strong>%s</strong> is currently in standby. The developer's machine will reconnect automatically upon waking.</p>
    <a href="https://portside.lol" class="btn">Explore PortSide Network</a>
  </div>
</body>
</html>`, host, handle)
}

func main() {
	clientAddr := flag.String("client-addr", ":7000", "TCP address for client control tunnels")
	httpAddr := flag.String("http-addr", ":7080", "HTTP address for reverse proxy ingress from Nginx")
	baseDomain := flag.String("base-domain", "portside.lol", "Base domain for vanity subdomains")
	cacheDir := flag.String("cache-dir", "/opt/portside-relay/cache", "Path to profile cache directory")
	flag.Parse()

	srv := NewRelayServer(*clientAddr, *httpAddr, *baseDomain, *cacheDir)
	if err := srv.Start(); err != nil {
		log.Fatalf("Relay server encountered fatal error: %v", err)
	}
}

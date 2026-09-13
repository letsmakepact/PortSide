package protocol

import (
	"encoding/binary"
	"encoding/json"
	"errors"
	"io"
)

// Frame types
const (
	TypeHandshake    byte = 0x01
	TypeHandshakeAck byte = 0x02
	TypePing         byte = 0x03
	TypePong         byte = 0x04
	TypeStreamOpen   byte = 0x05
	TypeStreamData   byte = 0x06
	TypeStreamClose  byte = 0x07
	TypeStreamReset  byte = 0x08
	TypeProfileSync  byte = 0x09
)

// Magic header bytes for protocol validation
var MagicHeader = [4]byte{'P', 'S', 'R', '1'} // PortSide Relay v1

type HandshakePayload struct {
	MachineId     string `json:"machineId"`
	Email         string `json:"email"`
	Handle        string `json:"handle"`
	SessionTicket string `json:"sessionTicket"`
	Version       string `json:"version"`
}

type ProfileSyncPayload struct {
	Handle      string `json:"handle"`
	HTML        string `json:"html,omitempty"`
	ProfileJSON string `json:"profileJson,omitempty"`
	Timestamp   int64  `json:"timestamp"`
}

type HandshakeAckPayload struct {
	Success        bool   `json:"success"`
	AssignedDomain string `json:"assignedDomain"`
	Error          string `json:"error,omitempty"`
}

type StreamOpenPayload struct {
	StreamId uint32            `json:"streamId"`
	Method   string            `json:"method"`
	URL      string            `json:"url"`
	Headers  map[string]string `json:"headers"`
}

// WriteFrame sends a frame over an io.Writer:
// [4 bytes Magic][1 byte Type][4 bytes StreamId][4 bytes Length][Payload]
func WriteFrame(w io.Writer, frameType byte, streamId uint32, payload []byte) error {
	var hdr [13]byte
	copy(hdr[0:4], MagicHeader[:])
	hdr[4] = frameType
	binary.BigEndian.PutUint32(hdr[5:9], streamId)
	binary.BigEndian.PutUint32(hdr[9:13], uint32(len(payload)))

	if _, err := w.Write(hdr[:]); err != nil {
		return err
	}
	if len(payload) > 0 {
		if _, err := w.Write(payload); err != nil {
			return err
		}
	}
	return nil
}

// ReadFrame reads the next frame from an io.Reader
func ReadFrame(r io.Reader) (frameType byte, streamId uint32, payload []byte, err error) {
	var hdr [13]byte
	if _, err = io.ReadFull(r, hdr[:]); err != nil {
		return 0, 0, nil, err
	}

	if hdr[0] != MagicHeader[0] || hdr[1] != MagicHeader[1] || hdr[2] != MagicHeader[2] || hdr[3] != MagicHeader[3] {
		return 0, 0, nil, errors.New("invalid protocol magic header")
	}

	frameType = hdr[4]
	streamId = binary.BigEndian.Uint32(hdr[5:9])
	length := binary.BigEndian.Uint32(hdr[9:13])

	// Enforce 16MB maximum frame size to avoid OOM from corrupt streams
	if length > 16*1024*1024 {
		return 0, 0, nil, errors.New("frame length exceeds 16MB limit")
	}

	if length > 0 {
		payload = make([]byte, length)
		if _, err = io.ReadFull(r, payload); err != nil {
			return 0, 0, nil, err
		}
	}

	return frameType, streamId, payload, nil
}

func EncodeJSON(v interface{}) ([]byte, error) {
	return json.Marshal(v)
}

func DecodeJSON(data []byte, v interface{}) error {
	return json.Unmarshal(data, v)
}

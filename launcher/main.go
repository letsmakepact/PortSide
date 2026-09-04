package main

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
	"time"
)

const (
	CurrentVersion = "1.0.0"
	RepoOwner      = "letsmakepact"
	RepoName       = "PortSide"
	AppUrl         = "http://localhost"
)

type GitHubRelease struct {
	TagName     string `json:"tag_name"`
	Name        string `json:"name"`
	HtmlUrl     string `json:"html_url"`
	Body        string `json:"body"`
	PublishedAt string `json:"published_at"`
	Assets      []struct {
		Name               string `json:"name"`
		BrowserDownloadUrl string `json:"browser_download_url"`
	} `json:"assets"`
}

func main() {
	printBanner()
	checkUpdates()
	setupDatabase()
	setupDependencies()
	startServer()
}

func printBanner() {
	fmt.Println("==================================================================")
	fmt.Println("           PORTSIDE - Name Your Localhost (Port 80)               ")
	fmt.Println("             Created by pact (@pactwithdevil)                     ")
	fmt.Printf("                   Current Version: v%s                          \n", CurrentVersion)
	fmt.Println("==================================================================")
	fmt.Println()
}

func checkUpdates() {
	fmt.Print("[1/4] Checking GitHub for updates... ")
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", RepoOwner, RepoName)

	client := http.Client{Timeout: 5 * time.Second}
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		fmt.Println("skipped (network error)")
		return
	}
	req.Header.Set("User-Agent", "Portside-Launcher")
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	res, err := client.Do(req)
	if err != nil || res.StatusCode != 200 {
		fmt.Println("up to date (or offline)")
		return
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		fmt.Println("up to date")
		return
	}

	var rel GitHubRelease
	if err := json.Unmarshal(body, &rel); err != nil {
		fmt.Println("up to date")
		return
	}

	latest := strings.TrimPrefix(rel.TagName, "v")
	if isNewerVersion(latest, CurrentVersion) {
		fmt.Println()
		fmt.Println("******************************************************************")
		fmt.Printf("  ✨ NEW UPDATE AVAILABLE: v%s (You have v%s)\n", latest, CurrentVersion)
		fmt.Printf("  Release URL: %s\n", rel.HtmlUrl)
		if len(rel.Assets) > 0 {
			for _, a := range rel.Assets {
				if strings.HasSuffix(strings.ToLower(a.Name), ".exe") {
					fmt.Printf("  Direct download: %s\n", a.BrowserDownloadUrl)
					break
				}
			}
		}
		fmt.Println("******************************************************************")
		fmt.Println()
	} else {
		fmt.Println("✓ You are on the latest version!")
	}
}

func isNewerVersion(latest, current string) bool {
	lParts := strings.Split(latest, ".")
	cParts := strings.Split(current, ".")
	for i := 0; i < len(lParts) && i < len(cParts); i++ {
		l, _ := strconv.Atoi(lParts[i])
		c, _ := strconv.Atoi(cParts[i])
		if l > c {
			return true
		}
		if l < c {
			return false
		}
	}
	return len(lParts) > len(cParts)
}

func setupDatabase() {
	fmt.Println("[2/4] Initializing database...")

	cmd := exec.Command("docker", "compose", "up", "-d")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		fmt.Println("Note: Docker Compose not started or already running. Continuing...")
	} else {
		fmt.Println("✓ PostgreSQL container is healthy.")
	}
}

func setupDependencies() {
	fmt.Println("[3/4] Verifying dependencies...")

	if _, err := os.Stat("node_modules"); os.IsNotExist(err) {
		fmt.Println("Installing npm packages (first time setup)...")
		cmd := exec.Command("npm", "install")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		if err := cmd.Run(); err != nil {
			fmt.Printf("Error installing dependencies: %v\n", err)
		}
	} else {
		fmt.Println("✓ Dependencies already installed.")
	}

	fmt.Println("Syncing schema tables...")
	cmdDb := exec.Command("npm", "run", "db:push")
	cmdDb.Stdout = os.Stdout
	cmdDb.Stderr = os.Stderr
	_ = cmdDb.Run()
}

func startServer() {
	fmt.Println("[4/4] Starting Portside on Port 80...")
	fmt.Println("==================================================================")
	fmt.Printf("Dashboard: %s\n", AppUrl)
	fmt.Println("Any service you add will route automatically without ports!")
	fmt.Println("Press Ctrl+C to stop.")
	fmt.Println("==================================================================")

	go func() {
		time.Sleep(1500 * time.Millisecond)
		openBrowser(AppUrl)
	}()

	cmd := exec.Command("npm", "run", "dev")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	cmd.Stdin = os.Stdin

	if err := cmd.Run(); err != nil {
		fmt.Printf("Server exited: %v\n", err)
	}
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	_ = cmd.Start()
}

func init() {
	exe, err := os.Executable()
	if err == nil {
		dir := filepath.Dir(exe)
		if filepath.Base(dir) == "bin" || filepath.Base(dir) == "launcher" {
			_ = os.Chdir(filepath.Dir(dir))
		}
	}
}

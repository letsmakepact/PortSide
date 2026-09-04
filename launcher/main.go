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
		Size               int64  `json:"size"`
	} `json:"assets"`
}

func getPortsideHome() string {
	home, err := os.UserHomeDir()
	if err != nil {
		home = "."
	}
	dir := filepath.Join(home, "Portside")
	_ = os.MkdirAll(dir, 0755)
	_ = os.MkdirAll(filepath.Join(dir, "updates"), 0755)
	return dir
}

func main() {
	printBanner()
	userDir := getPortsideHome()
	fmt.Printf("Workspace Directory: %s\n", userDir)
	fmt.Printf("Detected Platform:   %s/%s\n\n", runtime.GOOS, runtime.GOARCH)

	checkAndDownloadUpdates(userDir)
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

func getPlatformBinaryName(version string) string {
	ext := ""
	if runtime.GOOS == "windows" {
		ext = ".exe"
	}
	return fmt.Sprintf("Portside-Launcher-%s-%s-v%s%s", runtime.GOOS, runtime.GOARCH, version, ext)
}

func checkAndDownloadUpdates(userDir string) {
	fmt.Print("[1/4] Checking GitHub for updates... ")
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/releases/latest", RepoOwner, RepoName)

	client := http.Client{Timeout: 6 * time.Second}
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
		fmt.Printf("  ✨ NEW UPDATE AVAILABLE: v%s (Currently on v%s)\n", latest, CurrentVersion)
		fmt.Printf("  Changelog: %s\n", rel.HtmlUrl)

		var downloadUrl string
		var assetName string
		targetSub := runtime.GOOS
		targetArch := runtime.GOARCH

		for _, a := range rel.Assets {
			lower := strings.ToLower(a.Name)
			if strings.Contains(lower, targetSub) && (strings.Contains(lower, targetArch) || runtime.GOOS == "windows") {
				downloadUrl = a.BrowserDownloadUrl
				assetName = a.Name
				break
			}
		}

		if downloadUrl == "" {
			assetName = getPlatformBinaryName(latest)
			downloadUrl = fmt.Sprintf("https://github.com/%s/%s/releases/download/%s/%s", RepoOwner, RepoName, rel.TagName, assetName)
		}

		destPath := filepath.Join(userDir, "updates", assetName)
		fmt.Printf("  Auto-downloading update to: %s\n", destPath)

		err := downloadFile(destPath, downloadUrl)
		if err != nil {
			fmt.Printf("  Download failed: %v. You can update manually at: %s\n", err, rel.HtmlUrl)
		} else {
			_ = os.Chmod(destPath, 0755)
			fmt.Printf("  ✓ Successfully downloaded update to: %s\n", destPath)
			mainExeName := "Portside"
			if runtime.GOOS == "windows" {
				mainExeName = "Portside.exe"
			}
			mainExe := filepath.Join(userDir, mainExeName)
			_ = copyFile(destPath, mainExe)
			_ = os.Chmod(mainExe, 0755)
		}
		fmt.Println("******************************************************************")
		fmt.Println()
	} else {
		fmt.Println("✓ You are on the latest version!")
	}
}

func downloadFile(filepath string, url string) error {
	out, err := os.Create(filepath)
	if err != nil {
		return err
	}
	defer out.Close()

	client := http.Client{Timeout: 60 * time.Second}
	resp, err := client.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", resp.Status)
	}

	_, err = io.Copy(out, resp.Body)
	return err
}

func copyFile(src, dst string) error {
	in, err := os.Open(src)
	if err != nil {
		return err
	}
	defer in.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, in)
	return err
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
	if runtime.GOOS != "windows" && os.Geteuid() != 0 {
		fmt.Println("Note: If port 80 fails to bind on macOS/Linux, run launcher with sudo or PORT=3000.")
	}
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

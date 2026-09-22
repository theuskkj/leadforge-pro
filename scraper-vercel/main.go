package main

import (
	"bufio"
	"context"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

type SearchRequest struct {
	Country  string  `json:"country"`
	Location string  `json:"location"`
	Niche    string  `json:"niche"`
	Limit    int     `json:"limit"`
	MinRating float64 `json:"minRating,omitempty"`
}

type Entry struct {
	InputID      string   `json:"input_id"`
	Link         string   `json:"link"`
	CID          string   `json:"cid"`
	Title        string   `json:"title"`
	Category     string   `json:"category"`
	Address      string   `json:"address"`
	WebSite      string   `json:"web_site"`
	WebsiteAlt   string   `json:"website"`
	Phone        string   `json:"phone"`
	ReviewCount  int      `json:"review_count"`
	ReviewRating float64  `json:"review_rating"`
	Latitude     float64  `json:"latitude"`
	Longitude    float64  `json:"longitude"`
	DataID       string   `json:"data_id"`
	PlaceID      string   `json:"place_id"`
	Emails       []string `json:"emails"`
	CompleteAddress struct {
		City    string `json:"city"`
		State   string `json:"state"`
		Country string `json:"country"`
	} `json:"complete_address"`
}

type Result struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Niche         string   `json:"niche"`
	City          string   `json:"city"`
	Address       string   `json:"address"`
	Phone         string   `json:"phone,omitempty"`
	Website       string   `json:"website,omitempty"`
	Rating        float64  `json:"rating"`
	ReviewCount   int      `json:"reviewCount"`
	GoogleMapsURL string   `json:"googleMapsUrl,omitempty"`
	PlaceID       string   `json:"placeId,omitempty"`
	Lat           float64  `json:"lat,omitempty"`
	Lng           float64  `json:"lng,omitempty"`
	Emails        []string `json:"emails,omitempty"`
}

func jsonResponse(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func authorized(r *http.Request) bool {
	expected := strings.TrimSpace(os.Getenv("SCRAPER_SHARED_SECRET"))
	if expected == "" {
		return false
	}
	got := strings.TrimSpace(r.Header.Get("X-API-Key"))
	if len(got) != len(expected) {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(got), []byte(expected)) == 1
}

func clean(s string, max int) string {
	s = strings.TrimSpace(s)
	if len(s) > max {
		s = s[:max]
	}
	return s
}

func parseEntries(path string) ([]Entry, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var array []Entry
	if err := json.Unmarshal(data, &array); err == nil {
		return array, nil
	}

	var single Entry
	if err := json.Unmarshal(data, &single); err == nil && single.Title != "" {
		return []Entry{single}, nil
	}

	var out []Entry
	scanner := bufio.NewScanner(strings.NewReader(string(data)))
	buf := make([]byte, 64*1024)
	scanner.Buffer(buf, 8*1024*1024)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" {
			continue
		}
		var entry Entry
		if err := json.Unmarshal([]byte(line), &entry); err != nil {
			continue
		}
		if entry.Title != "" {
			out = append(out, entry)
		}
	}
	if err := scanner.Err(); err != nil {
		return nil, err
	}
	return out, nil
}

func search(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		jsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"error": "Método não permitido"})
		return
	}
	if !authorized(r) {
		jsonResponse(w, http.StatusUnauthorized, map[string]string{"error": "Não autorizado"})
		return
	}

	var req SearchRequest
	dec := json.NewDecoder(http.MaxBytesReader(w, r.Body, 32*1024))
	dec.DisallowUnknownFields()
	if err := dec.Decode(&req); err != nil {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "JSON inválido"})
		return
	}

	req.Country = clean(req.Country, 80)
	req.Location = clean(req.Location, 120)
	req.Niche = clean(req.Niche, 100)
	if req.Country == "" {
		req.Country = "Brasil"
	}
	if req.Location == "" || req.Niche == "" {
		jsonResponse(w, http.StatusBadRequest, map[string]string{"error": "Informe localização e nicho"})
		return
	}
	if req.Limit < 1 {
		req.Limit = 20
	}
	if req.Limit > 20 {
		req.Limit = 20
	}

	workDir, err := os.MkdirTemp("", "leadforge-scrape-*")
	if err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao preparar pesquisa"})
		return
	}
	defer os.RemoveAll(workDir)

	query := fmt.Sprintf("%s em %s, %s", req.Niche, req.Location, req.Country)
	inputPath := filepath.Join(workDir, "queries.txt")
	outputPath := filepath.Join(workDir, "results.json")

	if err := os.WriteFile(inputPath, []byte(query+"\n"), 0600); err != nil {
		jsonResponse(w, http.StatusInternalServerError, map[string]string{"error": "Falha ao preparar consulta"})
		return
	}

	timeoutSeconds := 165
	if raw := os.Getenv("SCRAPER_TIMEOUT_SECONDS"); raw != "" {
		if n, err := strconv.Atoi(raw); err == nil && n >= 30 && n <= 240 {
			timeoutSeconds = n
		}
	}
	ctx, cancel := context.WithTimeout(r.Context(), time.Duration(timeoutSeconds)*time.Second)
	defer cancel()

	depth := "1"
	if req.Limit > 10 {
		depth = "2"
	}

	args := []string{
		"-input", inputPath,
		"-results", outputPath,
		"-json",
		"-depth", depth,
		"-c", "1",
		"-lang", "pt",
		"-exit-on-inactivity", "60s",
	}

	cmd := exec.CommandContext(ctx, "google-maps-scraper", args...)
	cmd.Env = append(os.Environ(), "DISABLE_TELEMETRY=1")
	logOutput, err := cmd.CombinedOutput()
	if ctx.Err() == context.DeadlineExceeded {
		jsonResponse(w, http.StatusGatewayTimeout, map[string]string{"error": "A busca demorou mais que o limite do servidor"})
		return
	}
	if err != nil {
		log.Printf("scraper failed: %v: %s", err, strings.TrimSpace(string(logOutput)))
		jsonResponse(w, http.StatusBadGateway, map[string]string{"error": "O scraper não conseguiu concluir a pesquisa"})
		return
	}

	entries, err := parseEntries(outputPath)
	if err != nil && !errors.Is(err, os.ErrNotExist) {
		log.Printf("parse failed: %v", err)
	}
	if len(entries) == 0 {
		jsonResponse(w, http.StatusOK, map[string]any{"source": "scraper", "results": []Result{}})
		return
	}

	results := make([]Result, 0, req.Limit)
	for _, e := range entries {
		if e.Title == "" {
			continue
		}
		if req.MinRating > 0 && e.ReviewRating < req.MinRating {
			continue
		}
		website := strings.TrimSpace(e.WebSite)
		if website == "" {
			website = strings.TrimSpace(e.WebsiteAlt)
		}
		id := firstNonEmpty(e.PlaceID, e.DataID, e.CID, e.InputID)
		city := firstNonEmpty(e.CompleteAddress.City, req.Location)
		results = append(results, Result{
			ID:            id,
			Name:          e.Title,
			Niche:         firstNonEmpty(e.Category, req.Niche),
			City:          city,
			Address:       e.Address,
			Phone:         e.Phone,
			Website:       website,
			Rating:        e.ReviewRating,
			ReviewCount:   e.ReviewCount,
			GoogleMapsURL: e.Link,
			PlaceID:       e.PlaceID,
			Lat:           e.Latitude,
			Lng:           e.Longitude,
			Emails:        e.Emails,
		})
		if len(results) >= req.Limit {
			break
		}
	}

	jsonResponse(w, http.StatusOK, map[string]any{
		"source":  "scraper",
		"query":   query,
		"results": results,
	})
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

func health(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		jsonResponse(w, http.StatusMethodNotAllowed, map[string]string{"error": "Método não permitido"})
		return
	}
	_, err := exec.LookPath("google-maps-scraper")
	jsonResponse(w, http.StatusOK, map[string]any{
		"ok":         err == nil,
		"configured": strings.TrimSpace(os.Getenv("SCRAPER_SHARED_SECRET")) != "",
		"provider":   "gosom/google-maps-scraper",
	})
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", health)
	mux.HandleFunc("/health", health)
	mux.HandleFunc("/scrape", search)

	port := strings.TrimSpace(os.Getenv("PORT"))
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	log.Printf("LeadForge scraper service listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}

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
	Country   string  `json:"country"`
	Location  string  `json:"location"`
	Niche     string  `json:"niche"`
	Limit     int     `json:"limit"`
	MinRating float64 `json:"minRating,omitempty"`
}

type SearchVariant struct {
	ID    string
	Query string
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


func buildSearchVariants(req SearchRequest) []SearchVariant {
	base := fmt.Sprintf("%s em %s, %s", req.Niche, req.Location, req.Country)

	var labels []struct {
		id     string
		prefix string
	}

	country := strings.ToLower(strings.TrimSpace(req.Country))
	if country == "brasil" || country == "brazil" || country == "" {
		labels = []struct {
			id     string
			prefix string
		}{
			{id: "base", prefix: ""},
			{id: "centro", prefix: "centro de "},
			{id: "norte", prefix: "zona norte de "},
			{id: "sul", prefix: "zona sul de "},
			{id: "leste", prefix: "zona leste de "},
			{id: "oeste", prefix: "zona oeste de "},
		}
	} else {
		labels = []struct {
			id     string
			prefix string
		}{
			{id: "base", prefix: ""},
			{id: "center", prefix: "city center of "},
			{id: "north", prefix: "north of "},
			{id: "south", prefix: "south of "},
			{id: "east", prefix: "east of "},
			{id: "west", prefix: "west of "},
		}
	}

	count := 2
	if req.Limit > 5 {
		count = 4
	}
	if req.Limit > 10 {
		count = len(labels)
	}

	variants := make([]SearchVariant, 0, count)
	for i := 0; i < count; i++ {
		item := labels[i]
		query := base
		if item.prefix != "" {
			query = fmt.Sprintf("%s em %s%s, %s", req.Niche, item.prefix, req.Location, req.Country)
		}
		variants = append(variants, SearchVariant{ID: item.id, Query: query})
	}

	return variants
}

func entryIdentity(e Entry) string {
	if value := firstNonEmpty(e.PlaceID, e.DataID, e.CID); value != "" {
		return strings.ToLower(value)
	}

	return strings.ToLower(strings.TrimSpace(e.Title) + "::" + strings.TrimSpace(e.Address))
}

func distributeEntries(entries []Entry, variants []SearchVariant, limit int, minRating float64) []Entry {
	buckets := make(map[string][]Entry, len(variants))
	fallback := make([]Entry, 0)
	seen := make(map[string]struct{}, len(entries))

	for _, entry := range entries {
		if entry.Title == "" {
			continue
		}
		if minRating > 0 && entry.ReviewRating < minRating {
			continue
		}

		key := entryIdentity(entry)
		if key == "" {
			continue
		}
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}

		if entry.InputID != "" {
			buckets[entry.InputID] = append(buckets[entry.InputID], entry)
		} else {
			fallback = append(fallback, entry)
		}
	}

	selected := make([]Entry, 0, limit)
	positions := make(map[string]int, len(variants))

	for len(selected) < limit {
		added := false

		for _, variant := range variants {
			bucket := buckets[variant.ID]
			position := positions[variant.ID]
			if position >= len(bucket) {
				continue
			}

			selected = append(selected, bucket[position])
			positions[variant.ID] = position + 1
			added = true

			if len(selected) >= limit {
				break
			}
		}

		if !added {
			break
		}
	}

	for _, entry := range fallback {
		if len(selected) >= limit {
			break
		}
		selected = append(selected, entry)
	}

	return selected
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

	variants := buildSearchVariants(req)
	inputPath := filepath.Join(workDir, "queries.txt")
	outputPath := filepath.Join(workDir, "results.json")

	queryLines := make([]string, 0, len(variants))
	for _, variant := range variants {
		queryLines = append(queryLines, fmt.Sprintf("%s #!# %s", variant.Query, variant.ID))
	}

	if err := os.WriteFile(inputPath, []byte(strings.Join(queryLines, "\n")+"\n"), 0600); err != nil {
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

	args := []string{
		"-input", inputPath,
		"-results", outputPath,
		"-json",
		"-depth", "1",
		"-c", "2",
		"-browser-pool-size", "1",
		"-pages-per-browser", "2",
		"-lang", "pt",
		"-exit-on-inactivity", "30s",
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

	selectedEntries := distributeEntries(entries, variants, req.Limit, req.MinRating)
	results := make([]Result, 0, len(selectedEntries))

	for _, e := range selectedEntries {
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
	}

	queryNames := make([]string, 0, len(variants))
	for _, variant := range variants {
		queryNames = append(queryNames, variant.Query)
	}

	jsonResponse(w, http.StatusOK, map[string]any{
		"source":        "scraper",
		"mode":          "wide",
		"queries":       queryNames,
		"regionsQueried": len(variants),
		"uniqueFound":   len(entries),
		"results":       results,
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

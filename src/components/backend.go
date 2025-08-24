package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

// Struktur untuk request ke Gemini API
type GeminiRequest struct {
	Contents []Content `json:"contents"`
}

type Content struct {
	Parts []Part `json:"parts"`
}

type Part struct {
	Text string `json:"text"`
}

// Struktur untuk response dari Gemini API
type GeminiResponse struct {
	Candidates []Candidate `json:"candidates"`
}

type Candidate struct {
	Content ContentResponse `json:"content"`
}

type ContentResponse struct {
	Parts []PartResponse `json:"parts"`
}

type PartResponse struct {
	Text string `json:"text"`
}

// Struktur untuk request dari frontend
type ChatRequest struct {
	Message string `json:"message"`
}

// Struktur untuk response ke frontend
type ChatResponse struct {
	Reply string `json:"reply"`
}

const GEMINI_API_KEY = "AIzaSyBCpVFAFS6se4u0vvnBLHO7zB1hvAaGrqg" // Ganti dengan API key Gemini yang sebenarnya

func main() {
	// Serve static files (HTML, CSS)
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "frontend.html")
			return
		}
		if r.URL.Path == "/frontend.css" {
			w.Header().Set("Content-Type", "text/css")
			http.ServeFile(w, r, "frontend.css")
			return
		}
		http.NotFound(w, r)
	})

	// Handle chat API with CORS
	http.HandleFunc("/chat", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			return
		}

		handleChat(w, r)
	})

	fmt.Println("Server berjalan di http://localhost:8080")
	fmt.Println("Buka browser dan kunjungi: http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}

func handleChat(w http.ResponseWriter, r *http.Request) {
	log.Printf("Received request: %s %s", r.Method, r.URL.Path)
	
	if r.Method != "POST" {
		http.Error(w, "Method tidak diizinkan", http.StatusMethodNotAllowed)
		return
	}

	var req ChatRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		log.Printf("Error parsing JSON: %v", err)
		http.Error(w, "Format JSON tidak valid", http.StatusBadRequest)
		return
	}
	
	log.Printf("User message: %s", req.Message)

	// Cek apakah pertanyaan terkait dengan sampah/waste
	if !isWasteRelated(req.Message) {
		log.Printf("Non-waste related question, rejecting")
		response := ChatResponse{
			Reply: "Halo! 😊 Saya adalah Bot Sampah yang khusus membantu masalah pengelolaan sampah nih! Saya hanya bisa menjawab pertanyaan tentang:\n\n🗂️ Pengelolaan sampah\n♻️ Daur ulang\n🌱 Kompos dan sampah organik\n🏛️ Bank sampah\n🌍 Masalah lingkungan\n\nYuk, tanya sesuatu tentang sampah! Saya siap bantu! 🎉",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Buat prompt untuk Gemini
	prompt := fmt.Sprintf(`Kamu adalah asisten AI yang ceria dan ramah, ahli dalam pengelolaan sampah dan limbah. Jawab pertanyaan berikut dalam bahasa Indonesia dengan gaya yang hangat dan antusias.

PENTING:
- Berikan jawaban yang ringkas dan mudah dipahami (maksimal 3-4 paragraf)
- Gunakan tone yang ceria dan positif
- Sertakan emoji yang relevan untuk membuat jawaban lebih menarik
- Fokus pada solusi praktis dan tips berguna
- Jika ada list/poin, batasi maksimal 4-5 poin saja

Pertanyaan: %s

Berikan jawaban yang informatif tapi singkat, praktis, dan dengan semangat!`, req.Message)

	// Panggil Gemini API
	log.Printf("Calling Gemini API...")
	reply, err := callGeminiAPI(prompt)
	if err != nil {
		log.Printf("Gemini API error: %v", err)
		// Return a fallback response instead of an error
		response := ChatResponse{
			Reply: "Ups! 😅 Saya lagi ada gangguan koneksi nih. Tapi tenang, ini info berguna tentang sampah:\n\n🌿 **Sampah Organik**: Sisa makanan, daun, kulit buah yang bisa jadi kompos\n♻️ **Sampah Anorganik**: Plastik, logam, kaca yang perlu didaur ulang\n\n✨ **Tips 3R**: Reduce (kurangi), Reuse (pakai lagi), Recycle (daur ulang)!\n\nCoba tanya lagi ya, semoga koneksinya udah lancar! 🚀",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	log.Printf("Gemini API response received")
	response := ChatResponse{
		Reply: reply,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func isWasteRelated(message string) bool {
	wasteKeywords := []string{
		"sampah", "limbah", "daur ulang", "recycle", "kompos", "organik", "anorganik",
		"plastik", "kertas", "botol", "kaleng", "kardus", "tempat sampah", "tong sampah",
		"pengelolaan", "pengolahan", "pemilahan", "reduce", "reuse", "3r", "5r",
		"lingkungan", "pencemaran", "polusi", "tpa", "tempat pembuangan", "bank sampah",
		"waste", "garbage", "trash", "landfill", "biodegradable", "non-biodegradable",
		"eco", "ramah lingkungan", "green", "hijau", "sustainability", "berkelanjutan",
	}

	messageLower := strings.ToLower(message)
	for _, keyword := range wasteKeywords {
		if strings.Contains(messageLower, keyword) {
			return true
		}
	}
	return false
}

func callGeminiAPI(prompt string) (string, error) {
	// Updated URL to use gemini-2.0-flash with proper format
	url := "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

	requestData := GeminiRequest{
		Contents: []Content{
			{
				Parts: []Part{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(requestData)
	if err != nil {
		log.Printf("Error marshaling JSON: %v", err)
		return "", err
	}

	// Create HTTP request with proper headers
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Printf("Error creating HTTP request: %v", err)
		return "", err
	}

	// Set proper headers as shown in the example
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-goog-api-key", GEMINI_API_KEY)

	log.Printf("Making request to Gemini API...")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("HTTP request error: %v", err)
		return "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading response body: %v", err)
		return "", err
	}

	log.Printf("API Response Status: %d", resp.StatusCode)
	log.Printf("API Response Body: %s", string(body))

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("API error (status %d): %s", resp.StatusCode, string(body))
	}

	var geminiResp GeminiResponse
	err = json.Unmarshal(body, &geminiResp)
	if err != nil {
		log.Printf("Error unmarshaling response: %v", err)
		return "", err
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		log.Printf("Empty response from Gemini API")
		return "Maaf, saya tidak dapat memberikan jawaban untuk pertanyaan tersebut.", nil
	}

	log.Printf("Successfully got response from Gemini API")
	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}
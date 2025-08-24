import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Minimize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

interface EcoBotChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const suggestionsChips = [
  "Bagaimana cara membuang baterai bekas?",
  "Apakah styrofoam bisa didaur ulang?",
  "Buatkan ide kompos sederhana"
];

// Gemini API configuration
const GEMINI_API_KEY = "AIzaSyBCpVFAFS6se4u0vvnBLHO7zB1hvAaGrqg";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// Types for Gemini API
interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

// Check if message is waste-related
const isWasteRelated = (message: string): boolean => {
  const wasteKeywords = [
    "sampah", "limbah", "daur ulang", "recycle", "kompos", "organik", "anorganik",
    "plastik", "kertas", "botol", "kaleng", "kardus", "tempat sampah", "tong sampah",
    "pengelolaan", "pengolahan", "pemilahan", "reduce", "reuse", "3r", "5r",
    "lingkungan", "pencemaran", "polusi", "tpa", "tempat pembuangan", "bank sampah",
    "waste", "garbage", "trash", "landfill", "biodegradable", "non-biodegradable",
    "eco", "ramah lingkungan", "green", "hijau", "sustainability", "berkelanjutan",
    "baterai", "styrofoam", "cat", "minyak", "elektronik"
  ];

  const messageLower = message.toLowerCase();
  return wasteKeywords.some(keyword => messageLower.includes(keyword));
};

// Call Gemini API
const callGeminiAPI = async (prompt: string): Promise<string> => {
  try {
    const requestData: GeminiRequest = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ]
    };

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      throw new Error(`API error (status ${response.status})`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

export const EcoBotChat: React.FC<EcoBotChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat opens for the first time
      const welcomeMessage: Message = {
        id: '1',
        text: 'Halo! Saya EcoBot, asisten pintarmu. Apa yang ingin kamu ketahui tentang pengelolaan sampah hari ini?',
        isBot: true,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Check if the question is waste-related
    if (!isWasteRelated(userMessage)) {
      return "Halo! 😊 Saya adalah Bot Sampah yang khusus membantu masalah pengelolaan sampah nih! Saya hanya bisa menjawab pertanyaan tentang:\n\n🗂️ Pengelolaan sampah\n♻️ Daur ulang\n🌱 Kompos dan sampah organik\n🏛️ Bank sampah\n🌍 Masalah lingkungan\n\nYuk, tanya sesuatu tentang sampah! Saya siap bantu! 🎉";
    }

    // Create prompt for Gemini
    const prompt = `Kamu adalah asisten AI yang ceria dan ramah, ahli dalam pengelolaan sampah dan limbah. Jawab pertanyaan berikut dalam bahasa Indonesia dengan gaya yang hangat dan antusias.

PENTING:
- Berikan jawaban yang ringkas dan mudah dipahami (maksimal 3-4 paragraf)
- Gunakan tone yang ceria dan positif
- Sertakan emoji yang relevan untuk membuat jawaban lebih menarik
- Fokus pada solusi praktis dan tips berguna
- Jika ada list/poin, batasi maksimal 4-5 poin saja

Pertanyaan: ${userMessage}

Berikan jawaban yang informatif tapi singkat, praktis, dan dengan semangat!`;

    try {
      return await callGeminiAPI(prompt);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      // Return fallback response
      return "Ups! 😅 Saya lagi ada gangguan koneksi nih. Tapi tenang, ini info berguna tentang sampah:\n\n🌿 **Sampah Organik**: Sisa makanan, daun, kulit buah yang bisa jadi kompos\n♻️ **Sampah Anorganik**: Plastik, logam, kaca yang perlu didaur ulang\n\n✨ **Tips 3R**: Reduce (kurangi), Reuse (pakai lagi), Recycle (daur ulang)!\n\nCoba tanya lagi ya, semoga koneksinya udah lancar! 🚀";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    const currentInput = inputValue;
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call Gemini API
      const botResponseText = await generateResponse(currentInput);
      
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponseText,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Maaf, terjadi kesalahan. Silakan coba lagi nanti! 😅",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto h-[600px] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b border-border bg-primary/5">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <span>EcoBot</span>
            <div className="ml-auto flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <Minimize2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                {message.isBot && (
                  <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.isBot
                      ? 'bg-primary/10 text-foreground'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <div className="text-sm whitespace-pre-line leading-relaxed">
                    {message.text}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      message.isBot ? 'text-muted-foreground' : 'text-primary-foreground/70'
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>

                {!message.isBot && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-primary/10 rounded-2xl px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestion chips - only show if it's the first message */}
            {messages.length === 1 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground text-center">
                  Atau coba pertanyaan ini:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestionsChips.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs h-auto py-2 px-3 rounded-full"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Tanyakan sesuatu tentang sampah..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!inputValue.trim() || isTyping}
              className="px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
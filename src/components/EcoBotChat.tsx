import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User, Minimize2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

export const EcoBotChat: React.FC<EcoBotChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
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
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();
    // Ambil kata-kata kunci yang relevan dari input pengguna
    const keywords = lowerMessage.split(' ').filter(word => word.length > 3);

    if (keywords.length === 0) {
        return "Maaf, saya tidak mengerti pertanyaan Anda. Coba gunakan kata yang lebih spesifik.";
    }

    // -- PERUBAHAN UTAMA DI SINI --
    // Buat filter OR untuk setiap kata kunci. Ini akan mencari baris yang cocok dengan SALAH SATU kata kunci.
    const orFilter = keywords.map(key => `keywords.cs.{${key}}`).join(',');

    const { data, error } = await supabase
      .from('knowledge_base')
      .select('answer')
      .or(orFilter)
      .limit(1); // Ambil jawaban pertama yang paling relevan

    if (error || !data || data.length === 0) {
      console.error("Error fetching response:", error);
      return "Maaf, saya belum memiliki informasi lengkap tentang itu. Coba tanyakan hal lain tentang pemilahan sampah.";
    }

    return data[0].answer;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Menunggu 1 detik untuk simulasi "mengetik"
    await new Promise(resolve => setTimeout(resolve, 1000));

    const botResponseText = await generateResponse(currentInput);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      isBot: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Langsung kirim pesan saat saran diklik
    // Supaya lebih interaktif, kita set input dan panggil handleSendMessage
    // Kita perlu sedikit trik karena state update bersifat async
    const tempInput = suggestion;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: tempInput,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue(''); // Kosongkan input field
    setIsTyping(true);

    // Gunakan IIFE (Immediately Invoked Function Expression) async
    (async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const botResponseText = await generateResponse(tempInput);
        const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponseText,
            isBot: true,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
    })();
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
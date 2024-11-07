"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Mic, MicOff, Send } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/avatar";
import ThemeButton from "@/components/theme-button";

type Message = {
  id: number;
  text: string;
  translated: string;
  fromLang: string;
  toLang: string;
  isUser: boolean;
};

export default function RoomScreen() {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("es");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now(),
        text: inputText,
        translated: "Hola, ¿cómo estás hoy?", // Simulated translation
        fromLang,
        toLang,
        isUser: true,
      };
      setMessages([...messages, newMessage]);
      setInputText("");

      // Simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: "Estoy bien, gracias. ¿Y tú?",
          translated: "I'm fine, thank you. And you?",
          fromLang: toLang,
          toLang: fromLang,
          isUser: false,
        };
        setMessages((prev) => [...prev, aiMessage]);
      }, 1000);
    }
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        isDarkMode ? "dark" : ""
      } bg-gray-100 dark:bg-gray-900`}
    >
      <header className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">TranslateAI</h1>
          <div className="flex space-x-2">
            <Select value={fromLang} onValueChange={setFromLang}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="From Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
            <Select value={toLang} onValueChange={setToLang}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="To Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
            <ThemeButton
              isDarkMode={isDarkMode}
              setIsDarkMode={setIsDarkMode}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden container mx-auto p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!message.isUser && (
                <Avatar className="mr-2">
                  <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt="AI"
                  />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`max-w-[80%] ${
                  message.isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm opacity-80 mb-1">
                    {message.fromLang} → {message.toLang}
                  </p>
                  <p className="mb-2">{message.text}</p>
                  <p className="text-sm italic">{message.translated}</p>
                </CardContent>
              </Card>
              {message.isUser && (
                <Avatar className="ml-2">
                  <AvatarImage
                    src="/placeholder.svg?height=40&width=40"
                    alt="User"
                  />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isListening ? "destructive" : "secondary"}
                  size="icon"
                  onClick={toggleListening}
                  className="relative overflow-hidden"
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4 bg-red-500" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isListening ? "Stop listening" : "Start listening"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Speak or type your message"
            className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
          {inputText && (
            <Button onClick={handleSend}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

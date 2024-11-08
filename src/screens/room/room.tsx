"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Globe, Mic, MicOff, Send } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import { Avatar, AvatarFallback } from "@/components/avatar";
import ThemeButton from "@/components/theme-button";
import { Message, Participant } from "@/types";
import { useDarkMode } from "@/hooks/useDarkMode";
import { useRoom } from "@/hooks/useRoom";
import { transcriptAction, translateAction } from "@/actions/openai";
import { useMicVAD, utils } from "@ricky0123/vad-react";
import useApp from "@/hooks/useApp";
import { languages } from "@/config/languages";
interface RoomScreenProps {
  roomId: string;
}

export default function RoomScreen({ roomId }: RoomScreenProps) {
  // State
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [participants, setParticipants] = useState<Record<string, Participant>>(
    {}
  );

  // Hooks
  const { room, username, language: myLanguage } = useApp();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    getMessages,
    getParticipants,
    sendMessage,
    updateMessage,
    onParticipantAdd,
    onMessageAdd,
    onMessageChange,
    cleanupListeners,
  } = useRoom();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Memoized values
  const messagesArray = useMemo(() => Object.values(messages), [messages]);
  const participantsArray = useMemo(
    () => Object.values(participants),
    [participants]
  );
  const roomLanguagesCodes = useMemo(
    () => participantsArray.map((participant) => participant.lang),
    [participantsArray]
  );

  // Voice recognition setup
  const vad = useMicVAD({
    startOnLoad: false,
    workletURL: "/_next/static/chunks/vad.worklet.bundle.min.js",
    modelURL: "/_next/static/chunks/silero_vad.onnx",
    positiveSpeechThreshold: 0.8,
    onSpeechEnd: async (audio) => {
      const wavBuffer = utils.encodeWAV(audio);
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      await handleTranscription(blob);
    },
  });

  // Effects
  useEffect(() => {
    if (!roomId) return;

    const setupRoom = () => {
      getMessages(roomId, (messages) => setMessages(messages));
      getParticipants(roomId, (participants) => setParticipants(participants));

      onMessageAdd(roomId, (message) =>
        setMessages((prev) => ({ ...prev, [message.id]: message }))
      );

      onParticipantAdd(roomId, (participant) =>
        setParticipants((prev) => ({ ...prev, [participant.id]: participant }))
      );

      onMessageChange(roomId, (message) =>
        setMessages((prev) => ({ ...prev, [message.id]: message }))
      );
    };

    setupRoom();
    return cleanupListeners;
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handlers
  const handleSubmit = async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: "",
      originalText: text,
      translations: {},
      sourceLanguage: myLanguage,
      senderId: username,
    };

    const messageId = await sendMessage(roomId, newMessage);
    const translations = await translateAction(
      text,
      myLanguage,
      roomLanguagesCodes
    );

    updateMessage(roomId, messageId, {
      ...newMessage,
      id: messageId,
      translations,
    });
  };

  const handleTranscription = async (blob: Blob) => {
    const formData = new FormData();
    formData.append("blob", blob, "audio.wav");
    formData.append("language", myLanguage);

    const transcription = await transcriptAction(formData);
    if (transcription) await handleSubmit(transcription);
  };

  const handleTextInput = () => {
    if (inputText.trim()) {
      handleSubmit(inputText);
      setInputText("");
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
          <h1 className="text-2xl font-bold text-primary">
            TranslateAI - {room}
          </h1>
          <div className="flex gap-x-2 justify-center items-center">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground`}
            >
              <Globe className="w-4 h-4 mr-1" />
              {languages[myLanguage as keyof typeof languages]}
            </span>
            <ThemeButton
              isDarkMode={isDarkMode}
              setIsDarkMode={toggleDarkMode}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden container mx-auto p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messagesArray.map((message: Message) => {
            const isCurrentUser = message.senderId === username;
            const avatarName = message.senderId.charAt(0).toUpperCase();

            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%]  flex gap-x-2 ${
                    isCurrentUser ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <Card
                    className={`flex-1 ${
                      isCurrentUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    <CardContent className="p-3">
                      {!isCurrentUser && (
                        <p className="text-sm opacity-80 mb-1">
                          {message.sourceLanguage} → {myLanguage}
                        </p>
                      )}
                      <p className="mb-2">{message.originalText}</p>
                      {!isCurrentUser && (
                        <p className="text-sm italic">
                          {message.translations?.[myLanguage] ||
                            "Translating...."}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                  <Avatar>
                    <AvatarFallback>{avatarName}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={vad.listening ? "destructive" : "secondary"}
                  size="icon"
                  onClick={() => vad.toggle()}
                  className="relative overflow-hidden"
                >
                  {vad.listening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{vad.listening ? "Stop listening" : "Start listening"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyUp={(e) => e.key === "Enter" && handleTextInput()}
            placeholder="Speak or type your message"
            className="flex-1 p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />

          {inputText && (
            <Button onClick={() => handleTextInput()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}

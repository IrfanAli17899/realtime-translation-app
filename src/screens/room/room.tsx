"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Mic, MicOff, Send } from "lucide-react";
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
import { translateAction } from "@/actions/openai";
import LangSelector from "@/components/lang-selector";
import { filterLanguages } from "@/libs/utils";

export interface RoomScreenProps {
  roomId: string;
}

export default function RoomScreen({ roomId }: RoomScreenProps) {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<Record<string, Message>>({});
  const [participants, setParticipants] = useState<Record<string, Participant>>(
    {}
  );
  const [myLanguage, setMyLanguage] = useState("en");

  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const {
    getMessages,
    getParticipants,
    sendMessage,
    updateMessage,
    onParticipantAdd,
    onMessageAdd,
    onMessageChange,
    cleanupListeners
  } = useRoom();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesArray = useMemo(() => Object.values(messages), [messages]);
  const participantsArray = useMemo(
    () => Object.values(participants),
    [participants]
  );

  const { roomLanguages, roomLanguagesCodes } = useMemo(() => {
    const userNames: Record<string, string> = {};

    const roomLanguagesCodes = participantsArray.map((participant) => {
      userNames[participant.id] = participant.name;
      return participant.lang;
    });

    const roomLanguages = filterLanguages(roomLanguagesCodes);

    return { roomLanguages, roomLanguagesCodes, userNames };
  }, [participantsArray]);

  useEffect(() => {
    if (roomId) {
      getMessages(roomId, (messages) => {
        console.log("Messages", messages);
        setMessages(messages);
      });
      onMessageAdd(roomId, (message) => {
        console.log("Message added", message);
        setMessages((prv) => ({ ...prv, [message.id]: message }));
      });
      getParticipants(roomId, (participants) =>
        setParticipants(participants)
      );
      onParticipantAdd(roomId, (participant) =>
        setParticipants((prv) => ({ ...prv, [participant.id]: participant }))
      );
      onMessageChange(roomId, (message) => {
        console.log("Message changed", message);
        setMessages((prv) => ({ ...prv, [message.id]: message }));
      });
      return () => {
        cleanupListeners();
      };
    }
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  const handleSend = async () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: "",
        originalText: inputText,
        translations: {},
        sourceLanguage: myLanguage,
        senderId: "U",
      };

      setInputText("");
      const messageId = await sendMessage(roomId, newMessage);
      newMessage.id = messageId;

      const translations = await translateAction(
        inputText,
        myLanguage,
        roomLanguagesCodes
      );
      console.log(translations);

      updateMessage(roomId, messageId, {
        ...newMessage,
        translations,
      });
    }
  };

  const isCurrentUser = (senderId: string) => senderId === "U";

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
            <LangSelector
              languages={roomLanguages}
              className="w-[140px]"
              value={myLanguage}
              onChange={setMyLanguage}
            />
            <ThemeButton
              isDarkMode={isDarkMode}
              setIsDarkMode={toggleDarkMode}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden container mx-auto p-4 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messagesArray.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                isCurrentUser(message.senderId)
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {!isCurrentUser(message.senderId) && (
                <Avatar className="mr-2">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <Card
                className={`max-w-[80%] ${
                  isCurrentUser(message.senderId)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                <CardContent className="p-3">
                  <p className="text-sm opacity-80 mb-1">
                    {message.sourceLanguage} → {myLanguage}
                  </p>
                  <p className="mb-2">{message.originalText}</p>
                  <p className="text-sm italic">
                    {message.translations?.[myLanguage] || "Translating...."}
                  </p>
                </CardContent>
              </Card>
              {isCurrentUser(message.senderId) && (
                <Avatar className="ml-2">
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
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
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

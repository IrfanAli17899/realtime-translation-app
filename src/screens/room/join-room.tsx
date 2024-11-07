"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";

import { Users } from "lucide-react";

import { Input } from "@/components/input";
import { Label } from "@/components/label";
import ThemeButton from "@/components/theme-button";

export default function VoiceTranslationChatWithRoom() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleJoinRoom = () => {
    if (userName.trim() && roomName.trim()) {
      
    }
  };

  return (
    <div className={`${isDarkMode ? "dark" : ""} flex flex-col  min-h-screen  bg-gray-100 dark:bg-gray-900`}>
      <div className=" p-5 self-end">
        <ThemeButton isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
      </div>
      <div
        className={`flex-1 flex items-center justify-center`}
      >
        <Card className="w-[350px]">
          <CardContent className="pt-6">
            <h1 className="text-2xl font-bold text-center mb-6">TranslateAI</h1>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Your Name</Label>
                <Input
                  id="username"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomname">Room Name</Label>
                <Input
                  id="roomname"
                  placeholder="Enter room name to join"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                />
              </div>
              <div>
                <Button className="w-full mt-5" onClick={handleJoinRoom}>
                  <Users className="mr-2 h-4 w-4" />
                  Join Room
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

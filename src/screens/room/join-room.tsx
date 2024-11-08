"use client";

import { useState } from "react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";

import { Users } from "lucide-react";

import { Input } from "@/components/input";
import { Label } from "@/components/label";
import ThemeButton from "@/components/theme-button";
import { useRoom } from "@/hooks/useRoom";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/useDarkMode";
import LangSelector from "@/components/lang-selector";
import { languages } from "@/config/languages";

export default function JoinRoomScreen() {
  const [userName, setUserName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [myLanguage, setMyLanguage] = useState("en");
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { createOrJoinRoom } = useRoom();
  const router = useRouter();

  const handleJoinRoom = async () => {
    try {
      if (userName.trim() && roomName.trim() && myLanguage.trim()) {
        await createOrJoinRoom(userName, myLanguage, roomName);
        router.push(`/room/${roomName}`);
      }
    } catch (error) {
      console.log("Error joining room", error);
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "dark" : ""
      } flex flex-col  min-h-screen  bg-gray-100 dark:bg-gray-900`}
    >
      <div className=" p-5 self-end">
        <ThemeButton isDarkMode={isDarkMode} setIsDarkMode={toggleDarkMode} />
      </div>
      <div className={`flex-1 flex items-center justify-center`}>
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
                <Label htmlFor="lang">Your Language</Label>
                <LangSelector languages={languages} value={myLanguage} onChange={setMyLanguage} />
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

"use client";

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
import useApp from "@/hooks/useApp";

export default function JoinRoomScreen() {
  const { username, language, room, setUsername, setLanguage, setRoom } =
    useApp();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { createOrJoinRoom } = useRoom();
  const router = useRouter();

  const handleJoinRoom = async () => {
    try {
      if (username.trim() && room.trim() && language.trim()) {
        const roomId = await createOrJoinRoom(username, language, room);
        router.push(`/room/${roomId}`);
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
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lang">Your Language</Label>
                <LangSelector
                  languages={languages}
                  value={language}
                  onChange={setLanguage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomname">Room Name</Label>
                <Input
                  id="roomname"
                  placeholder="Enter room name to join"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
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

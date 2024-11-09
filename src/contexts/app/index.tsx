"use client";

import React, { useState } from "react";

export interface AppContextProps {
  children: React.ReactNode;
}

export interface AppContextState {
  room: string;
  language: string;
  username: string;
  setRoom: (room: string) => void;
  setLanguage: (language: string) => void;
  setUsername: (username: string) => void;
}

export const AppContext = React.createContext<AppContextState | null>(null);

export default function AppProvider({ children }: AppContextProps) {
  const [room, setRoom] = useState("");
  const [language, setLanguage] = useState("en");
  const [username, setUsername] = useState("");

  return (
    <AppContext.Provider
      value={{ room, language, username, setRoom, setLanguage, setUsername }}
    >
      {children}
    </AppContext.Provider>
  );
}

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";
import React from "react";
import { Button } from "./button";
import { Moon, Sun } from "lucide-react";

export interface ThemeButtonProps {
    isDarkMode: boolean;
    setIsDarkMode: (isDarkMode: boolean) => void;
}

export default function ThemeButton({ isDarkMode, setIsDarkMode }: ThemeButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

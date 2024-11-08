import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface LangSelectorProps {
  languages: Record<string, string>;
  value: string;
  className?: string;
  onChange: (value: string) => void;
}

export default function LangSelector({
  value,
  onChange,
  languages,
  className = "",
}: LangSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder="From Language" />
      </SelectTrigger>
      <SelectContent>
        {Object.keys(languages).map((lang) => (
          <SelectItem
            key={lang}
            value={languages[lang as keyof typeof languages]}
          >
            {lang}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

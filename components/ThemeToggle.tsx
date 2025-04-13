"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, SunMoon } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const t = useTranslations("theme");

  // 当组件挂载后才渲染，避免水合不匹配
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9 px-0 bg-white/10 backdrop-blur-sm border-blue-300/30 hover:bg-blue-800/30 hover:border-blue-300/50">
          {theme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all text-yellow-300 dark:-rotate-90 dark:scale-0" />
          ) : theme === "dark" ? (
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all text-blue-300 dark:rotate-0 dark:scale-100" />
          ) : (
            <SunMoon className="h-[1.2rem] w-[1.2rem] text-blue-300" />
          )}
          <span className="sr-only">切换主题</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-md border-blue-300/30">
        <DropdownMenuItem onClick={() => setTheme("light")} className="text-blue-100 hover:bg-blue-800/30 hover:text-white">
          {t("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")} className="text-blue-100 hover:bg-blue-800/30 hover:text-white">
          {t("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")} className="text-blue-100 hover:bg-blue-800/30 hover:text-white">
          {t("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
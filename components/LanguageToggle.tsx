"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Languages as LanguagesIcon } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function LanguageToggle() {
  const t = useTranslations("language");
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const switchLocale = (locale: string) => {
    setIsOpen(false);
    router.push(`/${locale}${pathname.substring(3)}`);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="w-9 h-9 px-0 bg-white/10 backdrop-blur-sm border-blue-300/30 hover:bg-blue-800/30 hover:border-blue-300/50">
          <LanguagesIcon className="h-[1.2rem] w-[1.2rem] text-blue-300" />
          <span className="sr-only">切换语言</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white/10 backdrop-blur-md border-blue-300/30">
        <DropdownMenuItem onClick={() => switchLocale("zh")} className="text-blue-100 hover:bg-blue-800/30 hover:text-white">
          {t("zh")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchLocale("en")} className="text-blue-100 hover:bg-blue-800/30 hover:text-white">
          {t("en")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
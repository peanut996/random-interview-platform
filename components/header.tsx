"use client"

import { User, Settings, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useTranslation } from "@/lib/i18n"

interface HeaderProps {
  language: string
  setLanguage: (lang: string) => void
  onOpenSettings: () => void
  onOpenHistory: () => void
}

export default function Header({ language, setLanguage, onOpenSettings, onOpenHistory }: HeaderProps) {
  const { t } = useTranslation()

  const githubRepoUrl = 'https://github.com/peanut996/random-interview-platform'; // 替换为您的 GitHub 仓库 URL

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-[#f5f5f7]/80 dark:bg-[#1c1c1e]/80 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-5xl">
        <h1 className="text-2xl font-semibold">{t("app.title")}</h1>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLanguage("en")} className={language === "en" ? "bg-accent" : ""}>
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLanguage("zh")} className={language === "zh" ? "bg-accent" : ""}>
                中文
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" className="rounded-full" onClick={onOpenSettings}>
            <Settings className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full" onClick={onOpenHistory}>
            <User className="h-5 w-5" />
          </Button>

          <a href={githubRepoUrl} target="_blank" rel="noopener noreferrer" title={t("header.github")}>
            <svg 
              className="h-5 w-5 text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              viewBox="0 0 16 16" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
          </a>
        </div>
      </div>
    </header>
  )
}

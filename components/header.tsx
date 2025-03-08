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

          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}


"use client"

import { Search, Clock, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CreateTicketDialog } from "@/components/create-ticket-dialog"

export function Header() {
  const handleCreateTicket = (ticketData: {
    subject: string
    description: string
    category: string
    urgency: string
    attachments: File[]
  }) => {
    console.log("Novo chamado criado:", ticketData)
  }

  return (
    <header className="fixed top-0 left-0 md:left-16 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 z-40 transition-all duration-300">
      {/* Left side - Create Ticket Button */}
      <div className="flex items-center">
        <CreateTicketDialog onCreateTicket={handleCreateTicket} />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Clock className="w-5 h-5" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </Button>

        <Avatar className="w-8 h-8 cursor-pointer">
          <AvatarImage src="/abstract-geometric-shapes.png" alt="Jackson Felipe" />
          <AvatarFallback className="bg-primary text-primary-foreground text-sm">JF</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

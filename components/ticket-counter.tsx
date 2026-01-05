"use client"

import { ChevronDown, Ticket } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function TicketCounter() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-3">
        <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-primary" />
            </div>
            <span className="font-medium text-sm text-foreground">Meus chamados</span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  )
}

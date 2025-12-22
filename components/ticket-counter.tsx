"use client"

import { ChevronDown, Ticket } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function TicketCounter() {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5">
        <Button variant="ghost" className="w-full flex items-center justify-between p-0 h-auto hover:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Ticket className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground">Meus tickets</span>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </Button>
      </CardContent>
    </Card>
  )
}

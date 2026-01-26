"use client"

import { CircleDot, Clock, CheckCircle } from "lucide-react"

export function TicketCounter() {
  const stats = [
    {
      label: "Abertos",
      value: "12",
      icon: CircleDot,
      color: "text-orange-600",
    },
    {
      label: "Em andamento",
      value: "5",
      icon: Clock,
      color: "text-blue-600",
    },
    {
      label: "Resolvidos",
      value: "47",
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-muted-foreground font-medium">
                {stat.label}
              </span>
              <Icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stat.value}
            </div>
          </div>
        )
      })}
    </div>
  )
}

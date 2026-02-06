"use client"

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Badge } from "@/components/ui/badge"

interface Ticket {
  id: string
  number: string
  subject: string
  urgency: "low" | "medium" | "high" | "critical"
  requester: { name: string }
  assignedTo?: { name: string } | null
  createdAt: string
}

interface DroppableColumnProps {
  id: string
  title: string
  icon: any
  tickets: Ticket[]
  color: string
  children: React.ReactNode
}

export function DroppableColumn({ 
  id, 
  title, 
  icon: Icon, 
  tickets, 
  color, 
  children 
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div className="w-full h-full">
      {/* Header da coluna */}
      <div className={`${color} rounded-t-lg p-3 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-white" />
            <h3 className="font-semibold text-white text-sm">{title}</h3>
          </div>
          <Badge className="bg-white/20 text-white border-0 font-semibold text-xs">
            {tickets.length}
          </Badge>
        </div>
      </div>
      
      {/* Área de drop */}
      <div 
        ref={setNodeRef}
        className={`
          bg-gray-50 p-3 min-h-96 h-[calc(100vh-280px)]
          overflow-y-auto border-l border-r border-b border-gray-200 rounded-b-lg
          transition-all duration-200
          ${isOver ? 'bg-blue-50 border-blue-300 shadow-inner' : ''}
        `}
      >
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.length === 0 ? (
            <div className={`
              text-center py-8 transition-all duration-200
              ${isOver ? 'text-blue-600' : 'text-gray-400'}
            `}>
              <Icon className={`
                w-8 h-8 mx-auto mb-2 transition-all duration-200
                ${isOver ? 'opacity-60 scale-110' : 'opacity-30'}
              `} />
              <p className="text-sm font-medium">
                {isOver ? 'Solte o ticket aqui' : 'Nenhum chamado'}
              </p>
              <p className="text-xs mt-1">
                {isOver ? '' : 'Arraste tickets para cá'}
              </p>
            </div>
          ) : (
            children
          )}
        </SortableContext>
      </div>
    </div>
  )
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Clock, Search } from "lucide-react";

interface Ticket {
  id: string;
  number: string;
  subject: string;
  category: string;
  urgency: string;
  status: string;
  kanbanStatus: string;
  team: string | null;
  createdAt: string;
  requester: {
    id: string;
    name: string;
    image: string | null;
    setor: string | null;
  };
  assignedTo: {
    id: string;
    name: string;
    image: string | null;
  } | null;
}

interface KanbanBoardProps {
  tickets: Ticket[];
  onTicketMove: (ticketId: string, newStatus: string) => Promise<void>;
}

const KANBAN_COLUMNS = [
  { id: "inbox", label: "Caixa de Entrada", color: "bg-gray-100", borderColor: "border-gray-300" },
  { id: "in_progress", label: "Em Progresso", color: "bg-blue-100", borderColor: "border-blue-300" },
  { id: "review", label: "Revisão", color: "bg-yellow-100", borderColor: "border-yellow-300" },
  { id: "done", label: "Concluído", color: "bg-green-100", borderColor: "border-green-300" },
];

const URGENCY_CONFIG = {
  low: { color: "bg-gray-500", label: "Baixa" },
  medium: { color: "bg-blue-500", label: "Média" },
  high: { color: "bg-orange-500", label: "Alta" },
  critical: { color: "bg-red-500", label: "Crítica" },
};

export function KanbanBoard({ tickets, onTicketMove }: KanbanBoardProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.requester.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTeam = filterTeam === "all" || ticket.team === filterTeam;
    const matchesUrgency = filterUrgency === "all" || ticket.urgency === filterUrgency;

    return matchesSearch && matchesTeam && matchesUrgency;
  });

  const getTicketsByColumn = (columnId: string) => {
    return filteredTickets.filter((ticket) => ticket.kanbanStatus === columnId);
  };

  const teams = Array.from(new Set(tickets.map((t) => t.team).filter(Boolean)));

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Filtros */}
      <Card className="p-4 flex-shrink-0">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número, assunto ou solicitante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Todas as equipes</option>
              {teams.map((team) => (
                <option key={team} value={team || ""}>
                  {team}
                </option>
              ))}
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">Todas as urgências</option>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Board */}
      <div className="grid grid-cols-4 gap-4 flex-1 min-h-0">
        {KANBAN_COLUMNS.map((column) => {
          const columnTickets = getTicketsByColumn(column.id);
          return (
            <div
              key={column.id}
              className="flex flex-col min-h-0"
            >
              <div className={`${column.color} rounded-t-lg p-4 border-b-2 ${column.borderColor} flex-shrink-0`}>
                <h2 className="font-semibold text-lg flex items-center justify-between">
                  {column.label}
                  <Badge variant="secondary">{columnTickets.length}</Badge>
                </h2>
              </div>

              {/* Coluna com scrollbar customizada - v3 */}
              <div 
                className="kanban-column-scroll flex-1 min-h-0 bg-gray-50 rounded-b-lg p-2 space-y-2"
                style={{
                  overflowY: 'scroll'
                }}
              >
                {columnTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className={`p-4 cursor-pointer hover:shadow-lg transition-all bg-white border-l-4 ${
                      ticket.urgency === "critical"
                        ? "border-l-red-500"
                        : ticket.urgency === "high"
                        ? "border-l-orange-500"
                        : ticket.urgency === "medium"
                        ? "border-l-blue-500"
                        : "border-l-gray-300"
                    }`}
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-mono text-gray-500">
                        #{ticket.number}
                      </span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {getTimeAgo(ticket.createdAt)}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                      {ticket.subject}
                    </h3>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {ticket.category}
                      </Badge>
                      {ticket.team && (
                        <Badge variant="secondary" className="text-xs">
                          {ticket.team}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={ticket.requester.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {getInitials(ticket.requester.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 truncate max-w-[80px]">
                          {ticket.requester.name.split(" ")[0]}
                        </span>
                      </div>

                      {ticket.assignedTo && (
                        <Avatar className="w-6 h-6" title={ticket.assignedTo.name}>
                          <AvatarImage src={ticket.assignedTo.image || undefined} />
                          <AvatarFallback className="text-xs bg-blue-100">
                            {getInitials(ticket.assignedTo.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </Card>
                ))}

                {columnTickets.length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Nenhum ticket
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

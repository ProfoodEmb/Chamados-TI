"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Clock, Search, MessageSquare, Paperclip, MoreHorizontal, Plus } from "lucide-react";

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
    empresa: string | null;
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
  { 
    id: "inbox", 
    label: "Caixa de Entrada", 
    color: "bg-gray-50",
    headerColor: "text-gray-700",
    borderColor: "border-l-gray-400",
    bgColor: "bg-white"
  },
  { 
    id: "in_progress", 
    label: "Em Progresso", 
    color: "bg-blue-50",
    headerColor: "text-blue-700",
    borderColor: "border-l-blue-500",
    bgColor: "bg-blue-50/30"
  },
  { 
    id: "review", 
    label: "Revisão", 
    color: "bg-orange-50",
    headerColor: "text-orange-700",
    borderColor: "border-l-orange-500",
    bgColor: "bg-orange-50/30"
  },
  { 
    id: "done", 
    label: "Concluído", 
    color: "bg-green-50",
    headerColor: "text-green-700",
    borderColor: "border-l-green-500",
    bgColor: "bg-green-50/30"
  },
];

export function KanbanBoard({ tickets }: KanbanBoardProps) {
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

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical": return "text-red-600";
      case "high": return "text-orange-600";
      case "medium": return "text-blue-600";
      case "low": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case "critical": return "Crítica";
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return urgency;
    }
  };

  const getEmpresaColor = (empresa: string | null) => {
    switch (empresa?.toLowerCase()) {
      case "tuicial": return "bg-blue-600 text-white";
      case "profood": return "bg-red-600 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getEmpresaLabel = (empresa: string | null) => {
    if (!empresa) return "N/A";
    return empresa.charAt(0).toUpperCase() + empresa.slice(1).toLowerCase();
  };

  const teams = Array.from(new Set(tickets.map((t) => t.team).filter(Boolean)));

  return (
    <div className="space-y-6 h-full flex flex-col bg-gray-50">
      {/* Filtros */}
      <Card className="p-4 shrink-0 bg-white shadow-sm border-0">
        <div className="flex gap-4 items-center flex-wrap">
          <div className="flex-1 min-w-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por número, assunto ou solicitante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 text-sm border-gray-200"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={filterTeam}
              onChange={(e) => setFilterTeam(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <option value="all">Todas as equipes</option>
              <option value="infra">Infraestrutura</option>
              <option value="sistemas">Sistemas</option>
            </select>

            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors"
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
      <div className="grid grid-cols-4 gap-6 flex-1 min-h-0">
        {KANBAN_COLUMNS.map((column) => {
          const columnTickets = getTicketsByColumn(column.id);
          return (
            <div
              key={column.id}
              className="flex flex-col min-h-0 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              {/* Header da Coluna */}
              <div className="px-5 py-4 shrink-0 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className={`font-semibold text-base ${column.headerColor}`}>
                      {column.label}
                    </h2>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-0 font-semibold px-2.5 py-0.5">
                      {columnTickets.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div 
                className="kanban-column-scroll flex-1 min-h-0 p-2 space-y-1.5"
                style={{ overflowY: 'scroll' }}
              >
                {columnTickets.map((ticket) => (
                  <Card
                    key={ticket.id}
                    className="p-1.5 cursor-pointer hover:shadow-md transition-all bg-white border border-gray-200 rounded-lg group"
                    onClick={() => router.push(`/tickets/${ticket.id}`)}
                  >
                    {/* Header com número e empresa */}
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-base font-bold text-blue-600">
                        #{ticket.number}
                      </span>
                      {ticket.requester.empresa && (
                        <Badge className={`text-sm font-bold ${getEmpresaColor(ticket.requester.empresa)}`}>
                          {getEmpresaLabel(ticket.requester.empresa)}
                        </Badge>
                      )}
                    </div>

                    {/* Título */}
                    <h3 className="font-bold text-base mb-0.5 line-clamp-2 text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                      {ticket.subject}
                    </h3>

                    {/* Informações do solicitante */}
                    <div className="flex items-center gap-2 mb-1 pb-1 border-b border-gray-100">
                      <Avatar className="w-5 h-5 border border-white">
                        <AvatarImage src={ticket.requester.image || undefined} />
                        <AvatarFallback className="text-[9px] font-semibold bg-gray-200 text-gray-700">
                          {getInitials(ticket.requester.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {ticket.requester.name}
                        </p>
                        {ticket.requester.setor && (
                          <p className="text-xs font-medium text-gray-500 truncate">
                            {ticket.requester.setor}
                          </p>
                        )}
                      </div>
                      {ticket.assignedTo && (
                        <Avatar className="w-5 h-5 border border-blue-200" title={ticket.assignedTo.name}>
                          <AvatarImage src={ticket.assignedTo.image || undefined} />
                          <AvatarFallback className="text-[9px] font-semibold bg-blue-100 text-blue-700">
                            {getInitials(ticket.assignedTo.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Footer com badges e info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`text-sm border-0 ${getUrgencyColor(ticket.urgency)} bg-transparent px-0 font-bold`}
                        >
                          {getUrgencyLabel(ticket.urgency)}
                        </Badge>
                        {ticket.team && (
                          <Badge variant="secondary" className="text-sm bg-gray-100 text-gray-700 border-0 px-2 py-0.5 font-bold">
                            {ticket.team === 'infra' ? 'Infra' : 'Sistemas'}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="flex items-center gap-1">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm font-bold">0</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span className="text-sm font-bold">0</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {columnTickets.length === 0 && (
                  <div className="text-center text-gray-400 py-12 px-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Nenhum ticket</p>
                    <p className="text-xs text-gray-400 mt-1">Os tickets aparecerão aqui</p>
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

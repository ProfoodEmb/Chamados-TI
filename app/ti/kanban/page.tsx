"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/kanban-board";
import { useSimpleRealtime } from "@/lib/use-simple-realtime";
import { authClient } from "@/lib/auth-client";
import "./kanban.css";

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

export default function KanbanPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useSimpleRealtime({
    onUpdate: () => fetchTickets(),
    enabled: true,
    interval: 3000 // 3 segundos
  });

  useEffect(() => {
    checkAuth();
    fetchTickets();
  }, []);

  const checkAuth = async () => {
    const { data } = await authClient.getSession();
    if (!data?.user) {
      router.push("/login");
      return;
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets");
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Erro ao buscar tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketMove = async (ticketId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kanbanStatus: newStatus }),
      });

      if (response.ok) {
        fetchTickets();
      }
    } catch (error) {
      console.error("Erro ao atualizar ticket:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="p-8 h-screen flex flex-col overflow-hidden bg-gray-50">
      <div className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold text-gray-900">Kanban</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Visualização automática do fluxo de tickets
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <KanbanBoard tickets={tickets} onTicketMove={handleTicketMove} />
      </div>
    </div>
  );
}

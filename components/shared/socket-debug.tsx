"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function SocketDebug() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [transport, setTransport] = useState<string>("");

  useEffect(() => {
    const newSocket = io({
      path: "/api/socketio",
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      setTransport(newSocket.io.engine.transport.name);
      addEvent(`✅ Conectado: ${newSocket.id}`);
    });

    newSocket.on("connected", (data) => {
      addEvent(`📡 Confirmação: ${JSON.stringify(data)}`);
    });

    newSocket.on("ticket-update", (data) => {
      addEvent(`📢 Ticket Update: ${JSON.stringify(data)}`);
    });

    newSocket.on("disconnect", (reason) => {
      setIsConnected(false);
      addEvent(`❌ Desconectado: ${reason}`);
    });

    newSocket.on("connect_error", (error) => {
      addEvent(`🚨 Erro: ${error.message}`);
    });

    newSocket.io.engine.on("upgrade", (transport) => {
      setTransport(transport.name);
      addEvent(`⬆️ Upgrade: ${transport.name}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const addEvent = (event: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [`[${timestamp}] ${event}`, ...prev].slice(0, 20));
  };

  const testEmit = () => {
    if (socket) {
      socket.emit("test-event", { message: "Test from client" });
      addEvent("🧪 Teste enviado");
    }
  };

  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Socket.IO Debug</h3>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
            {transport && (
              <Badge variant="outline">{transport}</Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={testEmit} disabled={!isConnected}>
            Testar Evento
          </Button>
          <Button size="sm" variant="outline" onClick={clearEvents}>
            Limpar
          </Button>
        </div>

        <div className="bg-black text-green-400 p-3 rounded-md font-mono text-xs h-64 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-gray-500">Aguardando eventos...</div>
          ) : (
            events.map((event, i) => (
              <div key={i} className="mb-1">
                {event}
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}

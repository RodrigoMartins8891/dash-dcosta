"use client";

import { useState, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface Notificacao {
  id:        string;
  tipo:      "nova_venda" | "estoque_baixo" | "status_atualizado";
  titulo:    string;
  mensagem:  string;
  timestamp: string;
  lida:      boolean;
  dados?:    any;
}

const BACKEND = "http://localhost:3001";

export function useNotifications() {
  const [socket,        setSocket]        = useState<Socket | null>(null);
  const [notificacoes,  setNotificacoes]  = useState<Notificacao[]>([]);
  const [conectado,     setConectado]     = useState(false);

  useEffect(() => {
    const s = io(BACKEND, { transports: ["websocket"] });

    s.on("connect",    () => setConectado(true));
    s.on("disconnect", () => setConectado(false));

    // Nova venda
    s.on("nova_venda", (dados) => {
      const n: Notificacao = {
        id:       crypto.randomUUID(),
        tipo:     "nova_venda",
        titulo:   "Nova venda!",
        mensagem: `${dados.cliente} — R$ ${Number(dados.total).toFixed(2)}`,
        timestamp: dados.timestamp || new Date().toISOString(),
        lida:     false,
        dados,
      };
      setNotificacoes((prev) => [n, ...prev].slice(0, 50));
      // Som de notificação
      try { new Audio("/notification.mp3").play(); } catch {}
    });

    // Estoque baixo
    s.on("estoque_baixo", (dados) => {
      const n: Notificacao = {
        id:       crypto.randomUUID(),
        tipo:     "estoque_baixo",
        titulo:   "Estoque baixo!",
        mensagem: `${dados.produto} — ${dados.estoque} un. (mín: ${dados.minimo})`,
        timestamp: new Date().toISOString(),
        lida:     false,
        dados,
      };
      setNotificacoes((prev) => [n, ...prev].slice(0, 50));
    });

    // Status atualizado
    s.on("status_atualizado", (dados) => {
      const n: Notificacao = {
        id:       crypto.randomUUID(),
        tipo:     "status_atualizado",
        titulo:   "Status atualizado",
        mensagem: `Pedido #${dados.id} → ${dados.status}`,
        timestamp: new Date().toISOString(),
        lida:     false,
        dados,
      };
      setNotificacoes((prev) => [n, ...prev].slice(0, 50));
    });

    setSocket(s);
    return () => { s.disconnect(); };
  }, []);

  const marcarLida = useCallback((id: string) => {
    setNotificacoes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
    );
  }, []);

  const marcarTodasLidas = useCallback(() => {
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }, []);

  const limpar = useCallback(() => setNotificacoes([]), []);

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return { notificacoes, naoLidas, conectado, marcarLida, marcarTodasLidas, limpar };
}
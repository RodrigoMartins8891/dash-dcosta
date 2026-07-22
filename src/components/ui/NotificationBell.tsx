"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, ShoppingCart, AlertTriangle, RefreshCw, X, CheckCheck, Trash2 } from "lucide-react";
import { Notificacao } from "../../hooks/useNotifications";

const TIPO_ICON = {
  nova_venda:        <ShoppingCart  size={14} className="text-emerald-600" />,
  estoque_baixo:     <AlertTriangle size={14} className="text-amber-500" />,
  status_atualizado: <RefreshCw     size={14} className="text-blue-500" />,
};

const TIPO_BG = {
  nova_venda:        "bg-emerald-50 border-emerald-100",
  estoque_baixo:     "bg-amber-50  border-amber-100",
  status_atualizado: "bg-blue-50   border-blue-100",
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

interface Props {
  notificacoes:    Notificacao[];
  naoLidas:        number;
  conectado:       boolean;
  onMarcarLida:    (id: string) => void;
  onMarcarTodas:   () => void;
  onLimpar:        () => void;
}

export default function NotificationBell({
  notificacoes, naoLidas, conectado, onMarcarLida, onMarcarTodas, onLimpar,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Botão sino */}
      <button
        onClick={() => setAberto(!aberto)}
        className="relative p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-500"
        title="Notificações"
      >
        <Bell size={18} />
        {naoLidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {naoLidas > 9 ? "9+" : naoLidas}
          </span>
        )}
        {/* Indicador de conexão */}
        <span className={`absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full border border-white ${conectado ? "bg-emerald-400" : "bg-gray-300"}`} />
      </button>

      {/* Dropdown */}
      {aberto && (
        <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-800">Notificações</span>
              {naoLidas > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-medium">
                  {naoLidas} nova{naoLidas > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {naoLidas > 0 && (
                <button onClick={onMarcarTodas} title="Marcar todas como lidas"
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                  <CheckCheck size={14} />
                </button>
              )}
              {notificacoes.length > 0 && (
                <button onClick={onLimpar} title="Limpar tudo"
                  className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              )}
              <button onClick={() => setAberto(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400">
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Lista */}
          <div className="max-h-80 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                <Bell size={24} className="mx-auto mb-2 text-gray-200" />
                Nenhuma notificação
              </div>
            ) : (
              notificacoes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => onMarcarLida(n.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.lida ? "bg-blue-50/30" : ""}`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg border ${TIPO_BG[n.tipo]}`}>
                    {TIPO_ICON[n.tipo]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-semibold ${!n.lida ? "text-gray-900" : "text-gray-600"}`}>
                        {n.titulo}
                      </p>
                      <span className="text-[10px] text-gray-400 ml-2 flex-shrink-0">{fmtTime(n.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{n.mensagem}</p>
                  </div>
                  {!n.lida && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${conectado ? "bg-emerald-400" : "bg-gray-300"}`} />
            <span className="text-xs text-gray-400">
              {conectado ? "Conectado em tempo real" : "Reconectando..."}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { LayoutDashboard, ShoppingCart, Package, Wrench, RefreshCw } from "lucide-react";
import { useData }          from "./hooks/useData";
import { useNotifications } from "./hooks/useNotifications";
import NotificationBell     from "./components/ui/NotificationBell";

import ViewDashboard from "./views/ViewDashboard";
import ViewVendas    from "./views/ViewVendas";
import ViewEstoque   from "./views/ViewEstoque";
import ViewPecas     from "./views/ViewPecas";

const VIEWS = [
  { id: "dashboard", label: "Dashboard",        icon: LayoutDashboard },
  { id: "vendas",    label: "Vendas",            icon: ShoppingCart },
  { id: "estoque",   label: "Estoque",           icon: Package },
  { id: "pecas",     label: "Cadastro de Peças", icon: Wrench },
];

export default function DashboardOrdenhadeiras() {
  const [view, setView] = useState("dashboard");

  const {
    pecas, vendas, loading, error,
    adicionarVenda, atualizarVenda, excluirVenda,
    adicionarPeca,  salvarPeca,     excluirPeca, ajustarEstoque,
  } = useData();

  const {
    notificacoes, naoLidas, conectado,
    marcarLida, marcarTodasLidas, limpar,
  } = useNotifications();

  const VIEW_MAP = {
    dashboard: <ViewDashboard pecas={pecas} vendas={vendas} />,
    vendas:    <ViewVendas    pecas={pecas} vendas={vendas} onAdd={adicionarVenda} onUpdate={atualizarVenda} onDelete={excluirVenda} />,
    estoque:   <ViewEstoque   pecas={pecas} onAjuste={ajustarEstoque} />,
    pecas:     <ViewPecas     pecas={pecas} onAdd={adicionarPeca} onSave={salvarPeca} onDelete={excluirPeca} />,
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside className="w-56 min-w-[14rem] bg-white border-r border-gray-200 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Package size={14} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 leading-tight">OrdenhaPeças</h1>
              <p className="text-[10px] text-gray-400">Gestão de estoque e vendas</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          <p className="px-3 pt-3 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Menu</p>
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all
                ${view === id
                  ? "bg-emerald-50 text-emerald-700 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-semibold text-emerald-700">
              OP
            </div>
            <div>
              <p className="text-xs font-medium text-gray-700">Admin</p>
              <p className="text-[10px] text-gray-400">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Conteúdo principal ─────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <h2 className="text-base font-semibold text-gray-900">
            {VIEWS.find((v) => v.id === view)?.label}
          </h2>
          <div className="flex items-center gap-3">
            {/* Sino de notificações */}
            <NotificationBell
              notificacoes={notificacoes}
              naoLidas={naoLidas}
              conectado={conectado}
              onMarcarLida={marcarLida}
              onMarcarTodas={marcarTodasLidas}
              onLimpar={limpar}
            />
            <div className="text-xs text-gray-400">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long", day: "2-digit", month: "long", year: "numeric",
              })}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <RefreshCw size={20} className="animate-spin text-emerald-500 mr-2" />
              <span className="text-sm text-gray-500">Carregando dados...</span>
            </div>
          )}
          {error && !loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-sm text-red-500 mb-2">Erro ao conectar com o servidor</p>
                <p className="text-xs text-gray-400">{error}</p>
                <p className="text-xs text-gray-400 mt-1">Verifique se o backend está rodando em localhost:3001</p>
              </div>
            </div>
          )}
          {!loading && !error && VIEW_MAP[view]}
        </main>
      </div>
    </div>
  );
}

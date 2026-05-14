"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Search, Edit } from "lucide-react";
import { Badge, StockBar, IconBtn, Select } from "../components/ui";
import { ModalAjuste } from "../components/modals/ModalVendaExtras";
import { CATEGORIAS, CHART_COLORS } from "../constants";
import { fmtBRL } from "../utils";

export default function ViewEstoque({ pecas, onAjuste }) {
  const [busca, setBusca] = useState("");
  const [filtroCat, setFiltroCat] = useState("");
  const [filtroSit, setFiltroSit] = useState("");
  const [ajuste, setAjuste] = useState(null);

  const lista = useMemo(
    () =>
      pecas.filter((p) => {
        if (busca && !`${p.nome}${p.sku}`.toLowerCase().includes(busca.toLowerCase())) return false;
        if (filtroCat && p.categoria !== filtroCat) return false;
        if (filtroSit === "ok" && !(p.estoque > p.minimo)) return false;
        if (filtroSit === "baixo" && !(p.estoque > 0 && p.estoque <= p.minimo)) return false;
        if (filtroSit === "zero" && p.estoque !== 0) return false;
        return true;
      }),
    [pecas, busca, filtroCat, filtroSit]
  );

  // Incremento / decremento rápido
  const ajustarDelta = async (id, delta) => {
    const peca = pecas.find((p) => p.id === id);
    if (!peca) return;
    const novoEstoque = Math.max(0, peca.estoque + delta);
    try {
      await onAjuste(id, novoEstoque);
    } catch (err) {
      alert(err.message);
    }
  };

  // Ajuste por valor absoluto (via modal)
  const confirmarAjuste = async (id, val) => {
    try {
      await onAjuste(id, val);
      setAjuste(null);
    } catch (err) {
      alert(err.message);
    }
  };

  // Gráfico de estoque por categoria
  const catData = useMemo(() => {
    const map = {};
    pecas.forEach((p) => { map[p.categoria] = (map[p.categoria] || 0) + p.estoque; });
    return Object.entries(map).map(([cat, qtd]) => ({ cat, qtd }));
  }, [pecas]);

  return (
    <div>
      {/* ── Gráfico ───────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
        <h3 className="text-sm font-medium text-gray-800 mb-3">Estoque por categoria</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={catData} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f0" />
            <XAxis dataKey="cat" tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
            <Tooltip formatter={(v) => [v, "Qtd em estoque"]} />
            <Bar dataKey="qtd" name="Qtd em estoque" radius={[4, 4, 0, 0]}>
              {catData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Filtros ───────────────────────────────────────── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
            placeholder="Buscar peça ou SKU..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
          <option value="">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={filtroSit} onChange={(e) => setFiltroSit(e.target.value)}>
          <option value="">Todos</option>
          <option value="ok">Disponível</option>
          <option value="baixo">Estoque baixo</option>
          <option value="zero">Sem estoque</option>
        </Select>
      </div>

      {/* ── Tabela ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500">
              <th className="text-left   px-4 py-3">SKU</th>
              <th className="text-left   px-4 py-3">Peça</th>
              <th className="text-left   px-4 py-3">Categoria</th>
              <th className="text-right  px-4 py-3">Preço unit.</th>
              <th className="            px-4 py-3">Estoque</th>
              <th className="text-center px-4 py-3">Mín.</th>
              <th className="text-center px-4 py-3">Situação</th>
              <th className="text-center px-4 py-3">Ajustar</th>
            </tr>
          </thead>
          <tbody>
            {lista.length > 0 ? (
              lista.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nome}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800">
                      {p.categoria}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtBRL(p.preco)}</td>
                  <td className="px-4 py-3 min-w-[140px]">
                    <StockBar value={p.estoque} max={p.minimo * 2} />
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">{p.minimo}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={p.estoque === 0 ? "red" : p.estoque <= p.minimo ? "amber" : "green"}>
                      {p.estoque === 0 ? "Sem estoque" : p.estoque <= p.minimo ? "Estoque baixo" : "Disponível"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        className="w-6 h-6 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm font-bold disabled:opacity-30"
                        onClick={() => ajustarDelta(p.id, -1)}
                        disabled={p.estoque === 0}
                      >−</button>
                      <button
                        className="w-6 h-6 rounded border border-gray-200 text-gray-500 hover:bg-gray-100 text-sm font-bold"
                        onClick={() => ajustarDelta(p.id, +1)}
                      >+</button>
                      <IconBtn title="Ajuste manual" onClick={() => setAjuste(p)}>
                        <Edit size={12} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-12 text-sm text-gray-400">
                  Nenhum item encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal de ajuste ───────────────────────────────── */}
      {ajuste && (
        <ModalAjuste
          peca={ajuste}
          onSave={(val) => confirmarAjuste(ajuste.id, val)}
          onClose={() => setAjuste(null)}
        />
      )}
    </div>
  );
}

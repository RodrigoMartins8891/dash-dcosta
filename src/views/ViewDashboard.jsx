"use client";

import { useMemo } from "react";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { TrendingUp, ShoppingCart, Package, AlertTriangle, FileText } from "lucide-react";
import { MetricCard, Badge, Btn } from "../components/ui";
import { CHART_COLORS, MESES_PT } from "../constants";
import { totalVenda, fmtBRL } from "../utils";
import { gerarRelatorioFinanceiro } from "../utils/relatorioFinanceiro";

export default function ViewDashboard({ pecas, vendas }) {
  const totalMes   = vendas.filter((v) => v.data.startsWith("2026-05")).reduce((s, v) => s + totalVenda(v), 0);
  const concluidas = vendas.filter((v) => v.status === "Concluída").length;
  const semEstoque = pecas.filter((p) => p.estoque === 0).length;
  const alertas    = pecas.filter((p) => p.estoque <= p.minimo).length;

  const vendasMes = useMemo(() => {
    const map = {};
    vendas.filter((v) => v.status === "Concluída").forEach((v) => {
      const chave = v.data.slice(0, 7);
      map[chave] = (map[chave] || 0) + totalVenda(v);
    });
    return Object.entries(map).sort().map(([chave, total]) => ({
      mes:   MESES_PT[parseInt(chave.split("-")[1]) - 1],
      total: parseFloat(total.toFixed(2)),
    }));
  }, [vendas]);

  const vendasCat = useMemo(() => {
    const map = {};
    vendas.filter((v) => v.status === "Concluída").forEach((v) => {
      v.itens.forEach((item) => {
        const peca = pecas.find((p) => p.id === item.pecaId);
        if (!peca) return;
        map[peca.categoria] = (map[peca.categoria] || 0) + item.qty * item.preco;
      });
    });
    return Object.entries(map).map(([cat, val]) => ({ cat, val: parseFloat(val.toFixed(2)) }));
  }, [vendas, pecas]);

  const alertasPecas  = pecas.filter((p) => p.estoque <= p.minimo);
  const ultimasVendas = [...vendas].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  function handleGerarPDF() {
    // Converte as peças para o formato esperado pelo gerador
    const pecasFormatadas = pecas.map((p) => ({ id: p.id, nome: p.nome }));

    // Converte as vendas para o formato esperado
    const vendasFormatadas = vendas.map((v) => ({
      ...v,
      itens: v.itens.map((i) => {
        const peca = pecas.find((p) => p.id === i.pecaId);
        return { ...i, nome: peca?.nome };
      }),
    }));

    gerarRelatorioFinanceiro(vendasFormatadas, pecasFormatadas);
  }

  return (
    <div>
      {/* ── Header com botão de relatório ──────────────── */}
      <div className="flex items-center justify-between mb-5">
        <div className="grid grid-cols-4 gap-3 flex-1">
          <MetricCard
            label="Faturamento (mai/26)" value={fmtBRL(totalMes)}
            sub={`${concluidas} pedidos concluídos`} trend="up" icon={TrendingUp}
          />
          <MetricCard
            label="Total de pedidos" value={vendas.length}
            sub={`${vendas.filter((v) => v.status === "Pendente").length} pendentes`} icon={ShoppingCart}
          />
          <MetricCard
            label="Itens em estoque"
            value={pecas.reduce((s, p) => s + p.estoque, 0).toLocaleString("pt-BR")}
            sub={`${semEstoque} sem estoque`} trend={semEstoque > 0 ? "down" : undefined} icon={Package}
          />
          <MetricCard
            label="Alertas de estoque" value={alertas}
            sub={`${semEstoque} zerados, ${alertas - semEstoque} baixos`}
            trend={alertas > 0 ? "down" : undefined} icon={AlertTriangle}
          />
        </div>
        <div className="ml-4 flex-shrink-0">
          <Btn onClick={handleGerarPDF}>
            <FileText size={14} /> Exportar PDF
          </Btn>
        </div>
      </div>

      {/* ── Gráficos ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Faturamento por mês</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={vendasMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [fmtBRL(v), "Total"]} />
              <Line type="monotone" dataKey="total" stroke="#1D9E75" strokeWidth={2.5} dot={{ r: 4, fill: "#1D9E75" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="text-sm font-medium text-gray-800 mb-4">Vendas por categoria</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={vendasCat} dataKey="val" nameKey="cat"
                cx="40%" cy="50%" outerRadius={75}
                label={({ cat, percent }) => `${cat.slice(0, 6)} ${(percent * 100).toFixed(0)}%`}
                labelLine fontSize={10}
              >
                {vendasCat.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [fmtBRL(v), "Total"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Tabelas ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-800">Últimas vendas</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="text-left  px-4 py-2">Cliente</th>
                <th className="text-right  px-4 py-2">Total</th>
                <th className="text-center px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVendas.map((v) => (
                <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-gray-800 text-xs">{v.cliente}</td>
                  <td className="px-4 py-2.5 text-right text-xs font-medium">{fmtBRL(totalVenda(v))}</td>
                  <td className="px-4 py-2.5 text-center">
                    <Badge variant={v.status === "Concluída" ? "green" : "amber"}>{v.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            <h3 className="text-sm font-medium text-gray-800">Alertas de estoque</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="text-left  px-4 py-2">Peça</th>
                <th className="text-center px-4 py-2">Estoque</th>
                <th className="text-center px-4 py-2">Mín.</th>
              </tr>
            </thead>
            <tbody>
              {alertasPecas.length > 0 ? (
                alertasPecas.map((p) => (
                  <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-xs text-gray-800">{p.nome}</td>
                    <td className="px-4 py-2.5 text-center">
                      <Badge variant={p.estoque === 0 ? "red" : "amber"}>{p.estoque}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-center text-xs text-gray-500">{p.minimo}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-xs text-gray-400">
                    Nenhum alerta de estoque
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

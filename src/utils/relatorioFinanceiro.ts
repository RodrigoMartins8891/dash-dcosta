"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Item {
  pecaId: number;
  qty:    number;
  preco:  number;
  nome?:  string;
}

interface Venda {
  id:        number;
  cliente:   string;
  data:      string;
  pagamento: string;
  status:    string;
  itens:     Item[];
  frete_valor?: number | null;
}

interface Peca {
  id:   number;
  nome: string;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────
const fmtBRL  = (v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
const fmtData = (d: string) => new Date(d).toLocaleDateString("pt-BR");

function totalVenda(v: Venda) {
  const itens = v.itens.reduce((s, i) => s + i.qty * i.preco, 0);
  return itens + (v.frete_valor ?? 0);
}

// ─── Gerador principal ────────────────────────────────────────────────────────
export function gerarRelatorioFinanceiro(
  vendas: Venda[],
  pecas:  Peca[],
  periodo?: { inicio: string; fim: string }
) {
  const vendasConcluidas = vendas.filter(v => v.status === "Concluída");

  // ── Métricas ─────────────────────────────────────────────────────────────
  const faturamentoTotal = vendasConcluidas.reduce((s, v) => s + totalVenda(v), 0);
  const ticketMedio      = vendasConcluidas.length > 0 ? faturamentoTotal / vendasConcluidas.length : 0;

  // Por forma de pagamento
  const porPagamento: Record<string, { qtd: number; total: number }> = {};
  vendasConcluidas.forEach(v => {
    if (!porPagamento[v.pagamento]) porPagamento[v.pagamento] = { qtd: 0, total: 0 };
    porPagamento[v.pagamento].qtd++;
    porPagamento[v.pagamento].total += totalVenda(v);
  });

  // Por mês
  const porMes: Record<string, number> = {};
  vendasConcluidas.forEach(v => {
    const mes = v.data.slice(0, 7);
    porMes[mes] = (porMes[mes] || 0) + totalVenda(v);
  });

  // Top 5 produtos mais vendidos
  const prodQtd: Record<number, { nome: string; qtd: number; total: number }> = {};
  vendasConcluidas.forEach(v => {
    v.itens.forEach(item => {
      const peca = pecas.find(p => p.id === item.pecaId);
      const nome = item.nome || peca?.nome || `Produto #${item.pecaId}`;
      if (!prodQtd[item.pecaId]) prodQtd[item.pecaId] = { nome, qtd: 0, total: 0 };
      prodQtd[item.pecaId].qtd   += item.qty;
      prodQtd[item.pecaId].total += item.qty * item.preco;
    });
  });
  const topProdutos = Object.values(prodQtd)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 5);

  // Comparativo meses (último vs penúltimo)
  const meses      = Object.entries(porMes).sort();
  const mesAtual   = meses[meses.length - 1];
  const mesAnterior= meses[meses.length - 2];
  const variacao   = mesAtual && mesAnterior
    ? ((mesAtual[1] - mesAnterior[1]) / mesAnterior[1]) * 100
    : null;

  // ── Montar PDF ───────────────────────────────────────────────────────────
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W   = doc.internal.pageSize.getWidth();
  let   y   = 0;

  // Cabeçalho verde
  doc.setFillColor(29, 158, 117);
  doc.rect(0, 0, W, 35, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("OrdenhaPeças", 14, 14);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório Financeiro", 14, 22);

  const dataGeracao = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc.setFontSize(9);
  doc.text(`Gerado em ${dataGeracao}`, 14, 30);

  if (periodo) {
    doc.text(`Período: ${fmtData(periodo.inicio)} a ${fmtData(periodo.fim)}`, W - 14, 30, { align: "right" });
  }

  y = 45;

  // ── Seção 1: Métricas principais ─────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Resumo Geral", 14, y);
  y += 6;

  doc.setDrawColor(29, 158, 117);
  doc.setLineWidth(0.5);
  doc.line(14, y, W - 14, y);
  y += 6;

  // Cards de métricas em linha
  const cards = [
    { label: "Faturamento Total",  value: fmtBRL(faturamentoTotal) },
    { label: "Vendas Concluídas",  value: String(vendasConcluidas.length) },
    { label: "Ticket Médio",       value: fmtBRL(ticketMedio) },
    { label: "Pendentes",          value: String(vendas.filter(v => v.status === "Pendente").length) },
  ];

  const cardW = (W - 28 - 9) / 4;
  cards.forEach((card, i) => {
    const x = 14 + i * (cardW + 3);
    doc.setFillColor(245, 250, 248);
    doc.roundedRect(x, y, cardW, 20, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(card.label, x + cardW / 2, y + 7, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(29, 158, 117);
    doc.text(card.value, x + cardW / 2, y + 15, { align: "center" });
  });
  y += 28;

  // ── Seção 2: Faturamento por mês ─────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Faturamento por Mês", 14, y);
  y += 6;
  doc.setDrawColor(29, 158, 117);
  doc.line(14, y, W - 14, y);
  y += 4;

  const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  autoTable(doc, {
    startY: y,
    head:   [["Mês", "Faturamento", "Variação"]],
    body:   meses.map(([mes, total], i) => {
      const anterior = i > 0 ? meses[i - 1][1] : null;
      const var_     = anterior ? ((total - anterior) / anterior * 100).toFixed(1) + "%" : "—";
      const nomeMes  = MESES_PT[parseInt(mes.split("-")[1]) - 1] + "/" + mes.split("-")[0];
      return [nomeMes, fmtBRL(total), var_];
    }),
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [29, 158, 117], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 250, 248] },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" },
      2: { halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Seção 3: Por forma de pagamento ───────────────────────────────────────
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Vendas por Forma de Pagamento", 14, y);
  y += 6;
  doc.setDrawColor(29, 158, 117);
  doc.line(14, y, W - 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head:   [["Forma de Pagamento", "Qtd. Vendas", "Total", "% do Faturamento"]],
    body:   Object.entries(porPagamento)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([forma, dados]) => [
        forma,
        String(dados.qtd),
        fmtBRL(dados.total),
        faturamentoTotal > 0
          ? (dados.total / faturamentoTotal * 100).toFixed(1) + "%"
          : "0%",
      ]),
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [29, 158, 117], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 250, 248] },
    columnStyles: {
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Seção 4: Top produtos ─────────────────────────────────────────────────
  if (y > 240) { doc.addPage(); y = 20; }

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 30, 30);
  doc.text("Top 5 Produtos Mais Vendidos", 14, y);
  y += 6;
  doc.setDrawColor(29, 158, 117);
  doc.line(14, y, W - 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head:   [["#", "Produto", "Qtd. Vendida", "Receita Gerada"]],
    body:   topProdutos.map((p, i) => [
      String(i + 1),
      p.nome,
      String(p.qtd),
      fmtBRL(p.total),
    ]),
    styles:     { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [29, 158, 117], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [245, 250, 248] },
    columnStyles: {
      0: { halign: "center", cellWidth: 12 },
      2: { halign: "center" },
      3: { halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ── Seção 5: Comparativo ──────────────────────────────────────────────────
  if (variacao !== null && mesAtual && mesAnterior) {
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Comparativo de Períodos", 14, y);
    y += 6;
    doc.setDrawColor(29, 158, 117);
    doc.line(14, y, W - 14, y);
    y += 8;

    const MESES_PT2 = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
    const nomeMesAt = MESES_PT2[parseInt(mesAtual[0].split("-")[1]) - 1]   + "/" + mesAtual[0].split("-")[0];
    const nomeMesAnt= MESES_PT2[parseInt(mesAnterior[0].split("-")[1]) - 1] + "/" + mesAnterior[0].split("-")[0];

    const isPositivo = variacao >= 0;
    doc.setFillColor(isPositivo ? 236 : 254, isPositivo ? 253 : 242, isPositivo ? 243 : 242);
    doc.roundedRect(14, y, W - 28, 24, 2, 2, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${nomeMesAnt}`, 14 + (W - 28) * 0.25, y + 7, { align: "center" });
    doc.text(`${nomeMesAt}`, 14 + (W - 28) * 0.5, y + 7, { align: "center" });
    doc.text("Variação", 14 + (W - 28) * 0.75, y + 7, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(fmtBRL(mesAnterior[1]), 14 + (W - 28) * 0.25, y + 17, { align: "center" });
    doc.text(fmtBRL(mesAtual[1]),    14 + (W - 28) * 0.5,  y + 17, { align: "center" });
    doc.setTextColor(isPositivo ? 29 : 220, isPositivo ? 158 : 38, isPositivo ? 117 : 38);
    doc.text(`${isPositivo ? "+" : ""}${variacao.toFixed(1)}%`, 14 + (W - 28) * 0.75, y + 17, { align: "center" });
    y += 32;
  }

  // ── Rodapé ────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(245, 245, 245);
    doc.rect(0, pageH - 12, W, 12, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("OrdenhaPeças — Gestão de Estoque e Vendas", 14, pageH - 4);
    doc.text(`Página ${i} de ${totalPages}`, W - 14, pageH - 4, { align: "right" });
  }

  // Download
  const nomeArquivo = `relatorio-financeiro-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(nomeArquivo);
}

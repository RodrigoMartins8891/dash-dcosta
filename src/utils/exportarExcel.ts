"use client";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Item {
  pecaId: number;
  qty:    number;
  preco:  number;
  nome?:  string;
}

interface Venda {
  id:          number;
  cliente:     string;
  data:        string;
  pagamento:   string;
  frete:       string;
  status:      string;
  nf:          string | null;
  itens:       Item[];
  frete_valor?: number | null;
}

interface Peca {
  id:        number;
  nome:      string;
  sku:       string;
  categoria: string;
  preco:     number;
  estoque:   number;
  minimo:    number;
}

// ─── Utilitários ──────────────────────────────────────────────────────────────
const fmtData  = (d: string) => new Date(d).toLocaleDateString("pt-BR");
const fmtBRL   = (v: number) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
const totalVenda = (v: Venda) =>
  v.itens.reduce((s, i) => s + i.qty * i.preco, 0) + (v.frete_valor ?? 0);

// ─── Estilo de cabeçalho ──────────────────────────────────────────────────────
function estiloCabecalho() {
  return {
    font:      { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
    fill:      { fgColor: { rgb: "1D9E75" } },
    alignment: { horizontal: "center", vertical: "center", wrapText: true },
    border: {
      top:    { style: "thin", color: { rgb: "CCCCCC" } },
      bottom: { style: "thin", color: { rgb: "CCCCCC" } },
      left:   { style: "thin", color: { rgb: "CCCCCC" } },
      right:  { style: "thin", color: { rgb: "CCCCCC" } },
    },
  };
}

function estiloLinha(par: boolean) {
  return {
    fill:      { fgColor: { rgb: par ? "F5FAF8" : "FFFFFF" } },
    alignment: { vertical: "center" },
    border: {
      top:    { style: "thin", color: { rgb: "E5E7EB" } },
      bottom: { style: "thin", color: { rgb: "E5E7EB" } },
      left:   { style: "thin", color: { rgb: "E5E7EB" } },
      right:  { style: "thin", color: { rgb: "E5E7EB" } },
    },
  };
}

// ─── Aplica estilos a um range ────────────────────────────────────────────────
function aplicarEstilos(ws: XLSX.WorkSheet, range: XLSX.Range, styleFn: (row: number, col: number) => any) {
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell_ref = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cell_ref]) ws[cell_ref] = { t: "z", v: "" };
      ws[cell_ref].s = styleFn(R, C);
    }
  }
}

// ─── Aba: Vendas ──────────────────────────────────────────────────────────────
function abaVendas(vendas: Venda[], pecas: Peca[]): XLSX.WorkSheet {
  const cabecalho = ["#", "Cliente", "Data", "Pagamento", "Frete", "Status", "Itens", "Subtotal", "Frete (R$)", "Total", "NF"];

  const linhas = vendas.map((v) => {
    const itensStr = v.itens
      .map((i) => {
        const p = pecas.find((p) => p.id === i.pecaId);
        return `${p?.nome || "?"} x${i.qty}`;
      })
      .join("; ");
    const subtotal = v.itens.reduce((s, i) => s + i.qty * i.preco, 0);
    return [
      v.id,
      v.cliente,
      fmtData(v.data),
      v.pagamento,
      v.frete,
      v.status,
      itensStr,
      subtotal,
      v.frete_valor ?? 0,
      totalVenda(v),
      v.nf || "",
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...linhas]);

  // Larguras das colunas
  ws["!cols"] = [
    { wch: 6 }, { wch: 25 }, { wch: 12 }, { wch: 18 },
    { wch: 18 }, { wch: 12 }, { wch: 40 }, { wch: 14 },
    { wch: 12 }, { wch: 14 }, { wch: 12 },
  ];

  // Altura do cabeçalho
  ws["!rows"] = [{ hpt: 22 }];

  // Estilos
  aplicarEstilos(ws, { s: { r: 0, c: 0 }, e: { r: 0, c: cabecalho.length - 1 } },
    () => estiloCabecalho()
  );
  linhas.forEach((_, i) => {
    aplicarEstilos(ws, { s: { r: i + 1, c: 0 }, e: { r: i + 1, c: cabecalho.length - 1 } },
      () => estiloLinha(i % 2 === 0)
    );
  });

  return ws;
}

// ─── Aba: Estoque ─────────────────────────────────────────────────────────────
function abaEstoque(pecas: Peca[]): XLSX.WorkSheet {
  const cabecalho = ["SKU", "Nome", "Categoria", "Preço Unit.", "Estoque", "Mínimo", "Situação", "Valor em Estoque"];

  const linhas = pecas.map((p) => {
    const situacao = p.estoque === 0 ? "Sem estoque" : p.estoque <= p.minimo ? "Estoque baixo" : "Disponível";
    return [
      p.sku,
      p.nome,
      p.categoria,
      p.preco,
      p.estoque,
      p.minimo,
      situacao,
      p.preco * p.estoque,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([cabecalho, ...linhas]);

  ws["!cols"] = [
    { wch: 12 }, { wch: 30 }, { wch: 18 }, { wch: 14 },
    { wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 16 },
  ];
  ws["!rows"] = [{ hpt: 22 }];

  aplicarEstilos(ws, { s: { r: 0, c: 0 }, e: { r: 0, c: cabecalho.length - 1 } },
    () => estiloCabecalho()
  );
  linhas.forEach((_, i) => {
    aplicarEstilos(ws, { s: { r: i + 1, c: 0 }, e: { r: i + 1, c: cabecalho.length - 1 } },
      () => estiloLinha(i % 2 === 0)
    );
  });

  return ws;
}

// ─── Aba: Financeiro ──────────────────────────────────────────────────────────
function abaFinanceiro(vendas: Venda[]): XLSX.WorkSheet {
  const concluidas = vendas.filter(v => v.status === "Concluída");
  const faturamento = concluidas.reduce((s, v) => s + totalVenda(v), 0);
  const ticketMedio = concluidas.length > 0 ? faturamento / concluidas.length : 0;

  // Por forma de pagamento
  const porPag: Record<string, { qtd: number; total: number }> = {};
  concluidas.forEach(v => {
    if (!porPag[v.pagamento]) porPag[v.pagamento] = { qtd: 0, total: 0 };
    porPag[v.pagamento].qtd++;
    porPag[v.pagamento].total += totalVenda(v);
  });

  // Por mês
  const MESES_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const porMes: Record<string, number> = {};
  concluidas.forEach(v => {
    const mes = v.data.slice(0, 7);
    porMes[mes] = (porMes[mes] || 0) + totalVenda(v);
  });

  const dados: any[][] = [
    ["RESUMO FINANCEIRO — ORDENHA PEÇAS"],
    [],
    ["Faturamento Total",  faturamento],
    ["Vendas Concluídas",  concluidas.length],
    ["Vendas Pendentes",   vendas.filter(v => v.status === "Pendente").length],
    ["Ticket Médio",       ticketMedio],
    [],
    ["FATURAMENTO POR MÊS"],
    ["Mês", "Faturamento", "Variação %"],
    ...Object.entries(porMes).sort().map(([mes, total], i, arr) => {
      const anterior = i > 0 ? arr[i - 1][1] : null;
      const variacao = anterior ? ((total - anterior) / anterior * 100).toFixed(1) + "%" : "—";
      const nomeMes  = MESES_PT[parseInt(mes.split("-")[1]) - 1] + "/" + mes.split("-")[0];
      return [nomeMes, total, variacao];
    }),
    [],
    ["VENDAS POR FORMA DE PAGAMENTO"],
    ["Forma", "Qtd. Vendas", "Total", "% Participação"],
    ...Object.entries(porPag).sort((a, b) => b[1].total - a[1].total).map(([forma, d]) => [
      forma,
      d.qtd,
      d.total,
      faturamento > 0 ? (d.total / faturamento * 100).toFixed(1) + "%" : "0%",
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(dados);
  ws["!cols"] = [{ wch: 28 }, { wch: 18 }, { wch: 16 }, { wch: 16 }];

  return ws;
}

// ─── Exportação principal ─────────────────────────────────────────────────────
export function exportarExcel(vendas: Venda[], pecas: Peca[]) {
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, abaVendas(vendas, pecas),  "Vendas");
  XLSX.utils.book_append_sheet(wb, abaEstoque(pecas),         "Estoque");
  XLSX.utils.book_append_sheet(wb, abaFinanceiro(vendas),     "Financeiro");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array", cellStyles: true });
  const blob   = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

  const nomeArquivo = `ordenha-pecas-${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, nomeArquivo);
}

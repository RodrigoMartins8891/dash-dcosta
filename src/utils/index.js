"use client";

// ─── Utilitários gerais ────────────────────────────────────────────────────────

export const totalVenda = (venda) =>
  venda.itens.reduce((soma, item) => soma + item.qty * item.preco, 0);

export const fmtBRL = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fmtData = (data) => {
  if (!data) return "—";

  const d = new Date(data);

  d.setMinutes(d.getMinutes() + d.getTimezoneOffset());

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
};
export const hoje = () => new Date().toISOString().slice(0, 10);

export function exportCSV(vendas, pecas) {
  const getPeca = (id) => pecas.find((p) => p.id === id);
  const rows = [["ID", "Cliente", "Data", "Pagamento", "Frete", "Status", "Total", "NF", "Itens"]];

  vendas.forEach((venda) => {
    const itensStr = venda.itens
      .map((item) => {
        const peca = getPeca(item.pecaId);
        return `${peca ? peca.nome : "?"} x${item.qty}`;
      })
      .join("; ");

    rows.push([
      venda.id, venda.cliente, venda.data, venda.pagamento,
      venda.frete, venda.status, totalVenda(venda).toFixed(2),
      venda.nf || "", itensStr,
    ]);
  });

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vendas_ordenha.csv";
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Produtos ──────────────────────────────────────────────────────────────────

export async function getPecas() {
  const res = await fetch("/products");
  if (!res.ok) throw new Error("Erro ao buscar produtos");
  const data = await res.json();

  return data.map((p) => ({
    id: p.id,
    nome: p.name,
    sku: p.sku ?? `SKU-${p.id}`,
    categoria: p.category_name ?? "Outros",
    preco: parseFloat(p.price),
    estoque: p.stock_quantity,
    minimo: p.min_stock ?? 5,
    image_url: p.image_url ?? null,
  }));
}

export async function createPeca(peca) {
  const formData = new FormData();
  formData.append("name", peca.nome);
  formData.append("sku", peca.sku);
  formData.append("category", peca.categoria);
  formData.append("price", peca.preco);
  formData.append("stock_quantity", peca.estoque);
  formData.append("min_stock", peca.minimo);
  formData.append("description", peca.descricao ?? "");

  if (peca.imagem) {
    formData.append("image", peca.imagem);
  }

  const res = await fetch("/products", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Erro ao criar produto");
  return res.json();
}

export async function updatePeca(id, peca) {
  const res = await fetch(`/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: peca.nome,
      description: peca.descricao ?? "",
      category: peca.categoria,
      price: peca.preco,
      stock_quantity: peca.estoque,
      min_stock: peca.minimo,
    }),
  });
  if (!res.ok) throw new Error("Erro ao atualizar produto");
  return res.json();
}

export async function deletePeca(id) {
  const res = await fetch(`/products/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar produto");
  return res.json();
}

// ─── Pedidos ───────────────────────────────────────────────────────────────────

export async function getOrders() {
  const res = await fetch("/orders");
  if (!res.ok) throw new Error("Erro ao buscar pedidos");
  return res.json();
}

export async function createOrder(venda) {
  const res = await fetch("/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(venda),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Erro ao criar pedido");
  }
  return res.json();
}

export async function updateOrder(id, data) {
  const res = await fetch(`/orders/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erro ao atualizar pedido");
  return res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`/orders/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Erro ao deletar pedido");
  return res.json();
}
"use client";

import { useState, useEffect, useCallback } from "react";
import { getPecas, getOrders, createOrder, updateOrder, deleteOrder, updatePeca, deletePeca, createPeca } from "../utils/index";

/**
 * Hook central que carrega peças e pedidos da API e expõe
 * todas as ações necessárias para o dashboard.
 */
export function useData() {
  const [pecas, setPecas] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Carrega dados iniciais ─────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [p, v] = await Promise.all([getPecas(), getOrders()]);
        setPecas(p);
        setVendas(v);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Ações de Vendas ────────────────────────────────────────────────────────
  const adicionarVenda = useCallback(async (data) => {
    const nova = await createOrder(data);
    // Recarrega tudo para refletir baixa de estoque
    const [p, v] = await Promise.all([getPecas(), getOrders()]);
    setPecas(p);
    setVendas(v);
    return nova;
  }, []);

  const atualizarVenda = useCallback(async (id, data) => {
    await updateOrder(id, data);
    setVendas((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
  }, []);

  const excluirVenda = useCallback(async (id) => {
    await deleteOrder(id);
    setVendas((prev) => prev.filter((v) => v.id !== id));
  }, []);

  // ── Ações de Peças ─────────────────────────────────────────────────────────
  const adicionarPeca = useCallback(async (data) => {
    await createPeca(data);
    const p = await getPecas();
    setPecas(p);
  }, []);

  const salvarPeca = useCallback(async (id, data) => {
    await updatePeca(id, data);
    const p = await getPecas();
    setPecas(p);
  }, []);

  const excluirPeca = useCallback(async (id) => {
    await deletePeca(id);
    setPecas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const ajustarEstoque = useCallback(async (id, novoEstoque) => {
    const peca = pecas.find((p) => p.id === id);
    if (!peca) return;
    await updatePeca(id, { estoque: novoEstoque, preco: peca.preco });
    setPecas((prev) => prev.map((p) => (p.id === id ? { ...p, estoque: novoEstoque } : p)));
  }, [pecas]);

  return {
    pecas, vendas, loading, error,
    adicionarVenda, atualizarVenda, excluirVenda,
    adicionarPeca, salvarPeca, excluirPeca, ajustarEstoque,
  };
}
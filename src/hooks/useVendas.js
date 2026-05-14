"use client";
import { useState, useCallback } from "react";
import { VENDAS_INICIAIS } from "../constants";

/**
 * Hook que gerencia o estado de vendas e realiza a baixa automática
 * de estoque ao registrar uma nova venda.
 *
 * @param {Function} setPecas - setter de peças para atualizar o estoque
 * @returns {{ vendas, setVendas }} estado e setter de vendas
 */
export function useVendas(setPecas) {
  const [vendas, setVendasRaw] = useState(VENDAS_INICIAIS);

  const setVendas = useCallback(
    (updater) => {
      setVendasRaw((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;

        // Se uma nova venda foi adicionada, baixa o estoque das peças
        if (next.length > prev.length) {
          const novaVenda = next[next.length - 1];
          setPecas((pp) =>
            pp.map((peca) => {
              const item = novaVenda.itens.find((i) => i.pecaId === peca.id);
              if (!item) return peca;
              return { ...peca, estoque: Math.max(0, peca.estoque - item.qty) };
            })
          );
        }

        return next;
      });
    },
    [setPecas]
  );

  return { vendas, setVendas };
}

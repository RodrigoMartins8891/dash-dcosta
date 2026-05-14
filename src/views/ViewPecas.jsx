"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { Btn, IconBtn, Badge, Select } from "../components/ui";
import { ModalPeca }                    from "../components/modals/ModalPeca";
import { CATEGORIAS }                   from "../constants";
import { fmtBRL }                       from "../utils";

export default function ViewPecas({ pecas, onAdd, onSave, onDelete }) {
  const [busca,     setBusca]     = useState("");
  const [filtroCat, setFiltroCat] = useState("");
  const [modal,     setModal]     = useState(null);
  const [loading,   setLoading]   = useState(false);

  const lista = useMemo(
    () =>
      pecas.filter(
        (p) =>
          (!busca     || `${p.nome}${p.sku}`.toLowerCase().includes(busca.toLowerCase())) &&
          (!filtroCat || p.categoria === filtroCat)
      ),
    [pecas, busca, filtroCat]
  );

  async function salvarPeca(data) {
    try {
      setLoading(true);
      if (modal?.type === "editar") {
        await onSave(modal.data.id, data);
      } else {
        await onAdd(data);
      }
      setModal(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function excluir(id) {
    if (!confirm("Excluir esta peça? Esta ação não pode ser desfeita.")) return;
    try {
      await onDelete(id);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-emerald-500"
            placeholder="Buscar por nome ou SKU..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <Select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
          <option value="">Todas categorias</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </Select>

        <div className="ml-auto">
          <Btn variant="primary" onClick={() => setModal({ type: "nova" })}>
            <Plus size={13} /> Nova peça
          </Btn>
        </div>
      </div>

      {/* ── Tabela ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500">
              <th className="text-left   px-4 py-3">SKU</th>
              <th className="text-left   px-4 py-3">Nome</th>
              <th className="text-left   px-4 py-3">Categoria</th>
              <th className="text-center px-4 py-3">Imagem</th>
              <th className="text-right  px-4 py-3">Preço unit.</th>
              <th className="text-center px-4 py-3">Estoque</th>
              <th className="text-center px-4 py-3">Estoque mín.</th>
              <th className="text-center px-4 py-3">Situação</th>
              <th className="text-center px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length > 0 ? (
              lista.map((p) => (
                <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-400">{p.sku}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nome}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800">
                      {p.categoria}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.nome} className="h-7 w-10 object-cover rounded-lg mx-auto" />
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">{fmtBRL(p.preco)}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={p.estoque === 0 ? "red" : p.estoque <= p.minimo ? "amber" : "green"}>
                      {p.estoque}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-400 text-xs">{p.minimo}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={p.estoque === 0 ? "red" : p.estoque <= p.minimo ? "amber" : "green"}>
                      {p.estoque === 0 ? "Sem estoque" : p.estoque <= p.minimo ? "Baixo" : "Ok"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <IconBtn title="Editar" onClick={() => setModal({ type: "editar", data: p })}>
                        <Edit size={13} />
                      </IconBtn>
                      <IconBtn title="Excluir" danger onClick={() => excluir(p.id)}>
                        <Trash2 size={13} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center py-12 text-sm text-gray-400">
                  Nenhuma peça cadastrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal ─────────────────────────────────────────── */}
      {modal !== null && (
        <ModalPeca
          peca={modal.data ?? null}
          onSave={salvarPeca}
          onClose={() => setModal(null)}
          loading={loading}
        />
      )}
    </div>
  );
}

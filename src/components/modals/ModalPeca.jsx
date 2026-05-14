"use client";

import { useState } from "react";
import { Check, ImagePlus } from "lucide-react";
import { Modal, Btn, Input, Select } from "../ui";
import { CATEGORIAS } from "../../constants";

export function ModalPeca({ peca, onSave, onClose }) {
  const [form, setForm] = useState({
    nome:        peca?.nome        ?? "",
    sku:         peca?.sku         ?? "",
    categoria:   peca?.categoria   ?? CATEGORIAS[0],
    preco:       peca?.preco       ?? "",
    estoque:     peca?.estoque     ?? 0,
    minimo:      peca?.minimo      ?? 5,
    descricao:   peca?.descricao   ?? "",
  });
  const [imagem,  setImagem]  = useState(null);
  const [preview, setPreview] = useState(peca?.image_url ?? null);

  const set = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  function handleImagem(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImagem(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleSave() {
    if (!form.nome.trim() || !form.sku.trim()) {
      alert("Preencha nome e SKU.");
      return;
    }
    if (!form.preco || isNaN(parseFloat(form.preco))) {
      alert("Informe um preço válido.");
      return;
    }
    onSave({
      nome:      form.nome.trim(),
      sku:       form.sku.trim().toUpperCase(),
      categoria: form.categoria,
      preco:     parseFloat(form.preco),
      estoque:   parseInt(form.estoque) || 0,
      minimo:    parseInt(form.minimo)  || 5,
      descricao: form.descricao.trim(),
      imagem,
    });
  }

  return (
    <Modal
      title={peca ? "Editar peça" : "Nova peça"}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleSave}>
            <Check size={13} /> Salvar
          </Btn>
        </>
      }
    >
      {/* ── Imagem ──────────────────────────────────────── */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 block mb-1">Imagem do produto</label>
        <label className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all">
          {preview ? (
            <img src={preview} alt="preview" className="h-24 object-contain rounded-lg mb-2" />
          ) : (
            <ImagePlus size={28} className="text-gray-300 mb-2" />
          )}
          <span className="text-xs text-gray-400">
            {imagem ? imagem.name : "Clique para selecionar JPG ou PNG"}
          </span>
          <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleImagem} />
        </label>
      </div>

      {/* ── Nome e SKU ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input label="Nome *"  value={form.nome} onChange={set("nome")} placeholder="Ex: Teteira silicone" />
        <Input label="SKU *"   value={form.sku}  onChange={set("sku")}  placeholder="Ex: TET-010" />
      </div>

      {/* ── Categoria e Preço ────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Select label="Categoria *" value={form.categoria} onChange={set("categoria")}>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Input
          label="Preço unitário (R$) *"
          type="number" min="0" step="0.01"
          value={form.preco} onChange={set("preco")} placeholder="0,00"
        />
      </div>

      {/* ── Estoque ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input label="Estoque inicial" type="number" min="0" value={form.estoque} onChange={set("estoque")} />
        <Input label="Estoque mínimo"  type="number" min="0" value={form.minimo}  onChange={set("minimo")}  />
      </div>

      {/* ── Descrição ────────────────────────────────────── */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500">Descrição</label>
        <textarea
          className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 w-full resize-none"
          rows={3}
          placeholder="Descrição opcional do produto..."
          value={form.descricao}
          onChange={set("descricao")}
        />
      </div>
    </Modal>
  );
}

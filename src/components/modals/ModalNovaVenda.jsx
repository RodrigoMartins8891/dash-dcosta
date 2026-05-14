"use client";
import { useState } from "react";
import { Check, Plus, X, FileUp } from "lucide-react";
import { Modal, Btn, Input, Select } from "../ui";
import { FORMAS_PAGAMENTO, FORMAS_FRETE } from "../../constants";
import { hoje, fmtBRL } from "../../utils";

/**
 * Modal para registrar uma nova venda.
 * @param {Array}    pecas   - Lista de peças disponíveis
 * @param {Function} onSave  - Callback com os dados da venda ao salvar
 * @param {Function} onClose - Fecha o modal
 */
export function ModalNovaVenda({ pecas, onSave, onClose }) {
  const [form, setForm] = useState({
    cliente:   "",
    data:      hoje(),
    pagamento: FORMAS_PAGAMENTO[0],
    frete:     FORMAS_FRETE[0],
    status:    "Pendente",
    nfNum:     "",
    nfFile:    null,
  });

  const [itens, setItens] = useState([{ pecaId: pecas[0]?.id ?? 0, qty: 1 }]);

  const setField = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const addItem    = () => setItens((prev) => [...prev, { pecaId: pecas[0]?.id ?? 0, qty: 1 }]);
  const remItem    = (i) => setItens((prev) => prev.filter((_, idx) => idx !== i));
  const setItemVal = (i, campo, val) =>
    setItens((prev) => prev.map((it, idx) => (idx === i ? { ...it, [campo]: val } : it)));

  const total = itens.reduce((soma, item) => {
    const peca = pecas.find((p) => p.id === Number(item.pecaId));
    return soma + (peca ? peca.preco * Number(item.qty) : 0);
  }, 0);

  function handleSave() {
    if (!form.cliente.trim()) { alert("Informe o cliente."); return; }
    if (!itens.length)        { alert("Adicione ao menos um item."); return; }

    for (const item of itens) {
      const peca = pecas.find((p) => p.id === Number(item.pecaId));
      if (!peca) { alert("Peça inválida."); return; }
      if (peca.estoque < Number(item.qty)) {
        alert(`Estoque insuficiente para "${peca.nome}" (disponível: ${peca.estoque}).`);
        return;
      }
    }

    onSave({
      cliente:   form.cliente.trim(),
      data:      form.data,
      pagamento: form.pagamento,
      frete:     form.frete,
      status:    form.status,
      nf:        form.nfNum.trim() || null,
      itens:     itens.map((item) => {
        const peca = pecas.find((p) => p.id === Number(item.pecaId));
        return { pecaId: Number(item.pecaId), qty: Number(item.qty), preco: peca.preco };
      }),
    });
  }

  return (
    <Modal
      title="Nova venda"
      wide
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleSave}>
            <Check size={13} /> Registrar venda
          </Btn>
        </>
      }
    >
      <Input
        label="Cliente *"
        value={form.cliente}
        onChange={setField("cliente")}
        placeholder="Nome do cliente ou empresa"
      />

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Input label="Data" type="date" value={form.data} onChange={setField("data")} />
        <Select label="Status" value={form.status} onChange={setField("status")}>
          <option>Pendente</option>
          <option>Concluída</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <Select label="Forma de pagamento" value={form.pagamento} onChange={setField("pagamento")}>
          {FORMAS_PAGAMENTO.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Select label="Frete" value={form.frete} onChange={setField("frete")}>
          {FORMAS_FRETE.map((f) => <option key={f}>{f}</option>)}
        </Select>
      </div>

      {/* ── Itens do pedido ───────────────────────────────── */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Itens do pedido</span>
          <Btn size="sm" onClick={addItem}><Plus size={12} /> Adicionar</Btn>
        </div>

        <div className="space-y-2">
          {itens.map((item, i) => {
            const peca = pecas.find((p) => p.id === Number(item.pecaId));
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <select
                  className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-emerald-500"
                  value={item.pecaId}
                  onChange={(e) => setItemVal(i, "pecaId", e.target.value)}
                >
                  {pecas.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} — {p.estoque} un.</option>
                  ))}
                </select>

                <input
                  type="number" min="1" value={item.qty}
                  onChange={(e) => setItemVal(i, "qty", e.target.value)}
                  className="w-16 text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-emerald-500"
                />

                <span className="text-xs text-gray-500 whitespace-nowrap w-24 text-right">
                  {peca ? fmtBRL(peca.preco * (Number(item.qty) || 0)) : "—"}
                </span>

                <button onClick={() => remItem(i)} className="text-gray-300 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="text-right mt-2 text-sm font-semibold text-gray-800">
          Total: {fmtBRL(total)}
        </div>
      </div>

      {/* ── Nota fiscal ───────────────────────────────────── */}
      <div className="mt-4">
        <label className="text-xs font-medium text-gray-500 block mb-2">Nota fiscal</label>
        <Input
          label="Número / referência"
          value={form.nfNum}
          onChange={setField("nfNum")}
          placeholder="Ex: NF00456"
        />
        <label className="mt-2 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all">
          <FileUp size={20} className="text-gray-400 mb-1" />
          <span className="text-xs text-gray-500">
            {form.nfFile ? form.nfFile.name : "Clique para anexar PDF ou XML da NF"}
          </span>
          <input
            type="file" accept=".pdf,.xml" className="hidden"
            onChange={(e) => setForm((f) => ({ ...f, nfFile: e.target.files[0] || null }))}
          />
        </label>
      </div>
    </Modal>
  );
}

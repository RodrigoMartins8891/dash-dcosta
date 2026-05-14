"use client";
import { useState } from "react";
import { Check, FileText, FileUp } from "lucide-react";
import { Modal, Btn, Badge, Input } from "../ui";
import { totalVenda, fmtBRL, fmtData } from "../../utils";

// ─── ModalDetalhes ─────────────────────────────────────────────────────────────
/**
 * Exibe os detalhes completos de uma venda (somente leitura).
 */
export function ModalDetalhes({ venda, pecas, onClose }) {
  const total = totalVenda(venda);

  return (
    <Modal
      title={`Pedido #${venda.id}`}
      wide
      onClose={onClose}
      footer={<Btn onClick={onClose}>Fechar</Btn>}
    >
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input label="Cliente"   value={venda.cliente}       readOnly />
        <Input label="Data"      value={fmtData(venda.data)} readOnly />
        <Input label="Pagamento" value={venda.pagamento}     readOnly />
        <Input label="Frete"     value={venda.frete}         readOnly />
      </div>

      <div className="mb-3">
        <Badge variant={venda.status === "Concluída" ? "green" : "amber"}>
          {venda.status}
        </Badge>
      </div>

      <table className="w-full text-sm border border-gray-100 rounded-xl overflow-hidden">
        <thead>
          <tr className="bg-gray-50 text-xs text-gray-500">
            <th className="text-left  px-3 py-2">Peça</th>
            <th className="text-center px-3 py-2">Qtd</th>
            <th className="text-right  px-3 py-2">Unit.</th>
            <th className="text-right  px-3 py-2">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {venda.itens.map((item, i) => {
            const peca = pecas.find((p) => p.id === item.pecaId);
            return (
              <tr key={i} className="border-t border-gray-100">
                <td className="px-3 py-2 text-gray-800">{peca ? peca.nome : "Peça removida"}</td>
                <td className="px-3 py-2 text-center text-gray-600">{item.qty}</td>
                <td className="px-3 py-2 text-right  text-gray-600">{fmtBRL(item.preco)}</td>
                <td className="px-3 py-2 text-right  font-medium">{fmtBRL(item.qty * item.preco)}</td>
              </tr>
            );
          })}
          <tr className="border-t border-gray-200 bg-gray-50">
            <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-gray-700">Total</td>
            <td className="px-3 py-2 text-right text-sm font-bold text-emerald-700">{fmtBRL(total)}</td>
          </tr>
        </tbody>
      </table>

      <div className="mt-3">
        <span className="text-xs font-medium text-gray-500">Nota fiscal: </span>
        {venda.nf ? (
          <Badge variant="blue">
            <FileText size={10} className="mr-1" />
            {venda.nf}
          </Badge>
        ) : (
          <span className="text-xs text-gray-400">Não anexada</span>
        )}
      </div>
    </Modal>
  );
}

// ─── ModalNF ───────────────────────────────────────────────────────────────────
/**
 * Permite vincular ou substituir o número de nota fiscal de uma venda.
 */
export function ModalNF({ venda, onSave, onClose }) {
  const [num,  setNum]  = useState(venda.nf || "");
  const [file, setFile] = useState(null);

  return (
    <Modal
      title={`Nota fiscal — pedido #${venda.id}`}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={() => onSave(num.trim() || null)}>
            <Check size={13} /> Salvar
          </Btn>
        </>
      }
    >
      {venda.nf && (
        <div className="mb-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
          <FileText size={14} /> NF atual: <strong>{venda.nf}</strong>
        </div>
      )}

      <Input
        label="Número / referência da NF"
        value={num}
        onChange={(e) => setNum(e.target.value)}
        placeholder="Ex: NF00456"
      />

      <label className="mt-3 flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/40 transition-all">
        <FileUp size={22} className="text-gray-400 mb-2" />
        <span className="text-xs text-gray-500">
          {file ? file.name : "Clique para anexar PDF ou XML"}
        </span>
        <input
          type="file" accept=".pdf,.xml" className="hidden"
          onChange={(e) => setFile(e.target.files[0] || null)}
        />
      </label>
    </Modal>
  );
}

// ─── ModalAjuste ───────────────────────────────────────────────────────────────
/**
 * Permite ajustar manualmente o valor de estoque de uma peça.
 */
export function ModalAjuste({ peca, onSave, onClose }) {
  const [val, setVal] = useState(String(peca.estoque));

  return (
    <Modal
      title="Ajuste de estoque"
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={() => onSave(parseInt(val) || 0)}>
            <Check size={13} /> Confirmar
          </Btn>
        </>
      }
    >
      <p className="text-sm text-gray-500 mb-3">
        {peca.nome} — estoque atual: <strong>{peca.estoque}</strong>
      </p>
      <Input
        label="Novo valor de estoque"
        type="number" min="0"
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
    </Modal>
  );
}

"use client";

import { useState, useMemo } from "react";
import { Search, Download, Plus, Eye, FileUp, Trash2, FileText } from "lucide-react";
import { Btn, IconBtn, Badge, Select } from "../components/ui";
import { ModalNovaVenda }              from "../components/modals/ModalNovaVenda";
import { ModalDetalhes, ModalNF }      from "../components/modals/ModalVendaExtras";
import { totalVenda, fmtBRL, fmtData, exportCSV } from "../utils";

export default function ViewVendas({ vendas, pecas, onAdd, onUpdate, onDelete }) {
  const [busca,        setBusca]        = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modal,        setModal]        = useState(null);

  const lista = useMemo(
    () =>
      vendas.filter(
        (v) =>
          (!busca        || v.cliente.toLowerCase().includes(busca.toLowerCase())) &&
          (!filtroStatus || v.status === filtroStatus)
      ),
    [vendas, busca, filtroStatus]
  );

  async function registrarVenda(data) {
    try {
      await onAdd(data);
      setModal(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function salvarNF(id, nf) {
    try {
      await onUpdate(id, { nf });
      setModal(null);
    } catch (err) {
      alert(err.message);
    }
  }

  async function excluir(id) {
    if (!confirm("Excluir esta venda?")) return;
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
            placeholder="Buscar cliente..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <Select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos status</option>
          <option>Concluída</option>
          <option>Pendente</option>
        </Select>

        <div className="ml-auto flex gap-2">
          <Btn onClick={() => exportCSV(vendas, pecas)}><Download size={13} /> Exportar CSV</Btn>
          <Btn variant="primary" onClick={() => setModal({ type: "nova" })}><Plus size={13} /> Nova venda</Btn>
        </div>
      </div>

      {/* ── Tabela ────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500">
                <th className="text-left   px-4 py-3">#</th>
                <th className="text-left   px-4 py-3">Cliente</th>
                <th className="text-left   px-4 py-3">Data</th>
                <th className="text-left   px-4 py-3">Pagamento</th>
                <th className="text-left   px-4 py-3">Frete</th>
                <th className="text-center px-4 py-3">Itens</th>
                <th className="text-right  px-4 py-3">Total</th>
                <th className="text-center px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">NF</th>
                <th className="text-center px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length > 0 ? (
                lista.map((v) => (
                  <tr key={v.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{v.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{v.cliente}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{fmtData(v.data)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{v.pagamento}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{v.frete}</td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{v.itens.length}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmtBRL(totalVenda(v))}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={v.status === "Concluída" ? "green" : "amber"}>{v.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {v.nf ? (
                        <Badge variant="blue"><FileText size={10} className="mr-1" />{v.nf}</Badge>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <IconBtn title="Ver detalhes" onClick={() => setModal({ type: "detalhes", data: v })}>
                          <Eye size={13} />
                        </IconBtn>
                        <IconBtn title="Nota fiscal" onClick={() => setModal({ type: "nf", data: v })}>
                          <FileUp size={13} />
                        </IconBtn>
                        <IconBtn title="Excluir" danger onClick={() => excluir(v.id)}>
                          <Trash2 size={13} />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-sm text-gray-400">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modais ────────────────────────────────────────── */}
      {modal?.type === "nova"     && (
        <ModalNovaVenda pecas={pecas} onSave={registrarVenda} onClose={() => setModal(null)} />
      )}
      {modal?.type === "detalhes" && (
        <ModalDetalhes venda={modal.data} pecas={pecas} onClose={() => setModal(null)} />
      )}
      {modal?.type === "nf"       && (
        <ModalNF
          venda={modal.data}
          onSave={(nf) => salvarNF(modal.data.id, nf)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Truck, Package, MapPin } from "lucide-react";
import { Modal, Btn, Input, Select } from "../ui";

const STATUS_ENVIO = [
  "Aguardando",
  "Separando",
  "Enviado",
  "Entregue",
  "Devolvido",
];

const STATUS_ICONS = {
  "Aguardando": { icon: "⏳", color: "bg-gray-100 text-gray-600" },
  "Separando":  { icon: "📦", color: "bg-blue-100 text-blue-600" },
  "Enviado":    { icon: "🚚", color: "bg-amber-100 text-amber-600" },
  "Entregue":   { icon: "✅", color: "bg-emerald-100 text-emerald-600" },
  "Devolvido":  { icon: "↩️", color: "bg-red-100 text-red-600" },
};

export function ModalRastreio({ venda, onSave, onClose }) {
  const [rastreio,    setRastreio]    = useState(venda.codigo_rastreio || "");
  const [statusEnvio, setStatusEnvio] = useState(venda.status_envio   || "Aguardando");
  const [loading,     setLoading]     = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await onSave({ codigo_rastreio: rastreio.trim() || null, status_envio: statusEnvio });
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      title={`Rastreio — Pedido #${venda.id}`}
      onClose={onClose}
      footer={
        <>
          <Btn onClick={onClose}>Cancelar</Btn>
          <Btn variant="primary" onClick={handleSave} disabled={loading}>
            <Check size={13} /> Salvar e notificar cliente
          </Btn>
        </>
      }
    >
      {/* Info do pedido */}
      <div className="mb-4 p-3 bg-gray-50 rounded-xl text-sm">
        <p className="font-medium text-gray-800">{venda.cliente}</p>
        <p className="text-xs text-gray-400 mt-0.5">Frete: {venda.frete}</p>
      </div>

      {/* Status do envio */}
      <div className="mb-4">
        <label className="text-xs font-medium text-gray-500 block mb-2">Status do envio</label>
        <div className="grid grid-cols-5 gap-2">
          {STATUS_ENVIO.map((s) => {
            const info    = STATUS_ICONS[s];
            const ativo   = statusEnvio === s;
            return (
              <button
                key={s}
                onClick={() => setStatusEnvio(s)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs font-medium
                  ${ativo ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 hover:border-gray-300 text-gray-500"}`}
              >
                <span className="text-lg">{info.icon}</span>
                <span className="leading-tight text-center">{s}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Código de rastreio */}
      <Input
        label="Código de rastreio"
        value={rastreio}
        onChange={(e) => setRastreio(e.target.value)}
        placeholder="Ex: BR123456789BR"
      />

      {rastreio && (
        <div className="mt-3 p-3 bg-blue-50 rounded-xl flex items-center gap-2">
          <Truck size={16} className="text-blue-500" />
          <div>
            <p className="text-xs font-medium text-blue-700">Código: {rastreio}</p>
            <p className="text-xs text-blue-500">O cliente receberá este código por email</p>
          </div>
        </div>
      )}
    </Modal>
  );
}

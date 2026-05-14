"use client";
import { X } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Badge ─────────────────────────────────────────────────────────────────────
const BADGE_STYLES = {
  green: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100  text-amber-800",
  red:   "bg-red-100    text-red-800",
  blue:  "bg-blue-100   text-blue-800",
  gray:  "bg-gray-100   text-gray-700",
};

export function Badge({ children, variant = "gray" }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[variant]}`}>
      {children}
    </span>
  );
}

// ─── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCard({ label, value, sub, trend, icon: Icon }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={14} className="text-gray-400" />}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      {sub && (
        <div
          className={`text-xs mt-1 flex items-center gap-1 ${
            trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-gray-400"
          }`}
        >
          {trend === "up"   && <TrendingUp   size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── StockBar ──────────────────────────────────────────────────────────────────
export function StockBar({ value, max }) {
  const pct   = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
  const color = value === 0
    ? "bg-red-400"
    : value <= max * 0.5
    ? "bg-amber-400"
    : "bg-emerald-400";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-sm font-medium w-8 text-right ${
          value === 0 ? "text-red-500" : value <= max * 0.5 ? "text-amber-600" : "text-gray-700"
        }`}
      >
        {value}
      </span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ title, children, footer, onClose, wide = false }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-2xl border border-gray-200 flex flex-col ${wide ? "w-full max-w-2xl" : "w-full max-w-lg"}`}
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={16} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Btn ───────────────────────────────────────────────────────────────────────
const BTN_SIZES    = { sm: "px-2.5 py-1.5 text-xs", md: "px-3 py-2 text-sm" };
const BTN_VARIANTS = {
  default: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50",
  primary: "bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700",
  danger:  "bg-red-600   text-white border border-red-700   hover:bg-red-700",
  ghost:   "text-gray-500 hover:bg-gray-100 hover:text-gray-800 border border-transparent",
};

export function Btn({ onClick, children, variant = "default", disabled = false, size = "md" }) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${BTN_SIZES[size]} ${BTN_VARIANTS[variant]}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

// ─── IconBtn ───────────────────────────────────────────────────────────────────
export function IconBtn({ onClick, children, danger = false, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border text-gray-400 transition-all
        ${danger
          ? "hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          : "hover:bg-gray-100 hover:text-gray-700 border-gray-200"
        }`}
    >
      {children}
    </button>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500">{label}</label>}
      <input
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 w-full"
        {...props}
      />
    </div>
  );
}

// ─── Select ────────────────────────────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-500">{label}</label>}
      <select
        className="text-sm border border-gray-200 rounded-lg px-2.5 py-2 bg-white text-gray-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 w-full"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

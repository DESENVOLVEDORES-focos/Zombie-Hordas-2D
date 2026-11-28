import type { ReactNode } from "react";
import { audio } from "../game/audio/AudioEngine";

export const click = () => audio.play("ui_click");

export function MenuButton({
  children,
  onClick,
  variant,
  sub,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "danger";
  sub?: string;
  disabled?: boolean;
}) {
  return (
    <button
      className={`menu-btn ${variant ?? ""}`}
      disabled={disabled}
      onClick={() => {
        click();
        onClick();
      }}
    >
      <span>{children}</span>
      {sub && <span className="text-[0.62rem] font-normal tracking-widest text-white/45 normal-case">{sub}</span>}
    </button>
  );
}

export function Btn({
  children,
  onClick,
  variant,
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      className={`btn ${variant === "primary" ? "btn-primary" : variant === "danger" ? "btn-danger" : ""} ${className}`}
      disabled={disabled}
      onClick={() => {
        click();
        onClick();
      }}
    >
      {children}
    </button>
  );
}

export function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-white/10 pb-3">
      <div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-[0.18em] text-white title-glow">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
      </div>
      {onBack && <Btn onClick={onBack}>← Voltar</Btn>}
    </div>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  onRelease,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  onRelease?: () => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="font-mono text-toxic">{format(value)}</span>
      </div>
      <input
        type="range"
        className="w-full"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerUp={onRelease}
        onKeyUp={onRelease}
      />
    </label>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => {
            click();
            onChange(o.id);
          }}
          className={`rounded border px-3 py-2 text-left transition ${
            value === o.id ? "border-toxic bg-toxic/15 text-white" : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
          }`}
        >
          <div className="font-display text-sm font-bold uppercase tracking-wider">{o.label}</div>
          {o.sub && <div className="text-[0.7rem] text-white/45">{o.sub}</div>}
        </button>
      ))}
    </div>
  );
}

export function ThreatDots({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-1" title={`Ameaça ${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`h-2 w-2 rounded-full ${i < n ? "bg-blood shadow-[0_0_6px_#c0392b]" : "bg-white/15"}`} />
      ))}
    </span>
  );
}

export const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

import type { SidebarStatusPanelConfig, StatusInsightItem } from '../types/patterns';

function severityColor(severity: StatusInsightItem['severity']): string {
  switch (severity) {
    case 'success':
      return '#2E4C3B';
    case 'warning':
      return '#8B7355';
    case 'critical':
      return '#C64928';
    default:
      return '#4A6FA5';
  }
}

function SeverityIcon({ severity }: { severity: StatusInsightItem['severity'] }) {
  const color = severityColor(severity);

  if (severity === 'success') {
    return <CheckCircle2 size={12} style={{ color }} />;
  }
  if (severity === 'warning') {
    return <AlertTriangle size={12} style={{ color }} />;
  }
  if (severity === 'critical') {
    return <ShieldAlert size={12} style={{ color }} />;
  }
  return <Info size={12} style={{ color }} />;
}

interface SystemStatusPanelProps {
  config: SidebarStatusPanelConfig;
}

export function SystemStatusPanel({ config }: SystemStatusPanelProps) {
  return (
    <div className="rounded-2xl bg-white/60 border border-white/40 p-3"
      style={{
        backdropFilter: 'blur(24px) saturate(150%)',
        WebkitBackdropFilter: 'blur(24px) saturate(150%)',
      }}
    >
      <div className="mb-2">
        <p
          className="text-[10px] tracking-[0.1em] uppercase text-[#1A1A1A]"
          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
        >
          {config.title}
        </p>
        {config.subtitle && (
          <p
            className="text-[11px] text-[#717182] mt-0.5"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
          >
            {config.subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {config.items.map((item) => (
          <div
            key={item.id}
            title={item.tooltip}
            className="rounded-xl border border-black/5 bg-white/50 px-2.5 py-2"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                <SeverityIcon severity={item.severity} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-[11px] text-[#1A1A1A] leading-[1.4]"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
                >
                  {item.message}
                </p>
                <p
                  className="text-[10px] text-[#717182] mt-1"
                  style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                >
                  {item.source} • {item.updatedAt}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

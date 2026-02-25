import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, X } from 'lucide-react';

import type { ActionComposerItem } from '../../types/patterns';

interface ActionComposerModalProps {
  open: boolean;
  title: string;
  description: string;
  items: ActionComposerItem[];
  onClose: () => void;
  onSelect: (item: ActionComposerItem) => void;
}

export function ActionComposerModal({
  open,
  title,
  description,
  items,
  onClose,
  onSelect,
}: ActionComposerModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center p-6"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-xl rounded-[30px] border border-white/40 bg-white/85 p-7 shadow-[0_28px_56px_-18px_rgba(0,0,0,0.2)]"
            style={{
              backdropFilter: 'blur(24px) saturate(150%)',
              WebkitBackdropFilter: 'blur(24px) saturate(150%)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 rounded-full p-2 text-[#717182] hover:bg-black/5"
              aria-label="Fechar modal de ações"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <p
                className="text-[10px] tracking-[0.12em] uppercase text-[#C64928]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
              >
                Action Composer
              </p>
              <h2
                className="mt-1 text-[#1A1A1A]"
                style={{ fontFamily: "'Playfair Display', serif", fontSize: '30px', fontWeight: 600, lineHeight: 1.1 }}
              >
                {title}
              </h2>
              <p
                className="mt-2 text-[13px] text-[#717182]"
                style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.6 }}
              >
                {description}
              </p>
            </div>

            <div className="grid gap-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className="group rounded-2xl border border-white/50 bg-white/65 px-4 py-3 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_20px_40px_-20px_rgba(198,73,40,0.45)]"
                  style={{
                    backdropFilter: 'blur(24px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#C64928]/10 p-1.5 text-[#C64928] group-hover:bg-[#C64928]/15">
                      <Plus size={13} />
                    </div>
                    <div>
                      <p
                        className="text-[14px] text-[#1A1A1A]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="mt-0.5 text-[12px] text-[#717182]"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, lineHeight: 1.5 }}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

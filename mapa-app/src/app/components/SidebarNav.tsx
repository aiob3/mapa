import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronLeft, ChevronRight, type LucideIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

import { isPathActive } from '../navigation/moduleNavigation';
import type { SidebarStatusPanelConfig } from '../types/patterns';
import { SystemStatusPanel } from './SystemStatusPanel';

interface SidebarNavProps {
  brand: string;
  brandSub: string;
  items: SidebarNavItem[];
  statusPanel?: SidebarStatusPanelConfig;
  bottomContent?: React.ReactNode;
}

export interface SidebarNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  subLabel?: string;
  exact?: boolean;
}

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isItemActive(pathname: string, item: SidebarNavItem): boolean {
  const normalizedPathname = normalizePath(pathname);
  const normalizedItemPath = normalizePath(item.path);

  if (item.exact) {
    return normalizedPathname === normalizedItemPath;
  }
  return isPathActive(normalizedPathname, normalizedItemPath);
}

export function SidebarNav({ brand, brandSub, items, statusPanel, bottomContent }: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 84 : 252 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-full min-h-0 flex flex-col bg-white/70 border-r border-white/40 relative"
      style={{ backdropFilter: "blur(24px) saturate(150%)", WebkitBackdropFilter: "blur(24px) saturate(150%)" }}
    >
      {/* Collapse/Expand Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-8 w-7 h-7 rounded-full bg-[#C64928] flex items-center justify-center hover:scale-110 hover:bg-[#E07B5B] transition-all z-50 shadow-lg"
        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
      >
        {isCollapsed ? (
          <ChevronRight size={16} className="text-white" />
        ) : (
          <ChevronLeft size={16} className="text-white" />
        )}
      </button>

      {/* Padding wrapper */}
      <div className="p-6 flex flex-col h-full min-h-0 overflow-hidden">
        {/* Section Title */}
        <div className="mb-7 overflow-hidden">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 700 }} className="text-[#1A1A1A] leading-tight whitespace-nowrap">
                  {brand}
                </div>
                <div className="text-[10px] text-[#C64928] tracking-[0.1em] uppercase whitespace-nowrap" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
                  {brandSub}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 flex-1 min-h-0 overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(location.pathname, item);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 rounded-2xl text-left transition-all duration-200 relative ${
                  isActive
                    ? "bg-white/65 border border-white/40 text-[#1A1A1A] shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)]"
                    : "text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-white/20 border border-transparent"
                } ${isCollapsed ? "justify-center px-3 py-3" : "px-4 py-3"}`}
                style={isActive ? {
                  backdropFilter: "blur(24px) saturate(150%)",
                  WebkitBackdropFilter: "blur(24px) saturate(150%)",
                  transform: "scale(1.02)",
                } : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon 
                  size={18} 
                  className={`${isActive ? "text-[#C64928]" : ""} ${isCollapsed ? "shrink-0" : ""}`} 
                />
                
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between flex-1 overflow-hidden"
                  >
                    <div className="min-w-0">
                      <span
                        className="text-[13px] whitespace-nowrap"
                        style={{ fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 500 }}
                      >
                        {item.label}
                      </span>
                      {item.subLabel && (
                        <p
                          className="text-[10px] whitespace-nowrap text-[#717182]"
                          style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400 }}
                        >
                          {item.subLabel}
                        </p>
                      )}
                    </div>
                    {isActive && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-1.5 h-1.5 rounded-full bg-[#C64928] ml-auto"
                      />
                    )}
                  </motion.div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Content */}
        {(statusPanel || bottomContent) && (
          <div className="mt-auto pt-6 border-t border-black/5 overflow-hidden shrink-0">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  key={statusPanel ? 'status-panel' : 'bottom-content'}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {statusPanel ? <SystemStatusPanel config={statusPanel} /> : bottomContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

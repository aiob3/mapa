import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { LucideIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface SidebarNavProps {
  brand: string;
  brandSub: string;
  items: { label: string; path: string; icon: LucideIcon }[];
  bottomContent?: React.ReactNode;
}

export function SidebarNav({ brand, brandSub, items, bottomContent }: SidebarNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 220 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="min-h-screen flex flex-col bg-white/70 border-r border-white/40 relative"
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
      <div className="p-6 flex flex-col h-full overflow-hidden">
        {/* Section Title */}
        <div className="mb-8 overflow-hidden">
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
        <nav className="flex flex-col gap-1 flex-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
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
                    <span
                      className="text-[14px] whitespace-nowrap"
                      style={{ fontFamily: "'Inter', sans-serif", fontWeight: isActive ? 600 : 400 }}
                    >
                      {item.label}
                    </span>
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
        {bottomContent && (
          <div className="mt-auto pt-6 border-t border-black/5 overflow-hidden">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {bottomContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Click area when collapsed to expand */}
      {isCollapsed && (
        <div
          onClick={toggleSidebar}
          className="absolute inset-0 cursor-pointer z-10"
          aria-label="Expandir menu lateral"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              toggleSidebar();
            }
          }}
        />
      )}
    </motion.aside>
  );
}
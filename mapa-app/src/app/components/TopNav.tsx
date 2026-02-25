import React from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Bell, User } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { isPathActive, MODULE_NAVIGATION } from '../navigation/moduleNavigation';

interface TopNavProps {
  brand: string;
  brandSub?: string;
  version?: string;
  lang?: 'PT' | 'EN';
  onLangToggle?: () => void;
}

function isModuleActive(
  currentPathname: string,
  moduleId: string,
  modulePath: string,
  bridgeVisible: boolean,
): boolean {
  if (moduleId === 'team-hub') {
    if (bridgeVisible) {
      return isPathActive(currentPathname, '/team') && !isPathActive(currentPathname, '/team/overview');
    }
    return isPathActive(currentPathname, '/team');
  }
  if (moduleId === 'the-bridge') {
    return isPathActive(currentPathname, '/team/overview');
  }
  return isPathActive(currentPathname, modulePath);
}

export function TopNav({ brand, brandSub, version, lang = 'PT', onLangToggle }: TopNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { allowedModules, canAccess, session, signOut } = useAuth();

  const visibleModules = MODULE_NAVIGATION.filter(
    (module) => allowedModules.includes(module.module) && canAccess(module.module, "read"),
  );

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white/60 border-b border-white/40"
      style={{ backdropFilter: 'blur(24px) saturate(150%)', WebkitBackdropFilter: 'blur(24px) saturate(150%)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C64928] to-[#E07B5B] flex items-center justify-center">
            <span className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontSize: '14px', fontWeight: 700 }}>M</span>
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 700 }} className="text-[#1A1A1A]">
            {brand}
          </span>
          {brandSub && (
            <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', fontWeight: 400, fontStyle: 'italic' }} className="text-[#1A1A1A]">
              {brandSub}
            </span>
          )}
        </div>
        {version && (
          <span className="px-2 py-0.5 text-[11px] rounded-full bg-[#C64928]/10 text-[#C64928]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
            {version}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {visibleModules.map((module) => {
          const isActive = isModuleActive(
            location.pathname,
            module.id,
            module.path,
            visibleModules.some((visibleModule) => visibleModule.id === 'the-bridge'),
          );
          return (
            <button
              key={module.path}
              onClick={() => navigate(module.path)}
              className={`px-4 py-2 rounded-full text-[13px] transition-all duration-200 ${
                isActive
                  ? "bg-[#1A1A1A] text-white"
                  : "text-[#717182] hover:text-[#1A1A1A] hover:bg-black/5"
              }`}
              style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, letterSpacing: '0.02em' }}
            >
              {module.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        {session && (
          <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#2E4C3B]/10 text-[#2E4C3B]" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
            {session.role === 'administrator' ? 'ADMINISTRADOR' : 'CONVIDADO'}
          </span>
        )}
        <div className="flex items-center gap-1 bg-black/5 rounded-full px-1 py-0.5">
          <button
            onClick={onLangToggle}
            className={`px-3 py-1 rounded-full text-[12px] transition-all ${
              lang === 'PT' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#717182]'
            }`}
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
          >
            PT
          </button>
          <button
            onClick={onLangToggle}
            className={`px-3 py-1 rounded-full text-[12px] transition-all ${
              lang === 'EN' ? 'bg-white text-[#1A1A1A] shadow-sm' : 'text-[#717182]'
            }`}
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
          >
            EN
          </button>
        </div>
        <button className="relative p-2 rounded-full hover:bg-black/5 transition-colors">
          <Bell size={18} className="text-[#1A1A1A]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#C64928] rounded-full" />
        </button>
        <button
          className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C64928] to-[#E07B5B] flex items-center justify-center"
          onClick={() => {
            signOut();
            navigate('/', { replace: true });
          }}
          title="Encerrar sessão"
          aria-label="Encerrar sessão"
        >
          <User size={16} className="text-white" />
        </button>
      </div>
    </nav>
  );
}

import {
  BarChart3,
  Eye,
  FileText,
  LayoutDashboard,
  Phone,
  PieChart,
  Settings,
  Target,
  Users,
} from 'lucide-react';

import type { SidebarNavItem } from '../components/SidebarNav';

export const TEAM_SIDEBAR_ITEMS: SidebarNavItem[] = [
  { label: 'Visão Geral', subLabel: 'Bridge integrado', path: '/team/overview', icon: Eye, exact: true },
  { label: 'Consultores', subLabel: 'People ops', path: '/team', icon: Users, exact: true },
  { label: 'Desafios', subLabel: 'Pipeline de execução', path: '/team/challenges', icon: Target, exact: true },
  { label: 'Performance', subLabel: 'Leitura de capacidade', path: '/team/performance', icon: BarChart3, exact: true },
  { label: 'Configurações', subLabel: 'Governança do módulo', path: '/team/settings', icon: Settings, exact: true },
];

export const SYNAPSE_SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    label: 'Dashboard',
    subLabel: 'Ir para MAPA Syn',
    path: '/syn',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Painel Synapse',
    subLabel: 'Análise de Outreach',
    path: '/analytics',
    icon: BarChart3,
    exact: true,
  },
  {
    label: 'Scripts IA',
    subLabel: 'Biblioteca de cadências',
    path: '/analytics/scripts',
    icon: FileText,
    exact: true,
  },
  {
    label: 'Leads',
    subLabel: 'Engajamento e tom',
    path: '/analytics/leads',
    icon: Users,
    exact: true,
  },
  {
    label: 'Configurações',
    subLabel: 'Ajustes do módulo',
    path: '/analytics/settings',
    icon: Settings,
    exact: true,
  },
];

export const MAPA_SYN_SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    label: 'Leads & Insights',
    subLabel: 'Call Intelligence Hub',
    path: '/syn',
    icon: Phone,
    exact: true,
  },
  {
    label: 'MAPA Syn',
    subLabel: 'Strategic Heatmap',
    path: '/syn/heatmap',
    icon: BarChart3,
    exact: true,
  },
  {
    label: 'Análise Setorial',
    subLabel: 'Sector Performance',
    path: '/syn/sector',
    icon: PieChart,
    exact: true,
  },
];

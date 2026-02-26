import {
  BarChart3,
  Eye,
  LayoutDashboard,
  Phone,
  PieChart,
  PlusSquare,
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

export const MAPA_SYN_SIDEBAR_ITEMS: SidebarNavItem[] = [
  {
    label: 'Leads & Insights',
    subLabel: 'Call Intelligence Hub',
    path: '/syn',
    icon: Phone,
    exact: true,
  },
  {
    label: 'Outreach IA',
    subLabel: 'Recursos absorvidos do Synapse',
    path: '/syn/outreach',
    icon: LayoutDashboard,
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
  {
    label: 'Composer',
    subLabel: 'Composição avançada',
    path: '/syn/composer',
    icon: PlusSquare,
    exact: true,
  },
];

import { lazy, type ReactElement } from 'react';
import { AdminTeamPage } from '../../modules/admin/pages/AdminTeamPage';
import { AdminBranchesPage } from '../../modules/admin/pages/AdminBranchesPage';
import { AdminWhatsAppPage } from '../../modules/admin/pages/AdminWhatsAppPage';
import { AdminReportsPage } from '../../modules/admin/pages/AdminReportsPage';
import { AdminServicesPage } from '../../modules/admin/presentation/pages/AdminServicesPage';
import { StaffDashboardPage } from '../../modules/staff/presentation/pages/StaffDashboardPage';
import { ModulePlaceholder } from '../components/ModulePlaceholder';
import type { AppModule } from '../types/appModules';

const AdminAgendaPage = lazy(() => import('../../modules/admin/pages/AdminAgendaPage').then((m) => ({ default: m.AdminAgendaPage })));
const AdminInventoryPage = lazy(() => import('../../modules/admin/pages/AdminInventoryPage').then((m) => ({ default: m.AdminInventoryPage })));
const AdminPOSPage = lazy(() => import('../../modules/admin/pages/AdminPOSPage').then((m) => ({ default: m.AdminPOSPage })));
const AdminTablesPage = lazy(() => import('../../modules/admin/pages/AdminTablesPage').then((m) => ({ default: m.AdminTablesPage })));
const AdminKitchenPage = lazy(() => import('../../modules/admin/pages/AdminKitchenPage').then((m) => ({ default: m.AdminKitchenPage })));

export type ModuleKey = Extract<
  AppModule,
  'agenda' | 'staff' | 'inventory' | 'pos' | 'tables' | 'kitchen_display' | 'commissions' | 'digital_menu' | 'services'
> | 'branches' | 'whatsapp' | 'reports';

export type ModuleRegistryEntry = {
  key: ModuleKey;
  label: string;
  adminPath?: string;
  adminElement?: ReactElement;
  staffPath?: string;
  staffElement?: ReactElement;
  staffLabel?: string;
};

export const moduleRegistry: Record<ModuleKey, ModuleRegistryEntry> = {
  agenda: {
    key: 'agenda',
    label: 'Agenda viva',
    adminPath: '/admin/agenda',
    adminElement: <AdminAgendaPage />
  },
  staff: {
    key: 'staff',
    label: 'Equipo',
    adminPath: '/admin/team',
    adminElement: <AdminTeamPage />,
    staffPath: '/staff/dashboard',
    staffElement: <StaffDashboardPage />,
    staffLabel: 'Staff'
  },
  branches: {
    key: 'branches',
    label: 'Sedes',
    adminPath: '/admin/branches',
    adminElement: <AdminBranchesPage />
  },
  whatsapp: {
    key: 'whatsapp',
    label: 'WhatsApp',
    adminPath: '/admin/whatsapp',
    adminElement: <AdminWhatsAppPage />
  },
  inventory: {
    key: 'inventory',
    label: 'Inventario',
    adminPath: '/admin/inventory',
    adminElement: <AdminInventoryPage />
  },
  reports: {
    key: 'reports',
    label: 'Cierre diario',
    adminPath: '/admin/reports',
    adminElement: <AdminReportsPage />
  },
  services: {
    key: 'services',
    label: 'Servicios',
    adminPath: '/admin/services',
    adminElement: <AdminServicesPage />
  },
  pos: {
    key: 'pos',
    label: 'POS',
    adminPath: '/admin/pos',
    adminElement: <AdminPOSPage />
  },
  tables: {
    key: 'tables',
    label: 'Mesas',
    adminPath: '/admin/tables',
    adminElement: <AdminTablesPage />
  },
  kitchen_display: {
    key: 'kitchen_display',
    label: 'Cocina',
    adminPath: '/admin/tables/kitchen',
    adminElement: <AdminKitchenPage />
  },
  digital_menu: {
    key: 'digital_menu',
    label: 'Menu digital',
    adminPath: '/admin/digital-menu',
    adminElement: (
      <ModulePlaceholder
        title="Menu digital"
        description="Catalogo interactivo para clientes y QR en mesas."
      />
    )
  },
  commissions: {
    key: 'commissions',
    label: 'Comisiones',
    adminPath: '/admin/commissions',
    adminElement: (
      <ModulePlaceholder
        title="Comisiones"
        description="Panel para incentivos, metas y liquidacion del equipo."
      />
    )
  }
};

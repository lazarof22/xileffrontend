// src/components/DashboardLayout.tsx
import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Box, Collapse
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DatasetIcon from '@mui/icons-material/Dataset';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FactoryIcon from '@mui/icons-material/Factory';
import FeedIcon from '@mui/icons-material/Feed';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import Groups2Icon from '@mui/icons-material/Groups2';
import StoreIcon from '@mui/icons-material/Store';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BuildIcon from '@mui/icons-material/Build';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import GroupsIcon from '@mui/icons-material/Groups';
import VillaIcon from '@mui/icons-material/Villa';
import AccountMenu from './AccountMenuButton';
import React from 'react';

const drawerWidth = 300;
const collapsedWidth = 72;

const menuItems = [
  { text: 'Modulos Principales', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Contabilidad y Finanzas', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Nomina y Recursos Humanos', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Produccion y Logistica', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Clientes y Proveedores', icon: <DashboardIcon />, path: '/dashboard' },
];

const modulosPrincipales = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario' },
  { text: 'Ventas', icon: <MonetizationOnIcon />, path: '/ventas' },
  { text: 'Compras', icon: <ShoppingCartIcon />, path: '/compras' },
  { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/punto_venta' },
];

const contablilidadFinanzas = [
  { text: 'Contabilidad', icon: <AccountBalanceIcon />, path: '/contabilidad' },
  { text: 'Activos', icon: <DatasetIcon />, path: '/activos_fijos' },
  { text: 'Costos', icon: <AttachMoneyIcon />, path: '/costos' },
  { text: 'finanzas', icon: <CreditCardIcon />, path: '/finanzas' },
];

const nominaRecursosHumanos = [
  { text: 'Nomina', icon: <PeopleAltIcon />, path: '/nomina' },
];

const produccionLogistica = [
  { text: 'Produccion', icon: <FactoryIcon />, path: '/produccion' },
  { text: 'Planificacion', icon: <CalendarMonthIcon />, path: '/planificacion' },
];

const clientesProveedores = [
  { text: 'Clientes', icon: <Groups2Icon />, path: '/clientes' },
  { text: 'Proveedores', icon: <StoreIcon />, path: '/proveedores' },
];

const reportesAuditoria = [
  { text: 'Reportes', icon: <FeedIcon />, path: '/reportes' },
  { text: 'Auditoria', icon: <VerifiedUserIcon />, path: '/auditoria' },
];

const menuSections = [
  { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
  { text: 'Licencias', icon: <VpnKeyIcon />, path: '/licencias' },
];

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface SectionConfig {
  key: string;
  label: string;
  icon: React.ReactNode;
  items: MenuItem[];
}

const sections: SectionConfig[] = [
  { key: 'modulos', label: 'Modulos Principales', icon: <ViewModuleIcon />, items: modulosPrincipales },
  { key: 'contabilidad', label: 'Contabilidad y Finanzas', icon: <AssuredWorkloadIcon />, items: contablilidadFinanzas },
  { key: 'rrhh', label: 'Recursos Humanos', icon: <AssignmentIndIcon />, items: nominaRecursosHumanos },
  { key: 'produccion', label: 'Producción y Logística', icon: <VillaIcon />, items: produccionLogistica },
  { key: 'clientes', label: 'Clientes y Proveedores', icon: <GroupsIcon />, items: clientesProveedores },
  { key: 'reportes', label: 'Reportes y Auditoría', icon: <ContentPasteIcon />, items: reportesAuditoria },
  { key: 'config', label: 'Configuración', icon: <BuildIcon />, items: menuSections },
];

export default function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const drawerW = collapsed && !hovered ? collapsedWidth : drawerWidth;

  const handleSectionClick = (section: string) => {
    // Solo permitir expandir si el drawer no está colapsado
    if (!collapsed || hovered) {
      setOpenSection(prev => (prev === section ? null : section));
    }
  };

  const handleDrawerLeave = () => {
    setHovered(false);
    if (collapsed) {
      setOpenSection(null);
    }
  };

  const isCollapsed = collapsed && !hovered;

  const renderSection = (section: SectionConfig) => {
    const isOpen = openSection === section.key;

    return (
      <Box key={section.key}>
        <ListItemButton 
          onClick={() => handleSectionClick(section.key)}
          sx={{
            minHeight: 48,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            px: isCollapsed ? 2 : 3,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.08)',
            },
          }}
        >
          <ListItemIcon 
            sx={{ 
              color: 'white', 
              minWidth: 0,
              mr: isCollapsed ? 0 : 2,
              justifyContent: 'center',
              '& svg': { fontSize: '1.5rem' } // Iconos más grandes
            }}
          >
            {section.icon}
          </ListItemIcon>
          
          {/* TEXTO Y FLECHA - OCULTOS CUANDO COLAPSADO */}
          <Box sx={{ 
            display: isCollapsed ? 'none' : 'flex',
            alignItems: 'center',
            flex: 1,
            overflow: 'hidden'
          }}>
            <ListItemText 
              primary={section.label} 
              sx={{
                '& .MuiListItemText-primary': {
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }
              }}
            />
            {isOpen ? <ExpandLess sx={{ ml: 'auto', minWidth: 'auto' }} /> : <ExpandMore sx={{ ml: 'auto', minWidth: 'auto' }} />}
          </Box>
        </ListItemButton>
        
        {/* SUBMENÚ - OCULTO CUANDO COLAPSADO */}
        <Collapse in={isOpen && !isCollapsed} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {section.items.map((item) => {
              const active = pathname === item.path;

              return (
                <ListItemButton
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    minHeight: 40,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    pl: isCollapsed ? 2 : 6,
                    pr: 2,
                    background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                    borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: 'white',
                      minWidth: 0,
                      mr: isCollapsed ? 0 : 2,
                      justifyContent: 'center',
                      '& svg': { fontSize: '1.25rem' }
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{
                      display: isCollapsed ? 'none' : 'block',
                      opacity: isCollapsed ? 0 : 1,
                      '& .MuiListItemText-primary': {
                        fontSize: '0.8125rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {/* APPBAR */}
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ ml: 8, flexGrow: 1 }}>
            🚀 SISTEMA XILEF 🚀
          </Typography>
          <Typography sx={{ m: 2 }}>SISTEMA INTEGRAL ERP</Typography>
          <IconButton color="inherit" onClick={() => setCollapsed(!collapsed)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <AccountMenu />
        </Toolbar>
      </AppBar>

      {/* DRAWER DESKTOP */}
      <Drawer
        variant="permanent"
        open
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleDrawerLeave}
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerW,
            overflowX: 'hidden',
            transition: 'width 0.3s ease',
            whiteSpace: 'nowrap',
            backgroundColor: '#2c3e50', // Color oscuro consistente
            color: 'white',
            borderRight: 'none',
          },
        }}
      >
        {/* LOGO / ESPACIO SUPERIOR */}
        <Box sx={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          px: isCollapsed ? 0 : 3,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography sx={{ 
            fontSize: isCollapsed ? '1.5rem' : '1.25rem',
            fontWeight: 'bold'
          }}>
            {isCollapsed ? '🚀' : '🚀 XILEF'}
          </Typography>
        </Box>

        <List sx={{ pt: 1 }}>
          {sections.map(renderSection)}
        </List>
      </Drawer>

      {/* DRAWER MÓVIL */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', sm: 'none' } }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItemButton key={item.text} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {/* CONTENIDO */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pl: 9, // Ajuste dinámico del padding
          minHeight: '100vh',
          background: "white",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
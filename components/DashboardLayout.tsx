'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Box, Divider,
  Collapse
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
import Avatar from '@mui/material/Avatar';
import React from 'react';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BuildIcon from '@mui/icons-material/Build';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import GroupsIcon from '@mui/icons-material/Groups';
import VillaIcon from '@mui/icons-material/Villa';

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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const drawerW = collapsed && !hovered ? collapsedWidth : drawerWidth;

  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleSectionClick = (section: string) => {
    setOpenSection(prev => (prev === section ? null : section));
  };

  const handleDrawerLeave = () => {
    setHovered(false);

    // 👇 CERRAR TODO cuando se colapsa
    if (collapsed) {
      setOpenSection(null);
    }
  };


  return (
    <Box sx={{ display: 'flex' }}>
      {/* APPBAR */}
      <AppBar
        position="fixed"
      >
        <Toolbar>
          <Typography variant='h6' sx={{ ml: 8, flexGrow: 1 }}>🚀 SISTEMA XILEF 🚀</Typography>
          <Typography sx={{ m: 2, }}>SISTEMA INTEGRAL ERP</Typography>
          {/* Botón colapsar manual */}
          <IconButton color="inherit" onClick={() => setCollapsed(!collapsed)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Avatar sx={{ width: 33, height: 33 }} src="/broken-image.jpg" />
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
          },
        }}
      >
        <Typography
          sx={{
            m: 2,
          }}>
          🚀
        </Typography>


        <List>
          <ListItemButton onClick={() => handleSectionClick('modulos')}>
            <ListItemIcon>
              <ViewModuleIcon fontSize='large' sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Modulos Principales" />
            {openSection === 'modulos' ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSection === 'modulos'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {modulosPrincipales.map((item) => {
                const active = pathname === item.path;

                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                      opacity: collapsed && !hovered ? 0 : 1,
                      pl: 4,
                      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 0,
                        mr: collapsed && !hovered ? 'auto' : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {/* TEXTO SOLO SI NO ESTÁ MINI */}
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: collapsed && !hovered ? 0 : 1,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
          <ListItemButton onClick={() => handleSectionClick('contabilidad')}>
            <ListItemIcon>
              <AssuredWorkloadIcon fontSize='large' sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Contabilidad y Finanzas" />
            {openSection === 'contabilidad' ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSection === 'contabilidad'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {contablilidadFinanzas.map((item) => {
                const active = pathname === item.path;

                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                      opacity: collapsed && !hovered ? 0 : 1,
                      pl: 4,
                      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 0,
                        mr: collapsed && !hovered ? 'auto' : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {/* TEXTO SOLO SI NO ESTÁ MINI */}
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: collapsed && !hovered ? 0 : 1,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
          <ListItemButton onClick={() => handleSectionClick('rrhh')}>
            <ListItemIcon>
              <AssignmentIndIcon fontSize='large' sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Recursos Humanos" />
            {openSection === 'rrhh' ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSection === 'rrhh'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {nominaRecursosHumanos.map((item) => {
                const active = pathname === item.path;

                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                      opacity: collapsed && !hovered ? 0 : 1,
                      pl: 4,
                      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 0,
                        mr: collapsed && !hovered ? 'auto' : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {/* TEXTO SOLO SI NO ESTÁ MINI */}
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: collapsed && !hovered ? 0 : 1,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
          <ListItemButton onClick={() => handleSectionClick('produccion')}>
            <ListItemIcon>
              <VillaIcon fontSize='large' sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Producción y Logística" />
            {openSection === 'produccion' ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSection === 'produccion'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {produccionLogistica.map((item) => {
                const active = pathname === item.path;

                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                      opacity: collapsed && !hovered ? 0 : 1,
                      pl: 4,
                      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 0,
                        mr: collapsed && !hovered ? 'auto' : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {/* TEXTO SOLO SI NO ESTÁ MINI */}
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: collapsed && !hovered ? 0 : 1,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
          <ListItemButton onClick={() => handleSectionClick('clientes')}>
            <ListItemIcon>
              <GroupsIcon fontSize='large' sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Clientes y Proveedores" />
            {openSection === 'clientes' ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSection === 'clientes'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {clientesProveedores.map((item) => {
                const active = pathname === item.path;

                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                      opacity: collapsed && !hovered ? 0 : 1,
                      pl: 4,
                      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 0,
                        mr: collapsed && !hovered ? 'auto' : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {/* TEXTO SOLO SI NO ESTÁ MINI */}
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: collapsed && !hovered ? 0 : 1,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
          <ListItemButton onClick={() => handleSectionClick('reportes')}>
            <ListItemIcon>
              <ContentPasteIcon fontSize='large' sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Reportes y Auditoría" />
            {openSection === 'reportes' ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSection === 'reportes'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {reportesAuditoria.map((item) => {
                const active = pathname === item.path;

                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                      opacity: collapsed && !hovered ? 0 : 1,
                      pl: 4,
                      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 0,
                        mr: collapsed && !hovered ? 'auto' : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {/* TEXTO SOLO SI NO ESTÁ MINI */}
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: collapsed && !hovered ? 0 : 1,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
          <ListItemButton onClick={() => handleSectionClick('config')}>
            <ListItemIcon>
              <BuildIcon fontSize='large' sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Configuración" />
            {openSection === 'config' ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={openSection === 'config'} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {menuSections.map((item) => {
                const active = pathname === item.path;

                return (
                  <ListItemButton
                    key={item.text}
                    onClick={() => router.push(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                      opacity: collapsed && !hovered ? 0 : 1,
                      pl: 4,
                      background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderLeft: active ? '4px solid #3498db' : '4px solid transparent',
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        color: 'white',
                        minWidth: 0,
                        mr: collapsed && !hovered ? 'auto' : 2,
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>

                    {/* TEXTO SOLO SI NO ESTÁ MINI */}
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: collapsed && !hovered ? 0 : 1,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
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
            <ListItemButton key={item.text} onClick={() => router.push(item.path)}>
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
          pl: 9,
          minHeight: '100vh',
          background: "white",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Box, Divider
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ComputerIcon from '@mui/icons-material/Computer';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const drawerWidth = 260;
const collapsedWidth = 72;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario' },
  { text: 'Ventas', icon: <MonetizationOnIcon />, path: '/ventas' },
  { text: 'Compras', icon: <ShoppingCartIcon />, path: '/compras' },
  { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/punto_venta' },
  { text: 'Contabilidad', icon: <SettingsIcon />, path: '/contabilidad' },
  { text: 'Activos', icon: <SettingsIcon />, path: '/activos_fijos' },
  { text: 'Costos', icon: <SettingsIcon />, path: '/costos' },
  { text: 'finanzas', icon: <SettingsIcon />, path: '/finanzas' },
  { text: 'Nomina', icon: <SettingsIcon />, path: '/nomina' },
  { text: 'Produccion', icon: <SettingsIcon />, path: '/produccion' },
  { text: 'Planificacion', icon: <SettingsIcon />, path: '/planificacion' },
  { text: 'Clientes', icon: <SettingsIcon />, path: '/clientes' },
  { text: 'Proveedores', icon: <SettingsIcon />, path: '/proveedores' },
  { text: 'Reportes', icon: <SettingsIcon />, path: '/reportes' },
  { text: 'Auditoria', icon: <SettingsIcon />, path: '/auditoria' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
  { text: 'Licencias', icon: <SettingsIcon />, path: '/licencias' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [hovered, setHovered] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const drawerW = collapsed && !hovered ? collapsedWidth : drawerWidth;

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
          <IconButton color="inherit" onClick={() => setCollapsed(!collapsed)} sx={{}}>
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* DRAWER DESKTOP */}
      <Drawer
        variant="permanent"
        open
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
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
          {menuItems.map((item) => {
            const active = pathname === item.path;

            return (
              <ListItemButton
                key={item.text}
                onClick={() => router.push(item.path)}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed && !hovered ? 'center' : 'flex-start',
                  px: 2.5,
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

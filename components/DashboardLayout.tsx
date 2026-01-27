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

const drawerWidth = 260;
const collapsedWidth = 72;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario' },
  { text: 'Ventas', icon: <ComputerIcon />, path: '/ventas' },
  { text: 'Compras', icon: <InventoryIcon />, path: '/compras' },
  { text: 'Punto de Venta', icon: <SettingsIcon />, path: '/punto_venta' },
  { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
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
          <Typography sx={{ ml: 8,flexGrow: 1 }}>🚀 SISTEMA XILEF 🚀</Typography>

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
        <Toolbar />

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
          pl: 10,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

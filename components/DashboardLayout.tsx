'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton,
  ListItemIcon, ListItemText, IconButton, Box, Divider
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

const drawerWidth = 260;
const collapsedWidth = 72;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario' },
  { text: 'Ventas', icon: <MonetizationOnIcon />, path: '/ventas' },
  { text: 'Compras', icon: <ShoppingCartIcon />, path: '/compras' },
  { text: 'Punto de Venta', icon: <PointOfSaleIcon />, path: '/punto_venta' },
  { text: 'Contabilidad', icon: <AccountBalanceIcon />, path: '/contabilidad' },
  { text: 'Activos', icon: <DatasetIcon />, path: '/activos_fijos' },
  { text: 'Costos', icon: <AttachMoneyIcon />, path: '/costos' },
  { text: 'finanzas', icon: <CreditCardIcon />, path: '/finanzas' },
  { text: 'Nomina', icon: <PeopleAltIcon />, path: '/nomina' },
  { text: 'Produccion', icon: <FactoryIcon />, path: '/produccion' },
  { text: 'Planificacion', icon: <CalendarMonthIcon />, path: '/planificacion' },
  { text: 'Clientes', icon: <Groups2Icon />, path: '/clientes' },
  { text: 'Proveedores', icon: <StoreIcon />, path: '/proveedores' },
  { text: 'Reportes', icon: <FeedIcon />, path: '/reportes' },
  { text: 'Auditoria', icon: <VerifiedUserIcon />, path: '/auditoria' },
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

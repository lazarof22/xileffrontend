'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Typography, Grid, Box, IconButton, Button } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import WcIcon from '@mui/icons-material/Wc';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CustomDataGrid from "@/components/CustomDataGrid";

const rows = [
  { id: 1, factura: "f002", cliente: "Cliente A", total: 305, fecha: "2024-01-15" },
  { id: 2, factura: "f001", cliente: "Cliente B", total: 452, fecha: "2024-01-14" },
];

export default function dashboardPage() {
  return (
    <DashboardLayout>
      <Box>
        <Box
          sx={{
            width: '100%',
            height: 60,
            background:
              "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            alignContent: 'center',
            display: 'flex',
            justifyContent: 'space-between', // 👈 separa extremos
            alignItems: 'center', // 👈 centra vertical
            px: 2, // 👈 padding horizontal
            borderBottom: '1px solid rgba(255,255,255,0.15)',// 🌫 Borde sutil
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',// 💡 Sombra suave
          }}>
          <Typography variant="h5" color='white' sx={{ ml: 2 }}>
            Dashboard General
          </Typography>
          <Button
            variant="contained"
            startIcon={<RestartAltIcon className="rotate-icon" />}
            sx={{
              transition: 'all 0.3s ease',

              '&:hover .rotate-icon': {
                transform: 'rotate(180deg) scale(1.1)',
              },

              '& .rotate-icon': {
                transition: 'transform 0.3s ease',
              },
            }}
          >
            Actualizar
          </Button>
        </Box>
        <Box display={'flex'} ml={2}>
          <Card sx={{ width: 'auto', display: 'inline-flex', m: 2 }}>
            <CardContent sx={{ py: 2, px: 3 }}>
              <Typography variant="h6"><MonetizationOnIcon fontSize='large' sx={{ mr: 1 }} />Ventas del Mes:</Typography>
              <Typography variant="h4" color='primary' textAlign={'center'}>$1,250</Typography>
            </CardContent>
          </Card>
          <Card sx={{ width: 'auto', display: 'inline-flex', m: 2 }}>
            <CardContent>
              <Typography variant="h6"><InventoryIcon fontSize='large' sx={{ mr: 1 }} />Productos en Stock:</Typography>
              <Typography variant="h4" color='primary' textAlign={'center'}>320</Typography>
            </CardContent>
          </Card>
          <Card sx={{ width: 'auto', display: 'inline-flex', m: 2 }}>
            <CardContent>
              <Typography variant="h6"><SupervisedUserCircleIcon fontSize='large' sx={{ mr: 1 }} />Clientes Activos:</Typography>
              <Typography variant="h4" color='primary' textAlign={'center'}>4</Typography>
            </CardContent>
          </Card>
          <Card sx={{ width: 'auto', display: 'inline-flex', m: 2 }}>
            <CardContent>
              <Typography variant="h6"><WcIcon fontSize='large' sx={{ mr: 1 }} />Empleados:</Typography>
              <Typography variant="h4" color='primary' textAlign={'center'}>6</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box ml={2}>
          <Card sx={{ width: 'auto', display: 'inline-flex', m: 2 }}>
            <CardContent>
              <CustomDataGrid
                title="Ventas Recientes"
                rows={rows}
                getRowId={(row) => row.id}
                columns={[
                  { field: "factura", headerName: "Factura" },
                  { field: "cliente", headerName: "Cliente", numeric: true },
                  { field: "total", headerName: "Total", numeric: true },
                  { field: "fecha", headerName: "Fecha", numeric: true },
                ]}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

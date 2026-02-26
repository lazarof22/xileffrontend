'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, Typography, Grid, Box, IconButton, Button } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import WcIcon from '@mui/icons-material/Wc';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CustomDataGrid from "@/components/CustomDataGridR";

const rows = [
  { id: 1, codigo: "f002", producto: "Laptop Acer Predator", categoria:"tecnologias", precioCompra: 320, precioVenta: 360, stock:10, stockMinimo:5, estado:"Activo" },
  { id: 2, codigo: "f003", producto: "Laptop Gigabyte Aorus", categoria:"tecnologias", precioCompra: 410, precioVenta: 480, stock:15, stockMinimo:5, estado:"Activo" },
];

export default function InventoryPage() {
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
          }}>
          <Typography variant="h5" color='white' sx={{ ml: 2 }}>
            Gestion de Inventario
          </Typography>
          <Button variant="contained" startIcon={<RestartAltIcon />}>
            Actualizar
          </Button>
        </Box>
        <Box ml={2}>
          <Card sx={{ width: 'auto', display: 'inline-flex', m: 2 }}>
            <CardContent>
              <CustomDataGrid
                title="Productos"
                rows={rows}
                getRowId={(row) => row.id}
                columns={[
                  { field: "codigo", headerName: "Codigo" },
                  { field: "producto", headerName: "Producto"},
                  { field: "categoria", headerName: "Categoria"},
                  { field: "precioCompra", headerName: "Precio de Compra", numeric: true },
                  { field: "precioVenta", headerName: "Precio de Venta", numeric: true },
                  { field: "stock", headerName: "Stock", numeric: true },
                  { field: "stockMinimo", headerName: "Stock Minimo", numeric: true },
                  { field: "estado", headerName: "Estado"},
                ]}
                onEditRow={(row) => console.log("Editar", row)}
                onDeleteRow={(row) => console.log("Eliminar", row)}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

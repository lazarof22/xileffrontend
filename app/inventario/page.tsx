'use client';

import DashboardLayout from '@/components/DashboardLayout';
import {
  Card, CardContent, Typography, Grid, Box, IconButton, Button, Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InventoryIcon from '@mui/icons-material/Inventory';
import SupervisedUserCircleIcon from '@mui/icons-material/SupervisedUserCircle';
import WcIcon from '@mui/icons-material/Wc';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CustomDataGrid from "@/components/CustomDataGridR";
import AddIcon from '@mui/icons-material/Add';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import React from 'react';



export default function InventoryPage() {
  const [rows, setRows] = React.useState([
    { id: 1, codigo: "f002", producto: "Laptop Acer Predator", categoria: "tecnologias", precioCompra: 320, precioVenta: 360, stock: 10, stockMinimo: 5, estado: "Activo" },
    { id: 2, codigo: "f003", producto: "Laptop Gigabyte Aorus", categoria: "tecnologias", precioCompra: 410, precioVenta: 480, stock: 15, stockMinimo: 5, estado: "Activo" },
  ]);

  const [openCreateDialog, setOpenCreateDialog] = React.useState(false);

  const [newProduct, setNewProduct] = React.useState({
    codigo: "",
    producto: "",
    categoria: "",
    precioCompra: "",
    precioVenta: "",
    stock: "",
    stockMinimo: "",
    estado: "Activo",
  });

  const handleChange = (field: string, value: any) => {
    setNewProduct((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };

      // 🔥 Validar automáticamente cuando cambia algo
      setTimeout(() => {
        validateForm();
      }, 0);

      return updated;
    });
  };

  const handleCreateProduct = () => {
    if (!validateForm()) return;

    const productToAdd = {
      id: Date.now(),
      ...newProduct,
      precioCompra: Number(newProduct.precioCompra),
      precioVenta: Number(newProduct.precioVenta),
      stock: Number(newProduct.stock),
      stockMinimo: Number(newProduct.stockMinimo),
    };

    setRows((prev) => [...prev, productToAdd]);

    setOpenCreateDialog(false);
    setOpenSnackbar(true);

    setNewProduct({
      codigo: "",
      producto: "",
      categoria: "",
      precioCompra: "",
      precioVenta: "",
      stock: "",
      stockMinimo: "",
      estado: "Activo",
    });

    setErrors({});
  };

  const [errors, setErrors] = React.useState<any>({});
  const [openSnackbar, setOpenSnackbar] = React.useState(false);

  const categorias = [
    "Tecnologías",
    "Electrodomésticos",
    "Accesorios",
    "Oficina",
  ];

  const validateForm = () => {
    let tempErrors: any = {};

    const precioCompra = Number(newProduct.precioCompra);
    const precioVenta = Number(newProduct.precioVenta);
    const stock = Number(newProduct.stock);
    const stockMinimo = Number(newProduct.stockMinimo);

    if (!newProduct.codigo) tempErrors.codigo = "El código es obligatorio";
    if (!newProduct.producto) tempErrors.producto = "El producto es obligatorio";
    if (!newProduct.categoria) tempErrors.categoria = "Seleccione una categoría";
    if (!newProduct.precioCompra) tempErrors.precioCompra = "Precio requerido";
    if (!newProduct.precioVenta) tempErrors.precioVenta = "Precio requerido";
    if (!newProduct.stock) tempErrors.stock = "Stock requerido";
    if (!newProduct.stockMinimo) tempErrors.stockMinimo = "Stock mínimo requerido";

    // 🔥 Validación lógica negocio
    if (precioVenta <= precioCompra) {
      tempErrors.precioVenta =
        "El precio de venta debe ser mayor que el precio de compra";
    }

    if (stockMinimo > stock) {
      tempErrors.stockMinimo =
        "El stock mínimo no puede ser mayor que el stock actual";
    }

    setErrors(tempErrors);

    return Object.keys(tempErrors).length === 0;
  };

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
            justifyContent: 'space-between', //separa extremos
            alignItems: 'center', //centra vertical
            px: 2, //padding horizontal
          }}>
          <Typography variant="h5" color='white' sx={{ ml: 2 }}>
            Gestion de Inventario
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Nuevo Producto
            </Button>
            <Button variant="contained" startIcon={<AssignmentAddIcon />} sx={{ ml: 1 }}>
              Ajsute de Inventario
            </Button>
          </Box>
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
                  { field: "producto", headerName: "Producto" },
                  { field: "categoria", headerName: "Categoria" },
                  { field: "precioCompra", headerName: "Precio de Compra", numeric: true },
                  { field: "precioVenta", headerName: "Precio de Venta", numeric: true },
                  { field: "stock", headerName: "Stock", numeric: true },
                  { field: "stockMinimo", headerName: "Stock Minimo", numeric: true },
                  { field: "estado", headerName: "Estado" },
                ]}
                onEditRow={(row) => console.log("Editar", row)}
                onDeleteRow={(row) => console.log("Eliminar", row)}
              />
            </CardContent>
          </Card>
          <Dialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Nuevo Producto</DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Código"
                margin="normal"
                value={newProduct.codigo}
                onChange={(e) => handleChange("codigo", e.target.value)}
                error={!!errors.codigo}
                helperText={errors.codigo}
              />

              <TextField
                fullWidth
                label="Producto"
                margin="normal"
                value={newProduct.producto}
                onChange={(e) => handleChange("producto", e.target.value)}
                error={!!errors.producto}
                helperText={errors.producto}
              />

              {/* Categoría Dropdown */}
              <TextField
                select
                fullWidth
                label="Categoría"
                margin="normal"
                value={newProduct.categoria}
                onChange={(e) => handleChange("categoria", e.target.value)}
                error={!!errors.categoria}
                helperText={errors.categoria}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                type="number"
                label="Precio Compra"
                margin="normal"
                value={newProduct.precioCompra}
                onChange={(e) => handleChange("precioCompra", e.target.value)}
                error={!!errors.precioCompra}
                helperText={errors.precioCompra}
              />

              <TextField
                fullWidth
                type="number"
                label="Precio Venta"
                margin="normal"
                value={newProduct.precioVenta}
                onChange={(e) => handleChange("precioVenta", e.target.value)}
                error={!!errors.precioVenta}
                helperText={errors.precioVenta}
              />

              <TextField
                fullWidth
                type="number"
                label="Stock"
                margin="normal"
                value={newProduct.stock}
                onChange={(e) => handleChange("stock", e.target.value)}
                error={!!errors.stock}
                helperText={errors.stock}
              />

              <TextField
                fullWidth
                type="number"
                label="Stock Mínimo"
                margin="normal"
                value={newProduct.stockMinimo}
                onChange={(e) => handleChange("stockMinimo", e.target.value)}
                error={!!errors.stockMinimo}
                helperText={errors.stockMinimo}
              />

              {/* Estado Dropdown */}
              <TextField
                select
                fullWidth
                label="Estado"
                margin="normal"
                value={newProduct.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
              >
                <MenuItem value="Activo">Activo</MenuItem>
                <MenuItem value="Inactivo">Inactivo</MenuItem>
              </TextField>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpenCreateDialog(false)}>
                Cancelar
              </Button>

              <Button
                variant="contained"
                onClick={handleCreateProduct}
                disabled={Object.keys(errors).length > 0}
              >
                Guardar
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={openSnackbar}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
          >
            <Alert
              severity="success"
              variant="filled"
              onClose={() => setOpenSnackbar(false)}
            >
              Producto agregado correctamente
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </DashboardLayout>
  );
}

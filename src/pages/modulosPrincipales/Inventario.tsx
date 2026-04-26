// src/pages/InventoryPage.tsx
import * as React from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    Checkbox,
    FormControlLabel,
    Tab,
    CircularProgress,
} from '@mui/material';
import CustomDataGrid from "../../components/CustomDataGrid";
import AddIcon from '@mui/icons-material/Add';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import { useEffect, useState } from 'react';
import { TabContext, TabList, TabPanel } from "@mui/lab";
import DashboardLayout from "../../components/DashboardLayout";

// API URL del backend NestJS
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Enums del backend (en minúsculas)
const CATEGORIAS = [
    { label: "Tecnologías", value: "tecnologías" },
    { label: "Electrodomésticos", value: "electrodomésticos" },
    { label: "Accesorios", value: "accesorios" },
    { label: "Oficina", value: "oficina" },
];

const ESTADOS = [
    { label: "Activo", value: "activo" },
    { label: "Inactivo", value: "inactivo" },
];

export default function InventoryPage() {
    // ==================== ESTADOS ====================
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Dialog Crear Producto
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newProduct, setNewProduct] = useState({
        codigo_producto: "",
        nombre_producto: "",
        categoria_producto: "",
        precio_compra: "",
        precio_venta: "",
        stock_inicial: "",
        stock_minimo: "",
        estado: "activo",
    });
    const [errors, setErrors] = useState<any>({});

    // Dialog Ajuste de Inventario
    const [openAdjustDialog, setOpenAdjustDialog] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [increaseChecked, setIncreaseChecked] = useState(false);
    const [decreaseChecked, setDecreaseChecked] = useState(false);
    const [increaseAmount, setIncreaseAmount] = useState("");
    const [decreaseAmount, setDecreaseAmount] = useState("");
    const [decreaseReason, setDecreaseReason] = useState("");

    // Tabs y Kardex
    const [tabValue, setTabValue] = useState("1");
    const [kardex, setKardex] = useState<any[]>([]);
    const [kardexLoading, setKardexLoading] = useState(false);

    // Snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const decreaseReasons = ["Producto dañado", "Venta manual", "Pérdida", "Ajuste administrativo"];

    // ==================== EFECTOS ====================
    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/producto`);
            if (!response.ok) throw new Error('Error al cargar productos');
            const result = await response.json();

            const data = Array.isArray(result) ? result : result.data || [];

            const mappedData = data.map((p: any) => ({
                id: p._id,
                codigo: p.codigo_producto,
                producto: p.nombre_producto,
                categoria: p.categoria_producto,
                precioCompra: p.precio_compra,
                precioVenta: p.precio_venta,
                stock: p.stock_inicial,
                stockMinimo: p.stock_minimo,
                estado: p.estado,
                _original: p
            }));

            setRows(mappedData);
        } catch (err: any) {
            setSnackbarMessage('Error al cargar los productos: ' + err.message);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    const fetchKardex = async () => {
        setKardexLoading(true);
        try {
            const response = await fetch(`${API_URL}/kardex`);
            if (!response.ok) throw new Error('Error al cargar Kardex');
            const result = await response.json();

            const data = Array.isArray(result) ? result : result.data || [];

            const mappedData = data.map((k: any) => {
                // ✅ productoId puede ser un objeto anidado o un string
                const productoObj = k.productoId;

                // Si es objeto anidado (populated), extraer directamente
                // Si es string (solo ID), mostrar "Producto desconocido"
                const nombreProducto = typeof productoObj === 'object' && productoObj !== null
                    ? productoObj.nombre_producto || 'Sin nombre'
                    : 'Producto desconocido';

                const stockInicial = typeof productoObj === 'object' && productoObj !== null
                    ? productoObj.stock_inicial ?? '-'
                    : '-';

                return {
                    id: k._id,
                    fecha: new Date(k.fecha).toLocaleString(),
                    producto: nombreProducto,
                    tipo: k.tipo,
                    cantidad: k.cantidad,
                    motivo: k.motivo,
                    stockFinal: stockInicial, // ✅ Ahora muestra el stock real
                };
            });

            setKardex(mappedData);
        } catch (err: any) {
            setSnackbarMessage('Error al cargar Kardex: ' + err.message);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setKardexLoading(false);
        }
    };

    // ==================== HANDLERS PRODUCTO ====================
    const handleChange = (field: string, value: any) => {
        setNewProduct((prev) => {
            const updated = { ...prev, [field]: value };
            setTimeout(() => validateForm(updated), 0);
            return updated;
        });
    };

    const validateForm = (product = newProduct): boolean => {
        let tempErrors: any = {};

        const precioCompra = Number(product.precio_compra);
        const precioVenta = Number(product.precio_venta);
        const stock = Number(product.stock_inicial);
        const stockMinimo = Number(product.stock_minimo);

        if (!product.codigo_producto) tempErrors.codigo_producto = "El código es obligatorio";
        if (!product.nombre_producto) tempErrors.nombre_producto = "El producto es obligatorio";
        if (!product.categoria_producto) tempErrors.categoria_producto = "Seleccione una categoría";
        if (!product.precio_compra) tempErrors.precio_compra = "Precio requerido";
        if (!product.precio_venta) tempErrors.precio_venta = "Precio requerido";
        if (!product.stock_inicial) tempErrors.stock_inicial = "Stock requerido";
        if (!product.stock_minimo) tempErrors.stock_minimo = "Stock mínimo requerido";

        if (precioVenta <= precioCompra) {
            tempErrors.precio_venta = "El precio de venta debe ser mayor que el precio de compra";
        }

        if (stockMinimo > stock) {
            tempErrors.stock_minimo = "El stock mínimo no puede ser mayor que el stock actual";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleCreateProduct = async () => {
        if (!validateForm()) return;

        try {
            const productData = {
                codigo_producto: newProduct.codigo_producto,
                nombre_producto: newProduct.nombre_producto,
                categoria_producto: newProduct.categoria_producto,
                precio_compra: Number(newProduct.precio_compra),
                precio_venta: Number(newProduct.precio_venta),
                stock_inicial: Number(newProduct.stock_inicial),
                stock_minimo: Number(newProduct.stock_minimo),
                estado: newProduct.estado,
            };

            const response = await fetch(`${API_URL}/producto`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear producto');
            }

            const created = await response.json();

            setRows((prev) => [...prev, {
                id: created._id,
                codigo: created.codigo_producto,
                producto: created.nombre_producto,
                categoria: created.categoria_producto,
                precioCompra: created.precio_compra,
                precioVenta: created.precio_venta,
                stock: created.stock_inicial,
                stockMinimo: created.stock_minimo,
                estado: created.estado,
                _original: created
            }]);

            setOpenCreateDialog(false);
            setSnackbarMessage('Producto creado exitosamente');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);

            setNewProduct({
                codigo_producto: "",
                nombre_producto: "",
                categoria_producto: "",
                precio_compra: "",
                precio_venta: "",
                stock_inicial: "",
                stock_minimo: "",
                estado: "activo",
            });
            setErrors({});
        } catch (err: any) {
            setSnackbarMessage('Error al crear el producto: ' + err.message);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    // ==================== HANDLERS AJUSTE DE INVENTARIO ====================
    const handleIncreaseCheck = (checked: boolean) => {
        setIncreaseChecked(checked);
        if (checked) {
            setDecreaseChecked(false);
            setDecreaseAmount("");
            setDecreaseReason("");
        }
    };

    const handleDecreaseCheck = (checked: boolean) => {
        setDecreaseChecked(checked);
        if (checked) {
            setIncreaseChecked(false);
            setIncreaseAmount("");
        }
    };

    const handleConfirmAdjustment = async () => {
        if (!selectedProductId) return;

        const selectedProduct = rows.find(r => r.id === selectedProductId);
        if (!selectedProduct) return;

        let movementType: "entrada" | "salida" = "entrada";
        let quantity = 0;
        let newStock = selectedProduct.stock;

        if (increaseChecked) {
            quantity = Number(increaseAmount);
            movementType = "entrada";
            newStock += quantity;
        }

        if (decreaseChecked) {
            quantity = Number(decreaseAmount);
            movementType = "salida";
            newStock -= quantity;
            if (newStock < 0) newStock = 0;
        }

        try {
            const kardexData = {
                productoId: selectedProductId,
                tipo: movementType,
                cantidad: quantity,
                motivo: decreaseChecked ? decreaseReason : "Ingreso de inventario",
            };

            console.log('Enviando a Kardex:', kardexData);

            const kardexResponse = await fetch(`${API_URL}/kardex`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(kardexData),
            });

            console.log('Status:', kardexResponse.status);

            if (!kardexResponse.ok) {
                const errorData = await kardexResponse.json();
                console.error('Error del backend:', errorData);
                throw new Error(errorData.message || JSON.stringify(errorData) || 'Error al registrar en Kardex');
            }

            const kardexCreated = await kardexResponse.json();
            console.log('Kardex creado:', kardexCreated);

            setRows((prev) =>
                prev.map((row) =>
                    row.id === selectedProductId ? {
                        ...row,
                        stock: newStock,
                    } : row
                )
            );

            await fetchKardex();

            setOpenAdjustDialog(false);
            setSelectedProductId("");
            setIncreaseChecked(false);
            setDecreaseChecked(false);
            setIncreaseAmount("");
            setDecreaseAmount("");
            setDecreaseReason("");

            setSnackbarMessage('Ajuste de inventario realizado correctamente');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (err: any) {
            console.error('Error catch:', err);
            setSnackbarMessage('Error al ajustar el inventario: ' + err.message);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    // ==================== HANDLERS TABS ====================
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
        if (newValue === "2") {
            fetchKardex();
        }
    };

    // ==================== RENDER ====================
    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    width: '100%',
                    height: 60,
                    background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    alignContent: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                }}>
                <Typography variant="h5" sx={{ ml: 2, color: 'white' }}>
                    Gestión de Inventario
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            ml: 1,
                            background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                        onClick={() => setOpenCreateDialog(true)}
                    >
                        Nuevo Producto
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AssignmentAddIcon />}
                        sx={{
                            ml: 1,
                            background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                        onClick={() => setOpenAdjustDialog(true)}
                    >
                        Ajuste de Inventario
                    </Button>
                </Box>
            </Box>

            {/* Tabs */}
            <Box sx={{ width: '100%', px: 2 }}>
                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                        <TabList onChange={handleTabChange}>
                            <Tab label="Productos" value="1" />
                            <Tab label="Kardex" value="2" />
                        </TabList>
                    </Box>

                    {/* TAB PRODUCTOS */}
                    <TabPanel value="1">
                        <Card sx={{ width: '100%' }}>
                            <CardContent>
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <CustomDataGrid
                                        title="Productos"
                                        rows={rows}
                                        getRowId={(row) => row.id}
                                        columns={[
                                            { field: "codigo", headerName: "Código" },
                                            { field: "producto", headerName: "Producto" },
                                            { field: "categoria", headerName: "Categoría" },
                                            { field: "precioCompra", headerName: "Precio Compra", numeric: true },
                                            { field: "precioVenta", headerName: "Precio Venta", numeric: true },
                                            { field: "stock", headerName: "Stock", numeric: true },
                                            { field: "stockMinimo", headerName: "Stock Mínimo", numeric: true },
                                            { field: "estado", headerName: "Estado" },
                                        ]}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabPanel>

                    {/* TAB KARDEX */}
                    <TabPanel value="2">
                        <Card sx={{ width: '100%' }}>
                            <CardContent>
                                <CustomDataGrid
                                    title="Registro Kardex"
                                    rows={kardex}
                                    getRowId={(row) => row.id}
                                    columns={[
                                        { field: "fecha", headerName: "Fecha" },
                                        { field: "producto", headerName: "Producto" },
                                        { field: "tipo", headerName: "Tipo" },
                                        { field: "cantidad", headerName: "Cantidad", numeric: true },
                                        { field: "motivo", headerName: "Motivo" },
                                        { field: "stockFinal", headerName: "Stock Final", numeric: true },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </TabPanel>
                </TabContext>

                {/* Dialog Crear Producto */}
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
                            value={newProduct.codigo_producto}
                            onChange={(e) => handleChange("codigo_producto", e.target.value)}
                            error={!!errors.codigo_producto}
                            helperText={errors.codigo_producto}
                        />
                        <TextField
                            fullWidth
                            label="Producto"
                            margin="normal"
                            value={newProduct.nombre_producto}
                            onChange={(e) => handleChange("nombre_producto", e.target.value)}
                            error={!!errors.nombre_producto}
                            helperText={errors.nombre_producto}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Categoría"
                            margin="normal"
                            value={newProduct.categoria_producto}
                            onChange={(e) => handleChange("categoria_producto", e.target.value)}
                            error={!!errors.categoria_producto}
                            helperText={errors.categoria_producto}
                        >
                            {CATEGORIAS.map((cat) => (
                                <MenuItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            type="number"
                            label="Precio Compra"
                            margin="normal"
                            value={newProduct.precio_compra}
                            onChange={(e) => handleChange("precio_compra", e.target.value)}
                            error={!!errors.precio_compra}
                            helperText={errors.precio_compra}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Precio Venta"
                            margin="normal"
                            value={newProduct.precio_venta}
                            onChange={(e) => handleChange("precio_venta", e.target.value)}
                            error={!!errors.precio_venta}
                            helperText={errors.precio_venta}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Stock"
                            margin="normal"
                            value={newProduct.stock_inicial}
                            onChange={(e) => handleChange("stock_inicial", e.target.value)}
                            error={!!errors.stock_inicial}
                            helperText={errors.stock_inicial}
                        />
                        <TextField
                            fullWidth
                            type="number"
                            label="Stock Mínimo"
                            margin="normal"
                            value={newProduct.stock_minimo}
                            onChange={(e) => handleChange("stock_minimo", e.target.value)}
                            error={!!errors.stock_minimo}
                            helperText={errors.stock_minimo}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Estado"
                            margin="normal"
                            value={newProduct.estado}
                            onChange={(e) => handleChange("estado", e.target.value)}
                        >
                            {ESTADOS.map((est) => (
                                <MenuItem key={est.value} value={est.value}>
                                    {est.label}
                                </MenuItem>
                            ))}
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

                {/* Dialog Ajuste de Inventario */}
                <Dialog
                    open={openAdjustDialog}
                    onClose={() => setOpenAdjustDialog(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Ajuste de Inventario</DialogTitle>
                    <DialogContent sx={{ mt: 2 }}>
                        <TextField
                            select
                            fullWidth
                            label="Producto"
                            margin="normal"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            {rows.map((row) => (
                                <MenuItem key={row.id} value={row.id}>
                                    {row.producto} (Stock: {row.stock})
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={increaseChecked}
                                        onChange={(e) => handleIncreaseCheck(e.target.checked)}
                                    />
                                }
                                label="Aumentar Stock"
                            />
                        </Box>
                        {increaseChecked && (
                            <TextField
                                fullWidth
                                type="number"
                                label="Cantidad a aumentar"
                                margin="normal"
                                value={increaseAmount}
                                onChange={(e) => setIncreaseAmount(e.target.value)}
                            />
                        )}

                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={decreaseChecked}
                                        onChange={(e) => handleDecreaseCheck(e.target.checked)}
                                    />
                                }
                                label="Disminuir Stock"
                            />
                        </Box>
                        {decreaseChecked && (
                            <>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Cantidad a disminuir"
                                    margin="normal"
                                    value={decreaseAmount}
                                    onChange={(e) => setDecreaseAmount(e.target.value)}
                                />
                                <TextField
                                    select
                                    fullWidth
                                    label="Motivo"
                                    margin="normal"
                                    value={decreaseReason}
                                    onChange={(e) => setDecreaseReason(e.target.value)}
                                >
                                    {decreaseReasons.map((reason) => (
                                        <MenuItem key={reason} value={reason}>
                                            {reason}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenAdjustDialog(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleConfirmAdjustment}
                            disabled={
                                !selectedProductId ||
                                (!increaseChecked && !decreaseChecked) ||
                                (increaseChecked && !increaseAmount) ||
                                (decreaseChecked && (!decreaseAmount || !decreaseReason))
                            }
                        >
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar */}
                <Snackbar
                    open={openSnackbar}
                    autoHideDuration={3000}
                    onClose={() => setOpenSnackbar(false)}
                >
                    <Alert
                        severity={snackbarSeverity}
                        variant="filled"
                        onClose={() => setOpenSnackbar(false)}
                    >
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
}
// src/pages/PuntoVentaPage.tsx
import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, Typography, Box, IconButton, Button,
    TextField,
    Tabs,
    Tab,
    InputAdornment,
    Badge,
    Divider,
    Avatar,
    Chip,
    Stack,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ProductCard from "../../components/ProductCard";
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SearchIcon from "@mui/icons-material/Search";
import jsPDF from "jspdf";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MoneyIcon from '@mui/icons-material/Money';
import PaymentIcon from '@mui/icons-material/Payment';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ImageIcon from '@mui/icons-material/Image';
import RemoveIcon from '@mui/icons-material/Remove';
import DialogCrearCliente, { type ClienteFormData } from '../../components/AddClientDialog';
import DialogPagoEfectivo, { type PagoEfectivoData } from '../../components/PagoEfectivoDialog';
import DialogPagoCredito, { type PagoCreditoData } from '../../components/PagoCreditoDialog';
import type { ProductoCarrito } from '../../types/venta.types';
import CustomDataGridR, { type Column } from '../../components/CustomDataGridR';
import FacturacionTab from '../../components/FacturacionTab';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
interface ProductoAPI {
    _id: string;
    codigo_producto: string;
    nombre_producto: string;
    categoria_producto: string; // ObjectId como string
    precio_compra: number;
    precio_venta: number;
    stock_inicial: number;
    stock_minimo: number;
    estado: string; // ObjectId como string
    createdAt?: string;
    updatedAt?: string;
}

interface VentaHistorial {
    id: string;
    fecha: string;          // Fecha sin hora
    producto: string;       // Nombre del producto
    cantidadVendida: number;
    stockFinal: number;
    descuento: number;
    impuesto: number;
    totalPagado: number;
}

export default function PuntoVentaPage() {
    const [search, setSearch] = React.useState("");

    // ─── ESTADOS DE PRODUCTOS (REEMPLAZA EL ARRAY ESTÁTICO) ──────────
    const [productos, setProductos] = useState<ProductoAPI[]>([]);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [errorProductos, setErrorProductos] = useState<string | null>(null);

    const [ventasHistorial, setVentasHistorial] = useState<VentaHistorial[]>([]);

    const reportePlusColumns: Column<VentaHistorial>[] = [
        { field: 'fecha', headerName: 'Fecha' },
        { field: 'producto', headerName: 'Producto' },
        { field: 'cantidadVendida', headerName: 'Cantidad Vendida', numeric: true },
        { field: 'stockFinal', headerName: 'Stock Final', numeric: true },
        { field: 'descuento', headerName: 'Descuento (%)', numeric: true },
        { field: 'impuesto', headerName: 'Impuesto (%)', numeric: true },
        { field: 'totalPagado', headerName: 'Total Pagado', numeric: true },
    ];

    // Cargar productos desde la API al montar
    useEffect(() => {
        fetchProductos();
    }, []);

    const fetchProductos = async () => {
        setLoadingProductos(true);
        setErrorProductos(null);
        try {
            const response = await fetch(`${API_URL}/producto`);
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();

            const data = Array.isArray(result) ? result : result.data || [];

            const mappedData = data.map((p: any) => ({
                _id: p._id,
                codigo_producto: p.codigo_producto,
                nombre_producto: p.nombre_producto,
                categoria_producto: typeof p.categoria_producto === 'object'
                    ? p.categoria_producto?.nombre_categoria
                    : p.categoria_producto,
                precio_compra: p.precio_compra,
                precio_venta: p.precio_venta,
                stock_inicial: p.stock_inicial,
                stock_minimo: p.stock_minimo,
                estado: typeof p.estado === 'object'
                    ? p.estado?.estado
                    : p.estado,
            }));

            setProductos(mappedData);
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Error al cargar productos';
            setErrorProductos(msg);
            console.error('Error fetching productos:', error);
        } finally {
            setLoadingProductos(false);
        }
    };

    // Filtrar productos según búsqueda
    const productosFiltrados = productos.filter((producto) => {
        const texto = search.toLowerCase();
        return (
            producto.nombre_producto.toLowerCase().includes(texto) ||
            producto.categoria_producto.toLowerCase().includes(texto) ||
            producto.precio_venta.toString().includes(texto) ||
            producto.codigo_producto.toLowerCase().includes(texto)
        );
    });

    const [tab, setTab] = React.useState(0);

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteFormData | null>(null);

    const [carrito, setCarrito] = React.useState<any[]>([]);
    const [animateId, setAnimateId] = React.useState<string | null>(null);

    // 💳 Pago mixto
    const [transferencia, setTransferencia] = React.useState("");

    // 📊 Impuesto dinámico
    const [impuesto, setImpuesto] = React.useState(0);

    // 🧾 Datos de facturación
    const [cliente, setCliente] = React.useState("");
    const [nit, setNit] = React.useState("");

    const [openPagoCredito, setOpenPagoCredito] = useState(false);

    const handleOpenPagoCredito = (): void => {
        setOpenPagoCredito(true);
    };

    const handleClosePagoCredito = (): void => {
        setOpenPagoCredito(false);
    };

    const agregarAlCarrito = (producto: ProductoAPI) => {
        setAnimateId(producto._id);

        setCarrito((prev) => {
            const existe = prev.find((p) => p.id === producto._id);

            if (existe) {
                return prev.map((p) =>
                    p.id === producto._id
                        ? { ...p, cantidad: p.cantidad + 1 }
                        : p
                );
            }

            // Mapear ProductoAPI al formato del carrito
            return [...prev, {
                id: producto._id,
                codigo: producto.codigo_producto,
                nombre: producto.nombre_producto,
                precio: producto.precio_venta, // ← Usamos precio_venta
                stock: producto.stock_inicial,
                categoria: producto.categoria_producto,
                cantidad: 1,
                descuento: 0
            }];
        });

        setTimeout(() => setAnimateId(null), 300);
    };

    const quitarProducto = (id: number) => {
        setCarrito((prev) => prev.filter((p) => p.id !== id));
    };

    const total = carrito.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    );

    // Subtotal
    const subtotal = carrito.reduce(
        (acc, item) => acc + item.precio * item.cantidad,
        0
    );

    const descuento = carrito.reduce(
        (acc, item) => acc + item.descuento,
        0
    )

    // Descuento aplicado
    const montoDescuento = subtotal * (descuento / 100);

    // Base imponible
    const base = subtotal - montoDescuento;

    // Impuesto aplicado
    const montoImpuesto = base * (impuesto / 100);

    // Total final
    const totalFinal = base + montoImpuesto;

    const totalItems = carrito.reduce(
        (acc, item) => acc + item.cantidad,
        0
    );

    const [moneda, setMoneda] = React.useState("CUP");
    const [tasa, setTasa] = React.useState(1);

    const convertirPrecio = (precioCUP: number) => {
        if (moneda === "CUP") return precioCUP;
        return precioCUP / tasa;
    };

    const totalConvertido = convertirPrecio(total);

    const [efectivo, setEfectivo] = React.useState("");

    const totalPagado =
        Number(efectivo || 0) + Number(transferencia || 0);

    const cambio =
        totalPagado > totalFinal
            ? totalPagado - totalFinal
            : 0;

    const [productosStock, setProductosStock] = React.useState([...productos]);

    const finalizarVenta = () => {
        const nuevosProductos = productosStock.map(prod => {
            const item = carrito.find(p => p.id === prod._id);
            if (item) {
                return {
                    ...prod,
                    stock: prod.stock_inicial - item.cantidad
                };
            }
            return prod;
        });

        setProductosStock(nuevosProductos);
        setCarrito([]);
        setEfectivo("");
    };

    const generarTicket = () => {
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [80, 200]
        });

        doc.setFontSize(10);
        doc.text("MI NEGOCIO", 10, 10);

        let y = 20;

        carrito.forEach((item) => {
            doc.text(
                `${item.nombre} x${item.cantidad}`,
                5,
                y
            );
            doc.text(
                `${(item.precio * item.cantidad).toFixed(2)}`,
                60,
                y
            );
            y += 6;
        });

        doc.text("------------------------", 5, y);
        y += 6;

        doc.text(`TOTAL: ${totalConvertido.toFixed(2)} ${moneda}`, 5, y);
        y += 6;

        doc.text(`EFECTIVO: ${Number(efectivo).toFixed(2)}`, 5, y);
        y += 6;

        doc.text(`CAMBIO: ${cambio.toFixed(2)}`, 5, y);

        doc.text(`Cliente: ${cliente}`, 10, y);
        doc.text(`NIT: ${nit}`, 10, y);

        doc.text(`Subtotal: ${subtotal}`, 10, y);
        doc.text(`Descuento: ${montoDescuento}`, 10, y);
        doc.text(`Impuesto: ${montoImpuesto}`, 10, y);
        doc.text(`Total: ${totalFinal}`, 10, y);

        doc.save("ticket.pdf");
    };

    const aumentarCantidad = (id: number) => {
        setCarrito((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    if (item.cantidad >= item.stock) {
                        alert("No hay más stock disponible");
                        return item;
                    }
                    return { ...item, cantidad: item.cantidad + 1 };
                }
                return item;
            })
        );
    };

    const disminuirCantidad = (id: number) => {
        setCarrito((prev) =>
            prev
                .map((item) =>
                    item.id === id
                        ? { ...item, cantidad: item.cantidad - 1 }
                        : item
                )
                .filter((item) => item.cantidad > 0)
        );
    };

    const aumentarDescuento = (id: number) => {
        setCarrito(prev =>
            prev.map(item =>
                item.id === id && item.descuento < 100
                    ? { ...item, descuento: item.descuento + 1 }
                    : item
            )
        );
    };

    const disminuirDescuento = (id: number) => {
        setCarrito(prev =>
            prev.map(item =>
                item.id === id && item.descuento > 0
                    ? { ...item, descuento: item.descuento - 1 }
                    : item
            )
        );
    };

    const handleClienteCreado = (cliente: ClienteFormData) => {
        // El cliente recién creado ya está disponible para usar en la venta
        setClienteSeleccionado(cliente);
    };

    //ESTADOS DEL PUNTO DE VENTA
    const [openPago, setOpenPago] = useState(false);

    const handleOpenPago = (): void => {
        setOpenPago(true);
    };

    const handleClosePago = (): void => {
        setOpenPago(false);
    };

    const handlePagoCompletado = (data: PagoEfectivoData): void => {
        console.log('Pago procesado:', data);
    };

    const handlePagoCreditoCompletado = (data: PagoCreditoData): void => {
        console.log('Pago a crédito procesado:', data);
        // Aquí puedes: limpiar carrito, generar factura, etc.
        // setCarrito([]);
        // setEfectivo("");
    };

    const handleVentaExitosa = (ventaId: string): void => {
        // Generar registro para el historial de cada producto vendido
        const fechaActual = new Date().toISOString().split('T')[0]; // Solo fecha YYYY-MM-DD

        const nuevasVentas = carrito.map(item => ({
            id: `${ventaId}-${item.id}`,
            fecha: fechaActual,
            producto: item.nombre,
            cantidadVendida: item.cantidad,
            stockFinal: Math.max(0, item.stock - item.cantidad),
            descuento: item.descuento,
            impuesto: impuesto,
            totalPagado: (item.cantidad * item.precio * (1 - item.descuento / 100)) * (1 + impuesto / 100)
        }));

        setVentasHistorial(prev => [...nuevasVentas, ...prev]);

        // ✅ Limpiar todo después de venta exitosa
        setCarrito([]);
        setEfectivo("");
        setTransferencia("");
        setClienteSeleccionado(null);
        setCliente("");
        setNit("");
    };

    return (
        <Box>
            <Box
                sx={{
                    width: '100%',
                    height: 70,
                    background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    alignContent: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                }}>
                <Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Punto de Venta
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Modulo de Gestion de Venta de Productos
                    </Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    display: "flex",
                    gap: 2,
                    width: "100%",
                    flexDirection: { xs: "column", md: "row" },
                    mt: 2,
                }}
            >
                <Box sx={{ width: "100%" }}>
                    {/* 🔵 Tabs */}
                    <Tabs
                        value={tab}
                        onChange={handleChangeTab}
                        slotProps={{ indicator: { sx: { display: "none" } } }}
                        centered
                        sx={{
                            background: "#f4f6f8",
                            borderRadius: "10px",
                            p: 0.5,
                            ml: 1,
                            mr: 1,
                            minHeight: "auto",
                            "& .MuiTabs-flexContainer": {
                                gap: 1
                            }
                        }}
                    >
                        <Tab
                            icon={<ShoppingBasketIcon sx={{ fontSize: "large" }} />}
                            iconPosition="start"
                            label="Productos"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                minHeight: 45,
                                width: "auto",
                                transition: "all 0.3s ease",
                                color: tab === 0 ? "#fff" : "#555",
                                background:
                                    tab === 0
                                        ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                        : "transparent",
                                "&:hover": {
                                    background:
                                        tab === 0
                                            ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                            : "#e0e0e0",
                                },
                                "&.Mui-selected": {
                                    color: "#ffffff",
                                    background:
                                        "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                },
                            }}
                        />

                        // Reemplazar el Tab 2 actual:
                        <Tab
                            icon={<ReceiptLongIcon sx={{ fontSize: "large" }} />}
                            iconPosition="start"
                            label="Facturación"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                minHeight: 45,
                                width: "auto",
                                transition: "all 0.3s ease",
                                color: tab === 1 ? "#fff" : "#555",
                                background:
                                    tab === 1
                                        ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                        : "transparent",
                                "&:hover": {
                                    background:
                                        tab === 1
                                            ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                            : "#e0e0e0",
                                },
                                "&.Mui-selected": {
                                    color: "#ffffff",
                                    background:
                                        "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                },
                            }}
                        />

                        <Tab
                            icon={
                                <Badge
                                    badgeContent={
                                        carrito.reduce((acc, item) => acc + item.cantidad, 0)
                                    }
                                    color="error"
                                    overlap="circular"
                                >
                                    <ShoppingCartIcon />
                                </Badge>
                            }
                            iconPosition="start"
                            label="Carrito"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                minHeight: 45,
                                transition: "all 0.3s ease",
                                color: tab === 2 ? "#fff" : "#555",
                                background:
                                    tab === 2
                                        ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                        : "transparent",
                                "&:hover": {
                                    background:
                                        tab === 2
                                            ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                            : "#e0e0e0",
                                },
                                "&.Mui-selected": {
                                    color: "#ffffff",
                                    background:
                                        "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                },
                            }}
                        />

                        <Tab
                            icon={<ShoppingBasketIcon sx={{ fontSize: "large" }} />}
                            iconPosition="start"
                            label="Reporte Plus"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                minHeight: 45,
                                width: "auto",
                                transition: "all 0.3s ease",
                                color: tab === 3 ? "#fff" : "#555",
                                background:
                                    tab === 3
                                        ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                        : "transparent",
                                "&:hover": {
                                    background:
                                        tab === 3
                                            ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                            : "#e0e0e0",
                                },
                                "&.Mui-selected": {
                                    color: "#ffffff",
                                    background:
                                        "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                },
                            }}
                        />

                        <Tab
                            icon={<ShoppingBasketIcon sx={{ fontSize: "large" }} />}
                            iconPosition="start"
                            label="Reporte de Caja"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                minHeight: 45,
                                width: "auto",
                                transition: "all 0.3s ease",
                                color: tab === 4 ? "#fff" : "#555",
                                background:
                                    tab === 4
                                        ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                        : "transparent",
                                "&:hover": {
                                    background:
                                        tab === 4
                                            ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                            : "#e0e0e0",
                                },
                                "&.Mui-selected": {
                                    color: "#ffffff",
                                    background:
                                        "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                },
                            }}
                        />

                        <Tab
                            icon={<ShoppingBasketIcon sx={{ fontSize: "large" }} />}
                            iconPosition="start"
                            label="Cuarde de Caja"
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                borderRadius: "10px",
                                minHeight: 45,
                                width: "auto",
                                transition: "all 0.3s ease",
                                color: tab === 5 ? "#fff" : "#555",
                                background:
                                    tab === 5
                                        ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                        : "transparent",
                                "&:hover": {
                                    background:
                                        tab === 5
                                            ? "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                            : "#e0e0e0",
                                },
                                "&.Mui-selected": {
                                    color: "#ffffff",
                                    background:
                                        "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))"
                                },
                            }}
                        />

                    </Tabs>

                    {/* ================= TAB PRODUCTOS ================= */}
                    {tab === 0 && (
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: "1px solid rgba(0,0,0,0.04)",
                                bgcolor: "#f8f9fa",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                overflow: "hidden",
                                m: 1
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                {/* ═══════════════════════════════════════════════════════════
                                    HEADER: Título + Buscador (estilo referencia)
                                    ═══════════════════════════════════════════════════════════ */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        justifyContent: "space-between",
                                        alignItems: { xs: "stretch", sm: "center" },
                                        mb: 3,
                                        gap: 2,
                                    }}
                                >
                                    <Typography variant="h6"
                                        sx={{
                                            p: 1,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                                        <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                                            <ShoppingCartIcon
                                                sx={{
                                                    fill: 'url(#iconGradient)',
                                                    width: 24,
                                                    height: 24
                                                }}
                                            />
                                            <svg width="0" height="0">
                                                <defs>
                                                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </span>
                                        Catalogo de Productos
                                    </Typography>


                                    <TextField
                                        placeholder="Buscar producto..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        size="small"
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: "#a78bfa", fontSize: 20 }} />
                                                    </InputAdornment>
                                                ),
                                            },
                                        }}
                                        sx={{
                                            width: { xs: "100%", sm: 280 },
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2.5,
                                                bgcolor: "white",
                                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                                "& fieldset": {
                                                    borderColor: "rgba(0,0,0,0.06)",
                                                },
                                                "&:hover fieldset": {
                                                    borderColor: "rgba(10, 83, 218, 0.3)",
                                                },
                                                "&.Mui-focused fieldset": {
                                                    borderColor: "rgb(10, 83, 218)",
                                                },
                                            },
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ my: 3 }} />

                                {/* ═══════════════════════════════════════════════════════════
                                    LISTA DE PRODUCTOS (tarjetas estilo referencia)
                                    ═══════════════════════════════════════════════════════════ */}
                                <Stack spacing={1.5}>
                                    {loadingProductos ? (
                                        // Skeletons de carga
                                        <>
                                            <ProductCard codigo="" nombre="" precio={0} stock={0} loading />
                                            <ProductCard codigo="" nombre="" precio={0} stock={0} loading />
                                            <ProductCard codigo="" nombre="" precio={0} stock={0} loading />
                                            <ProductCard codigo="" nombre="" precio={0} stock={0} loading />
                                            <ProductCard codigo="" nombre="" precio={0} stock={0} loading />
                                            <ProductCard codigo="" nombre="" precio={0} stock={0} loading />
                                        </>
                                    ) : errorProductos ? (
                                        // Error
                                        <Box sx={{ textAlign: "center", py: 6 }}>
                                            <Alert severity="error" sx={{ mb: 2 }}>
                                                {errorProductos}
                                            </Alert>
                                            <Button
                                                variant="outlined"
                                                onClick={fetchProductos}
                                                startIcon={<SearchIcon />}
                                            >
                                                Reintentar
                                            </Button>
                                        </Box>
                                    ) : productosFiltrados.length > 0 ? (
                                        // Productos reales de la base de datos
                                        productosFiltrados.map((producto) => (
                                            <ProductCard
                                                key={producto._id}
                                                codigo={producto.codigo_producto}
                                                nombre={producto.nombre_producto}
                                                precio={producto.precio_venta}
                                                stock={producto.stock_inicial}
                                                stockMinimo={producto.stock_minimo}
                                                categoria={producto.categoria_producto} // ← Ya es string, no objeto
                                                onAddToCart={() => agregarAlCarrito(producto)}
                                            />
                                        ))
                                    ) : (
                                        // Sin resultados
                                        <Box
                                            sx={{
                                                width: "100%",
                                                textAlign: "center",
                                                py: 6,
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: 2,
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    bgcolor: "rgba(10, 83, 218, 0.08)",
                                                    color: "rgb(10, 83, 218)",
                                                }}
                                            >
                                                <SearchIcon sx={{ fontSize: 32 }} />
                                            </Avatar>
                                            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                {search ? "No se encontraron productos" : "No hay productos disponibles"}
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                {search ? "Intenta con otro término de búsqueda" : "La base de datos está vacía"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {/* ================= TAB FACTURACIÓN ================= */}
                    {tab === 1 && (
                        <FacturacionTab
                            productos={productos}
                            onFacturaEmitida={(factura) => {
                                // Opcional: sincronizar con el carrito o reportes
                                console.log('Factura emitida:', factura);
                            }}
                        />
                    )}

                    {/* ================= TAB CARRITO ================= */}
                    {tab === 2 && (
                        <Card
                            sx={{
                                height: "100%",
                                minHeight: 600, // ✅ Altura mínima fija para mantener consistencia
                                borderRadius: 3,
                                boxShadow: 5,
                                backgroundColor: "#fff",
                                display: "flex",
                                flexDirection: { xs: "column", md: "row" }, // ✅ Responsive: apilado en móvil, lado a lado en desktop
                                overflow: "hidden",
                                m: 1
                            }}
                        >
                            <Box
                                sx={{
                                    flex: '1 1 70%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: { xs: 2, md: 3 },
                                    borderRight: { xs: 'none', md: '1px solid #eee' },
                                    borderBottom: { xs: '1px solid #eee', md: 'none' },
                                    minHeight: { xs: 300, md: 'auto' },
                                    overflow: 'hidden',
                                    bgcolor: '#f8f9fa',
                                }}
                            >
                                {/* ═══════════════════════════════════════════════════════════
                                        HEADER: Shopping Cart (estilo gradiente de tu app)
                                    ═══════════════════════════════════════════════════════════ */}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',

                                    }}
                                >
                                    <Typography variant="h6"
                                        sx={{
                                            p: 1,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                                        <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                                            <ShoppingCartIcon
                                                sx={{
                                                    fill: 'url(#iconGradient)',
                                                    width: 24,
                                                    height: 24
                                                }}
                                            />
                                            <svg width="0" height="0">
                                                <defs>
                                                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </span>
                                        Carrito de Compras
                                    </Typography>

                                    <Chip
                                        label={`${carrito.length} productos`}
                                        size="medium"
                                        sx={{
                                            bgcolor: 'rgba(10, 83, 218, 0.1)',
                                            color: 'rgb(10, 83, 218)',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            p: 1
                                        }}
                                    />
                                </Box>

                                {/* ═══════════════════════════════════════════════════════════
                                        TABLA HEADER (Item | Quantity | Price | Amount |  )
                                    ═══════════════════════════════════════════════════════════ */}
                                <Divider sx={{ my: 1 }} />

                                <Box
                                    sx={{
                                        display: { xs: 'none', md: 'flex' },
                                        px: 2,
                                        py: 1,
                                        mb: 1,
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: 2,
                                            fontWeight: 600,
                                            color: '#888',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontSize: '0.7rem',
                                            mr: 4
                                        }}
                                    >
                                        Producto
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: 1,
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            color: '#888',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        Cantidad
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: 1,
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            color: '#888',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        Precio
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: 1,
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            color: '#888',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        Descuento
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: 1,
                                            textAlign: 'right',
                                            fontWeight: 600,
                                            color: '#888',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        Total
                                    </Typography>
                                    <Box sx={{ width: 48 }} /> {/* Espacio para botón eliminar */}
                                </Box>

                                {/* ═══════════════════════════════════════════════════════════
                                    LISTA DE PRODUCTOS (tarjetas estilo referencia)
                                    ═══════════════════════════════════════════════════════════ */}
                                <Box
                                    sx={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        minHeight: 0,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 1.5,
                                    }}
                                >
                                    {carrito.length === 0 ? (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                height: '100%',
                                                minHeight: 250,
                                                gap: 2,
                                            }}
                                        >
                                            <Avatar
                                                sx={{
                                                    width: 80,
                                                    height: 80,
                                                    bgcolor: 'rgba(10, 83, 218, 0.08)',
                                                    color: 'rgb(10, 83, 218)',
                                                }}
                                            >
                                                <ShoppingCartIcon sx={{ fontSize: 40 }} />
                                            </Avatar>
                                            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                                No hay productos en el carrito
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                Agrega productos para comenzar
                                            </Typography>
                                        </Box>
                                    ) : (
                                        carrito.map((item) => {
                                            const totalItem = (
                                                item.cantidad *
                                                item.precio *
                                                (1 - item.descuento / 100)
                                            ).toFixed(2);

                                            return (
                                                <Card
                                                    key={item.id}
                                                    elevation={0}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        p: 2,
                                                        borderRadius: 3,
                                                        border: '1px solid rgba(0,0,0,0.04)',
                                                        bgcolor: 'white',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                                        transition: 'all 0.2s ease',
                                                        '&:hover': {
                                                            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                            transform: 'translateY(-1px)',
                                                        },
                                                    }}
                                                >
                                                    {/* ─── IMAGEN PLACEHOLDER ─── */}
                                                    <Avatar
                                                        variant="rounded"
                                                        sx={{
                                                            width: 64,
                                                            height: 64,
                                                            bgcolor: '#e8ecf1',
                                                            color: '#b0b8c4',
                                                            mr: 2,
                                                            flexShrink: 0,
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        <ImageIcon sx={{ fontSize: 28 }} />
                                                    </Avatar>

                                                    {/* ─── INFO PRODUCTO ─── */}
                                                    <Box sx={{ flex: 2, minWidth: 0, mr: -6 }}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.95rem',
                                                                color: '#1a1a2e',
                                                                mb: 0.5,
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {item.nombre}
                                                        </Typography>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: '#888',
                                                                display: 'block',
                                                                mb: 0.5,
                                                            }}
                                                        >
                                                            {item.descripcion || 'Producto del inventario'}
                                                        </Typography>
                                                    </Box>

                                                    {/* ─── CANTIDAD (botones ± estilo referencia) ─── */}
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() => disminuirCantidad(item.id)}
                                                            sx={{
                                                                minWidth: 32,
                                                                height: 32,
                                                                p: 0,
                                                                borderRadius: 1,
                                                                border: 'none',
                                                                bgcolor: 'rgba(255, 174, 0, 0.78)',
                                                                color: 'rgb(255, 255, 255)',
                                                                '&:hover': {
                                                                    bgcolor: 'rgb(255, 166, 0)',
                                                                },
                                                            }}
                                                        >
                                                            <RemoveIcon sx={{ fontSize: 16 }} />
                                                        </Button>

                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                minWidth: 28,
                                                                textAlign: 'center',
                                                                fontSize: '0.9rem',
                                                                color: '#1a1a2e',
                                                            }}
                                                        >
                                                            {item.cantidad}
                                                        </Typography>

                                                        <Button
                                                            onClick={() => aumentarCantidad(item.id)}
                                                            sx={{
                                                                minWidth: 32,
                                                                height: 32,
                                                                p: 0,
                                                                borderRadius: 1,
                                                                border: 'none',
                                                                bgcolor: 'rgba(255, 174, 0, 0.78)',
                                                                color: 'rgb(255, 255, 255)',
                                                                '&:hover': {
                                                                    bgcolor: 'rgb(255, 166, 0)',
                                                                },
                                                            }}
                                                        >
                                                            <AddIcon sx={{ fontSize: 16 }} />
                                                        </Button>
                                                    </Box>

                                                    {/* ─── PRECIO UNITARIO ─── */}
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: '#666',
                                                                fontSize: '0.9rem',
                                                            }}
                                                        >
                                                            {item.precio.toFixed(2)} {moneda}
                                                        </Typography>
                                                    </Box>

                                                    {/* ─── DESCUENTO ─── */}
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        <Button
                                                            onClick={() => disminuirDescuento(item.id)}
                                                            sx={{
                                                                minWidth: 32,
                                                                height: 32,
                                                                p: 0,
                                                                borderRadius: 1,
                                                                border: 'none',
                                                                bgcolor: 'rgba(255, 174, 0, 0.78)',
                                                                color: 'rgb(255, 255, 255)',
                                                                '&:hover': {
                                                                    bgcolor: 'rgb(255, 166, 0)',
                                                                },
                                                            }}
                                                        >
                                                            <RemoveIcon sx={{ fontSize: 16 }} />
                                                        </Button>

                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                minWidth: 28,
                                                                textAlign: 'center',
                                                                fontSize: '0.9rem',
                                                                color: '#1a1a2e',
                                                            }}
                                                        >
                                                            {item.descuento}%
                                                        </Typography>

                                                        <Button
                                                            onClick={() => aumentarDescuento(item.id)}
                                                            sx={{
                                                                minWidth: 32,
                                                                height: 32,
                                                                p: 0,
                                                                borderRadius: 1,
                                                                border: 'none',
                                                                bgcolor: 'rgba(255, 174, 0, 0.78)',
                                                                color: 'rgb(255, 255, 255)',
                                                                '&:hover': {
                                                                    bgcolor: 'rgb(255, 166, 0)',
                                                                },
                                                            }}
                                                        >
                                                            <AddIcon sx={{ fontSize: 16 }} />
                                                        </Button>
                                                    </Box>

                                                    {/* ─── TOTAL ─── */}
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            textAlign: 'right',
                                                            mr: 2,
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                color: '#1a1a2e',
                                                                fontSize: '0.95rem',
                                                            }}
                                                        >
                                                            {totalItem} {moneda}
                                                        </Typography>
                                                    </Box>

                                                    {/* ─── ELIMINAR (X rojo estilo referencia) ─── */}
                                                    <IconButton
                                                        onClick={() => quitarProducto(item.id)}
                                                        sx={{
                                                            width: 36,
                                                            height: 36,
                                                            bgcolor: 'rgb(220, 20, 60)',
                                                            color: 'white',
                                                            borderRadius: '50%',
                                                            '&:hover': {
                                                                bgcolor: 'rgb(200, 10, 40)',
                                                                transform: 'scale(1.05)',
                                                            },
                                                            transition: 'all 0.2s ease',
                                                        }}
                                                    >
                                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Card>
                                            );
                                        })
                                    )}
                                </Box>
                            </Box>

                            {/* ========== LADO DERECHO: FACTURACIÓN (50%) ========== */}
                            <Box
                                sx={{
                                    flex: "1 1 40%", // 
                                    display: "flex",
                                    flexDirection: "column",
                                    p: 3,
                                    backgroundColor: "#fafafa",
                                    overflowY: "auto", //Scroll si el contenido es muy largo
                                    minHeight: { xs: 400, md: "auto" }, //Altura mínima en móvil
                                }}
                            >
                                {/* 💰 Totales */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6"
                                        sx={{
                                            p: 1,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                                        <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                                            <ReceiptLongIcon
                                                sx={{
                                                    fill: 'url(#iconGradient)',
                                                    width: 24,
                                                    height: 24
                                                }}
                                            />
                                            <svg width="0" height="0">
                                                <defs>
                                                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </span>
                                        Factura
                                    </Typography>

                                    <Divider sx={{ my: 1 }} />

                                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                        <Typography color="text.secondary">Subtotal</Typography>
                                        <Typography variant='button' color='success'>{subtotal.toFixed(2)} {moneda}</Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                        <Typography color="text.secondary">Descuento</Typography>
                                        <Typography variant='button' color='error'>-{montoDescuento.toFixed(2)} {moneda}</Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                        <Typography color="text.secondary">Impuesto</Typography>
                                        <Typography>+{montoImpuesto.toFixed(2)} {moneda}</Typography>
                                    </Box>

                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mt: 1,
                                        pt: 1,
                                        borderTop: "2px solid #e0e0e0"
                                    }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: '#888',
                                                fontWeight: 500,
                                            }}
                                        >
                                            Total General:
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                color: '#1a1a2e',
                                                background: 'linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            {totalFinal.toFixed(2)} {moneda}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* 💳 Pago */}
                                <Box
                                    sx={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr", // 2 columnas
                                        gridTemplateRows: "1fr 1fr",    // 2 filas
                                        gap: 2,
                                        width: "100%"
                                    }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<MoneyIcon sx={{ fontSize: "medium" }} />}
                                        onClick={handleOpenPago}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgb(36, 236, 9), rgba(202, 183, 14, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgb(36, 236, 9), rgba(202, 183, 14, 0.9))",
                                                boxShadow: "0 4px 12px rgb(24, 158, 6)"
                                            }
                                        }}
                                    >
                                        Efectivo
                                    </Button>
                                    <DialogPagoEfectivo
                                        open={openPago}
                                        onClose={handleClosePago}
                                        montoTotal={totalFinal}
                                        clienteId={clienteSeleccionado?.id_cliente || ''}  // ← NUEVO
                                        productosCarrito={carrito}                   // ← NUEVO
                                        subtotal={subtotal}                          // ← NUEVO
                                        descuentoTotal={montoDescuento}              // ← NUEVO
                                        impuesto={montoImpuesto}                     // ← NUEVO
                                        onPagoCompletado={handlePagoCompletado}
                                        onVentaExitosa={handleVentaExitosa}          // ← NUEVO
                                    />

                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PaymentIcon sx={{ fontSize: "medium" }} />}
                                        onClick={handleOpenPagoCredito}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgb(255, 238, 0), rgba(226, 64, 14, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgb(255, 238, 0), rgba(226, 64, 14, 0.9))",
                                                boxShadow: "0 4px 12px rgb(238, 102, 12)"
                                            }
                                        }}
                                    >
                                        Credito
                                    </Button>
                                    <DialogPagoCredito
                                        open={openPagoCredito}
                                        onClose={handleClosePagoCredito}
                                        montoTotal={totalFinal}
                                        productosCarrito={carrito}                   // ← NUEVO
                                        subtotal={subtotal}                          // ← NUEVO
                                        descuentoTotal={montoDescuento}              // ← NUEVO
                                        impuesto={montoImpuesto}                     // ← NUEVO
                                        onPagoCompletado={handlePagoCreditoCompletado}
                                        onVentaExitosa={handleVentaExitosa}          // ← NUEVO
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PhoneAndroidIcon sx={{ fontSize: "medium" }} />}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgba(245, 6, 6, 0.9), rgba(10, 83, 218, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(245, 6, 6, 0.9), rgba(10, 83, 218, 0.9))",
                                                boxShadow: "0 4px 12px rgb(12, 83, 235)"
                                            }
                                        }}
                                    >
                                        Transferencia
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PhoneAndroidIcon sx={{ fontSize: "medium" }} />}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgb(6, 70, 245), rgba(45, 218, 10, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgb(6, 70, 245), rgba(45, 218, 10, 0.9))",
                                                boxShadow: "0 4px 12px rgb(12, 190, 235)"
                                            }
                                        }}
                                    >
                                        Extracción
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    )}

                    {/* ================= TAB REPORTE PLUS ================= */}
                    {tab === 2 && (
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                border: "1px solid rgba(0,0,0,0.04)",
                                bgcolor: "#f8f9fa",
                                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                                overflow: "hidden",
                                m: 1
                            }}
                        >
                            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                {/* Header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        justifyContent: "space-between",
                                        alignItems: { xs: "stretch", sm: "center" },
                                        mb: 3,
                                        gap: 2,
                                    }}
                                >
                                    <Typography variant="h6"
                                        sx={{
                                            p: 1,
                                            textAlign: "center",
                                            background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}>
                                        <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                                            <ReceiptLongIcon
                                                sx={{
                                                    fill: 'url(#iconGradient)',
                                                    width: 24,
                                                    height: 24
                                                }}
                                            />
                                            <svg width="0" height="0">
                                                <defs>
                                                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </span>
                                        Reporte Plus - Historial de Ventas
                                    </Typography>

                                    <Chip
                                        label={`${ventasHistorial.length} ventas registradas`}
                                        size="medium"
                                        sx={{
                                            bgcolor: 'rgba(10, 83, 218, 0.1)',
                                            color: 'rgb(10, 83, 218)',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            p: 1
                                        }}
                                    />
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* CustomDataGridR con los datos de ventas */}
                                <CustomDataGridR<VentaHistorial>
                                    rows={ventasHistorial}
                                    columns={reportePlusColumns}
                                    getRowId={(row) => row.id}
                                    title="Historial de Ventas"
                                    onEditRow={(row) => {
                                        console.log('Editar venta:', row);
                                        // Aquí puedes implementar edición si lo necesitas
                                    }}
                                />
                            </CardContent>
                        </Card>
                    )}

                    {/*Reporte Caja*/}
                    {tab === 3 && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Reporte Caja
                            </Typography>

                        </Box>
                    )}

                    {/*Cuadre de Caja*/}
                    {tab === 4 && (
                        <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Cuadre de Caja
                            </Typography>

                        </Box>
                    )}

                </Box>
            </Box>
        </Box >
    );
}
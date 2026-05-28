// src/pages/PuntoVentaPage.tsx
import React, { useState } from 'react';
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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
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
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ImageIcon from '@mui/icons-material/Image';
import RemoveIcon from '@mui/icons-material/Remove';
import DialogCrearCliente, { type ClienteFormData } from '../../components/AddClientDialog';
import DialogPagoEfectivo, { type PagoEfectivoData } from '../../components/PagoEfectivoDialog';

export default function PuntoVentaPage() {
    const [search, setSearch] = React.useState("");

    const productos = [
        {
            id: 1,
            nombre: "Arroz 1kg",
            precio: 250,
            stock: 15,
            categoria: "Alimentos",
            imagen: "https://via.placeholder.com/300",
            descuento: 0
        },
        {
            id: 2,
            nombre: "Aceite 1L",
            precio: 800,
            stock: 5,
            categoria: "Alimentos",
            imagen: "https://via.placeholder.com/300",
            descuento: 0
        },
        {
            id: 3,
            nombre: "Refresco Cola",
            precio: 350,
            stock: 0,
            categoria: "Bebidas",
            imagen: "https://via.placeholder.com/300",
            descuento: 0
        },
        {
            id: 4,
            nombre: "Arroz",
            precio: 250,
            stock: 15,
            categoria: "Alimentos",
            imagen: "https://via.placeholder.com/300",
            descuento: 0
        },
        {
            id: 5,
            nombre: "Aceite 1L",
            precio: 800,
            stock: 5,
            categoria: "Alimentos",
            imagen: "https://via.placeholder.com/300",
            descuento: 0
        },
        {
            id: 6,
            nombre: "Refresco Cola",
            precio: 350,
            stock: 0,
            categoria: "Bebidas",
            imagen: "https://via.placeholder.com/300",
            descuento: 0
        }
    ];

    const productosFiltrados = productos.filter((producto) => {
        const texto = search.toLowerCase();
        return (
            producto.nombre.toLowerCase().includes(texto) ||
            producto.categoria.toLowerCase().includes(texto) ||
            producto.precio.toString().includes(texto)
        );
    });

    const [tab, setTab] = React.useState(0);

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteFormData | null>(null);

    const [carrito, setCarrito] = React.useState<any[]>([]);
    const [animateId, setAnimateId] = React.useState<number | null>(null);

    // 💳 Pago mixto
    const [transferencia, setTransferencia] = React.useState("");

    // 🎟 Descuento
    const [descuento, setDescuento] = React.useState(0);

    // 📊 Impuesto dinámico
    const [impuesto, setImpuesto] = React.useState(0);

    // 🧾 Datos de facturación
    const [cliente, setCliente] = React.useState("");
    const [nit, setNit] = React.useState("");

    const agregarAlCarrito = (producto: any) => {
        setAnimateId(producto.id);

        setCarrito((prev) => {
            const existe = prev.find((p) => p.id === producto.id);

            if (existe) {
                return prev.map((p) =>
                    p.id === producto.id
                        ? { ...p, cantidad: p.cantidad + 1 }
                        : p
                );
            }

            return [...prev, { ...producto, cantidad: 1 }];
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
            const item = carrito.find(p => p.id === prod.id);
            if (item) {
                return {
                    ...prod,
                    stock: prod.stock - item.cantidad
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

    return (
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
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                }}>
                <Typography variant="h5" sx={{ ml: 2, color: 'white' }}>
                    Punto de Venta
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
                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                                boxShadow: "0 4px 12px rgba(5, 118, 248, 0.93)"
                            }
                        }}
                    >
                        Nueva Venta
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<PictureAsPdfIcon sx={{ fontSize: "medium" }} />}
                        sx={{
                            ml: 1,
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                boxShadow: "0 4px 12px rgb(158, 6, 6)"
                            }
                        }}
                    >
                        Exportar PDF
                    </Button>
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
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: "1.25rem",
                                            color: "#1a1a2e",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <ShoppingCartIcon
                                            sx={{
                                                color: "transparent",
                                                background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                                                backgroundClip: "text",
                                                WebkitBackgroundClip: "text",
                                                fontSize: 26,
                                            }}
                                        />
                                        Catálogo de Productos
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

                                {/* ═══════════════════════════════════════════════════════════
                                    HEADER DE COLUMNAS (estilo referencia - solo desktop)
                                    ═══════════════════════════════════════════════════════════ */}
                                <Box
                                    sx={{
                                        display: { xs: "none", md: "flex" },
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
                                            color: "#888",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            fontSize: "0.7rem",
                                            pl: 11, // Alineado con la imagen
                                        }}
                                    >
                                        Producto
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: 1,
                                            textAlign: "center",
                                            fontWeight: 600,
                                            color: "#888",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            fontSize: "0.7rem",
                                        }}
                                    >
                                        Categoría
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            flex: 1,
                                            textAlign: "right",
                                            fontWeight: 600,
                                            color: "#888",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.05em",
                                            fontSize: "0.7rem",
                                        }}
                                    >
                                        Precio / Acción
                                    </Typography>
                                </Box>

                                {/* ═══════════════════════════════════════════════════════════
                                    LISTA DE PRODUCTOS (tarjetas estilo referencia)
                                    ═══════════════════════════════════════════════════════════ */}
                                <Stack spacing={1.5}>
                                    {productosFiltrados.length > 0 ? (
                                        productosFiltrados.map((producto) => (
                                            <ProductCard
                                                key={producto.id}
                                                nombre={producto.nombre}
                                                precio={producto.precio}
                                                stock={producto.stock}
                                                categoria={producto.categoria}
                                                imagen={producto.imagen}
                                                onAddToCart={() => agregarAlCarrito(producto)}
                                            />
                                        ))
                                    ) : (
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
                                                No se encontraron productos
                                            </Typography>
                                            <Typography variant="caption" color="text.disabled">
                                                Intenta con otro término de búsqueda
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {/* ================= TAB CARRITO ================= */}
                    {tab === 1 && (
                        <Card
                            sx={{
                                height: "100%",
                                minHeight: 600, // ✅ Altura mínima fija para mantener consistencia
                                borderRadius: 1,
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
                                        mb: 3,
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontWeight: 700,
                                            fontSize: '1.25rem',
                                            color: '#1a1a2e',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <ShoppingCartIcon
                                            sx={{
                                                color: 'transparent',
                                                background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                fontSize: 28,
                                            }}
                                        />
                                        Carrito de Compras
                                    </Typography>

                                    <Chip
                                        label={`${carrito.length} items`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(10, 83, 218, 0.1)',
                                            color: 'rgb(10, 83, 218)',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                        }}
                                    />
                                </Box>

                                {/* ═══════════════════════════════════════════════════════════
                                        TABLA HEADER (Item | Quantity | Price | Amount |  )
                                    ═══════════════════════════════════════════════════════════ */}
                                <Divider />
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
                                                    <Box sx={{ flex: 2, minWidth: 0, mr: 2 }}>
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
                                                        {item.descuento > 0 && (
                                                            <Chip
                                                                label={`-${item.descuento}% desc.`}
                                                                size="small"
                                                                sx={{
                                                                    height: 20,
                                                                    fontSize: '0.65rem',
                                                                    bgcolor: 'rgba(255, 140, 0, 0.1)',
                                                                    color: 'rgb(255, 140, 0)',
                                                                    fontWeight: 600,
                                                                }}
                                                            />
                                                        )}
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
                                    flex: "1 1 55%", // 
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
                                            borderRadius: 1,
                                            boxShadow: 2,
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
                                                        <stop offset="0%" stopColor="rgb(0, 174, 255)" />
                                                        <stop offset="100%" stopColor="rgb(196, 45, 226)" />
                                                    </linearGradient>
                                                </defs>
                                            </svg>
                                        </span>
                                        Factura
                                    </Typography>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            width: "100%",
                                            mt: 1,
                                            mb: 1,
                                            gap: 1,
                                            alignItems: "center",
                                        }}>
                                        <TextField
                                            sx={{
                                                width: "75%",
                                            }}
                                            label="Cliente"
                                            size='small'
                                            value={cliente}
                                            onChange={(e) => setCliente(e.target.value)}
                                        />
                                        <Button
                                            variant="contained"
                                            size='small'
                                            startIcon={<PersonAddIcon sx={{ fontSize: "medium" }} />}
                                            onClick={() => setOpenDialog(true)}
                                            sx={{
                                                width: "40%",
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
                                            Nuevo Cliente
                                        </Button>
                                        <DialogCrearCliente
                                            open={openDialog}
                                            onClose={() => setOpenDialog(false)}
                                            onClienteCreado={handleClienteCreado}
                                        />
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                        <Typography color="text.secondary">Subtotal</Typography>
                                        <Typography>{subtotal.toFixed(2)} {moneda}</Typography>
                                    </Box>

                                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                        <Typography color="text.secondary">Descuento</Typography>
                                        <Typography>-{montoDescuento.toFixed(2)} {moneda}</Typography>
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
                                        gridTemplateColumns: "1fr 1fr", // 2 columnas iguales
                                        gridTemplateRows: "1fr 1fr",    // 2 filas iguales
                                        gap: 2,                          // Espacio entre botones
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
                                        Pago en Efectivo
                                    </Button>
                                    <DialogPagoEfectivo
                                        open={openPago}
                                        onClose={handleClosePago}
                                        montoTotal={totalFinal}
                                        onPagoCompletado={handlePagoCompletado}
                                    />

                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PaymentIcon sx={{ fontSize: "medium" }} />}
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
                                        Pago por Credito
                                    </Button>
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
                                        Pago por Transferencia
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<CurrencyExchangeIcon sx={{ fontSize: "medium" }} />}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                                boxShadow: "0 4px 12px rgb(31, 235, 12)"
                                            }
                                        }}
                                    >
                                        Cambio
                                    </Button>
                                </Box>
                            </Box>
                        </Card>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
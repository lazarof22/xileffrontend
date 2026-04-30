// src/pages/PuntoVentaPage.tsx
import React, { useState } from 'react';
import {
    Card, CardContent, Typography, Box, IconButton, Button,
    TextField,
    Tabs,
    Tab,
    InputAdornment,
    Badge,
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
import DialogCrearCliente, { type ClienteFormData } from '../../components/AddClientDialog';

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
                        <Card>
                            <CardContent>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        mb: 3
                                    }}
                                >
                                    <TextField
                                        placeholder="Buscar producto..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        slotProps={{
                                            input: {
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ color: "#a78bfa" }} />
                                                    </InputAdornment>
                                                )
                                            }
                                        }}
                                        sx={{
                                            width: { xs: "100%", sm: "60%", md: "50%" }
                                        }}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 2
                                    }}
                                >
                                    {productosFiltrados.length > 0 ? (
                                        productosFiltrados.map((producto) => (
                                            <Box key={producto.id}>
                                                <ProductCard
                                                    nombre={producto.nombre}
                                                    precio={producto.precio}
                                                    stock={producto.stock}
                                                    categoria={producto.categoria}
                                                    imagen={producto.imagen}
                                                    onAddToCart={() => agregarAlCarrito(producto)}
                                                />
                                            </Box>
                                        ))
                                    ) : (
                                        <Box sx={{ width: "100%", textAlign: "center", py: 5 }}>
                                            <Typography color="text.secondary">
                                                No se encontraron productos
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
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
                            {/* ========== LADO IZQUIERDO: CARRITO (50%) ========== */}
                            <Box
                                sx={{
                                    flex: "1 1 70%", // ✅ 50% del ancho
                                    display: "flex",
                                    flexDirection: "column",
                                    p: 3,
                                    borderRight: { xs: "none", md: "1px solid #eee" }, // ✅ Borde solo en desktop
                                    borderBottom: { xs: "1px solid #eee", md: "none" }, // ✅ Borde inferior en móvil
                                    minHeight: { xs: 300, md: "auto" }, // ✅ Altura mínima en móvil
                                    overflow: "hidden", // ✅ Evita que crezca descontroladamente
                                }}
                            >
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
                                                    <stop offset="0%" stopColor="rgb(0, 174, 255)" />
                                                    <stop offset="100%" stopColor="rgb(196, 45, 226)" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </span>
                                    Carrito de Compras
                                </Typography>

                                {/* ✅ Contenedor scrollable para los items */}
                                <Box sx={{
                                    flex: 1,
                                    overflowY: "auto",
                                    minHeight: 0 // ✅ Importante: permite que flex funcione correctamente
                                }}>
                                    {carrito.length === 0 ? (
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            minHeight: 200
                                        }}>
                                            <Typography color="text.secondary">
                                                No hay productos en el carrito
                                            </Typography>
                                        </Box>
                                    ) : (
                                        carrito.map((item) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                    py: 2,
                                                    borderBottom: "1px solid #f0f0f0"
                                                }}
                                            >
                                                {/* 🏷 Nombre + precio */}
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        Producto: {item.nombre}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Precio: {item.precio} {moneda}
                                                    </Typography>
                                                </Box>

                                                {/* 🔢 Cantidad */}
                                                <Box sx={{ textAlign: "center" }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Cant
                                                    </Typography>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Button

                                                            variant="outlined"
                                                            onClick={() => disminuirCantidad(item.id)}
                                                        >
                                                            -
                                                        </Button>
                                                        <Typography sx={{ fontWeight: "bold", minWidth: 24, textAlign: "center" }}>
                                                            {item.cantidad}
                                                        </Typography>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => aumentarCantidad(item.id)}
                                                        >
                                                            +
                                                        </Button>
                                                    </Box>
                                                </Box>

                                                {/* 🎟 Descuento (%) */}
                                                <Box sx={{ textAlign: "center", flexShrink: 0 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Desc %
                                                    </Typography>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            onClick={() => disminuirDescuento(item.id)}
                                                        >
                                                            -
                                                        </Button>
                                                        <Typography sx={{ fontWeight: "bold", minWidth: 30, textAlign: "center" }}>
                                                            {item.descuento}%
                                                        </Typography>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            onClick={() => aumentarDescuento(item.id)}
                                                        >
                                                            +
                                                        </Button>
                                                    </Box>
                                                </Box>

                                                {/* 💰 Total */}
                                                <Box sx={{ minWidth: 110, textAlign: "right", flexShrink: 0 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Total
                                                    </Typography>
                                                    <Typography sx={{ fontWeight: "bold" }}>
                                                        {((item.cantidad * item.precio) * (1 - item.descuento / 100)).toFixed(2)} {moneda}
                                                    </Typography>
                                                </Box>

                                                {/* ❌ Eliminar */}
                                                <IconButton
                                                    color="error"
                                                    onClick={() => quitarProducto(item.id)}
                                                    sx={{ flexShrink: 0 }}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Box>
                                        ))
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

                                    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                        <Typography color="text.secondary">Cambio:</Typography>
                                        <Typography sx={{ color: cambio > 0 ? "success.main" : "text.secondary" }}>
                                            {cambio.toFixed(2)} {moneda}
                                        </Typography>
                                    </Box>

                                    <Box sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mt: 1,
                                        pt: 1,
                                        borderTop: "2px solid #e0e0e0"
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                            TOTAL
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
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
                                        Pago por Tarjeta
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

                                {/* 🔘 Botón Checkout */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    sx={{
                                        py: 1.5,
                                        borderRadius: 2,
                                        fontWeight: "bold",
                                        fontSize: "1.1rem"
                                    }}
                                    disabled={totalPagado < totalFinal || carrito.length === 0}
                                    onClick={() => {
                                        generarTicket();
                                        finalizarVenta();
                                    }}
                                >
                                    CHECK OUT
                                </Button>
                            </Box>
                        </Card>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
'use client';
import DashboardLayout from "@/components/DashboardLayout";
import {
    Card, CardContent, Typography, Grid, Box, IconButton, Button, Dialog,
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
    InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import ProductCard from "@/components/ProductCard";
import React from "react";
import jsPDF from "jspdf";

export default function puntoVentaPage() {

    const [search, setSearch] = React.useState("");

    const productos = [
        {
            id: 1,
            nombre: "Arroz 1kg",
            precio: 250,
            stock: 15,
            categoria: "Alimentos",
            imagen: "https://via.placeholder.com/300"
        },
        {
            id: 2,
            nombre: "Aceite 1L",
            precio: 800,
            stock: 5,
            categoria: "Alimentos",
            imagen: "https://via.placeholder.com/300"
        },
        {
            id: 3,
            nombre: "Refresco Cola",
            precio: 350,
            stock: 0,
            categoria: "Bebidas",
            imagen: "https://via.placeholder.com/300"
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

    const [carrito, setCarrito] = React.useState<any[]>([]);
    const [animateId, setAnimateId] = React.useState<number | null>(null);

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

    const totalItems = carrito.reduce(
        (acc, item) => acc + item.cantidad,
        0
    );

    const [moneda, setMoneda] = React.useState("CUP");
    const [tasa, setTasa] = React.useState(1); // tasa activa según moneda

    const convertirPrecio = (precioCUP: number) => {
        if (moneda === "CUP") return precioCUP;
        return precioCUP / tasa;
    };

    const totalConvertido = convertirPrecio(total);

    const [efectivo, setEfectivo] = React.useState("");

    const cambio = Number(efectivo) - totalConvertido;

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
            format: [80, 200] // tamaño ticket térmico
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

        doc.save("ticket.pdf");
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
                                boxShadow: "none",
                                "&:hover": {
                                    background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
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
                                boxShadow: "none",
                                "&:hover": {
                                    background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
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

                    {/* 🛍 PRODUCTOS 50% */}
                    <Box sx={{ flex: 1 }}>
                        <Card sx={{ height: "100%" }}>
                            <CardContent>

                                <TextField
                                    fullWidth
                                    placeholder="Buscar producto..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    sx={{ mb: 3 }}
                                />

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 2
                                    }}
                                >
                                    {productosFiltrados.length > 0 ? (
                                        productosFiltrados.map((producto) => (
                                            <Box
                                                key={producto.id}
                                            >
                                                <ProductCard
                                                    {...producto}
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
                    </Box>


                    {/* 🛒 CARRITO 50% */}
                    <Box sx={{ flex: 1 }}>
                        <Card
                            sx={{
                                height: "100%",
                                display: "flex",
                                flexDirection: "column"
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1, overflowY: "auto" }}>

                                <Typography variant="h6" gutterBottom>
                                    🛒 Carrito
                                </Typography>

                                {carrito.length === 0 ? (
                                    <Typography color="text.secondary">
                                        No hay productos
                                    </Typography>
                                ) : (
                                    carrito.map((item) => (
                                        <Card key={item.id} sx={{ mb: 2, p: 1 }}>
                                            <Typography fontWeight="bold">
                                                {item.nombre}
                                            </Typography>

                                            <Typography variant="body2">
                                                {item.cantidad} x {item.precio} CUP
                                            </Typography>

                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    mt: 1
                                                }}
                                            >
                                                <Typography fontWeight="bold">
                                                    {item.precio * item.cantidad} CUP
                                                </Typography>

                                                <Button
                                                    size="small"
                                                    color="error"
                                                    onClick={() => quitarProducto(item.id)}
                                                >
                                                    Quitar
                                                </Button>
                                            </Box>
                                        </Card>
                                    ))
                                )}

                            </CardContent>

                            <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>

                                <Typography variant="h6">
                                    Total: {totalConvertido.toLocaleString("es-ES", {
                                        minimumFractionDigits: 2
                                    })} {moneda}
                                </Typography>

                                <TextField
                                    fullWidth
                                    label="Efectivo recibido"
                                    type="number"
                                    value={efectivo}
                                    onChange={(e) => setEfectivo(e.target.value)}
                                    sx={{ mt: 2 }}
                                />

                                <Typography sx={{ mt: 1 }}>
                                    Cambio: {cambio > 0 ? cambio.toFixed(2) : "0.00"} {moneda}
                                </Typography>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 2 }}
                                    disabled={Number(efectivo) < totalConvertido}
                                    onClick={() => {
                                        generarTicket();
                                        finalizarVenta();
                                    }}
                                >
                                    Finalizar Venta
                                </Button>

                            </Box>

                        </Card>
                    </Box>

                </Box>
            </Box>
        </DashboardLayout>
    );
}
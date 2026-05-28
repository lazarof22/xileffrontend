// src/components/ProductCard.tsx
import {
    Card,
    CardContent,
    Typography,
    Button,
    Box,
    Avatar,
    Chip,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ImageIcon from "@mui/icons-material/Image";

interface ProductCardProps {
    nombre: string;
    precio: number;
    stock: number;
    categoria: string;
    imagen?: string;
    onAddToCart?: () => void;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "CUP",
    }).format(value);
};

export default function ProductCard({
    nombre,
    precio,
    stock,
    categoria,
    onAddToCart,
}: ProductCardProps) {
    const sinStock = stock <= 0;

    return (
        <Card
            elevation={0}
            sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 3,
                border: "1px solid rgba(0,0,0,0.04)",
                bgcolor: "white",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.2s ease",
                width: "100%",
                maxWidth: "100%",
                "&:hover": {
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                    transform: "translateY(-1px)",
                },
            }}
        >
            {/* ═══════════════════════════════════════════════════════════
                IMAGEN PLACEHOLDER (estilo referencia)
                ═══════════════════════════════════════════════════════════ */}
            <Avatar
                variant="rounded"
                sx={{
                    width: 80,
                    height: 80,
                    bgcolor: "#e8ecf1",
                    color: "#b0b8c4",
                    mr: 2.5,
                    flexShrink: 0,
                    borderRadius: 2.5,
                }}
            >
                <ImageIcon sx={{ fontSize: 32 }} />
            </Avatar>

            {/* ═══════════════════════════════════════════════════════════
                INFO DEL PRODUCTO
                ═══════════════════════════════════════════════════════════ */}
            <Box sx={{ flex: 1, minWidth: 0, mr: 2 }}>
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "#1a1a2e",
                        mb: 0.5,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {nombre}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: "#888",
                        mb: 1,
                        fontSize: "0.8rem",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {categoria}
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                        label={sinStock ? "Sin Stock" : `${stock} disponibles`}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            bgcolor: sinStock
                                ? "rgba(255, 0, 0, 0.08)"
                                : "rgba(10, 218, 20, 0.1)",
                            color: sinStock
                                ? "rgb(220, 20, 60)"
                                : "rgb(10, 218, 20)",
                            borderRadius: 1,
                        }}
                    />
                </Box>
            </Box>

            {/* ═══════════════════════════════════════════════════════════
                PRECIO + BOTÓN
                ═══════════════════════════════════════════════════════════ */}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 1,
                    flexShrink: 0,
                }}
            >
                <Typography
                    sx={{
                        fontWeight: 700,
                        fontSize: "1.1rem",
                        color: "#1a1a2e",
                        background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    {formatCurrency(precio)}
                </Typography>

                <Button
                    disabled={sinStock}
                    onClick={onAddToCart}
                    sx={{
                        minWidth: 140,
                        py: 0.8,
                        px: 2,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        background: sinStock
                            ? "#e0e0e0"
                            : "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(196, 45, 226, 0.9))",
                        color: sinStock ? "#999" : "white",
                        boxShadow: sinStock
                            ? "none"
                            : "0 4px 12px rgba(10, 83, 218, 0.3)",
                        "&:hover": {
                            background: sinStock
                                ? "#e0e0e0"
                                : "linear-gradient(135deg, rgba(10, 83, 218, 1), rgba(196, 45, 226, 1))",
                            boxShadow: sinStock
                                ? "none"
                                : "0 6px 16px rgba(10, 83, 218, 0.4)",
                        },
                    }}
                    startIcon={<ShoppingCartIcon sx={{ fontSize: 18 }} />}
                >
                    {sinStock ? "Agotado" : "Agregar"}
                </Button>
            </Box>
        </Card>
    );
}
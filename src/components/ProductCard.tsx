// src/components/ProductCard.tsx
import {
    Card,
    CardContent,
    Typography,
    Button,
    CardActionArea,
    CardActions,
    Box
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

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
            sx={{
                maxWidth: 320,
                borderRadius: 1,
                background: "linear-gradient(145deg, #e2e5ec, #e0e7f1)",
                color: "primary.main",
                boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 60px rgba(150, 148, 148, 0.6)"
                }
            }}
        >
            <CardActionArea sx={{ p: 2 }}>

                <CardContent sx={{ p: 0 }}>

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
                        {nombre}
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            mt: 1,
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Precio: {formatCurrency(precio)}
                    </Typography>

                    <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography
                            variant="body1"
                            sx={{
                                opacity: 0.8,
                                color: "black"
                            }}>
                            Categoría: {categoria}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: sinStock ? "#f31d1d" : "#09b817",
                            }}
                        >
                            {sinStock ? "Sin Stock" : `Stock disponible: ${stock}`}
                        </Typography>
                    </Box>
                </CardContent>
            </CardActionArea>

            <CardActions sx={{ p: 2 }}>
                <Button
                    fullWidth
                    disabled={sinStock}
                    onClick={onAddToCart}
                    sx={{
                        borderRadius: 1,
                        py: 1.2,
                        background: "linear-gradient(150deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                        color: "#fff",
                        transition: "0.3s",
                        "&:hover": {
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                            boxShadow: "0 6px 12px rgba(238, 10, 10, 0.77)",
                        },
                        "&:disabled": {
                            background: "#555",
                            color: "#aaa"
                        }
                    }}
                    startIcon={<ShoppingCartIcon />}
                >
                    Agregar al carrito
                </Button>
            </CardActions>
        </Card>
    );
}
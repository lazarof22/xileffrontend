// src/components/ProductCard.tsx
import {
    Card,
    CardContent,
    CardMedia,
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
    imagen,
    onAddToCart,
}: ProductCardProps) {
    const sinStock = stock <= 0;

    return (
        <Card
            sx={{
                maxWidth: 320,
                borderRadius: 1,
                background: "linear-gradient(145deg, #aeb6c9, #1e293b)",
                color: "#fff",
                boxShadow: "0 15px 40px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.6)"
                }
            }}
        >
            <CardActionArea sx={{ p: 2 }}>
                {imagen && (
                    <CardMedia
                        component="img"
                        height="160"
                        image={imagen}
                        alt={nombre}
                        sx={{
                            borderRadius: 3,
                            mb: 2
                        }}
                    />
                )}

                <CardContent sx={{ p: 0 }}>
                    
                    <Typography variant="h6" fontWeight="bold">
                        {nombre}
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            mt: 1,
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontWeight: "bold"
                        }}
                    >
                        {formatCurrency(precio)}
                    </Typography>

                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Categoría: {categoria}
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: sinStock ? "#ff4d4d" : "#4ade80",
                                fontWeight: 500
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
                        borderRadius: 3,
                        py: 1.2,
                        fontWeight: "bold",
                        background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                        color: "#fff",
                        transition: "0.3s",
                        "&:hover": {
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))"
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
import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CardActionArea,
  CardActions,
  Chip,
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
        boxShadow: 3,
        transition: "0.3s",
        "&:hover": { transform: "scale(1.02)" }
      }}
    >
      <CardActionArea>
        {imagen && (
          <CardMedia
            component="img"
            height="180"
            image={imagen}
            alt={nombre}
          />
        )}

        <CardContent>
          <Typography gutterBottom variant="h6">
            {nombre}
          </Typography>

          <Typography variant="h6" color="primary" fontWeight="bold">
            {formatCurrency(precio)}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
            <Chip
              label={categoria}
              size="small"
              color="secondary"
              variant="outlined"
            />

            <Chip
              label={
                sinStock ? "Sin Stock" : `Stock: ${stock}`
              }
              size="small"
              color={sinStock ? "error" : "success"}
            />
          </Box>
        </CardContent>
      </CardActionArea>

      <CardActions>
        <Button
          fullWidth
          variant="contained"
          startIcon={<ShoppingCartIcon />}
          disabled={sinStock}
          onClick={onAddToCart}
        >
          Agregar al carrito
        </Button>
      </CardActions>
    </Card>
  );
}
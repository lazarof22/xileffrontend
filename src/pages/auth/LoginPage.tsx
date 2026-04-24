// src/pages/LoginPage.tsx
import * as React from "react";
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [showPassword, setShowPassword] = React.useState(false);
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f4f7fb",
                p: 2,
            }}
        >
            <Card
                sx={{
                    width: "100%",
                    maxWidth: 1000,
                    height: 550,
                    display: "flex",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: 10,
                }}
            >
                {/* 🔹 PANEL IZQUIERDO (FORM) */}
                <Box
                    sx={{
                        width: "45%",
                        p: 6,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        backgroundColor: "#fff",
                    }}
                >
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                        Bienvenido
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                        Accede al sistema ERP
                    </Typography>

                    <TextField label="Usuario" fullWidth margin="normal" />

                    <TextField
                        label="Contraseña"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        margin="normal"
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
                        }}
                    >
                        <FormControlLabel control={<Checkbox />} label="Recordarme" />
                        <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
                            ¿Olvidaste tu contraseña?
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        sx={{
                            mt: 4,
                            borderRadius: 2,
                            background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9))"
                        }}
                        onClick={() => navigate("/dashboard")}
                    >
                        Iniciar sesión
                    </Button>

                </Box>

                {/* 🔹 PANEL DERECHO (IMAGEN / GRADIENTE) */}
                <Box
                    sx={{
                        width: "55%",
                        position: "relative",
                        color: "#fff",
                        display: { xs: "none", md: "flex" },
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        p: 6,
                        background:
                            "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                >
                    <Box>
                        <Typography variant="overline" sx={{ letterSpacing: 3 }}>
                            BIENVENIDO A
                        </Typography>

                        <Typography variant="h3" sx={{ fontWeight: 700, mt: 2 }}>
                            Sistema XILEF
                        </Typography>

                        <Typography sx={{ mt: 2 }}>
                            Plataforma de gestión empresarial
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
}
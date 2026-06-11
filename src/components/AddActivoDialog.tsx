// src/components/AddActivoDialog.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Typography,
    CircularProgress,
    Box
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ==================== INTERFACES ====================
export interface ActivoFormData {
    codigoActivo: string;
    descripcionActivo: string;
    proveedor: string;
    area: string;
    fechaCompra: string;
    valor: number;
    depreciacionActivo: string;
    depreciacionAcumulada: number;
    vidaUtil: number;
    compra: string;
    ajusteValor: number;
    movimiento: 'ALTA' | 'BAJA';
    estadoActivo: string;
}

export interface AddActivoDialogProps {
    open: boolean;
    onClose: () => void;
    onActivoCreado?: (activo: ActivoFormData) => void;
}

// ==================== CONSTANTES ====================
const MOVIMIENTOS = [
    { label: "Alta", value: "ALTA" },
    { label: "Baja", value: "BAJA" },
];

// Estilo base para cada CELDA del grid (cada input ocupa una celda)
const CELL_STYLE = {
    flex: '1 1 45%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-end', // Alinea el contenido al fondo para que los labels queden arriba alineados
    minHeight: 80, // Altura mínima consistente para todas las celdas
};

// Estilo para el label de los DatePickers (mismo estilo que MUI InputLabel)
const LABEL_STYLE = {
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.6)',
    mb: 0.5,
    ml: 0.3,
};

// ==================== COMPONENTE ====================
export default function AddActivoDialog({
    open,
    onClose,
    onActivoCreado,
}: AddActivoDialogProps): React.JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [fechaCompra, setFechaCompra] = useState<dayjs.Dayjs | null>(null);

    const [newActivo, setNewActivo] = useState<ActivoFormData>({
        codigoActivo: "",
        descripcionActivo: "",
        proveedor: "",
        area: "",
        fechaCompra: "",
        valor: 0,
        depreciacionActivo: "",
        depreciacionAcumulada: 0,
        vidaUtil: 0,
        compra: "",
        ajusteValor: 0,
        movimiento: "ALTA",
        estadoActivo: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ==================== HANDLERS ====================
    const handleChange = (field: keyof ActivoFormData, value: string | number) => {
        setNewActivo((prev) => {
            const updated = { ...prev, [field]: value };
            if (errors[field]) {
                setErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[field];
                    return newErrors;
                });
            }
            return updated;
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!newActivo.codigoActivo.trim()) newErrors.codigoActivo = "El código es obligatorio";
        if (!newActivo.descripcionActivo.trim()) newErrors.descripcionActivo = "La descripción es obligatoria";
        if (!newActivo.proveedor.trim()) newErrors.proveedor = "El proveedor es obligatorio";
        if (!newActivo.area.trim()) newErrors.area = "El área es obligatoria";
        if (!newActivo.fechaCompra) newErrors.fechaCompra = "La fecha de compra es obligatoria";
        if (newActivo.valor <= 0) newErrors.valor = "El valor debe ser mayor a 0";
        if (!newActivo.depreciacionActivo.trim()) newErrors.depreciacionActivo = "La tasa de depreciación es obligatoria";
        if (newActivo.vidaUtil <= 0) newErrors.vidaUtil = "La vida útil debe ser mayor a 0";
        if (!newActivo.compra.trim()) newErrors.compra = "La compra es obligatoria";
        if (!newActivo.estadoActivo.trim()) newErrors.estadoActivo = "El estado es obligatorio";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateActivo = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/activofijo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newActivo),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const createdActivo = await response.json();

            if (onActivoCreado) {
                onActivoCreado(createdActivo);
            }

            // Resetear formulario
            setNewActivo({
                codigoActivo: "",
                descripcionActivo: "",
                proveedor: "",
                area: "",
                fechaCompra: "",
                valor: 0,
                depreciacionActivo: "",
                depreciacionAcumulada: 0,
                vidaUtil: 0,
                compra: "",
                ajusteValor: 0,
                movimiento: "ALTA",
                estadoActivo: "",
            });
            setFechaCompra(null);
            setErrors({});
            onClose();

        } catch (error: any) {
            setErrors({ general: error.message || 'Error al crear el activo' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = () => {
        setNewActivo({
            codigoActivo: "",
            descripcionActivo: "",
            proveedor: "",
            area: "",
            fechaCompra: "",
            valor: 0,
            depreciacionActivo: "",
            depreciacionAcumulada: 0,
            vidaUtil: 0,
            compra: "",
            ajusteValor: 0,
            movimiento: "ALTA",
            estadoActivo: "",
        });
        setFechaCompra(null);
        setErrors({});
        onClose();
    };

    // ==================== RENDER ====================
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
                open={open}
                onClose={handleCancelar}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
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
                            <PersonAddIcon
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
                        Nuevo Activo
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 1 }}>
                    {/* ═══════════════════════════════════════════════════════
                        GRID DE 2 COLUMNAS CON ALINEACIÓN PERFECTA
                        ═══════════════════════════════════════════════════════ */}
                    
                    {/* Fila 1: Código y Descripción */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Código del Activo"
                                value={newActivo.codigoActivo}
                                onChange={(e) => handleChange("codigoActivo", e.target.value)}
                                error={!!errors.codigoActivo}
                                helperText={errors.codigoActivo}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Descripción"
                                value={newActivo.descripcionActivo}
                                onChange={(e) => handleChange("descripcionActivo", e.target.value)}
                                error={!!errors.descripcionActivo}
                                helperText={errors.descripcionActivo}
                            />
                        </Box>
                    </Box>

                    {/* Fila 2: Proveedor y Área */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Proveedor (ID)"
                                value={newActivo.proveedor}
                                onChange={(e) => handleChange("proveedor", e.target.value)}
                                error={!!errors.proveedor}
                                helperText={errors.proveedor || ""}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Área (ID)"
                                value={newActivo.area}
                                onChange={(e) => handleChange("area", e.target.value)}
                                error={!!errors.area}
                                helperText={errors.area || ""}
                            />
                        </Box>
                    </Box>

                    {/* Fila 3: Fecha de compra (MobileDatePicker) y Valor */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        {/* FECHA DE COMPRA - MobileDatePicker */}
                        <Box sx={CELL_STYLE}>
                            <Typography sx={LABEL_STYLE}>
                                Fecha de Compra *
                            </Typography>
                            <MobileDatePicker
                                value={fechaCompra}
                                onChange={(newValue) => {
                                    setFechaCompra(newValue);
                                    handleChange("fechaCompra", newValue ? newValue.format('YYYY-MM-DD') : "");
                                    if (errors.fechaCompra) {
                                        setErrors(prev => ({ ...prev, fechaCompra: '' }));
                                    }
                                }}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        error: !!errors.fechaCompra,
                                        helperText: errors.fechaCompra,
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: '#f8f9fa',
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Valor"
                                value={newActivo.valor}
                                onChange={(e) => handleChange("valor", Number(e.target.value))}
                                error={!!errors.valor}
                                helperText={errors.valor}
                            />
                        </Box>
                    </Box>

                    {/* Fila 4: Tasa de depreciación y Depreciación acumulada */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Tasa de Depreciación (ID)"
                                value={newActivo.depreciacionActivo}
                                onChange={(e) => handleChange("depreciacionActivo", e.target.value)}
                                error={!!errors.depreciacionActivo}
                                helperText={errors.depreciacionActivo || ""}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Depreciación Acumulada"
                                value={newActivo.depreciacionAcumulada}
                                onChange={(e) => handleChange("depreciacionAcumulada", Number(e.target.value))}
                            />
                        </Box>
                    </Box>

                    {/* Fila 5: Vida útil y Compra */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Vida Útil (años)"
                                value={newActivo.vidaUtil}
                                onChange={(e) => handleChange("vidaUtil", Number(e.target.value))}
                                error={!!errors.vidaUtil}
                                helperText={errors.vidaUtil}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Compra"
                                value={newActivo.compra}
                                onChange={(e) => handleChange("compra", e.target.value)}
                                error={!!errors.compra}
                                helperText={errors.compra}
                            />
                        </Box>
                    </Box>

                    {/* Fila 6: Ajuste de valor y Movimiento */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Ajuste de Valor"
                                value={newActivo.ajusteValor}
                                onChange={(e) => handleChange("ajusteValor", Number(e.target.value))}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Movimiento"
                                value={newActivo.movimiento}
                                onChange={(e) => handleChange("movimiento", e.target.value)}
                            >
                                {MOVIMIENTOS.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>
                                        {m.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    {/* Fila 7: Estado del activo (ocupa toda la fila o mitad) */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Estado del Activo (ID)"
                                value={newActivo.estadoActivo}
                                onChange={(e) => handleChange("estadoActivo", e.target.value)}
                                error={!!errors.estadoActivo}
                                helperText={errors.estadoActivo || ""}
                            />
                        </Box>
                        {/* Celda vacía para mantener el grid de 2 columnas */}
                        <Box sx={CELL_STYLE} />
                    </Box>

                    {/* Error general */}
                    {errors.general && (
                        <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
                            {errors.general}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions
                    sx={{
                        display: "flex",
                        p: 2,
                        ml: 0,
                        gap: 2,
                        width: "100%"
                    }}
                >
                    <Button
                        onClick={handleCancelar}
                        disabled={loading}
                        fullWidth
                        startIcon={<CancelIcon />}
                        sx={{
                            flex: 1,
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                            color: "white",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(226, 45, 187, 0.9))",
                                boxShadow: "0 4px 12px rgb(158, 6, 6)"
                            }
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateActivo}
                        disabled={loading}
                        fullWidth
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                        sx={{
                            flex: 1,
                            background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                boxShadow: "0 4px 12px rgba(13, 248, 5, 0.93)"
                            }
                        }}
                    >
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
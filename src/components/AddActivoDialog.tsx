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
    CircularProgress
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


// ==================== INTERFACES ====================
export interface ActivoFormData {
    codigo_activo: string;
    nombre_activo: string;
    categoria_activo: string;
    descripcion_activo: string;
    estado_activo: string;
    ubicacion_activo: string;
    fecha_adquisicion: string;
    valor_adquisicion: string;
}

export interface AddActivoDialogProps {
    open: boolean;
    onClose: () => void;
    onActivoCreado?: (activo: ActivoFormData) => void;
}

// ==================== CONSTANTES ====================
const CATEGORIAS_ACTIVO = [
    { label: "Tecnología", value: "tecnologia" },
    { label: "Mobiliario", value: "mobiliario" },
    { label: "Vehículo", value: "vehiculo" },
    { label: "Maquinaria", value: "maquinaria" },
    { label: "Inmueble", value: "inmueble" },
    { label: "Otros", value: "otros" },
];

const ESTADOS_ACTIVO = [
    { label: "Activo", value: "activo" },
    { label: "Inactivo", value: "inactivo" },
    { label: "En mantenimiento", value: "mantenimiento" },
    { label: "Dado de baja", value: "baja" },
];

// ==================== COMPONENTE ====================
export default function AddActivoDialog({
    open,
    onClose,
    onActivoCreado,
}: AddActivoDialogProps): React.JSX.Element {
    // Estados del formulario
    const [loading,setLoading]=useState<boolean>(false);
    const [newActivo, setNewActivo] = useState<ActivoFormData>({
        codigo_activo: "",
        nombre_activo: "",
        categoria_activo: "",
        descripcion_activo: "",
        estado_activo: "activo",
        ubicacion_activo: "",
        fecha_adquisicion: "",
        valor_adquisicion: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ==================== HANDLERS ====================
    const handleChange = (field: keyof ActivoFormData, value: string) => {
        setNewActivo((prev) => {
            const updated = { ...prev, [field]: value };
            // Limpiar error del campo que se está editando
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

    const handleCreateActivo= async ()=>{
        //aqui va la acccion del boton al hacer click
    }

    const handleGuardar = () => {

        if (onActivoCreado) {
            onActivoCreado(newActivo);
        }

        // Resetear formulario
        setNewActivo({
            codigo_activo: "",
            nombre_activo: "",
            categoria_activo: "",
            descripcion_activo: "",
            estado_activo: "activo",
            ubicacion_activo: "",
            fecha_adquisicion: "",
            valor_adquisicion: "",
        });
        setErrors({});
    };

    const handleCancelar = () => {
        // Resetear formulario al cancelar
        setNewActivo({
            codigo_activo: "",
            nombre_activo: "",
            categoria_activo: "",
            descripcion_activo: "",
            estado_activo: "activo",
            ubicacion_activo: "",
            fecha_adquisicion: "",
            valor_adquisicion: "",
        });
        setErrors({});
        onClose();
    };

    // ==================== RENDER ====================
    return (
        <Dialog
            open={open}
            onClose={handleCancelar}
            maxWidth="sm"
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
                <TextField
                    fullWidth
                    label="Código"
                    margin="normal"
                    value={newActivo.codigo_activo}
                    onChange={(e) => handleChange("codigo_activo", e.target.value)}
                    error={!!errors.codigo_activo}
                    helperText={errors.codigo_activo}
                />
                <TextField
                    fullWidth
                    label="Nombre del Activo"
                    margin="normal"
                    value={newActivo.nombre_activo}
                    onChange={(e) => handleChange("nombre_activo", e.target.value)}
                    error={!!errors.nombre_activo}
                    helperText={errors.nombre_activo}
                />
                <TextField
                    select
                    fullWidth
                    label="Categoría"
                    margin="normal"
                    value={newActivo.categoria_activo}
                    onChange={(e) => handleChange("categoria_activo", e.target.value)}
                    error={!!errors.categoria_activo}
                    helperText={errors.categoria_activo}
                >
                    {CATEGORIAS_ACTIVO.map((cat) => (
                        <MenuItem key={cat.value} value={cat.value}>
                            {cat.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Descripción"
                    margin="normal"
                    multiline
                    rows={2}
                    value={newActivo.descripcion_activo}
                    onChange={(e) => handleChange("descripcion_activo", e.target.value)}
                />
                <TextField
                    select
                    fullWidth
                    label="Estado"
                    margin="normal"
                    value={newActivo.estado_activo}
                    onChange={(e) => handleChange("estado_activo", e.target.value)}
                    error={!!errors.estado_activo}
                    helperText={errors.estado_activo}
                >
                    {ESTADOS_ACTIVO.map((est) => (
                        <MenuItem key={est.value} value={est.value}>
                            {est.label}
                        </MenuItem>
                    ))}
                </TextField>
                <TextField
                    fullWidth
                    label="Ubicación"
                    margin="normal"
                    value={newActivo.ubicacion_activo}
                    onChange={(e) => handleChange("ubicacion_activo", e.target.value)}
                    error={!!errors.ubicacion_activo}
                    helperText={errors.ubicacion_activo}
                />
                <label htmlFor="">Fecha de adquisicion</label>
                <TextField
                    fullWidth
                    type="date"
                    label=""
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={newActivo.fecha_adquisicion}
                    onChange={(e) => handleChange("fecha_adquisicion", e.target.value)}
                    error={!!errors.fecha_adquisicion}
                    helperText={errors.fecha_adquisicion}
                />
                <TextField
                    fullWidth
                    type="number"
                    label="Valor de Adquisición"
                    margin="normal"
                    value={newActivo.valor_adquisicion}
                    onChange={(e) => handleChange("valor_adquisicion", e.target.value)}
                    error={!!errors.valor_adquisicion}
                    helperText={errors.valor_adquisicion}
                />
            </DialogContent>
            <DialogActions
                                sx={{
                                    display: "flex",
                                    p: 2,
                                    ml: 0,
                                    gap: 2, // espacio entre botones
                                    width: "100%"
                                }}
                            >
                                <Button
                                    onClick={handleCancelar}
                                    disabled={loading}
                                    fullWidth // ← ocupa todo el espacio disponible
                                    startIcon={<CancelIcon/>}
                                    sx={{
                                        flex: 1, // ← 50% del ancho
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
                                    fullWidth // ← ocupa todo el espacio disponible
                                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon/>}
                                    sx={{
                                        flex: 1, // ← 50% del ancho
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
    );
}
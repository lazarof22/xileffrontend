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
} from '@mui/material';

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

    const validateForm = (): boolean => {
        const tempErrors: Record<string, string> = {};

        if (!newActivo.codigo_activo.trim()) {
            tempErrors.codigo_activo = "El código es obligatorio";
        }
        if (!newActivo.nombre_activo.trim()) {
            tempErrors.nombre_activo = "El nombre es obligatorio";
        }
        if (!newActivo.categoria_activo) {
            tempErrors.categoria_activo = "Seleccione una categoría";
        }
        if (!newActivo.estado_activo) {
            tempErrors.estado_activo = "Seleccione un estado";
        }
        if (!newActivo.ubicacion_activo.trim()) {
            tempErrors.ubicacion_activo = "La ubicación es obligatoria";
        }
        if (!newActivo.fecha_adquisicion) {
            tempErrors.fecha_adquisicion = "La fecha de adquisición es obligatoria";
        }
        if (!newActivo.valor_adquisicion) {
            tempErrors.valor_adquisicion = "El valor de adquisición es obligatorio";
        } else if (Number(newActivo.valor_adquisicion) <= 0) {
            tempErrors.valor_adquisicion = "El valor debe ser mayor a 0";
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleGuardar = () => {
        if (!validateForm()) return;

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
            <DialogTitle>Nuevo Activo</DialogTitle>
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
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={handleCancelar}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleGuardar}
                    disabled={Object.keys(errors).length > 0 && !validateForm()}
                >
                    Guardar
                </Button>
            </DialogActions>
        </Dialog>
    );
}
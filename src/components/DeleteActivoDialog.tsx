// src/components/AddActivoDialog.tsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';

// ==================== INTERFACES ====================
export interface DeleteActivoFormData {
    codigo_activo: string;
}

export interface AddActivoDialogProps {
    open: boolean;
    onClose: () => void;
    onActivoEliminado?: (activo: DeleteActivoFormData) => void;
}


// ==================== COMPONENTE ====================
export default function AddDeleteDialog({
    open,
    onClose,
    onActivoEliminado,
}: AddActivoDialogProps): React.JSX.Element {
    // Estados del formulario
    const [deleteActivo, setDeleteActivo] = useState<DeleteActivoFormData>({
        codigo_activo: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ==================== HANDLERS ====================
    const handleChange = (field: keyof DeleteActivoFormData, value: string) => {
        setDeleteActivo((prev) => {
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

        if (!deleteActivo.codigo_activo.trim()) {
            tempErrors.codigo_activo = "El código es obligatorio";
        }
        

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleGuardar = () => {
        if (!validateForm()) return;

        if (onActivoEliminado) {
            onActivoEliminado(deleteActivo);
        }

        // Resetear formulario
        setDeleteActivo({
            codigo_activo: "",
        });
        setErrors({});
    };

    const handleCancelar = () => {
        // Resetear formulario al cancelar
        setDeleteActivo({
            codigo_activo: "",
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
            <DialogTitle>Eliminar Activo</DialogTitle>
            <DialogContent sx={{ mt: 1 }}>
                <TextField
                    fullWidth
                    label="Código"
                    margin="normal"
                    value={deleteActivo.codigo_activo}
                    onChange={(e) => handleChange("codigo_activo", e.target.value)}
                    error={!!errors.codigo_activo}
                    helperText={errors.codigo_activo}
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
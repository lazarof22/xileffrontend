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
export interface EmpleadoFormData {
    CI:string,
    nombre:string,
    primerApellido:string,
    segundoApellido:string,
}

export interface AddEmpleadoDialogProps {
    open: boolean;
    onClose: () => void;
    onEmpleadoEliminado?: (activo: EmpleadoFormData) => void;
}

// ==================== COMPONENTE ====================
export default function DeleteEmpleadoDialog({
    open,
    onClose,
    onEmpleadoEliminado,
}: AddEmpleadoDialogProps): React.JSX.Element {
    // Estados del formulario
    const [newEmpleado, setNewEmpleado] = useState<EmpleadoFormData>({
        CI:'',
        nombre:'',
        primerApellido:'',
        segundoApellido:'',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ==================== HANDLERS ====================
    const handleChange = (field: keyof EmpleadoFormData, value: string) => {
        setNewEmpleado((prev) => {
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

        if (!newEmpleado.CI.trim()) {
            tempErrors.CI = "El CI es obligatorio";
        }
        if (!newEmpleado.nombre.trim()) {
            tempErrors.nombre = "El nombre es obligatorio";
        }
        if (!newEmpleado.primerApellido) {
            tempErrors.primerApellido = "El primer apellido es obligatorio";
        }
        if (!newEmpleado.segundoApellido) {
            tempErrors.segundoApellido = "El segundo apellido es obligatorio";
        }
        

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleGuardar = () => {
        if (!validateForm()) return;

        if (onEmpleadoEliminado) {
            onEmpleadoEliminado(newEmpleado);
        }

        // Resetear formulario
        setNewEmpleado({
            CI: "",
            nombre: "",
            primerApellido: "",
            segundoApellido: "",
        });
        setErrors({});
    };

    const handleCancelar = () => {
        // Resetear formulario al cancelar
        setNewEmpleado({
            CI: "",
            nombre: "",
            primerApellido: "",
            segundoApellido: "",
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
            <DialogTitle>Eliminar Empleado</DialogTitle>
            <DialogContent sx={{ mt: 1 }}>
                <TextField
                    fullWidth
                    label="CI"
                    margin="normal"
                    value={newEmpleado.CI}
                    onChange={(e) => handleChange("CI", e.target.value)}
                    error={!!errors.CI}
                    helperText={errors.CI}
                />
                <TextField
                    fullWidth
                    label="Nombre del empleado"
                    margin="normal"
                    value={newEmpleado.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                />
                <TextField
                    fullWidth
                    label="Primer apellido del empleado"
                    margin="normal"
                    value={newEmpleado.primerApellido}
                    onChange={(e) => handleChange("primerApellido", e.target.value)}
                    error={!!errors.primerApellido}
                    helperText={errors.primerApellido}
                />
                <TextField
                    fullWidth
                    label="Segundo apellido del empleado"
                    margin="normal"
                    value={newEmpleado.segundoApellido}
                    onChange={(e) => handleChange("segundoApellido", e.target.value)}
                    error={!!errors.segundoApellido}
                    helperText={errors.segundoApellido}
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
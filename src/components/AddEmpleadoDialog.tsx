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
export interface EmpleadoFormData {
    CI:string,
    nombre:string,
    primerApellido:string,
    segundoApellido:string,
    departamento:string,
    cargo:string,
    salario:number,
    estado:string
}

export interface AddEmpleadoDialogProps {
    open: boolean;
    onClose: () => void;
    onActivoCreado?: (activo: EmpleadoFormData) => void;
}

// ==================== CONSTANTES ====================

const ESTADOS_ACTIVO = [
    { label: "Activo", value: "activo" },
    { label: "Inactivo", value: "inactivo" },
];

// ==================== COMPONENTE ====================
export default function AddEmpleadoDialog({
    open,
    onClose,
    onActivoCreado,
}: AddEmpleadoDialogProps): React.JSX.Element {
    // Estados del formulario
    const [newEmpleado, setNewEmpleado] = useState<EmpleadoFormData>({
        CI:'',
        nombre:'',
        primerApellido:'',
        segundoApellido:'',
        departamento:'',
        cargo:'',
        salario:0,
        estado:''
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
        if (!newEmpleado.departamento.trim()) {
            tempErrors.departamento = "El nombre del departamento es obligatorio";
        }
        if (!newEmpleado.cargo) {
            tempErrors.cargo = "El cargo es obligatoria";
        }
        if (!newEmpleado.salario) {
            tempErrors.valor_adquisicion = "El salario es obligatorio";
        } else if (Number(newEmpleado.salario) <= 0) {
            tempErrors.valor_adquisicion = "El salario debe ser mayor a 0";
        }
        if(!newEmpleado.estado){
            tempErrors.estado="El estado es obligatorio"
        }

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleGuardar = () => {
        if (!validateForm()) return;

        if (onActivoCreado) {
            onActivoCreado(newEmpleado);
        }

        // Resetear formulario
        setNewEmpleado({
            CI: "",
            nombre: "",
            primerApellido: "",
            segundoApellido: "",
            departamento: "",
            cargo: "",
            salario: 0,
            estado: "",
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
            departamento: "",
            cargo: "",
            salario: 0,
            estado: "",
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
            <DialogTitle>Nuevo Empleado</DialogTitle>
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
                <TextField
                    fullWidth
                    label="Departamento"
                    margin="normal"
                    value={newEmpleado.departamento}
                    onChange={(e) => handleChange("departamento", e.target.value)}
                    error={!!errors.departamento}
                    helperText={errors.departamento}
                />
                <TextField
                    fullWidth
                    label="Cargo"
                    margin="normal"
                    value={newEmpleado.departamento}
                    onChange={(e) => handleChange("cargo", e.target.value)}
                    error={!!errors.cargo}
                    helperText={errors.cargo}
                />

                <TextField
                    fullWidth
                    label="Salario"
                    margin="normal"
                    value={newEmpleado.departamento}
                    onChange={(e) => handleChange("salario", e.target.value)}
                    error={!!errors.salario}
                    helperText={errors.salario}
                />

                <TextField
                                    select
                                    fullWidth
                                    label="Estado"
                                    margin="normal"
                                    value={newEmpleado.estado}
                                    onChange={(e) => handleChange("estado", e.target.value)}
                                    error={!!errors.estado_activo}
                                    helperText={errors.estado_activo}
                                >
                                    {ESTADOS_ACTIVO.map((est) => (
                                        <MenuItem key={est.value} value={est.value}>
                                            {est.label}
                                        </MenuItem>
                                    ))}
                                </TextField>

                
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
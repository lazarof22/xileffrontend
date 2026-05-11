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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

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
    onEmpleadoCreado?: (activo: EmpleadoFormData) => void;
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
    onEmpleadoCreado,
}: AddEmpleadoDialogProps): React.JSX.Element {
    // Estados del formulario
    const [loading,setLoading]=useState<boolean>(false);
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

    const handleCreateEmpleado=async ()=>{

    }

    const handleGuardar = () => {
        if (!validateForm()) return;

        if (onEmpleadoCreado) {
            onEmpleadoCreado(newEmpleado);
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
                                    Nuevo Empleado
                                </Typography>
                            </DialogTitle>
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
                                                onClick={handleCreateEmpleado}
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
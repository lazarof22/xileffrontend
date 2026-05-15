// src/components/AddTransaccionDialog.tsx
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
export interface TransaccionFormData {
    fecha:Date | null,
    concepto:string,
    ingreso:number,
    egreso:number,
    saldo:number,
}

export interface AddTransaccionDialogProps {
    open: boolean;
    onClose: () => void;
    onTransaccionCreado?: (Transaccion: TransaccionFormData) => void;
}


// ==================== COMPONENTE ====================
export default function AddTransaccionDialog({
    open,
    onClose,
    onTransaccionCreado,
}: AddTransaccionDialogProps): React.JSX.Element {
    // Estados del formulario
    const [loading,setLoading]=useState<boolean>(false);
    const [newTransaccion, setNewTransaccion] = useState<TransaccionFormData>({
        fecha:null,
    concepto:'',
    ingreso:0,
    egreso:0,
    saldo:0
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ==================== HANDLERS ====================
    const handleChange = (field: keyof TransaccionFormData, value: string) => {
        setNewTransaccion((prev) => {
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

    const handleCreateTransaccion= async ()=>{
        //aqui va la acccion del boton al hacer click
    }

    const handleGuardar = () => {

        if (onTransaccionCreado) {
            onTransaccionCreado(newTransaccion);
        }

        // Resetear formulario
        setNewTransaccion({
            fecha:null,
    concepto:'',
    ingreso:0,
    egreso:0,
    saldo:0
        });
        setErrors({});
    };

    const handleCancelar = () => {
        // Resetear formulario al cancelar
        setNewTransaccion({
            fecha:null,
    concepto:'',
    ingreso:0,
    egreso:0,
    saldo:0
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
                                    Nuevo Transaccion
                                </Typography>
                            </DialogTitle>
            <DialogContent sx={{ mt: 1 }}>
                <label htmlFor="">Fecha</label>
                <TextField
                                    fullWidth
                                    type="date"
                                    label=""
                                    margin="normal"
                                    InputLabelProps={{ shrink: true }}
                                    value={newTransaccion.fecha}
                                    onChange={(e) => handleChange("fecha", e.target.value)}
                                    error={!!errors.fecha}
                                    helperText={errors.fecha}
                                />
                <TextField
                    select
                    fullWidth
                    label="Concepto"
                    margin="normal"
                    value={newTransaccion.concepto}
                    onChange={(e) => handleChange("concepto", e.target.value)}
                    error={!!errors.concepto}
                    helperText={errors.concepto}
                >
                </TextField>
                <TextField
                    fullWidth
                    label="Ingreso"
                    margin="normal"
                    multiline
                    rows={2}
                    value={newTransaccion.ingreso}
                    onChange={(e) => handleChange("ingreso", e.target.value)}
                />
                <TextField
                    select
                    fullWidth
                    label="Egreso"
                    margin="normal"
                    value={newTransaccion.egreso}
                    onChange={(e) => handleChange("egreso", e.target.value)}
                    error={!!errors.egreso}
                    helperText={errors.egreso}
                >
                </TextField>
                <TextField
                    fullWidth
                    label="Saldo"
                    margin="normal"
                    value={newTransaccion.saldo}
                    onChange={(e) => handleChange("saldo", e.target.value)}
                    error={!!errors.saldo}
                    helperText={errors.saldo}
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
                                    onClick={handleCreateTransaccion}
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
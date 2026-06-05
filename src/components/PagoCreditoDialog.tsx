import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Snackbar,
    Typography,
    Autocomplete,
    Box
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DialogCrearCliente, { type ClienteFormData } from './AddClientDialog';

// ─── Configuración ───────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Tipos ─────────────────────────────────────────────

export interface PagoCreditoData {
    cliente: string;
    id_cliente: string;
    telefono_cliente: string;
    monto_pagar: number;
}

interface ClienteOption {
    id_cliente: string;
    nombre_cliente: string;
    telefono_cliente: string;
    email_cliente: string;
    direccion_cliente: string;
    tipo_cliente: string;
}

interface PagoCreditoErrors {
    cliente?: string;
    id_cliente?: string;
    telefono_cliente?: string;
    monto_pagar?: string;
}

export interface PagoCreditoDialogProps {
    open: boolean;
    onClose: () => void;
    montoTotal: number;
    onPagoCompletado?: (data: PagoCreditoData) => void;
}

// ─── Componente ──────────────────────────────────────

export default function PagoCreditoDialog({
    open,
    onClose,
    montoTotal,
    onPagoCompletado
}: PagoCreditoDialogProps): React.JSX.Element {
    const [cliente, setCliente] = useState<string>('');
    const [idCliente, setIdCliente] = useState<string>('');
    const [telefono, setTelefono] = useState<string>('');
    const [montoPagar, setMontoPagar] = useState<string>(montoTotal.toFixed(2));

    const [clientes, setClientes] = useState<ClienteOption[]>([]);
    const [loadingClientes, setLoadingClientes] = useState<boolean>(false);
    const [errors, setErrors] = useState<PagoCreditoErrors>({});
    const [loading, setLoading] = useState<boolean>(false);

    const [openDialogCrear, setOpenDialogCrear] = useState<boolean>(false);

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    // Cargar clientes al abrir el dialog
    useEffect(() => {
        if (open) {
            fetchClientes();
            setMontoPagar(montoTotal.toFixed(2));
        }
    }, [open, montoTotal]);

    const fetchClientes = async (): Promise<void> => {
        setLoadingClientes(true);
        try {
            const response = await fetch(`${API_URL}/cliente`);
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            setClientes(data);
        } catch (error) {
            console.error('Error cargando clientes:', error);
        } finally {
            setLoadingClientes(false);
        }
    };

    const handleClienteSeleccionado = (
        _event: React.SyntheticEvent,
        value: ClienteOption | null
    ): void => {
        if (value) {
            setCliente(value.nombre_cliente);
            setIdCliente(value.id_cliente);
            setTelefono(value.telefono_cliente || '');
        } else {
            setCliente('');
            setIdCliente('');
            setTelefono('');
        }

        // Limpiar errores del campo
        if (errors.cliente) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.cliente;
                return newErrors;
            });
        }
    };

    const handleChange = (
        field: 'id_cliente' | 'telefono_cliente' | 'monto_pagar',
        value: string
    ): void => {
        if (field === 'id_cliente') setIdCliente(value);
        if (field === 'telefono_cliente') setTelefono(value);
        if (field === 'monto_pagar') setMontoPagar(value);

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: PagoCreditoErrors = {};

        if (!cliente.trim()) {
            newErrors.cliente = 'El cliente es requerido';
        }
        if (!idCliente.trim()) {
            newErrors.id_cliente = 'El CI es requerido';
        }
        if (!telefono.trim()) {
            newErrors.telefono_cliente = 'El teléfono es requerido';
        }
        if (!montoPagar.trim() || isNaN(Number(montoPagar)) || Number(montoPagar) <= 0) {
            newErrors.monto_pagar = 'El monto debe ser mayor a 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleFinalizarPago = async (): Promise<void> => {
        if (!validate()) return;

        setLoading(true);

        try {
            // Aquí iría tu lógica de guardar el pago a crédito
            // const response = await fetch(`${API_URL}/venta/credito`, { ... });

            const pagoData: PagoCreditoData = {
                cliente: cliente,
                id_cliente: idCliente,
                telefono_cliente: telefono,
                monto_pagar: Number(montoPagar)
            };

            setSnackbar({
                open: true,
                message: 'Pago a crédito procesado exitosamente',
                severity: 'success'
            });

            onPagoCompletado?.(pagoData);

            setTimeout(() => {
                handleClose();
            }, 1500);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error al procesar el pago';
            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = (): void => {
        setCliente('');
        setIdCliente('');
        setTelefono('');
        setMontoPagar(montoTotal.toFixed(2));
        setErrors({});
        onClose();
    };

    const handleClienteCreado = (nuevoCliente: ClienteFormData): void => {
        setCliente(nuevoCliente.nombre_cliente);
        setIdCliente(nuevoCliente.id_cliente);
        setTelefono(nuevoCliente.telefono_cliente);

        // Actualizar la lista de clientes
        setClientes(prev => [...prev, {
            id_cliente: nuevoCliente.id_cliente,
            nombre_cliente: nuevoCliente.nombre_cliente,
            telefono_cliente: nuevoCliente.telefono_cliente,
            email_cliente: nuevoCliente.email_cliente,
            direccion_cliente: nuevoCliente.direccion_cliente,
            tipo_cliente: nuevoCliente.tipo_cliente
        }]);
    };

    const handleCloseSnackbar = (): void => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    <Typography
                        variant="h6"
                        sx={{
                            borderRadius: 1,
                            boxShadow: 2,
                            p: 1,
                            textAlign: "center",
                            background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                            <PaymentIcon
                                sx={{
                                    fill: 'url(#iconGradientCredito)',
                                    width: 24,
                                    height: 24
                                }}
                            />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="iconGradientCredito" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgb(0, 174, 255)" />
                                        <stop offset="100%" stopColor="rgb(196, 45, 226)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                        Pago por Crédito
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    {/* Autocomplete de Cliente + Botón Nuevo */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mt: 1 }}>
                        <Box sx={{ width: '75%' }}>
                            <Autocomplete
                                options={clientes}
                                getOptionLabel={(option) => option.nombre_cliente}
                                loading={loadingClientes}
                                onChange={handleClienteSeleccionado}
                                value={clientes.find(c => c.nombre_cliente === cliente) || null}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Cliente"
                                        size="small"
                                        error={!!errors.cliente}
                                        helperText={errors.cliente}
                                    />
                                )}
                            />
                            {loadingClientes && (
                                <CircularProgress
                                    size={16}
                                    sx={{
                                        position: 'absolute',
                                        right: 40,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                    }}
                                />
                            )}
                        </Box>
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<PersonAddIcon sx={{ fontSize: "medium" }} />}
                            onClick={() => setOpenDialogCrear(true)}
                            sx={{
                                width: '40%',
                                background: "linear-gradient(135deg, rgba(245, 6, 6, 0.9), rgba(10, 83, 218, 0.9))",
                                color: "#fff",
                                textTransform: "none",
                                fontWeight: 600,
                                boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                "&:hover": {
                                    background: "linear-gradient(135deg, rgba(245, 6, 6, 0.9), rgba(10, 83, 218, 0.9))",
                                    boxShadow: "0 4px 12px rgb(12, 83, 235)"
                                }
                            }}
                        >
                            Nuevo
                        </Button>
                    </Box>

                    {/* Nombre del Cliente (solo lectura o editable) */}
                    <TextField
                        fullWidth
                        label="Nombre del Cliente"
                        margin="normal"
                        size="small"
                        value={cliente}
                        onChange={(e) => {
                            setCliente(e.target.value);
                            if (errors.cliente) {
                                setErrors(prev => {
                                    const newErrors = { ...prev };
                                    delete newErrors.cliente;
                                    return newErrors;
                                });
                            }
                        }}
                        error={!!errors.cliente}
                        helperText={errors.cliente}
                        disabled={loading}
                    />

                    {/* CI */}
                    <TextField
                        fullWidth
                        label="CI"
                        margin="normal"
                        size="small"
                        value={idCliente}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const input = e.target.value;
                            const soloNumeros = input.replace(/\D/g, '').slice(0, 11);
                            handleChange("id_cliente", soloNumeros);
                        }}
                        error={!!errors.id_cliente || (idCliente.length > 0 && idCliente.length !== 11)}
                        helperText={
                            errors.id_cliente ||
                            (idCliente.length > 0 && idCliente.length !== 11
                                ? `Debe tener exactamente 11 dígitos (${idCliente.length}/11)`
                                : "Ingrese los 11 dígitos del carnet")
                        }
                        disabled={loading}
                        slotProps={{
                            input: {
                                inputProps: {
                                    maxLength: 11,
                                    inputMode: 'numeric',
                                    pattern: '[0-9]*',
                                }
                            }
                        }}
                    />

                    {/* Teléfono */}
                    <TextField
                        fullWidth
                        label="Teléfono"
                        margin="normal"
                        size="small"
                        value={telefono}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange("telefono_cliente", e.target.value)
                        }
                        error={!!errors.telefono_cliente}
                        helperText={errors.telefono_cliente}
                        disabled={loading}
                    />

                    {/* Monto a Pagar */}
                    <TextField
                        fullWidth
                        label="Monto a Pagar"
                        margin="normal"
                        size="small"
                        type="number"
                        value={montoPagar}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange("monto_pagar", e.target.value)
                        }
                        error={!!errors.monto_pagar}
                        helperText={errors.monto_pagar}
                        disabled={loading}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <Typography sx={{ mr: 1, color: 'text.secondary' }}>$</Typography>
                                ),
                            }
                        }}
                    />
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
                        onClick={handleClose}
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
                        onClick={handleFinalizarPago}
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
                        {loading ? 'Procesando...' : 'Finalizar Pago'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog para crear cliente nuevo */}
            <DialogCrearCliente
                open={openDialogCrear}
                onClose={() => setOpenDialogCrear(false)}
                onClienteCreado={handleClienteCreado}
            />

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
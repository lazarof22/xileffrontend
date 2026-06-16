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
    Divider,
    Box,
    Card
} from '@mui/material';
import MoneyIcon from '@mui/icons-material/Money';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { procesarVentaCompleta, convertirDesgloseBilletes, calcularTotalDesglose, } from '../service/ventaService';
import type { ProductoCarrito } from '../types/venta.types';

// ─── Tipos ─────────────────────────────────────────────

export interface PagoEfectivoData {
    monto_a_pagar: string;
    monto_pagado: string;
    cambio: string;
    billestes_5000: string;
    billetes_2000: string;
    billetes_1000: string;
    billetes_500: string;
    billetes_200: string;
    billetes_100: string;
    billetes_50: string;
    billetes_20: string;
    billetes_10: string;
    billetes_5: string;
    billetes_3: string;
    billetes_1: string;
    [key: string]: string;
}

interface PagoErrors {
    monto_pagado?: string;
    billetes_1000?: string;
}

export interface DialogPagoEfectivoProps {
    open: boolean;
    onClose: () => void;
    montoTotal: number;
    // ─── NUEVO: Datos necesarios para la venta ──────────────
    clienteId: string;           // ID del cliente seleccionado
    productosCarrito: ProductoCarrito[];
    subtotal: number;
    descuentoTotal: number;
    impuesto: number;
    // ───────────────────────────────────────────────────────
    onPagoCompletado?: (data: PagoEfectivoData) => void;
    onVentaExitosa?: (ventaId: string) => void;  // Callback cuando todo sale bien
}

// ─── Constantes ──────────────────────────────────────

const initialPago: PagoEfectivoData = {
    monto_a_pagar: '',
    monto_pagado: '',
    cambio: '0.00',
    billestes_5000: '',
    billetes_2000: '',
    billetes_1000: '',
    billetes_500: '',
    billetes_200: '',
    billetes_100: '',
    billetes_50: '',
    billetes_20: '',
    billetes_10: '',
    billetes_5: '',
    billetes_3: '',
    billetes_1: '',
};

const billetesConfig = [
    { key: 'billestes_5000' as const, label: 'Billetes de 5000', denom: 5000 },
    { key: 'billetes_2000' as const, label: 'Billetes de 2000', denom: 2000 },
    { key: 'billetes_1000' as const, label: 'Billetes de 1000', denom: 1000 },
    { key: 'billetes_500' as const, label: 'Billetes de 500', denom: 500 },
    { key: 'billetes_200' as const, label: 'Billetes de 200', denom: 200 },
    { key: 'billetes_100' as const, label: 'Billetes de 100', denom: 100 },
    { key: 'billetes_50' as const, label: 'Billetes de 50', denom: 50 },
    { key: 'billetes_20' as const, label: 'Billetes de 20', denom: 20 },
    { key: 'billetes_10' as const, label: 'Billetes de 10', denom: 10 },
    { key: 'billetes_5' as const, label: 'Billetes de 5', denom: 5 },
    { key: 'billetes_3' as const, label: 'Billetes de 3', denom: 3 },
    { key: 'billetes_1' as const, label: 'Billetes de 1', denom: 1 },
];

// ─── Componente ──────────────────────────────────────

export default function DialogPagoEfectivo({
    open,
    onClose,
    montoTotal,
    // ─── NUEVAS PROPS ───────────────────────────────────────
    clienteId,
    productosCarrito,
    subtotal,
    descuentoTotal,
    impuesto,
    // ───────────────────────────────────────────────────────
    onPagoCompletado,
    onVentaExitosa,
}: DialogPagoEfectivoProps): React.JSX.Element {
    const [pagoData, setPagoData] = useState<PagoEfectivoData>(initialPago);
    const [errors, setErrors] = useState<PagoErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'warning';
    }>({
        open: false,
        message: '',
        severity: 'success'
    });

    useEffect(() => {
        if (open) {
            setPagoData({
                ...initialPago,
                monto_a_pagar: montoTotal.toFixed(2)
            });
            setErrors({});
        }
    }, [open, montoTotal]);

    const handleChange = (field: keyof PagoEfectivoData, value: string): void => {
        const cleanValue = value.replace(/[^0-9.]/g, '');

        setPagoData(prev => {
            const newData = { ...prev, [field]: cleanValue };

            if (field === 'monto_pagado') {
                const pagado = parseFloat(cleanValue) || 0;
                const aPagar = parseFloat(prev.monto_a_pagar) || 0;
                const cambio = pagado - aPagar;
                newData.cambio = cambio >= 0 ? cambio.toFixed(2) : '0.00';
            }

            return newData;
        });

        if (errors.monto_pagado && field === 'monto_pagado') {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.monto_pagado;
                return newErrors;
            });
        }
    };

    const calcularTotalBilletes = (): number => {
        let total = 0;
        billetesConfig.forEach(billete => {
            const cantidad = parseInt(pagoData[billete.key]) || 0;
            total += cantidad * billete.denom;
        });
        return total;
    };

    const validate = (): boolean => {
        const newErrors: PagoErrors = {};

        const montoPagado = parseFloat(pagoData.monto_pagado);
        const montoAPagar = parseFloat(pagoData.monto_a_pagar);

        if (!pagoData.monto_pagado || montoPagado <= 0) {
            newErrors.monto_pagado = 'Ingrese el monto pagado';
        } else if (montoPagado < montoAPagar) {
            newErrors.monto_pagado = 'El monto pagado debe ser mayor o igual al monto a pagar';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ═══════════════════════════════════════════════════════════════
    // HANDLE FINALIZAR PAGO — CON INTEGRACIÓN AL BACKEND
    // ═══════════════════════════════════════════════════════════════
    const handleFinalizarPago = async (): Promise<void> => {
        const totalBilletes = calcularTotalBilletes();
        const montoPagado = parseFloat(pagoData.monto_pagado);
        const montoAPagar = parseFloat(pagoData.monto_a_pagar);
        const cambio = parseFloat(pagoData.cambio);

        // ─── Validaciones previas ─────────────────────────────
        if (totalBilletes > montoPagado) {
            setSnackbar({
                open: true,
                message: 'El Total en Billetes no coincide con el Monto Pagado, inserte un monto mayor',
                severity: 'error'
            });
            return;
        }

        if (montoAPagar === 0) {
            setSnackbar({
                open: true,
                message: 'Seleccione un producto del Stock',
                severity: 'warning'
            });
            return;
        }

        // Validar que haya cliente seleccionado
        if (!clienteId) {
            setSnackbar({
                open: true,
                message: 'Seleccione un cliente para continuar',
                severity: 'warning'
            });
            return;
        }

        // Validar que haya productos en el carrito
        if (productosCarrito.length === 0) {
            setSnackbar({
                open: true,
                message: 'El carrito está vacío',
                severity: 'warning'
            });
            return;
        }

        if (!validate()) return;

        setLoading(true);

        try {
            // ─── PASO 1: Convertir desglose al formato del backend ─
            const desglose = convertirDesgloseBilletes(pagoData);

            // Verificar que el desglose coincida con el monto pagado
            const totalDesgloseCalculado = calcularTotalDesglose(desglose);
            if (totalDesgloseCalculado !== montoPagado) {
                setSnackbar({
                    open: true,
                    message: `El desglose (${totalDesgloseCalculado.toFixed(2)}) no coincide con el monto pagado (${montoPagado.toFixed(2)})`,
                    severity: 'error'
                });
                setLoading(false);
                return;
            }

            // ─── PASO 2: Llamar al servicio de procesamiento ──────
            const resultado = await procesarVentaCompleta({
                metodoPago: 'efectivo',
                montoPagado: montoPagado,
                desglose: desglose,
                montoPagar: montoAPagar,
                cambio: cambio,
                clienteIdVenta: clienteId,
                productosCarrito: productosCarrito,
                subtotal: subtotal,
                descuentoTotal: descuentoTotal,
                impuesto: impuesto,
            });

            if (!resultado.exito) {
                setSnackbar({
                    open: true,
                    message: resultado.mensaje,
                    severity: 'error'
                });
                setLoading(false);
                return;
            }

            // ─── ÉXITO ────────────────────────────────────────────
            setSnackbar({
                open: true,
                message: `Venta #${resultado.venta?._id.slice(-6)} procesada exitosamente. Cambio: ${cambio.toFixed(2)}`,
                severity: 'success'
            });

            onPagoCompletado?.(pagoData);
            onVentaExitosa?.(resultado.venta!._id);

            // Limpiar y cerrar
            setPagoData(initialPago);
            setErrors({});

            setTimeout(() => {
                onClose();
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
        setPagoData(initialPago);
        setErrors({});
        onClose();
    };

    const handleCloseSnackbar = (): void => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
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
                            <MoneyIcon
                                sx={{
                                    fill: 'url(#moneyIconGradient)',
                                    width: 24,
                                    height: 24
                                }}
                            />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="moneyIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgb(0, 174, 255)" />
                                        <stop offset="100%" stopColor="rgb(196, 45, 226)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                        Pago en Efectivo
                    </Typography>
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        label="Monto a Pagar"
                        margin="normal"
                        value={pagoData.monto_a_pagar}
                        disabled
                        slotProps={{ input: { readOnly: true } }}
                        sx={{
                            "& .MuiInputBase-input": {
                                fontWeight: 700,
                                fontSize: "1.1rem",
                            },
                        }}
                    />
                    <TextField
                        fullWidth
                        label="Monto Pagado"
                        margin="normal"
                        value={pagoData.monto_pagado}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleChange("monto_pagado", e.target.value)
                        }
                        error={!!errors.monto_pagado}
                        helperText={errors.monto_pagado}
                        disabled={loading}
                        autoFocus
                        placeholder="0.00"
                    />
                    <TextField
                        fullWidth
                        label="Cambio"
                        margin="normal"
                        value={pagoData.cambio}
                        disabled
                        slotProps={{ input: { readOnly: true } }}
                        sx={{
                            "& .MuiInputBase-input": {
                                color: parseFloat(pagoData.cambio) > 0 ? "#2e7d32" : "inherit",
                                fontWeight: 700,
                            },
                        }}
                    />

                    <Divider sx={{ my: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                            Desglose de Billetes
                        </Typography>
                    </Divider>

                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Box
                            sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                gap: 2,
                                maxWidth: 600
                            }}
                        >
                            {billetesConfig.map(billete => (
                                <Card
                                    key={billete.key}
                                    sx={{
                                        width: { xs: 'calc(50% - 8px)', sm: 'calc(33.333% - 11px)' },
                                        p: 1.5,
                                    }}
                                >
                                    <TextField
                                        fullWidth
                                        label={billete.label}
                                        margin="dense"
                                        size="small"
                                        type="number"
                                        value={pagoData[billete.key]}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            handleChange(billete.key, e.target.value)
                                        }
                                        error={!!errors.billetes_1000 && billete.key === 'billetes_1000'}
                                        helperText={billete.key === 'billetes_1000' ? errors.billetes_1000 : ''}
                                        disabled={loading}
                                        slotProps={{ htmlInput: { min: 0 } }}
                                        placeholder="0"
                                    />
                                </Card>
                            ))}
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            mt: 2,
                            p: 1.5,
                            borderRadius: 1,
                            backgroundColor: "rgba(0, 89, 255, 0.05)",
                            border: "1px solid rgba(0, 89, 255, 0.2)",
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            Total en billetes: <strong>${calcularTotalBilletes().toFixed(2)}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Monto pagado: <strong>${parseFloat(pagoData.monto_pagado || "0").toFixed(2)}</strong>
                        </Typography>
                        {calcularTotalBilletes() !== (parseFloat(pagoData.monto_pagado) || 0) && (
                            <Typography variant="caption" color="error">
                                ⚠️ Los totales no coinciden
                            </Typography>
                        )}
                        {calcularTotalBilletes() > parseFloat(pagoData.monto_pagado || "0") && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mb: 1 }}>
                                ⚠️ El total en billetes no coincide con el monto pagado, inserte un monto mayor
                            </Typography>
                        )}
                    </Box>
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
                        disabled={
                            loading ||
                            calcularTotalBilletes() < parseFloat(pagoData.monto_pagado || "0") ||
                            parseFloat(pagoData.monto_a_pagar || "0") === 0 ||
                            !clienteId ||
                            productosCarrito.length === 0
                        }
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
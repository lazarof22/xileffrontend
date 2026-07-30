// src/components/ComprobantesTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    IconButton,
    Divider,
    Chip,
    Avatar,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import BalanceIcon from '@mui/icons-material/Balance';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import CustomDataGridR, { type Column } from './CustomDataGridR';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════
export interface LineaComprobante {
    id: string;
    cuentaId: string;
    cuentaNombre: string;
    elementoGastoId: string;
    elementoGastoNombre: string;
    centroCostoId: string;
    centroCostoNombre: string;
    debe: number;
    haber: number;
    descripcion: string;
}

export interface Comprobante {
    id: string;
    fecha: string;          // ISO string YYYY-MM-DD
    numero: string;
    concepto: string;
    lineas: LineaComprobante[];
    totalDebito: number;
    totalCredito: number;
    equilibrado: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════
export default function ComprobantesTab() {
    // ─── ESTADOS ───
    const [comprobantes, setComprobantes] = useState<Comprobante[]>(() => {
        const saved = localStorage.getItem('conta_comprobantes');
        return saved ? JSON.parse(saved) : [];
    });

    const [fecha, setFecha] = useState<Dayjs>(dayjs());
    const [numero, setNumero] = useState('');
    const [concepto, setConcepto] = useState('');
    const [lineas, setLineas] = useState<LineaComprobante[]>([]);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; text: string } | null>(null);

    // ─── DATOS DE CONFIGURACIÓN (desde localStorage del ConfigContabilidadTab) ───
    const cuentas = useMemo(() => {
        const saved = localStorage.getItem('conta_cuentas');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const elementosGasto = useMemo(() => {
        const saved = localStorage.getItem('conta_elementos_gasto');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const centrosCosto = useMemo(() => {
        const saved = localStorage.getItem('conta_centros_costo');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // ─── GENERAR NÚMERO AUTOMÁTICO ───
    useEffect(() => {
        const nextNum = comprobantes.length + 1;
        setNumero(`CMP-${String(nextNum).padStart(4, '0')}`);
    }, [comprobantes]);

    // ─── PERSISTENCIA ───
    useEffect(() => {
        localStorage.setItem('conta_comprobantes', JSON.stringify(comprobantes));
    }, [comprobantes]);

    // ─── HELPERS ───
    const mostrarMensaje = (tipo: 'success' | 'error', text: string) => {
        setMensaje({ tipo, text });
        setTimeout(() => setMensaje(null), 4000);
    };

    const totalDebito = lineas.reduce((acc, l) => acc + (Number(l.debe) || 0), 0);
    const totalCredito = lineas.reduce((acc, l) => acc + (Number(l.haber) || 0), 0);
    const equilibrado = Math.abs(totalDebito - totalCredito) < 0.01 && lineas.length > 0;
    const diferencia = Math.abs(totalDebito - totalCredito);

    // ─── HANDLERS LÍNEAS ───
    const agregarLinea = () => {
        const nueva: LineaComprobante = {
            id: Date.now().toString() + Math.random().toString(36).slice(2),
            cuentaId: '',
            cuentaNombre: '',
            elementoGastoId: '',
            elementoGastoNombre: '',
            centroCostoId: '',
            centroCostoNombre: '',
            debe: 0,
            haber: 0,
            descripcion: '',
        };
        setLineas(prev => [...prev, nueva]);
    };

    const actualizarLinea = (id: string, campo: keyof LineaComprobante, valor: any) => {
        setLineas(prev => prev.map(l => {
            if (l.id !== id) return l;
            const updated = { ...l, [campo]: valor };

            // Auto-actualizar nombre cuando cambia el ID
            if (campo === 'cuentaId') {
                const cuenta = cuentas.find((c: any) => c.id === valor);
                updated.cuentaNombre = cuenta ? `${cuenta.codigo} - ${cuenta.nombre}` : '';
            }
            if (campo === 'elementoGastoId') {
                const elem = elementosGasto.find((e: any) => e.id === valor);
                updated.elementoGastoNombre = elem ? `${elem.codigo} - ${elem.nombre}` : '';
            }
            if (campo === 'centroCostoId') {
                const centro = centrosCosto.find((c: any) => c.id === valor);
                updated.centroCostoNombre = centro ? `${centro.codigo} - ${centro.nombre}` : '';
            }

            return updated;
        }));
    };

    const eliminarLinea = (id: string) => {
        setLineas(prev => prev.filter(l => l.id !== id));
    };

    // ─── GUARDAR COMPROBANTE ───
    const guardarComprobante = () => {
        if (!concepto.trim()) {
            mostrarMensaje('error', 'El concepto es obligatorio');
            return;
        }
        if (lineas.length === 0) {
            mostrarMensaje('error', 'Debe agregar al menos una línea');
            return;
        }
        if (!equilibrado) {
            mostrarMensaje('error', `El comprobante no está equilibrado. Diferencia: ${diferencia.toFixed(2)}`);
            return;
        }
        if (lineas.some(l => !l.cuentaId)) {
            mostrarMensaje('error', 'Todas las líneas deben tener una cuenta asignada');
            return;
        }

        const nuevo: Comprobante = {
            id: Date.now().toString(),
            fecha: fecha.format('YYYY-MM-DD'),
            numero,
            concepto: concepto.trim(),
            lineas: [...lineas],
            totalDebito,
            totalCredito,
            equilibrado: true,
        };

        setComprobantes(prev => [nuevo, ...prev]);
        limpiarFormulario();
        mostrarMensaje('success', `Comprobante ${numero} guardado correctamente`);
    };

    const limpiarFormulario = () => {
        setFecha(dayjs());
        setConcepto('');
        setLineas([]);
    };

    const eliminarComprobante = (id: string) => {
        setComprobantes(prev => prev.filter(c => c.id !== id));
        mostrarMensaje('success', 'Comprobante eliminado');
    };

    // ─── COLUMNAS PARA CUSTOMDATAGRIDR ───
    const columns: Column<Comprobante>[] = [
        { field: 'numero', headerName: 'Nº Comprobante' },
        { field: 'fecha', headerName: 'Fecha' },
        { field: 'concepto', headerName: 'Concepto' },
        { field: 'totalDebito', headerName: 'Total Débito', numeric: true },
        { field: 'totalCredito', headerName: 'Total Crédito', numeric: true },
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                {mensaje && (
                    <Alert
                        severity={mensaje.tipo}
                        sx={{ mb: 2, borderRadius: 2 }}
                        icon={mensaje.tipo === 'error' ? <WarningAmberIcon /> : undefined}
                    >
                        {mensaje.text}
                    </Alert>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    CARD: REGISTRAR COMPROBANTE
                    ═══════════════════════════════════════════════════════════ */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid rgba(0,0,0,0.04)',
                        bgcolor: '#fff',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                        mb: 3,
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        {/* Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'rgba(10, 83, 218, 0.08)',
                                    color: 'rgb(10, 83, 218)',
                                }}
                            >
                                <ReceiptLongIcon />
                            </Avatar>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Registrar Comprobante
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        {/* Fila superior: Fecha, Número, Concepto */}
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                            <MobileDatePicker
                                label="Fecha"
                                value={fecha}
                                onChange={(newValue) => newValue && setFecha(newValue)}
                                slotProps={{
                                    textField: {
                                        size: 'small',
                                        sx: {
                                            minWidth: 160,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                bgcolor: '#f8f9fa',
                                            },
                                        },
                                    },
                                }}
                            />
                            <TextField
                                label="Nº Comprobante"
                                value={numero}
                                slotProps={{
                                    input: { readOnly: true }
                                }}
                                size="small"
                                sx={{
                                    minWidth: 160,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                            <TextField
                                label="Concepto"
                                placeholder="Descripción de la operación"
                                value={concepto}
                                onChange={(e) => setConcepto(e.target.value)}
                                size="small"
                                sx={{
                                    flex: 1,
                                    minWidth: 280,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                        </Box>

                        {/* ═══════════════════════════════════════════════════════════
                            LÍNEAS DEL COMPROBANTE
                            ═══════════════════════════════════════════════════════════ */}
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                bgcolor: '#f8f9fa',
                                border: '1px solid rgba(0,0,0,0.06)',
                                mb: 2,
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#555', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BalanceIcon sx={{ fontSize: 18, color: 'rgb(10, 83, 218)' }} />
                                        Líneas del Comprobante
                                        <Chip
                                            label={equilibrado ? '✓ Equilibrado' : `Diferencia: ${diferencia.toFixed(2)}`}
                                            size="small"
                                            sx={{
                                                ml: 1,
                                                bgcolor: equilibrado ? 'rgba(36, 236, 9, 0.15)' : 'rgba(255, 165, 0, 0.15)',
                                                color: equilibrado ? '#1e7e34' : '#b8860b',
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<AddIcon />}
                                        onClick={agregarLinea}
                                        sx={{
                                            background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                            color: '#fff',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
                                        }}
                                    >
                                        Agregar línea
                                    </Button>
                                </Box>

                                <Divider sx={{ mb: 2 }} />

                                {/* Lista de líneas */}
                                <Stack spacing={1.5}>
                                    {lineas.length === 0 && (
                                        <Box sx={{ textAlign: 'center', py: 4, color: '#888' }}>
                                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(10, 83, 218, 0.06)', color: '#bbb', mx: 'auto', mb: 1.5 }}>
                                                <BalanceIcon sx={{ fontSize: 28 }} />
                                            </Avatar>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay líneas. Haz clic en "Agregar línea" para comenzar.
                                            </Typography>
                                        </Box>
                                    )}

                                    {lineas.map((linea, idx) => (
                                        <Box
                                            key={linea.id}
                                            sx={{
                                                display: 'flex',
                                                gap: 1.5,
                                                flexWrap: 'wrap',
                                                alignItems: 'center',
                                                p: 2,
                                                borderRadius: 2,
                                                bgcolor: '#fff',
                                                border: '1px solid rgba(0,0,0,0.04)',
                                                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    width: 28,
                                                    height: 28,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '50%',
                                                    bgcolor: 'rgba(10, 83, 218, 0.08)',
                                                    color: 'rgb(10, 83, 218)',
                                                    fontWeight: 700,
                                                    fontSize: '0.75rem',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {idx + 1}
                                            </Typography>

                                            {/* Cuenta */}
                                            <FormControl size="small" sx={{ minWidth: 220, flex: 2 }}>
                                                <InputLabel>Cuenta</InputLabel>
                                                <Select
                                                    value={linea.cuentaId}
                                                    label="Cuenta"
                                                    onChange={(e) => actualizarLinea(linea.id, 'cuentaId', e.target.value)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        bgcolor: '#f8f9fa',
                                                        '& .MuiSelect-select': { fontSize: '0.85rem' },
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <em>-- Seleccionar cuenta --</em>
                                                    </MenuItem>
                                                    {cuentas.map((c: any) => (
                                                        <MenuItem key={c.id} value={c.id}>
                                                            {c.codigo} - {c.nombre}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            {/* Elemento de Gasto */}
                                            <FormControl size="small" sx={{ minWidth: 180, flex: 1.5 }}>
                                                <InputLabel>Elemento de Gasto</InputLabel>
                                                <Select
                                                    value={linea.elementoGastoId}
                                                    label="Elemento de Gasto"
                                                    onChange={(e) => actualizarLinea(linea.id, 'elementoGastoId', e.target.value)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        bgcolor: '#f8f9fa',
                                                        '& .MuiSelect-select': { fontSize: '0.85rem' },
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <em>-- Opcional --</em>
                                                    </MenuItem>
                                                    {elementosGasto.map((e: any) => (
                                                        <MenuItem key={e.id} value={e.id}>
                                                            {e.codigo} - {e.nombre}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            {/* Centro de Costo */}
                                            <FormControl size="small" sx={{ minWidth: 180, flex: 1.5 }}>
                                                <InputLabel>Centro de Costo</InputLabel>
                                                <Select
                                                    value={linea.centroCostoId}
                                                    label="Centro de Costo"
                                                    onChange={(e) => actualizarLinea(linea.id, 'centroCostoId', e.target.value)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        bgcolor: '#f8f9fa',
                                                        '& .MuiSelect-select': { fontSize: '0.85rem' },
                                                    }}
                                                >
                                                    <MenuItem value="">
                                                        <em>-- Opcional --</em>
                                                    </MenuItem>
                                                    {centrosCosto.map((c: any) => (
                                                        <MenuItem key={c.id} value={c.id}>
                                                            {c.codigo} - {c.nombre}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            {/* Débito */}
                                            <TextField
                                                label="Débito"
                                                type="number"
                                                value={linea.debe || ''}
                                                onChange={(e) => actualizarLinea(linea.id, 'debe', parseFloat(e.target.value) || 0)}
                                                size="small"
                                                sx={{
                                                    minWidth: 100,
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: '#f8f9fa',
                                                    },
                                                }}
                                            />

                                            {/* Haber */}
                                            <TextField
                                                label="Haber"
                                                type="number"
                                                value={linea.haber || ''}
                                                onChange={(e) => actualizarLinea(linea.id, 'haber', parseFloat(e.target.value) || 0)}
                                                size="small"
                                                sx={{
                                                    minWidth: 100,
                                                    flex: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: '#f8f9fa',
                                                    },
                                                }}
                                            />

                                            {/* Descripción */}
                                            <TextField
                                                label="Descripción"
                                                placeholder="Detalle..."
                                                value={linea.descripcion}
                                                onChange={(e) => actualizarLinea(linea.id, 'descripcion', e.target.value)}
                                                size="small"
                                                sx={{
                                                    minWidth: 180,
                                                    flex: 2,
                                                    '& .MuiOutlinedInput-root': {
                                                        borderRadius: 2,
                                                        bgcolor: '#f8f9fa',
                                                    },
                                                }}
                                            />

                                            {/* Eliminar línea */}
                                            <IconButton
                                                onClick={() => eliminarLinea(linea.id)}
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    bgcolor: 'rgb(220, 20, 60)',
                                                    color: 'white',
                                                    borderRadius: '50%',
                                                    flexShrink: 0,
                                                    '&:hover': {
                                                        bgcolor: 'rgb(200, 10, 40)',
                                                        transform: 'scale(1.05)',
                                                    },
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>

                                {/* Totales */}
                                {lineas.length > 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            gap: 2,
                                            mt: 2,
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: '#fff',
                                            border: '1px solid rgba(0,0,0,0.04)',
                                            flexWrap: 'wrap',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Chip
                                            label={`Total Débito: ${totalDebito.toFixed(2)}`}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(10, 83, 218, 0.08)',
                                                color: 'rgb(10, 83, 218)',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                borderRadius: 1.5,
                                            }}
                                        />
                                        <Chip
                                            label={`Total Crédito: ${totalCredito.toFixed(2)}`}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(196, 45, 226, 0.08)',
                                                color: 'rgb(196, 45, 226)',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                borderRadius: 1.5,
                                            }}
                                        />
                                        <Chip
                                            label={equilibrado ? '✓ Equilibrado' : `⚠ Diferencia: ${diferencia.toFixed(2)}`}
                                            size="small"
                                            sx={{
                                                bgcolor: equilibrado ? 'rgba(36, 236, 9, 0.15)' : 'rgba(255, 165, 0, 0.15)',
                                                color: equilibrado ? '#1e7e34' : '#b8860b',
                                                fontWeight: 700,
                                                fontSize: '0.85rem',
                                                borderRadius: 1.5,
                                            }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Botones de acción */}
                        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SaveIcon />}
                                onClick={guardarComprobante}
                                disabled={!equilibrado || lineas.length === 0}
                                sx={{
                                    background: 'linear-gradient(135deg, rgb(36, 236, 9), rgba(202, 183, 14, 0.9))',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgb(24, 158, 6)',
                                    },
                                    '&.Mui-disabled': {
                                        background: '#e0e0e0',
                                        color: '#999',
                                    },
                                }}
                            >
                                Guardar Comprobante
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={limpiarFormulario}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderColor: 'rgba(10, 83, 218, 0.3)',
                                    color: 'rgb(10, 83, 218)',
                                    '&:hover': { borderColor: 'rgb(10, 83, 218)', bgcolor: 'rgba(10, 83, 218, 0.04)' },
                                }}
                            >
                                Limpiar
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
                    CARD: COMPROBANTES REGISTRADOS (CustomDataGridR)
                    ═══════════════════════════════════════════════════════════ */}
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        border: '1px solid rgba(0,0,0,0.04)',
                        bgcolor: '#f8f9fa',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        overflow: 'hidden',
                    }}
                >
                    <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, mb: 3, gap: 2 }}>
                            <Typography variant="h6" sx={{
                                p: 1,
                                background: 'linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontWeight: 700,
                            }}>
                                <ReceiptLongIcon sx={{ mr: 1, verticalAlign: 'middle', fill: 'url(#iconGradientComp)' }} />
                                <svg width="0" height="0"><defs><linearGradient id="iconGradientComp" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" /><stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" /></linearGradient></defs></svg>
                                Comprobantes Registrados
                            </Typography>
                            <Chip
                                label={`${comprobantes.length} comprobantes`}
                                size="medium"
                                sx={{
                                    bgcolor: 'rgba(10, 83, 218, 0.1)',
                                    color: 'rgb(10, 83, 218)',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    p: 1,
                                }}
                            />
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {comprobantes.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                                <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(10, 83, 218, 0.08)', color: 'rgb(10, 83, 218)', mx: 'auto', mb: 2 }}>
                                    <SearchIcon sx={{ fontSize: 32 }} />
                                </Avatar>
                                <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                    No hay comprobantes registrados
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    Crea un nuevo comprobante usando el formulario de arriba
                                </Typography>
                            </Box>
                        ) : (
                            <CustomDataGridR<Comprobante>
                                rows={comprobantes}
                                columns={columns}
                                getRowId={(row) => row.id}
                                title="Historial de Comprobantes"
                                onEditRow={(row) => {
                                    // Cargar en el formulario para edición
                                    setFecha(dayjs(row.fecha));
                                    setNumero(row.numero);
                                    setConcepto(row.concepto);
                                    setLineas(row.lineas.map(l => ({ ...l })));
                                    // Eliminar el original para reemplazarlo al guardar
                                    setComprobantes(prev => prev.filter(c => c.id !== row.id));
                                    mostrarMensaje('success', 'Comprobante cargado para edición');
                                }}
                                deleteConfig={{
                                    baseUrl: '', // local only
                                    getId: (row) => row.id,
                                    onSuccess: () => {
                                        // Se maneja por el onEditRow, aquí no hay backend real
                                    },
                                }}
                            />
                        )}
                    </CardContent>
                </Card>
            </Box>
        </LocalizationProvider>
    );
}
// src/components/SubmayorTab.tsx
import React, { useState, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Divider,
    Chip,
    Avatar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import CustomDataGridR, { type Column } from './CustomDataGridR';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════
interface LineaComprobante {
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

interface Comprobante {
    id: string;
    fecha: string;
    numero: string;
    concepto: string;
    lineas: LineaComprobante[];
    totalDebito: number;
    totalCredito: number;
    equilibrado: boolean;
}

interface Asiento {
    id: string;
    fecha: string;
    numero: string;
    concepto: string;
    cuenta: string;
    debe: number;
    haber: number;
}

interface Cuenta {
    id: string;
    codigo: string;
    nombre: string;
    naturaleza: 'Deudora' | 'Acreedora';
    padre: string;
    moneda: string;
    nivel: number;
}

interface CentroCosto {
    id: string;
    codigo: string;
    nombre: string;
}

interface SubmayorLinea {
    id: string;
    fecha: string;
    comprobante: string;
    concepto: string;
    debe: number;
    haber: number;
    saldo: number;
    centroCosto: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════
export default function SubmayorTab() {
    const [cuentaId, setCuentaId] = useState('');
    const [centroCostoId, setCentroCostoId] = useState('');
    const [fechaInicio, setFechaInicio] = useState<Dayjs>(dayjs().startOf('month'));
    const [fechaFin, setFechaFin] = useState<Dayjs>(dayjs().endOf('month'));
    const [calculado, setCalculado] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; text: string } | null>(null);

    // ─── DATOS DESDE LOCALSTORAGE ───
    const cuentas = useMemo(() => {
        const saved = localStorage.getItem('conta_cuentas');
        return saved ? JSON.parse(saved) as Cuenta[] : [];
    }, []);

    const centrosCosto = useMemo(() => {
        const saved = localStorage.getItem('conta_centros_costo');
        return saved ? JSON.parse(saved) as CentroCosto[] : [];
    }, []);

    const comprobantes = useMemo(() => {
        const saved = localStorage.getItem('conta_comprobantes');
        return saved ? JSON.parse(saved) as Comprobante[] : [];
    }, []);

    const asientos = useMemo(() => {
        const saved = localStorage.getItem('conta_asientos');
        return saved ? JSON.parse(saved) as Asiento[] : [];
    }, []);

    // ─── CÁLCULO DEL SUBMAYOR ───
    const calcularSubmayor = (): { lineas: SubmayorLinea[]; totalDebe: number; totalHaber: number; saldoFinal: number } => {
        const inicio = fechaInicio.format('YYYY-MM-DD');
        const fin = fechaFin.format('YYYY-MM-DD');
        const cuentaSeleccionada = cuentas.find((c) => c.id === cuentaId);
        const naturaleza = cuentaSeleccionada?.naturaleza || 'Deudora';

        const movimientos: SubmayorLinea[] = [];

        // Procesar comprobantes
        comprobantes.forEach((comp) => {
            if (comp.fecha < inicio || comp.fecha > fin) return;
            comp.lineas.forEach((linea) => {
                if (linea.cuentaId !== cuentaId) return;
                if (centroCostoId && linea.centroCostoId !== centroCostoId) return;

                movimientos.push({
                    id: `${comp.id}-${linea.id}`,
                    fecha: comp.fecha,
                    comprobante: comp.numero,
                    concepto: linea.descripcion || comp.concepto,
                    debe: linea.debe || 0,
                    haber: linea.haber || 0,
                    saldo: 0, // se calcula después
                    centroCosto: linea.centroCostoNombre || '—',
                });
            });
        });

        // Procesar asientos (cuentas por código)
        if (cuentaSeleccionada) {
            asientos.forEach((asiento) => {
                if (asiento.fecha < inicio || asiento.fecha > fin) return;
                const codigoAsiento = asiento.cuenta.split(' ')[0];
                if (codigoAsiento !== cuentaSeleccionada.codigo) return;

                movimientos.push({
                    id: `asiento-${asiento.id}`,
                    fecha: asiento.fecha,
                    comprobante: asiento.numero,
                    concepto: asiento.concepto,
                    debe: asiento.debe || 0,
                    haber: asiento.haber || 0,
                    saldo: 0,
                    centroCosto: '—',
                });
            });
        }

        // Ordenar por fecha
        movimientos.sort((a, b) => a.fecha.localeCompare(b.fecha));

        // Calcular saldo acumulado
        let saldo = 0;
        const lineasConSaldo = movimientos.map((m) => {
            if (naturaleza === 'Deudora') {
                saldo += m.debe - m.haber;
            } else {
                saldo += m.haber - m.debe;
            }
            return { ...m, saldo };
        });

        const totalDebe = lineasConSaldo.reduce((acc, l) => acc + l.debe, 0);
        const totalHaber = lineasConSaldo.reduce((acc, l) => acc + l.haber, 0);

        return {
            lineas: lineasConSaldo,
            totalDebe,
            totalHaber,
            saldoFinal: saldo,
        };
    };

    const [resultados, setResultados] = useState<ReturnType<typeof calcularSubmayor>>({
        lineas: [],
        totalDebe: 0,
        totalHaber: 0,
        saldoFinal: 0,
    });

    const handleConsultar = () => {
        if (!cuentaId) {
            setMensaje({ tipo: 'error', text: 'Debe seleccionar una cuenta' });
            return;
        }
        if (fechaFin.isBefore(fechaInicio)) {
            setMensaje({ tipo: 'error', text: 'La fecha fin no puede ser anterior a la fecha inicio' });
            return;
        }

        const data = calcularSubmayor();
        setResultados(data);
        setCalculado(true);

        if (data.lineas.length === 0) {
            setMensaje({ tipo: 'info', text: 'No se encontraron movimientos para la cuenta en el período seleccionado' });
        } else {
            setMensaje({ tipo: 'success', text: `${data.lineas.length} movimientos encontrados` });
        }

        setTimeout(() => setMensaje(null), 4000);
    };

    // ─── COLUMNAS PARA CUSTOMDATAGRIDR ───
    const columns: Column<SubmayorLinea>[] = [
        { field: 'fecha', headerName: 'Fecha' },
        { field: 'comprobante', headerName: 'Comprobante' },
        { field: 'concepto', headerName: 'Concepto / Descripción' },
        { field: 'debe', headerName: 'Debe', numeric: true },
        { field: 'haber', headerName: 'Haber', numeric: true },
        { field: 'saldo', headerName: 'Saldo', numeric: true },
        { field: 'centroCosto', headerName: 'Centro de Costo' },
    ];

    const { lineas, totalDebe, totalHaber, saldoFinal } = resultados;
    const cuentaSeleccionada = cuentas.find((c) => c.id === cuentaId);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                {mensaje && (
                    <Alert
                        severity={mensaje.tipo === 'info' ? 'warning' : mensaje.tipo}
                        sx={{ mb: 2, borderRadius: 2 }}
                        icon={mensaje.tipo === 'info' ? <WarningAmberIcon /> : undefined}
                    >
                        {mensaje.text}
                    </Alert>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    CARD: FILTROS
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'rgba(10, 83, 218, 0.08)',
                                    color: 'rgb(10, 83, 218)',
                                }}
                            >
                                <MenuBookIcon />
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
                                Submayor de Cuentas
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            {/* Cuenta */}
                            <FormControl size="small" sx={{ minWidth: 260, flex: 1 }}>
                                <InputLabel>Cuenta</InputLabel>
                                <Select
                                    value={cuentaId}
                                    label="Cuenta"
                                    onChange={(e) => {
                                        setCuentaId(e.target.value);
                                        setCalculado(false);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                        '& .MuiSelect-select': { fontSize: '0.85rem' },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>-- Seleccionar --</em>
                                    </MenuItem>
                                    {cuentas.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.codigo} - {c.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Centro de Costo */}
                            <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                                <InputLabel>Centro de Costo</InputLabel>
                                <Select
                                    value={centroCostoId}
                                    label="Centro de Costo"
                                    onChange={(e) => {
                                        setCentroCostoId(e.target.value);
                                        setCalculado(false);
                                    }}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                        '& .MuiSelect-select': { fontSize: '0.85rem' },
                                    }}
                                >
                                    <MenuItem value="">
                                        <em>-- Todos --</em>
                                    </MenuItem>
                                    {centrosCosto.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.codigo} - {c.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Fecha Inicio */}
                            <MobileDatePicker
                                label="Fecha Inicio"
                                value={fechaInicio}
                                onChange={(newValue) => {
                                    newValue && setFechaInicio(newValue);
                                    setCalculado(false);
                                }}
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

                            {/* Fecha Fin */}
                            <MobileDatePicker
                                label="Fecha Fin"
                                value={fechaFin}
                                onChange={(newValue) => {
                                    newValue && setFechaFin(newValue);
                                    setCalculado(false);
                                }}
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

                            {/* Botón */}
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SearchIcon />}
                                onClick={handleConsultar}
                                sx={{
                                    background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    px: 3,
                                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
                                }}
                            >
                                Consultar
                            </Button>
                        </Box>

                        {calculado && cuentaSeleccionada && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                    label={`Cuenta: ${cuentaSeleccionada.codigo} - ${cuentaSeleccionada.nombre}`}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(10, 83, 218, 0.08)',
                                        color: 'rgb(10, 83, 218)',
                                        fontWeight: 600,
                                        borderRadius: 1.5,
                                    }}
                                />
                                <Chip
                                    label={`Período: ${fechaInicio.format('DD/MM/YYYY')} - ${fechaFin.format('DD/MM/YYYY')}`}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(196, 45, 226, 0.08)',
                                        color: 'rgb(196, 45, 226)',
                                        fontWeight: 600,
                                        borderRadius: 1.5,
                                    }}
                                />
                                {centroCostoId && (
                                    <Chip
                                        label={`Centro: ${centrosCosto.find((c) => c.id === centroCostoId)?.nombre || ''}`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255, 165, 0, 0.12)',
                                            color: '#b8860b',
                                            fontWeight: 600,
                                            borderRadius: 1.5,
                                        }}
                                    />
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
                    RESUMEN (solo cuando se calcula)
                    ═══════════════════════════════════════════════════════════ */}
                {calculado && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                        {/* Total Debe */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(10, 83, 218, 0.08)', color: 'rgb(10, 83, 218)', mx: 'auto', mb: 1 }}>
                                    <MenuBookIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Total Debe
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(10, 83, 218)', mt: 0.5 }}>
                                    {totalDebe.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Total Haber */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(196, 45, 226, 0.08)', color: 'rgb(196, 45, 226)', mx: 'auto', mb: 1 }}>
                                    <MenuBookIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Total Haber
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(196, 45, 226)', mt: 0.5 }}>
                                    {totalHaber.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Saldo Final */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(36, 236, 9, 0.15)', color: '#1e7e34', mx: 'auto', mb: 1 }}>
                                    <SearchIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Saldo Final
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        mt: 0.5,
                                        color: saldoFinal >= 0 ? '#1e7e34' : '#c0392b',
                                    }}
                                >
                                    {saldoFinal.toFixed(2)} {cuentaSeleccionada?.moneda || 'CUP'}
                                </Typography>
                                {cuentaSeleccionada && (
                                    <Chip
                                        label={cuentaSeleccionada.naturaleza}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            bgcolor: cuentaSeleccionada.naturaleza === 'Deudora' ? 'rgba(255, 174, 0, 0.15)' : 'rgba(36, 236, 9, 0.15)',
                                            color: cuentaSeleccionada.naturaleza === 'Deudora' ? '#b8860b' : '#1e7e34',
                                            fontWeight: 600,
                                            fontSize: '0.7rem',
                                        }}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TABLA DE RESULTADOS (CustomDataGridR)
                    ═══════════════════════════════════════════════════════════ */}
                {calculado && (
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
                                    <MenuBookIcon sx={{ mr: 1, verticalAlign: 'middle', fill: 'url(#iconGradientSub)' }} />
                                    <svg width="0" height="0"><defs><linearGradient id="iconGradientSub" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" /><stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" /></linearGradient></defs></svg>
                                    Movimientos de la Cuenta
                                </Typography>
                                <Chip
                                    label={`${lineas.length} movimientos`}
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

                            {lineas.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(10, 83, 218, 0.08)', color: 'rgb(10, 83, 218)', mx: 'auto', mb: 2 }}>
                                        <SearchIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                        No hay movimientos para esta cuenta en el período
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Registra comprobantes o asientos contables para visualizar el submayor
                                    </Typography>
                                </Box>
                            ) : (
                                <CustomDataGridR<SubmayorLinea>
                                    rows={lineas}
                                    columns={columns}
                                    getRowId={(row) => row.id}
                                    title="Submayor"
                                />
                            )}

                            {lineas.length > 0 && (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    flexWrap: 'wrap',
                                    gap: 2,
                                    mt: 2,
                                    pt: 2,
                                    borderTop: '2px solid #e0e0e0'
                                }}>
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgb(10, 83, 218)' }}>
                                            Total Debe: {totalDebe.toFixed(2)}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgb(196, 45, 226)' }}>
                                            Total Haber: {totalHaber.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontWeight: 700,
                                            color: saldoFinal >= 0 ? '#1e7e34' : '#c0392b',
                                        }}
                                    >
                                        Saldo Final: {saldoFinal.toFixed(2)} {cuentaSeleccionada?.moneda || 'CUP'}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Box>
        </LocalizationProvider>
    );
}
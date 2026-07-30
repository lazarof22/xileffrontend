// src/components/GastosPorElementosTab.tsx
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
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
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

interface ElementoGasto {
    id: string;
    codigo: string;
    nombre: string;
}

interface ResultadoElemento {
    id: string;
    elementoCodigo: string;
    elementoNombre: string;
    monto: number;
    cantidadMovimientos: number;
    porcentaje: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════
export default function GastosPorElementosTab() {
    const [fechaInicio, setFechaInicio] = useState<Dayjs>(dayjs().startOf('month'));
    const [fechaFin, setFechaFin] = useState<Dayjs>(dayjs().endOf('month'));
    const [calculado, setCalculado] = useState(false);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; text: string } | null>(null);

    // ─── DATOS DESDE LOCALSTORAGE ───
    const comprobantes = useMemo(() => {
        const saved = localStorage.getItem('conta_comprobantes');
        return saved ? JSON.parse(saved) as Comprobante[] : [];
    }, []);

    const asientos = useMemo(() => {
        const saved = localStorage.getItem('conta_asientos');
        return saved ? JSON.parse(saved) as Asiento[] : [];
    }, []);

    const elementosGasto = useMemo(() => {
        const saved = localStorage.getItem('conta_elementos_gasto');
        return saved ? JSON.parse(saved) as ElementoGasto[] : [];
    }, []);

    const clasificacionesIG = useMemo(() => {
        const saved = localStorage.getItem('conta_clasificaciones_ig');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const cuentas = useMemo(() => {
        const saved = localStorage.getItem('conta_cuentas');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // ─── CÁLCULO ───
    const calcularGastos = (): { lineas: ResultadoElemento[]; totalGeneral: number } => {
        const inicio = fechaInicio.format('YYYY-MM-DD');
        const fin = fechaFin.format('YYYY-MM-DD');

        const acumulado: Record<string, { codigo: string; nombre: string; monto: number; movs: number }> = {};

        // Procesar comprobantes
        comprobantes.forEach((comp) => {
            if (comp.fecha < inicio || comp.fecha > fin) return;
            comp.lineas.forEach((linea) => {
                // Verificar que la cuenta sea de tipo Gasto
                const clasif = clasificacionesIG.find((c: any) => c.cuentaId === linea.cuentaId);
                const esGasto = clasif?.tipo === 'Gasto';
                const codigoCuenta = linea.cuentaId ? cuentas.find((c: any) => c.id === linea.cuentaId)?.codigo : '';
                const esGastoPorCodigo = codigoCuenta?.startsWith('5');

                if (!esGasto && !esGastoPorCodigo) return;
                if (linea.debe <= 0) return;
                if (!linea.elementoGastoId) return;

                const elem = elementosGasto.find((e) => e.id === linea.elementoGastoId);
                if (!elem) return;

                if (!acumulado[elem.id]) {
                    acumulado[elem.id] = { codigo: elem.codigo, nombre: elem.nombre, monto: 0, movs: 0 };
                }
                acumulado[elem.id].monto += linea.debe;
                acumulado[elem.id].movs += 1;
            });
        });

        // Procesar asientos como respaldo (cuentas 5.x con elemento de gasto)
        asientos.forEach((asiento) => {
            if (asiento.fecha < inicio || asiento.fecha > fin) return;
            const codigoCuenta = asiento.cuenta.split(' ')[0];
            if (!codigoCuenta.startsWith('5')) return;
            if (asiento.debe <= 0) return;

            // Para asientos simples, asignar a "Sin clasificar" o buscar elemento
            // Por simplicidad, los asientos sin elemento de gasto se omiten aquí
            // o se pueden asignar a un elemento genérico si se desea
        });

        const totalGeneral = Object.values(acumulado).reduce((acc, curr) => acc + curr.monto, 0);

        const lineas: ResultadoElemento[] = Object.entries(acumulado)
            .map(([id, data]) => ({
                id,
                elementoCodigo: data.codigo,
                elementoNombre: `${data.codigo} - ${data.nombre}`,
                monto: data.monto,
                cantidadMovimientos: data.movs,
                porcentaje: totalGeneral > 0 ? (data.monto / totalGeneral) * 100 : 0,
            }))
            .sort((a, b) => b.monto - a.monto);

        return { lineas, totalGeneral };
    };

    const [resultados, setResultados] = useState<ReturnType<typeof calcularGastos>>({
        lineas: [],
        totalGeneral: 0,
    });

    const handleGenerar = () => {
        if (fechaFin.isBefore(fechaInicio)) {
            setMensaje({ tipo: 'error', text: 'La fecha fin no puede ser anterior a la fecha inicio' });
            return;
        }

        const data = calcularGastos();
        setResultados(data);
        setCalculado(true);

        if (data.lineas.length === 0) {
            setMensaje({ tipo: 'info', text: 'No se encontraron gastos por elementos en el período seleccionado' });
        } else {
            setMensaje({ tipo: 'success', text: `Generado: ${data.lineas.length} elementos de gasto encontrados` });
        }

        setTimeout(() => setMensaje(null), 4000);
    };

    // ─── COLUMNAS PARA CUSTOMDATAGRIDR ───
    const columns: Column<ResultadoElemento>[] = [
        { field: 'elementoCodigo', headerName: 'Código' },
        { field: 'elementoNombre', headerName: 'Elemento de Gasto' },
        { field: 'monto', headerName: 'Monto', numeric: true },
        { field: 'cantidadMovimientos', headerName: 'Movimientos', numeric: true },
        { field: 'porcentaje', headerName: '% del Total', numeric: true },
    ];

    const { lineas, totalGeneral } = resultados;

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
                    CARD: FILTROS DE PERÍODO
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
                                <CalculateIcon />
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
                                Gastos por Elementos
                            </Typography>
                        </Box>
                        <Divider sx={{ mb: 3 }} />

                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                            <MobileDatePicker
                                label="Fecha Inicio"
                                value={fechaInicio}
                                onChange={(newValue) => newValue && setFechaInicio(newValue)}
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
                            <MobileDatePicker
                                label="Fecha Fin"
                                value={fechaFin}
                                onChange={(newValue) => newValue && setFechaFin(newValue)}
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
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<CalculateIcon />}
                                onClick={handleGenerar}
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
                                Generar
                            </Button>
                        </Box>

                        {calculado && (
                            <Box sx={{ mt: 2 }}>
                                <Chip
                                    label={`Período: ${fechaInicio.format('DD/MM/YYYY')} - ${fechaFin.format('DD/MM/YYYY')}`}
                                    size="small"
                                    sx={{
                                        bgcolor: 'rgba(10, 83, 218, 0.08)',
                                        color: 'rgb(10, 83, 218)',
                                        fontWeight: 600,
                                        borderRadius: 1.5,
                                    }}
                                />
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* ═══════════════════════════════════════════════════════════
                    RESUMEN (solo cuando se calcula)
                    ═══════════════════════════════════════════════════════════ */}
                {calculado && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                        {/* Total Gastos */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255, 0, 0, 0.1)', color: '#c0392b', mx: 'auto', mb: 1.5 }}>
                                    <TrendingDownIcon />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Total Gastos
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#c0392b', mt: 0.5 }}>
                                    {totalGeneral.toFixed(2)} CUP
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Elementos */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(10, 83, 218, 0.08)', color: 'rgb(10, 83, 218)', mx: 'auto', mb: 1.5 }}>
                                    <ReceiptIcon />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Elementos Afectados
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: 'rgb(10, 83, 218)', mt: 0.5 }}>
                                    {lineas.length}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Promedio */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255, 165, 0, 0.12)', color: '#b8860b', mx: 'auto', mb: 1.5 }}>
                                    <CalculateIcon />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Promedio por Elemento
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#b8860b', mt: 0.5 }}>
                                    {lineas.length > 0 ? (totalGeneral / lineas.length).toFixed(2) : '0.00'} CUP
                                </Typography>
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
                                    <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle', fill: 'url(#iconGradientGastos)' }} />
                                    <svg width="0" height="0"><defs><linearGradient id="iconGradientGastos" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" /><stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" /></linearGradient></defs></svg>
                                    Detalle por Elemento de Gasto
                                </Typography>
                                <Chip
                                    label={`${lineas.length} elementos`}
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
                                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255, 0, 0, 0.06)', color: '#c0392b', mx: 'auto', mb: 2 }}>
                                        <SearchIcon sx={{ fontSize: 32 }} />
                                    </Avatar>
                                    <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                        No hay gastos por elementos en este período
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Asegúrate de haber registrado comprobantes con elementos de gasto asignados
                                    </Typography>
                                </Box>
                            ) : (
                                <CustomDataGridR<ResultadoElemento>
                                    rows={lineas}
                                    columns={columns}
                                    getRowId={(row) => row.id}
                                    title="Gastos por Elementos"
                                />
                            )}

                            {lineas.length > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#c0392b' }}>
                                        Total General: {totalGeneral.toFixed(2)} CUP
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
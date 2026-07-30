// src/components/EstadoRendimientoTab.tsx
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SearchIcon from '@mui/icons-material/Search';
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

interface ResultadoLinea {
    id: string;
    cuentaCodigo: string;
    cuentaNombre: string;
    tipo: 'Ingreso' | 'Gasto';
    monto: number;
    periodo: string;
}

interface ResumenPeriodo {
    totalIngresos: number;
    totalGastos: number;
    utilidadNeta: number;
    margenUtilidad: number;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════
export default function EstadoRendimientoTab() {
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

    const clasificacionesIG = useMemo(() => {
        const saved = localStorage.getItem('conta_clasificaciones_ig');
        return saved ? JSON.parse(saved) : [];
    }, []);

    const cuentas = useMemo(() => {
        const saved = localStorage.getItem('conta_cuentas');
        return saved ? JSON.parse(saved) : [];
    }, []);

    // ─── CÁLCULO DE RESULTADOS ───
    const calcularEstado = (): { lineas: ResultadoLinea[]; resumen: ResumenPeriodo } => {
        const inicio = fechaInicio.format('YYYY-MM-DD');
        const fin = fechaFin.format('YYYY-MM-DD');
        const periodo = `${inicio} al ${fin}`;

        const lineas: ResultadoLinea[] = [];

        // Procesar comprobantes
        comprobantes.forEach((comp) => {
            if (comp.fecha < inicio || comp.fecha > fin) return;
            comp.lineas.forEach((linea) => {
                const clasif = clasificacionesIG.find(
                    (c: any) => c.cuentaId === linea.cuentaId
                );
                if (!clasif) return;

                const cuenta = cuentas.find((c: any) => c.id === linea.cuentaId);
                const codigo = cuenta ? cuenta.codigo : '';
                const nombre = cuenta ? cuenta.nombre : linea.cuentaNombre;

                const monto = clasif.tipo === 'Ingreso'
                    ? linea.haber
                    : linea.debe;

                if (monto > 0) {
                    lineas.push({
                        id: `${comp.id}-${linea.id}`,
                        cuentaCodigo: codigo,
                        cuentaNombre: `${codigo} - ${nombre}`,
                        tipo: clasif.tipo,
                        monto,
                        periodo,
                    });
                }
            });
        });

        // Procesar asientos como respaldo (cuentas que empiezan con 4=Ingresos, 5=Gastos)
        asientos.forEach((asiento) => {
            if (asiento.fecha < inicio || asiento.fecha > fin) return;

            const codigoCuenta = asiento.cuenta.split(' ')[0];
            const esIngreso = codigoCuenta.startsWith('4');
            const esGasto = codigoCuenta.startsWith('5');

            if (esIngreso && asiento.haber > 0) {
                lineas.push({
                    id: `asiento-${asiento.id}`,
                    cuentaCodigo: codigoCuenta,
                    cuentaNombre: asiento.cuenta,
                    tipo: 'Ingreso',
                    monto: asiento.haber,
                    periodo,
                });
            }
            if (esGasto && asiento.debe > 0) {
                lineas.push({
                    id: `asiento-${asiento.id}`,
                    cuentaCodigo: codigoCuenta,
                    cuentaNombre: asiento.cuenta,
                    tipo: 'Gasto',
                    monto: asiento.debe,
                    periodo,
                });
            }
        });

        // Agrupar por cuenta
        const agrupado = lineas.reduce((acc, curr) => {
            const key = curr.cuentaCodigo;
            if (!acc[key]) {
                acc[key] = { ...curr, monto: 0 };
            }
            acc[key].monto += curr.monto;
            return acc;
        }, {} as Record<string, ResultadoLinea>);

        const lineasAgrupadas = Object.values(agrupado).filter(l => l.monto > 0);

        const totalIngresos = lineasAgrupadas
            .filter(l => l.tipo === 'Ingreso')
            .reduce((acc, l) => acc + l.monto, 0);

        const totalGastos = lineasAgrupadas
            .filter(l => l.tipo === 'Gasto')
            .reduce((acc, l) => acc + l.monto, 0);

        const utilidadNeta = totalIngresos - totalGastos;
        const margenUtilidad = totalIngresos > 0 ? (utilidadNeta / totalIngresos) * 100 : 0;

        return {
            lineas: lineasAgrupadas,
            resumen: {
                totalIngresos,
                totalGastos,
                utilidadNeta,
                margenUtilidad,
            },
        };
    };

    const [resultados, setResultados] = useState<ReturnType<typeof calcularEstado>>({
        lineas: [],
        resumen: { totalIngresos: 0, totalGastos: 0, utilidadNeta: 0, margenUtilidad: 0 },
    });

    const handleCalcular = () => {
        if (fechaFin.isBefore(fechaInicio)) {
            setMensaje({ tipo: 'error', text: 'La fecha fin no puede ser anterior a la fecha inicio' });
            return;
        }

        const data = calcularEstado();
        setResultados(data);
        setCalculado(true);

        if (data.lineas.length === 0) {
            setMensaje({ tipo: 'info', text: 'No se encontraron movimientos en el período seleccionado' });
        } else {
            setMensaje({ tipo: 'success', text: `Estado calculado: ${data.lineas.length} cuentas afectadas` });
        }

        setTimeout(() => setMensaje(null), 4000);
    };

    // ─── COLUMNAS PARA CUSTOMDATAGRIDR ───
    const ingresosColumns: Column<ResultadoLinea>[] = [
        { field: 'cuentaCodigo', headerName: 'Código' },
        { field: 'cuentaNombre', headerName: 'Cuenta' },
        { field: 'monto', headerName: 'Monto', numeric: true },
    ];

    const gastosColumns: Column<ResultadoLinea>[] = [
        { field: 'cuentaCodigo', headerName: 'Código' },
        { field: 'cuentaNombre', headerName: 'Cuenta' },
        { field: 'monto', headerName: 'Monto', numeric: true },
    ];

    const ingresos = resultados.lineas.filter(l => l.tipo === 'Ingreso');
    const gastos = resultados.lineas.filter(l => l.tipo === 'Gasto');
    const { resumen } = resultados;

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
                                Período de Análisis
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
                                onClick={handleCalcular}
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
                                Calcular
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                        {/* Total Ingresos */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(36, 236, 9, 0.15)', color: '#1e7e34', mx: 'auto', mb: 1.5 }}>
                                    <TrendingUpIcon />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Total Ingresos
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e7e34', mt: 0.5 }}>
                                    {resumen.totalIngresos.toFixed(2)} CUP
                                </Typography>
                            </CardContent>
                        </Card>

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
                                    {resumen.totalGastos.toFixed(2)} CUP
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Utilidad Neta */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(10, 83, 218, 0.08)', color: 'rgb(10, 83, 218)', mx: 'auto', mb: 1.5 }}>
                                    <AccountBalanceIcon />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Utilidad Neta
                                </Typography>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        fontWeight: 700,
                                        mt: 0.5,
                                        background: resumen.utilidadNeta >= 0
                                            ? 'linear-gradient(135deg, #1e7e34, #2ecc71)'
                                            : 'linear-gradient(135deg, #c0392b, #e74c3c)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                    }}
                                >
                                    {resumen.utilidadNeta >= 0 ? '+' : ''}{resumen.utilidadNeta.toFixed(2)} CUP
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Margen */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 48, height: 48, bgcolor: 'rgba(255, 165, 0, 0.12)', color: '#b8860b', mx: 'auto', mb: 1.5 }}>
                                    <CalculateIcon />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Margen de Utilidad
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#b8860b', mt: 0.5 }}>
                                    {resumen.margenUtilidad.toFixed(2)}%
                                </Typography>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    TABLAS DE DETALLE (CustomDataGridR)
                    ═══════════════════════════════════════════════════════════ */}
                {calculado && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3 }}>
                        {/* INGRESOS */}
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: '#1e7e34',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}>
                                        <TrendingUpIcon />
                                        Ingresos
                                    </Typography>
                                    <Chip
                                        label={`${ingresos.length} cuentas`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(36, 236, 9, 0.15)',
                                            color: '#1e7e34',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                        }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                {ingresos.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(36, 236, 9, 0.08)', color: '#1e7e34', mx: 'auto', mb: 2 }}>
                                            <SearchIcon sx={{ fontSize: 32 }} />
                                        </Avatar>
                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                            No hay ingresos en este período
                                        </Typography>
                                    </Box>
                                ) : (
                                    <CustomDataGridR<ResultadoLinea>
                                        rows={ingresos}
                                        columns={ingresosColumns}
                                        getRowId={(row) => row.id}
                                        title="Detalle de Ingresos"
                                    />
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e7e34' }}>
                                        Total: {resumen.totalIngresos.toFixed(2)} CUP
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* GASTOS */}
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
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="h6" sx={{
                                        fontWeight: 700,
                                        color: '#c0392b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}>
                                        <TrendingDownIcon />
                                        Gastos
                                    </Typography>
                                    <Chip
                                        label={`${gastos.length} cuentas`}
                                        size="small"
                                        sx={{
                                            bgcolor: 'rgba(255, 0, 0, 0.1)',
                                            color: '#c0392b',
                                            fontWeight: 600,
                                            borderRadius: 2,
                                        }}
                                    />
                                </Box>
                                <Divider sx={{ mb: 2 }} />

                                {gastos.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 6 }}>
                                        <Avatar sx={{ width: 64, height: 64, bgcolor: 'rgba(255, 0, 0, 0.06)', color: '#c0392b', mx: 'auto', mb: 2 }}>
                                            <SearchIcon sx={{ fontSize: 32 }} />
                                        </Avatar>
                                        <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                            No hay gastos en este período
                                        </Typography>
                                    </Box>
                                ) : (
                                    <CustomDataGridR<ResultadoLinea>
                                        rows={gastos}
                                        columns={gastosColumns}
                                        getRowId={(row) => row.id}
                                        title="Detalle de Gastos"
                                    />
                                )}

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, pt: 2, borderTop: '2px solid #e0e0e0' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#c0392b' }}>
                                        Total: {resumen.totalGastos.toFixed(2)} CUP
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    UTILIDAD DEL PERÍODO (solo cuando hay datos)
                    ═══════════════════════════════════════════════════════════ */}
                {calculado && resultados.lineas.length > 0 && (
                    <Card
                        elevation={0}
                        sx={{
                            mt: 3,
                            borderRadius: 3,
                            border: '1px solid rgba(0,0,0,0.04)',
                            bgcolor: '#fff',
                            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        }}
                    >
                        <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                Utilidad del Período
                            </Typography>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    background: resumen.utilidadNeta >= 0
                                        ? 'linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))'
                                        : 'linear-gradient(135deg, #c0392b, #e74c3c)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                {resumen.utilidadNeta >= 0 ? '+' : ''}{resumen.utilidadNeta.toFixed(2)} CUP
                            </Typography>
                        </CardContent>
                    </Card>
                )}
            </Box>
        </LocalizationProvider>
    );
}
// src/components/BalanceComprobacionTab.tsx
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
    import ScaleIcon from '@mui/icons-material/Scale';
    import SearchIcon from '@mui/icons-material/Search';
    import WarningAmberIcon from '@mui/icons-material/WarningAmber';
    import CheckCircleIcon from '@mui/icons-material/CheckCircle';
    import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';
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

interface BalanceLinea {
    id: string;
    codigo: string;
    cuenta: string;
    naturaleza: string;
    totalDebe: number;
    totalHaber: number;
    saldoDeudor: number;
    saldoAcreedor: number;
}

interface ResumenBalance {
    sumaDebe: number;
    sumaHaber: number;
    sumaSaldoDeudor: number;
    sumaSaldoAcreedor: number;
    diferencia: number;
    cuadrado: boolean;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════
export default function BalanceComprobacionTab() {
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

    const cuentas = useMemo(() => {
        const saved = localStorage.getItem('conta_cuentas');
        return saved ? JSON.parse(saved) as Cuenta[] : [];
    }, []);

    // ─── CÁLCULO DEL BALANCE ───
    const calcularBalance = (): { lineas: BalanceLinea[]; resumen: ResumenBalance } => {
        const inicio = fechaInicio.format('YYYY-MM-DD');
        const fin = fechaFin.format('YYYY-MM-DD');

        const acumulado: Record<string, { codigo: string; nombre: string; naturaleza: string; debe: number; haber: number }> = {};

        // Procesar comprobantes
        comprobantes.forEach((comp) => {
            if (comp.fecha < inicio || comp.fecha > fin) return;
            comp.lineas.forEach((linea) => {
                const cuenta = cuentas.find((c) => c.id === linea.cuentaId);
                const codigo = cuenta ? cuenta.codigo : (linea.cuentaNombre.split(' ')[0] || 'N/A');
                const nombre = cuenta ? cuenta.nombre : linea.cuentaNombre;
                const naturaleza = cuenta ? cuenta.naturaleza : 'Deudora';
                const key = cuenta ? cuenta.id : linea.cuentaId || linea.id;

                if (!acumulado[key]) {
                    acumulado[key] = { codigo, nombre, naturaleza, debe: 0, haber: 0 };
                }
                acumulado[key].debe += linea.debe || 0;
                acumulado[key].haber += linea.haber || 0;
            });
        });

        // Procesar asientos
        asientos.forEach((asiento) => {
            if (asiento.fecha < inicio || asiento.fecha > fin) return;
            const codigoCuenta = asiento.cuenta.split(' ')[0] || 'N/A';
            const nombreCuenta = asiento.cuenta;
            const cuentaDef = cuentas.find((c) => c.codigo === codigoCuenta);
            const key = cuentaDef ? cuentaDef.id : asiento.cuenta;
            const naturaleza = cuentaDef ? cuentaDef.naturaleza : 'Deudora';

            if (!acumulado[key]) {
                acumulado[key] = { codigo: codigoCuenta, nombre: nombreCuenta, naturaleza, debe: 0, haber: 0 };
            }
            acumulado[key].debe += asiento.debe || 0;
            acumulado[key].haber += asiento.haber || 0;
        });

        const lineas: BalanceLinea[] = Object.entries(acumulado)
            .map(([id, data]) => {
                const saldo = data.debe - data.haber;
                return {
                    id,
                    codigo: data.codigo,
                    cuenta: `${data.codigo} - ${data.nombre}`,
                    naturaleza: data.naturaleza,
                    totalDebe: data.debe,
                    totalHaber: data.haber,
                    saldoDeudor: saldo > 0 ? saldo : 0,
                    saldoAcreedor: saldo < 0 ? Math.abs(saldo) : 0,
                };
            })
            .filter((l) => l.totalDebe > 0 || l.totalHaber > 0)
            .sort((a, b) => a.codigo.localeCompare(b.codigo));

        const sumaDebe = lineas.reduce((acc, l) => acc + l.totalDebe, 0);
        const sumaHaber = lineas.reduce((acc, l) => acc + l.totalHaber, 0);
        const sumaSaldoDeudor = lineas.reduce((acc, l) => acc + l.saldoDeudor, 0);
        const sumaSaldoAcreedor = lineas.reduce((acc, l) => acc + l.saldoAcreedor, 0);
        const diferencia = Math.abs(sumaDebe - sumaHaber);
        const cuadrado = diferencia < 0.01;

        return {
            lineas,
            resumen: {
                sumaDebe,
                sumaHaber,
                sumaSaldoDeudor,
                sumaSaldoAcreedor,
                diferencia,
                cuadrado,
            },
        };
    };

    const [resultados, setResultados] = useState<ReturnType<typeof calcularBalance>>({
        lineas: [],
        resumen: { sumaDebe: 0, sumaHaber: 0, sumaSaldoDeudor: 0, sumaSaldoAcreedor: 0, diferencia: 0, cuadrado: true },
    });

    const handleMostrar = () => {
        if (fechaFin.isBefore(fechaInicio)) {
            setMensaje({ tipo: 'error', text: 'La fecha fin no puede ser anterior a la fecha inicio' });
            return;
        }

        const data = calcularBalance();
        setResultados(data);
        setCalculado(true);

        if (data.lineas.length === 0) {
            setMensaje({ tipo: 'info', text: 'No se encontraron movimientos en el período seleccionado' });
        } else if (!data.resumen.cuadrado) {
            setMensaje({ tipo: 'error', text: `⚠ Balance descuadrado. Diferencia: ${data.resumen.diferencia.toFixed(2)}` });
        } else {
            setMensaje({ tipo: 'success', text: `✓ Balance cuadrado. ${data.lineas.length} cuentas analizadas` });
        }

        setTimeout(() => setMensaje(null), 4000);
    };

    // ─── COLUMNAS PARA CUSTOMDATAGRIDR ───
    const columns: Column<BalanceLinea>[] = [
        { field: 'codigo', headerName: 'Código' },
        { field: 'cuenta', headerName: 'Cuenta' },
        { field: 'naturaleza', headerName: 'Naturaleza' },
        { field: 'totalDebe', headerName: 'Debe', numeric: true },
        { field: 'totalHaber', headerName: 'Haber', numeric: true },
        { field: 'saldoDeudor', headerName: 'Saldo Deudor', numeric: true },
        { field: 'saldoAcreedor', headerName: 'Saldo Acreedor', numeric: true },
    ];

    const { lineas, resumen } = resultados;

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
                                <ScaleIcon />
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
                                Balance de Comprobación de Saldos
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
                                onClick={handleMostrar}
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
                                Mostrar
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
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
                        {/* Suma Debe */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(10, 83, 218, 0.08)', color: 'rgb(10, 83, 218)', mx: 'auto', mb: 1 }}>
                                    <CalculateIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Suma Debe
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(10, 83, 218)', mt: 0.5 }}>
                                    {resumen.sumaDebe.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Suma Haber */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(196, 45, 226, 0.08)', color: 'rgb(196, 45, 226)', mx: 'auto', mb: 1 }}>
                                    <CalculateIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Suma Haber
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'rgb(196, 45, 226)', mt: 0.5 }}>
                                    {resumen.sumaHaber.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Saldos Deudores */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(255, 174, 0, 0.15)', color: '#b8860b', mx: 'auto', mb: 1 }}>
                                    <ScaleIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Saldos Deudores
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#b8860b', mt: 0.5 }}>
                                    {resumen.sumaSaldoDeudor.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Saldos Acreedores */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{ width: 44, height: 44, bgcolor: 'rgba(36, 236, 9, 0.15)', color: '#1e7e34', mx: 'auto', mb: 1 }}>
                                    <ScaleIcon sx={{ fontSize: 22 }} />
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Saldos Acreedores
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e7e34', mt: 0.5 }}>
                                    {resumen.sumaSaldoAcreedor.toFixed(2)}
                                </Typography>
                            </CardContent>
                        </Card>

                        {/* Estado */}
                        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid rgba(0,0,0,0.04)', bgcolor: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Avatar sx={{
                                    width: 44, height: 44,
                                    bgcolor: resumen.cuadrado ? 'rgba(36, 236, 9, 0.15)' : 'rgba(255, 0, 0, 0.1)',
                                    color: resumen.cuadrado ? '#1e7e34' : '#c0392b',
                                    mx: 'auto', mb: 1
                                }}>
                                    {resumen.cuadrado ? <CheckCircleIcon sx={{ fontSize: 22 }} /> : <ErrorOutlineIcon sx={{ fontSize: 22 }} />}
                                </Avatar>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Estado
                                </Typography>
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    color: resumen.cuadrado ? '#1e7e34' : '#c0392b',
                                    mt: 0.5
                                }}>
                                    {resumen.cuadrado ? '✓ Cuadrado' : '✗ Descuadrado'}
                                </Typography>
                                {!resumen.cuadrado && (
                                    <Typography variant="caption" sx={{ color: '#c0392b', fontWeight: 500 }}>
                                        Dif: {resumen.diferencia.toFixed(2)}
                                    </Typography>
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
                                    <ScaleIcon sx={{ mr: 1, verticalAlign: 'middle', fill: 'url(#iconGradientBal)' }} />
                                    <svg width="0" height="0"><defs><linearGradient id="iconGradientBal" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" /><stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" /></linearGradient></defs></svg>
                                    Detalle del Balance
                                </Typography>
                                <Chip
                                    label={`${lineas.length} cuentas`}
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
                                        No hay movimientos en este período
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Registra comprobantes o asientos contables para visualizar el balance
                                    </Typography>
                                </Box>
                            ) : (
                                <CustomDataGridR<BalanceLinea>
                                    rows={lineas}
                                    columns={columns}
                                    getRowId={(row) => row.id}
                                    title="Balance de Comprobación"
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
                                            Σ Debe: {resumen.sumaDebe.toFixed(2)}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'rgb(196, 45, 226)' }}>
                                            Σ Haber: {resumen.sumaHaber.toFixed(2)}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#b8860b' }}>
                                            Σ Saldos Deudores: {resumen.sumaSaldoDeudor.toFixed(2)}
                                        </Typography>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e7e34' }}>
                                            Σ Saldos Acreedores: {resumen.sumaSaldoAcreedor.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Box>
        </LocalizationProvider>
    );
}
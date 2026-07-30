// src/pages/ContabilidadPage.tsx
import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Tabs,
    Tab,
    Alert,
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScaleIcon from '@mui/icons-material/Scale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ConfigContabilidadTab from '../../components/ConfigContabilidadTab';
import ComprobantesTab from '../../components/ComprobantesTab';
import EstadoRendimientoTab from '../../components/EstadoRendimientoTab';
import GastosPorElementosTab from '../../components/GastosPorElementosTab';
import BalanceComprobacionTab from '../../components/BalanceComprobacionTab';
import SubmayorTab from '../../components/SubmayorTab';

// ==================== TIPOS ====================
interface Asiento {
    id: string;
    fecha: string;
    numero: string;
    concepto: string;
    cuenta: string;
    debe: number;
    haber: number;
}

interface Mayor {
    cuenta: string;
    movimientos: { fecha: string; detalle: string; debe: number; haber: number; saldo: number }[];
}

// ==================== COMPONENTE ====================
export default function ContabilidadPage() {
    const [tab, setTab] = useState(0);
    const [searchAsiento, setSearchAsiento] = useState('');
    const [mensaje, setMensaje] = useState<string | null>(null);

    // ─── ESTADOS DE ASIENTOS ───
    const [asientos, setAsientos] = useState<Asiento[]>(() => {
        const saved = localStorage.getItem('conta_asientos');
        if (saved) return JSON.parse(saved);
        return [
            { id: '1', fecha: '2026-07-01', numero: 'A-001', concepto: 'Compra de mercancía', cuenta: '1.1.1 - Caja', debe: 0, haber: 5000 },
            { id: '2', fecha: '2026-07-01', numero: 'A-001', concepto: 'Compra de mercancía', cuenta: '1.1.3 - Inventario', debe: 5000, haber: 0 },
            { id: '3', fecha: '2026-07-05', numero: 'A-002', concepto: 'Venta al contado', cuenta: '1.1.1 - Caja', debe: 8000, haber: 0 },
            { id: '4', fecha: '2026-07-05', numero: 'A-002', concepto: 'Venta al contado', cuenta: '4.1 - Ventas', debe: 0, haber: 8000 },
            { id: '5', fecha: '2026-07-10', numero: 'A-003', concepto: 'Pago de nómina', cuenta: '5.1 - Gastos de Personal', debe: 3000, haber: 0 },
            { id: '6', fecha: '2026-07-10', numero: 'A-003', concepto: 'Pago de nómina', cuenta: '1.1.1 - Caja', debe: 0, haber: 3000 },
        ];
    });

    const [nuevoAsiento, setNuevoAsiento] = useState({
        fecha: new Date().toISOString().split('T')[0],
        numero: '',
        concepto: '',
        cuenta: '',
        debe: '',
        haber: '',
    });

    // ─── PERSISTENCIA ───
    React.useEffect(() => {
        localStorage.setItem('conta_asientos', JSON.stringify(asientos));
    }, [asientos]);

    const mostrarMensaje = (msg: string) => {
        setMensaje(msg);
        setTimeout(() => setMensaje(null), 3000);
    };

    const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const guardarAsiento = () => {
        if (!nuevoAsiento.fecha || !nuevoAsiento.numero || !nuevoAsiento.concepto || !nuevoAsiento.cuenta) {
            mostrarMensaje('Complete todos los campos obligatorios');
            return;
        }
        const asiento: Asiento = {
            id: Date.now().toString(),
            fecha: nuevoAsiento.fecha,
            numero: nuevoAsiento.numero,
            concepto: nuevoAsiento.concepto,
            cuenta: nuevoAsiento.cuenta,
            debe: Number(nuevoAsiento.debe) || 0,
            haber: Number(nuevoAsiento.haber) || 0,
        };
        setAsientos(prev => [...prev, asiento]);
        setNuevoAsiento({
            fecha: new Date().toISOString().split('T')[0],
            numero: '',
            concepto: '',
            cuenta: '',
            debe: '',
            haber: '',
        });
        mostrarMensaje('Asiento guardado correctamente');
    };

    const eliminarAsiento = (id: string) => {
        setAsientos(prev => prev.filter(a => a.id !== id));
    };

    const asientosFiltrados = asientos.filter(a =>
        a.concepto.toLowerCase().includes(searchAsiento.toLowerCase()) ||
        a.cuenta.toLowerCase().includes(searchAsiento.toLowerCase()) ||
        a.numero.toLowerCase().includes(searchAsiento.toLowerCase())
    );

    // ─── BALANCE GENERAL (calculado) ───
    const totalDebe = asientos.reduce((acc, a) => acc + a.debe, 0);
    const totalHaber = asientos.reduce((acc, a) => acc + a.haber, 0);

    // ─── TABS CONFIG ───
    const tabsConfig = [
        { icon: <SettingsIcon />, label: 'Configuración' },
        { icon: <ReceiptLongIcon />, label: 'Comprobantes' },
        { icon: <TrendingUpIcon />, label: 'Estado de Rendimiento' },
        { icon: <ReceiptIcon />, label: 'Gastos por Elementos' },
        { icon: <ScaleIcon />, label: 'Balance de Comprobación' },
        { icon: <MenuBookIcon />, label: 'Submayor' },
    ];

    return (
        <Box>
            {/* ═══════════════════════════════════════════════════════════
                HEADER (mismo estilo que Punto de Venta)
                ═══════════════════════════════════════════════════════════ */}
            <Box
                sx={{
                    width: '100%',
                    height: 70,
                    background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    alignContent: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                }}
            >
                <Box>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, letterSpacing: '-0.02em' }}>
                        Contabilidad
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                        Módulo de Gestión Contable y Financiera
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<PictureAsPdfIcon sx={{ fontSize: 'medium' }} />}
                        sx={{
                            background: 'linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))',
                            color: '#fff',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: 'none',
                            '&:hover': {
                                background: 'linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                            },
                        }}
                    >
                        Reporte PDF
                    </Button>
                </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: { xs: 'column', md: 'row' }, mt: 2 }}>
                <Box sx={{ width: '100%' }}>
                    {/* ═══════════════════════════════════════════════════════════
                        TABS (mismo estilo exacto que Punto de Venta)
                        ═══════════════════════════════════════════════════════════ */}
                    <Tabs
                        value={tab}
                        onChange={handleChangeTab}
                        slotProps={{ indicator: { sx: { display: 'none' } } }}
                        centered
                        sx={{
                            background: '#f4f6f8',
                            borderRadius: '10px',
                            p: 0.5,
                            ml: 1,
                            mr: 1,
                            minHeight: 'auto',
                            '& .MuiTabs-flexContainer': {
                                gap: 1,
                                flexWrap: { xs: 'wrap', md: 'nowrap' },
                            },
                        }}
                    >
                        {tabsConfig.map((t, idx) => (
                            <Tab
                                key={idx}
                                icon={t.icon}
                                iconPosition="start"
                                label={t.label}
                                sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: '10px',
                                    minHeight: 45,
                                    width: 'auto',
                                    transition: 'all 0.3s ease',
                                    color: tab === idx ? '#fff' : '#555',
                                    background:
                                        tab === idx
                                            ? 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))'
                                            : 'transparent',
                                    '&:hover': {
                                        background:
                                            tab === idx
                                                ? 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))'
                                                : '#e0e0e0',
                                    },
                                    '&.Mui-selected': {
                                        color: '#ffffff',
                                        background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                    },
                                }}
                            />
                        ))}
                    </Tabs>

                    {mensaje && (
                        <Alert severity="success" sx={{ m: 1, borderRadius: 2 }}>
                            {mensaje}
                        </Alert>
                    )}

                    {/* ================= TAB DE CONTABILIDAD ================= */}
                    {tab === 0 && (
                        <Box sx={{ m: 1 }}>
                            <ConfigContabilidadTab />
                        </Box>
                    )}

                    {/* ================= TAB DE COMPROBANTES ================= */}
                    {tab === 1 && (
                        <Box sx={{ m: 1 }}>
                            <ComprobantesTab />
                        </Box>
                    )}

                    {/* ================= TAB ESTADO DE RENDIMIENTO ================= */}
                    {tab === 2 && (
                        <Box sx={{ m: 1 }}>
                            <EstadoRendimientoTab />
                        </Box>
                    )}

                    {/* ================= TAB GASTOS POR ELEMENTOS ================= */}
                    {tab === 3 && (
                        <Box sx={{ m: 1 }}>
                            <GastosPorElementosTab />
                        </Box>
                    )}

                    {/* ================= TAB BALANCE DE COMPROBACIÓN ================= */}
                    {tab === 4 && (
                        <Box sx={{ m: 1 }}>
                            <BalanceComprobacionTab />
                        </Box>
                    )}

                    {/* ================= TAB SUBMAYOR ================= */}
                    {tab === 5 && (
                        <Box sx={{ m: 1 }}>
                            <SubmayorTab />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
// src/pages/Reportes/Reportes.tsx
import React, { useState } from 'react';
import {
    Typography,
    Box,
    Card,
    CardContent,
    Button,
    TextField,
    MenuItem,
    IconButton,
    Snackbar,
    Alert,
    CircularProgress,
    Grid,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BarChartIcon from '@mui/icons-material/BarChart';
import SummarizeIcon from '@mui/icons-material/Summarize';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const GRADIENT_HEADER = "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')";
const GRADIENT_CARD_HEADER = "linear-gradient(135deg, rgba(0,89,255,0.9), rgba(142,45,226,0.9))";

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════

const CARD_STYLE = {
    borderRadius: '16px',
    background: '#ffffff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
    border: '1px solid rgba(226, 232, 240, 0.6)',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    '&:hover': {
        boxShadow: '0 12px 40px rgba(0, 89, 255, 0.12)',
        transform: 'translateY(-3px)',
    },
};

const CARD_HEADER_BOX = {
    width: '100%',
    height: 52,
    background: GRADIENT_CARD_HEADER,
    display: 'flex',
    alignItems: 'center',
    px: 2.5,
    gap: 1.5,
    boxShadow: '0 2px 8px rgba(0,89,255,0.2)',
};

const INPUT_STYLE = {
    '& .MuiOutlinedInput-root': {
        borderRadius: '10px',
        backgroundColor: '#f8fafc',
        height: 40,
        fontSize: '0.85rem',
        border: '1px solid #e2e8f0',
        transition: 'all 0.2s ease',
        '& fieldset': { borderColor: 'transparent' },
        '&:hover': {
            backgroundColor: '#f1f5f9',
            borderColor: '#cbd5e1',
        },
        '&.Mui-focused': {
            backgroundColor: '#ffffff',
            borderColor: '#3b82f6',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
            '& fieldset': { borderColor: 'transparent' },
        },
    },
    '& .MuiInputLabel-root': {
        fontSize: '0.8rem',
        color: '#64748b',
    },
};

const BTN_PRIMARY = {
    background: "linear-gradient(135deg, #1e293b, #334155)",
    color: '#fff',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    borderRadius: '10px',
    px: 2.5,
    py: 0.8,
    height: 38,
    boxShadow: '0 4px 12px rgba(30, 41, 59, 0.2)',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: "linear-gradient(135deg, #334155, #475569)",
        boxShadow: '0 6px 16px rgba(30, 41, 59, 0.3)',
        transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
};

const BTN_CALC = {
    background: "linear-gradient(135deg, #7c3aed, #8b5cf6)",
    color: '#fff',
    textTransform: 'none',
    fontWeight: 600,
    fontSize: '0.85rem',
    borderRadius: '10px',
    px: 2.5,
    py: 0.8,
    height: 38,
    boxShadow: '0 4px 12px rgba(124, 58, 237, 0.25)',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: "linear-gradient(135deg, #6d28d9, #7c3aed)",
        boxShadow: '0 6px 16px rgba(124, 58, 237, 0.35)',
        transform: 'translateY(-1px)',
    },
    '&:active': { transform: 'translateY(0)' },
};

const BTN_EXCEL = {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "#fff",
    minWidth: 36,
    width: 36,
    height: 36,
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: "linear-gradient(135deg, #047857, #059669)",
        boxShadow: '0 6px 14px rgba(16, 185, 129, 0.35)',
        transform: 'translateY(-2px)',
    },
};

const BTN_PDF = {
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    color: "#fff",
    minWidth: 36,
    width: 36,
    height: 36,
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(239, 68, 68, 0.25)',
    transition: 'all 0.2s ease',
    '&:hover': {
        background: "linear-gradient(135deg, #b91c1c, #dc2626)",
        boxShadow: '0 6px 14px rgba(239, 68, 68, 0.35)',
        transform: 'translateY(-2px)',
    },
};

const RESULT_BOX = {
    mt: 'auto',
    p: 2.5,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    border: '2px dashed #e2e8f0',
    minHeight: 70,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
};

// ─── Componentes reutilizables ───
const ExportButtons = ({ onExcel, onPDF }: { onExcel?: () => void; onPDF?: () => void }) => (
    <Box sx={{ display: 'flex', gap: 1 }}>
        <IconButton sx={BTN_EXCEL} onClick={onExcel} size="small">
            <TableChartIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton sx={BTN_PDF} onClick={onPDF} size="small">
            <PictureAsPdfIcon sx={{ fontSize: 18 }} />
        </IconButton>
    </Box>
);

const ResultArea = ({ text = "Seleccione los parámetros" }: { text?: string }) => (
    <Box sx={RESULT_BOX}>
        <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center', fontWeight: 500 }}>
            {text}
        </Typography>
    </Box>
);

export default function Reportes() {
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const [ipvDia, setIpvDia] = useState<dayjs.Dayjs | null>(null);
    const [ipvCi, setIpvCi] = useState('');
    const [utilProductoDesde, setUtilProductoDesde] = useState<dayjs.Dayjs | null>(null);
    const [utilProductoHasta, setUtilProductoHasta] = useState<dayjs.Dayjs | null>(null);
    const [utilContDesde, setUtilContDesde] = useState<dayjs.Dayjs | null>(null);
    const [utilContHasta, setUtilContHasta] = useState<dayjs.Dayjs | null>(null);
    const [contenedor, setContenedor] = useState('');
    const [utilAlmDesde, setUtilAlmDesde] = useState<dayjs.Dayjs | null>(null);
    const [utilAlmHasta, setUtilAlmHasta] = useState<dayjs.Dayjs | null>(null);
    const [almacen, setAlmacen] = useState('');
    const [resumenDesde, setResumenDesde] = useState<dayjs.Dayjs | null>(null);
    const [resumenHasta, setResumenHasta] = useState<dayjs.Dayjs | null>(null);
    const [resumenTipo, setResumenTipo] = useState('todos');
    const [ventasDesde, setVentasDesde] = useState<dayjs.Dayjs | null>(null);
    const [ventasHasta, setVentasHasta] = useState<dayjs.Dayjs | null>(null);

    const handleAction = async (actionName: string, action: () => Promise<void>) => {
        setLoading(prev => ({ ...prev, [actionName]: true }));
        try {
            await action();
            setSnackbar({ open: true, message: `${actionName} completado`, severity: 'success' });
        } catch (err: any) {
            setSnackbar({ open: true, message: `Error: ${err.message}`, severity: 'error' });
        } finally {
            setLoading(prev => ({ ...prev, [actionName]: false }));
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
                {/* Header Principal */}
                <Box
                    sx={{
                        width: '100%',
                        height: 60,
                        background: GRADIENT_HEADER,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: 'flex',
                        alignItems: 'center',
                        px: 3,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                        Gestión de Reportes
                    </Typography>
                </Box>

                {/* Grid de 3 columnas - todos mismos tamaños */}
                <Box sx={{ px: 3, pb: 4 }}>
                    <Grid container spacing={3} alignItems="stretch">

                        {/* 1. IPV */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={CARD_STYLE}>
                                <Box sx={CARD_HEADER_BOX}>
                                    <AssessmentIcon sx={{ color: 'white', fontSize: 22 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                        IPV
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField select fullWidth size="small" label="Día" sx={INPUT_STYLE}
                                                InputLabelProps={{ shrink: true }}>
                                                <MenuItem value=""><em>Sin día</em></MenuItem>
                                                {['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'].map(d => (
                                                    <MenuItem key={d} value={d}>{d}</MenuItem>
                                                ))}
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField select fullWidth size="small" label="CI" value={ipvCi}
                                                onChange={e => setIpvCi(e.target.value)} sx={INPUT_STYLE}
                                                InputLabelProps={{ shrink: true }}>
                                                <MenuItem value=""><em>CI</em></MenuItem>
                                                <MenuItem value="CI1">CI 1</MenuItem>
                                                <MenuItem value="CI2">CI 2</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                <Button variant="contained" size="small" sx={BTN_PRIMARY}
                                                    disabled={loading['IPV']}
                                                    startIcon={loading['IPV'] ? <CircularProgress size={14} color="inherit" /> : null}
                                                    onClick={() => handleAction('IPV', async () => await new Promise(r => setTimeout(r, 500)))}>
                                                    Generar
                                                </Button>
                                                <ExportButtons />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <ResultArea text="Seleccione un día" />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 2. Inventario Existente */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={CARD_STYLE}>
                                <Box sx={CARD_HEADER_BOX}>
                                    <InventoryIcon sx={{ color: 'white', fontSize: 22 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                        Inventario Existente
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2 }}>
                                        <Button variant="contained" size="small" sx={BTN_PRIMARY}
                                            disabled={loading['Inventario']}
                                            startIcon={loading['Inventario'] ? <CircularProgress size={14} color="inherit" /> : null}
                                            onClick={() => handleAction('Inventario', async () => await new Promise(r => setTimeout(r, 500)))}>
                                            Generar
                                        </Button>
                                        <ExportButtons />
                                    </Box>
                                    <ResultArea text='Presione "Generar"' />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 3. Utilidad Producto */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={CARD_STYLE}>
                                <Box sx={CARD_HEADER_BOX}>
                                    <TrendingUpIcon sx={{ color: 'white', fontSize: 22 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                        Utilidad Producto
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={utilProductoDesde} onChange={setUtilProductoDesde}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Desde", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={utilProductoHasta} onChange={setUtilProductoHasta}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Hasta", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                <Button variant="contained" size="small" sx={BTN_CALC}
                                                    disabled={loading['UtilidadProducto']}
                                                    startIcon={loading['UtilidadProducto'] ? <CircularProgress size={14} color="inherit" /> : <CalculateIcon sx={{ fontSize: 18 }} />}
                                                    onClick={() => handleAction('UtilidadProducto', async () => await new Promise(r => setTimeout(r, 500)))}>
                                                    Calcular
                                                </Button>
                                                <ExportButtons />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <ResultArea text="Seleccione rango" />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 4. Utilidad por Contenedor */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={CARD_STYLE}>
                                <Box sx={CARD_HEADER_BOX}>
                                    <BarChartIcon sx={{ color: 'white', fontSize: 22 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                        Utilidad por Contenedor
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={utilContDesde} onChange={setUtilContDesde}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Desde", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={utilContHasta} onChange={setUtilContHasta}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Hasta", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField select fullWidth size="small" label="Contenedor" value={contenedor}
                                                onChange={e => setContenedor(e.target.value)} sx={INPUT_STYLE}
                                                InputLabelProps={{ shrink: true }}>
                                                <MenuItem value=""><em>Contenedor</em></MenuItem>
                                                <MenuItem value="C1">Contenedor 1</MenuItem>
                                                <MenuItem value="C2">Contenedor 2</MenuItem>
                                                <MenuItem value="C3">Contenedor 3</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', height: '100%' }}>
                                                <Button variant="contained" size="small" sx={BTN_CALC}
                                                    disabled={loading['UtilidadContenedor']}
                                                    startIcon={loading['UtilidadContenedor'] ? <CircularProgress size={14} color="inherit" /> : <CalculateIcon sx={{ fontSize: 18 }} />}
                                                    onClick={() => handleAction('UtilidadContenedor', async () => await new Promise(r => setTimeout(r, 500)))}>
                                                    Calcular
                                                </Button>
                                                <ExportButtons />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <ResultArea text="Seleccione rango y contenedor" />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 5. Utilidad por Almacén */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={CARD_STYLE}>
                                <Box sx={CARD_HEADER_BOX}>
                                    <BarChartIcon sx={{ color: 'white', fontSize: 22 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                        Utilidad por Almacén
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={utilAlmDesde} onChange={setUtilAlmDesde}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Desde", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={utilAlmHasta} onChange={setUtilAlmHasta}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Hasta", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField select fullWidth size="small" label="Almacén" value={almacen}
                                                onChange={e => setAlmacen(e.target.value)} sx={INPUT_STYLE}
                                                InputLabelProps={{ shrink: true }}>
                                                <MenuItem value=""><em>Almacén</em></MenuItem>
                                                <MenuItem value="A1">Almacén Central</MenuItem>
                                                <MenuItem value="A2">Almacén Norte</MenuItem>
                                                <MenuItem value="A3">Almacén Sur</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', height: '100%' }}>
                                                <Button variant="contained" size="small" sx={BTN_CALC}
                                                    disabled={loading['UtilidadAlmacen']}
                                                    startIcon={loading['UtilidadAlmacen'] ? <CircularProgress size={14} color="inherit" /> : <CalculateIcon sx={{ fontSize: 18 }} />}
                                                    onClick={() => handleAction('UtilidadAlmacen', async () => await new Promise(r => setTimeout(r, 500)))}>
                                                    Calcular
                                                </Button>
                                                <ExportButtons />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <ResultArea text="Seleccione rango y almacén" />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 6. Resumen Período */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={CARD_STYLE}>
                                <Box sx={CARD_HEADER_BOX}>
                                    <SummarizeIcon sx={{ color: 'white', fontSize: 22 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                        Resumen Período
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={resumenDesde} onChange={setResumenDesde}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Desde", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={resumenHasta} onChange={setResumenHasta}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Hasta", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <TextField select fullWidth size="small" label="Tipo" value={resumenTipo}
                                                onChange={e => setResumenTipo(e.target.value)} sx={INPUT_STYLE}
                                                InputLabelProps={{ shrink: true }}>
                                                <MenuItem value="todos">Todos</MenuItem>
                                                <MenuItem value="ventas">Ventas</MenuItem>
                                                <MenuItem value="compras">Compras</MenuItem>
                                                <MenuItem value="gastos">Gastos</MenuItem>
                                            </TextField>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', height: '100%' }}>
                                                <Button variant="contained" size="small" sx={BTN_PRIMARY}
                                                    disabled={loading['ResumenPeriodo']}
                                                    startIcon={loading['ResumenPeriodo'] ? <CircularProgress size={14} color="inherit" /> : null}
                                                    onClick={() => handleAction('ResumenPeriodo', async () => await new Promise(r => setTimeout(r, 500)))}>
                                                    Generar
                                                </Button>
                                                <ExportButtons />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <ResultArea text="Seleccione fechas" />
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* 7. Reporte Ventas */}
                        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                            <Card sx={CARD_STYLE}>
                                <Box sx={CARD_HEADER_BOX}>
                                    <PointOfSaleIcon sx={{ color: 'white', fontSize: 22 }} />
                                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>
                                        Reporte Ventas
                                    </Typography>
                                </Box>
                                <CardContent sx={{ p: 3, pt: 2.5, display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={ventasDesde} onChange={setVentasDesde}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Desde", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MobileDatePicker value={ventasHasta} onChange={setVentasHasta}
                                                format="DD/MM/YYYY" slotProps={{ textField: { fullWidth: true, size: "small", placeholder: "Hasta", sx: INPUT_STYLE } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                                                <Button variant="contained" size="small" sx={BTN_PRIMARY}
                                                    disabled={loading['ReporteVentas']}
                                                    startIcon={loading['ReporteVentas'] ? <CircularProgress size={14} color="inherit" /> : null}
                                                    onClick={() => handleAction('ReporteVentas', async () => await new Promise(r => setTimeout(r, 500)))}>
                                                    Generar
                                                </Button>
                                                <ExportButtons />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                    <ResultArea text="Seleccione período" />
                                </CardContent>
                            </Card>
                        </Grid>

                    </Grid>
                </Box>

                <Snackbar open={snackbar.open} autoHideDuration={3000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    <Alert severity={snackbar.severity} variant="filled"
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                        sx={{ borderRadius: 3, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </LocalizationProvider>
    );
}
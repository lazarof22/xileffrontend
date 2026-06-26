// src/pages/Activos/Activos.tsx
import React, { useState, useEffect } from 'react'
import {
    Typography,
    Box,
    Button,
    Snackbar,
    Alert,
    Card,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Divider,
    Autocomplete,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CustomDataGridR from "../../components/CustomDataGridR";
import AddActivoDialog from '../../components/AddActivoDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ==================== INTERFACES ====================
interface ActivoBackend {
    _id: string;
    codigoActivo: string;
    descripcionActivo: string;
    marca?: string;
    modelo?: string;
    numeroSerie?: string;
    proveedor?: { _id: string; nombre: string };
    area?: { _id: string; nombre: string };
    grupoActivo?: { _id: string; nombre: string };
    fechaCompra: string;
    fechaPuestaMarcha?: string;
    valorAdquisicion: number;
    valorResidual: number;
    vidaUtil: number;
    tasaDepreciacion?: { _id: string; tasa_depreciacion: number };
    metodoDepreciacion: string;
    depreciacionAnual: number;
    depreciacionMensual: number;
    depreciacionAcumulada: number;
    valorEnLibros: number;
    moneda?: { _id: string; nombre: string };
    estadoActivo?: { _id: string; nombre: string };
    activo: boolean;
    cantidad: number;
    createdAt: string;
    updatedAt: string;
}

interface RowData {
    id: string;
    codigo: string;
    descripcion: string;
    area: string;
    fechaCompra: string;
    estado: string;
    valorAdquisicion: string;
    valorEnLibros: string;
    depreciacionAcumulada: string;
    _original: ActivoBackend;
}

// ==================== HELPERS ====================
const formatDate = (isoDate: string | undefined): string => {
    if (!isoDate) return '-';
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return isoDate;
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatCurrency = (value: number | undefined, moneda?: string): string => {
    if (value === undefined || value === null) return '-';
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: moneda || 'CUP',
        minimumFractionDigits: 2
    }).format(value);
};

const GRADIENT_HEADER = "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')";
const GRADIENT_NEW = "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))";
const GRADIENT_BAJA = "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))";
const GRADIENT_SAVE = "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))";
const GRADIENT_CANCEL = "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))";

// ==================== COMPONENTE ====================
export default function Activos() {
    const [rows, setRows] = useState<RowData[]>([]);
    const [activosRaw, setActivosRaw] = useState<ActivoBackend[]>([]);
    const [loading, setLoading] = useState(false);

    const [openCreateActivo, setOpenCreateActivo] = useState(false);

    // Snackbar
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    // Modal de Baja
    const [openBajaDialog, setOpenBajaDialog] = useState(false);
    const [activoParaBaja, setActivoParaBaja] = useState<ActivoBackend | null>(null);
    const [bajaForm, setBajaForm] = useState({
        fechaBaja: '',
        motivoBaja: '',
        tipoBaja: 'venta',
        valorBaja: 0,
        documentoBaja: ''
    });
    const [bajaLoading, setBajaLoading] = useState(false);
    const [bajaErrors, setBajaErrors] = useState<Record<string, string>>({});

    // Tipos de baja disponibles según backend
    const tiposBaja = [
        { value: 'venta', label: 'Venta' },
        { value: 'donacion', label: 'Donación' },
        { value: 'perdida', label: 'Pérdida' },
        { value: 'robo', label: 'Robo' },
        { value: 'obsolescencia', label: 'Obsolescencia' },
        { value: 'destruccion', label: 'Destrucción' },
    ];

    const fetchActivos = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/activofijo`);
            if (!response.ok) throw new Error('Error al cargar activos');
            const result = await response.json();

            const data: ActivoBackend[] = Array.isArray(result) ? result : result.data || [];
            setActivosRaw(data);

            const mappedData: RowData[] = data.map((p) => ({
                id: p._id,
                codigo: p.codigoActivo || '-',
                descripcion: p.descripcionActivo || '-',
                area: p.area?.nombre || 'Sin área',
                fechaCompra: formatDate(p.fechaCompra),
                estado: p.estadoActivo?.nombre || 'Sin estado',
                valorAdquisicion: formatCurrency(p.valorAdquisicion, p.moneda?.nombre),
                valorEnLibros: formatCurrency(p.valorEnLibros, p.moneda?.nombre),
                depreciacionAcumulada: formatCurrency(p.depreciacionAcumulada, p.moneda?.nombre),
                _original: p
            }));

            setRows(mappedData);
        } catch (err: any) {
            setSnackbarMessage('Error al cargar los activos: ' + err.message);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivos();
    }, []);

    // ==================== BAJA ====================
    const handleOpenBaja = () => {
        if (activosRaw.length === 0) {
            setSnackbarMessage('No hay activos para dar de baja');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        setBajaForm({
            fechaBaja: new Date().toISOString().split('T')[0],
            motivoBaja: '',
            tipoBaja: 'venta',
            valorBaja: 0,
            documentoBaja: ''
        });
        setActivoParaBaja(null);
        setBajaErrors({});
        setOpenBajaDialog(true);
    };

    const handleSelectActivoBaja = (_: any, value: ActivoBackend | null) => {
        setActivoParaBaja(value);
        if (value) {
            setBajaForm(prev => ({
                ...prev,
                valorBaja: value.valorEnLibros || 0
            }));
        }
        if (bajaErrors.activo) {
            setBajaErrors(prev => {
                const { activo, ...rest } = prev;
                return rest;
            });
        }
    };

    const validateBajaForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!activoParaBaja) errors.activo = 'Debe seleccionar un activo';
        if (!bajaForm.fechaBaja) errors.fechaBaja = 'La fecha de baja es obligatoria';
        if (!bajaForm.motivoBaja.trim()) errors.motivoBaja = 'El motivo es obligatorio';
        if (!bajaForm.tipoBaja) errors.tipoBaja = 'El tipo de baja es obligatorio';
        if (bajaForm.valorBaja < 0) errors.valorBaja = 'El valor no puede ser negativo';
        if (!bajaForm.documentoBaja.trim()) errors.documentoBaja = 'El documento es obligatorio';
        setBajaErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleConfirmBaja = async () => {
        if (!validateBajaForm() || !activoParaBaja) return;

        setBajaLoading(true);
        try {
            const response = await fetch(`${API_URL}/activofijo/${activoParaBaja._id}/baja`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bajaForm)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Error al dar de baja');
            }

            setSnackbarMessage(`Activo ${activoParaBaja.codigoActivo} dado de baja exitosamente`);
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            setOpenBajaDialog(false);
            setActivoParaBaja(null);
            fetchActivos();
        } catch (err: any) {
            setBajaErrors({ general: err.message || 'Error al dar de baja' });
        } finally {
            setBajaLoading(false);
        }
    };

    const handleCloseBaja = () => {
        setOpenBajaDialog(false);
        setActivoParaBaja(null);
        setBajaErrors({});
    };

    return (
        <div>
            {/* ═══════════════════════════════════════════════════════════════
                HEADER
                ═══════════════════════════════════════════════════════════════ */}
            <Box
                sx={{
                    width: '100%',
                    height: 60,
                    background: GRADIENT_HEADER,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    alignContent: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                    borderRadius: 0
                }}>
                <Typography variant="h5" sx={{ ml: 2, color: 'white' }}>
                    Gestión de Activos Fijos
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            ml: 1,
                            background: GRADIENT_NEW,
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                        onClick={() => setOpenCreateActivo(true)}
                    >
                        Nuevo Activo
                    </Button>
                </Box>
            </Box>

            {/* ═══════════════════════════════════════════════════════════════
                DIALOGO CREAR ACTIVO
                ═══════════════════════════════════════════════════════════════ */}
            <AddActivoDialog
                open={openCreateActivo}
                onClose={() => setOpenCreateActivo(false)}
                onActivoCreado={() => {
                    setSnackbarMessage('Activo creado exitosamente');
                    setSnackbarSeverity('success');
                    setOpenSnackbar(true);
                    setOpenCreateActivo(false);
                    fetchActivos();
                }}
            />

            {/* ═══════════════════════════════════════════════════════════════
                TABLA DE ACTIVOS
                ═══════════════════════════════════════════════════════════════ */}
            <Card sx={{ width: '100%', p: 2 }}>
                <CustomDataGridR
                    title="Activos"
                    rows={rows}
                    loading={loading}
                    getRowId={(row) => row.id}
                    columns={[
                        { field: "codigo", headerName: "Código" },
                        { field: "descripcion", headerName: "Descripción" },
                        { field: "area", headerName: "Área" },
                        { field: "fechaCompra", headerName: "Fecha compra" },
                        { field: "estado", headerName: "Estado", isStatusColumn: true },
                        { field: "valorAdquisicion", headerName: "Valor Adquisición", numeric: true },
                        { field: "valorEnLibros", headerName: "Valor en Libros", numeric: true },
                        { field: "depreciacionAcumulada", headerName: "Dep. Acumulada", numeric: true },
                    ]}
                    deleteConfig={{
                        baseUrl: `${API_URL}/activofijo`,
                        getId: (row) => row.id,
                        onSuccess: () => {
                            setSnackbarMessage('Activo eliminado exitosamente');
                            setSnackbarSeverity('success');
                            setOpenSnackbar(true);
                            fetchActivos();
                        },
                        onError: (error) => {
                            setSnackbarMessage('Error al eliminar: ' + error.message);
                            setSnackbarSeverity('error');
                            setOpenSnackbar(true);
                        }
                    }}
                />
            </Card>

            {/* ═══════════════════════════════════════════════════════════════
                BOTÓN DAR DE BAJA
                ═══════════════════════════════════════════════════════════════ */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, px: 2 }}>
                <Button
                    variant="contained"
                    startIcon={<TrendingDownIcon />}
                    onClick={handleOpenBaja}
                    sx={{
                        background: GRADIENT_BAJA,
                        color: "#fff",
                        textTransform: "none",
                        fontWeight: 600,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        "&:hover": {
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(226, 45, 187, 0.9))",
                            boxShadow: "0 4px 12px rgba(158, 6, 6, 0.62)"
                        }
                    }}
                >
                    Dar de Baja
                </Button>
            </Box>

            {/* ═══════════════════════════════════════════════════════════════
                DIALOGO DE BAJA CON SELECTOR DE ACTIVO
                ═══════════════════════════════════════════════════════════════ */}
            <Dialog
                open={openBajaDialog}
                onClose={handleCloseBaja}
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
                            background: GRADIENT_BAJA,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                        <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                            <TrendingDownIcon sx={{ fill: 'url(#bajaIconGradient)', width: 24, height: 24 }} />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="bajaIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgb(255, 0, 0)" />
                                        <stop offset="100%" stopColor="rgb(196, 45, 226)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                        Dar de Baja
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 1 }}>
                    {/* ═══════════════════════════════════════════════════════
                        SELECTOR DE ACTIVO (Autocomplete)
                        ═══════════════════════════════════════════════════════ */}
                    <Box sx={{ mb: 2 }}>
                        <Autocomplete
                            options={activosRaw.filter(a => a.activo)}
                            getOptionLabel={(option) => `${option.codigoActivo} - ${option.descripcionActivo}`}
                            value={activoParaBaja}
                            onChange={handleSelectActivoBaja}
                            loading={loading}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Seleccionar Activo *"
                                    size="small"
                                    error={!!bajaErrors.activo}
                                    helperText={bajaErrors.activo}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <React.Fragment>
                                                {loading ? <CircularProgress color="inherit" size={16} /> : null}
                                                {params.InputProps.endAdornment}
                                            </React.Fragment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {option.codigoActivo}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#888' }}>
                                            {option.descripcionActivo} · {option.area?.nombre || 'Sin área'} · {formatCurrency(option.valorEnLibros, option.moneda?.nombre)}
                                        </Typography>
                                    </Box>
                                </li>
                            )}
                            noOptionsText="No hay activos vigentes"
                            loadingText="Cargando..."
                        />
                    </Box>

                    {/* Info del activo seleccionado */}
                    {activoParaBaja && (
                        <Box sx={{
                            mb: 2,
                            p: 2,
                            background: "linear-gradient(135deg, rgba(0,114,255,0.05), rgba(142,45,226,0.05))",
                            borderRadius: 2,
                            border: '1px solid rgba(0,114,255,0.1)'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    <strong>Descripción:</strong> {activoParaBaja.descripcionActivo}
                                </Typography>
                                <Chip
                                    label={activoParaBaja.estadoActivo?.nombre || 'Sin estado'}
                                    size="small"
                                    sx={{
                                        backgroundColor: 'rgba(10, 218, 20, 0.12)',
                                        color: 'rgb(10, 218, 20)',
                                        fontWeight: 600,
                                        fontSize: '0.7rem'
                                    }}
                                />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    <strong>Valor en Libros:</strong>{' '}
                                    <span style={{ color: 'rgb(10, 83, 218)', fontWeight: 600 }}>
                                        {formatCurrency(activoParaBaja.valorEnLibros, activoParaBaja.moneda?.nombre)}
                                    </span>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666' }}>
                                    <strong>Dep. Acumulada:</strong>{' '}
                                    {formatCurrency(activoParaBaja.depreciacionAcumulada, activoParaBaja.moneda?.nombre)}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    {/* Fecha de Baja */}
                    <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Fecha de Baja *"
                        value={bajaForm.fechaBaja}
                        onChange={(e) => setBajaForm(prev => ({ ...prev, fechaBaja: e.target.value }))}
                        error={!!bajaErrors.fechaBaja}
                        helperText={bajaErrors.fechaBaja}
                        sx={{ mb: 2 }}
                        InputLabelProps={{ shrink: true }}
                    />

                    {/* Tipo de Baja */}
                    <TextField
                        select
                        fullWidth
                        size="small"
                        label="Tipo de Baja *"
                        value={bajaForm.tipoBaja}
                        onChange={(e) => setBajaForm(prev => ({ ...prev, tipoBaja: e.target.value }))}
                        error={!!bajaErrors.tipoBaja}
                        helperText={bajaErrors.tipoBaja}
                        sx={{ mb: 2 }}
                    >
                        {tiposBaja.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                                {t.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* Motivo */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Motivo de Baja *"
                        multiline
                        rows={2}
                        value={bajaForm.motivoBaja}
                        onChange={(e) => setBajaForm(prev => ({ ...prev, motivoBaja: e.target.value }))}
                        error={!!bajaErrors.motivoBaja}
                        helperText={bajaErrors.motivoBaja}
                        sx={{ mb: 2 }}
                    />

                    {/* Valor de Baja */}
                    <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Valor de Baja *"
                        value={bajaForm.valorBaja}
                        onChange={(e) => setBajaForm(prev => ({ ...prev, valorBaja: Number(e.target.value) }))}
                        error={!!bajaErrors.valorBaja}
                        helperText={bajaErrors.valorBaja || 'Valor en libros del activo al momento de la baja'}
                        sx={{ mb: 2 }}
                    />

                    {/* Documento de Baja */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Documento de Baja *"
                        value={bajaForm.documentoBaja}
                        onChange={(e) => setBajaForm(prev => ({ ...prev, documentoBaja: e.target.value }))}
                        error={!!bajaErrors.documentoBaja}
                        helperText={bajaErrors.documentoBaja}
                    />

                    {/* Error general */}
                    {bajaErrors.general && (
                        <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                            {bajaErrors.general}
                        </Typography>
                    )}
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
                        onClick={handleCloseBaja}
                        disabled={bajaLoading}
                        fullWidth
                        startIcon={<CancelIcon />}
                        sx={{
                            flex: 1,
                            background: GRADIENT_CANCEL,
                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                            color: "white",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
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
                        onClick={handleConfirmBaja}
                        disabled={bajaLoading || !activoParaBaja}
                        fullWidth
                        startIcon={bajaLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
                        sx={{
                            flex: 1,
                            background: GRADIENT_SAVE,
                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            "&:hover": {
                                background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                boxShadow: "0 4px 12px rgba(13, 248, 5, 0.93)"
                            }
                        }}
                    >
                        {bajaLoading ? 'Procesando...' : 'Confirmar Baja'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ═══════════════════════════════════════════════════════════════
                SNACKBAR
                ═══════════════════════════════════════════════════════════════ */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert
                    severity={snackbarSeverity}
                    variant="filled"
                    onClose={() => setOpenSnackbar(false)}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </div>
    )
}
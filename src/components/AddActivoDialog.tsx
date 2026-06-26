// src/components/AddActivoDialog.tsx
import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Typography,
    CircularProgress,
    Box,
    Divider,
    FormControlLabel,
    Switch
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ==================== INTERFACES ====================
export interface ActivoFormData {
    codigoActivo: string;
    descripcionActivo: string;
    marca: string;
    modelo: string;
    numeroSerie: string;
    proveedor: string;
    area: string;
    grupoActivo: string;
    fechaCompra: string;
    fechaPuestaMarcha: string;
    valorAdquisicion: number;
    valorResidual: number;
    vidaUtil: number;
    tasaDepreciacion: string;
    metodoDepreciacion: string;
    moneda: string;
    concepto: string;
    estadoActivo: string;
    numeroFactura: string;
    ordenCompra: string;
    observaciones: string;
    ajusteValor: number;
    cantidad: number;
    activo: boolean;
}

export interface NomencladorItem {
    _id: string;
    nombre: string;
}

export interface TasaDepreciacionItem {
    _id: string;
    tasa_depreciacion: number;
    descripcion: string;
}

export interface GrupoActivoItem {
    _id: string;
    codigo: string;
    nombre: string;
    vidaUtilMinima: number;
    vidaUtilMaxima: number;
}

export interface AddActivoDialogProps {
    open: boolean;
    onClose: () => void;
    onActivoCreado?: () => void;
}

// Estilo base para cada CELDA del grid
const CELL_STYLE = {
    flex: '1 1 45%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'flex-end',
    minHeight: 80,
};

// Estilo para el label de los DatePickers
const LABEL_STYLE = {
    fontSize: '0.75rem',
    color: 'rgba(0, 0, 0, 0.6)',
    mb: 0.5,
    ml: 0.3,
};

const GRADIENT_TITLE = "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))";
const GRADIENT_SAVE = "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))";
const GRADIENT_CANCEL = "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))";

// ==================== COMPONENTE ====================
export default function AddActivoDialog({
    open,
    onClose,
    onActivoCreado,
}: AddActivoDialogProps): React.JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [fechaCompra, setFechaCompra] = useState<dayjs.Dayjs | null>(null);
    const [fechaPuestaMarcha, setFechaPuestaMarcha] = useState<dayjs.Dayjs | null>(null);

    const [newActivo, setNewActivo] = useState<ActivoFormData>({
        codigoActivo: "",
        descripcionActivo: "",
        marca: "",
        modelo: "",
        numeroSerie: "",
        proveedor: "",
        area: "",
        grupoActivo: "",
        fechaCompra: "",
        fechaPuestaMarcha: "",
        valorAdquisicion: 0,
        valorResidual: 0,
        vidaUtil: 0,
        tasaDepreciacion: "",
        metodoDepreciacion: "linea_recta",
        moneda: "",
        concepto: "",
        estadoActivo: "",
        numeroFactura: "",
        ordenCompra: "",
        observaciones: "",
        ajusteValor: 0,
        cantidad: 1,
        activo: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Nomencladores
    const [areas, setAreas] = useState<NomencladorItem[]>([]);
    const [monedas, setMonedas] = useState<NomencladorItem[]>([]);
    const [conceptos, setConceptos] = useState<NomencladorItem[]>([]);
    const [estados, setEstados] = useState<NomencladorItem[]>([]);
    const [tasasDepreciacion, setTasasDepreciacion] = useState<TasaDepreciacionItem[]>([]);
    const [gruposActivo, setGruposActivo] = useState<GrupoActivoItem[]>([]);
    const [loadingNomencladores, setLoadingNomencladores] = useState(false);

    // Cargar nomencladores al abrir el diálogo
    useEffect(() => {
        if (!open) return;

        const fetchNomencladores = async () => {
            setLoadingNomencladores(true);
            try {
                const [
                    resArea,
                    resMon,
                    resConc,
                    resEst,
                    resTasa,
                    resGrupo
                ] = await Promise.all([
                    fetch(`${API_URL}/area`),
                    fetch(`${API_URL}/moneda`),
                    fetch(`${API_URL}/concepto`),
                    fetch(`${API_URL}/estado`),
                    fetch(`${API_URL}/tasa-depreciacion`),
                    fetch(`${API_URL}/grupo-activo/activos`),
                ]);

                const dataArea = resArea.ok ? await resArea.json() : [];
                const dataMon = resMon.ok ? await resMon.json() : [];
                const dataConc = resConc.ok ? await resConc.json() : [];
                const dataEst = resEst.ok ? await resEst.json() : [];
                const dataTasa = resTasa.ok ? await resTasa.json() : [];
                const dataGrupo = resGrupo.ok ? await resGrupo.json() : [];

                setAreas(Array.isArray(dataArea) ? dataArea : dataArea.data || []);
                setMonedas(Array.isArray(dataMon) ? dataMon : dataMon.data || []);
                setConceptos(Array.isArray(dataConc) ? dataConc : dataConc.data || []);
                setEstados(Array.isArray(dataEst) ? dataEst : dataEst.data || []);
                setTasasDepreciacion(Array.isArray(dataTasa) ? dataTasa : dataTasa.data || []);
                setGruposActivo(Array.isArray(dataGrupo) ? dataGrupo : dataGrupo.data || []);
            } catch (err) {
                console.error('Error cargando nomencladores:', err);
            } finally {
                setLoadingNomencladores(false);
            }
        };

        fetchNomencladores();
    }, [open]);

    // ==================== HANDLERS ====================
    const handleChange = (field: keyof ActivoFormData, value: string | number | boolean) => {
        setNewActivo((prev) => {
            const updated = { ...prev, [field]: value };
            if (errors[field]) {
                setErrors((prevErrors) => {
                    const newErrors = { ...prevErrors };
                    delete newErrors[field];
                    return newErrors;
                });
            }
            return updated;
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!newActivo.codigoActivo.trim()) newErrors.codigoActivo = "El código es obligatorio";
        if (!newActivo.descripcionActivo.trim()) newErrors.descripcionActivo = "La descripción es obligatoria";
        if (!newActivo.proveedor.trim()) newErrors.proveedor = "El proveedor es obligatorio";
        if (!newActivo.area.trim()) newErrors.area = "El área es obligatoria";
        if (!newActivo.fechaCompra) newErrors.fechaCompra = "La fecha de compra es obligatoria";
        if (newActivo.valorAdquisicion <= 0) newErrors.valorAdquisicion = "El valor debe ser mayor a 0";
        if (newActivo.valorResidual < 0) newErrors.valorResidual = "El valor residual no puede ser negativo";
        if (!newActivo.tasaDepreciacion.trim()) newErrors.tasaDepreciacion = "La tasa de depreciación es obligatoria";
        if (!newActivo.moneda.trim()) newErrors.moneda = "La moneda es obligatoria";
        if (newActivo.vidaUtil < 1) newErrors.vidaUtil = "La vida útil debe ser al menos 1 año";
        if (!newActivo.estadoActivo.trim()) newErrors.estadoActivo = "El estado es obligatorio";
        if (newActivo.cantidad < 1) newErrors.cantidad = "La cantidad debe ser al menos 1";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildPayload = (): any => {
        const payload: any = {
            codigoActivo: newActivo.codigoActivo,
            descripcionActivo: newActivo.descripcionActivo,
            proveedor: newActivo.proveedor,
            area: newActivo.area,
            fechaCompra: newActivo.fechaCompra,
            valorAdquisicion: newActivo.valorAdquisicion,
            valorResidual: newActivo.valorResidual,
            vidaUtil: newActivo.vidaUtil,
            tasaDepreciacion: newActivo.tasaDepreciacion,
            moneda: newActivo.moneda,
            estadoActivo: newActivo.estadoActivo,
            cantidad: newActivo.cantidad,
        };

        // Campos opcionales: solo incluir si tienen valor
        if (newActivo.marca.trim()) payload.marca = newActivo.marca;
        if (newActivo.modelo.trim()) payload.modelo = newActivo.modelo;
        if (newActivo.numeroSerie.trim()) payload.numeroSerie = newActivo.numeroSerie;
        if (newActivo.grupoActivo.trim()) payload.grupoActivo = newActivo.grupoActivo;
        if (newActivo.fechaPuestaMarcha) payload.fechaPuestaMarcha = newActivo.fechaPuestaMarcha;
        if (newActivo.metodoDepreciacion.trim()) payload.metodoDepreciacion = newActivo.metodoDepreciacion;
        if (newActivo.concepto.trim()) payload.concepto = newActivo.concepto;
        if (newActivo.numeroFactura.trim()) payload.numeroFactura = newActivo.numeroFactura;
        if (newActivo.ordenCompra.trim()) payload.ordenCompra = newActivo.ordenCompra;
        if (newActivo.observaciones.trim()) payload.observaciones = newActivo.observaciones;
        if (newActivo.ajusteValor !== 0) payload.ajusteValor = newActivo.ajusteValor;
        payload.activo = newActivo.activo;

        return payload;
    };

    const handleCreateActivo = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload = buildPayload();

            const response = await fetch(`${API_URL}/activofijo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            await response.json();

            if (onActivoCreado) {
                onActivoCreado();
            }

            handleCancelar();

        } catch (error: any) {
            setErrors({ general: error.message || 'Error al crear el activo' });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = () => {
        setNewActivo({
            codigoActivo: "",
            descripcionActivo: "",
            marca: "",
            modelo: "",
            numeroSerie: "",
            proveedor: "",
            area: "",
            grupoActivo: "",
            fechaCompra: "",
            fechaPuestaMarcha: "",
            valorAdquisicion: 0,
            valorResidual: 0,
            vidaUtil: 0,
            tasaDepreciacion: "",
            metodoDepreciacion: "linea_recta",
            moneda: "",
            concepto: "",
            estadoActivo: "",
            numeroFactura: "",
            ordenCompra: "",
            observaciones: "",
            ajusteValor: 0,
            cantidad: 1,
            activo: true,
        });
        setFechaCompra(null);
        setFechaPuestaMarcha(null);
        setErrors({});
        onClose();
    };

    // ==================== RENDER ====================
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Dialog
                open={open}
                onClose={handleCancelar}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6"
                        sx={{
                            borderRadius: 1,
                            boxShadow: 2,
                            p: 1,
                            textAlign: "center",
                            background: GRADIENT_TITLE,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}>
                        <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
                            <PersonAddIcon
                                sx={{
                                    fill: 'url(#iconGradient)',
                                    width: 24,
                                    height: 24
                                }}
                            />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgb(0, 174, 255)" />
                                        <stop offset="100%" stopColor="rgb(196, 45, 226)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </span>
                        Nuevo Activo
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ mt: 1 }}>
                    {/* ═══════════════════════════════════════════════════════
                        SECCIÓN: DATOS BÁSICOS
                        ═══════════════════════════════════════════════════════ */}
                    <Typography variant="subtitle2" sx={{ color: '#888', mb: 1, fontWeight: 600 }}>
                        Datos Básicos
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Fila 1: Código y Descripción */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Código del Activo *"
                                value={newActivo.codigoActivo}
                                onChange={(e) => handleChange("codigoActivo", e.target.value)}
                                error={!!errors.codigoActivo}
                                helperText={errors.codigoActivo}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Descripción *"
                                value={newActivo.descripcionActivo}
                                onChange={(e) => handleChange("descripcionActivo", e.target.value)}
                                error={!!errors.descripcionActivo}
                                helperText={errors.descripcionActivo}
                            />
                        </Box>
                    </Box>

                    {/* Fila 2: Marca y Modelo */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Marca"
                                value={newActivo.marca}
                                onChange={(e) => handleChange("marca", e.target.value)}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Modelo"
                                value={newActivo.modelo}
                                onChange={(e) => handleChange("modelo", e.target.value)}
                            />
                        </Box>
                    </Box>

                    {/* Fila 3: Número de Serie y Proveedor */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Número de Serie"
                                value={newActivo.numeroSerie}
                                onChange={(e) => handleChange("numeroSerie", e.target.value)}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Proveedor *"
                                value={newActivo.proveedor}
                                onChange={(e) => handleChange("proveedor", e.target.value)}
                                error={!!errors.proveedor}
                                helperText={errors.proveedor}
                            />
                        </Box>
                    </Box>

                    {/* ═══════════════════════════════════════════════════════
                        SECCIÓN: UBICACIÓN Y CLASIFICACIÓN
                        ═══════════════════════════════════════════════════════ */}
                    <Typography variant="subtitle2" sx={{ color: '#888', mb: 1, mt: 2, fontWeight: 600 }}>
                        Ubicación y Clasificación
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Fila 4: Área y Grupo de Activo */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Área *"
                                value={newActivo.area}
                                onChange={(e) => handleChange("area", e.target.value)}
                                error={!!errors.area}
                                helperText={errors.area || ""}
                                disabled={loadingNomencladores}
                            >
                                {areas.map((a) => (
                                    <MenuItem key={a._id} value={a._id}>
                                        {a.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Grupo de Activo"
                                value={newActivo.grupoActivo}
                                onChange={(e) => handleChange("grupoActivo", e.target.value)}
                                disabled={loadingNomencladores}
                            >
                                <MenuItem value="">
                                    <em>Sin grupo</em>
                                </MenuItem>
                                {gruposActivo.map((g) => (
                                    <MenuItem key={g._id} value={g._id}>
                                        {g.codigo} - {g.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    {/* ═══════════════════════════════════════════════════════
                        SECCIÓN: VALORES Y DEPRECIACIÓN
                        ═══════════════════════════════════════════════════════ */}
                    <Typography variant="subtitle2" sx={{ color: '#888', mb: 1, mt: 2, fontWeight: 600 }}>
                        Valores y Depreciación
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Fila 5: Fecha de Compra y Fecha Puesta en Marcha */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <Typography sx={LABEL_STYLE}>
                                Fecha de Compra *
                            </Typography>
                            <MobileDatePicker
                                value={fechaCompra}
                                onChange={(newValue) => {
                                    setFechaCompra(newValue);
                                    handleChange("fechaCompra", newValue ? newValue.format('YYYY-MM-DD') : "");
                                    if (errors.fechaCompra) {
                                        setErrors(prev => ({ ...prev, fechaCompra: '' }));
                                    }
                                }}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        error: !!errors.fechaCompra,
                                        helperText: errors.fechaCompra,
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: '#f8f9fa',
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <Typography sx={LABEL_STYLE}>
                                Fecha Puesta en Marcha
                            </Typography>
                            <MobileDatePicker
                                value={fechaPuestaMarcha}
                                onChange={(newValue) => {
                                    setFechaPuestaMarcha(newValue);
                                    handleChange("fechaPuestaMarcha", newValue ? newValue.format('YYYY-MM-DD') : "");
                                }}
                                format="DD/MM/YYYY"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: "small",
                                        sx: {
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: 2,
                                                backgroundColor: '#f8f9fa',
                                            }
                                        }
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    {/* Fila 6: Valor Adquisición y Valor Residual */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Valor de Adquisición *"
                                value={newActivo.valorAdquisicion}
                                onChange={(e) => handleChange("valorAdquisicion", Number(e.target.value))}
                                error={!!errors.valorAdquisicion}
                                helperText={errors.valorAdquisicion}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Valor Residual *"
                                value={newActivo.valorResidual}
                                onChange={(e) => handleChange("valorResidual", Number(e.target.value))}
                                error={!!errors.valorResidual}
                                helperText={errors.valorResidual}
                            />
                        </Box>
                    </Box>

                    {/* Fila 7: Vida Útil y Tasa Depreciación */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Vida Útil (años) *"
                                value={newActivo.vidaUtil}
                                onChange={(e) => handleChange("vidaUtil", Number(e.target.value))}
                                error={!!errors.vidaUtil}
                                helperText={errors.vidaUtil}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Tasa de Depreciación *"
                                value={newActivo.tasaDepreciacion}
                                onChange={(e) => handleChange("tasaDepreciacion", e.target.value)}
                                error={!!errors.tasaDepreciacion}
                                helperText={errors.tasaDepreciacion || ""}
                                disabled={loadingNomencladores}
                            >
                                {tasasDepreciacion.map((t) => (
                                    <MenuItem key={t._id} value={t._id}>
                                        {t.tasa_depreciacion}% - {t.descripcion}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    {/* Fila 8: Método Depreciación y Moneda */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Método de Depreciación"
                                value={newActivo.metodoDepreciacion}
                                onChange={(e) => handleChange("metodoDepreciacion", e.target.value)}
                            >
                                <MenuItem value="linea_recta">Línea Recta</MenuItem>
                                <MenuItem value="saldo_decreciente">Saldo Decreciente</MenuItem>
                                <MenuItem value="unidades_producidas">Unidades Producidas</MenuItem>
                            </TextField>
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Moneda *"
                                value={newActivo.moneda}
                                onChange={(e) => handleChange("moneda", e.target.value)}
                                error={!!errors.moneda}
                                helperText={errors.moneda || ""}
                                disabled={loadingNomencladores}
                            >
                                {monedas.map((m) => (
                                    <MenuItem key={m._id} value={m._id}>
                                        {m.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    {/* ═══════════════════════════════════════════════════════
                        SECCIÓN: DATOS CONTABLES Y ADICIONALES
                        ═══════════════════════════════════════════════════════ */}
                    <Typography variant="subtitle2" sx={{ color: '#888', mb: 1, mt: 2, fontWeight: 600 }}>
                        Datos Contables y Adicionales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    {/* Fila 9: Concepto y Estado */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Concepto"
                                value={newActivo.concepto}
                                onChange={(e) => handleChange("concepto", e.target.value)}
                                disabled={loadingNomencladores}
                            >
                                <MenuItem value="">
                                    <em>Sin concepto</em>
                                </MenuItem>
                                {conceptos.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>
                                        {c.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Estado del Activo *"
                                value={newActivo.estadoActivo}
                                onChange={(e) => handleChange("estadoActivo", e.target.value)}
                                error={!!errors.estadoActivo}
                                helperText={errors.estadoActivo || ""}
                                disabled={loadingNomencladores}
                            >
                                {estados.map((e) => (
                                    <MenuItem key={e._id} value={e._id}>
                                        {e.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    {/* Fila 10: Factura y Orden de Compra */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Número de Factura"
                                value={newActivo.numeroFactura}
                                onChange={(e) => handleChange("numeroFactura", e.target.value)}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Orden de Compra"
                                value={newActivo.ordenCompra}
                                onChange={(e) => handleChange("ordenCompra", e.target.value)}
                            />
                        </Box>
                    </Box>

                    {/* Fila 11: Ajuste Valor y Cantidad */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Ajuste de Valor"
                                value={newActivo.ajusteValor}
                                onChange={(e) => handleChange("ajusteValor", Number(e.target.value))}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Cantidad (creación masiva)"
                                value={newActivo.cantidad}
                                onChange={(e) => handleChange("cantidad", Number(e.target.value))}
                                error={!!errors.cantidad}
                                helperText={errors.cantidad || "Si > 1, genera códigos secuenciales"}
                            />
                        </Box>
                    </Box>

                    {/* Fila 12: Observaciones */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={{ flex: '1 1 100%' }}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Observaciones"
                                multiline
                                rows={2}
                                value={newActivo.observaciones}
                                onChange={(e) => handleChange("observaciones", e.target.value)}
                            />
                        </Box>
                    </Box>

                    {/* Fila 13: Activo (switch) */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={newActivo.activo}
                                    onChange={(e) => handleChange("activo", e.target.checked)}
                                />
                            }
                            label="Activo vigente"
                        />
                    </Box>

                    {/* Error general */}
                    {errors.general && (
                        <Typography color="error" sx={{ mt: 1, textAlign: 'center' }}>
                            {errors.general}
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
                        onClick={handleCancelar}
                        disabled={loading}
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
                        onClick={handleCreateActivo}
                        disabled={loading}
                        fullWidth
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircleIcon />}
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
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
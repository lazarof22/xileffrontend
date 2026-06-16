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
    Box
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
    proveedor: string;
    area: string;
    fechaCompra: string;
    valor: number;
    valorResidual: number;
    depreciacionActivo: string;
    moneda: string;
    vidaUtil: number;
    pais: string;
    concepto: string;
    ajusteValor: number;
    movimiento: string;
    estadoActivo: string;
}

export interface NomencladorItem {
    _id: string;
    nombre: string;
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

// ==================== COMPONENTE ====================
export default function AddActivoDialog({
    open,
    onClose,
    onActivoCreado,
}: AddActivoDialogProps): React.JSX.Element {
    const [loading, setLoading] = useState<boolean>(false);
    const [fechaCompra, setFechaCompra] = useState<dayjs.Dayjs | null>(null);

    const [newActivo, setNewActivo] = useState<ActivoFormData>({
        codigoActivo: "",
        descripcionActivo: "",
        proveedor: "",
        area: "",
        fechaCompra: "",
        valor: 0,
        valorResidual: 0,
        depreciacionActivo: "",
        moneda: "",
        vidaUtil: 0,
        pais: "",
        concepto: "",
        ajusteValor: 0,
        movimiento: "",
        estadoActivo: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Nomencladores
    const [proveedores, setProveedores] = useState<NomencladorItem[]>([]);
    const [areas, setAreas] = useState<NomencladorItem[]>([]);
    const [monedas, setMonedas] = useState<NomencladorItem[]>([]);
    const [paises, setPaises] = useState<NomencladorItem[]>([]);
    const [conceptos, setConceptos] = useState<NomencladorItem[]>([]);
    const [movimientos, setMovimientos] = useState<NomencladorItem[]>([]);
    const [estados, setEstados] = useState<NomencladorItem[]>([]);
    const [loadingNomencladores, setLoadingNomencladores] = useState(false);

    // Cargar nomencladores al abrir el diálogo
    useEffect(() => {
        if (!open) return;

        const fetchNomencladores = async () => {
            setLoadingNomencladores(true);
            try {
                const [
                    resProv,
                    resArea,
                    resMon,
                    resPais,
                    resConc,
                    resMov,
                    resEst
                ] = await Promise.all([
                    fetch(`${API_URL}/empresas`),
                    fetch(`${API_URL}/areas`),
                    fetch(`${API_URL}/monedas`),
                    fetch(`${API_URL}/paises`),
                    fetch(`${API_URL}/conceptos`),
                    fetch(`${API_URL}/movimientos`),
                    fetch(`${API_URL}/estados`),
                ]);

                const dataProv = resProv.ok ? await resProv.json() : [];
                const dataArea = resArea.ok ? await resArea.json() : [];
                const dataMon = resMon.ok ? await resMon.json() : [];
                const dataPais = resPais.ok ? await resPais.json() : [];
                const dataConc = resConc.ok ? await resConc.json() : [];
                const dataMov = resMov.ok ? await resMov.json() : [];
                const dataEst = resEst.ok ? await resEst.json() : [];

                setProveedores(Array.isArray(dataProv) ? dataProv : dataProv.data || []);
                setAreas(Array.isArray(dataArea) ? dataArea : dataArea.data || []);
                setMonedas(Array.isArray(dataMon) ? dataMon : dataMon.data || []);
                setPaises(Array.isArray(dataPais) ? dataPais : dataPais.data || []);
                setConceptos(Array.isArray(dataConc) ? dataConc : dataConc.data || []);
                setMovimientos(Array.isArray(dataMov) ? dataMov : dataMov.data || []);
                setEstados(Array.isArray(dataEst) ? dataEst : dataEst.data || []);
            } catch (err) {
                console.error('Error cargando nomencladores:', err);
            } finally {
                setLoadingNomencladores(false);
            }
        };

        fetchNomencladores();
    }, [open]);

    // ==================== HANDLERS ====================
    const handleChange = (field: keyof ActivoFormData, value: string | number) => {
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
        if (newActivo.valor <= 0) newErrors.valor = "El valor debe ser mayor a 0";
        if (newActivo.valorResidual < 0) newErrors.valorResidual = "El valor residual no puede ser negativo";
        if (!newActivo.depreciacionActivo.trim()) newErrors.depreciacionActivo = "La tasa de depreciación es obligatoria";
        if (!newActivo.moneda.trim()) newErrors.moneda = "La moneda es obligatoria";
        if (newActivo.vidaUtil < 1) newErrors.vidaUtil = "La vida útil debe ser al menos 1 año";
        if (!newActivo.pais.trim()) newErrors.pais = "El país es obligatorio";
        if (!newActivo.concepto.trim()) newErrors.concepto = "El concepto es obligatorio";
        if (newActivo.ajusteValor < 0) newErrors.ajusteValor = "El ajuste de valor no puede ser negativo";
        if (!newActivo.movimiento.trim()) newErrors.movimiento = "El movimiento es obligatorio";
        if (!newActivo.estadoActivo.trim()) newErrors.estadoActivo = "El estado es obligatorio";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCreateActivo = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/activofijo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newActivo),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const createdActivo = await response.json();

            if (onActivoCreado) {
                onActivoCreado();
            }

            // Resetear formulario
            setNewActivo({
                codigoActivo: "",
                descripcionActivo: "",
                proveedor: "",
                area: "",
                fechaCompra: "",
                valor: 0,
                valorResidual: 0,
                depreciacionActivo: "",
                moneda: "",
                vidaUtil: 0,
                pais: "",
                concepto: "",
                ajusteValor: 0,
                movimiento: "",
                estadoActivo: "",
            });
            setFechaCompra(null);
            setErrors({});
            onClose();

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
            proveedor: "",
            area: "",
            fechaCompra: "",
            valor: 0,
            valorResidual: 0,
            depreciacionActivo: "",
            moneda: "",
            vidaUtil: 0,
            pais: "",
            concepto: "",
            ajusteValor: 0,
            movimiento: "",
            estadoActivo: "",
        });
        setFechaCompra(null);
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
                            background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
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
                        GRID DE 2 COLUMNAS
                        ═══════════════════════════════════════════════════════ */}
                    
                    {/* Fila 1: Código y Descripción */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Código del Activo"
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
                                label="Descripción"
                                value={newActivo.descripcionActivo}
                                onChange={(e) => handleChange("descripcionActivo", e.target.value)}
                                error={!!errors.descripcionActivo}
                                helperText={errors.descripcionActivo}
                            />
                        </Box>
                    </Box>

                    {/* Fila 2: Proveedor y Área */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Proveedor"
                                value={newActivo.proveedor}
                                onChange={(e) => handleChange("proveedor", e.target.value)}
                                error={!!errors.proveedor}
                                helperText={errors.proveedor || ""}
                                disabled={loadingNomencladores}
                            >
                                {proveedores.map((p) => (
                                    <MenuItem key={p._id} value={p._id}>
                                        {p.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Área"
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
                    </Box>

                    {/* Fila 3: Fecha de Compra y Valor */}
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
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Valor"
                                value={newActivo.valor}
                                onChange={(e) => handleChange("valor", Number(e.target.value))}
                                error={!!errors.valor}
                                helperText={errors.valor}
                            />
                        </Box>
                    </Box>

                    {/* Fila 4: Valor Residual y Vida Útil */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Valor Residual"
                                value={newActivo.valorResidual}
                                onChange={(e) => handleChange("valorResidual", Number(e.target.value))}
                                error={!!errors.valorResidual}
                                helperText={errors.valorResidual}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Vida Útil (años)"
                                value={newActivo.vidaUtil}
                                onChange={(e) => handleChange("vidaUtil", Number(e.target.value))}
                                error={!!errors.vidaUtil}
                                helperText={errors.vidaUtil}
                            />
                        </Box>
                    </Box>

                    {/* Fila 5: Tasa Depreciación y Moneda */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Tasa de Depreciación (ID)"
                                value={newActivo.depreciacionActivo}
                                onChange={(e) => handleChange("depreciacionActivo", e.target.value)}
                                error={!!errors.depreciacionActivo}
                                helperText={errors.depreciacionActivo || ""}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Moneda"
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

                    {/* Fila 6: País y Concepto */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="País"
                                value={newActivo.pais}
                                onChange={(e) => handleChange("pais", e.target.value)}
                                error={!!errors.pais}
                                helperText={errors.pais || ""}
                                disabled={loadingNomencladores}
                            >
                                {paises.map((p) => (
                                    <MenuItem key={p._id} value={p._id}>
                                        {p.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Concepto"
                                value={newActivo.concepto}
                                onChange={(e) => handleChange("concepto", e.target.value)}
                                error={!!errors.concepto}
                                helperText={errors.concepto || ""}
                                disabled={loadingNomencladores}
                            >
                                {conceptos.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>
                                        {c.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    {/* Fila 7: Ajuste Valor y Movimiento */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                fullWidth
                                size="small"
                                type="number"
                                label="Ajuste de Valor"
                                value={newActivo.ajusteValor}
                                onChange={(e) => handleChange("ajusteValor", Number(e.target.value))}
                                error={!!errors.ajusteValor}
                                helperText={errors.ajusteValor}
                            />
                        </Box>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Movimiento"
                                value={newActivo.movimiento}
                                onChange={(e) => handleChange("movimiento", e.target.value)}
                                error={!!errors.movimiento}
                                helperText={errors.movimiento || ""}
                                disabled={loadingNomencladores}
                            >
                                {movimientos.map((m) => (
                                    <MenuItem key={m._id} value={m._id}>
                                        {m.nombre}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                    </Box>

                    {/* Fila 8: Estado del Activo */}
                    <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                        <Box sx={CELL_STYLE}>
                            <TextField
                                select
                                fullWidth
                                size="small"
                                label="Estado del Activo"
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
                        <Box sx={CELL_STYLE} />
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
                        onClick={handleCreateActivo}
                        disabled={loading}
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
                        {loading ? 'Guardando...' : 'Guardar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}
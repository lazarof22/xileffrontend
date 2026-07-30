// src/components/ConfigContabilidadTab.tsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Divider,
    Chip,
    Stack,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CategoryIcon from '@mui/icons-material/Category';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';

// ==================== TIPOS ====================
export interface Cuenta {
    id: string;
    codigo: string;
    nombre: string;
    naturaleza: 'Deudora' | 'Acreedora';
    padre: string;
    moneda: string;
    nivel: number;
}

export interface ClasificacionIG {
    id: string;
    cuentaId: string;
    cuentaNombre: string;
    tipo: 'Ingreso' | 'Gasto';
}

export interface ElementoGasto {
    id: string;
    codigo: string;
    nombre: string;
}

export interface CentroCosto {
    id: string;
    codigo: string;
    nombre: string;
}

// ==================== COMPONENTE ====================
export default function ConfigContabilidadTab() {
    // ─── ESTADOS ───
    const [cuentas, setCuentas] = useState<Cuenta[]>(() => {
        const saved = localStorage.getItem('conta_cuentas');
        return saved ? JSON.parse(saved) : [];
    });
    const [clasificacionesIG, setClasificacionesIG] = useState<ClasificacionIG[]>(() => {
        const saved = localStorage.getItem('conta_clasificaciones_ig');
        return saved ? JSON.parse(saved) : [];
    });
    const [elementosGasto, setElementosGasto] = useState<ElementoGasto[]>(() => {
        const saved = localStorage.getItem('conta_elementos_gasto');
        return saved ? JSON.parse(saved) : [];
    });
    const [centrosCosto, setCentrosCosto] = useState<CentroCosto[]>(() => {
        const saved = localStorage.getItem('conta_centros_costo');
        return saved ? JSON.parse(saved) : [];
    });

    // ─── FORMULARIOS ───
    const [cuentaCodigo, setCuentaCodigo] = useState('');
    const [cuentaNombre, setCuentaNombre] = useState('');
    const [cuentaNaturaleza, setCuentaNaturaleza] = useState<'Deudora' | 'Acreedora'>('Deudora');
    const [cuentaPadre, setCuentaPadre] = useState('');
    const [cuentaMoneda, setCuentaMoneda] = useState('CUP');

    const [igCuenta, setIgCuenta] = useState('');
    const [igTipo, setIgTipo] = useState<'Ingreso' | 'Gasto'>('Ingreso');

    const [elemCodigo, setElemCodigo] = useState('');
    const [elemNombre, setElemNombre] = useState('');

    const [centroCodigo, setCentroCodigo] = useState('');
    const [centroNombre, setCentroNombre] = useState('');

    const [mensaje, setMensaje] = useState<string | null>(null);

    // ─── PERSISTENCIA ───
    useEffect(() => { localStorage.setItem('conta_cuentas', JSON.stringify(cuentas)); }, [cuentas]);
    useEffect(() => { localStorage.setItem('conta_clasificaciones_ig', JSON.stringify(clasificacionesIG)); }, [clasificacionesIG]);
    useEffect(() => { localStorage.setItem('conta_elementos_gasto', JSON.stringify(elementosGasto)); }, [elementosGasto]);
    useEffect(() => { localStorage.setItem('conta_centros_costo', JSON.stringify(centrosCosto)); }, [centrosCosto]);

    // ─── HELPERS ───
    const calcularNivel = (codigo: string): number => {
        return codigo.split('.').filter(Boolean).length;
    };

    const mostrarMensaje = (msg: string) => {
        setMensaje(msg);
        setTimeout(() => setMensaje(null), 3000);
    };

    // ─── HANDLERS CUENTAS ───
    const guardarCuenta = () => {
        if (!cuentaCodigo.trim() || !cuentaNombre.trim()) {
            mostrarMensaje('Complete código y nombre de la cuenta');
            return;
        }
        const nueva: Cuenta = {
            id: Date.now().toString(),
            codigo: cuentaCodigo,
            nombre: cuentaNombre,
            naturaleza: cuentaNaturaleza,
            padre: cuentaPadre,
            moneda: cuentaMoneda,
            nivel: calcularNivel(cuentaCodigo),
        };
        setCuentas(prev => [...prev, nueva]);
        setCuentaCodigo('');
        setCuentaNombre('');
        setCuentaPadre('');
        mostrarMensaje('Cuenta guardada correctamente');
    };

    const eliminarCuenta = (id: string) => {
        setCuentas(prev => prev.filter(c => c.id !== id));
        setClasificacionesIG(prev => prev.filter(c => c.cuentaId !== id));
    };

    // ─── HANDLERS CLASIFICACIÓN I/G ───
    const guardarClasificacionIG = () => {
        if (!igCuenta) {
            mostrarMensaje('Seleccione una cuenta');
            return;
        }
        const cuenta = cuentas.find(c => c.id === igCuenta);
        if (!cuenta) return;

        // Evitar duplicados
        if (clasificacionesIG.some(c => c.cuentaId === igCuenta)) {
            mostrarMensaje('Esta cuenta ya está clasificada');
            return;
        }

        const nueva: ClasificacionIG = {
            id: Date.now().toString(),
            cuentaId: igCuenta,
            cuentaNombre: `${cuenta.codigo} - ${cuenta.nombre}`,
            tipo: igTipo,
        };
        setClasificacionesIG(prev => [...prev, nueva]);
        setIgCuenta('');
        mostrarMensaje('Clasificación guardada');
    };

    const eliminarClasificacionIG = (id: string) => {
        setClasificacionesIG(prev => prev.filter(c => c.id !== id));
    };

    // ─── HANDLERS ELEMENTOS DE GASTO ───
    const guardarElemento = () => {
        if (!elemCodigo.trim() || !elemNombre.trim()) {
            mostrarMensaje('Complete código y nombre');
            return;
        }
        const nuevo: ElementoGasto = {
            id: Date.now().toString(),
            codigo: elemCodigo,
            nombre: elemNombre,
        };
        setElementosGasto(prev => [...prev, nuevo]);
        setElemCodigo('');
        setElemNombre('');
        mostrarMensaje('Elemento de gasto guardado');
    };

    const eliminarElemento = (id: string) => {
        setElementosGasto(prev => prev.filter(e => e.id !== id));
    };

    // ─── HANDLERS CENTROS DE COSTO ───
    const guardarCentro = () => {
        if (!centroCodigo.trim() || !centroNombre.trim()) {
            mostrarMensaje('Complete código y nombre');
            return;
        }
        const nuevo: CentroCosto = {
            id: Date.now().toString(),
            codigo: centroCodigo,
            nombre: centroNombre,
        };
        setCentrosCosto(prev => [...prev, nuevo]);
        setCentroCodigo('');
        setCentroNombre('');
        mostrarMensaje('Centro de costo guardado');
    };

    const eliminarCentro = (id: string) => {
        setCentrosCosto(prev => prev.filter(c => c.id !== id));
    };

    // ─── EXPORTAR / IMPORTAR ───
    const exportarDatos = () => {
        const data = { cuentas, clasificacionesIG, elementosGasto, centrosCosto };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'config_contabilidad.json';
        a.click();
        URL.revokeObjectURL(url);
        mostrarMensaje('Datos exportados');
    };

    const importarDatos = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                try {
                    const data = JSON.parse(ev.target?.result as string);
                    if (data.cuentas) setCuentas(data.cuentas);
                    if (data.clasificacionesIG) setClasificacionesIG(data.clasificacionesIG);
                    if (data.elementosGasto) setElementosGasto(data.elementosGasto);
                    if (data.centrosCosto) setCentrosCosto(data.centrosCosto);
                    mostrarMensaje('Datos importados correctamente');
                } catch {
                    mostrarMensaje('Error al importar el archivo');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const cargarEjemplo = () => {
        const ejemploCuentas: Cuenta[] = [
            { id: '1', codigo: '1', nombre: 'Activos', naturaleza: 'Deudora', padre: '', moneda: 'CUP', nivel: 1 },
            { id: '2', codigo: '1.1', nombre: 'Activos Corrientes', naturaleza: 'Deudora', padre: '1', moneda: 'CUP', nivel: 2 },
            { id: '3', codigo: '1.1.1', nombre: 'Caja', naturaleza: 'Deudora', padre: '2', moneda: 'CUP', nivel: 3 },
            { id: '4', codigo: '1.1.2', nombre: 'Bancos', naturaleza: 'Deudora', padre: '2', moneda: 'CUP', nivel: 3 },
            { id: '5', codigo: '2', nombre: 'Pasivos', naturaleza: 'Acreedora', padre: '', moneda: 'CUP', nivel: 1 },
            { id: '6', codigo: '2.1', nombre: 'Pasivos Corrientes', naturaleza: 'Acreedora', padre: '5', moneda: 'CUP', nivel: 2 },
            { id: '7', codigo: '3', nombre: 'Patrimonio', naturaleza: 'Acreedora', padre: '', moneda: 'CUP', nivel: 1 },
            { id: '8', codigo: '4', nombre: 'Ingresos', naturaleza: 'Acreedora', padre: '', moneda: 'CUP', nivel: 1 },
            { id: '9', codigo: '5', nombre: 'Gastos', naturaleza: 'Deudora', padre: '', moneda: 'CUP', nivel: 1 },
        ];
        const ejemploElementos: ElementoGasto[] = [
            { id: 'e1', codigo: 'E01', nombre: 'Materiales' },
            { id: 'e2', codigo: 'E02', nombre: 'Servicios' },
            { id: 'e3', codigo: 'E03', nombre: 'Sueldos y Salarios' },
        ];
        const ejemploCentros: CentroCosto[] = [
            { id: 'c1', codigo: 'CC01', nombre: 'Administración' },
            { id: 'c2', codigo: 'CC02', nombre: 'Producción' },
            { id: 'c3', codigo: 'CC03', nombre: 'Ventas' },
        ];
        setCuentas(ejemploCuentas);
        setElementosGasto(ejemploElementos);
        setCentrosCosto(ejemploCentros);
        setClasificacionesIG([]);
        mostrarMensaje('Datos de ejemplo cargados');
    };

    // ─── RENDER SECCIÓN ───
    const renderSeccion = (
        icon: React.ReactNode,
        titulo: string,
        children: React.ReactNode
    ) => (
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
                        {icon}
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
                        {titulo}
                    </Typography>
                    <Chip
                        label={
                            titulo.includes('Cuentas') ? `${cuentas.length} registros` :
                                titulo.includes('Clasificación') ? `${clasificacionesIG.length} registros` :
                                    titulo.includes('Elementos') ? `${elementosGasto.length} registros` :
                                        `${centrosCosto.length} registros`
                        }
                        size="small"
                        sx={{
                            ml: 'auto',
                            bgcolor: 'rgba(10, 83, 218, 0.1)',
                            color: 'rgb(10, 83, 218)',
                            fontWeight: 600,
                            borderRadius: 2,
                        }}
                    />
                </Box>
                <Divider sx={{ mb: 2 }} />
                {children}
            </CardContent>
        </Card>
    );

    return (
        <Box>
            {mensaje && (
                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    {mensaje}
                </Alert>
            )}

            {/* ─── ACCIONES GLOBALES ─── */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<SearchIcon />}
                    onClick={cargarEjemplo}
                    sx={{
                        background: 'linear-gradient(135deg, rgb(36, 236, 9), rgba(202, 183, 14, 0.9))',
                        color: '#fff',
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgb(24, 158, 6)',
                        },
                    }}
                >
                    Cargar Ejemplo
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={exportarDatos}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: 'rgba(10, 83, 218, 0.3)',
                        color: 'rgb(10, 83, 218)',
                        '&:hover': { borderColor: 'rgb(10, 83, 218)', bgcolor: 'rgba(10, 83, 218, 0.04)' },
                    }}
                >
                    Exportar JSON
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={importarDatos}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: 'rgba(10, 83, 218, 0.3)',
                        color: 'rgb(10, 83, 218)',
                        '&:hover': { borderColor: 'rgb(10, 83, 218)', bgcolor: 'rgba(10, 83, 218, 0.04)' },
                    }}
                >
                    Importar JSON
                </Button>
                <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => {
                        if (confirm('¿Eliminar todos los datos de configuración?')) {
                            setCuentas([]);
                            setClasificacionesIG([]);
                            setElementosGasto([]);
                            setCentrosCosto([]);
                            mostrarMensaje('Todos los datos han sido eliminados');
                        }
                    }}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                    }}
                >
                    Limpiar Todo
                </Button>
            </Box>

            <Stack spacing={3}>
                {/* ═══════════════════════════════════════════════════════════
                    PLAN DE CUENTAS (CLASIFICADOR)
                    ═══════════════════════════════════════════════════════════ */}
                {renderSeccion(
                    <AccountTreeIcon />,
                    'Clasificador de Cuentas',
                    <>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                            <TextField
                                label="Código"
                                placeholder="Ej: 1.1.1"
                                value={cuentaCodigo}
                                onChange={(e) => setCuentaCodigo(e.target.value)}
                                size="small"
                                sx={{
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                            <TextField
                                label="Nombre"
                                placeholder="Descripción"
                                value={cuentaNombre}
                                onChange={(e) => setCuentaNombre(e.target.value)}
                                size="small"
                                sx={{
                                    flex: 1,
                                    minWidth: 200,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Naturaleza</InputLabel>
                                <Select
                                    value={cuentaNaturaleza}
                                    label="Naturaleza"
                                    onChange={(e) => setCuentaNaturaleza(e.target.value as 'Deudora' | 'Acreedora')}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    }}
                                >
                                    <MenuItem value="Deudora">Deudora</MenuItem>
                                    <MenuItem value="Acreedora">Acreedora</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Padre</InputLabel>
                                <Select
                                    value={cuentaPadre}
                                    label="Padre"
                                    onChange={(e) => setCuentaPadre(e.target.value)}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    }}
                                >
                                    <MenuItem value="">-- Raíz --</MenuItem>
                                    {cuentas.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.codigo} - {c.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                                <InputLabel>Moneda</InputLabel>
                                <Select
                                    value={cuentaMoneda}
                                    label="Moneda"
                                    onChange={(e) => setCuentaMoneda(e.target.value)}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    }}
                                >
                                    <MenuItem value="CUP">CUP</MenuItem>
                                    <MenuItem value="CUC">CUC</MenuItem>
                                    <MenuItem value="USD">USD</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={guardarCuenta}
                                sx={{
                                    background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    },
                                }}
                            >
                                Guardar
                            </Button>
                        </Box>

                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid rgba(0,0,0,0.04)',
                                bgcolor: '#f8f9fa',
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(10, 83, 218, 0.04)' }}>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Nombre</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Naturaleza</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Nivel</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Moneda</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555', width: 50 }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {cuentas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center" sx={{ py: 4, color: '#888' }}>
                                                No hay cuentas registradas
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        cuentas.map((c) => (
                                            <TableRow
                                                key={c.id}
                                                sx={{
                                                    '&:hover': { bgcolor: 'rgba(10, 83, 218, 0.02)' },
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a1a2e' }}>
                                                    {c.codigo}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{c.nombre}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={c.naturaleza}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: c.naturaleza === 'Deudora' ? 'rgba(255, 174, 0, 0.15)' : 'rgba(36, 236, 9, 0.15)',
                                                            color: c.naturaleza === 'Deudora' ? '#b8860b' : '#1e7e34',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>{c.nivel}</TableCell>
                                                <TableCell>{c.moneda}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => eliminarCuenta(c.id)}
                                                        sx={{
                                                            color: 'rgb(220, 20, 60)',
                                                            '&:hover': { bgcolor: 'rgba(220, 20, 60, 0.08)' },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    CLASIFICACIÓN INGRESOS / GASTOS
                    ═══════════════════════════════════════════════════════════ */}
                {renderSeccion(
                    <CategoryIcon />,
                    'Clasificación de Ingresos y Gastos',
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Define qué cuentas del clasificador se consideran <strong>Ingresos</strong> o <strong>Gastos</strong> para el Estado de Rendimiento.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'flex-end' }}>
                            <FormControl size="small" sx={{ minWidth: 250 }}>
                                <InputLabel>Cuenta</InputLabel>
                                <Select
                                    value={igCuenta}
                                    label="Cuenta"
                                    onChange={(e) => setIgCuenta(e.target.value)}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    }}
                                >
                                    <MenuItem value="">-- Seleccionar --</MenuItem>
                                    {cuentas.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.codigo} - {c.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 130 }}>
                                <InputLabel>Tipo</InputLabel>
                                <Select
                                    value={igTipo}
                                    label="Tipo"
                                    onChange={(e) => setIgTipo(e.target.value as 'Ingreso' | 'Gasto')}
                                    sx={{
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    }}
                                >
                                    <MenuItem value="Ingreso">Ingreso</MenuItem>
                                    <MenuItem value="Gasto">Gasto</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={guardarClasificacionIG}
                                sx={{
                                    background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    },
                                }}
                            >
                                Asignar
                            </Button>
                        </Box>

                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid rgba(0,0,0,0.04)',
                                bgcolor: '#f8f9fa',
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(10, 83, 218, 0.04)' }}>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Cuenta</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Clasificación</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555', width: 50 }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {clasificacionesIG.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#888' }}>
                                                No hay clasificaciones registradas
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        clasificacionesIG.map((c) => (
                                            <TableRow
                                                key={c.id}
                                                sx={{
                                                    '&:hover': { bgcolor: 'rgba(10, 83, 218, 0.02)' },
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 500 }}>{c.cuentaNombre}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={c.tipo}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: c.tipo === 'Ingreso' ? 'rgba(36, 236, 9, 0.15)' : 'rgba(255, 0, 0, 0.1)',
                                                            color: c.tipo === 'Ingreso' ? '#1e7e34' : '#c0392b',
                                                            fontWeight: 600,
                                                            fontSize: '0.75rem',
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => eliminarClasificacionIG(c.id)}
                                                        sx={{
                                                            color: 'rgb(220, 20, 60)',
                                                            '&:hover': { bgcolor: 'rgba(220, 20, 60, 0.08)' },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    ELEMENTOS DE GASTO
                    ═══════════════════════════════════════════════════════════ */}
                {renderSeccion(
                    <ReceiptIcon />,
                    'Elementos de Gasto',
                    <>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'flex-end' }}>
                            <TextField
                                label="Código"
                                placeholder="Ej: E01"
                                value={elemCodigo}
                                onChange={(e) => setElemCodigo(e.target.value)}
                                size="small"
                                sx={{
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                            <TextField
                                label="Nombre"
                                placeholder="Ej: Materiales"
                                value={elemNombre}
                                onChange={(e) => setElemNombre(e.target.value)}
                                size="small"
                                sx={{
                                    flex: 1,
                                    minWidth: 200,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={guardarElemento}
                                sx={{
                                    background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    },
                                }}
                            >
                                Guardar
                            </Button>
                        </Box>

                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid rgba(0,0,0,0.04)',
                                bgcolor: '#f8f9fa',
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(10, 83, 218, 0.04)' }}>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Nombre</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555', width: 50 }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {elementosGasto.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#888' }}>
                                                No hay elementos registrados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        elementosGasto.map((e) => (
                                            <TableRow
                                                key={e.id}
                                                sx={{
                                                    '&:hover': { bgcolor: 'rgba(10, 83, 218, 0.02)' },
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a1a2e' }}>
                                                    {e.codigo}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{e.nombre}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => eliminarElemento(e.id)}
                                                        sx={{
                                                            color: 'rgb(220, 20, 60)',
                                                            '&:hover': { bgcolor: 'rgba(220, 20, 60, 0.08)' },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    CENTROS DE COSTO
                    ═══════════════════════════════════════════════════════════ */}
                {renderSeccion(
                    <BusinessIcon />,
                    'Centros de Costo',
                    <>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2, alignItems: 'flex-end' }}>
                            <TextField
                                label="Código"
                                placeholder="Ej: CC01"
                                value={centroCodigo}
                                onChange={(e) => setCentroCodigo(e.target.value)}
                                size="small"
                                sx={{
                                    minWidth: 120,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                            <TextField
                                label="Nombre"
                                placeholder="Ej: Administración"
                                value={centroNombre}
                                onChange={(e) => setCentroNombre(e.target.value)}
                                size="small"
                                sx={{
                                    flex: 1,
                                    minWidth: 200,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        bgcolor: '#f8f9fa',
                                    },
                                }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={guardarCentro}
                                sx={{
                                    background: 'linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))',
                                    color: '#fff',
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                    },
                                }}
                            >
                                Guardar
                            </Button>
                        </Box>

                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                borderRadius: 2,
                                border: '1px solid rgba(0,0,0,0.04)',
                                bgcolor: '#f8f9fa',
                            }}
                        >
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: 'rgba(10, 83, 218, 0.04)' }}>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Código</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555' }}>Nombre</TableCell>
                                        <TableCell sx={{ fontWeight: 700, color: '#555', width: 50 }}></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {centrosCosto.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 4, color: '#888' }}>
                                                No hay centros registrados
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        centrosCosto.map((c) => (
                                            <TableRow
                                                key={c.id}
                                                sx={{
                                                    '&:hover': { bgcolor: 'rgba(10, 83, 218, 0.02)' },
                                                    transition: 'all 0.2s',
                                                }}
                                            >
                                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#1a1a2e' }}>
                                                    {c.codigo}
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>{c.nombre}</TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => eliminarCentro(c.id)}
                                                        sx={{
                                                            color: 'rgb(220, 20, 60)',
                                                            '&:hover': { bgcolor: 'rgba(220, 20, 60, 0.08)' },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Stack>
        </Box>
    );
}
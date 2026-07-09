// src/components/AlmacenesTab.tsx
import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, Typography, Box, Divider, Chip,
    TextField, Button, IconButton, Stack, Alert, Dialog,
    DialogTitle, DialogContent, DialogActions, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import CustomDataGridR, { type Column } from './CustomDataGridR';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── INTERFACES ───────────────────────────────────────────────
interface Almacen {
    id: string;
    nombre: string;
    contenedoresCount: number;
}

interface Contenedor {
    id: string;
    nombre: string;
    almacenId: string;
    almacenNombre: string;
    productosCount: number;
}

interface AlmacenesTabProps {
    // Opcional: datos externos
    almacenesExternos?: Almacen[];
    contenedoresExternos?: Contenedor[];
}

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────
export default function AlmacenesTab({ almacenesExternos, contenedoresExternos }: AlmacenesTabProps) {
    // Estados
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [contenedores, setContenedores] = useState<Contenedor[]>([]);
    const [almacenCounter, setAlmacenCounter] = useState(1);
    const [contenedorCounter, setContenedorCounter] = useState(1);

    // Formulario almacén
    const [nuevoAlmacen, setNuevoAlmacen] = useState('');

    // Formulario contenedor
    const [almacenSeleccionado, setAlmacenSeleccionado] = useState('');
    const [nuevoContenedor, setNuevoContenedor] = useState('');

    // Alert
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Cargar datos
    useEffect(() => {
        if (almacenesExternos) setAlmacenes(almacenesExternos);
        if (contenedoresExternos) setContenedores(contenedoresExternos);

        const saved = localStorage.getItem('almacenes_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setAlmacenes(parsed.almacenes || []);
                setContenedores(parsed.contenedores || []);
                setAlmacenCounter(parsed.almacenCounter || 1);
                setContenedorCounter(parsed.contenedorCounter || 1);
            } catch (e) {
                console.error('Error cargando almacenes:', e);
            }
        }
    }, [almacenesExternos, contenedoresExternos]);

    // Guardar datos
    const guardarDatos = (alm: Almacen[], cont: Contenedor[], aCounter: number, cCounter: number) => {
        localStorage.setItem('almacenes_data', JSON.stringify({
            almacenes: alm,
            contenedores: cont,
            almacenCounter: aCounter,
            contenedorCounter: cCounter
        }));
    };

    // ─── AGREGAR ALMACÉN ────────────────────────────────────────
    const agregarAlmacen = () => {
        if (!nuevoAlmacen.trim()) {
            setAlert({ type: 'error', message: 'Ingrese un nombre para el almacén' });
            return;
        }

        const nuevo: Almacen = {
            id: `ALM-${String(almacenCounter).padStart(4, '0')}`,
            nombre: nuevoAlmacen.trim(),
            contenedoresCount: 0
        };

        const nuevosAlmacenes = [...almacenes, nuevo];
        const newCounter = almacenCounter + 1;

        setAlmacenes(nuevosAlmacenes);
        setAlmacenCounter(newCounter);
        guardarDatos(nuevosAlmacenes, contenedores, newCounter, contenedorCounter);

        setNuevoAlmacen('');
        setAlert({ type: 'success', message: '✅ Almacén agregado correctamente' });
        setTimeout(() => setAlert(null), 3000);
    };

    // ─── ELIMINAR ALMACÉN ───────────────────────────────────────
    const eliminarAlmacen = (id: string) => {
        if (!confirm('¿Eliminar almacén? Los contenedores asociados también se eliminarán.')) return;

        const contenedoresAsociados = contenedores.filter(c => c.almacenId === id);
        const nuevosContenedores = contenedores.filter(c => c.almacenId !== id);
        const nuevosAlmacenes = almacenes.filter(a => a.id !== id);

        setAlmacenes(nuevosAlmacenes);
        setContenedores(nuevosContenedores);
        guardarDatos(nuevosAlmacenes, nuevosContenedores, almacenCounter, contenedorCounter);

        setAlert({ type: 'success', message: `Almacén eliminado. ${contenedoresAsociados.length} contenedores removidos.` });
        setTimeout(() => setAlert(null), 3000);
    };

    // ─── AGREGAR CONTENEDOR ─────────────────────────────────────
    const agregarContenedor = () => {
        if (!almacenSeleccionado || !nuevoContenedor.trim()) {
            setAlert({ type: 'error', message: 'Seleccione un almacén e ingrese un nombre' });
            return;
        }

        const alm = almacenes.find(a => a.id === almacenSeleccionado);
        if (!alm) return;

        const nuevo: Contenedor = {
            id: `CONT-${String(contenedorCounter).padStart(4, '0')}`,
            nombre: nuevoContenedor.trim(),
            almacenId: almacenSeleccionado,
            almacenNombre: alm.nombre,
            productosCount: 0
        };

        const nuevosContenedores = [...contenedores, nuevo];
        const newCounter = contenedorCounter + 1;

        // Actualizar contador de contenedores del almacén
        const nuevosAlmacenes = almacenes.map(a =>
            a.id === almacenSeleccionado
                ? { ...a, contenedoresCount: a.contenedoresCount + 1 }
                : a
        );

        setContenedores(nuevosContenedores);
        setAlmacenes(nuevosAlmacenes);
        setContenedorCounter(newCounter);
        guardarDatos(nuevosAlmacenes, nuevosContenedores, almacenCounter, newCounter);

        setNuevoContenedor('');
        setAlert({ type: 'success', message: '✅ Contenedor agregado correctamente' });
        setTimeout(() => setAlert(null), 3000);
    };

    // ─── ELIMINAR CONTENEDOR ────────────────────────────────────
    const eliminarContenedor = (id: string) => {
        if (!confirm('¿Eliminar contenedor?')) return;

        const cont = contenedores.find(c => c.id === id);
        const nuevosContenedores = contenedores.filter(c => c.id !== id);

        // Actualizar contador del almacén
        const nuevosAlmacenes = cont
            ? almacenes.map(a => a.id === cont.almacenId ? { ...a, contenedoresCount: Math.max(0, a.contenedoresCount - 1) } : a)
            : almacenes;

        setContenedores(nuevosContenedores);
        setAlmacenes(nuevosAlmacenes);
        guardarDatos(nuevosAlmacenes, nuevosContenedores, almacenCounter, contenedorCounter);

        setAlert({ type: 'success', message: 'Contenedor eliminado' });
        setTimeout(() => setAlert(null), 3000);
    };

    // ─── COLUMNAS ───────────────────────────────────────────────
    const almacenColumns: Column<Almacen>[] = [
        { field: 'id', headerName: 'Código' },
        { field: 'nombre', headerName: 'Almacén' },
        { field: 'contenedoresCount', headerName: 'Contenedores', numeric: true },
    ];

    const contenedorColumns: Column<Contenedor>[] = [
        { field: 'id', headerName: 'Código' },
        { field: 'nombre', headerName: 'Contenedor' },
        { field: 'almacenNombre', headerName: 'Almacén' },
        { field: 'productosCount', headerName: 'Productos', numeric: true },
    ];

    // ─── RENDER ─────────────────────────────────────────────────
    return (
        <Box>
            {/* Alertas */}
            {alert && (
                <Alert severity={alert.type} sx={{ mb: 2, borderRadius: 2, mx: 1 }} onClose={() => setAlert(null)}>
                    {alert.message}
                </Alert>
            )}

            {/* ═══════════════════════════════════════════════════
        CARD SUPERIOR: ALMACENES
    ═══════════════════════════════════════════════════ */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.04)",
                    bgcolor: "#f8f9fa",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    m: 1,
                    mb: 2
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6"
                            sx={{
                                background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                            <WarehouseIcon sx={{ fill: 'url(#iconGradientAlm)', width: 24, height: 24 }} />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="iconGradientAlm" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            Almacenes
                        </Typography>
                        <Chip
                            label={`${almacenes.length} registrados`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(10, 83, 218, 0.1)',
                                color: 'rgb(10, 83, 218)',
                                fontWeight: 600,
                                borderRadius: 2
                            }}
                        />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Agregar Almacén */}
                    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'rgba(0,0,0,0.06)', bgcolor: '#fff', mb: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Nombre del almacén"
                                    value={nuevoAlmacen}
                                    onChange={(e) => setNuevoAlmacen(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && agregarAlmacen()}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1, bgcolor: '#f8f9fa',
                                            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
                                            '&:hover fieldset': { borderColor: 'rgba(10, 83, 218, 0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: 'rgb(10, 83, 218)' },
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={agregarAlmacen}
                                    sx={{
                                        background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        px: 3,
                                        whiteSpace: 'nowrap',
                                        boxShadow: "0 4px 12px rgba(10, 83, 218, 0.3)",
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                    Agregar
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Tabla de Almacenes */}
                    <CustomDataGridR<Almacen>
                        rows={almacenes}
                        columns={almacenColumns}
                        getRowId={(row) => row.id}
                        title="Lista de Almacenes"
                        deleteConfig={{
                            baseUrl: `${API_URL}/almacenes`,
                            onSuccess: () => {
                                setAlert({ type: 'success', message: 'Almacén eliminado' });
                                setTimeout(() => setAlert(null), 3000);
                            }
                        }}
                        getRowAvatar={(row) => row.nombre.charAt(0).toUpperCase()}
                    />
                </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════
        CARD INFERIOR: CONTENEDORES
    ═══════════════════════════════════════════════════ */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.04)",
                    bgcolor: "#f8f9fa",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    m: 1,
                    mt: 2
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6"
                            sx={{
                                background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                            <Inventory2Icon sx={{ fill: 'url(#iconGradientCont)', width: 24, height: 24 }} />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="iconGradientCont" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            Contenedores
                        </Typography>
                        <Chip
                            label={`${contenedores.length} registrados`}
                            size="small"
                            sx={{
                                bgcolor: 'rgba(10, 218, 20, 0.12)',
                                color: 'rgb(10, 218, 20)',
                                fontWeight: 600,
                                borderRadius: 2
                            }}
                        />
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* Agregar Contenedor */}
                    <Card variant="outlined" sx={{ borderRadius: 2, borderColor: 'rgba(0,0,0,0.06)', bgcolor: '#fff', mb: 2 }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                <select
                                    value={almacenSeleccionado}
                                    onChange={(e) => setAlmacenSeleccionado(e.target.value)}
                                    style={{
                                        flex: 1,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '8px',
                                        padding: '8px 12px',
                                        fontSize: '0.9rem',
                                        color: '#444',
                                        background: '#f8f9fa',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="">-- Seleccione Almacén --</option>
                                    {almacenes.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                                <TextField
                                    size="small"
                                    placeholder="Nombre del contenedor"
                                    value={nuevoContenedor}
                                    onChange={(e) => setNuevoContenedor(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && agregarContenedor()}
                                    sx={{
                                        flex: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1, bgcolor: '#f8f9fa',
                                            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
                                            '&:hover fieldset': { borderColor: 'rgba(10, 83, 218, 0.3)' },
                                            '&.Mui-focused fieldset': { borderColor: 'rgb(10, 83, 218)' },
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={agregarContenedor}
                                    sx={{
                                        background: "linear-gradient(135deg, rgb(36, 236, 9), rgba(202, 183, 14, 0.9))",
                                        color: "#fff",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderRadius: 1,
                                        px: 3,
                                        whiteSpace: 'nowrap',
                                        boxShadow: "0 4px 12px rgba(36, 236, 9, 0.3)",
                                    }}
                                >
                                    <AddIcon sx={{ fontSize: 18, mr: 0.5 }} />
                                    Agregar
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Tabla de Contenedores */}
                    <CustomDataGridR<Contenedor>
                        rows={contenedores}
                        columns={contenedorColumns}
                        getRowId={(row) => row.id}
                        title="Lista de Contenedores"
                        deleteConfig={{
                            baseUrl: `${API_URL}/contenedores`,
                            onSuccess: () => {
                                setAlert({ type: 'success', message: 'Contenedor eliminado' });
                                setTimeout(() => setAlert(null), 3000);
                            }
                        }}
                        getRowAvatar={(row) => row.nombre.charAt(0).toUpperCase()}
                    />
                </CardContent>
            </Card>
        </Box>
    );
}
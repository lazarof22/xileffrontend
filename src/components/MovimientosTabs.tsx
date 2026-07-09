// src/components/MovimientosTab.tsx
import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, Typography, Box, Divider, Chip,
    TextField, Button, Stack, Alert, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    FormControl, InputLabel, Select, type SelectChangeEvent
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CustomDataGridR, { type Column } from './CustomDataGridR';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── INTERFACES ───────────────────────────────────────────────
interface Producto {
    id: string;
    nombre: string;
    stock: number;
    unidad: string;
    costo: number;
    almacenId: string;
    contenedorId: string;
}

interface Almacen {
    id: string;
    nombre: string;
}

interface Contenedor {
    id: string;
    nombre: string;
    almacenId: string;
}

interface Compra {
    id: string;
    fecha: string;
    productoId: string;
    productoNombre: string;
    cantidad: number;
    costoUnitario: number;
    total: number;
}

interface Transferencia {
    id: string;
    fecha: string;
    productoId: string;
    productoNombre: string;
    cantidad: number;
    origenAlmacen: string;
    origenContenedor: string;
    destinoAlmacen: string;
    destinoContenedor: string;
}

interface Ajuste {
    id: string;
    fecha: string;
    productoId: string;
    productoNombre: string;
    cantidad: number;
    tipo: 'entrada' | 'salida';
    motivo: string;
}

interface MovimientosTabProps {
    productos?: Producto[];
    almacenes?: Almacen[];
    contenedores?: Contenedor[];
}

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────
export default function MovimientosTab({ productos: productosExt, almacenes: almacenesExt, contenedores: contenedoresExt }: MovimientosTabProps) {
    // Estados de datos
    const [productos, setProductos] = useState<Producto[]>([]);
    const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
    const [contenedores, setContenedores] = useState<Contenedor[]>([]);
    const [compras, setCompras] = useState<Compra[]>([]);
    const [transferencias, setTransferencias] = useState<Transferencia[]>([]);
    const [ajustes, setAjustes] = useState<Ajuste[]>([]);
    const [movimientoCounter, setMovimientoCounter] = useState(1);

    // Formulario Compra
    const [compraProducto, setCompraProducto] = useState('');
    const [compraFecha, setCompraFecha] = useState(new Date().toISOString().split('T')[0]);
    const [compraCantidad, setCompraCantidad] = useState('');
    const [compraCosto, setCompraCosto] = useState('');

    // Formulario Transferencia
    const [transProducto, setTransProducto] = useState('');
    const [transOrigenAlm, setTransOrigenAlm] = useState('');
    const [transOrigenCont, setTransOrigenCont] = useState('');
    const [transDestinoAlm, setTransDestinoAlm] = useState('');
    const [transDestinoCont, setTransDestinoCont] = useState('');
    const [transCantidad, setTransCantidad] = useState('');
    const [transFecha, setTransFecha] = useState(new Date().toISOString().split('T')[0]);

    // Alert
    const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Cargar datos
    useEffect(() => {
        // Datos externos o localStorage
        const saved = localStorage.getItem('movimientos_data');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setCompras(parsed.compras || []);
                setTransferencias(parsed.transferencias || []);
                setAjustes(parsed.ajustes || []);
                setMovimientoCounter(parsed.counter || 1);
            } catch (e) { console.error(e); }
        }

        const savedProd = localStorage.getItem('productos_data');
        if (savedProd) {
            try { setProductos(JSON.parse(savedProd)); }
            catch (e) { console.error(e); }
        }

        const savedAlm = localStorage.getItem('almacenes_data');
        if (savedAlm) {
            try {
                const parsed = JSON.parse(savedAlm);
                setAlmacenes(parsed.almacenes || []);
                setContenedores(parsed.contenedores || []);
            } catch (e) { console.error(e); }
        }

        if (productosExt) setProductos(productosExt);
        if (almacenesExt) setAlmacenes(almacenesExt);
        if (contenedoresExt) setContenedores(contenedoresExt);
    }, [productosExt, almacenesExt, contenedoresExt]);

    // Guardar
    const guardarDatos = (comps: Compra[], trans: Transferencia[], ajus: Ajuste[], counter: number) => {
        localStorage.setItem('movimientos_data', JSON.stringify({
            compras: comps,
            transferencias: trans,
            ajustes: ajus,
            counter
        }));
    };

    // ─── REGISTRAR COMPRA ───────────────────────────────────────
    const registrarCompra = () => {
        if (!compraProducto || !compraCantidad || !compraCosto || !compraFecha) {
            setAlert({ type: 'error', message: 'Complete todos los campos de la compra' });
            return;
        }

        const prod = productos.find(p => p.id === compraProducto);
        if (!prod) return;

        const cant = parseInt(compraCantidad);
        const costo = parseFloat(compraCosto);
        const total = cant * costo;

        const nuevaCompra: Compra = {
            id: `COMP-${String(movimientoCounter).padStart(6, '0')}`,
            fecha: compraFecha,
            productoId: compraProducto,
            productoNombre: prod.nombre,
            cantidad: cant,
            costoUnitario: costo,
            total
        };

        // Actualizar stock y costo del producto
        const nuevosProductos = productos.map(p =>
            p.id === compraProducto
                ? { ...p, stock: p.stock + cant, costo: costo }
                : p
        );

        // Registrar ajuste de entrada
        const nuevoAjuste: Ajuste = {
            id: `AJU-${String(movimientoCounter).padStart(6, '0')}`,
            fecha: compraFecha,
            productoId: compraProducto,
            productoNombre: prod.nombre,
            cantidad: cant,
            tipo: 'entrada',
            motivo: `Compra a $${costo.toFixed(2)} c/u`
        };

        const newCounter = movimientoCounter + 1;
        const nuevasCompras = [nuevaCompra, ...compras];
        const nuevosAjustes = [nuevoAjuste, ...ajustes];

        setCompras(nuevasCompras);
        setAjustes(nuevosAjustes);
        setProductos(nuevosProductos);
        setMovimientoCounter(newCounter);
        guardarDatos(nuevasCompras, transferencias, nuevosAjustes, newCounter);
        localStorage.setItem('productos_data', JSON.stringify(nuevosProductos));

        setCompraCantidad('');
        setCompraCosto('');
        setAlert({ type: 'success', message: `✅ Compra registrada: ${cant} ${prod.unidad || 'unidades'} de ${prod.nombre}` });
        setTimeout(() => setAlert(null), 3000);
    };

    // ─── REALIZAR TRANSFERENCIA ─────────────────────────────────
    const realizarTransferencia = () => {
        if (!transProducto || !transOrigenAlm || !transOrigenCont || !transDestinoAlm || !transDestinoCont || !transCantidad || !transFecha) {
            setAlert({ type: 'error', message: 'Complete todos los campos de la transferencia' });
            return;
        }

        const prod = productos.find(p => p.id === transProducto);
        if (!prod) return;

        const cant = parseInt(transCantidad);
        if (prod.stock < cant) {
            setAlert({ type: 'error', message: `Stock insuficiente. Disponible: ${prod.stock}` });
            return;
        }

        const origenAlm = almacenes.find(a => a.id === transOrigenAlm);
        const origenCont = contenedores.find(c => c.id === transOrigenCont);
        const destinoAlm = almacenes.find(a => a.id === transDestinoAlm);
        const destinoCont = contenedores.find(c => c.id === transDestinoCont);

        const nuevaTransferencia: Transferencia = {
            id: `TRANS-${String(movimientoCounter).padStart(6, '0')}`,
            fecha: transFecha,
            productoId: transProducto,
            productoNombre: prod.nombre,
            cantidad: cant,
            origenAlmacen: origenAlm?.nombre || transOrigenAlm,
            origenContenedor: origenCont?.nombre || transOrigenCont,
            destinoAlmacen: destinoAlm?.nombre || transDestinoAlm,
            destinoContenedor: destinoCont?.nombre || transDestinoCont
        };

        // Actualizar stock y ubicación del producto
        const nuevosProductos = productos.map(p =>
            p.id === transProducto
                ? { ...p, stock: p.stock - cant, almacenId: transDestinoAlm, contenedorId: transDestinoCont }
                : p
        );

        // Ajustes de salida y entrada
        const ajusteSalida: Ajuste = {
            id: `AJU-S-${String(movimientoCounter).padStart(6, '0')}`,
            fecha: transFecha,
            productoId: transProducto,
            productoNombre: prod.nombre,
            cantidad: cant,
            tipo: 'salida',
            motivo: `Transferencia desde ${origenAlm?.nombre || ''} - ${origenCont?.nombre || ''}`
        };

        const ajusteEntrada: Ajuste = {
            id: `AJU-E-${String(movimientoCounter + 1).padStart(6, '0')}`,
            fecha: transFecha,
            productoId: transProducto,
            productoNombre: prod.nombre,
            cantidad: cant,
            tipo: 'entrada',
            motivo: `Transferencia a ${destinoAlm?.nombre || ''} - ${destinoCont?.nombre || ''}`
        };

        const newCounter = movimientoCounter + 2;
        const nuevasTransferencias = [nuevaTransferencia, ...transferencias];
        const nuevosAjustes = [ajusteSalida, ajusteEntrada, ...ajustes];

        setTransferencias(nuevasTransferencias);
        setAjustes(nuevosAjustes);
        setProductos(nuevosProductos);
        setMovimientoCounter(newCounter);
        guardarDatos(compras, nuevasTransferencias, nuevosAjustes, newCounter);
        localStorage.setItem('productos_data', JSON.stringify(nuevosProductos));

        setTransCantidad('');
        setAlert({ type: 'success', message: `✅ Transferencia realizada: ${cant} ${prod.unidad || 'unidades'} de ${prod.nombre}` });
        setTimeout(() => setAlert(null), 3000);
    };

    // ─── COLUMNAS ───────────────────────────────────────────────
    const ajusteColumns: Column<Ajuste>[] = [
        { field: 'fecha', headerName: 'Fecha' },
        { field: 'productoNombre', headerName: 'Producto' },
        { field: 'cantidad', headerName: 'Cantidad', numeric: true },
        { field: 'tipo', headerName: 'Tipo', isStatusColumn: true },
        { field: 'motivo', headerName: 'Motivo' },
    ];

    // Contenedores filtrados por almacén
    const contenedoresOrigen = contenedores.filter(c => c.almacenId === transOrigenAlm);
    const contenedoresDestino = contenedores.filter(c => c.almacenId === transDestinoAlm);

    // ─── RENDER ─────────────────────────────────────────────────
    return (
        <Box>
            {/* Alertas */}
            {alert && (
                <Alert severity={alert.type} sx={{ mb: 2, borderRadius: 2, mx: 1 }} onClose={() => setAlert(null)}>
                    {alert.message}
                </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', lg: 'row' }, mb: 2 }}>
                {/* ═══════════════════════════════════════════════════
                    CARD IZQUIERDO: REGISTRAR COMPRA
                ═══════════════════════════════════════════════════ */}
                <Card
                    elevation={0}
                    sx={{
                        flex: 1,
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.04)",
                        bgcolor: "#f8f9fa",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        overflow: "hidden",
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                                <ShoppingCartIcon sx={{ fill: 'url(#iconGradientComp)', width: 24, height: 24 }} />
                                <svg width="0" height="0">
                                    <defs>
                                        <linearGradient id="iconGradientComp" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                            <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                Registrar Compra
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={2}>
                            <select
                                value={compraProducto}
                                onChange={(e) => setCompraProducto(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderRadius: '8px',
                                    padding: '10px 12px',
                                    fontSize: '0.9rem',
                                    color: '#444',
                                    background: '#f8f9fa',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <option value="">-- Seleccione Producto --</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>
                                ))}
                            </select>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="Fecha"
                                    value={compraFecha}
                                    onChange={(e) => setCompraFecha(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1, bgcolor: '#f8f9fa',
                                            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Cantidad"
                                    placeholder="0"
                                    value={compraCantidad}
                                    onChange={(e) => setCompraCantidad(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1, bgcolor: '#f8f9fa',
                                            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Costo Unitario"
                                    placeholder="0.00"
                                    value={compraCosto}
                                    onChange={(e) => setCompraCosto(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1, bgcolor: '#f8f9fa',
                                            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<SaveIcon />}
                                onClick={registrarCompra}
                                sx={{
                                    background: "linear-gradient(135deg, rgb(36, 236, 9), rgba(202, 183, 14, 0.9))",
                                    color: "#fff",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    py: 1,
                                    boxShadow: "0 4px 12px rgba(36, 236, 9, 0.3)",
                                    "&:hover": { boxShadow: "0 6px 16px rgba(36, 236, 9, 0.4)" }
                                }}
                            >
                                📥 Registrar Compra
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                {/* ═══════════════════════════════════════════════════
                    CARD DERECHO: TRANSFERENCIA
                ═══════════════════════════════════════════════════ */}
                <Card
                    elevation={0}
                    sx={{
                        flex: 1,
                        borderRadius: 3,
                        border: "1px solid rgba(0,0,0,0.04)",
                        bgcolor: "#f8f9fa",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                        overflow: "hidden",
                    }}
                >
                    <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                                <SwapHorizIcon sx={{ fill: 'url(#iconGradientTrans)', width: 24, height: 24 }} />
                                <svg width="0" height="0">
                                    <defs>
                                        <linearGradient id="iconGradientTrans" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                            <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                Transferencia
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={2}>
                            <select
                                value={transProducto}
                                onChange={(e) => setTransProducto(e.target.value)}
                                style={{
                                    width: '100%',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    borderRadius: '8px',
                                    padding: '10px 12px',
                                    fontSize: '0.9rem',
                                    color: '#444',
                                    background: '#f8f9fa',
                                    outline: 'none',
                                    fontFamily: 'inherit'
                                }}
                            >
                                <option value="">-- Seleccione Producto --</option>
                                {productos.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</option>
                                ))}
                            </select>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <select
                                    value={transOrigenAlm}
                                    onChange={(e) => { setTransOrigenAlm(e.target.value); setTransOrigenCont(''); }}
                                    style={{
                                        flex: 1,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        fontSize: '0.9rem',
                                        color: '#444',
                                        background: '#f8f9fa',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="">-- Origen Almacén --</option>
                                    {almacenes.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                                <select
                                    value={transOrigenCont}
                                    onChange={(e) => setTransOrigenCont(e.target.value)}
                                    style={{
                                        flex: 1,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        fontSize: '0.9rem',
                                        color: '#444',
                                        background: '#f8f9fa',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="">-- Origen Contenedor --</option>
                                    {contenedoresOrigen.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <select
                                    value={transDestinoAlm}
                                    onChange={(e) => { setTransDestinoAlm(e.target.value); setTransDestinoCont(''); }}
                                    style={{
                                        flex: 1,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        fontSize: '0.9rem',
                                        color: '#444',
                                        background: '#f8f9fa',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="">-- Destino Almacén --</option>
                                    {almacenes.map(a => (
                                        <option key={a.id} value={a.id}>{a.nombre}</option>
                                    ))}
                                </select>
                                <select
                                    value={transDestinoCont}
                                    onChange={(e) => setTransDestinoCont(e.target.value)}
                                    style={{
                                        flex: 1,
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '8px',
                                        padding: '10px 12px',
                                        fontSize: '0.9rem',
                                        color: '#444',
                                        background: '#f8f9fa',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    <option value="">-- Destino Contenedor --</option>
                                    {contenedoresDestino.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="number"
                                    label="Cantidad"
                                    placeholder="0"
                                    value={transCantidad}
                                    onChange={(e) => setTransCantidad(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1, bgcolor: '#f8f9fa',
                                            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
                                        }
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label="Fecha"
                                    value={transFecha}
                                    onChange={(e) => setTransFecha(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1, bgcolor: '#f8f9fa',
                                            '& fieldset': { borderColor: 'rgba(0,0,0,0.06)' },
                                        }
                                    }}
                                />
                            </Box>

                            <Button
                                variant="contained"
                                fullWidth
                                startIcon={<SwapHorizIcon />}
                                onClick={realizarTransferencia}
                                sx={{
                                    background: "linear-gradient(135deg, rgb(255, 238, 0), rgba(226, 64, 14, 0.9))",
                                    color: "#fff",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    py: 1,
                                    boxShadow: "0 4px 12px rgba(226, 64, 14, 0.3)",
                                    "&:hover": { boxShadow: "0 6px 16px rgba(226, 64, 14, 0.4)" }
                                }}
                            >
                                🔄 Transferir
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            {/* ═══════════════════════════════════════════════════
                CARD INFERIOR: HISTORIAL DE AJUSTES
            ═══════════════════════════════════════════════════ */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.04)",
                    bgcolor: "#f8f9fa",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    overflow: "hidden",
                    m: 1
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
                            <ReceiptLongIcon sx={{ fill: 'url(#iconGradientAjust)', width: 24, height: 24 }} />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="iconGradientAjust" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            Historial de Ajustes
                        </Typography>
                        <Chip
                            label={`${ajustes.length} registros`}
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

                    <CustomDataGridR<Ajuste>
                        rows={ajustes}
                        columns={ajusteColumns}
                        getRowId={(row) => row.id}
                        title="Movimientos de Inventario"
                        deleteConfig={{
                            baseUrl: `${API_URL}/ajustes`,
                            onSuccess: () => {
                                setAlert({ type: 'success', message: 'Ajuste eliminado' });
                                setTimeout(() => setAlert(null), 3000);
                            }
                        }}
                        getRowAvatar={(row) => row.tipo === 'entrada' ? '+' : '-'}
                    />
                </CardContent>
            </Card>
        </Box>
    );
}
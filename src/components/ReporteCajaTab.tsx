// src/components/ReporteCajaTab.tsx
import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, Typography, Box, Divider, Chip,
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CustomDataGridR, { type Column } from './CustomDataGridR';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── INTERFACES ───────────────────────────────────────────────
type TipoCliente =
    | 'Cliente por efectivo o estandar'
    | 'Cliente por descuento'
    | 'Cliente por transferencia'
    | 'Cliente cuenta casa'
    | 'Cliente por credito';

interface RegistroCaja {
    id: string;
    tipoCliente: TipoCliente;
    ci: string;
    telefono: string;
    montoPagado: number;
    fecha: string;
}

interface ReporteCajaTabProps {
    // Opcional: si quieres pasar registros desde el padre
    registrosExternos?: RegistroCaja[];
}

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────
export default function ReporteCajaTab({ registrosExternos }: ReporteCajaTabProps) {
    // Estados
    const [registros, setRegistros] = useState<RegistroCaja[]>([]);
    const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);

    // Cargar registros del localStorage o usar externos
    useEffect(() => {
        if (registrosExternos && registrosExternos.length > 0) {
            setRegistros(registrosExternos);
            return;
        }

        const saved = localStorage.getItem('reporte_caja_registros');
        if (saved) {
            try {
                setRegistros(JSON.parse(saved));
            } catch (e) {
                console.error('Error cargando registros de caja:', e);
            }
        }
    }, [registrosExternos]);

    // Guardar en localStorage
    const guardarRegistros = (nuevos: RegistroCaja[]) => {
        setRegistros(nuevos);
        localStorage.setItem('reporte_caja_registros', JSON.stringify(nuevos));
    };

    // ─── AGREGAR REGISTRO (helper para testing/demo) ─────────────
    const agregarRegistro = (registro: Omit<RegistroCaja, 'id' | 'fecha'>) => {
        const nuevo: RegistroCaja = {
            ...registro,
            id: `CAJA-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            fecha: new Date().toISOString().split('T')[0]
        };
        guardarRegistros([nuevo, ...registros]);
    };

    // ─── FORMATEAR VALOR SEGÚN TIPO DE CLIENTE ──────────────────
    const formatearCampo = (valor: string, tipoCliente: TipoCliente): string => {
        if (tipoCliente === 'Cliente por efectivo o estandar') {
            return '-';
        }
        return valor || '-';
    };

    // ─── FILTRAR POR FECHA ──────────────────────────────────────
    const registrosFiltrados = registros.filter(r => r.fecha === fechaFiltro);

    // ─── CALCULAR TOTAL DEL DÍA ─────────────────────────────────
    const totalDia = registrosFiltrados.reduce((acc, r) => acc + r.montoPagado, 0);

    // ─── COLUMNAS PARA CUSTOMDATAGRIDR ──────────────────────────
    const cajaColumns: Column<RegistroCaja>[] = [
        {
            field: 'tipoCliente',
            headerName: 'Tipo de Cliente',
            filterable: true
        },
        {
            field: 'ci',
            headerName: 'CI',
            filterable: true
        },
        {
            field: 'telefono',
            headerName: 'Telefono',
            filterable: true
        },
        {
            field: 'montoPagado',
            headerName: 'Monto Pagado',
            numeric: true,
            filterable: true
        },
    ];

    // ─── DATOS FORMATEADOS PARA LA TABLA ────────────────────────
    // Transformamos los datos para que los campos CI y Telefono muestren guion
    // cuando el tipo de cliente es "Cliente por efectivo o estandar"
    const datosFormateados = registrosFiltrados.map(r => ({
        ...r,
        ci: formatearCampo(r.ci, r.tipoCliente),
        telefono: formatearCampo(r.telefono, r.tipoCliente),
    }));

    // ─── RENDER ─────────────────────────────────────────────────
    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            {/* ═══════════════════════════════════════════════════
                CARD PRINCIPAL: REPORTE DE CAJA
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
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
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
                            <ReceiptLongIcon sx={{ fill: 'url(#iconGradientCaja)', width: 24, height: 24 }} />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="iconGradientCaja" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            Reporte de Caja
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Chip
                                label={`${registrosFiltrados.length} registros`}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(10, 83, 218, 0.1)',
                                    color: 'rgb(10, 83, 218)',
                                    fontWeight: 600,
                                    borderRadius: 2
                                }}
                            />
                            <Chip
                                label={`Fecha: ${fechaFiltro}`}
                                size="small"
                                sx={{
                                    bgcolor: 'rgba(10, 218, 20, 0.12)',
                                    color: 'rgb(10, 218, 20)',
                                    fontWeight: 600,
                                    borderRadius: 2
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    {/* Filtro de fecha */}
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                borderColor: 'rgba(0,0,0,0.06)',
                                bgcolor: '#fff'
                            }}
                        >
                            <CardContent sx={{ p: '8px 16px', '&:last-child': { pb: '8px' }, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" sx={{ color: '#888', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                                    Filtrar por fecha
                                </Typography>
                                <input
                                    type="date"
                                    value={fechaFiltro}
                                    onChange={(e) => setFechaFiltro(e.target.value)}
                                    style={{
                                        border: '1px solid rgba(0,0,0,0.06)',
                                        borderRadius: '8px',
                                        padding: '6px 12px',
                                        fontSize: '0.9rem',
                                        color: '#444',
                                        background: '#f8f9fa',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </Box>

                    {/* Tabla principal con CustomDataGridR */}
                    <CustomDataGridR<RegistroCaja>
                        rows={datosFormateados}
                        columns={cajaColumns}
                        getRowId={(row) => row.id}
                        title="Registros del Dia"
                        onEditRow={(row) => {
                            console.log('Editar registro:', row);
                        }}
                        deleteConfig={{
                            baseUrl: `${API_URL}/reporte-caja`,
                            onSuccess: () => {
                                console.log('Registro eliminado');
                            }
                        }}
                        getRowAvatar={(row) => {
                            const iniciales: Record<TipoCliente, string> = {
                                'Cliente por efectivo o estandar': 'E',
                                'Cliente por descuento': 'D',
                                'Cliente por transferencia': 'T',
                                'Cliente cuenta casa': 'C',
                                'Cliente por credito': 'R'
                            };
                            return iniciales[row.tipoCliente] || '?';
                        }}
                    />

                    {/* ═══════════════════════════════════════════════════
                        TABLA DE TOTALES DEL DIA
                    ═══════════════════════════════════════════════════ */}
                    <Box sx={{ mt: 3 }}>
                        <Card
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                borderColor: 'rgba(0,0,0,0.06)',
                                bgcolor: '#fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                                overflow: 'hidden'
                            }}
                        >
                            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{
                                            bgcolor: 'linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))',
                                            '& th': {
                                                background: 'linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))',
                                                color: 'white',
                                                fontWeight: 700,
                                                fontSize: '0.9rem',
                                                py: 1.5,
                                                border: 'none'
                                            }
                                        }}>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <TrendingUpIcon sx={{ fontSize: 20 }} />
                                                    Monto Total del Dia
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right" sx={{ pr: 3, fontSize: '1.1rem' }}>
                                                {totalDia.toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </TableContainer>
                        </Card>
                    </Box>

                    {/* Mensaje cuando no hay registros */}
                    {registrosFiltrados.length === 0 && (
                        <Box sx={{
                            textAlign: 'center',
                            py: 6,
                            mt: 2,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px dashed rgba(0,0,0,0.1)'
                        }}>
                            <ReceiptLongIcon sx={{ fontSize: 48, color: '#ddd', mb: 2 }} />
                            <Typography color="text.secondary" sx={{ fontWeight: 500 }}>
                                No hay registros para la fecha seleccionada
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                Seleccione otra fecha o agregue nuevos registros
                            </Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* ═══════════════════════════════════════════════════
                CARD DE RESUMEN POR TIPO DE CLIENTE
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
                            <TrendingUpIcon sx={{ fill: 'url(#iconGradientResumen)', width: 24, height: 24 }} />
                            <svg width="0" height="0">
                                <defs>
                                    <linearGradient id="iconGradientResumen" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="rgba(0, 89, 255, 0.84)" />
                                        <stop offset="100%" stopColor="rgba(230, 21, 118, 0.9)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            Resumen por Tipo de Cliente
                        </Typography>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        {([
                            'Cliente por efectivo o estandar',
                            'Cliente por descuento',
                            'Cliente por transferencia',
                            'Cliente cuenta casa',
                            'Cliente por credito'
                        ] as TipoCliente[]).map(tipo => {
                            const monto = registrosFiltrados
                                .filter(r => r.tipoCliente === tipo)
                                .reduce((acc, r) => acc + r.montoPagado, 0);
                            const cantidad = registrosFiltrados.filter(r => r.tipoCliente === tipo).length;

                            return (
                                <Card
                                    key={tipo}
                                    variant="outlined"
                                    sx={{
                                        flex: 1,
                                        minWidth: 180,
                                        borderRadius: 2,
                                        borderColor: 'rgba(0,0,0,0.06)',
                                        bgcolor: '#fff',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                            transform: 'translateY(-2px)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: '#888',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                fontSize: '0.65rem',
                                                letterSpacing: '0.05em',
                                                display: 'block',
                                                mb: 1
                                            }}
                                        >
                                            {tipo.replace('Cliente por ', '').replace('Cliente ', '')}
                                        </Typography>
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 800,
                                                background: 'linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))',
                                                backgroundClip: 'text',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            ${monto.toFixed(2)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#aaa', mt: 0.5, display: 'block' }}>
                                            {cantidad} {cantidad === 1 ? 'registro' : 'registros'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}
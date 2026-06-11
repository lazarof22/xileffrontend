import React from 'react'
import {
    Typography,
    Box,
    Button,
    Snackbar,
    Alert,
    Card
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomDataGrid from "../../components/CustomDataGridR";
import { useState, useEffect } from 'react';
import AddActivoDialog, { type ActivoFormData } from '../../components/AddActivoDialog';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Activos() {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [openCreateActivo, setOpenCreateActivo] = useState<boolean>(false);
    const [Activo, setActivo] = useState<ActivoFormData | null>(null);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    useEffect(() => {
        const fetchActivos = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/activofijo`);
                if (!response.ok) throw new Error('Error al cargar activos');
                const result = await response.json();

                const data = Array.isArray(result) ? result : result.data || [];

                const mappedData = data.map((p: any) => ({
                    id: p._id,
                    codigo: p.codigoActivo,
                    descripcion: p.descripcionActivo,
                    fechaCompra: p.fechaCompra,
                    movimiento: p.movimiento,
                    estado: p.estadoActivo, // Es ObjectId, probablemente necesites popularlo en backend
                    valor: p.valor,
                    ajusteValor: p.ajusteValor,
                    depreciacion: p.depreciacionAcumulada,
                    comprasActivos: p.compra,
                    estadoActivo: p.estadoActivo, // Duplicado para la columna "estado" numérica si aplica
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

        fetchActivos();
    }, [])

    // Handler para eliminar activo seleccionado
    const handleDelete = async () => {
        // Implementar según tu CustomDataGrid (necesitarás selección de filas)
    };

    return (
        <div>
            <Box
                sx={{
                    width: '100%',
                    height: 60,
                    background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
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
                            background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
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
                    <Button
                        variant="contained"
                        startIcon={<DeleteIcon />}
                        sx={{
                            ml: 1,
                            background: "#d32f2f",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": {
                                background: "#b71c1c",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                        onClick={handleDelete}
                    >
                        Eliminar
                    </Button>
                </Box>
            </Box>
            <AddActivoDialog
                open={openCreateActivo}
                onClose={() => setOpenCreateActivo(false)}
                onActivoCreado={(activo: ActivoFormData) => {
                    setSnackbarMessage('Activo creado exitosamente');
                    setSnackbarSeverity('success');
                    setOpenSnackbar(true);
                    setOpenCreateActivo(false);
                    // Refrescar la lista
                    // Opción 1: Agregar el nuevo activo al estado local
                    // setRows(prev => [...prev, { id: activo._id, ... }]);
                    // Opción 2: Volver a fetchear
                }}
            />

            {/* Tabla de activos */}
            <Card sx={{ width: '100%', p: 2 }}>
                <CustomDataGrid
                    title="Activos"
                    rows={rows}
                    loading={loading}
                    getRowId={(row) => row.id}
                    columns={[
                        { field: "codigo", headerName: "Código" },
                        { field: "descripcion", headerName: "Descripción" },
                        { field: "fechaCompra", headerName: "Fecha compra" },
                        { field: "movimiento", headerName: "Movimiento" },
                        { field: "estado", headerName: "Estado" },
                        { field: "valor", headerName: "Valor", numeric: true },
                        { field: "ajusteValor", headerName: "Ajuste valor", numeric: true },
                        { field: "depreciacion", headerName: "Depreciación", numeric: true },
                        { field: "comprasActivos", headerName: "Compras activos", numeric: true },
                        { field: "estadoActivo", headerName: "Estado", numeric: true },
                    ]}
                />
            </Card>

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
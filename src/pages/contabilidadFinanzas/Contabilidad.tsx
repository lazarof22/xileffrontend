import { Box, Button, Card, CardActions, CardContent, CircularProgress, Tab, Typography } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import CustomDataGrid from "../../components/CustomDataGridR";
import { useState } from "react";

export default function ContabilidadPage() {

    // ==================== ESTADOS ====================
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState("1");

    // ==================== HANDLERS TABS ====================
    const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            <Box
                sx={{
                    width: '100%',
                    height: 60,
                    background:
                        "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    alignContent: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                }}>
                <Typography variant="h5" sx={{ ml: 2, color: 'white' }}>
                    Contabilidad
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                            ml: 1,
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                    >
                        Importar Clasificador
                    </Button>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<PictureAsPdfIcon sx={{ fontSize: "medium" }} />}
                        sx={{
                            ml: 1,
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                            color: "#fff",
                            textTransform: "none",
                            fontWeight: 600,
                            boxShadow: "none",
                            "&:hover": {
                                background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                    >
                        Importar Elementos Gastos
                    </Button>
                </Box>
            </Box>
            <Box sx={{ width: '100%', px: 1 }}>
                <TabContext value={tabValue}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 2 }}>
                        <TabList onChange={handleTabChange}>
                            <Tab label="Diario General" value="1" />
                            <Tab label="Libro Mayor" value="2" />
                            <Tab label="Balance General" value="3" />
                            <Tab label="Estado de Resultados" value="4" />
                            <Tab label="Plan de Cuentas" value="5" />
                        </TabList>
                    </Box>

                    {/* TAB PRODUCTOS */}
                    <TabPanel value="1">
                        <Card sx={{ width: '100%' }}>
                            <CardActions>
                                <Box sx={{ mt: 1, mb: -2 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PictureAsPdfIcon sx={{ fontSize: "medium" }} />}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "none",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                            }
                                        }}
                                    >
                                        Nuevo Asiento
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PictureAsPdfIcon sx={{ fontSize: "medium" }} />}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "none",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                            }
                                        }}
                                    >
                                        Generar Mayor
                                    </Button>
                                </Box>
                            </CardActions>
                            <CardContent>
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <CustomDataGrid
                                        title="Productos"
                                        rows={rows}
                                        getRowId={(row) => row.id}
                                        columns={[
                                            { field: "codigo", headerName: "Código" },
                                            { field: "producto", headerName: "Producto" },
                                            { field: "categoria", headerName: "Categoría" },
                                            { field: "precioCompra", headerName: "Precio Compra", numeric: true },
                                            { field: "precioVenta", headerName: "Precio Venta", numeric: true },
                                            { field: "stock", headerName: "Stock", numeric: true },
                                            { field: "stockMinimo", headerName: "Stock Mínimo", numeric: true },
                                            { field: "estado", headerName: "Estado" },
                                        ]}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabPanel>

                    {/* TAB KARDEX */}
                    <TabPanel value="2">
                        <Card sx={{ width: '100%' }}>
                            <CardContent>
                                <CustomDataGrid
                                    title="Registro Kardex"
                                    rows={rows}
                                    getRowId={(row) => row.id}
                                    columns={[
                                        { field: "fecha", headerName: "Fecha" },
                                        { field: "producto", headerName: "Producto" },
                                        { field: "tipo", headerName: "Tipo" },
                                        { field: "cantidad", headerName: "Cantidad", numeric: true },
                                        { field: "motivo", headerName: "Motivo" },
                                        { field: "stockFinal", headerName: "Stock Final", numeric: true },
                                    ]}
                                />
                            </CardContent>
                        </Card>
                    </TabPanel>

                    {/* TAB PLAN DE CUENTAS */}
                    <TabPanel value="5">
                        <Card sx={{ width: '100%' }}>
                            <CardActions>
                                <Box sx={{ mt: 1, mb: -2 }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PictureAsPdfIcon sx={{ fontSize: "medium" }} />}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "none",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                            }
                                        }}
                                    >
                                        Nueva Cuenta
                                    </Button>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<PictureAsPdfIcon sx={{ fontSize: "medium" }} />}
                                        sx={{
                                            ml: 1,
                                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                                            color: "#fff",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            boxShadow: "none",
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(255,0,0,1), rgb(196, 45, 226))",
                                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                            }
                                        }}
                                    >
                                        Exportar
                                    </Button>
                                </Box>
                            </CardActions>
                            <CardContent>
                                {loading ? (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    <CustomDataGrid
                                        title="Plan de Cuentas"
                                        rows={rows}
                                        getRowId={(row) => row.id}
                                        columns={[
                                            { field: "codigo", headerName: "Código" },
                                            { field: "nombre", headerName: "Nombre" },
                                            { field: "tipo", headerName: "Tipo de Cuenta" },
                                            { field: "naturaleza", headerName: "Naturaleza"},
                                            { field: "estado", headerName: "Estado" },
                                        ]}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </TabPanel>
                </TabContext>
            </Box>
        </Box>
    );
}
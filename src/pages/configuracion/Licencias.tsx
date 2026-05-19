import { Box, Typography, Card, Snackbar, Alert, TextField, Button } from "@mui/material";
import CustomDataGrid from "../../components/CustomDataGrid";
import { useState } from 'react'
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";

interface Licencia {
    fecha_inicio: string,
    fecha_vencimiento: string,
    clave_activacion: string,
    accion: string,
}

export default function LicenciasPage() {
    const [rows, setRows] = useState<any[]>([]);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const [fechaInicio, setFechaInicio] = useState<string>('');
    const [fechaVencimiento, setFechaVencimiento] = useState<string>('');
    const [claveActivacion, setClaveActivacion] = useState<string>('');
    const [accion, setAccion] = useState<string>('');

    const [newLicencia, setNewLicencia] = useState<Licencia>({
        fecha_inicio: "",
        fecha_vencimiento: "",
        clave_activacion: "",
        accion: "",
    })

    const handleExportPDF = () => {
        //aqui va la funcion para exportar a pdf
    };

    const [errors, setErrors] = useState<Record<string, string>>({});

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
                    Licencias
                </Typography>
            </Box>
            <Card sx={{ width: '100%', p: 2 }}>
                <Box>
                    <CustomDataGrid
                        title="Estado de la Licencia"
                        rows={rows}
                        getRowId={(row) => row.id}
                        columns={[
                            { field: "estado", headerName: "Estado" },
                            { field: "fecha_vencimiento", headerName: "Fecha de Vencimiento" },
                            { field: "dias_restantes", headerName: "Dias Restantes" },
                        ]}
                    />
                </Box>
            </Card>

            <Card sx={{ width: '100%', p: 2 }}>
                <Typography variant="h6" sx={{ m: 1 }}>
                    Gestion de Licencia
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, }}>
                    <Box
                        component="form"
                        sx={{ '& .MuiTextField-root': { m: 1, width: '25ch', mx: '40px', my: '10px' } }}
                        noValidate
                        autoComplete="off"
                    >
                        <div style={{ "display": "flex" }}>
                            <Box>
                                <Typography sx={{ m: 1, mx: 10 }}>
                                    Fecha de Inicio
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label=""
                                    margin="normal"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={fechaInicio}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFechaInicio(e.target.value) }}
                                    error={!!errors.fechaInicio}
                                    helperText={errors.fechaInicio}
                                />
                            </Box>
                            <Box>
                                <Typography sx={{ m: 1, mx: 10 }}>
                                    Fecha de Vencimiento
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label=""
                                    margin="normal"
                                    slotProps={{ inputLabel: { shrink: true } }}
                                    value={fechaVencimiento}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFechaVencimiento(e.target.value) }}
                                    error={!!errors.fechaVencimiento}
                                    helperText={errors.fechaVencimiento}
                                />
                            </Box>

                        </div>
                        <br />
                        <div style={{ "display": "flex" }}>
                            <Box>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Clave de Activacion"
                                    margin="normal"
                                    value={claveActivacion}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setClaveActivacion(e.target.value) }}
                                    error={!!errors.nombre_cliente}
                                    helperText={errors.nombre_cliente}
                                />
                            </Box>
                            <Typography sx={{ m: 1, my: 2 }}>
                                Accion:
                            </Typography>
                            <select style={{ "height": "50px", "marginTop": "10px", "borderRadius": "5px", "border": "1px solid gray" }} onChange={(e) => { setAccion(e.target.value) }}>
                                <option value="Activado">Activar Licencia</option>
                                <option value="Renovado">Renovar Licencia</option>
                            </select>
                        </div>
                    </Box>
                </Box>
                <Button
                    variant="contained"
                    size="small"
                    startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                    sx={{
                        textTransform: 'none',
                        background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                        color: "#fff",
                        boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                        borderRadius: 1,
                        px: 2,
                        py: 0.8,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        "&:hover": {
                            background: "linear-gradient(135deg, rgba(10, 83, 218, 1), rgba(10, 218, 20, 1))",
                            boxShadow: "0 6px 16px rgba(9, 80, 212, 0.58)"
                        }
                    }}
                >
                    Generar Licencia
                </Button>

                <Button
                    variant="contained"
                    size="small"
                    startIcon={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
                    sx={{
                        textTransform: 'none',
                        background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(196, 45, 226, 0.9))",
                        boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                        color: '#ffffff',
                        borderRadius: 1,
                        px: 2,
                        py: 0.8,
                        mx: 3,
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        "&:hover": {
                            background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(226, 45, 187, 0.9))",
                            boxShadow: "0 4px 12px rgba(158, 6, 6, 0.62)"
                        }
                    }}
                    onClick={handleExportPDF}
                >
                    Exportar PDF
                </Button>
            </Card>

            <Card sx={{ width: '100%', p: 2 }}>
                <Box>
                    <CustomDataGrid
                        title="Historial de Licencias"
                        rows={rows}
                        getRowId={(row) => row.id}
                        columns={[
                            { field: "fecha_activacion", headerName: "Fecha Activacion" },
                            { field: "fecha_vencimiento", headerName: "Fecha Vencimiento" },
                            { field: "estado", headerName: "Estado" },
                            { field: "accion", headerName: "Accion" },
                        ]}
                    />
                </Box>
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
        </Box>
    );
}
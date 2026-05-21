import { Box, Typography, Card, Snackbar, Alert, TextField, Button, CardContent, CircularProgress, MenuItem } from '@mui/material';
import CustomDataGrid from "../../components/CustomDataGrid";
import { useState } from 'react'
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';

interface Licencia {
    fecha_inicio: string,
    fecha_vencimiento: string,
    clave_activacion: string,
    accion: string,
}

interface AccionesOption {
    value: string;
    label: string;
}

const ACCIONES: AccionesOption[] = [
    { value: 'Activar Licencia', label: 'Activar Licencia' },
    { value: 'Renovar Licencia', label: 'Renovar Licencia' }
];

export default function LicenciasPage() {
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const [fechaInicio, setFechaInicio] = useState<dayjs.Dayjs | null>(null);
    const [fechaVencimiento, setFechaVencimiento] = useState<dayjs.Dayjs | null>(null);
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box>
                {/* Header */}
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

                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%' }}>
                        <CardContent>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <CustomDataGrid
                                    title="Licencias Activas"
                                    rows={rows}
                                    getRowId={(row) => row.id}
                                    columns={[
                                        { field: "estado", headerName: "Estado" },
                                        { field: "fechaActivacion", headerName: "Fecha de Activación" },
                                        { field: "fechaVencimiento", headerName: "Fecha de Vencimiento" },
                                    ]}
                                />
                            )}
                        </CardContent>
                    </Card>
                </Box>

                {/* ═══════════════════════════════════════════════════════
                    FORMULARIO CON MOBILEDATEPICKER
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Typography variant="h6"
                            sx={{
                                m: 1, fontWeight: 600, background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent"
                            }}>
                            Gestión de Licencia
                        </Typography>

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, p: 2 }}>
                            {/* FECHA DE INICIO - MobileDatePicker */}
                            <Box sx={{ flex: '1 1 250px' }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Fecha de Inicio
                                </Typography>
                                <MobileDatePicker
                                    value={fechaInicio}
                                    onChange={(newValue) => {
                                        setFechaInicio(newValue);
                                        if (errors.fechaInicio) {
                                            setErrors(prev => ({ ...prev, fechaInicio: '' }));
                                        }
                                    }}
                                    format="DD/MM/YYYY"
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!errors.fechaInicio,
                                            helperText: errors.fechaInicio,
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

                            {/* FECHA DE VENCIMIENTO - MobileDatePicker */}
                            <Box sx={{ flex: '1 1 250px' }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Fecha de Vencimiento
                                </Typography>
                                <MobileDatePicker
                                    value={fechaVencimiento}
                                    onChange={(newValue) => {
                                        setFechaVencimiento(newValue);
                                        if (errors.fechaVencimiento) {
                                            setErrors(prev => ({ ...prev, fechaVencimiento: '' }));
                                        }
                                    }}
                                    format="DD/MM/YYYY"
                                    minDate={fechaInicio || undefined}
                                    slotProps={{
                                        textField: {
                                            fullWidth: true,
                                            error: !!errors.fechaVencimiento,
                                            helperText: errors.fechaVencimiento,
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

                            {/* CLAVE DE ACTIVACIÓN */}
                            <Box sx={{ flex: '1 1 250px' }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Clave de Activación
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="password"
                                    size="small"
                                    placeholder="Ingrese la clave"
                                    value={claveActivacion}
                                    onChange={(e) => {
                                        setClaveActivacion(e.target.value);
                                        if (errors.claveActivacion) {
                                            setErrors(prev => ({ ...prev, claveActivacion: '' }));
                                        }
                                    }}
                                    error={!!errors.claveActivacion}
                                    helperText={errors.claveActivacion}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            {/* ACCIÓN */}
                            <Box sx={{ flex: '1 1 200px' }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Acción
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={accion}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccion(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                    error={!!errors.accion}
                                    helperText={errors.accion}
                                    disabled={loading}
                                >
                                    {ACCIONES.map((tipo: AccionesOption) => (
                                        <MenuItem key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>
                        </Box>

                        {/* BOTONES */}
                        <Box sx={{ display: 'flex', gap: 2, mt: 2, px: 2, pb: 2 }}>
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
                                    px: 3,
                                    py: 0.8,
                                    fontSize: '0.85rem',
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
                                    px: 3,
                                    py: 0.8,
                                    fontSize: '0.85rem',
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
                        </Box>
                    </Card>
                </Box>

                {/* HISTORIAL */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Box>
                            <CustomDataGrid
                                title="Historial de Licencias"
                                rows={rows}
                                getRowId={(row) => row.id}
                                columns={[
                                    { field: "fecha_activacion", headerName: "Fecha Activación" },
                                    { field: "fecha_vencimiento", headerName: "Fecha Vencimiento" },
                                    { field: "estado", headerName: "Estado" },
                                    { field: "accion", headerName: "Acción" },
                                ]}
                            />
                        </Box>
                    </Card>
                </Box>

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
        </LocalizationProvider>
    );
}
import { Box, Typography, Card, Snackbar, Alert, TextField, Button, CardContent, CircularProgress, MenuItem, Avatar, IconButton, Paper } from '@mui/material';
import CustomDataGrid from "../../components/CustomDataGrid";
import { useState, useRef, useCallback, useEffect } from 'react'
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FilterListIcon from "@mui/icons-material/FilterList";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';
import BusinessIcon from '@mui/icons-material/Business';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from "@mui/icons-material/Delete";
import PersonIcon from '@mui/icons-material/Person';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import BackupIcon from '@mui/icons-material/Backup';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AddIcon from '@mui/icons-material/Add';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// ═══════════════════════════════════════════════════════
// CONFIGURACIÓN DE API
// ═══════════════════════════════════════════════════════
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers as Record<string, string> || {})
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
};

// ═══════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════
interface Licencia {
    _id?: string;
    clave_activacion: string;
    fecha_inicio: string;
    fecha_vencimiento: string;
    tipo: string;
    empresa: string;
    empresa_id: string;
    activa: boolean;
    revocada: boolean;
    dias_restantes: number;
    max_usuarios: number;
}

interface LicenciaRow {
    id: string;
    estado: string;
    fechaActivacion: string;
    fechaVencimiento: string;
    accion: string;
}

interface AccionesOption {
    value: string;
    label: string;
}

interface UsuarioBackend {
    _id: string;
    ci_empleado: string;
    nombre_empleado: string;
    correo_empleado: string;
    departamento: string;
    cargo: string;
    salario: number;
    rol: string;
    createdAt: string;
}

interface UsuarioRow {
    id: number;
    usuario: string;
    accion: string;
}

interface EmpresaData {
    _id?: string;
    nombre: string;
    eslogan: string;
    direccion: string;
    telefono: string;
    email: string;
    ruc_nit: string;
    ciudad: string;
    pais: string;
    logo?: string;
}

const ACCIONES: AccionesOption[] = [
    { value: 'Activar Licencia', label: 'Activar Licencia' },
    { value: 'Renovar Licencia', label: 'Renovar Licencia' }
];

const TIPOS_LICENCIA = [
    { value: 'trial', label: 'Trial' },
    { value: 'suscripcion_mensual', label: 'Suscripción Mensual' },
    { value: 'suscripcion_anual', label: 'Suscripción Anual' },
    { value: 'perpetua', label: 'Perpetua' }
];

export default function ConfiguracionPage() {
    // ═══════════════════════════════════════════════════════
    // ESTADOS GENERALES
    // ═══════════════════════════════════════════════════════
    const [loading, setLoading] = useState(false);

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    const showMessage = (message: string, severity: "success" | "error" = "success") => {
        setSnackbarMessage(message);
        setSnackbarSeverity(severity);
        setOpenSnackbar(true);
    };

    // ═══════════════════════════════════════════════════════
    // ESTADOS DATOS DE LA EMPRESA
    // ═══════════════════════════════════════════════════════
    const [datosEmpresa, setDatosEmpresa] = useState<EmpresaData>({
        nombre: "",
        eslogan: "",
        direccion: "",
        telefono: "",
        email: "",
        ruc_nit: "",
        ciudad: "",
        pais: ""
    });
    const [empresaId, setEmpresaId] = useState<string>("");

    // ═══════════════════════════════════════════════════════
    // ESTADOS LOGO
    // ═══════════════════════════════════════════════════════
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ═══════════════════════════════════════════════════════
    // ESTADOS USUARIOS
    // ═══════════════════════════════════════════════════════
    const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
    const [nuevoUsuario, setNuevoUsuario] = useState("");
    const [nuevaContrasena, setNuevaContrasena] = useState("");
    const [nuevoCorreo, setNuevoCorreo] = useState("");
    const [nuevoCI, setNuevoCI] = useState("");
    const [nuevoDepartamento, setNuevoDepartamento] = useState("");
    const [nuevoCargo, setNuevoCargo] = useState("");
    const [nuevoSalario, setNuevoSalario] = useState("");

    // ═══════════════════════════════════════════════════════
    // ESTADOS LICENCIAS
    // ═══════════════════════════════════════════════════════
    const [licenciasActivas, setLicenciasActivas] = useState<LicenciaRow[]>([]);
    const [historialLicencias, setHistorialLicencias] = useState<LicenciaRow[]>([]);
    const [fechaInicio, setFechaInicio] = useState<dayjs.Dayjs | null>(null);
    const [fechaVencimiento, setFechaVencimiento] = useState<dayjs.Dayjs | null>(null);
    const [claveActivacion, setClaveActivacion] = useState<string>('');
    const [accionLicencia, setAccionLicencia] = useState<string>('');
    const [tipoLicencia, setTipoLicencia] = useState<string>('suscripcion_mensual');
    const [maxUsuarios, setMaxUsuarios] = useState<number>(10);

    // ═══════════════════════════════════════════════════════
    // ESTADOS IMPORT/EXPORT
    // ═══════════════════════════════════════════════════════
    const [csvContent, setCsvContent] = useState<string>("");
    const [respaldoFile, setRespaldoFile] = useState<File | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});

    // ═══════════════════════════════════════════════════════
    // CARGA INICIAL
    // ═══════════════════════════════════════════════════════
    useEffect(() => {
        cargarEmpresa();
        cargarUsuarios();
        cargarLicencias();
    }, []);

    // ═══════════════════════════════════════════════════════
    // API: EMPRESA
    // ═══════════════════════════════════════════════════════
    const cargarEmpresa = async () => {
        try {
            setLoading(true);
            const data = await fetchWithAuth('/empresa');
            if (data) {
                setDatosEmpresa({
                    nombre: data.nombre || "",
                    eslogan: data.eslogan || "",
                    direccion: data.direccion || "",
                    telefono: data.telefono || "",
                    email: data.email || "",
                    ruc_nit: data.ruc_nit || "",
                    ciudad: data.ciudad || "",
                    pais: data.pais || ""
                });
                setEmpresaId(data._id || "");
                if (data.logo) setLogoPreview(data.logo);
            }
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const guardarEmpresa = async () => {
        try {
            setLoading(true);
            const body = {
                nombre: datosEmpresa.nombre,
                eslogan: datosEmpresa.eslogan,
                direccion: datosEmpresa.direccion,
                telefono: datosEmpresa.telefono,
                email: datosEmpresa.email,
                ruc_nit: datosEmpresa.ruc_nit,
                ciudad: datosEmpresa.ciudad,
                pais: datosEmpresa.pais
            };
            const data = await fetchWithAuth('/empresa', {
                method: 'PUT',
                body: JSON.stringify(body)
            });
            setEmpresaId(data._id);
            showMessage("Datos de la empresa guardados correctamente");
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeEmpresa = (campo: string, valor: string) => {
        setDatosEmpresa(prev => ({ ...prev, [campo]: valor }));
    };

    // ═══════════════════════════════════════════════════════
    // API: LOGO
    // ═══════════════════════════════════════════════════════
    const subirLogo = async (base64Logo: string) => {
        try {
            setLoading(true);
            const data = await fetchWithAuth('/empresa/logo', {
                method: 'POST',
                body: JSON.stringify({ logo: base64Logo })
            });
            setLogoPreview(data.logo);
            showMessage("Logo actualizado correctamente");
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processLogoFile(file);
        }
    };

    const processLogoFile = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setLogoPreview(base64);
            subirLogo(base64);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            processLogoFile(file);
        }
    }, []);

    const handleEliminarLogo = async () => {
        setLogoPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        // Actualizar empresa con logo vacío
        try {
            await fetchWithAuth('/empresa', {
                method: 'PUT',
                body: JSON.stringify({ logo: "" })
            });
            showMessage("Logo eliminado");
        } catch (error: any) {
            showMessage(error.message, "error");
        }
    };

    // ═══════════════════════════════════════════════════════
    // API: USUARIOS
    // ═══════════════════════════════════════════════════════
    const cargarUsuarios = async () => {
        try {
            const data: UsuarioBackend[] = await fetchWithAuth('/usuarios');
            const mapped = data.map((u, index) => ({
                id: index + 1,
                usuario: u.nombre_empleado.toUpperCase(),
                accion: u.rol
            }));
            setUsuarios(mapped);
        } catch (error: any) {
            showMessage(error.message, "error");
        }
    };

    const handleAgregarUsuario = async () => {
        if (!nuevoUsuario.trim() || !nuevaContrasena.trim()) {
            showMessage("Usuario y contraseña son requeridos", "error");
            return;
        }
        try {
            setLoading(true);
            await fetchWithAuth('/usuarios', {
                method: 'POST',
                body: JSON.stringify({
                    ci_empleado: nuevoCI || "00000000000",
                    nombre_empleado: nuevoUsuario,
                    correo_empleado: nuevoCorreo || `${nuevoUsuario.toLowerCase().replace(/\s/g, '')}@xilef.com`,
                    contraseña: nuevaContrasena,
                    departamento: nuevoDepartamento || "60d5f9f8e3b3c8b0f4e4d3a1",
                    cargo: nuevoCargo || "60d5f9f8e3b3c8b0f4e4d3a2",
                    salario: Number(nuevoSalario) || 2500,
                    rol: "empleado"
                })
            });
            setNuevoUsuario("");
            setNuevaContrasena("");
            setNuevoCorreo("");
            setNuevoCI("");
            setNuevoDepartamento("");
            setNuevoCargo("");
            setNuevoSalario("");
            await cargarUsuarios();
            showMessage("Usuario creado correctamente");
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEliminarUsuario = async (id: number) => {
        try {
            // Buscar el usuario por índice para obtener el _id real del backend
            // Nota: En producción deberías guardar el _id real en el estado
            showMessage("Funcionalidad de eliminar requiere ID real del backend");
        } catch (error: any) {
            showMessage(error.message, "error");
        }
    };

    // ═══════════════════════════════════════════════════════
    // API: LICENCIAS
    // ═══════════════════════════════════════════════════════
    const cargarLicencias = async () => {
        try {
            const data: Licencia[] = await fetchWithAuth('/licencia');
            const mapped = data.map(l => ({
                id: l._id || l.clave_activacion,
                estado: l.activa ? (l.revocada ? "Revocada" : "Activa") : "Inactiva",
                fechaActivacion: new Date(l.fecha_inicio).toLocaleDateString('es-ES'),
                fechaVencimiento: new Date(l.fecha_vencimiento).toLocaleDateString('es-ES'),
                accion: l.tipo
            }));
            setLicenciasActivas(mapped.filter(l => l.estado === "Activa"));
            setHistorialLicencias(mapped);
        } catch (error: any) {
            showMessage(error.message, "error");
        }
    };

    const generarLicencia = async () => {
        if (!fechaInicio || !fechaVencimiento) {
            showMessage("Las fechas son requeridas", "error");
            return;
        }
        try {
            setLoading(true);
            const data = await fetchWithAuth('/licencia/generar', {
                method: 'POST',
                body: JSON.stringify({
                    empresa_nombre: datosEmpresa.nombre,
                    empresa_id: datosEmpresa.ruc_nit,
                    tipo: tipoLicencia,
                    duracion_dias: fechaVencimiento.diff(fechaInicio, 'day'),
                    max_usuarios: maxUsuarios,
                    fecha_inicio: fechaInicio.format('YYYY-MM-DD'),
                    fecha_vencimiento: fechaVencimiento.format('YYYY-MM-DD')
                })
            });
            setClaveActivacion(data.licencia.clave);
            await cargarLicencias();
            showMessage(`Licencia generada: ${data.licencia.clave}`);
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const activarLicencia = async () => {
        if (!claveActivacion) {
            showMessage("Ingrese la clave de activación", "error");
            return;
        }
        try {
            setLoading(true);
            await fetchWithAuth('/licencia/activar', {
                method: 'POST',
                body: JSON.stringify({
                    clave_activacion: claveActivacion,
                    empresa_nombre: datosEmpresa.nombre,
                    empresa_id: datosEmpresa.ruc_nit
                })
            });
            await cargarLicencias();
            showMessage("Licencia activada correctamente");
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const renovarLicencia = async () => {
        if (!claveActivacion) {
            showMessage("Ingrese la clave de activación", "error");
            return;
        }
        try {
            setLoading(true);
            await fetchWithAuth('/licencia/renovar', {
                method: 'POST',
                body: JSON.stringify({
                    clave_activacion: claveActivacion,
                    fecha_vencimiento: fechaVencimiento?.format('YYYY-MM-DD')
                })
            });
            await cargarLicencias();
            showMessage("Licencia renovada correctamente");
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleAccionLicencia = () => {
        if (accionLicencia === 'Activar Licencia') {
            activarLicencia();
        } else if (accionLicencia === 'Renovar Licencia') {
            renovarLicencia();
        }
    };

    // ═══════════════════════════════════════════════════════
    // API: IMPORT/EXPORT
    // ═══════════════════════════════════════════════════════
    const descargarPlantilla = () => {
        const csv = "codigo,nombre,precio_compra,precio_venta,stock_inicial,stock_minimo\n";
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_productos.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const importarCSV = async () => {
        if (!csvContent) {
            showMessage("Seleccione un archivo CSV primero", "error");
            return;
        }
        try {
            setLoading(true);
            const data = await fetchWithAuth('/importar/csv', {
                method: 'POST',
                body: JSON.stringify({ csv: csvContent })
            });
            showMessage(`Importados: ${data.imported}, Errores: ${data.errors.length}`);
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const exportarRespaldo = async () => {
        try {
            setLoading(true);
            const data = await fetchWithAuth('/respaldo/exportar');
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `respaldo_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
            showMessage("Respaldo exportado correctamente");
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const importarRespaldo = async () => {
        if (!respaldoFile) {
            showMessage("Seleccione un archivo de respaldo", "error");
            return;
        }
        try {
            setLoading(true);
            const content = await respaldoFile.text();
            const jsonData = JSON.parse(content);
            const data = await fetchWithAuth('/respaldo/importar', {
                method: 'POST',
                body: JSON.stringify(jsonData)
            });
            showMessage(`Importados: ${data.imported}, Errores: ${data.errors.length}`);
        } catch (error: any) {
            showMessage(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleCSVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setCsvContent(event.target?.result as string);
            };
            reader.readAsText(file);
        }
    };

    const handleRespaldoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setRespaldoFile(file);
    };

    // ═══════════════════════════════════════════════════════
    // EXPORTAR PDF
    // ═══════════════════════════════════════════════════════
    const handleExportPDF = () => {
        const doc = new jsPDF();
        const title = "Historial de Licencias";

        doc.setFontSize(16);
        doc.text(title, 14, 15);

        const columns = [
            { field: "estado", headerName: "Estado" },
            { field: "fechaActivacion", headerName: "Fecha Activación" },
            { field: "fechaVencimiento", headerName: "Fecha Vencimiento" },
            { field: "accion", headerName: "Acción" }
        ];

        const tableColumn = columns.map((col) => col.headerName);
        const tableRows = historialLicencias.map((row) =>
            columns.map((col) => String(row[col.field as keyof LicenciaRow]))
        );

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20,
        });

        doc.save(`${title}.pdf`);
    };

    // ═══════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════
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
                        Configuración
                    </Typography>
                </Box>

                {/* ═══════════════════════════════════════════════════════
                    SECCIÓN: DATOS DE LA EMPRESA
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <BusinessIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                Datos de la Empresa
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                            px: 1
                        }}>
                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Nombre
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Nombre"
                                    value={datosEmpresa.nombre}
                                    onChange={(e) => handleChangeEmpresa('nombre', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Email
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="email"
                                    placeholder="Email"
                                    value={datosEmpresa.email}
                                    onChange={(e) => handleChangeEmpresa('email', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Eslogan
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Eslogan"
                                    value={datosEmpresa.eslogan}
                                    onChange={(e) => handleChangeEmpresa('eslogan', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    RUC/NIT
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="RUC/NIT"
                                    value={datosEmpresa.ruc_nit}
                                    onChange={(e) => handleChangeEmpresa('ruc_nit', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Dirección
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Dirección"
                                    value={datosEmpresa.direccion}
                                    onChange={(e) => handleChangeEmpresa('direccion', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Ciudad
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Ciudad"
                                    value={datosEmpresa.ciudad}
                                    onChange={(e) => handleChangeEmpresa('ciudad', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Teléfono
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Teléfono"
                                    value={datosEmpresa.telefono}
                                    onChange={(e) => handleChangeEmpresa('telefono', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 45%', minWidth: 280 }}>
                                <Typography sx={{ mb: 0.8, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    País
                                </Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="País"
                                    value={datosEmpresa.pais}
                                    onChange={(e) => handleChangeEmpresa('pais', e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<SaveIcon sx={{ fontSize: 18 }} />}
                                onClick={guardarEmpresa}
                                disabled={loading}
                                sx={{
                                    textTransform: 'none',
                                    background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                    color: "#fff",
                                    boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                    borderRadius: 1,
                                    px: 4,
                                    py: 1,
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    "&:hover": {
                                        background: "linear-gradient(135deg, rgba(10, 83, 218, 1), rgba(10, 218, 20, 1))",
                                        boxShadow: "0 6px 16px rgba(9, 80, 212, 0.58)"
                                    }
                                }}
                            >
                                Guardar
                            </Button>
                        </Box>
                    </Card>
                </Box>

                {/* ═══════════════════════════════════════════════════════
                    SECCIÓN: LOGO - DROP ZONE MODERNO
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <ImageIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                Logo
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                            {/* Preview del logo */}
                            <Box
                                sx={{
                                    width: 120,
                                    height: 120,
                                    border: '2px dashed #ccc',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#fafafa',
                                    overflow: 'hidden'
                                }}
                            >
                                {logoPreview ? (
                                    <Avatar
                                        src={logoPreview}
                                        variant="rounded"
                                        sx={{ width: '100%', height: '100%' }}
                                    />
                                ) : (
                                    <Typography sx={{ color: '#999', fontSize: '0.85rem' }}>
                                        Sin logo
                                    </Typography>
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 250 }}>
                                {/* Drop Zone Moderno */}
                                <Paper
                                    component="label"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    sx={{
                                        p: 3,
                                        border: `2px dashed ${isDragging ? '#1976d2' : '#ccc'}`,
                                        borderRadius: 2,
                                        backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.05)' : '#fafafa',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            borderColor: '#1976d2',
                                            backgroundColor: 'rgba(25, 118, 210, 0.05)',
                                        }
                                    }}
                                >
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleLogoSelect}
                                    />
                                    <UploadIcon sx={{ fontSize: 40, color: isDragging ? '#1976d2' : '#999', mb: 1 }} />
                                    <Typography sx={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
                                        {isDragging ? 'Suelta la imagen aquí' : 'Arrastra y suelta tu logo aquí'}
                                    </Typography>
                                    <Typography sx={{ color: '#999', fontSize: '0.8rem', mt: 0.5 }}>
                                        o haz clic para seleccionar un archivo
                                    </Typography>
                                </Paper>

                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                                    onClick={handleEliminarLogo}
                                    disabled={loading}
                                    sx={{
                                        textTransform: 'none',
                                        background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(226, 45, 187, 0.9))",
                                        color: '#fff',
                                        width: 'fit-content',
                                        fontSize: '0.85rem',
                                        "&:hover": {
                                            backgroundColor: '#b71c1c'
                                        }
                                    }}
                                >
                                    Eliminar
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                </Box>

                {/* ═══════════════════════════════════════════════════════
                    SECCIÓN: USUARIOS
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PersonIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Usuarios
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    backgroundColor: '#e3f2fd',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: '#1976d2' }}>
                                    {usuarios.length}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {/* Formulario nuevo usuario */}
                            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Nuevo Usuario
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Nombre completo"
                                        value={nuevoUsuario}
                                        onChange={(e) => setNuevoUsuario(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#f8f9fa',
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        type="email"
                                        placeholder="Correo electrónico"
                                        value={nuevoCorreo}
                                        onChange={(e) => setNuevoCorreo(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#f8f9fa',
                                            }
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Cédula de identidad"
                                        value={nuevoCI}
                                        onChange={(e) => setNuevoCI(e.target.value)}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                backgroundColor: '#f8f9fa',
                                            }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="password"
                                            placeholder="Contraseña"
                                            value={nuevaContrasena}
                                            onChange={(e) => setNuevaContrasena(e.target.value)}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    backgroundColor: '#f8f9fa',
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                            onClick={handleAgregarUsuario}
                                            disabled={loading}
                                            sx={{
                                                textTransform: 'none',
                                                background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                                color: "#fff",
                                                boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                                borderRadius: 1,
                                                px: 2.5,
                                                py: 0.9,
                                                fontSize: '0.85rem',
                                                minWidth: 'unset',
                                                fontWeight: 500,
                                                "&:hover": {
                                                    background: "linear-gradient(135deg, rgba(10, 83, 218, 1), rgba(10, 218, 20, 1))",
                                                    boxShadow: "0 6px 16px rgba(9, 80, 212, 0.58)"
                                                }
                                            }}
                                        >
                                            Agregar
                                        </Button>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Tabla de usuarios */}
                            <Box sx={{ flex: '1 1 300px', minWidth: 280 }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#444', fontSize: '0.9rem' }}>
                                    Usuarios
                                </Typography>
                                <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden' }}>
                                    {/* Header */}
                                    <Box sx={{
                                        display: 'flex',
                                        backgroundColor: '#f5f5f5',
                                        px: 2,
                                        py: 1,
                                        borderBottom: '1px solid #e0e0e0'
                                    }}>
                                        <Typography sx={{ flex: 1, fontWeight: 600, color: '#444', fontSize: '0.85rem' }}>
                                            Usuario
                                        </Typography>
                                        <Typography sx={{ flex: 1, fontWeight: 600, color: '#444', fontSize: '0.85rem', textAlign: 'right' }}>
                                            Acción
                                        </Typography>
                                    </Box>
                                    {/* Rows */}
                                    {usuarios.map((u) => (
                                        <Box
                                            key={u.id}
                                            sx={{
                                                display: 'flex',
                                                px: 2,
                                                py: 1.2,
                                                borderBottom: '1px solid #f0f0f0',
                                                alignItems: 'center',
                                                '&:last-child': { borderBottom: 'none' }
                                            }}
                                        >
                                            <Typography sx={{ flex: 1, color: '#444', fontSize: '0.85rem' }}>
                                                {u.usuario}
                                            </Typography>
                                            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
                                                <Typography sx={{ color: '#666', fontSize: '0.85rem' }}>
                                                    {u.accion}
                                                </Typography>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleEliminarUsuario(u.id)}
                                                    sx={{ color: '#d32f2f', p: 0.5 }}
                                                >
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Card>
                </Box>

                {/* ═══════════════════════════════════════════════════════
                    SECCIÓN: IMPORTACIÓN/EXPORTACIÓN
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                            <UploadIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                Importación/Exportación
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {/* Plantilla */}
                            <Box sx={{
                                flex: '1 1 250px',
                                minWidth: 200,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: '#fafafa'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                    <ImageIcon sx={{ color: '#666', fontSize: 18 }} />
                                    <Typography sx={{ fontWeight: 600, color: '#444', fontSize: '0.9rem' }}>
                                        Plantilla
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                                    onClick={descargarPlantilla}
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
                                    Descargar
                                </Button>
                            </Box>

                            {/* Importar CSV */}
                            <Box sx={{
                                flex: '1 1 250px',
                                minWidth: 200,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: '#fafafa'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                    <UploadIcon sx={{ color: '#666', fontSize: 18 }} />
                                    <Typography sx={{ fontWeight: 600, color: '#444', fontSize: '0.9rem' }}>
                                        Importar CSV
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        size="small"
                                        sx={{
                                            textTransform: 'none',
                                            borderColor: '#ccc',
                                            color: '#444',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        Seleccionar archivo
                                        <input type="file" accept=".csv" hidden onChange={handleCSVSelect} />
                                    </Button>
                                    <Typography sx={{ color: '#666', fontSize: '0.8rem' }}>
                                        {csvContent ? "Archivo cargado" : "Sin archivos seleccionados"}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<UploadIcon sx={{ fontSize: 16 }} />}
                                    onClick={importarCSV}
                                    disabled={loading || !csvContent}
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
                                    Importar
                                </Button>
                            </Box>

                            {/* Respaldo */}
                            <Box sx={{
                                flex: '1 1 250px',
                                minWidth: 200,
                                border: '1px solid #e0e0e0',
                                borderRadius: 2,
                                p: 2,
                                backgroundColor: '#fafafa'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.5 }}>
                                    <BackupIcon sx={{ color: '#666', fontSize: 18 }} />
                                    <Typography sx={{ fontWeight: 600, color: '#444', fontSize: '0.9rem' }}>
                                        Respaldo
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
                                        onClick={exportarRespaldo}
                                        disabled={loading}
                                        sx={{
                                            textTransform: 'none',
                                            background: "linear-gradient(135deg, rgba(10, 83, 218, 0.9), rgba(10, 218, 20, 0.9))",
                                            color: "#fff",
                                            boxShadow: "0 4px 19px rgba(0,0,0,0.2)",
                                            borderRadius: 1,
                                            px: 2,
                                            py: 0.8,
                                            fontSize: '0.85rem',
                                            fontWeight: 500,
                                            "&:hover": {
                                                background: "linear-gradient(135deg, rgba(10, 83, 218, 1), rgba(10, 218, 20, 1))",
                                                boxShadow: "0 6px 16px rgba(9, 80, 212, 0.58)"
                                            }
                                        }}
                                    >
                                        Exportar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        component="label"
                                        size="small"
                                        sx={{
                                            textTransform: 'none',
                                            borderColor: '#ccc',
                                            color: '#444',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        Importar
                                        <input type="file" accept=".json" hidden onChange={handleRespaldoSelect} />
                                    </Button>
                                </Box>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<WarningAmberIcon sx={{ fontSize: 16 }} />}
                                    onClick={importarRespaldo}
                                    disabled={loading || !respaldoFile}
                                    sx={{
                                        textTransform: 'none',
                                        background: "linear-gradient(135deg, rgba(255,0,0,0.9), rgba(226, 45, 187, 0.9))",
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        "&:hover": {
                                            background: '#b71c1c'
                                        }
                                    }}
                                >
                                    Resetear
                                </Button>
                            </Box>
                        </Box>
                    </Card>
                </Box>

                {/* ═══════════════════════════════════════════════════════
                    LICENCIAS ACTIVAS
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <FilterListIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 600,
                                        background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent"
                                    }}
                                >
                                    Licencias Activas
                                </Typography>
                            </Box>
                            {loading ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                                    <CircularProgress />
                                </Box>
                            ) : (
                                <CustomDataGrid
                                    rows={licenciasActivas}
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
                    FORMULARIO GESTIÓN DE LICENCIA
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FilterListIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                Gestión de Licencia
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, p: 2 }}>
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
                                                    backgroundColor: '#f8f9fa',
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Box>

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
                                                    backgroundColor: '#f8f9fa',
                                                }
                                            }
                                        }
                                    }}
                                />
                            </Box>

                            <Box sx={{ flex: '1 1 250px' }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Tipo de Licencia
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={tipoLicencia}
                                    onChange={(e) => setTipoLicencia(e.target.value)}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                >
                                    {TIPOS_LICENCIA.map((tipo) => (
                                        <MenuItem key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Box>

                            <Box sx={{ flex: '1 1 250px' }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Máx. Usuarios
                                </Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={maxUsuarios}
                                    onChange={(e) => setMaxUsuarios(Number(e.target.value))}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#f8f9fa',
                                        }
                                    }}
                                />
                            </Box>

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

                            <Box sx={{ flex: '1 1 200px' }}>
                                <Typography sx={{ mb: 1, fontWeight: 500, color: '#666' }}>
                                    Acción
                                </Typography>
                                <TextField
                                    select
                                    fullWidth
                                    size="small"
                                    value={accionLicencia}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccionLicencia(e.target.value)}
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

                        <Box sx={{ display: 'flex', gap: 2, mt: 2, px: 2, pb: 2 }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                                onClick={generarLicencia}
                                disabled={loading}
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
                                startIcon={<FilterListIcon sx={{ fontSize: 16 }} />}
                                onClick={handleAccionLicencia}
                                disabled={loading || !accionLicencia}
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
                                {accionLicencia || 'Ejecutar Acción'}
                            </Button>

                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
                                onClick={handleExportPDF}
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
                            >
                                Exportar PDF
                            </Button>
                        </Box>
                    </Card>
                </Box>

                {/* ═══════════════════════════════════════════════════════
                    HISTORIAL DE LICENCIAS
                    ═══════════════════════════════════════════════════════ */}
                <Box sx={{ m: 2 }}>
                    <Card sx={{ width: '100%', p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PictureAsPdfIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    background: "linear-gradient(135deg, rgba(0, 89, 255, 0.84), rgba(230, 21, 118, 0.9))",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent"
                                }}
                            >
                                Historial de Licencias
                            </Typography>
                        </Box>
                        <Box>
                            <CustomDataGrid
                                rows={historialLicencias}
                                getRowId={(row) => row.id}
                                columns={[
                                    { field: "fechaActivacion", headerName: "Fecha Activación" },
                                    { field: "fechaVencimiento", headerName: "Fecha Vencimiento" },
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
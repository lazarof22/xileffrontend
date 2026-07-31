// src/components/FinanzasTabCobros.tsx
import {
  Box,
  Button,
  Typography,
  Card,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import CustomDataGrid from "./CustomDataGridR";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

interface PlanCobro {
  _id: string;
  codigo: string;
  cliente: { _id: string; nombre: string };
  concepto: { _id: string; nombre: string };
  monto: number;
  moneda: { _id: string; nombre: string };
  fechaProgramada: string;
  descripcion?: string;
  referencia?: string;
  estado: "programado" | "confirmado" | "cobrado" | "cancelado";
  createdAt: string;
}

interface ResumenPlanCobro {
  totalPlanes: number;
  montoTotal: number;
  porEstado: {
    programado: number;
    confirmado: number;
    cobrado: number;
    cancelado: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ESTADOS_PLAN_COBRO = [
  { value: "programado", label: "Programado", color: "info" as const },
  { value: "confirmado", label: "Confirmado", color: "primary" as const },
  { value: "cobrado", label: "Cobrado", color: "success" as const },
  { value: "cancelado", label: "Cancelado", color: "error" as const },
];

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabCobros() {
  const [planesCobro, setPlanesCobro] = useState<PlanCobro[]>([]);
  const [resumenPlanCobro, setResumenPlanCobro] = useState<ResumenPlanCobro | null>(null);
  const [planCobroForm, setPlanCobroForm] = useState({
    codigo: "",
    cliente: "",
    concepto: "",
    monto: 0,
    moneda: "",
    fechaProgramada: "",
    descripcion: "",
    referencia: "",
  });

  const [openCobrarDialog, setOpenCobrarDialog] = useState(false);
  const [cobrarForm, setCobrarForm] = useState({
    planId: "",
    monto: 0,
    fechaCobro: new Date().toISOString().split("T")[0],
    referencia: "",
    metodoPago: "transferencia",
  });

  const [openReprogramarDialog, setOpenReprogramarDialog] = useState(false);
  const [reprogramarForm, setReprogramarForm] = useState({
    planId: "",
    nuevaFecha: "",
  });

  const [selectedPlanCobroId, setSelectedPlanCobroId] = useState<string>("");

  // Snackbar
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // ═══════════════════════════════════════════════════════════════════
  // FETCH HELPERS
  // ═══════════════════════════════════════════════════════════════════

  const fetchPlanesCobro = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-cobros`);
      if (!res.ok) throw new Error("Error al cargar planes de cobro");
      const data = await res.json();
      setPlanesCobro(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchResumenPlanCobro = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-cobros/resumen`);
      if (!res.ok) throw new Error("Error al cargar resumen de cobros");
      const data = await res.json();
      setResumenPlanCobro(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreatePlanCobro = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-cobros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(planCobroForm),
      });
      if (!res.ok) throw new Error("Error al crear plan de cobro");
      showSnackbar("Plan de cobro registrado correctamente");
      setPlanCobroForm({
        codigo: "",
        cliente: "",
        concepto: "",
        monto: 0,
        moneda: "",
        fechaProgramada: "",
        descripcion: "",
        referencia: "",
      });
      fetchPlanesCobro();
      fetchResumenPlanCobro();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeletePlanCobro = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-cobros/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar plan de cobro");
      showSnackbar("Plan de cobro eliminado");
      fetchPlanesCobro();
      fetchResumenPlanCobro();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleConfirmarPlanCobro = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-cobros/${id}/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al confirmar plan de cobro");
      showSnackbar("Plan de cobro confirmado");
      fetchPlanesCobro();
      fetchResumenPlanCobro();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCobrarPlanCobro = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-cobros/${selectedPlanCobroId}/cobrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cobrarForm),
      });
      if (!res.ok) throw new Error("Error al registrar cobro");
      showSnackbar("Cobro registrado correctamente");
      setOpenCobrarDialog(false);
      setCobrarForm({
        planId: "",
        monto: 0,
        fechaCobro: new Date().toISOString().split("T")[0],
        referencia: "",
        metodoPago: "transferencia",
      });
      setSelectedPlanCobroId("");
      fetchPlanesCobro();
      fetchResumenPlanCobro();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleReprogramarPlanCobro = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/planificacion-cobros/${selectedPlanCobroId}/reprogramar?fecha=${reprogramarForm.nuevaFecha}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );
      if (!res.ok) throw new Error("Error al reprogramar plan de cobro");
      showSnackbar("Plan de cobro reprogramado");
      setOpenReprogramarDialog(false);
      setReprogramarForm({ planId: "", nuevaFecha: "" });
      setSelectedPlanCobroId("");
      fetchPlanesCobro();
      fetchResumenPlanCobro();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCancelarPlanCobro = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-cobros/${id}/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al cancelar plan de cobro");
      showSnackbar("Plan de cobro cancelado");
      fetchPlanesCobro();
      fetchResumenPlanCobro();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    fetchPlanesCobro();
    fetchResumenPlanCobro();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ m: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ═══════════════════════════════════════════════════════
          BOX 1: NUEVA OBLIGACIÓN DE COBRO
         ═══════════════════════════════════════════════════════ */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 980,
          p: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 3,
            background: HEADER_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📝 Nueva Obligación de Cobro
        </Typography>

        {/* Dos columnas: Cliente y total a cobrar */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Cliente / Tercero"
            placeholder="Nombre"
            value={planCobroForm.cliente}
            onChange={(e) => setPlanCobroForm({ ...planCobroForm, cliente: e.target.value })}
            sx={{ flex: 2, maxWidth: 300 }}
            size="small"
          />
          <TextField
            label="Total a Cobrar (CUP)"
            type="number"
            placeholder="0.00"
            value={planCobroForm.monto || ""}
            onChange={(e) => setPlanCobroForm({ ...planCobroForm, monto: Number(e.target.value) })}
            sx={{ flex: 1.5, gap: 2, minWidth: 140, marginLeft: 12 }}
            size="small"
          />
        </Box>

        {/* Dos columnas: Fecha y Descripción */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1.5, width: 200, marginTop: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: "#888",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                mb: 0.5,
                display: "block",
              }}
            >
              Fecha Vencimiento
            </Typography>
            <TextField
              type="date"
              value={planCobroForm.fechaProgramada}
              onChange={(e) => setPlanCobroForm({ ...planCobroForm, fechaProgramada: e.target.value })}
              fullWidth
              size="small"
              sx={{ width: 300 }}
            />
          </Box>
          <TextField
            label="Descripción"
            placeholder="Factura / Servicio"
            value={planCobroForm.descripcion}
            onChange={(e) => setPlanCobroForm({ ...planCobroForm, descripcion: e.target.value })}
            sx={{ flex: 2, minWidth: 180, marginTop: 5, gap: 2 }}
            size="small"
          />
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleCreatePlanCobro}
          sx={{
            marginTop: 2,
            textTransform: "none",
            fontWeight: 600,
            height: 40,
            background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
            color: "#fff",
            boxShadow: "none",
            "&:hover": {
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            },
          }}
        >
          Crear
        </Button>
      </Box>

      {/* ═══════════════════════════════════════════════════════
          BOX 2: RESUMEN COBROS
         ═══════════════════════════════════════════════════════ */}
      <Box
        sx={{
          width: "100%",
          maxWidth: 980,
          p: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "1px 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
            background: HEADER_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          📊 Resumen Cobros
        </Typography>

        {/* Botones Generar, Excel, PDF */}
        <Box sx={{ display: "flex", gap: 1, mb: 3 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<PlayArrowIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, rgb(0, 200, 150), rgb(0, 150, 100))",
              color: "#fff",
              boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
            }}
          >
            Generar
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<TableChartIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(0, 114, 255))",
              color: "#fff",
              boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
            }}
          >
            Excel
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<PictureAsPdfIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, rgb(220, 20, 60), rgb(142, 45, 226))",
              color: "#fff",
              boxShadow: "none",
              "&:hover": { boxShadow: "0 4px 12px rgba(0,0,0,0.2)" },
            }}
          >
            PDF
          </Button>
        </Box>

        {/* Resumen numérico */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Total Planes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenPlanCobro?.totalPlanes || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Monto Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              ${resumenPlanCobro?.montoTotal?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Programados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenPlanCobro?.porEstado?.programado || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Confirmados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenPlanCobro?.porEstado?.confirmado || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Cobrados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenPlanCobro?.porEstado?.cobrado || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          TABLA: OBLIGACIONES ACTIVAS
         ═══════════════════════════════════════════════════════════ */}
      <Card sx={{ p: 2, borderRadius: 2 }}>
        <CustomDataGrid
          title={`Obligaciones Activas ${planesCobro.length > 0 ? `(${planesCobro.length})` : ""}`}
          rows={planesCobro}
          getRowId={(row: any) => row._id}
          columns={[
            {
              field: "cliente",
              headerName: "Tercero",
              flex: 1.5,
              renderCell: (params: any) => params.value?.nombre || params.value || "-",
            },
            {
              field: "descripcion",
              headerName: "Descripción",
              flex: 2,
            },
            {
              field: "monto",
              headerName: "Total",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => (
                <Typography fontWeight={600}>${params.value?.toFixed(2)}</Typography>
              ),
            },
            {
              field: "pagado",
              headerName: "Pagado",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => {
                const row = params.row;
                const pagado = row.estado === "cobrado" ? row.monto : 0;
                return (
                  <Typography fontWeight={600} color={pagado > 0 ? "success.main" : "text.secondary"}>
                    ${pagado.toFixed(2)}
                  </Typography>
                );
              },
            },
            {
              field: "pendiente",
              headerName: "Pendiente",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => {
                const row = params.row;
                const pendiente =
                  row.estado === "cobrado" || row.estado === "cancelado" ? 0 : row.monto;
                return (
                  <Typography fontWeight={600} color={pendiente > 0 ? "warning.main" : "text.secondary"}>
                    ${pendiente.toFixed(2)}
                  </Typography>
                );
              },
            },
            {
              field: "fechaProgramada",
              headerName: "Vencimiento",
              flex: 1,
              renderCell: (params: any) =>
                new Date(params.value).toLocaleDateString("es-ES"),
            },
            {
              field: "estado",
              headerName: "Estado",
              flex: 0.8,
              renderCell: (params: any) => {
                const estado = ESTADOS_PLAN_COBRO.find((e) => e.value === params.value);
                return (
                  <Chip
                    label={estado?.label || params.value}
                    size="small"
                    color={estado?.color || "default"}
                  />
                );
              },
            },
            {
              field: "acciones",
              headerName: "Acción",
              flex: 1.8,
              sortable: false,
              renderCell: (params: any) => {
                const row = params.row;
                return (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {row.estado === "programado" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                        onClick={() => handleConfirmarPlanCobro(row._id)}
                      >
                        Confirmar
                      </Button>
                    )}
                    {(row.estado === "programado" || row.estado === "confirmado") && (
                      <>
                        <Button
                          size="small"
                          variant="outlined"
                          color="success"
                          sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                          onClick={() => {
                            setSelectedPlanCobroId(row._id);
                            setCobrarForm({
                              ...cobrarForm,
                              planId: row._id,
                              monto: row.monto,
                            });
                            setOpenCobrarDialog(true);
                          }}
                        >
                          Cobrar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                          onClick={() => {
                            setSelectedPlanCobroId(row._id);
                            setReprogramarForm({
                              ...reprogramarForm,
                              planId: row._id,
                            });
                            setOpenReprogramarDialog(true);
                          }}
                        >
                          Reprog.
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                          onClick={() => handleCancelarPlanCobro(row._id)}
                        >
                          Cancelar
                        </Button>
                      </>
                    )}
                  </Box>
                );
              },
            },
          ]}
          deleteConfig={{
            enabled: true,
            onDelete: handleDeletePlanCobro,
            confirmMessage: "¿Eliminar esta obligación de cobro?",
          }}
        />
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          DIÁLOGOS
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── Diálogo: Registrar Cobro ───────────────────────────────── */}
      <Dialog open={openCobrarDialog} onClose={() => setOpenCobrarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Cobro</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Monto Cobrado"
            type="number"
            value={cobrarForm.monto || ""}
            onChange={(e) => setCobrarForm({ ...cobrarForm, monto: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Fecha de Cobro"
            type="date"
            value={cobrarForm.fechaCobro}
            onChange={(e) => setCobrarForm({ ...cobrarForm, fechaCobro: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Referencia"
            placeholder="Nro transferencia, factura..."
            value={cobrarForm.referencia}
            onChange={(e) => setCobrarForm({ ...cobrarForm, referencia: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Método de Pago</InputLabel>
            <Select
              value={cobrarForm.metodoPago}
              onChange={(e) => setCobrarForm({ ...cobrarForm, metodoPago: e.target.value })}
              label="Método de Pago"
            >
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCobrarDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCobrarPlanCobro}
            variant="contained"
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Registrar Cobro
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Diálogo: Reprogramar Fecha ───────────────────────────── */}
      <Dialog open={openReprogramarDialog} onClose={() => setOpenReprogramarDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reprogramar Fecha de Cobro</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
            Selecciona la nueva fecha programada para el cobro.
          </Typography>
          <TextField
            label="Nueva Fecha"
            type="date"
            value={reprogramarForm.nuevaFecha}
            onChange={(e) => setReprogramarForm({ ...reprogramarForm, nuevaFecha: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReprogramarDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleReprogramarPlanCobro}
            variant="contained"
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Reprogramar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={snackbarSeverity} variant="filled" onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
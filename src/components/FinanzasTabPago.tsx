// src/components/FinanzasTabPago.tsx
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

interface PlanPago {
  _id: string;
  codigo: string;
  proveedor: { _id: string; nombre: string };
  cuentaPagar?: { _id: string; codigo: string };
  montoProgramado: number;
  montoPagado: number;
  saldoProgramado: number;
  fechaProgramada: string;
  fechaEjecucion?: string;
  cuentaBancaria?: string;
  estado: "programado" | "confirmado" | "ejecutado" | "cancelado" | "reprogramado";
  metodoPago: string;
  prioridad: number;
  observaciones?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ResumenPlanPago {
  porEstado: {
    _id: string;
    cantidad: number;
    totalProgramado: number;
    totalPagado: number;
    saldoPendiente: number;
  }[];
  totalGeneral: {
    totalProgramado: number;
    totalPagado: number;
    saldoPendiente: number;
    cantidad: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ESTADOS_PAGO = [
  { value: "programado", label: "Programado", color: "info" as const },
  { value: "confirmado", label: "Confirmado", color: "primary" as const },
  { value: "ejecutado", label: "Ejecutado", color: "success" as const },
  { value: "reprogramado", label: "Reprogramado", color: "warning" as const },
  { value: "cancelado", label: "Cancelado", color: "error" as const },
];

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabPago() {
  const [planesPago, setPlanesPago] = useState<PlanPago[]>([]);
  const [resumenPago, setResumenPago] = useState<ResumenPlanPago | null>(null);
  const [pagoForm, setPagoForm] = useState({
    codigo: "",
    proveedor: "",
    montoProgramado: 0,
    fechaProgramada: "",
    cuentaBancaria: "",
    metodoPago: "transferencia",
    prioridad: 1,
    observaciones: "",
  });

  const [openEjecutarDialog, setOpenEjecutarDialog] = useState(false);
  const [ejecutarForm, setEjecutarForm] = useState({
    monto: 0,
    metodoPago: "transferencia",
    referencia: "",
    fechaEjecucion: new Date().toISOString().split("T")[0],
  });

  const [openReprogramarDialog, setOpenReprogramarDialog] = useState(false);
  const [reprogramarForm, setReprogramarForm] = useState({
    nuevaFecha: "",
  });

  const [selectedPlanPagoId, setSelectedPlanPagoId] = useState<string>("");

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

  const fetchPlanesPago = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-pagos`);
      if (!res.ok) throw new Error("Error al cargar planes de pago");
      const data = await res.json();
      setPlanesPago(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchResumenPago = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-pagos/resumen`);
      if (!res.ok) throw new Error("Error al cargar resumen de pagos");
      const data = await res.json();
      setResumenPago(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreatePlanPago = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pagoForm),
      });
      if (!res.ok) throw new Error("Error al crear plan de pago");
      showSnackbar("Plan de pago registrado correctamente");
      setPagoForm({
        codigo: "",
        proveedor: "",
        montoProgramado: 0,
        fechaProgramada: "",
        cuentaBancaria: "",
        metodoPago: "transferencia",
        prioridad: 1,
        observaciones: "",
      });
      fetchPlanesPago();
      fetchResumenPago();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeletePlanPago = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-pagos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar plan de pago");
      showSnackbar("Plan de pago eliminado");
      fetchPlanesPago();
      fetchResumenPago();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleConfirmarPlanPago = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-pagos/${id}/confirmar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al confirmar plan de pago");
      showSnackbar("Plan de pago confirmado");
      fetchPlanesPago();
      fetchResumenPago();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleEjecutarPlanPago = async () => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-pagos/${selectedPlanPagoId}/ejecutar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ejecutarForm),
      });
      if (!res.ok) throw new Error("Error al ejecutar pago");
      showSnackbar("Pago ejecutado correctamente");
      setOpenEjecutarDialog(false);
      setEjecutarForm({
        monto: 0,
        metodoPago: "transferencia",
        referencia: "",
        fechaEjecucion: new Date().toISOString().split("T")[0],
      });
      setSelectedPlanPagoId("");
      fetchPlanesPago();
      fetchResumenPago();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleReprogramarPlanPago = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/planificacion-pagos/${selectedPlanPagoId}/reprogramar`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nuevaFecha: reprogramarForm.nuevaFecha }),
        }
      );
      if (!res.ok) throw new Error("Error al reprogramar plan de pago");
      showSnackbar("Plan de pago reprogramado");
      setOpenReprogramarDialog(false);
      setReprogramarForm({ nuevaFecha: "" });
      setSelectedPlanPagoId("");
      fetchPlanesPago();
      fetchResumenPago();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCancelarPlanPago = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/planificacion-pagos/${id}/cancelar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Error al cancelar plan de pago");
      showSnackbar("Plan de pago cancelado");
      fetchPlanesPago();
      fetchResumenPago();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    fetchPlanesPago();
    fetchResumenPago();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ m: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ═══════════════════════════════════════════════════════
          BOX 1: NUEVA OBLIGACIÓN DE PAGO
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
          📝 Nueva Obligación de Pago
        </Typography>

        {/* Fila 1: Proveedor y Total */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Proveedor / Tercero"
            placeholder="Nombre"
            value={pagoForm.proveedor}
            onChange={(e) => setPagoForm({ ...pagoForm, proveedor: e.target.value })}
            sx={{ flex: 2, maxWidth: 300 }}
            size="small"
          />
          <TextField
            label="Total a Pagar (CUP)"
            type="number"
            placeholder="0.00"
            value={pagoForm.montoProgramado || ""}
            onChange={(e) => setPagoForm({ ...pagoForm, montoProgramado: Number(e.target.value) })}
            sx={{ flex: 1.5, minWidth: 140 }}
            size="small"
          />
        </Box>

        {/* Fila 2: Fecha y Descripción */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "flex-end" }}>
          <Box sx={{ flex: 1.5, maxWidth: 300 }}>
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
              value={pagoForm.fechaProgramada}
              onChange={(e) => setPagoForm({ ...pagoForm, fechaProgramada: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
          <TextField
            label="Descripción"
            placeholder="Factura / Servicio"
            value={pagoForm.observaciones}
            onChange={(e) => setPagoForm({ ...pagoForm, observaciones: e.target.value })}
            sx={{ flex: 2, minWidth: 180 }}
            size="small"
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreatePlanPago}
            sx={{
              height: 40,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, rgb(220, 20, 60), rgb(200, 50, 50))",
              color: "#fff",
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg, rgb(200, 20, 60), rgb(180, 40, 40))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              },
            }}
          >
            Crear
          </Button>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════
          BOX 2: RESUMEN PAGOS
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
          📊 Resumen Pagos
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
              {resumenPago?.totalGeneral?.cantidad || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Monto Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              ${resumenPago?.totalGeneral?.totalProgramado?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Programados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenPago?.porEstado?.find((e) => e._id === "programado")?.cantidad || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Confirmados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenPago?.porEstado?.find((e) => e._id === "confirmado")?.cantidad || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Ejecutados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenPago?.porEstado?.find((e) => e._id === "ejecutado")?.cantidad || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Pendiente por Pagar
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              ${resumenPago?.totalGeneral?.saldoPendiente?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          TABLA: OBLIGACIONES ACTIVAS
         ═══════════════════════════════════════════════════════════ */}
      <Card sx={{ p: 2, borderRadius: 2 }}>
        <CustomDataGrid
          title={`Obligaciones Activas ${planesPago.length > 0 ? `(${planesPago.length})` : ""}`}
          rows={planesPago}
          getRowId={(row: any) => row._id}
          columns={[
            {
              field: "proveedor",
              headerName: "Tercero",
              flex: 1.5,
              renderCell: (params: any) => params.value?.nombre || params.value || "-",
            },
            {
              field: "observaciones",
              headerName: "Descripción",
              flex: 2,
              renderCell: (params: any) => params.value || "-",
            },
            {
              field: "montoProgramado",
              headerName: "Total",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => (
                <Typography fontWeight={600}>${params.value?.toFixed(2)}</Typography>
              ),
            },
            {
              field: "montoPagado",
              headerName: "Pagado",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => (
                <Typography fontWeight={600} color={params.value > 0 ? "success.main" : "text.secondary"}>
                  ${params.value?.toFixed(2)}
                </Typography>
              ),
            },
            {
              field: "saldoProgramado",
              headerName: "Pendiente",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => (
                <Typography fontWeight={600} color={params.value > 0 ? "warning.main" : "text.secondary"}>
                  ${params.value?.toFixed(2)}
                </Typography>
              ),
            },
            {
              field: "fechaProgramada",
              headerName: "Vencimiento",
              flex: 1,
              renderCell: (params: any) => new Date(params.value).toLocaleDateString("es-ES"),
            },
            {
              field: "estado",
              headerName: "Estado",
              flex: 0.8,
              renderCell: (params: any) => {
                const estado = ESTADOS_PAGO.find((e) => e.value === params.value);
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
                        onClick={() => handleConfirmarPlanPago(row._id)}
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
                            setSelectedPlanPagoId(row._id);
                            setEjecutarForm({
                              ...ejecutarForm,
                              monto: row.saldoProgramado,
                            });
                            setOpenEjecutarDialog(true);
                          }}
                        >
                          Ejecutar
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="warning"
                          sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                          onClick={() => {
                            setSelectedPlanPagoId(row._id);
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
                          onClick={() => handleCancelarPlanPago(row._id)}
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
            onDelete: handleDeletePlanPago,
            confirmMessage: "¿Eliminar esta obligación de pago?",
          }}
        />
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          DIÁLOGOS
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── Diálogo: Ejecutar Pago ───────────────────────────────── */}
      <Dialog open={openEjecutarDialog} onClose={() => setOpenEjecutarDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Ejecutar Pago</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Monto a Pagar"
            type="number"
            value={ejecutarForm.monto || ""}
            onChange={(e) => setEjecutarForm({ ...ejecutarForm, monto: Number(e.target.value) })}
            fullWidth
            helperText="No puede exceder el saldo pendiente ni ser ≤ 0"
          />
          <FormControl fullWidth>
            <InputLabel>Método de Pago</InputLabel>
            <Select
              value={ejecutarForm.metodoPago}
              onChange={(e) => setEjecutarForm({ ...ejecutarForm, metodoPago: e.target.value })}
              label="Método de Pago"
            >
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Referencia"
            placeholder="Nro transferencia, factura..."
            value={ejecutarForm.referencia}
            onChange={(e) => setEjecutarForm({ ...ejecutarForm, referencia: e.target.value })}
            fullWidth
          />
          <TextField
            label="Fecha de Ejecución"
            type="date"
            value={ejecutarForm.fechaEjecucion}
            onChange={(e) => setEjecutarForm({ ...ejecutarForm, fechaEjecucion: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEjecutarDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleEjecutarPlanPago}
            variant="contained"
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Ejecutar Pago
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Diálogo: Reprogramar Fecha ───────────────────────────── */}
      <Dialog open={openReprogramarDialog} onClose={() => setOpenReprogramarDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reprogramar Fecha de Pago</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
            Selecciona la nueva fecha programada para el pago.
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
            onClick={handleReprogramarPlanPago}
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
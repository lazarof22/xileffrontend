// src/components/FinanzasTabCredito.tsx
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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CustomDataGrid from "./CustomDataGridR";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

interface Credito {
  _id: string;
  codigo: string;
  banco: { _id: string; nombreBanco: string };
  tipo: "capital_trabajo" | "inversion";
  montoSolicitado: number;
  montoDesembolsado?: number;
  tasaInteres: number;
  plazoMeses: number;
  fechaSolicitud: string;
  fechaDesembolso?: string;
  estado: "solicitado" | "aprobado" | "desembolsado" | "en_pago" | "pagado" | "vencido" | "castigado";
  metodoAmortizacion: "frances" | "aleman";
  periodicidadCuota: "mensual" | "trimestral" | "semestral" | "anual";
  garantia?: string;
  saldoPendiente?: number;
  createdAt: string;
}

interface ResumenCredito {
  totalCreditos: number;
  montoTotalSolicitado: number;
  montoTotalDesembolsado: number;
  saldoPendiente: number;
  porEstado: Record<string, number>;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ESTADOS_CREDITO = [
  { value: "solicitado", label: "Solicitado", color: "info" as const },
  { value: "aprobado", label: "Aprobado", color: "primary" as const },
  { value: "desembolsado", label: "Desembolsado", color: "secondary" as const },
  { value: "en_pago", label: "En Pago", color: "warning" as const },
  { value: "pagado", label: "Pagado", color: "success" as const },
  { value: "vencido", label: "Vencido", color: "error" as const },
  { value: "castigado", label: "Castigado", color: "default" as const },
];

const TIPOS_CREDITO = [
  { value: "capital_trabajo", label: "Capital de Trabajo" },
  { value: "inversion", label: "Inversión" },
];

const METODOS_AMORTIZACION = [
  { value: "frances", label: "Francés (cuota fija)" },
  { value: "aleman", label: "Alemán (amortización constante)" },
];

const PERIODICIDAD = [
  { value: "mensual", label: "Mensual" },
  { value: "trimestral", label: "Trimestral" },
  { value: "semestral", label: "Semestral" },
  { value: "anual", label: "Anual" },
];

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabCredito() {
  const [creditos, setCreditos] = useState<Credito[]>([]);
  const [resumen, setResumen] = useState<ResumenCredito | null>(null);

  const [creditoForm, setCreditoForm] = useState({
    codigo: "",
    banco: "",
    tipo: "capital_trabajo" as "capital_trabajo" | "inversion",
    montoSolicitado: 0,
    tasaInteres: 6,
    plazoMeses: 12,
    fechaSolicitud: new Date().toISOString().split("T")[0],
    fechaDesembolso: "",
    metodoAmortizacion: "frances" as "frances" | "aleman",
    periodicidadCuota: "mensual" as "mensual" | "trimestral" | "semestral" | "anual",
    garantia: "",
  });

  const [selectedCreditoId, setSelectedCreditoId] = useState<string>("");
  const [openAmortizacionDialog, setOpenAmortizacionDialog] = useState(false);
  const [amortizacion, setAmortizacion] = useState<any>(null);

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

  const fetchCreditos = async () => {
    try {
      const res = await fetch(`${API_BASE}/credito`);
      if (!res.ok) throw new Error("Error al cargar créditos");
      const data = await res.json();
      setCreditos(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchResumen = async () => {
    try {
      const res = await fetch(`${API_BASE}/credito/resumen`);
      if (!res.ok) throw new Error("Error al cargar resumen");
      const data = await res.json();
      setResumen(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateCredito = async () => {
    try {
      const res = await fetch(`${API_BASE}/credito`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creditoForm),
      });
      if (!res.ok) throw new Error("Error al registrar crédito");
      showSnackbar("Crédito registrado correctamente");
      setCreditoForm({
        codigo: "",
        banco: "",
        tipo: "capital_trabajo",
        montoSolicitado: 0,
        tasaInteres: 6,
        plazoMeses: 12,
        fechaSolicitud: new Date().toISOString().split("T")[0],
        fechaDesembolso: "",
        metodoAmortizacion: "frances",
        periodicidadCuota: "mensual",
        garantia: "",
      });
      fetchCreditos();
      fetchResumen();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteCredito = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/credito/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar crédito");
      showSnackbar("Crédito eliminado");
      fetchCreditos();
      fetchResumen();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleAprobar = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/credito/${id}/aprobar`, { method: "POST" });
      if (!res.ok) throw new Error("Error al aprobar crédito");
      showSnackbar("Crédito aprobado");
      fetchCreditos();
      fetchResumen();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDesembolsar = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/credito/${id}/desembolsar`, { method: "POST" });
      if (!res.ok) throw new Error("Error al desembolsar crédito");
      showSnackbar("Crédito desembolsado");
      fetchCreditos();
      fetchResumen();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCastigar = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/credito/${id}/castigar`, { method: "POST" });
      if (!res.ok) throw new Error("Error al castigar crédito");
      showSnackbar("Crédito castigado");
      fetchCreditos();
      fetchResumen();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchAmortizacion = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/credito/${id}/amortizacion`);
      if (!res.ok) throw new Error("Error al cargar amortización");
      const data = await res.json();
      setAmortizacion(data);
      setSelectedCreditoId(id);
      setOpenAmortizacionDialog(true);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    fetchCreditos();
    fetchResumen();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ m: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ═══════════════════════════════════════════════════════
          BOX 1: SOLICITAR / REGISTRAR CRÉDITO
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
          📝 Solicitar / Registrar Crédito
        </Typography>

        {/* Fila 1: Banco, Monto, Tasa, Plazo, Fecha Desembolso */}
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
          <TextField
            label="Banco"
            placeholder="Ej: BPA"
            value={creditoForm.banco}
            onChange={(e) => setCreditoForm({ ...creditoForm, banco: e.target.value })}
            sx={{ flex: "1 1 140px", minWidth: 140 }}
            size="small"
          />
          <TextField
            label="Monto (CUP)"
            type="number"
            placeholder="0.00"
            value={creditoForm.montoSolicitado || ""}
            onChange={(e) => setCreditoForm({ ...creditoForm, montoSolicitado: Number(e.target.value) })}
            sx={{ flex: "1 1 140px", minWidth: 140 }}
            size="small"
          />
          <TextField
            label="Tasa de interés (% anual)"
            type="number"
            value={creditoForm.tasaInteres || ""}
            onChange={(e) => setCreditoForm({ ...creditoForm, tasaInteres: Number(e.target.value) })}
            sx={{ flex: "1 1 140px", minWidth: 140 }}
            size="small"
          />
          <TextField
            label="Plazo (meses)"
            type="number"
            value={creditoForm.plazoMeses || ""}
            onChange={(e) => setCreditoForm({ ...creditoForm, plazoMeses: Number(e.target.value) })}
            sx={{ flex: "1 1 120px", minWidth: 120 }}
            size="small"
          />
          <Box sx={{ flex: "1 1 160px", minWidth: 160 }}>
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
              Fecha Desembolso
            </Typography>
            <TextField
              type="date"
              value={creditoForm.fechaDesembolso}
              onChange={(e) => setCreditoForm({ ...creditoForm, fechaDesembolso: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreateCredito}
            sx={{
              height: 40,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              },
            }}
          >
            Crear Crédito
          </Button>
        </Box>

        {/* Fila 2: Tipo, Método, Periodicidad, Código, Garantía */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ flex: "1 1 160px", minWidth: 160 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={creditoForm.tipo}
              onChange={(e) => setCreditoForm({ ...creditoForm, tipo: e.target.value as any })}
              label="Tipo"
            >
              {TIPOS_CREDITO.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flex: "1 1 180px", minWidth: 180 }}>
            <InputLabel>Método Amortización</InputLabel>
            <Select
              value={creditoForm.metodoAmortizacion}
              onChange={(e) => setCreditoForm({ ...creditoForm, metodoAmortizacion: e.target.value as any })}
              label="Método Amortización"
            >
              {METODOS_AMORTIZACION.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ flex: "1 1 140px", minWidth: 140 }}>
            <InputLabel>Periodicidad</InputLabel>
            <Select
              value={creditoForm.periodicidadCuota}
              onChange={(e) => setCreditoForm({ ...creditoForm, periodicidadCuota: e.target.value as any })}
              label="Periodicidad"
            >
              {PERIODICIDAD.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Código"
            placeholder="CR-2024-001"
            value={creditoForm.codigo}
            onChange={(e) => setCreditoForm({ ...creditoForm, codigo: e.target.value })}
            sx={{ flex: "1 1 140px", minWidth: 140 }}
            size="small"
          />
          <TextField
            label="Garantía"
            placeholder="Descripción..."
            value={creditoForm.garantia}
            onChange={(e) => setCreditoForm({ ...creditoForm, garantia: e.target.value })}
            sx={{ flex: "2 1 200px", minWidth: 200 }}
            size="small"
          />
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════
          BOX 2: RESUMEN CRÉDITOS
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
          📊 Resumen Créditos
        </Typography>

        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Total Créditos
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumen?.totalCreditos || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Monto Solicitado
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              ${resumen?.montoTotalSolicitado?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Desembolsado
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              ${resumen?.montoTotalDesembolsado?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Saldo Pendiente
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              ${resumen?.saldoPendiente?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              En Pago
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumen?.porEstado?.en_pago || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          TABLA: CRÉDITOS ACTIVOS
         ═══════════════════════════════════════════════════════════ */}
      <Card sx={{ p: 2, borderRadius: 2 }}>
        <CustomDataGrid
          title={`Créditos Activos ${creditos.length > 0 ? `(${creditos.length})` : ""}`}
          rows={creditos}
          getRowId={(row: any) => row._id}
          columns={[
            { field: "codigo", headerName: "Código", flex: 1 },
            {
              field: "banco",
              headerName: "Banco",
              flex: 1.5,
              renderCell: (params: any) => params.value?.nombreBanco || params.value || "-",
            },
            {
              field: "tipo",
              headerName: "Tipo",
              flex: 1,
              renderCell: (params: any) => (
                <Chip
                  label={TIPOS_CREDITO.find((t) => t.value === params.value)?.label || params.value}
                  size="small"
                  color={params.value === "capital_trabajo" ? "primary" : "secondary"}
                />
              ),
            },
            {
              field: "montoSolicitado",
              headerName: "Monto",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => (
                <Typography fontWeight={600}>${params.value?.toFixed(2)}</Typography>
              ),
            },
            {
              field: "tasaInteres",
              headerName: "Tasa %",
              flex: 0.8,
              renderCell: (params: any) => <Typography>{params.value}%</Typography>,
            },
            {
              field: "plazoMeses",
              headerName: "Plazo",
              flex: 0.8,
              renderCell: (params: any) => <Typography>{params.value} meses</Typography>,
            },
            {
              field: "estado",
              headerName: "Estado",
              flex: 1,
              renderCell: (params: any) => {
                const estado = ESTADOS_CREDITO.find((e) => e.value === params.value);
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
              field: "fechaDesembolso",
              headerName: "Desembolso",
              flex: 1,
              renderCell: (params: any) =>
                params.value ? new Date(params.value).toLocaleDateString("es-ES") : "-",
            },
            {
              field: "acciones",
              headerName: "Acción",
              flex: 2.5,
              sortable: false,
              renderCell: (params: any) => {
                const row = params.row;
                return (
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                    {row.estado === "solicitado" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                        onClick={() => handleAprobar(row._id)}
                      >
                        Aprobar
                      </Button>
                    )}
                    {row.estado === "aprobado" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                        onClick={() => handleDesembolsar(row._id)}
                      >
                        Desembolsar
                      </Button>
                    )}
                    {(row.estado === "desembolsado" || row.estado === "en_pago") && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                        onClick={() => fetchAmortizacion(row._id)}
                      >
                        Amortización
                      </Button>
                    )}
                    {row.estado !== "castigado" && row.estado !== "pagado" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{ minWidth: 0, px: 1, fontSize: "0.7rem", textTransform: "none" }}
                        onClick={() => handleCastigar(row._id)}
                      >
                        Castigar
                      </Button>
                    )}
                  </Box>
                );
              },
            },
          ]}
          deleteConfig={{
            enabled: true,
            onDelete: handleDeleteCredito,
            confirmMessage: "¿Eliminar este crédito?",
          }}
        />
      </Card>

      {/* ═══════════════════════════════════════════════════════════════
          DIÁLOGO: PLAN DE AMORTIZACIÓN
         ═══════════════════════════════════════════════════════════════ */}
      <Dialog
        open={openAmortizacionDialog}
        onClose={() => setOpenAmortizacionDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalanceIcon />
            Plan de Amortización
          </Box>
        </DialogTitle>
        <DialogContent>
          {amortizacion?.cuotas ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
              {amortizacion.cuotas.map((c: any, i: number) => (
                <Box
                  key={i}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "rgba(0,0,0,0.02)",
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Cuota {c.numero}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Vence: {new Date(c.fechaVencimiento).toLocaleDateString("es-ES")}
                  </Typography>
                  <Typography variant="body2">
                    Capital: ${c.capital?.toFixed(2)} · Interés: ${c.interes?.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Total: ${c.cuotaTotal?.toFixed(2)}
                  </Typography>
                  <Chip
                    label={c.estado || "pendiente"}
                    size="small"
                    color={c.estado === "pagada" ? "success" : "default"}
                  />
                </Box>
              ))}
            </Box>
          ) : (
            <Typography sx={{ py: 2, color: "#888" }}>Sin cuotas generadas</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAmortizacionDialog(false)} sx={{ textTransform: "none" }}>
            Cerrar
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
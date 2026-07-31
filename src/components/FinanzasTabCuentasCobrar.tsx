// src/pages/finanzas/tabs/FinanzasTabCuentasCobrar.tsx
import {
  Box,
  Button,
  Typography,
  Card,
  TextField,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import CustomDataGrid from "./CustomDataGrid";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

interface CuentaCobrar {
  _id: string;
  codigo: string;
  cliente: { _id: string; nombre: string; codigo?: string };
  concepto: { _id: string; nombre: string };
  montoOriginal: number;
  saldoPendiente: number;
  fechaEmision: string;
  fechaVencimiento: string;
  estado: "pendiente" | "parcial" | "pagada" | "vencida" | "anulada";
  diasVencido: number;
  notas?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ESTADOS_CXC = [
  { value: "pendiente", label: "Pendiente", color: "warning" as const },
  { value: "parcial", label: "Parcial", color: "info" as const },
  { value: "pagada", label: "Pagada", color: "success" as const },
  { value: "vencida", label: "Vencida", color: "error" as const },
  { value: "anulada", label: "Anulada", color: "default" as const },
];

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabCuentasCobrar() {
  const [cuentasCobrar, setCuentasCobrar] = useState<CuentaCobrar[]>([]);
  const [resumenCxC, setResumenCxC] = useState<any>(null);
  const [cxcForm, setCxcForm] = useState({
    codigo: "",
    cliente: "",
    concepto: "",
    montoOriginal: 0,
    fechaEmision: "",
    fechaVencimiento: "",
    notas: "",
  });

  // Snackbar local
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  // ── Fetch helpers ───────────────────────────────────────────────────
  const fetchCuentasCobrar = async () => {
    try {
      const res = await fetch(`${API_BASE}/cuenta-cobrar`);
      if (!res.ok) throw new Error("Error al cargar cuentas por cobrar");
      const data = await res.json();
      setCuentasCobrar(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchResumenCxC = async () => {
    try {
      const res = await fetch(`${API_BASE}/cuenta-cobrar/resumen`);
      if (!res.ok) throw new Error("Error al cargar resumen");
      const data = await res.json();
      setResumenCxC(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateCxC = async () => {
    try {
      const res = await fetch(`${API_BASE}/cuenta-cobrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cxcForm),
      });
      if (!res.ok) throw new Error("Error al crear cuenta por cobrar");
      showSnackbar("Cuenta por cobrar registrada correctamente");
      setCxcForm({
        codigo: "",
        cliente: "",
        concepto: "",
        montoOriginal: 0,
        fechaEmision: "",
        fechaVencimiento: "",
        notas: "",
      });
      fetchCuentasCobrar();
      fetchResumenCxC();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteCxC = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/cuenta-cobrar/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar cuenta por cobrar");
      showSnackbar("Cuenta por cobrar eliminada");
      fetchCuentasCobrar();
      fetchResumenCxC();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    fetchCuentasCobrar();
    fetchResumenCxC();
  }, []);

  return (
    <Box sx={{ m: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ═══════════════════════════════════════════════════════
          BOX 1: REGISTRAR CxC
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
          📝 Registrar CxC
        </Typography>

        {/* Dos columnas: Fechas */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
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
              Fecha Emisión
            </Typography>
            <TextField
              type="date"
              value={cxcForm.fechaEmision}
              onChange={(e) => setCxcForm({ ...cxcForm, fechaEmision: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
          <Box sx={{ flex: 1 }}>
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
              value={cxcForm.fechaVencimiento}
              onChange={(e) => setCxcForm({ ...cxcForm, fechaVencimiento: e.target.value })}
              fullWidth
              size="small"
            />
          </Box>
        </Box>

        {/* Dos columnas: Cliente y Concepto */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Cliente"
            placeholder="Cliente/Prov/Empleado"
            value={cxcForm.cliente}
            onChange={(e) => setCxcForm({ ...cxcForm, cliente: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Concepto"
            placeholder="Detalle..."
            value={cxcForm.concepto}
            onChange={(e) => setCxcForm({ ...cxcForm, concepto: e.target.value })}
            fullWidth
            size="small"
          />
        </Box>

        {/* Dos columnas: Monto y Código */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Monto (CUP)"
            type="number"
            placeholder="0.00"
            value={cxcForm.montoOriginal || ""}
            onChange={(e) => setCxcForm({ ...cxcForm, montoOriginal: Number(e.target.value) })}
            fullWidth
            size="small"
          />
          <TextField
            label="Código"
            placeholder="CXC-2024-001"
            value={cxcForm.codigo}
            onChange={(e) => setCxcForm({ ...cxcForm, codigo: e.target.value })}
            fullWidth
            size="small"
          />
        </Box>

        {/* Botón Registrar centrado */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreateCxC}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              boxShadow: "none",
              "&:hover": {
                background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              },
            }}
          >
            Registrar
          </Button>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════
          BOX 2: RESUMEN CxC
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
          📊 Resumen CxC
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
              Pendientes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenCxC?.porEstado?.pendiente || 0}{" "}
              <Typography component="span" variant="body2" sx={{ color: "#666" }}>
                (${resumenCxC?.saldoPendienteTotal?.toFixed(2) || "0.00"})
              </Typography>
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Pagados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenCxC?.porEstado?.pagada || 0}{" "}
              <Typography component="span" variant="body2" sx={{ color: "#666" }}>
                ($
                {(
                  (resumenCxC?.montoTotalOriginal || 0) -
                  (resumenCxC?.saldoPendienteTotal || 0)
                ).toFixed(2)}
                )
              </Typography>
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Total CxC
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenCxC?.totalCxC || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          TABLA DE CxC
         ═══════════════════════════════════════════════════════════ */}
      <Card sx={{ p: 2, borderRadius: 2 }}>
        <CustomDataGrid
          title="Cuentas por Cobrar"
          rows={cuentasCobrar}
          getRowId={(row: any) => row._id}
          columns={[
            {
              field: "fechaEmision",
              headerName: "Fecha",
              flex: 1,
              renderCell: (params: any) =>
                new Date(params.value).toLocaleDateString("es-ES"),
            },
            {
              field: "cliente",
              headerName: "Cliente",
              flex: 1.5,
              renderCell: (params: any) => params.value?.nombre || "-",
            },
            {
              field: "concepto",
              headerName: "Concepto",
              flex: 1.5,
              renderCell: (params: any) => params.value?.nombre || "-",
            },
            {
              field: "montoOriginal",
              headerName: "Monto",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => (
                <Typography fontWeight={600}>${params.value?.toFixed(2)}</Typography>
              ),
            },
            {
              field: "fechaVencimiento",
              headerName: "Vencimiento",
              flex: 1,
              renderCell: (params: any) =>
                new Date(params.value).toLocaleDateString("es-ES"),
            },
            {
              field: "estado",
              headerName: "Estado",
              flex: 0.8,
              isStatusColumn: true,
              renderCell: (params: any) => {
                const estado = ESTADOS_CXC.find((e) => e.value === params.value);
                return (
                  <Chip
                    label={estado?.label || params.value}
                    size="small"
                    color={estado?.color || "default"}
                  />
                );
              },
            },
          ]}
          deleteConfig={{
            enabled: true,
            onDelete: handleDeleteCxC,
            confirmMessage: "¿Eliminar esta cuenta por cobrar?",
          }}
        />
      </Card>

      {/* Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={snackbarSeverity} variant="filled" onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
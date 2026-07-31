// src/components/FinanzasTabAnticipos.tsx
import {
  Box,
  Button,
  Typography,
  Card,
  TextField,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CustomDataGrid from "./CustomDataGridR";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

interface Anticipo {
  _id: string;
  codigo: string;
  tipo: "cobro_anticipado" | "pago_anticipado";
  tercero: string;
  monto: number;
  descripcion: string;
  fecha: string;
  estado: "pendiente" | "liquidado" | "anulado";
  createdAt: string;
}

interface ResumenAnticipos {
  totalAnticipos: number;
  montoTotalEntregado: number;
  montoTotalLiquidado: number;
  montoPendienteLiquidar: number;
  cantidadPendientes: number;
  cantidadLiquidados: number;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TIPOS_ANTICIPO = [
  { value: "cobro_anticipado", label: "Cobro Anticipado (Recibimos)", color: "success" as const },
  { value: "pago_anticipado", label: "Pago Anticipado (Entregamos)", color: "warning" as const },
];

const ESTADOS_ANTICIPO = [
  { value: "pendiente", label: "Pendiente", color: "warning" as const },
  { value: "liquidado", label: "Liquidado", color: "success" as const },
  { value: "anulado", label: "Anulado", color: "error" as const },
];

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabAnticipos() {
  const [anticipos, setAnticipos] = useState<Anticipo[]>([]);
  const [resumenAnticipos, setResumenAnticipos] = useState<ResumenAnticipos | null>(null);
  const [anticipoForm, setAnticipoForm] = useState({
    tercero: "",
    monto: 0,
    tipo: "cobro_anticipado" as "cobro_anticipado" | "pago_anticipado",
    descripcion: "",
  });

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

  const fetchAnticipos = async () => {
    try {
      const res = await fetch(`${API_BASE}/anticipos-viaticos/anticipos`);
      if (!res.ok) throw new Error("Error al cargar anticipos");
      const data = await res.json();
      setAnticipos(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchResumenAnticipos = async () => {
    try {
      const res = await fetch(`${API_BASE}/anticipos-viaticos/resumen`);
      if (!res.ok) throw new Error("Error al cargar resumen de anticipos");
      const data = await res.json();
      setResumenAnticipos(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateAnticipo = async () => {
    try {
      const res = await fetch(`${API_BASE}/anticipos-viaticos/anticipo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(anticipoForm),
      });
      if (!res.ok) throw new Error("Error al registrar anticipo");
      showSnackbar("Anticipo registrado correctamente");
      setAnticipoForm({
        tercero: "",
        monto: 0,
        tipo: "cobro_anticipado",
        descripcion: "",
      });
      fetchAnticipos();
      fetchResumenAnticipos();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteAnticipo = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/anticipos-viaticos/anticipos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar anticipo");
      showSnackbar("Anticipo eliminado");
      fetchAnticipos();
      fetchResumenAnticipos();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    fetchAnticipos();
    fetchResumenAnticipos();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ m: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ═══════════════════════════════════════════════════════
          BOX 1: REGISTRAR ANTICIPO
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
          📝 Registrar Anticipo
        </Typography>

        {/* Dos columnas: Tercero y Monto */}
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Tercero"
            placeholder="Cliente/Proveedor"
            value={anticipoForm.tercero}
            onChange={(e) => setAnticipoForm({ ...anticipoForm, tercero: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label="Monto (CUP)"
            type="number"
            placeholder="0.00"
            value={anticipoForm.monto || ""}
            onChange={(e) => setAnticipoForm({ ...anticipoForm, monto: Number(e.target.value) })}
            fullWidth
            size="small"
          />
        </Box>

        {/* Tipo */}
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={anticipoForm.tipo}
              onChange={(e) => setAnticipoForm({ ...anticipoForm, tipo: e.target.value as any })}
              label="Tipo"
            >
              {TIPOS_ANTICIPO.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Descripción */}
        <Box sx={{ mb: 2 }}>
          <TextField
            label="Descripción"
            placeholder="Detalle del anticipo..."
            value={anticipoForm.descripcion}
            onChange={(e) => setAnticipoForm({ ...anticipoForm, descripcion: e.target.value })}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </Box>

        {/* Botón Registrar centrado */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreateAnticipo}
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
          BOX 2: RESUMEN ANTICIPOS
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
          📊 Resumen Anticipos
        </Typography>

        {/* Resumen numérico */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Total Anticipos
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenAnticipos?.totalAnticipos || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Monto Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              ${resumenAnticipos?.montoTotalEntregado?.toFixed(2) || "0.00"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Pendientes
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenAnticipos?.cantidadPendientes || 0}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: "#888", fontWeight: 500 }}>
              Liquidados
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a2e" }}>
              {resumenAnticipos?.cantidadLiquidados || 0}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ═══════════════════════════════════════════════════════════
          TABLA: HISTORIAL DE ANTICIPOS
         ═══════════════════════════════════════════════════════════ */}
      <Card sx={{ p: 2, borderRadius: 2 }}>
        <CustomDataGrid
          title="Historial de Anticipos"
          rows={anticipos}
          getRowId={(row: any) => row._id}
          columns={[
            {
              field: "fecha",
              headerName: "Fecha",
              flex: 1,
              renderCell: (params: any) => new Date(params.value).toLocaleDateString("es-ES"),
            },
            {
              field: "tipo",
              headerName: "Tipo",
              flex: 1.2,
              renderCell: (params: any) => {
                const tipo = TIPOS_ANTICIPO.find((t) => t.value === params.value);
                return (
                  <Chip
                    label={tipo?.label || params.value}
                    size="small"
                    color={tipo?.color || "default"}
                  />
                );
              },
            },
            {
              field: "tercero",
              headerName: "Tercero",
              flex: 1.5,
            },
            {
              field: "monto",
              headerName: "Monto",
              flex: 1,
              numeric: true,
              renderCell: (params: any) => (
                <Typography fontWeight={600}>${params.value?.toFixed(2)}</Typography>
              ),
            },
            {
              field: "descripcion",
              headerName: "Descripción",
              flex: 2,
            },
            {
              field: "estado",
              headerName: "Estado",
              flex: 0.8,
              renderCell: (params: any) => {
                const estado = ESTADOS_ANTICIPO.find((e) => e.value === params.value);
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
            onDelete: handleDeleteAnticipo,
            confirmMessage: "¿Eliminar este anticipo?",
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
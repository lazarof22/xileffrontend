// src/components/FinanzasTabCaja.tsx
import {
  Box,
  Button,
  Typography,
  Card,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CustomDataGrid from "./CustomDataGridR";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

interface CuentaCaja {
  _id: string;
  codigo: string;
  nombre: string;
  tipo: "principal" | "fondo_fijo" | "chica" | "otra";
  moneda: { _id: string; nombre: string };
  saldoInicial: number;
  saldoActual: number;
  montoFondoFijo: number;
  montoMinimo: number;
  responsable: string;
  cuentaBancariaReposicion?: string;
  activo: boolean;
}

interface MovimientoCaja {
  _id: string;
  cajaId: { _id: string; nombre: string };
  codigo: string;
  tipo: "apertura" | "ingreso" | "egreso" | "cierre";
  concepto: string;
  descripcion: string;
  monto: number;
  fecha: string;
  referencia?: string;
  responsable: string;
}

interface ArqueoCaja {
  _id: string;
  cajaId: { _id: string; nombre: string };
  efectivoEsperado: number;
  efectivoContado: number;
  diferencia: number;
  resultado: "cuadrado" | "diferencia" | "faltante" | "sobrante";
  observaciones?: string;
  realizadoPor: string;
  fecha: string;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TIPOS_CUENTA = [
  { value: "principal", label: "Principal" },
  { value: "fondo_fijo", label: "Fondo Fijo" },
  { value: "chica", label: "Chica" },
  { value: "otra", label: "Otra" },
];

const TIPOS_MOVIMIENTO = [
  { value: "apertura", label: "Apertura" },
  { value: "ingreso", label: "Ingreso" },
  { value: "egreso", label: "Egreso" },
  { value: "cierre", label: "Cierre" },
];

const CONCEPTOS_MOVIMIENTO = [
  { value: "ventas_efectivo", label: "Ventas Efectivo" },
  { value: "pagos_menores", label: "Pagos Menores" },
  { value: "viaticos", label: "Viáticos" },
  { value: "combustible", label: "Combustible" },
  { value: "comedor", label: "Comedor" },
  { value: "fondo_fijo_reposicion", label: "Reposición Fondo Fijo" },
  { value: "anticipo", label: "Anticipo" },
  { value: "reembolso", label: "Reembolso" },
  { value: "otros", label: "Otros" },
];

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabCaja() {
  const [cuentas, setCuentas] = useState<CuentaCaja[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
  const [arqueos, setArqueos] = useState<ArqueoCaja[]>([]);
  const [saldos, setSaldos] = useState<any[]>([]);
  const [cajaSubTab, setCajaSubTab] = useState(0);

  // Dialogs
  const [openCuentaDialog, setOpenCuentaDialog] = useState(false);
  const [openMovimientoDialog, setOpenMovimientoDialog] = useState(false);
  const [openArqueoDialog, setOpenArqueoDialog] = useState(false);

  // Forms
  const [cuentaForm, setCuentaForm] = useState<Partial<CuentaCaja>>({
    tipo: "principal",
    saldoInicial: 0,
    montoFondoFijo: 0,
    montoMinimo: 0,
  });

  const [movimientoForm, setMovimientoForm] = useState<Partial<MovimientoCaja>>({
    tipo: "ingreso",
    concepto: "ventas_efectivo",
    fecha: new Date().toISOString().split("T")[0],
  });

  const [arqueoForm, setArqueoForm] = useState<Partial<ArqueoCaja>>({
    efectivoContado: 0,
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

  const fetchCuentas = async () => {
    try {
      const res = await fetch(`${API_BASE}/caja/cuentas`);
      if (!res.ok) throw new Error("Error al cargar cuentas");
      const data = await res.json();
      setCuentas(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchMovimientos = async () => {
    try {
      const res = await fetch(`${API_BASE}/caja`);
      if (!res.ok) throw new Error("Error al cargar movimientos");
      const data = await res.json();
      setMovimientos(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchArqueos = async () => {
    try {
      const res = await fetch(`${API_BASE}/caja/arqueos`);
      if (!res.ok) throw new Error("Error al cargar arqueos");
      const data = await res.json();
      setArqueos(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchSaldos = async () => {
    try {
      const res = await fetch(`${API_BASE}/caja/cuentas/saldos`);
      if (!res.ok) throw new Error("Error al cargar saldos");
      const data = await res.json();
      setSaldos(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateCuenta = async () => {
    try {
      const res = await fetch(`${API_BASE}/caja/cuenta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuentaForm),
      });
      if (!res.ok) throw new Error("Error al crear cuenta");
      showSnackbar("Cuenta creada correctamente");
      setOpenCuentaDialog(false);
      setCuentaForm({ tipo: "principal", saldoInicial: 0, montoFondoFijo: 0, montoMinimo: 0 });
      fetchCuentas();
      fetchSaldos();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteCuenta = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/caja/cuentas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar cuenta");
      showSnackbar("Cuenta eliminada");
      fetchCuentas();
      fetchSaldos();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateMovimiento = async () => {
    try {
      const res = await fetch(`${API_BASE}/caja/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movimientoForm),
      });
      if (!res.ok) throw new Error("Error al registrar movimiento");
      showSnackbar("Movimiento registrado correctamente");
      setOpenMovimientoDialog(false);
      setMovimientoForm({
        tipo: "ingreso",
        concepto: "ventas_efectivo",
        fecha: new Date().toISOString().split("T")[0],
      });
      fetchMovimientos();
      fetchSaldos();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteMovimiento = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/caja/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar movimiento");
      showSnackbar("Movimiento eliminado");
      fetchMovimientos();
      fetchSaldos();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateArqueo = async () => {
    try {
      const res = await fetch(`${API_BASE}/caja/arqueo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(arqueoForm),
      });
      if (!res.ok) throw new Error("Error al realizar arqueo");
      showSnackbar("Arqueo registrado correctamente");
      setOpenArqueoDialog(false);
      setArqueoForm({ efectivoContado: 0 });
      fetchArqueos();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    fetchCuentas();
    fetchMovimientos();
    fetchArqueos();
    fetchSaldos();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ m: 2 }}>
      {/* ── Saldos Actuales ───────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
        {saldos.map((s: any) => (
          <Card
            key={s.cuentaId}
            sx={{
              width: 400,
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9))",
            }}
          >
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", width: 40, height: 40 }}
              >
                <MonetizationOnIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                  }}
                >
                  {s.nombre}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                  ${s.saldoActual?.toFixed(2) || "0.00"}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  {s.codigo}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
        {saldos.length === 0 && (
          <Card
            sx={{
              width: 400,
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden",
              background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9))",
            }}
          >
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white", width: 40, height: 40 }}
              >
                <MonetizationOnIcon sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    display: "block",
                  }}
                >
                  Saldo Actual en Caja
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                  $0.00
                </Typography>
              </Box>
            </Box>
          </Card>
        )}
      </Box>

      {/* ── Botones de acción ─────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "center" }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="small"
          sx={{
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
          onClick={() => setOpenCuentaDialog(true)}
        >
          Nueva Cuenta
        </Button>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          size="small"
          sx={{
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
          onClick={() => setOpenMovimientoDialog(true)}
        >
          Registrar Movimiento
        </Button>
        <Button
          variant="contained"
          startIcon={<AccountBalanceWalletIcon />}
          size="small"
          sx={{
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
          onClick={() => setOpenArqueoDialog(true)}
        >
          Realizar Arqueo
        </Button>
      </Box>

      {/* ── Sub-tabs ──────────────────────────────────────────────── */}
      <Tabs
        value={cajaSubTab}
        onChange={(_, v) => setCajaSubTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          "& .MuiTabs-flexContainer": { gap: "2px" },
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
        }}
      >
        <Tab label="Cuentas de Caja" />
        <Tab label="Movimientos" />
        <Tab label="Arqueos" />
      </Tabs>

      {/* ── Sub-tab 0: Cuentas ──────────────────────────────────── */}
      {cajaSubTab === 0 && (
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <CustomDataGrid
            title="Cuentas de Caja"
            rows={cuentas}
            getRowId={(row: any) => row._id}
            columns={[
              { field: "codigo", headerName: "Código", flex: 1 },
              { field: "nombre", headerName: "Nombre", flex: 2 },
              {
                field: "tipo",
                headerName: "Tipo",
                flex: 1,
                renderCell: (params: any) => (
                  <Chip
                    label={TIPOS_CUENTA.find((t) => t.value === params.value)?.label || params.value}
                    size="small"
                    color={params.value === "principal" ? "primary" : "default"}
                  />
                ),
              },
              {
                field: "saldoActual",
                headerName: "Saldo Actual",
                flex: 1,
                numeric: true,
                renderCell: (params: any) => (
                  <Typography fontWeight={600} color={params.value >= 0 ? "success.main" : "error.main"}>
                    ${params.value?.toFixed(2)}
                  </Typography>
                ),
              },
              { field: "responsable", headerName: "Responsable", flex: 1 },
              {
                field: "activo",
                headerName: "Estado",
                flex: 0.8,
                renderCell: (params: any) => (
                  <Chip
                    label={params.value ? "Activo" : "Inactivo"}
                    size="small"
                    color={params.value ? "success" : "default"}
                  />
                ),
              },
            ]}
            deleteConfig={{
              enabled: true,
              onDelete: handleDeleteCuenta,
              confirmMessage: "¿Eliminar esta cuenta de caja?",
            }}
          />
        </Card>
      )}

      {/* ── Sub-tab 1: Movimientos ──────────────────────────────── */}
      {cajaSubTab === 1 && (
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <CustomDataGrid
            title="Historial de Movimientos"
            rows={movimientos}
            getRowId={(row: any) => row._id}
            columns={[
              {
                field: "fecha",
                headerName: "Fecha",
                flex: 1,
                renderCell: (params: any) => new Date(params.value).toLocaleDateString("es-ES"),
              },
              { field: "codigo", headerName: "Código", flex: 1 },
              {
                field: "cajaId",
                headerName: "Caja",
                flex: 1.5,
                renderCell: (params: any) => params.value?.nombre || "-",
              },
              {
                field: "tipo",
                headerName: "Tipo",
                flex: 0.8,
                renderCell: (params: any) => (
                  <Chip
                    label={TIPOS_MOVIMIENTO.find((t) => t.value === params.value)?.label || params.value}
                    size="small"
                    color={
                      params.value === "ingreso" ? "success" : params.value === "egreso" ? "error" : "default"
                    }
                  />
                ),
              },
              { field: "concepto", headerName: "Concepto", flex: 1.5 },
              {
                field: "monto",
                headerName: "Monto",
                flex: 1,
                numeric: true,
                renderCell: (params: any) => (
                  <Typography fontWeight={600}>${params.value?.toFixed(2)}</Typography>
                ),
              },
              { field: "descripcion", headerName: "Descripción", flex: 2 },
              { field: "responsable", headerName: "Responsable", flex: 1 },
            ]}
            deleteConfig={{
              enabled: true,
              onDelete: handleDeleteMovimiento,
              confirmMessage: "¿Eliminar este movimiento?",
            }}
          />
        </Card>
      )}

      {/* ── Sub-tab 2: Arqueos ──────────────────────────────────── */}
      {cajaSubTab === 2 && (
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <CustomDataGrid
            title="Historial de Arqueos"
            rows={arqueos}
            getRowId={(row: any) => row._id}
            columns={[
              {
                field: "fecha",
                headerName: "Fecha",
                flex: 1,
                renderCell: (params: any) => new Date(params.value).toLocaleDateString("es-ES"),
              },
              {
                field: "cajaId",
                headerName: "Caja",
                flex: 1.5,
                renderCell: (params: any) => params.value?.nombre || "-",
              },
              {
                field: "efectivoEsperado",
                headerName: "Esperado",
                flex: 1,
                numeric: true,
                renderCell: (params: any) => `$${params.value?.toFixed(2)}`,
              },
              {
                field: "efectivoContado",
                headerName: "Contado",
                flex: 1,
                numeric: true,
                renderCell: (params: any) => `$${params.value?.toFixed(2)}`,
              },
              {
                field: "diferencia",
                headerName: "Diferencia",
                flex: 1,
                numeric: true,
                renderCell: (params: any) => (
                  <Typography fontWeight={600} color={params.value === 0 ? "success.main" : "error.main"}>
                    ${params.value?.toFixed(2)}
                  </Typography>
                ),
              },
              {
                field: "resultado",
                headerName: "Resultado",
                flex: 1,
                renderCell: (params: any) => (
                  <Chip
                    label={params.value}
                    size="small"
                    color={
                      params.value === "cuadrado"
                        ? "success"
                        : params.value === "diferencia"
                        ? "warning"
                        : "error"
                    }
                  />
                ),
              },
              { field: "realizadoPor", headerName: "Realizado por", flex: 1 },
              { field: "observaciones", headerName: "Observaciones", flex: 2 },
            ]}
          />
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DIÁLOGOS
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── Diálogo: Nueva Cuenta ──────────────────────────────────── */}
      <Dialog open={openCuentaDialog} onClose={() => setOpenCuentaDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Cuenta de Caja</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Código"
            value={cuentaForm.codigo || ""}
            onChange={(e) => setCuentaForm({ ...cuentaForm, codigo: e.target.value })}
            fullWidth
          />
          <TextField
            label="Nombre"
            value={cuentaForm.nombre || ""}
            onChange={(e) => setCuentaForm({ ...cuentaForm, nombre: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={cuentaForm.tipo || "principal"}
              onChange={(e) => setCuentaForm({ ...cuentaForm, tipo: e.target.value as any })}
              label="Tipo"
            >
              {TIPOS_CUENTA.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Moneda (ID)"
            value={(cuentaForm.moneda as any) || ""}
            onChange={(e) => setCuentaForm({ ...cuentaForm, moneda: e.target.value as any })}
            fullWidth
            helperText="ID de la moneda en el sistema"
          />
          <TextField
            label="Saldo Inicial"
            type="number"
            value={cuentaForm.saldoInicial || 0}
            onChange={(e) => setCuentaForm({ ...cuentaForm, saldoInicial: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Monto Fondo Fijo"
            type="number"
            value={cuentaForm.montoFondoFijo || 0}
            onChange={(e) => setCuentaForm({ ...cuentaForm, montoFondoFijo: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Monto Mínimo"
            type="number"
            value={cuentaForm.montoMinimo || 0}
            onChange={(e) => setCuentaForm({ ...cuentaForm, montoMinimo: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Responsable"
            value={cuentaForm.responsable || ""}
            onChange={(e) => setCuentaForm({ ...cuentaForm, responsable: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCuentaDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateCuenta}
            variant="contained"
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Diálogo: Registrar Movimiento ──────────────────────────── */}
      <Dialog open={openMovimientoDialog} onClose={() => setOpenMovimientoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Registrar Movimiento en Caja</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Caja</InputLabel>
            <Select
              value={(movimientoForm.cajaId as any) || ""}
              onChange={(e) => setMovimientoForm({ ...movimientoForm, cajaId: e.target.value as any })}
              label="Caja"
            >
              {cuentas.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Código"
            value={movimientoForm.codigo || ""}
            onChange={(e) => setMovimientoForm({ ...movimientoForm, codigo: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={movimientoForm.tipo || "ingreso"}
              onChange={(e) => setMovimientoForm({ ...movimientoForm, tipo: e.target.value as any })}
              label="Tipo"
            >
              {TIPOS_MOVIMIENTO.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Concepto</InputLabel>
            <Select
              value={movimientoForm.concepto || "ventas_efectivo"}
              onChange={(e) => setMovimientoForm({ ...movimientoForm, concepto: e.target.value })}
              label="Concepto"
            >
              {CONCEPTOS_MOVIMIENTO.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  {c.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Descripción"
            value={movimientoForm.descripcion || ""}
            onChange={(e) => setMovimientoForm({ ...movimientoForm, descripcion: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Monto"
            type="number"
            value={movimientoForm.monto || ""}
            onChange={(e) => setMovimientoForm({ ...movimientoForm, monto: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Fecha"
            type="date"
            value={movimientoForm.fecha || ""}
            onChange={(e) => setMovimientoForm({ ...movimientoForm, fecha: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Referencia"
            value={movimientoForm.referencia || ""}
            onChange={(e) => setMovimientoForm({ ...movimientoForm, referencia: e.target.value })}
            fullWidth
            helperText="Número de factura, comprobante, etc."
          />
          <TextField
            label="Responsable"
            value={movimientoForm.responsable || ""}
            onChange={(e) => setMovimientoForm({ ...movimientoForm, responsable: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMovimientoDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateMovimiento}
            variant="contained"
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Registrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Diálogo: Realizar Arqueo ─────────────────────────────── */}
      <Dialog open={openArqueoDialog} onClose={() => setOpenArqueoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Realizar Arqueo de Caja</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Caja</InputLabel>
            <Select
              value={(arqueoForm.cajaId as any) || ""}
              onChange={(e) => setArqueoForm({ ...arqueoForm, cajaId: e.target.value as any })}
              label="Caja"
            >
              {cuentas.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nombre} — Saldo: ${c.saldoActual?.toFixed(2)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Efectivo Contado"
            type="number"
            value={arqueoForm.efectivoContado || ""}
            onChange={(e) => setArqueoForm({ ...arqueoForm, efectivoContado: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Observaciones"
            value={arqueoForm.observaciones || ""}
            onChange={(e) => setArqueoForm({ ...arqueoForm, observaciones: e.target.value })}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            label="Realizado por"
            value={arqueoForm.realizadoPor || ""}
            onChange={(e) => setArqueoForm({ ...arqueoForm, realizadoPor: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenArqueoDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateArqueo}
            variant="contained"
            sx={{
              textTransform: "none",
              background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Realizar Arqueo
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
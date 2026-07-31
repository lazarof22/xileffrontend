// src/components/FinanzasTabBanco.tsx
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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CustomDataGrid from "./CustomDataGridR";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

interface CuentaBancaria {
  _id: string;
  codigoBanco: string;
  nombreBanco: string;
  numeroCuenta: string;
  tipoCuenta: "corriente" | "ahorro" | "mlc";
  moneda: { _id: string; nombre: string };
  saldoInicial: number;
  saldoActual: number;
  fechaApertura: string;
  titular: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MovimientoBanco {
  _id: string;
  cuentaId: { _id: string; nombreBanco: string; numeroCuenta: string };
  tipo: "deposito" | "retiro" | "transferencia" | "cheque" | "deposito_desde_caja" | "otro";
  monto: number;
  referencia: string;
  descripcion: string;
  fecha: string;
  tercero?: string;
  responsable?: string;
  createdAt: string;
}

interface SaldoBanco {
  cuentaId: string;
  numeroCuenta: string;
  nombreBanco: string;
  tipoCuenta: string;
  saldoActual: number;
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const TIPOS_CUENTA_BANCO = [
  { value: "corriente", label: "Corriente" },
  { value: "ahorro", label: "Ahorro" },
  { value: "mlc", label: "MLC" },
];

const TIPOS_MOVIMIENTO_BANCO = [
  { value: "deposito", label: "Depósito" },
  { value: "retiro", label: "Retiro" },
  { value: "transferencia", label: "Transferencia" },
  { value: "cheque", label: "Cheque" },
  { value: "deposito_desde_caja", label: "Depósito desde Caja" },
  { value: "otro", label: "Otro" },
];

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabBanco() {
  const [cuentasBanco, setCuentasBanco] = useState<CuentaBancaria[]>([]);
  const [saldosBanco, setSaldosBanco] = useState<SaldoBanco[]>([]);
  const [movimientosBanco, setMovimientosBanco] = useState<MovimientoBanco[]>([]);
  const [bancoSubTab, setBancoSubTab] = useState(0);

  const [openCuentaBancoDialog, setOpenCuentaBancoDialog] = useState(false);
  const [openMovimientoBancoDialog, setOpenMovimientoBancoDialog] = useState(false);

  const [cuentaBancoForm, setCuentaBancoForm] = useState<Partial<CuentaBancaria>>({
    tipoCuenta: "corriente",
    saldoInicial: 0,
    fechaApertura: new Date().toISOString().split("T")[0],
  });

  const [movimientoBancoForm, setMovimientoBancoForm] = useState<Partial<MovimientoBanco>>({
    tipo: "deposito",
    fecha: new Date().toISOString().split("T")[0],
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

  const fetchCuentasBanco = async () => {
    try {
      const res = await fetch(`${API_BASE}/banco`);
      if (!res.ok) throw new Error("Error al cargar cuentas bancarias");
      const data = await res.json();
      setCuentasBanco(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchSaldosBanco = async () => {
    try {
      const res = await fetch(`${API_BASE}/banco/saldos`);
      if (!res.ok) throw new Error("Error al cargar saldos bancarios");
      const data = await res.json();
      setSaldosBanco(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchMovimientosBanco = async () => {
    try {
      const res = await fetch(`${API_BASE}/banco/movimientos`);
      if (!res.ok) throw new Error("Error al cargar movimientos bancarios");
      const data = await res.json();
      setMovimientosBanco(data);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateCuentaBanco = async () => {
    try {
      const res = await fetch(`${API_BASE}/banco`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuentaBancoForm),
      });
      if (!res.ok) throw new Error("Error al crear cuenta bancaria");
      showSnackbar("Cuenta bancaria creada correctamente");
      setOpenCuentaBancoDialog(false);
      setCuentaBancoForm({
        tipoCuenta: "corriente",
        saldoInicial: 0,
        fechaApertura: new Date().toISOString().split("T")[0],
      });
      fetchCuentasBanco();
      fetchSaldosBanco();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteCuentaBanco = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/banco/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar cuenta bancaria");
      showSnackbar("Cuenta bancaria eliminada");
      fetchCuentasBanco();
      fetchSaldosBanco();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleCreateMovimientoBanco = async () => {
    try {
      const res = await fetch(`${API_BASE}/banco/movimiento`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(movimientoBancoForm),
      });
      if (!res.ok) throw new Error("Error al registrar movimiento bancario");
      showSnackbar("Movimiento bancario registrado correctamente");
      setOpenMovimientoBancoDialog(false);
      setMovimientoBancoForm({
        tipo: "deposito",
        fecha: new Date().toISOString().split("T")[0],
      });
      fetchMovimientosBanco();
      fetchSaldosBanco();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const handleDeleteMovimientoBanco = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE}/banco/movimiento/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar movimiento bancario");
      showSnackbar("Movimiento bancario eliminado");
      fetchMovimientosBanco();
      fetchSaldosBanco();
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  useEffect(() => {
    fetchCuentasBanco();
    fetchSaldosBanco();
    fetchMovimientosBanco();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ m: 2, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* ── Saldos Actuales en Banco ────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 1 }}>
        {saldosBanco.map((s: SaldoBanco) => (
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
                <AccountBalanceIcon sx={{ fontSize: 20 }} />
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
                  {s.nombreBanco} — {s.numeroCuenta}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                  ${s.saldoActual?.toFixed(2) || "0.00"}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                  {TIPOS_CUENTA_BANCO.find((t) => t.value === s.tipoCuenta)?.label || s.tipoCuenta}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
        {saldosBanco.length === 0 && (
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
                <AccountBalanceIcon sx={{ fontSize: 20 }} />
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
                  Saldo Actual en Banco
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "white", letterSpacing: "-0.02em" }}>
                  $0.00
                </Typography>
              </Box>
            </Box>
          </Card>
        )}
      </Box>

      {/* ── Botones de acción para Banco ────────────────────────── */}
      <Box sx={{ display: "flex", gap: 1, mb: 1, justifyContent: "center" }}>
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
          onClick={() => setOpenCuentaBancoDialog(true)}
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
          onClick={() => setOpenMovimientoBancoDialog(true)}
        >
          Registrar Movimiento
        </Button>
      </Box>

      {/* ── Sub-tabs de Banco ───────────────────────────────────── */}
      <Tabs
        value={bancoSubTab}
        onChange={(_, v) => setBancoSubTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          "& .MuiTabs-flexContainer": { gap: "2px" },
          "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
        }}
      >
        <Tab label="Cuentas Bancarias" />
        <Tab label="Historial de Banco" />
      </Tabs>

      {/* ── Sub-tab 0: Cuentas Bancarias ────────────────────────── */}
      {bancoSubTab === 0 && (
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <CustomDataGrid
            title="Cuentas Bancarias"
            rows={cuentasBanco}
            getRowId={(row: any) => row._id}
            columns={[
              { field: "codigoBanco", headerName: "Código", flex: 1 },
              { field: "nombreBanco", headerName: "Banco", flex: 2 },
              { field: "numeroCuenta", headerName: "No. Cuenta", flex: 1.5 },
              {
                field: "tipoCuenta",
                headerName: "Tipo",
                flex: 1,
                renderCell: (params: any) => (
                  <Chip
                    label={TIPOS_CUENTA_BANCO.find((t) => t.value === params.value)?.label || params.value}
                    size="small"
                    color={params.value === "corriente" ? "primary" : params.value === "ahorro" ? "success" : "info"}
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
              {
                field: "moneda",
                headerName: "Moneda",
                flex: 0.8,
                renderCell: (params: any) => params.value?.nombre || "-",
              },
              { field: "titular", headerName: "Titular", flex: 1.5 },
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
              onDelete: handleDeleteCuentaBanco,
              confirmMessage: "¿Eliminar esta cuenta bancaria?",
            }}
          />
        </Card>
      )}

      {/* ── Sub-tab 1: Historial de Banco ───────────────────────── */}
      {bancoSubTab === 1 && (
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <CustomDataGrid
            title="Historial de Banco"
            rows={movimientosBanco}
            getRowId={(row: any) => row._id}
            columns={[
              {
                field: "fecha",
                headerName: "Fecha",
                flex: 1,
                renderCell: (params: any) => new Date(params.value).toLocaleDateString("es-ES"),
              },
              {
                field: "cuentaId",
                headerName: "Cuenta",
                flex: 1.5,
                renderCell: (params: any) =>
                  params.value?.nombreBanco
                    ? `${params.value.nombreBanco} — ${params.value.numeroCuenta}`
                    : "-",
              },
              {
                field: "tipo",
                headerName: "Tipo",
                flex: 1,
                renderCell: (params: any) => {
                  const tipo = TIPOS_MOVIMIENTO_BANCO.find((t) => t.value === params.value);
                  return (
                    <Chip
                      label={tipo?.label || params.value}
                      size="small"
                      color={
                        params.value === "deposito" || params.value === "deposito_desde_caja"
                          ? "success"
                          : params.value === "retiro" || params.value === "cheque"
                          ? "error"
                          : "info"
                      }
                    />
                  );
                },
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
              { field: "referencia", headerName: "Ref/Tercero", flex: 1.5 },
              { field: "descripcion", headerName: "Descripción", flex: 2 },
              { field: "tercero", headerName: "Tercero", flex: 1 },
            ]}
            deleteConfig={{
              enabled: true,
              onDelete: handleDeleteMovimientoBanco,
              confirmMessage: "¿Eliminar este movimiento bancario?",
            }}
          />
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          DIÁLOGOS DE BANCO
         ═══════════════════════════════════════════════════════════════ */}

      {/* ── Diálogo: Nueva Cuenta Bancaria ─────────────────────────── */}
      <Dialog open={openCuentaBancoDialog} onClose={() => setOpenCuentaBancoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Nueva Cuenta Bancaria</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Código del Banco"
            value={cuentaBancoForm.codigoBanco || ""}
            onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, codigoBanco: e.target.value })}
            fullWidth
          />
          <TextField
            label="Nombre del Banco"
            value={cuentaBancoForm.nombreBanco || ""}
            onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, nombreBanco: e.target.value })}
            fullWidth
          />
          <TextField
            label="Número de Cuenta"
            value={cuentaBancoForm.numeroCuenta || ""}
            onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, numeroCuenta: e.target.value })}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel>Tipo de Cuenta</InputLabel>
            <Select
              value={cuentaBancoForm.tipoCuenta || "corriente"}
              onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, tipoCuenta: e.target.value as any })}
              label="Tipo de Cuenta"
            >
              {TIPOS_CUENTA_BANCO.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Moneda (ID)"
            value={(cuentaBancoForm.moneda as any) || ""}
            onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, moneda: e.target.value as any })}
            fullWidth
            helperText="ID de la moneda en el sistema"
          />
          <TextField
            label="Saldo Inicial"
            type="number"
            value={cuentaBancoForm.saldoInicial || 0}
            onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, saldoInicial: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Fecha de Apertura"
            type="date"
            value={cuentaBancoForm.fechaApertura || ""}
            onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, fechaApertura: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Titular"
            value={cuentaBancoForm.titular || ""}
            onChange={(e) => setCuentaBancoForm({ ...cuentaBancoForm, titular: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCuentaBancoDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateCuentaBanco}
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

      {/* ── Diálogo: Registrar Movimiento Bancario ─────────────────── */}
      <Dialog
        open={openMovimientoBancoDialog}
        onClose={() => setOpenMovimientoBancoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Registrar Movimiento Bancario</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Cuenta Bancaria</InputLabel>
            <Select
              value={(movimientoBancoForm.cuentaId as any) || ""}
              onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, cuentaId: e.target.value as any })}
              label="Cuenta Bancaria"
            >
              {cuentasBanco.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nombreBanco} — {c.numeroCuenta}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Tipo de Movimiento</InputLabel>
            <Select
              value={movimientoBancoForm.tipo || "deposito"}
              onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, tipo: e.target.value as any })}
              label="Tipo de Movimiento"
            >
              {TIPOS_MOVIMIENTO_BANCO.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Monto (CUP)"
            type="number"
            value={movimientoBancoForm.monto || ""}
            onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, monto: Number(e.target.value) })}
            fullWidth
          />
          <TextField
            label="Referencia / Nro Cheque"
            value={movimientoBancoForm.referencia || ""}
            onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, referencia: e.target.value })}
            fullWidth
            placeholder="Nro cheque, entidad..."
          />
          <TextField
            label="Descripción"
            value={movimientoBancoForm.descripcion || ""}
            onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, descripcion: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Detalle..."
          />
          <TextField
            label="Fecha"
            type="date"
            value={movimientoBancoForm.fecha || ""}
            onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, fecha: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Tercero"
            value={movimientoBancoForm.tercero || ""}
            onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, tercero: e.target.value })}
            fullWidth
          />
          <TextField
            label="Responsable"
            value={movimientoBancoForm.responsable || ""}
            onChange={(e) => setMovimientoBancoForm({ ...movimientoBancoForm, responsable: e.target.value })}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMovimientoBancoDialog(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateMovimientoBanco}
            variant="contained"
            startIcon={<CheckCircleIcon />}
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

      {/* Snackbar */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={snackbarSeverity} variant="filled" onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
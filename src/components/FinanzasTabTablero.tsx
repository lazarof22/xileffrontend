// src/components/FinanzasTabTablero.tsx
import {
  Box,
  Typography,
  Card,
  Avatar,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { useState, useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

interface SaldoCaja {
  cuentaId: string;
  nombre: string;
  codigo: string;
  saldoActual: number;
}

interface SaldoBanco {
  cuentaId: string;
  numeroCuenta: string;
  nombreBanco: string;
  tipoCuenta: string;
  saldoActual: number;
}

interface MovimientoCaja {
  _id: string;
  tipo: "apertura" | "ingreso" | "egreso" | "cierre";
  concepto: string;
  descripcion: string;
  monto: number;
  fecha: string;
  cajaId?: { nombre: string };
}

interface MovimientoBanco {
  _id: string;
  tipo: string;
  descripcion: string;
  monto: number;
  fecha: string;
  cuentaId?: { nombreBanco: string; numeroCuenta: string };
}

interface MovimientoTablero {
  _id: string;
  fecha: string;
  origen: "Caja" | "Banco";
  tipo: string;
  concepto: string;
  monto: number;
  descripcion: string;
}

interface ResumenCxC {
  saldoPendienteTotal?: number;
  totalCxC?: number;
}

interface ResumenPagos {
  totalGeneral?: {
    saldoPendiente: number;
    cantidad: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const HEADER_GRADIENT = "linear-gradient(135deg, rgb(0, 114, 255), rgb(142, 45, 226))";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabTablero() {
  const [saldoCaja, setSaldoCaja] = useState(0);
  const [saldoBanco, setSaldoBanco] = useState(0);
  const [totalPorCobrar, setTotalPorCobrar] = useState(0);
  const [totalPorPagar, setTotalPorPagar] = useState(0);
  const [liquidez, setLiquidez] = useState(0);
  const [ultimosMovimientos, setUltimosMovimientos] = useState<MovimientoTablero[]>([]);
  const [loading, setLoading] = useState(true);

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

  const fetchResumen = async () => {
    try {
      setLoading(true);

      // Saldo Caja
      const resCaja = await fetch(`${API_BASE}/caja/cuentas/saldos`);
      const dataCaja: SaldoCaja[] = resCaja.ok ? await resCaja.json() : [];
      const totalCaja = dataCaja.reduce((acc, s) => acc + (s.saldoActual || 0), 0);

      // Saldo Banco
      const resBanco = await fetch(`${API_BASE}/banco/saldos`);
      const dataBanco: SaldoBanco[] = resBanco.ok ? await resBanco.json() : [];
      const totalBanco = dataBanco.reduce((acc, s) => acc + (s.saldoActual || 0), 0);

      // Total por Cobrar
      const resCxC = await fetch(`${API_BASE}/cuenta-cobrar/resumen`);
      const dataCxC: ResumenCxC = resCxC.ok ? await resCxC.json() : {};
      const porCobrar = dataCxC.saldoPendienteTotal || 0;

      // Total por Pagar
      const resPagos = await fetch(`${API_BASE}/planificacion-pagos/resumen`);
      const dataPagos: ResumenPagos = resPagos.ok ? await resPagos.json() : {};
      const porPagar = dataPagos.totalGeneral?.saldoPendiente || 0;

      setSaldoCaja(totalCaja);
      setSaldoBanco(totalBanco);
      setTotalPorCobrar(porCobrar);
      setTotalPorPagar(porPagar);
      setLiquidez(totalCaja + totalBanco);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  const fetchUltimosMovimientos = async () => {
    try {
      const [resCaja, resBanco] = await Promise.all([
        fetch(`${API_BASE}/caja`),
        fetch(`${API_BASE}/banco/movimientos`),
      ]);

      const movCaja: MovimientoCaja[] = resCaja.ok ? await resCaja.json() : [];
      const movBanco: MovimientoBanco[] = resBanco.ok ? await resBanco.json() : [];

      const combinados: MovimientoTablero[] = [
        ...movCaja.map((m) => ({
          _id: m._id,
          fecha: m.fecha,
          origen: "Caja" as const,
          tipo: m.tipo,
          concepto: m.concepto || "—",
          monto: m.monto,
          descripcion: m.descripcion || m.concepto || "Movimiento en caja",
        })),
        ...movBanco.map((m) => ({
          _id: m._id,
          fecha: m.fecha,
          origen: "Banco" as const,
          tipo: m.tipo,
          concepto: m.descripcion || "—",
          monto: m.monto,
          descripcion: m.descripcion || `Movimiento bancario — ${m.cuentaId?.nombreBanco || ""}`,
        })),
      ];

      // Ordenar por fecha descendente y tomar los últimos 10
      combinados.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setUltimosMovimientos(combinados.slice(0, 10));
    } catch (err: any) {
      showSnackbar(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumen();
    fetchUltimosMovimientos();
  }, []);

  // ═══════════════════════════════════════════════════════════════════
  // RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════

  const metricas = [
    {
      label: "SALDO CAJA",
      value: saldoCaja,
      icon: <MonetizationOnIcon sx={{ fontSize: 22 }} />,
      color: "#4caf50",
    },
    {
      label: "SALDO BANCO",
      value: saldoBanco,
      icon: <AccountBalanceIcon sx={{ fontSize: 22 }} />,
      color: "#2196f3",
    },
    {
      label: "TOTAL POR COBRAR",
      value: totalPorCobrar,
      icon: <ReceiptIcon sx={{ fontSize: 22 }} />,
      color: "#ff9800",
    },
    {
      label: "TOTAL POR PAGAR",
      value: totalPorPagar,
      icon: <PaymentIcon sx={{ fontSize: 22 }} />,
      color: "#f44336",
    },
    {
      label: "LIQUIDEZ (CAJA+BANCO)",
      value: liquidez,
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 22 }} />,
      color: "#1976d2",
    },
  ];

  const getTipoColor = (tipo: string) => {
    if (tipo === "ingreso" || tipo === "deposito" || tipo === "deposito_desde_caja") return "success";
    if (tipo === "egreso" || tipo === "retiro" || tipo === "cheque") return "error";
    return "default";
  };

  const getTipoLabel = (tipo: string) => {
    const map: Record<string, string> = {
      ingreso: "Ingreso",
      egreso: "Egreso",
      apertura: "Apertura",
      cierre: "Cierre",
      deposito: "Depósito",
      retiro: "Retiro",
      transferencia: "Transferencia",
      cheque: "Cheque",
      deposito_desde_caja: "Dep. desde Caja",
    };
    return map[tipo] || tipo;
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <Box sx={{ m: 2, display: "flex", flexDirection: "column", gap: 3 }}>
      {/* ═══════════════════════════════════════════════════════
          TÍTULO
         ═══════════════════════════════════════════════════════ */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          background: HEADER_GRADIENT,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        📊 Resumen General
      </Typography>

      {/* ═══════════════════════════════════════════════════════
          CARDS DE MÉTRICAS (mismo estilo que Saldo Actual en Caja)
         ═══════════════════════════════════════════════════════ */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        {metricas.map((m) => (
          <Card
            key={m.label}
            sx={{
              flex: "1 1 220px",
              minWidth: 200,
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.04)",
              overflow: "hidden",
              background: HEADER_GRADIENT,
            }}
          >
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  width: 44,
                  height: 44,
                }}
              >
                {m.icon}
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
                  {m.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-0.02em",
                  }}
                >
                  ${m.value.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* ═══════════════════════════════════════════════════════
          ÚLTIMOS MOVIMIENTOS
         ═══════════════════════════════════════════════════════ */}
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
            background: HEADER_GRADIENT,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⚡ Últimos movimientos
        </Typography>

        {ultimosMovimientos.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography variant="body1" sx={{ color: "#888" }}>
              Sin movimientos
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {ultimosMovimientos.map((mov) => (
              <Box
                key={mov._id + mov.origen}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "rgba(0,0,0,0.02)",
                  "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor:
                        mov.origen === "Caja"
                          ? "rgba(0,114,255,0.1)"
                          : "rgba(142,45,226,0.1)",
                      color: mov.origen === "Caja" ? "#0072ff" : "#8e2de2",
                    }}
                  >
                    {mov.origen === "Caja" ? (
                      mov.tipo === "ingreso" ? (
                        <TrendingUpIcon sx={{ fontSize: 16 }} />
                      ) : mov.tipo === "egreso" ? (
                        <TrendingDownIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <SwapHorizIcon sx={{ fontSize: 16 }} />
                      )
                    ) : (
                      <AccountBalanceIcon sx={{ fontSize: 16 }} />
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1a1a2e" }}>
                      {mov.descripcion}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#888" }}>
                      {new Date(mov.fecha).toLocaleDateString("es-ES")} · {mov.origen}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Chip
                    label={getTipoLabel(mov.tipo)}
                    size="small"
                    color={getTipoColor(mov.tipo) as any}
                    sx={{ fontSize: "0.7rem", height: 22 }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      minWidth: 80,
                      textAlign: "right",
                      color:
                        mov.tipo === "ingreso" || mov.tipo === "deposito" || mov.tipo === "deposito_desde_caja"
                          ? "#4caf50"
                          : mov.tipo === "egreso" || mov.tipo === "retiro" || mov.tipo === "cheque"
                          ? "#f44336"
                          : "#666",
                    }}
                  >
                    ${mov.monto.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
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
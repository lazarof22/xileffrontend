// src/pages/finanzas/Finanzas.tsx
import { Box, Typography, Tabs, Tab, Snackbar, Alert } from "@mui/material";
import { useState } from "react";
import FinanzasTabTablero from "../../components/FinanzasTabTablero";
import FinanzasTabTransaccion from "../../components/FinanzasTabTransaccion";
import FinanzasTabCuentasCobrar from "../../components/FinanzasTabCuentasCobrar";
import FinanzasTabCaja from "../../components/FinanzasTabCaja";
import FinanzasTabCobros from "../../components/FinanzasTabCobros";
import FinanzasTabPago from "../../components/FinanzasTabPago";
import FinanzasTabBanco from "../../components/FinanzasTabBanco";
import FinanzasTabCredito from "../../components/FinanzasTabCredito";
import FinanzasTabAnticipos from "../../components/FinanzasTabAnticipos";

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasPage() {
  const [tabValue, setTabValue] = useState(0);

  // Snackbar global
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════
          HEADER
         ═══════════════════════════════════════════════════════════════ */}
      <Box
        sx={{
          width: "100%",
          height: 60,
          background:
            "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
        }}
      >
        <Typography variant="h5" sx={{ ml: 2, color: "white" }}>
          Gestión Financiera
        </Typography>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════
          TABS PRINCIPALES
         ═══════════════════════════════════════════════════════════════ */}
      <Box sx={{ px: 2, mt: 1 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTabs-flexContainer": { gap: "2px" },
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
          }}
        >
          <Tab label="Tablero" />
          <Tab label="Transacciones" />
          <Tab label="Cuentas por Cobrar" />
          <Tab label="Caja" />
          <Tab label="Cobros (Oblig.)" />
          <Tab label="Pagos (Oblig.)" />
          <Tab label="Banco" />
          <Tab label="Créditos Bancarios" />
          <Tab label="Anticipos" />
        </Tabs>
      </Box>

      {/* ═══════════════════════════════════════════════════════════════
          CONTENIDO POR TAB
         ═══════════════════════════════════════════════════════════════ */}
      {tabValue === 0 && <FinanzasTabTablero />}
      {tabValue === 1 && <FinanzasTabTransaccion />}
      {tabValue === 2 && <FinanzasTabCuentasCobrar />}
      {tabValue === 3 && <FinanzasTabCaja />}
      {tabValue === 4 && <FinanzasTabCobros />}
      {tabValue === 5 && <FinanzasTabPago />}
      {tabValue === 6 && <FinanzasTabBanco />}
      {tabValue === 7 && <FinanzasTabCredito />}
      {tabValue === 8 && <FinanzasTabAnticipos />}

      {/* ═══════════════════════════════════════════════════════════════
          SNACKBAR GLOBAL
         ═══════════════════════════════════════════════════════════════ */}
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
    </div>
  );
}
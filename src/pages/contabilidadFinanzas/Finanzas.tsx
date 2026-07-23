import {
    Box,
    Button,
    Typography,
    Card,
    Snackbar,
    Alert,
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
  } from "@mui/material";
  import ReceiptIcon from "@mui/icons-material/Receipt";  // para el header del tab
  import AddIcon from "@mui/icons-material/Add";
  import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
  import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
  import AddCircleIcon from "@mui/icons-material/AddCircle";
  import TrendingUpIcon from "@mui/icons-material/TrendingUp";
  import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
  import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
  import TableChartIcon from "@mui/icons-material/TableChart";
  import PlayArrowIcon from "@mui/icons-material/PlayArrow";
  import CustomDataGrid from "../../components/CustomDataGridR";
  import AddTransaccionDialog from "../../components/AddTransaccionDialog";
  import { useState, useEffect } from "react";
  import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
  import CheckCircleIcon from "@mui/icons-material/CheckCircle";
  // ═══════════════════════════════════════════════════════════════════════
  // TIPOS
  // ═══════════════════════════════════════════════════════════════════════
  
  interface TransaccionFormData {
    id?: string;
    fecha: string;
    concepto: string;
    ingreso: number;
    egreso: number;
    saldo: number;
  }
  
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

  // ── TIPOS BANCO ────────────────────────────────────────────────────
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

// ── TIPOS ANTICIPOS ────────────────────────────────────────────────
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

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";
  
  const ESTADOS_CXC = [
    { value: "pendiente", label: "Pendiente", color: "warning" as const },
    { value: "parcial", label: "Parcial", color: "info" as const },
    { value: "pagada", label: "Pagada", color: "success" as const },
    { value: "vencida", label: "Vencida", color: "error" as const },
    { value: "anulada", label: "Anulada", color: "default" as const },
  ];
  
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
  // COMPONENTE PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════
  
  export default function FinanzasPage() {
    // ── Tabs ────────────────────────────────────────────────────────────
    const [tabValue, setTabValue] = useState(0);
  
    // ── Snackbar ────────────────────────────────────────────────────────
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  
    // ═══════════════════════════════════════════════════════════════════
    // TAB 0: TRANSACCIONES
    // ═══════════════════════════════════════════════════════════════════
    const [rows, setRows] = useState<any[]>([]);
    const [openCreateTransaccion, setOpenCreateTransaccion] = useState<boolean>(false);
  
    // ═══════════════════════════════════════════════════════════════════
    // TAB 1: CUENTAS POR COBRAR
    // ═══════════════════════════════════════════════════════════════════
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
  
    // ═══════════════════════════════════════════════════════════════════
    // TAB 2: CAJA
    // ═══════════════════════════════════════════════════════════════════
    const [cuentas, setCuentas] = useState<CuentaCaja[]>([]);
    const [openCuentaDialog, setOpenCuentaDialog] = useState(false);
    const [cuentaForm, setCuentaForm] = useState<Partial<CuentaCaja>>({
      tipo: "principal",
      saldoInicial: 0,
      montoFondoFijo: 0,
      montoMinimo: 0,
    });
  
    const [movimientos, setMovimientos] = useState<MovimientoCaja[]>([]);
    const [openMovimientoDialog, setOpenMovimientoDialog] = useState(false);
    const [movimientoForm, setMovimientoForm] = useState<Partial<MovimientoCaja>>({
      tipo: "ingreso",
      concepto: "ventas_efectivo",
      fecha: new Date().toISOString().split("T")[0],
    });
  
    const [arqueos, setArqueos] = useState<ArqueoCaja[]>([]);
    const [openArqueoDialog, setOpenArqueoDialog] = useState(false);
    const [arqueoForm, setArqueoForm] = useState<Partial<ArqueoCaja>>({
      efectivoContado: 0,
    });
  
    const [saldos, setSaldos] = useState<any[]>([]);
    const [cajaSubTab, setCajaSubTab] = useState(0);
    // ═══════════════════════════════════════════════════════════════════
  // TAB 4: BANCO
  // ═══════════════════════════════════════════════════════════════════
  const [cuentasBanco, setCuentasBanco] = useState<CuentaBancaria[]>([]);
  const [saldosBanco, setSaldosBanco] = useState<SaldoBanco[]>([]);
  const [movimientosBanco, setMovimientosBanco] = useState<MovimientoBanco[]>([]);
  const [openCuentaBancoDialog, setOpenCuentaBancoDialog] = useState(false);
  const [openMovimientoBancoDialog, setOpenMovimientoBancoDialog] = useState(false);
  const [bancoSubTab, setBancoSubTab] = useState(0);

  //Anticipo:Constantes
  const TIPOS_ANTICIPO = [
  { value: "cobro_anticipado", label: "Cobro Anticipado (Recibimos)", color: "success" as const },
  { value: "pago_anticipado", label: "Pago Anticipado (Entregamos)", color: "warning" as const },
];

const ESTADOS_ANTICIPO = [
  { value: "pendiente", label: "Pendiente", color: "warning" as const },
  { value: "liquidado", label: "Liquidado", color: "success" as const },
  { value: "anulado", label: "Anulado", color: "error" as const },
];

  const [cuentaBancoForm, setCuentaBancoForm] = useState<Partial<CuentaBancaria>>({
    tipoCuenta: "corriente",
    saldoInicial: 0,
    fechaApertura: new Date().toISOString().split("T")[0],
  });

  const [movimientoBancoForm, setMovimientoBancoForm] = useState<Partial<MovimientoBanco>>({
    tipo: "deposito",
    fecha: new Date().toISOString().split("T")[0],
  });

    // ═══════════════════════════════════════════════════════════════════
  // TAB 6: ANTICIPOS (tabValue === 6)
  // ═══════════════════════════════════════════════════════════════════
  const [anticipos, setAnticipos] = useState<Anticipo[]>([]);
  const [resumenAnticipos, setResumenAnticipos] = useState<ResumenAnticipos | null>(null);
  const [anticipoForm, setAnticipoForm] = useState({
    tercero: "",
    monto: 0,
    tipo: "cobro_anticipado" as "cobro_anticipado" | "pago_anticipado",
    descripcion: "",
  });

  
    // ═══════════════════════════════════════════════════════════════════
    // FETCH HELPERS
    // ═══════════════════════════════════════════════════════════════════
  
    const showSnackbar = (message: string, severity: "success" | "error" = "success") => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setOpenSnackbar(true);
    };
  
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

      // ── FETCH HELPERS BANCO ───────────────────────────────────────────
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

  //helpers de Anticipo:
    // ── FETCH HELPERS ANTICIPOS ───────────────────────────────────────
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
  
    // ═══════════════════════════════════════════════════════════════════
    // useEffect
    // ═══════════════════════════════════════════════════════════════════
  
    useEffect(() => {
      if (tabValue === 1) {
        fetchCuentasCobrar();
        fetchResumenCxC();
      }
      if (tabValue === 2) {
        fetchCuentas();
        fetchMovimientos();
        fetchArqueos();
        fetchSaldos();
      }
      if (tabValue === 4) {
      fetchCuentasBanco();
      fetchSaldosBanco();
      fetchMovimientosBanco();
      }
      
      if (tabValue === 6) {
        fetchAnticipos();
        fetchResumenAnticipos();
      }
    }, [tabValue]);
  
    // ═══════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════
  
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
          <Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                ml: 1,
                background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                },
              }}
              onClick={() => {
  if (tabValue === 0) setOpenCreateTransaccion(true);
  if (tabValue === 4) setOpenMovimientoBancoDialog(true);
}}
            >
              {tabValue === 0 ? "Nueva Transacción" : tabValue === 4 ? "Nuevo Movimiento" : ""}
            </Button>
            <Button
              variant="contained"
              startIcon={<AssignmentAddIcon />}
              sx={{
                ml: 1,
                background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
                color: "#fff",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                },
              }}
            >
              Estado Financiero
            </Button>
          </Box>
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
            <Tab label="Transacciones" />
            <Tab label="Cuentas por Cobrar" />
            <Tab label="Caja" />
            <Tab label="Cuentas por Pagar" />
            <Tab label="Banco" />
            <Tab label="Créditos" />
            <Tab label="Anticipos" />
            <Tab label="Presupuesto" />
            <Tab label="Reportes" />
            <Tab label="Configuración" />
          </Tabs>
        </Box>
  
        {/* ═══════════════════════════════════════════════════════════════
            CONTENIDO: TAB 0 — TRANSACCIONES
           ═══════════════════════════════════════════════════════════════ */}
        {tabValue === 0 && (
          <Card sx={{ m: 2, p: 2, borderRadius: 2 }}>
            <CustomDataGrid
              title="Finanzas"
              rows={rows}
              getRowId={(row: any) => row.id}
              columns={[
                { field: "fecha", headerName: "Fecha" },
                { field: "concepto", headerName: "Concepto" },
                { field: "ingreso", headerName: "Ingreso", numeric: true },
                { field: "egreso", headerName: "Egreso", numeric: true },
                { field: "saldo", headerName: "Saldo", numeric: true },
                { field: "acciones", headerName: "Acciones" },
              ]}
            />
  
            <AddTransaccionDialog
              open={openCreateTransaccion}
              onClose={() => setOpenCreateTransaccion(false)}
              onTransaccionCreado={(Transaccion: TransaccionFormData) => {
                setOpenCreateTransaccion(false);
              }}
            />
          </Card>
        )}
  
        {/* ═══════════════════════════════════════════════════════════════
            CONTENIDO: TAB 1 — CUENTAS POR COBRAR
            Dos Box centrados con sombra leve, lado a lado
           ═══════════════════════════════════════════════════════════════ */}
        {tabValue === 1 && (
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

              {/* Botón Registrar centrado y pequeño */}
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
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
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
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
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
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    },
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
                TABLA DE CxC (estilo Banco — sin maxWidth)
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
          </Box>
        )}
  
        {tabValue === 2 && (
          <Box sx={{ m: 2 }}>
            {/* ── Saldos Actuales (width fijo 400px) ────────────────── */}
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
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        width: 40,
                        height: 40,
                      }}
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
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "white",
                          letterSpacing: "-0.02em",
                        }}
                      >
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
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        width: 40,
                        height: 40,
                      }}
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
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "white",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        $0.00
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              )}
            </Box>
  
            {/* ── Botones de acción para Caja ─────────────────────────── */}
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
  
            {/* ── Sub-tabs de Caja ────────────────────────────────────── */}
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
  
            {/* ── Sub-tab 1: Movimientos ────────────────────────────── */}
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
                      renderCell: (params: any) =>
                        new Date(params.value).toLocaleDateString("es-ES"),
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
                            params.value === "ingreso"
                              ? "success"
                              : params.value === "egreso"
                              ? "error"
                              : "default"
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
                      renderCell: (params: any) =>
                        new Date(params.value).toLocaleDateString("es-ES"),
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
                        <Typography
                          fontWeight={600}
                          color={params.value === 0 ? "success.main" : "error.main"}
                        >
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
          </Box>
        )}
                {/* ═══════════════════════════════════════════════════════════════
            CONTENIDO: TAB 4 — BANCO
           ═══════════════════════════════════════════════════════════════ */}
        {tabValue === 4 && (
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
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        width: 40,
                        height: 40,
                      }}
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
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "white",
                          letterSpacing: "-0.02em",
                        }}
                      >
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
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        width: 40,
                        height: 40,
                      }}
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
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: "white",
                          letterSpacing: "-0.02em",
                        }}
                      >
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
                      renderCell: (params: any) =>
                        new Date(params.value).toLocaleDateString("es-ES"),
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
          </Box>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            CONTENIDO: TAB 3, 5+ — Placeholders
           ═══════════════════════════════════════════════════════════════ */}
        {tabValue === 3 && (
          <Card sx={{ m: 2, p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Cuentas por Pagar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Este módulo aún no está implementado.
            </Typography>
          </Card>
        )}
        

                {/* ═══════════════════════════════════════════════════════════════
            CONTENIDO: TAB 6 — ANTICIPOS
           ═══════════════════════════════════════════════════════════════ */}
        {tabValue === 6 && (
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
                TABLA: HISTORIAL DE ANTICIPOS (estilo Banco — sin maxWidth)
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
                    renderCell: (params: any) =>
                      new Date(params.value).toLocaleDateString("es-ES"),
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
          </Box>
        )}
        {tabValue === 3 && (
          <Card sx={{ m: 2, p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Cuentas por Pagar
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Este módulo aún no está implementado.
            </Typography>
          </Card>
        )}
        {tabValue === 5 && (
          <Card sx={{ m: 2, p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              Créditos
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Este módulo aún no está implementado.
            </Typography>
          </Card>
        )}
        {tabValue >= 7 && (
          <Card sx={{ m: 2, p: 4, borderRadius: 2, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">
              {["Presupuesto", "Reportes", "Configuración"][tabValue - 7] || "Módulo en desarrollo"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Este módulo aún no está implementado.
            </Typography>
          </Card>
        )}

      

      {/* ═══════════════════════════════════════════════════════════════
          DIÁLOGOS DE CAJA (fuera del div principal pero dentro del return)
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
      <Dialog
        open={openMovimientoDialog}
        onClose={() => setOpenMovimientoDialog(false)}
        maxWidth="sm"
        fullWidth
      >
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

      {/* ═══════════════════════════════════════════════════════════════
          SNACKBAR
         ═══════════════════════════════════════════════════════════════ */}
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity={snackbarSeverity} variant="filled" onClose={() => setOpenSnackbar(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      </div> 
  );
}
// src/pages/finanzas/tabs/FinanzasTabTransaccion.tsx
import {
  Card,
} from "@mui/material";
import { useState } from "react";
import CustomDataGrid from "./CustomDataGrid";
import AddTransaccionDialog from "./AddTransaccionDialog";

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

export interface TransaccionFormData {
  id?: string;
  fecha: string;
  concepto: string;
  ingreso: number;
  egreso: number;
  saldo: number;
}

// ═══════════════════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════════════════

export default function FinanzasTabTransaccion() {
  const [rows, setRows] = useState<any[]>([]);
  const [openCreateTransaccion, setOpenCreateTransaccion] = useState<boolean>(false);

  return (
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
          // TODO: actualizar rows si es necesario
        }}
      />
    </Card>
  );
}
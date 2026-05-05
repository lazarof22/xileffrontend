import React from 'react'
import {
    Typography,
    Box,
    Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CustomDataGrid from "../../components/CustomDataGridR";
import { useState } from 'react';

export default function Activos() {
    const [rows, setRows] = useState<any[]>([]);
  return (
    <div>
      <Box
                      sx={{
                          width: '100%',
                          height: 60,
                          background: "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          alignContent: 'center',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          px: 2,
                      }}>
                      <Typography variant="h5" sx={{ ml: 2, color: 'white' }}>
                          Gestión de Activos Fijos
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
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                  }
                              }}
                              onClick={() => setOpenCreateDialog(true)}
                          >
                              Nuevo Activo
                          </Button>
                          <Button
                              variant="contained"
                              startIcon={<DeleteIcon/>}
                              sx={{
                                  ml: 1,
                                  background: "linear-gradient(135deg, rgb(0, 174, 255), rgba(196, 45, 226, 0.9))",
                                  color: "#fff",
                                  textTransform: "none",
                                  fontWeight: 600,
                                  boxShadow: "none",
                                  "&:hover": {
                                      background: "linear-gradient(135deg, rgb(0, 174, 255), rgb(196, 45, 226))",
                                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                                  }
                              }}
                              onClick={() => setOpenCreateDialog(true)}
                          >
                              Eliminar Activo
                          </Button>
                      </Box>
                  </Box>

                {/* Tabla de activos */}
                    <CustomDataGrid
                                                        title="Activos"
                                                        rows={rows}
                                                        getRowId={(row) => row.id}
                                                        columns={[
                                                            { field: "codigo", headerName: "Código" },
                                                            { field: "descripcion", headerName: "Descripción" },
                                                            { field: "fecha de compra", headerName: "Fecha compra" },
                                                            { field: "movimiento", headerName: "Movimiento"},
                                                            { field: "estado", headerName: "Estado"},
                                                            { field: "valor", headerName: "Valor", numeric: true },
                                                            { field: "ajuste de Valor", headerName: "Ajuste valor", numeric: true },
                                                            { field: "depreciacion", headerName: "Depreciación",numeric:true },
                                                            { field: "compras de activos", headerName: "Compras activos",numeric:true },
                                                            { field: "estado", headerName: "Estado",numeric:true },
                                                        ]}
                                                    />
    </div>
  )
}

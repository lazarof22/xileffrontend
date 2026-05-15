import { Box,
    Button,
    Typography,
    Card,
    Snackbar,
    Alert} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';
import CustomDataGrid from "../../components/CustomDataGridR";
import AddTransaccionDialog from "../../components/AddTransaccionDialog";
import { useState } from "react";


export default function FinanzasPage() {
    const [rows, setRows] = useState<any[]>([]);

    const [openCreateTransaccion,setOpenCreateTransaccion]=useState<boolean>(false);
    

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

    return (
        <div>
            <Box>
            <Box
                sx={{
                    width: '100%',
                    height: 60,
                    background:
                        "linear-gradient(135deg, rgba(0,114,255,0.9), rgba(142,45,226,0.9)), url('/images/login-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    alignContent: 'center',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    px: 2,
                }}>
                <Typography variant="h5" sx={{ ml: 2, color: 'white' }}>
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
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                        onClick={(e:React.MouseEvent<HTMLButtonElement>)=>{
                            setOpenCreateTransaccion(true)
                        }}
                    >
                        Nueva Transacción
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
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                            }
                        }}
                    >
                        Estado Financiero
                    </Button>
                </Box>
            </Box>
        </Box>

        {/* Tabla de Transaccions */}
                        <Card sx={{ width: '100%',p:2  }}>
                            <CustomDataGrid
                                title="Finanzas"
                                rows={rows}
                                getRowId={(row) => row.id}
                                columns={[
                                    { field: "fecha", headerName: "Fecha" },
                                    { field: "concepto", headerName: "Concepto" },
                                    { field: "ingreso", headerName: "Ingreso", numeric: true },
                                    { field: "egreso", headerName: "Egreso", numeric: true},
                                    { field: "saldo", headerName: "Saldo", numeric: true},
                                    { field: "acciones", headerName: "Acciones" },
                                ]}
                            />
        </Card>

        <AddTransaccionDialog
                        open={openCreateTransaccion}
            onClose={() => setOpenCreateTransaccion(false)}
            onTransaccionCreado={(Transaccion: TransaccionFormData) => {
                
                setOpenCreateTransaccion(false);
            }}
                        ></AddTransaccionDialog>

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
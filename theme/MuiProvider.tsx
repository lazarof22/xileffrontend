'use client';

import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#3498db', // --secondary
        },
        secondary: {
            main: '#2c3e50', // --primary / --dark
        },
        success: {
            main: '#27ae60',
        },
        warning: {
            main: '#f39c12',
        },
        error: {
            main: '#e74c3c',
        },
        info: {
            main: '#17a2b8',
        },
        background: {
            default: '#f8f9fa',
            paper: '#ffffff',
        },
        text: {
            primary: '#2c3e50',
            secondary: '#555',
        },
    },

    shape: {
        borderRadius: 10, // coincide con tus cards y módulos
    },

    typography: {
        fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
        h5: {
            fontWeight: 700,
        },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },

    components: {
        // 🔘 BOTONES
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 5,
                    padding: '10px 20px',
                    boxShadow: 'none',
                },
                containedPrimary: {
                    backgroundColor: '#3498db',
                },
                containedSuccess: {
                    backgroundColor: '#27ae60',
                },
                containedError: {
                    backgroundColor: '#e74c3c',
                },
                containedWarning: {
                    backgroundColor: '#f39c12',
                },
            },
        },

        // 🧾 CARDS
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                },
            },
        },

        // 📦 PAPER (modales, cajas blancas)
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
                elevation1: {
                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                },
            },
        },

        // 🧠 TEXTFIELDS / INPUTS
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 5,
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3498db',
                        borderWidth: 2,
                    },
                },
            },
        },

        // 📊 TABLAS
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ecf0f1',
                },
            },
        },

        // 🧭 APPBAR (header oscuro)
        MuiAppBar: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                    background:
                        "linear-gradient(100deg, #2c3e50, rgba(142,45,226,0.9)),url('/images/login-bg.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "bottom",
                },
            },
        },

        // 🧩 DRAWER / SIDEBAR
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#2c3e50',
                    color: '#fff',
                    borderRadius: 0,
                },
            },
        },
    },
});

export default function MuiProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                {children}
            </Box>
        </ThemeProvider>
    );
}

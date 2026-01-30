"use client";

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import AccountCircle from '@mui/icons-material/AccountCircle';
import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Box from '@mui/material/Box';
import SendIcon from '@mui/icons-material/Send';
import Checkbox from '@mui/material/Checkbox';
import Avatar from '@mui/material/Avatar';
import { useRouter } from 'next/navigation';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LockIcon from '@mui/icons-material/Lock';


export default function LoginPage() {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const router = useRouter();

    return (
        <>
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Card sx={{ width: 400, height: 510, borderRadius: 3, boxShadow: 24 }}>
                    <CardContent sx={{mt:2, justifyItems: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                        <Box display={'flex'} sx={{ alignItems: 'center' }}>
                            <RocketLaunchIcon sx={{ fontSize: 40 }} />
                            <Typography gutterBottom variant="h5" component="div" textAlign={'center'} m={'2'}>
                                SISTEMA XILEF
                            </Typography>
                            <RocketLaunchIcon sx={{ fontSize: 40 }} />
                        </Box>
                        <Box display={'flex'} mt={2}>
                            <LockIcon sx={{ fontSize: 25 }} />
                            <Typography gutterBottom component="div" textAlign={'center'} m={'2'}>
                                Sistema Integral ERP
                            </Typography>
                            <LockIcon sx={{ fontSize: 25 }} />
                        </Box>
                        <FormControl sx={{ m: 2, width: '40ch' }} variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-usuario">Usuario</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-usuario"
                                endAdornment={
                                    <InputAdornment position="end">
                                        <AccountCircle />
                                    </InputAdornment>
                                }
                                label="Usuario"
                            />
                        </FormControl>
                        <FormControl sx={{ m: 2, width: '40ch' }} variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-password">Contraseña</InputLabel>
                            <OutlinedInput
                                id="outlined-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={
                                                showPassword ? 'hide the password' : 'display the password'
                                            }
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            onMouseUp={handleMouseUpPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Password"
                            />
                        </FormControl>
                        <Box display={'flex'} sx={{}}>
                            <label>
                                <Checkbox
                                    /*checked={""}
                                    onChange={e => {
                                        setCorrecto(e.target.checked);
                                        if (e.target.checked) {
                                            setIncorrecto(false);
                                        }
                                    }}*/
                                    color="primary"
                                />
                                Recuerdame
                            </label>
                            <Button sx={{ ml: 6 }} href="#text-buttons">Olvidaste tu contraseña</Button>
                        </Box>
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: 400
                        }}>
                            <Button
                                variant="contained"
                                endIcon={<SendIcon />}
                                sx={{ width: { xs: '100%', sm: '32ch' }, height: 43 }}
                                onClick={() => router.push('/dashboard')}
                            >
                                Iniciar Sesión
                            </Button>
                            <Button
                                variant="outlined"
                                endIcon={<SendIcon />}
                                sx={{ width: { xs: '100%', sm: '32ch' }, height: 43, mt: 1 }}
                                onClick={() => router.push('/dashboard')}
                            >
                                Registrarse
                            </Button>
                        </Box>
                    </CardActions>
                </Card>
            </Box >
        </>
    );
}

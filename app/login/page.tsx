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

export default function LoginPage() {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    return (
        <>
            <Box sx={{
                minHeight: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <Card sx={{ width: 400, height: 510, borderRadius: 3, boxShadow: 24 }}>
                    <CardMedia>
                        <Avatar
                            sx={{ width: 100, height: 100, marginLeft: 'auto', marginRight: 'auto', marginTop: 2, borderColor: '#00e5ff', borderWidth: 1, borderStyle: 'solid' }}
                        />
                    </CardMedia>
                    <CardContent sx={{ justifyItems: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                        <Typography gutterBottom variant="h5" component="div" textAlign={'center'} m={'2'}>
                            Bienvenido a ACIT
                        </Typography>
                        <Typography gutterBottom variant="h5" component="div" textAlign={'center'}>
                            Incio de Sesión
                        </Typography>
                        <FormControl sx={{ m: 1, width: '30ch' }} variant="outlined">
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
                        <FormControl sx={{ m: 1, width: '30ch' }} variant="outlined">
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
                        <Box sx={{ ml: -10 }}>
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
                                Guardar Credenciales
                            </label>
                        </Box>
                    </CardContent>
                    <CardActions sx={{ justifyItems: 'center', alignItems: 'center', display: 'flex', flexDirection: 'column' }}>
                        <Button variant="contained" endIcon={<SendIcon />} sx={{ width: '32ch', height: 43, }}>
                            Iniciar Sesión
                        </Button>
                    </CardActions>
                </Card>
            </Box>
        </>
    );
}

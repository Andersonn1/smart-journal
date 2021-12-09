
import React, { useState } from "react";
import { setAppUser, setAuthToken, isAuthenticated } from "./utils/auth";
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import { Redirect, Link } from "react-router-dom";
import { PinDropSharp } from "@mui/icons-material";

const theme = createTheme();

export default function Login({ history }) {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [error, setError] = useState();
    const [hideError, closeError] = useState(false);

    const submit = (event) => {
        event.preventDefault();
        let data = new FormData();
        data.append('email', email);
        data.append('password', password)
        fetch('/authenticate', { method: "POST", body: data })
            .then(res => res.json()).then(data => {

                if (data.Success) {
                    setAppUser(data.Data)
                    setAuthToken(data.Jwt)
                    renderRedirect();
                } else {
                    setError(data.Message);
                    closeError(true);
                }
            });
    }
    const renderRedirect = () => {
        if (isAuthenticated()) {
            history.push('/dashboard');
            //window.location.pathname = '/dashboard';
        }
    }
    return (<ThemeProvider theme={theme}>
        {renderRedirect()}
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >   <Collapse in={hideError}>
                    <Alert severity="error" onClose={() => { setError(''); closeError(false); }}>
                        {error}
                    </Alert>
                </Collapse>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                <Box component="form" onSubmit={submit} noValidate sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link to="/signup" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    </ThemeProvider>);
}
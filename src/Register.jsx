
import React, { useState } from "react";
import { isAuthenticated } from "./utils/auth";
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

const theme = createTheme();

export default function Register({ history }) {
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [first_name, setFirstName] = useState();
    const [last_name, setLastName] = useState();
    const [confirmPassword, setConfirmPassword] = useState();
    const [error, setError] = useState();
    const [hideError, closeError] = useState(false);

    const submit = (event) => {
        event.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords must match!');
            return;
        }
        if (email && first_name && last_name && password && confirmPassword) {
            let data = new FormData();
            data.append('email', email);
            data.append('password', password)
            data.append('first_name', first_name)
            data.append('last_name', last_name)
            fetch('/register', {
                method: "POST",
                body: data
            })
                .then(res => res.json()).then(data => {
                    if (data.Success) {
                        renderRedirect(true);
                    } else {
                        setError(data.Message);
                        closeError(true);
                        return;
                    }
                });
        } else {
            setError('Please validate all field filled in!');
        }

        return;
    }

    const renderRedirect = (success) => {
        if (isAuthenticated()) {
            history.push("/dashboard")
            //window.location.pathname = '/dashboard';
        } else {
            if (success) {
                history.push("/")
                // window.location.pathname = '/';
            }
        }
    }

    return (<ThemeProvider theme={theme}>
        <Container component="main" maxWidth="xs">
            {renderRedirect(false)}
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
                        id="first_name"
                        label="First Name"
                        name="first_name"
                        autoComplete="first_name"
                        autoFocus
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="last_name"
                        label="Last Name"
                        name="last_name"
                        autoComplete="last_name"
                        autoFocus
                        onChange={(e) => setLastName(e.target.value)}
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
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="current-password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Register
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link to="/" variant="body2">
                                {"Already have an account? Login"}
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    </ThemeProvider>);
}
import React, { useEffect, useState } from 'react';
import { isAuthenticated, removeAppUser, removeAuthToken, getAuthToken, getAppUser } from './utils/auth';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Chart from "react-google-charts";
import { ButtonGroup, Grid, IconButton } from '@mui/material';
import { useCallback } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Redirect } from 'react-router-dom';
const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};
export default function Dashboard({ history }) {
    const [data, setData] = useState([]);
    const [mood, setMood] = useState([]);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [error, setError] = useState('');
    const [isReadOnlyModal, setModalViewMode] = useState(false);
    const [hideError, closeError] = useState(false);
    const [hideMessage, closeMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalData, setModalData] = useState({ id: '', title: '', body: '', create_date: '', delete_date: '', is_active: true });

    const signOut = useCallback(() => {
        removeAppUser();
        removeAuthToken();
        renderRedirect();
    }, [])

    const save = () => {
        if (modalData.id === '') {
            createNote(modalData);
        }
        else {
            let newNote = modalData;
            newNote.title = title;
            newNote.body = body;
            updateNote(newNote)
        }

        setShowModal(false)
        setModalData(null)
        setTitle('')
        setBody('')
    }

    const getNotes = useCallback((delay) => fetch('/journal/all', {
        method: "GET",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-access-token': getAuthToken()
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.Success) {
                if (delay) {
                    setTimeout(function () { setMessage(data.Message); }, 3000);
                } else {
                    setMessage(data.Message)
                }
                closeMessage(true)
                setData(data.Data);
                let newMoods = [];
                data.Mood.forEach((x) => {
                    x.Mood = x.Mood.replace(/'/g, '"');
                    x.Mood = JSON.parse(x.Mood);
                    newMoods.push(x);
                });

                setMood(newMoods);
                setShowModal(false);
            } else {
                if (data.Message === 'INVALID_TOKEN_EXPIRED') {
                    signOut()
                } else {
                    setError(data.Message);
                    closeError(true);
                }
            }
        }), [signOut]);

    useEffect(() => {
        getNotes(false);
    }, [getNotes]);



    const createNote = (newNote) => {
        fetch('/journal/create', {
            method: "POST", headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "x-access-token": getAuthToken()
            }, body: JSON.stringify(newNote)
        })
            .then(response => response.json())
            .then(data => {
                if (data.Success) {
                    setMessage(data.Message)
                    closeMessage(true)
                    getNotes(true);
                } else {
                    if (data.Message === 'INVALID_TOKEN_EXPIRED') {
                        signOut()
                    } else {
                        setError(data.Message);
                        closeError(true);
                        setModalData(null)
                        setTitle('')
                        setBody('')
                    }

                }
            })
    }

    const updateNote = (note) => {
        fetch('journal/update', {
            method: "POST", headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json', "x-access-token": getAuthToken()
            }, body: JSON.stringify(note)
        })
            .then(response => response.json())
            .then(data => {
                if (data.Success) {
                    getNotes(true);
                    setMessage(data.Message)
                    closeMessage(true)
                } else {
                    if (data.Message === 'INVALID_TOKEN_EXPIRED') {
                        signOut()
                    } else {
                        setError(data.Message);
                        closeError(true);
                    }

                }
            })
    }

    const createNewNote = () => {
        setShowModal(true);
        let user = getAppUser();
        setModalData({ id: '', title: '', body: '', create_date: '', delete_date: '', is_active: true, user_id: user.Id });
    }

    const editNote = (old, isReadOnly) => {
        setShowModal(true);
        setTitle(old.Title);
        setBody(old.Body);
        setModalViewMode(isReadOnly);
        setModalData({ id: old.Id, title: old.Title, body: old.Body, create_date: old.Create_Date, delete_date: old.Delete_Date, is_active: old.Is_Active, user_id: old.User_Id });
    }

    const handleClose = () => {
        setShowModal(false);
        setModalData(null);
        setModalViewMode(false);
    }


    const renderRedirect = () => {
        if (!isAuthenticated()) {
            history.push("/")
            // window.location.pathname = '/';
        }
    }

    function Row(props) {
        const { item, i } = props;
        const [open, setOpen] = useState(false);
        return (<React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} key={`row-${i}`}>
                <TableCell key="a">
                    <IconButton key="x"
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon key="x" /> : <KeyboardArrowDownIcon key="y" />}
                    </IconButton>
                </TableCell>
                <TableCell key="b" component="th" scope="row">
                    {item.Title}
                </TableCell>
                <TableCell key="c">{`${item.Body.substring(0, 50)}...`}</TableCell>
                <TableCell key="d">{item.Create_Date}</TableCell>
                <TableCell key="e" >{Object.keys(mood[i].Mood).reduce((a, b) => mood[i].Mood[a] > mood[i].Mood[b] ? a : b)}</TableCell>
                <TableCell key="f">
                    <Button key="v"
                        variant='contained'
                        onClick={(e) => { e.preventDefault(); editNote(item, true); }}
                        size="medium"
                    >
                        View
                    </Button>
                </TableCell>
                <TableCell key="g">
                    <Button key="u"
                        variant='contained'
                        onClick={(e) => { e.preventDefault(); editNote(item, false); }}
                        color="success"
                    >
                        Edit
                    </Button>
                </TableCell>
                <TableCell key="h">
                    <Button key="t"
                        variant='contained'
                        onClick={(e) => { e.preventDefault(); item.Is_Active = false; updateNote(item) }}
                        color="error"
                    >
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow key={`${i}-row-2`}>
                <TableCell key="i" style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse key="j" in={open} timeout="auto" unmountOnExit>
                        <Box key="k" sx={{ margin: 1 }}>
                            <Typography key="l" variant="h6" gutterBottom component="div">
                                Mood Summary
                            </Typography>
                            <Table key="m" size="small" aria-label="purchases">
                                <TableHead key="n">
                                    <TableRow key="o">
                                    </TableRow>
                                </TableHead>
                                <TableBody key="p">
                                    <TableRow key="q">
                                        <TableCell key="r" component="th" scope="row">
                                            <Chart key="s"
                                                width={'300px'}
                                                height={'300px'}
                                                margin={0}
                                                chartType="PieChart"
                                                loader={<div>Loading Chart</div>}
                                                data={[
                                                    ['Mood', 'Mood Avg'],
                                                    ['Angry', mood[i]?.Mood.Angry * 100],
                                                    ['Fear', mood[i]?.Mood.Fear * 100],
                                                    ['Happy', mood[i]?.Mood.Happy * 100],
                                                    ['Sad', mood[i]?.Mood.Sad * 100],
                                                    ['Surprise', mood[i]?.Mood.Surprise * 100],
                                                ]}
                                                options={{
                                                    // Just add this option
                                                    is3D: true,
                                                }}
                                                rootProps={{ 'data-testid': '2' }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
        );
    }
    return (<Paper>
        {renderRedirect()}
        <Collapse in={hideError}>
            <Alert severity="error" onClose={() => { setError(''); closeError(false); }}>
                {error}
            </Alert>
        </Collapse>
        <Collapse in={hideMessage}>
            <Alert severity="success" onClose={() => { setMessage(''); closeMessage(false); }}>
                {message}
            </Alert>
        </Collapse>
        <Grid container spacing={2}>
            <Grid item xs={8} md={8}>

            </Grid>
            <Grid item xs={4} md={4}>
                <ButtonGroup>
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        style={{ margin: 4 }}
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => createNewNote()}
                    >
                        New Journal
                    </Button>
                    <Button
                        type="button"
                        fullWidth
                        style={{ margin: 4 }}
                        variant="contained"
                        color="success"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={(e) => { e.preventDefault(); signOut(); }}
                    >
                        Logout
                    </Button>
                </ButtonGroup>
            </Grid>
        </Grid>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Title</TableCell>
                    <TableCell>Body</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Mood</TableCell>
                    <TableCell>Read</TableCell>
                    <TableCell>Update</TableCell>
                    <TableCell>Remove</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {data?.map((item, i) => {
                    if (!mood[i]) { return null; }
                    return (<Row key={item.title} item={item} i={i} />);
                })}
            </TableBody>
        </Table>
        <div>
            <Modal
                open={showModal}
                onClose={() => handleClose()}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        Create Journal Entry
                    </Typography>
                    <TextField
                        disabled={isReadOnlyModal}
                        margin="normal"
                        required
                        fullWidth
                        id="title"
                        label="Title"
                        name="title"
                        value={title}
                        autoFocus
                        onChange={(e) => { e.preventDefault(); modalData.title = e.target.value; setTitle(e.target.value); setModalData(modalData) }}
                    />
                    <TextareaAutosize
                        margin="normal"
                        required
                        disabled={isReadOnlyModal}
                        style={{ width: 400 }}
                        minRows={6}
                        maxRows={Infinity}
                        name="body"
                        label="Body"
                        value={body}
                        id="body"
                        onChange={(e) => { e.preventDefault(); modalData.body = e.target.value; setBody(e.target.value); setModalData(modalData) }}
                    />
                    <Button
                        type="button"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        onClick={() => save()}
                        disabled={isReadOnlyModal}
                    >
                        Save
                    </Button>
                </Box>
            </Modal>
        </div>
    </Paper >);
}
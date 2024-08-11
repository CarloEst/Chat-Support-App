"use client"
import { Box, Button, Stack, TextField } from "@mui/material";
import React, { useState } from 'react';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '../firebase.js';
import { getAuth, signOut } from "firebase/auth";

const auth = getAuth();
export default function Page() {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // State to check if user is logged in
    const [isCreatingAccount, setIsCreatingAccount] = useState(false); // State to toggle between login and create account
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState(''); // State for email during account creation

    // Existing chat support functionality hooks
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: `Hi! I'm Headstarter support assistant. How can I help you today`,
        },
    ]);
    const [message, setMessage] = useState('');

    const handleLogin = () => {
        if (email && password) {
            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed in
                    const user = userCredential.user;
                    setIsAuthenticated(true);
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(`Error: ${errorMessage}`);
                });
        } else {
            alert('Please enter both email and password');
        }
    };

    const handleCreateAccount = () => {
        if (email && password) {
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Signed up
                    const user = userCredential.user;
                    alert('Account created! You can now log in.');
                    setIsCreatingAccount(false); // Switch back to login form
                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    alert(`Error: ${errorMessage}`);
                });
        } else {
            alert('Please fill out all fields');
        }
    };

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                // Sign-out successful
                setIsAuthenticated(false);
                alert('You have been logged out.');
            })
            .catch((error) => {
                // An error happened
                alert(`Error: ${error.message}`);
            });
    };

    const sendMessage = async () => {
        setMessage('');
        setMessages((messages) => [
            ...messages,
            { role: 'user', content: message },
            { role: 'assistant', content: '' },
        ]);

        const response = fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify([...messages, { role: 'user', content: message }]),
        }).then(async (res) => {
            const reader = res.body.getReader();
            const decoder = new TextDecoder();

            let result = '';
            return reader.read().then(function processText({ done, value }) {
                if (done) {
                    return result;
                }
                const text = decoder.decode(value || new Uint8Array(), { stream: true });
                setMessages((messages) => {
                    let lastMessage = messages[messages.length - 1];
                    let otherMessages = messages.slice(0, messages.length - 1);
                    return [
                        ...otherMessages,
                        {
                            ...lastMessage,
                            content: lastMessage.content + text,
                        },
                    ];
                });
                return reader.read().then(processText);
            });
        });
    };

    if (!isAuthenticated) {
        return (
            <Box
                width="100vw"
                height="100vh"
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
            >
                <Stack spacing={3} width="300px">
                    {isCreatingAccount ? (
                        <>
                            <TextField
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button variant="contained" onClick={handleCreateAccount}>
                                Create Account
                            </Button>
                            <Button onClick={() => setIsCreatingAccount(false)}>
                                Already have an account? Log in
                            </Button>
                        </>
                    ) : (
                        <>
                            <TextField
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <TextField
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button variant="contained" onClick={handleLogin}>
                                Login
                            </Button>
                            <Button onClick={() => setIsCreatingAccount(true)}>
                                Don't have an account? Create one
                            </Button>
                        </>
                    )}
                </Stack>
            </Box>
        );
    }

    // Render authenticated view
    return (
        <Box
            width="100vw"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
        >
            <Stack
                direction={'column'}
                width="600px"
                height="700px"
                border="1px solid black"
                p={2}
                spacing={3}
            >
                <Stack
                    direction={"column"}
                    spacing={2}
                    flexGrow={1}
                    overflow="auto"
                    maxHeight="100%"
                >
                    {messages.map((message, index) => (
                        <Box
                            key={index}
                            display="flex"
                            justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                        >
                            <Box
                                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'}
                                color="white"
                                borderRadius={16}
                                p={3}
                            >
                                {message.content}
                            </Box>
                        </Box>
                    ))}
                </Stack>
                <Stack direction={'row'} spacing={2}>
                    <TextField
                        label="Message"
                        fullWidth
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button variant="contained" onClick={sendMessage}>
                        Send
                    </Button>
                </Stack>
                <Button variant="contained" onClick={handleLogout}>
                    Logout
                </Button>
            </Stack>
        </Box>
    );
}


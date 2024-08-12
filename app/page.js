"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Card,
  Avatar,
  Paper,
  Container,
  CssBaseline,
  InputAdornment,
  IconButton,
} from "@mui/material";
import React, { useState } from 'react';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '../firebase.js';
import { getAuth } from "firebase/auth";


// Initialize Firebase Auth




const Page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // State to check if user is logged in
  const [isCreatingAccount, setIsCreatingAccount] = useState(false); // State to toggle between login and create account
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // State for email during account creation
  const [showPassword, setShowPassword] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! 👨‍💻 Ready to tackle your next coding challenge or prepare for an interview? Let’s dive into some tech talk!`,
    },
  ]);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);


  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: "#e91e63" },
      secondary: { main: "#f06292" },
      background: { default: darkMode ? "#121212" : "#fce4ec" },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h5: {
        fontWeight: 600,
        fontSize: '1.5rem',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1.25rem',
      },
      body1: {
        fontWeight: 400,
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      button: {
        fontWeight: 500,
      },
    },
    shape: { borderRadius: 12 },
  });


  const handleLogin = () => {
    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed in
          const user = userCredential.user;
          setIsAuthenticated(true);
        })
        .catch((error) => {
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
    setIsTyping(true);
    setMessage("");
    setMessages((messages) => [
      ...messages,
      { role: "user", content: message },
      { role: "assistant", content: "" },
    ]);


    fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: "user", content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();


      let result = "";
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          setIsTyping(false);
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






  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
 


  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  const renderMessageContent = (content) => {
    const paragraphs = content.split('\n');
    return paragraphs.map((paragraph, index) => (
      <Typography
        key={index}
        variant="body1"
        sx={{
          marginBottom: index < paragraphs.length - 1 ? 1 : 0
        }}
      >
        {paragraph}
      </Typography>
    ));
  };


  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Box
            width="100%"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor="background.default"
            px={2}
          >
            <Paper
              elevation={4}
              sx={{
                width: "100%",
                maxWidth: 600,
                p: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* HomePage Components */}
              <Box mb={2} textAlign="center">
                <Typography variant="h5" color="primary">
                  Welcome to DevMate
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Your ultimate companion for coding challenges and interview preparation.
                </Typography>
              </Box>


              {/* Login Form */}
              <Box width="100%" mb={2}>
                <TextField
                  label="Username"
                  fullWidth
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  label="Password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {isCreatingAccount && (
                  <TextField
                    label="Email"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    margin="normal"
                  />
                )}
              </Box>


              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={isCreatingAccount ? handleCreateAccount : handleLogin}
                >
                  {isCreatingAccount ? "Create Account" : "Login"}
                </Button>
                <Button onClick={() => setIsCreatingAccount(!isCreatingAccount)}>
                  {isCreatingAccount ? "Back to Login" : "Create an Account"}
                </Button>
              </Stack>
            </Paper>
          </Box>
          <Button
            onClick={toggleDarkMode}
            sx={{ position: "absolute", bottom: 16, right: 16 }}
          >
            Toggle Dark Mode
          </Button>
        </Container>
      </ThemeProvider>
    );
  }


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container>
        <Box
          width="100%"
          height="100vh"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          bgcolor="background.default"
          px={2}
        >
          <Paper
            elevation={4}
            sx={{
              width: "100%",
              maxWidth: 600,
              height: "80%",
              p: 2,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            {/* Header */}
            <Box sx={{ mb: 2, textAlign: "center" }}>
                <Typography variant="h5" color="primary">
                    Chat with DevMate
                </Typography>
            </Box>


            {/* Main Content */}
            <Stack
              direction={"column"}
              spacing={2}
              flexGrow={1}
              overflow="auto"
              sx={{
                padding: 2,
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(233, 30, 99, 0.5)',
                  borderRadius: '10px',
                },
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  display="flex"
                  justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                  alignItems="center"
                >
                  {message.role === 'assistant' && <Avatar sx={{ marginRight: 2, bgcolor: 'secondary.main' }}>🤖</Avatar>}
                  <Box
                    bgcolor={message.role === 'assistant' ? 'secondary.main' : 'primary.main'}
                    color="white"
                    borderRadius={3}
                    p={2}
                    boxShadow={1}
                    maxWidth="80%"
                  >
                    {renderMessageContent(message.content)}
                  </Box>
                  {message.role === 'user' && <Avatar sx={{ marginLeft: 2, bgcolor: 'primary.main' }}>U</Avatar>}
                </Box>
              ))}
            </Stack>


            {/* Input Field and Send Button */}
            <Stack direction={"row"} spacing={2} mt={2}>
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
              />
              <Button
                variant="contained"
                onClick={sendMessage}
                sx={{ alignSelf: "center" }}
              >
                Send
              </Button>
            </Stack>
            <Stack direction={"row"} spacing={2} mt={2} justifyContent="center">
              <Button variant="contained" onClick={handleLogout}>
                Logout
              </Button>
            </Stack>
          </Paper>
        </Box>
        <Button
          onClick={toggleDarkMode}
          sx={{ position: "absolute", bottom: 16, right: 16 }}
        >
          Toggle Dark Mode
        </Button>
      </Container>
    </ThemeProvider>
  );
};


export default Page;
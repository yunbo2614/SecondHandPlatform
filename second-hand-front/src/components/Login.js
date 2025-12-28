import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../constants";
import NavBarForLogin from "./NavBarForLogin";
// 1. 引入 useNavigate 用于页面跳转
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

function Login({ handleLoggedIn }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // 2. 初始化 navigate
    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!email || !password) {
            setError("Please enter a valid email and password");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post(`${BASE_URL}/login`, {
                email,
                password,
            });
            if (res.data.success) {
                const token = res.data.data.token;
                // token返回给APP，用户已经登陆成功了
                handleLoggedIn(token);
            }
            else{
                setError(res.data.message);
            }
        }
        catch (err) {
            setError(err.response?.data?.message || "Login Failed");
        }
        finally{
            setLoading(false);
        }
    };

    return (
        <>
            <NavBarForLogin />
            <Box
                sx={{
                    minHeight: "calc(80vh - 70px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    px: 3,
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: 560,
                        p: 4,
                        borderRadius: 4, // 增加圆角，更像闲鱼风
                    }}
                >
                    <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: 700 }}>
                        Login
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ marginBottom: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <TextField
                        label="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            marginTop: 3,
                            gap: 2,
                        }}
                    >
                        <Button
                            variant="outlined"
                            fullWidth
                            // 3. 绑定跳转到 /register 的逻辑
                            onClick={() => navigate("/register")}
                            sx={{ 
                                borderRadius: '25px', 
                                textTransform: 'none',
                                borderColor: '#FFDA00',
                                color: '#333',
                                '&:hover': {
                                    borderColor: '#e6c500',
                                    backgroundColor: '#fffbe6'
                                }
                            }}
                        >
                            Don't have account? Register
                        </Button>

                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ 
                                borderRadius: '25px', 
                                textTransform: 'none',
                                backgroundColor: '#FFDA00', // 闲鱼黄
                                color: '#000',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: '#e6c500'
                                }
                            }}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                    </Box>
                </Paper>
            </Box>
        </>
    );
}

export default Login;
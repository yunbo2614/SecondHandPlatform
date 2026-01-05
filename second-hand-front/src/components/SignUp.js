import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. 引入跳转钩子
import { BASE_URL, TOKEN_KEY } from "../constants";
import "../styles/SignUp.css";

import NavBar from "./NavBarNew";
//import NavBar from "../components/NavBarForLogin"; // updated by Xuanbo
const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // 2. 初始化 navigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 发送注册请求到后端
      const response = await axios.post(`${BASE_URL}/register`, {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      // 后端返回格式: { success: true, data: { token: "...", user: {...} } }
      if (response.data.success) {
        const { token } = response.data.data;
        // 存储token到localStorage
        localStorage.setItem(TOKEN_KEY, token);

        alert("Registration Successful!");
        navigate("/login"); // 注册成功后跳转登录页
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f5f5f5",
          px: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{ p: 4, width: "100%", maxWidth: 450, borderRadius: 4 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Sign Up
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Join our second-hand community today!
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Username"
              name="username"
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              margin="normal"
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              margin="normal"
              onChange={handleChange}
              required
            />

            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              {/* 3. 新增的跳转登录按钮 */}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/login")}
                sx={{
                  borderRadius: "25px",
                  textTransform: "none",
                  color: "#333",
                   borderColor: "#FFDA00",
                   "&:hover": {
                  borderColor: "#e6c500",
                  backgroundColor: "#fffbe6",
                },
                }}
              >
                Already have an account? Login
              </Button>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: "25px",
                  textTransform: "none",
                  bgcolor: "#FFDA00",
                  color: "#000",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "#e6c500" }, // consitent design
                }}
              >
                {loading ? "Registering..." : "Register"}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>
    </>
  );
};

export default SignUp;

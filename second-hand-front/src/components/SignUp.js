import {
  Alert,
  Box,
  Button,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. 引入跳转钩子
import '../styles/SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
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
      // 这里的 URL 需对应你 constants.js 里的配置
      const response = await axios.post('http://localhost:8080/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      
      alert("Registration Successful!");
      navigate('/login'); // 注册成功后自动跳转登录
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', px: 2 }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 450, borderRadius: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Sign Up</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
          Join our second-hand community today!
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" name="email" type="email" margin="normal" onChange={handleChange} required />
          <TextField fullWidth label="Username" name="username" margin="normal" onChange={handleChange} required />
          <TextField fullWidth label="Password" name="password" type="password" margin="normal" onChange={handleChange} required />
          <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" margin="normal" onChange={handleChange} required />
          
          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            {/* 3. 新增的跳转登录按钮 */}
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => navigate('/login')}
              sx={{ borderRadius: '25px', textTransform: 'none', color: '#333', borderColor: '#ddd' }}
            >
              Already have an account? Login
            </Button>

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              sx={{ 
                borderRadius: '25px', 
                textTransform: 'none', 
                bgcolor: '#FFDA00', 
                color: '#000', 
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#e6c500' }
              }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default SignUp;
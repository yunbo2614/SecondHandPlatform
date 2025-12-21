import axios from 'axios';
import React, { useState } from 'react';
import '../styles/SignUp.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // 请确认后端地址和端口
      const response = await axios.post('http://localhost:8080/register', {
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      alert("Registration Successful!");
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || "Server error"));
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Sign Up</h1>
        <p className="signup-subtitle">Join the best second-hand community</p>
        
        <form className="signup-form" onSubmit={handleSubmit}>
          <input 
            className="signup-input" name="email" type="email" 
            placeholder="Email Address" onChange={handleChange} required 
          />
          <input 
            className="signup-input" name="username" type="text" 
            placeholder="Username" onChange={handleChange} required 
          />
          <input 
            className="signup-input" name="password" type="password" 
            placeholder="Password" onChange={handleChange} required 
          />
          <input 
            className="signup-input" name="confirmPassword" type="password" 
            placeholder="Confirm Password" onChange={handleChange} required 
          />
          
          <button className="signup-button" type="submit">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
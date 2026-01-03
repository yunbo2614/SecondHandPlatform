// ========================================
// 导入依赖库
// ========================================
import axios from "axios"; // HTTP请求库，用于调用后端API
import React, { useState } from "react"; // React核心库和状态管理Hook
import { BASE_URL } from "../constants"; // 后端API基础URL（http://localhost:8080）
import NavBar from "./NavBarNew"; // 登录页面的导航栏组件
import { useNavigate } from "react-router-dom"; // 路由导航Hook，用于页面跳转

// Material-UI组件库：提供美观的UI组件
import {
  Alert, // 警告提示组件（显示错误信息）
  Box, // 布局容器组件
  Button, // 按钮组件
  Paper, // 卡片/纸张组件（带阴影效果）
  TextField, // 文本输入框组件
  Typography, // 文字排版组件
} from "@mui/material";

// ========================================
// Login组件：用户登录页面
// ========================================
// Props:
//   - handleLoggedIn: 父组件传入的回调函数，登录成功后调用，用于保存token
function Login({ handleLoggedIn }) {
  // ========================================
  // 状态管理（使用React的useState Hook）
  // ========================================
  const [email, setEmail] = useState(""); // 用户输入的邮箱
  const [password, setPassword] = useState(""); // 用户输入的密码
  const [loading, setLoading] = useState(false); // 登录请求是否正在进行中
  const [error, setError] = useState(""); // 错误信息（如登录失败）

  // 初始化路由导航器，用于页面跳转
  const navigate = useNavigate();

  // ========================================
  // handleSubmit：处理登录表单提交
  // ========================================
  // 功能：验证输入 → 调用后端登录API → 处理响应
  const handleSubmit = async () => {
    // 1. 前端验证：检查邮箱和密码是否为空
    if (!email || !password) {
      setError("Please enter a valid email and password");
      return; // 如果为空，显示错误并终止
    }

    // 2. 开始登录流程
    setLoading(true); // 设置加载状态为true（按钮会显示"Logging in..."）
    setError(null); // 清除之前的错误信息

    try {
      // 3. 发送POST请求到后端登录接口
      // URL: http://localhost:8080/login
      // Body: { "email": "...", "password": "..." }
      const res = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      // 4. 处理后端响应
      // 成功响应格式：{ success: true, data: { token: "...", user: {...} } }
      if (res.data.success) {
        const token = res.data.data.token; // 从响应中提取JWT token
        // 调用父组件传入的回调函数，将token传递给App组件
        // App组件会保存token到localStorage，并更新登录状态
        handleLoggedIn(token);
      } else {
        // 如果success为false，显示后端返回的错误信息
        setError(res.data.message);
      }
    } catch (err) {
      // 5. 处理异常情况（网络错误、后端错误等）
      // 优先显示后端返回的错误信息，否则显示默认错误
      setError(err.response?.data?.message || "Login Failed");
    } finally {
      // 6. 无论成功或失败，都结束加载状态
      setLoading(false);
    }
  };

  // ========================================
  // 渲染UI界面
  // ========================================
  return (
    <>
      {/* 顶部导航栏 */}
      <NavBar />

      {/* 主容器：垂直和水平居中 */}
      <Box
        sx={{
          minHeight: "calc(80vh - 70px)", // 设置最小高度（80%视口高度 - 导航栏高度）
          display: "flex", // 使用Flexbox布局
          justifyContent: "center", // 水平居中
          alignItems: "center", // 垂直居中
          px: 3, // 左右内边距3个单位
        }}
      >
        {/* 登录表单卡片 */}
        <Paper
          elevation={3} // 阴影深度为3，产生立体效果
          sx={{
            width: 560, // 卡片宽度560px
            p: 4, // 内边距4个单位
            borderRadius: 4, // 圆角半径，更柔和的视觉效果
          }}
        >
          {/* 标题：Login */}
          <Typography variant="h4" sx={{ marginBottom: 3, fontWeight: 700 }}>
            Login
          </Typography>

          {/* 错误提示框：仅在error有值时显示 */}
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}

          {/* 邮箱输入框 */}
          <TextField
            label="email" // 输入框标签
            fullWidth // 宽度占满父容器
            margin="normal" // 上下外边距
            value={email} // 绑定到email状态
            onChange={(e) => setEmail(e.target.value)} // 输入时更新email状态
          />

          {/* 密码输入框 */}
          <TextField
            label="Password" // 输入框标签
            type="password" // 类型为密码，输入内容会被隐藏
            fullWidth // 宽度占满父容器
            margin="normal" // 上下外边距
            value={password} // 绑定到password状态
            onChange={(e) => setPassword(e.target.value)} // 输入时更新password状态
          />

          {/* 按钮容器：注册按钮 + 登录按钮 */}
          <Box
            sx={{
              display: "flex", // 使用Flexbox横向排列
              marginTop: 3, // 上外边距3个单位
              gap: 2, // 按钮之间的间距2个单位
            }}
          >
            {/* 注册按钮（空心按钮） */}
            <Button
              variant="outlined" // 样式：空心按钮（只有边框）
              fullWidth // 宽度占满（与Login按钮平分空间）
              onClick={() => navigate("/register")} // 点击时跳转到注册页面
              sx={{
                borderRadius: "25px", // 圆角边框（胶囊形状）
                textTransform: "none", // 不自动转大写
                borderColor: "#FFDA00", // 边框颜色：闲鱼黄
                color: "#333", // 文字颜色：深灰色
                "&:hover": {
                  // 鼠标悬停效果
                  borderColor: "#e6c500", // 边框变深黄色
                  backgroundColor: "#fffbe6", // 背景变浅黄色
                },
              }}
            >
              Don't have account? Register
            </Button>

            {/* 登录按钮（实心按钮） */}
            <Button
              variant="contained" // 样式：实心按钮（有背景色）
              fullWidth // 宽度占满（与Register按钮平分空间）
              onClick={handleSubmit} // 点击时调用登录函数
              disabled={loading} // 加载中时禁用按钮，防止重复提交
              sx={{
                borderRadius: "25px", // 圆角边框（胶囊形状）
                textTransform: "none", // 不自动转大写
                backgroundColor: "#FFDA00", // 背景色：闲鱼黄
                color: "#000", // 文字颜色：黑色
                fontWeight: "bold", // 字体加粗
                "&:hover": {
                  // 鼠标悬停效果
                  backgroundColor: "#e6c500", // 背景变深黄色
                },
              }}
            >
              {/* 根据loading状态显示不同文字 */}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
}

export default Login;

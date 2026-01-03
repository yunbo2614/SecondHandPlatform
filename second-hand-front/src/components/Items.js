// ========================================
// 导入依赖库
// ========================================
import React, { useState, useEffect } from "react"; // React核心库和Hooks
import axios from "axios"; // HTTP请求库，用于调用后端API
import { BASE_URL, TOKEN_KEY } from "../constants"; // 后端API基础URL和Token键名
import NavBar from "./NavBarNew"; // 导航栏组件

// Material-UI组件库：提供美观的UI组件
import {
  Box, // 布局容器组件
  Grid, // 网格布局组件（用于响应式布局）
  Typography, // 文字排版组件
  Pagination, // 分页组件
  CircularProgress, // 加载动画组件
  Alert, // 警告提示组件
} from "@mui/material";

import { useNavigate } from "react-router-dom"; // 路由导航Hook，用于页面跳转

// ========================================
// 模拟数据（已注释，使用真实后端数据）
// ========================================
// import { mockItem } from "../s/ItemockmDetailMock"; // 单个商品的模拟数据模板
// const mockItems = [
//   { ...mockItem, id: 1, sold: false }, // 未售出
//   { ...mockItem, id: 2, sold: true },  // 已售出
//   { ...mockItem, id: 3, sold: false },
//   { ...mockItem, id: 4, sold: true },
//   { ...mockItem, id: 5, sold: false },
//   { ...mockItem, id: 6, sold: true },
// ];

// ========================================
// Items组件：商品列表页面
// ========================================
// 功能：从后端获取商品列表，支持分页和点击跳转
function Items(props) {
  // ========================================
  // 状态管理
  // ========================================
  const [items, setItems] = useState([]); // 商品列表数据
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null); // 错误信息
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [totalPages, setTotalPages] = useState(1); // 总页数
  const [totalCount, setTotalCount] = useState(0); // 商品总数

  // 初始化路由导航器，用于跳转到商品详情页
  const navigate = useNavigate();

  // ========================================
  // fetchItems：从后端获取商品列表
  // ========================================
  // 参数：page - 页码（默认为1）
  const fetchItems = async (page = 1) => {
    setLoading(true); // 开始加载
    setError(null); // 清除之前的错误

    try {
      // 从localStorage获取JWT token
      const token = localStorage.getItem(TOKEN_KEY);

      // 发送GET请求到后端 /items 接口
      // 查询参数：page（页码）、page_size（每页8个商品）
      const response = await axios.get(`${BASE_URL}/items`, {
        params: {
          page: page,
          page_size: 8, // 每页显示8个商品
        },
        headers: {
          Authorization: `Bearer ${token}`, // 添加认证Token
        },
      });

      // 后端响应格式：
      // {
      //   "success": true,
      //   "data": {
      //     "posts": [...],
      //     "total_count": 50,
      //     "page": 1,
      //     "page_size": 8,
      //     "total_pages": 7
      //   }
      // }

      if (response.data.success) {
        const data = response.data.data;
        setItems(data.posts || []); // 设置商品列表
        setTotalPages(data.total_pages || 1); // 设置总页数
        setTotalCount(data.total_count || 0); // 设置商品总数
        setCurrentPage(page); // 设置当前页码
      } else {
        setError("Failed to load items");
      }
    } catch (err) {
      console.error("获取商品列表失败:", err);
      setError(
        err.response?.data?.error || "Failed to load items. Please try again."
      );
    } finally {
      setLoading(false); // 结束加载状态
    }
  };

  // ========================================
  // useEffect：组件挂载时获取第一页数据
  // ========================================
  useEffect(() => {
    fetchItems(1); // 加载第一页
  }, []); // 空依赖数组，只在组件挂载时执行一次

  // ========================================
  // handlePageChange：处理分页切换
  // ========================================
  const handlePageChange = (event, page) => {
    fetchItems(page); // 获取指定页的数据
    window.scrollTo(0, 0); // 滚动到页面顶部
  };

  // ========================================
  // 渲染UI界面
  // ========================================
  return (
    <>
      {/* 顶部导航栏 */}
      <NavBar />

      {/* 主容器：商品列表区域 */}
      <Box
        sx={{
          mx: "auto", // 水平居中
          mt: 3, // 上外边距3个单位
          maxWidth: 1200, // 最大宽度1200px
          px: 3, // 左右内边距（响应式优化）
        }}
      >
        {/* 加载状态：显示旋转加载动画 */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 错误状态：显示错误提示 */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* 数据加载成功且有商品：显示商品网格 */}
        {!loading && !error && items.length > 0 && (
          <>
            {/* 显示商品总数 */}
            <Typography variant="h6" sx={{ mb: 3 }}>
              共 {totalCount} 件商品
            </Typography>

            {/* 网格容器：使用Grid布局展示商品卡片 */}
            <Grid container spacing={6} justifyContent="center">
              {/* 遍历商品数组，为每个商品创建一个卡片 */}
              {items.map((item) => (
                // Grid item: 单个商品卡片的容器
                // xs={12}: 超小屏幕（手机）时占满12列（100%宽度）
                // sm={6}:  小屏幕（平板）时占6列（50%宽度，一行2个）
                // md={3}:  中等屏幕（电脑）时占3列（25%宽度，一行4个）
                <Grid item xs={12} sm={6} md={3} key={item.id}>
                  {/* 商品卡片外层容器：处理点击和悬停效果 */}
                  <Box
                    // 点击卡片跳转到商品详情页，URL格式: /item/1
                    onClick={() => navigate(`/item/${item.id}`)}
                    sx={{
                      cursor: "pointer", // 鼠标悬停时显示手型光标
                      "&:hover": {
                        boxShadow: 3, // 增加阴影深度，产生浮起效果
                      },
                    }}
                  >
                    {/* 商品卡片内容容器 */}
                    <Box
                      sx={{
                        bgcolor: "#eee", // 背景色：浅灰色
                        borderRadius: 2, // 圆角半径2个单位
                        p: 2, // 内边距2个单位
                        position: "relative", // 相对定位（用于定位SOLD标签）
                      }}
                    >
                      {/* SOLD标签：仅在商品status为sold时显示 */}
                      {item.status === "sold" && (
                        <Box
                          sx={{
                            position: "absolute", // 绝对定位
                            top: 8, // 距顶部8px
                            right: 8, // 距右侧8px
                            height: 30, // 高度30px
                            width: 80, // 宽度80px
                            bgcolor: "#ff4444", // 背景色：红色
                            color: "#fff", // 文字颜色：白色
                            px: 1, // 水平内边距1个单位
                            py: 0.5, // 垂直内边距0.5个单位
                            borderRadius: 1, // 圆角半径1个单位
                            fontSize: 12, // 字体大小12px
                            display: "flex", // 使用flex布局
                            alignItems: "center", // 垂直居中
                            justifyContent: "center", // 水平居中
                            fontWeight: "bold", // 字体加粗
                          }}
                        >
                          SOLD
                        </Box>
                      )}

                      {/* 商品图片 */}
                      <Box
                        component="img" // 将Box渲染为img标签
                        src={
                          item.image_urls?.[0] ||
                          "https://via.placeholder.com/300"
                        } // 图片URL（取第一张图片，无图片时显示占位图）
                        alt={item.title} // 图片描述（用于无障碍访问）
                        sx={{
                          width: "100%", // 宽度占满父容器
                          height: 160, // 固定高度160px
                          objectFit: "cover", // 图片裁剪方式：覆盖整个区域，保持宽高比
                          borderRadius: 1, // 圆角半径1个单位
                          mb: 1.5, // 下外边距1.5个单位
                          bgcolor: "#ddd", // 背景色（图片加载前显示）
                        }}
                      />

                      {/* 商品标题 */}
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {/* noWrap: 超出宽度时不换行，显示省略号 */}
                        {item.title}
                      </Typography>

                      {/* 商品价格 */}
                      <Typography variant="h6" color="primary" sx={{ mt: 0.5 }}>
                        ${item.price.toFixed(2)}
                      </Typography>

                      {/* 商品位置（邮编） */}
                      <Typography variant="caption" color="text.secondary">
                        📍 {item.zip_code}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* 分页组件：底部居中显示 */}
            <Box
              sx={{ display: "flex", justifyContent: "center", mt: 5, mb: 5 }}
            >
              <Pagination
                count={totalPages} // 总页数（从后端获取）
                page={currentPage} // 当前页码
                onChange={handlePageChange} // 页码改变时的回调函数
                color="primary" // 主题色
                size="large" // 大尺寸
              />
            </Box>
          </>
        )}

        {/* 数据加载成功但没有商品：显示提示信息 */}
        {!loading && !error && items.length === 0 && (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h6" color="text.secondary">
              暂无商品
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              还没有人发布商品，快来发布第一个吧！
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}

export default Items;

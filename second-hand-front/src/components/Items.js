// ========================================
// 导入依赖库
// ========================================
import React, { useState, useEffect } from "react"; // React核心库和Hooks
import axios from "axios"; // HTTP请求库，用于调用后端API
import { BASE_URL, TOKEN_KEY, USE_MOCK } from "../constants"; // 后端API基础URL和Token键名
import NavBar from "./NavBarNew"; // 导航栏组件

// Material-UI组件库：提供美观的UI组件
import {
  Box, // 布局容器组件
  Grid, // 网格布局组件（用于响应式布局）
  // Typography, // 文字排版组件
  Pagination, // 分页组件
  CircularProgress, // 加载动画组件
  Alert, // 警告提示组件
  Container, // 容器组件
  // Card, // 卡片组件
  CardMedia, // 卡片图片组件
  CardContent, // 卡片内容组件
} from "@mui/material";

import { useNavigate } from "react-router-dom"; // 路由导航Hook，用于页面跳转

import { Row, Col, Card, Tag, Typography } from "antd";


import { mockItems } from "../mocks/mockItems";
const { Text, Title } = Typography;

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
      if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 400));
      const data = mockItems.data;

      setItems(data.posts || []);
      setTotalPages(data.total_pages || 1);
      setTotalCount(data.total_count || 0);
      setCurrentPage(page);
      return;
    }
      
      
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

      {/* 主容器：使用flexbox布局 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)", // 减去NavBar高度
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ flex: 1, display: "flex", flexDirection: "column", py: 3 }}
        >
          {/* <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
            Items
          </Typography> */}
          {/* 加载状态：显示加载动画 */}
          {loading && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {/* 错误状态：显示错误提示 */}
          {error && !loading && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* 数据加载成功且有商品：显示商品网格 */}
          {!loading && !error && items.length > 0 && (
            <Row gutter={[24, 24]}>
      {items.map((item) => (
        <Col
          key={item.id}
          xs={24}
          sm={12} 
          md={8} 
          lg={6} 
          xl={6}    // 4 per row (max)
        >
          <Card
            hoverable
            onClick={() => navigate(`/item/${item.id}`)}
            style={{
              borderRadius: 12,
              height: 340,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              position: "relative",
              cursor: "pointer",
            }}
            bodyStyle={{
              padding: 16,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            cover={
              <div
                style={{
                  height: 200,
                  background: "#f5f5f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                <img
                  src={
                    item.image_urls?.[0] || "https://via.placeholder.com/400x300"
                  }
                  alt={item.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            }
          >
            {item.status === "sold" && (
              <Tag
                color="red"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  margin: 0,
                  fontWeight: 700,
                  borderRadius: 6,
                  padding: "2px 8px",
                  zIndex: 1,
                }}
              >
                SOLD
              </Tag>
            )}

            <div>
              <Text strong ellipsis={{ tooltip: item.title }} style={{ display: "block" }}>
                {item.title}
              </Text>

              <Title level={4} style={{ margin: "8px 0 0 0" }}>
                ${Number(item.price || 0).toFixed(2)}
              </Title>

              <Text type="secondary" style={{ fontSize: 12 }}>
                📍 {item.zip_code}
              </Text>
            </div>
          </Card>
        </Col>
      ))}
    </Row>

            // <Grid container spacing={3}>
            //   {items.map((item) => (
            //     <Grid item key={item.id}>
            //       <Card
            //         onClick={() => navigate(`/item/${item.id}`)}
            //         sx={{
            //           borderRadius: 3,
            //           boxShadow: 2,
            //           width: "100%",
            //           height: 340,
            //           display: "flex",
            //           flexDirection: "column",
            //           cursor: "pointer",
            //           "&:hover": {
            //             boxShadow: 4,
            //           },
            //           position: "relative",
            //         }}
            //       >
            //         {/* SOLD标签 */}
            //         {item.status === "sold" && (
            //           <Box
            //             sx={{
            //               position: "absolute",
            //               top: 8,
            //               right: 8,
            //               bgcolor: "#ff4444",
            //               color: "#fff",
            //               px: 1.5,
            //               py: 0.5,
            //               borderRadius: 1,
            //               fontSize: 12,
            //               fontWeight: "bold",
            //               zIndex: 1,
            //             }}
            //           >
            //             SOLD
            //           </Box>
            //         )}

            //         <CardMedia
            //           component="img"
            //           sx={{
            //             width: "100%",
            //             height: 200,
            //             flexShrink: 0, // 防止图片被压缩
            //             objectFit: "contain", // 完整显示图片，不裁剪
            //             backgroundColor: "#f5f5f5", // 添加浅灰色背景
            //           }}
            //           image={
            //             item.image_urls?.[0] ||
            //             "https://via.placeholder.com/400x300"
            //           }
            //           alt={item.title}
            //         />
            //         <CardContent sx={{ py: 1.5, px: 2, overflow: "hidden" }}>
            //           <Typography
            //             variant="subtitle1"
            //             sx={{ fontWeight: 600, mb: 0.5 }}
            //             noWrap
            //           >
            //             {item.title}
            //           </Typography>
            //           <Typography
            //             variant="h6"
            //             color="primary"
            //             sx={{ fontWeight: "bold" }}
            //           >
            //             ${item.price.toFixed(2)}
            //           </Typography>
            //           <Typography variant="caption" color="text.secondary">
            //             📍 {item.zip_code}
            //           </Typography>
            //         </CardContent>
            //       </Card>
            //     </Grid>
            //   ))}
            // </Grid>
          )}

          {/* 数据加载成功但没有商品：显示提示信息 */}
          {!loading && !error && items.length === 0 && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No Postings
              </Typography>
            </Box>
          )}
        </Container>

        {/* Pagination Component - 固定在底部 */}
        <Box
          sx={{
            position:"fixed",
            bottom:0, 
            left:0,
            py: 1,
            width: "100%",
            borderTop: "1px solid #eee",
            bgcolor: "rgba(255, 255, 255, 0.85)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default Items;

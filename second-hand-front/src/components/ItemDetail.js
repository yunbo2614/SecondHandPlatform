// ========================================
// ItemDetail 组件 - 商品详情页
// ========================================
// 后端API: GET /item/:id
// 后端返回格式：
// {
//   "success": true,
//   "data": {
//     "id": 1,
//     "title": "商品标题",
//     "description": "商品描述",
//     "price": 100.00,
//     "image_urls": ["https://...", "https://..."],  ← 图片URL数组
//     "contact_info": "seller@email.com",
//     "zip_code": "12345",
//     "negotiable": true,
//     "status": "active" | "sold" | "deleted",
//     "created_at": "2026-01-01T10:30:00Z",
//     "user": {
//       "id": 1,
//       "username": "卖家名字",
//       "email": "seller@email.com"
//     }
//   }
// }

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { TOKEN_KEY } from "../constants";

import NavBar from "./NavBar";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import { BASE_URL } from "../constants";

// ========================================
// Mock数据（已注释，使用真实后端数据）
// ========================================
// import { mockItem } from "../mocks/ItemDetailMock";
// const USE_MOCK = false;

function ItemDetail({ handleLogout }) {
  // 从URL参数中获取商品ID（如 /item/123 中的 123）
  const { id } = useParams();

  // ========================================
  // 状态管理
  // ========================================
  const [item, setItem] = useState(null); // 商品详情数据
  const [selectedImage, setSelectedImage] = useState(""); // 当前选中的图片URL
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(""); // 错误信息

  // 从商品数据中提取图片数组（后端字段名为 image_urls）
  // useMemo 用于优化性能，只在 item 改变时重新计算
  const images = useMemo(() => item?.image_urls ?? [], [item]);

  // ========================================
  // useEffect: 组件挂载时从后端获取商品详情
  // ========================================
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true); // 开始加载
      setError(""); // 清除之前的错误

      try {
        // 从localStorage获取JWT token
        const token = localStorage.getItem(TOKEN_KEY);

        // 调用后端API: GET /item/{id}
        const res = await axios.get(`${BASE_URL}/item/${id}`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        });

        // 后端响应格式: { success: true, data: {...} }
        if (res.data.success) {
          setItem(res.data.data); // 设置商品数据
        } else {
          setError("Failed to load item details");
        }
      } catch (err) {
        console.error("获取商品详情失败:", err);
        setError(err.response?.data?.error || "Failed to load item details.");
      } finally {
        setLoading(false); // 结束加载状态
      }
    };

    fetchItem();
  }, [id]); // 依赖id，当id改变时重新获取

  // ========================================
  // useEffect: 当图片数组改变时，默认选中第一张图片
  // ========================================
  useEffect(() => {
    if (images.length > 0) {
      setSelectedImage(images[0]); // 选中第一张图片
    } else {
      setSelectedImage(""); // 没有图片时清空
    }
  }, [images]); // 依赖images数组

  // 显示的商品名称（优先使用title字段）
  const displayName = item?.title || "(Item Name)";

  // ========================================
  // 渲染：加载状态
  // ========================================
  if (loading) {
    return (
      <Box>
        <NavBar handleLogout={handleLogout} />
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  // ========================================
  // 渲染：错误状态
  // ========================================
  if (error) {
    return (
      <Box>
        <NavBar handleLogout={handleLogout} />
        <Box sx={{ maxWidth: 1100, mx: "auto", mt: 3, px: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Box>
    );
  }

  // ========================================
  // 渲染：商品不存在
  // ========================================
  if (!item) {
    return (
      <Box>
        <NavBar handleLogout={handleLogout} />
        <Box sx={{ maxWidth: 1100, mx: "auto", mt: 3, px: 2 }}>
          <Alert severity="warning">Item not found.</Alert>
        </Box>
      </Box>
    );
  }

  // ========================================
  // 渲染：商品详情页面
  // ========================================
  return (
    <Box>
      <NavBar handleLogout={handleLogout} />

      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 3, px: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "110px 1fr 320px" },
            gap: 2,
            alignItems: "start",
          }}
        >
          {/* 左侧：缩略图列表（根据后端返回的image_urls数组动态生成） */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: 1,
              overflowX: { xs: "auto", md: "visible" },
              pb: { xs: 1, md: 0 },
            }}
          >
            {/* 遍历图片数组，为每张图片创建缩略图按钮 */}
            {/* 后端返回几个URL就显示几张图片 */}
            {images.map((img, idx) => (
              <ButtonBase
                key={idx}
                onClick={() => setSelectedImage(img)} // 点击时切换主图
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: 1.2,
                  overflow: "hidden",
                  border: "1px solid",
                  // 当前选中的缩略图显示蓝色边框
                  borderColor:
                    selectedImage === img ? "primary.main" : "divider",
                  flex: "0 0 auto",
                }}
              >
                <Box
                  component="img"
                  src={img}
                  alt={`thumb-${idx}`}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </ButtonBase>
            ))}
          </Box>

          {/* 中间：主图显示区域 */}
          <Paper
            variant="outlined"
            sx={{
              height: { xs: 320, md: 420 },
              bgcolor: "#f3f3f3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            {selectedImage ? (
              <Box
                component="img"
                src={selectedImage}
                alt="main"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
              />
            ) : (
              <Box sx={{ width: "90%", height: "90%", bgcolor: "#ddd" }} />
            )}
          </Paper>

          {/* 右侧：商品信息面板 */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: "#f7f7f7",
              borderRadius: 2,
            }}
          >
            {/* 商品标题和SOLD标签 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {displayName}
              </Typography>

              {/* 根据status字段判断是否已售出 */}
              {item.status === "sold" && (
                <Chip
                  label="SOLD"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* 卖家信息（从user对象中获取） */}
            <InfoRow
              label="Posted by"
              value={item.user?.username || "Unknown"}
            />
            {/* 发布日期（格式化显示） */}
            <InfoRow
              label="Date"
              value={
                item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : "-"
              }
            />

            {/* 商品描述 */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                Description:
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}
              >
                {item.description || "-"}
              </Typography>
            </Box>

            {/* 联系和交易信息 */}
            <Box sx={{ mt: 2 }}>
              <InfoRow label="Contact" value={item.contact_info} />
              <InfoRow label="Zip Code" value={item.zip_code} />
              <InfoRow label="Price" value={formatPrice(item.price)} />
              <InfoRow label="Negotiable" value={formatBool(item.negotiable)} />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", gap: 1, mb: 0.75 }}>
      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 90 }}>
        {label}:
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: "text.secondary", wordBreak: "break-word" }}
      >
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

function formatPrice(price) {
  if (price === null || price === undefined || price === "") return "-";
  return `$${price}`;
}

function formatBool(v) {
  if (v === true) return "Yes";
  if (v === false) return "No";
  return "-";
}

export default ItemDetail;

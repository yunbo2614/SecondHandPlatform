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

import NavBar from "./NavBarNew";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ButtonBase from "@mui/material/ButtonBase";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

import { BASE_URL, USE_MOCK } from "../constants";

// ========================================
// Mock数据（已注释，使用真实后端数据）
// ========================================
import { mockItem } from "../mocks/ItemDetailMock";
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
        if (USE_MOCK) {
          setItem(mockItem);
          setLoading(false);
          return;
        }
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
      {/* 修复：添加缺失的 handleLogout 属性 */}
      <NavBar />

      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 3, px: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "110px 1fr 360px" },
            gap: { xs: 2, md: 3 },
            alignItems: "start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: 1,
              overflowX: { xs: "auto", md: "visible" },
              overflowY: { xs: "visible", md: "auto" },
              pr: { md: 0.5 },
              pb: { xs: 1, md: 0 },
              maxHeight: { md: 520 },
              scrollSnapType: { xs: "x mandatory", md: "y proximity" },
              "&::-webkit-scrollbar": { width: 8, height: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.15)",
                borderRadius: 99,
              },
            }}
          >
            {images.map((img, idx) => {
              const isActive = selectedImage === img;
              return (
                <ButtonBase
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  sx={{
                    scrollSnapAlign: "start",
                    width: 86,
                    height: 86,
                    borderRadius: 2,
                    overflow: "hidden",
                    position: "relative",
                    border: "2px solid",
                    borderColor: isActive ? "primary.main" : "divider",
                    boxShadow: isActive ? 3 : 0,
                    transform: isActive ? "scale(1.03)" : "none",
                    transition: "all .15s ease",
                    flex: "0 0 auto",
                    "&:hover": {
                      transform: "scale(1.03)",
                      boxShadow: 3,
                    },
                    "&::after": isActive
                      ? {
                          content: '""',
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(25,118,210,0.00), rgba(25,118,210,0.10))",
                        }
                      : undefined,
                  }}
                >
                  <Box
                    component="img"
                    src={img}
                    alt={`thumb-${idx}`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </ButtonBase>
              );
            })}
          </Box>

          <Paper
            variant="outlined"
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              bgcolor: "grey.50",
              position: "relative",
              boxShadow: { xs: 1, md: 2 },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(800px 300px at 20% 10%, rgba(25,118,210,0.10), transparent 60%), radial-gradient(700px 250px at 80% 90%, rgba(156,39,176,0.08), transparent 60%)",
                pointerEvents: "none",
              }}
            />
            <Box
              sx={{
                height: { xs: 320, md: 520 },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: { xs: 1.5, md: 2 },
                position: "relative",
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
                    borderRadius: 2,
                    filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.18))",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 2,
                    bgcolor: "grey.200",
                  }}
                />
              )}

              <ButtonBase
                onClick={() => {
                  if (!images.length) return;
                  const cur = images.indexOf(selectedImage);
                  const nextIdx = cur <= 0 ? images.length - 1 : cur - 1;
                  setSelectedImage(images[nextIdx]);
                }}
                sx={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  borderRadius: 99,
                  bgcolor: "rgba(255,255,255,0.92)",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: 3,
                  backdropFilter: "blur(6px)",
                  display: images.length > 1 ? "grid" : "none",
                  placeItems: "center",
                  fontSize: 18,
                  fontWeight: 900,
                  userSelect: "none",
                  transition: "transform .15s ease, box-shadow .15s ease",
                  "&:hover": {
                    transform: "translateY(-50%) scale(1.05)",
                    boxShadow: 6,
                  },
                }}
                aria-label="Previous image"
              >
                {"<"}
              </ButtonBase>

              <ButtonBase
                onClick={() => {
                  if (!images.length) return;
                  const cur = images.indexOf(selectedImage);
                  const nextIdx =
                    cur === -1 || cur === images.length - 1 ? 0 : cur + 1;
                  setSelectedImage(images[nextIdx]);
                }}
                sx={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  borderRadius: 99,
                  bgcolor: "rgba(255,255,255,0.92)",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: 3,
                  backdropFilter: "blur(6px)",
                  display: images.length > 1 ? "grid" : "none",
                  placeItems: "center",
                  fontSize: 18,
                  fontWeight: 900,
                  userSelect: "none",
                  transition: "transform .15s ease, box-shadow .15s ease",
                  "&:hover": {
                    transform: "translateY(-50%) scale(1.05)",
                    boxShadow: 6,
                  },
                }}
                aria-label="Next image"
              >
                {">"}
              </ButtonBase>
              {images.length > 0 && (
                <Chip
                  label={`${Math.max(1, images.indexOf(selectedImage) + 1)}/${
                    images.length
                  }`}
                  size="small"
                  sx={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    bgcolor: "rgba(0,0,0,0.65)",
                    color: "white",
                    fontWeight: 800,
                    letterSpacing: 0.3,
                  }}
                />
              )}
            </Box>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2.25,
              borderRadius: 3,
              bgcolor: "background.paper",
              boxShadow: { xs: 0, md: 1 },
              position: { md: "sticky" },
              top: { md: 88 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 900, lineHeight: 1.2 }}
              >
                {displayName}
              </Typography>

              {item.status === "sold" && (
                <Chip
                  label="SOLD"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 900, mt: 0.25 }}
                />
              )}
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 900 }}>
                {formatPrice(item.price)}
              </Typography>
              {item.negotiable && (
                <Chip
                  label="Negotiable"
                  size="small"
                  sx={{ mt: 1, fontWeight: 700 }}
                />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "grid", gap: 0.75 }}>
              <InfoRow
                label="Posted by"
                value={item.user?.username || "Unknown"}
              />
              <InfoRow
                label="Date"
                value={
                  item.created_at
                    ? new Date(item.created_at).toLocaleDateString()
                    : "-"
                }
              />
              <InfoRow label="Contact" value={item.contact_info} />
              <InfoRow label="Zip Code" value={item.zip_code} />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" sx={{ fontWeight: 900, mb: 0.75 }}>
              Description
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}
            >
              {item.description || "-"}
            </Typography>
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

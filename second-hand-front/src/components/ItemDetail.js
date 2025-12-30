// api: GET /item/:id
// {
//   "id": 1,
//   "title": "xxx",
//   "description": "xxxxxxxxxxx",
//   "price": 100,
//   "images": ["https://..."],
//   "contact": "seller@email.com",
//   "zipCode": "12345",
//   "negotiable": true,
//   "seller": "name",
//   "createdAt": "2026-01-01T10:30:00Z"
//   "sold": true,
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

import { BASE_URL } from "../constants";

import { mockItem } from "../mocks/ItemDetailMock"; // mock data

const USE_MOCK = true; // mock data

function ItemDetail({ handleLogout }) {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // assumes array of image urls from backend
  const images = useMemo(() => item?.images ?? [], [item]);

  // useEffect(() => {
  //   const fetchItem = async () => {
  //     setLoading(true);
  //     setError("");

  //     try {
  //       const token = localStorage.getItem(TOKEN_KEY);

  //       // Backend endpoint: GET /item/{id}
  //       const res = await axios.get(`${BASE_URL}/item/${id}`, {
  //         headers: {
  //           Authorization: token ? `Bearer ${token}` : undefined,
  //         },
  //       });

  //       setItem(res.data);
  //     } catch (err) {
  //       console.error(err);
  //       setError(err.response?.data?.message || "Failed to load item details.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchItem();
  // }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        if (USE_MOCK) {
          setItem({ ...mockItem, id });
          return;
        }

        const token = localStorage.getItem(TOKEN_KEY);
        const res = await axios.get(`${BASE_URL}/item/${id}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setItem(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load item details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // default first image
  useEffect(() => {
    if (images.length > 0) setSelectedImage(images[0]);
    else setSelectedImage("");
  }, [images]);

  const displayName = item?.title || item?.name || "(Item Name)";

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

  return (
    <Box>
      <NavBar/>

      <Box sx={{ maxWidth: 1100, mx: "auto", mt: 3, px: 2 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "110px 1fr 320px" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "row", md: "column" },
              gap: 1,
              overflowX: { xs: "auto", md: "visible" },
              pb: { xs: 1, md: 0 },
            }}
          >
            {images.map((img, idx) => (
              <ButtonBase
                key={idx}
                onClick={() => setSelectedImage(img)}
                sx={{
                  width: 90,
                  height: 90,
                  borderRadius: 1.2,
                  overflow: "hidden",
                  border: "1px solid",
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

          {/* Info panel */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              bgcolor: "#f7f7f7",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {displayName}
              </Typography>

              {item.sold && (
                <Chip
                  label="SOLD"
                  color="error"
                  size="small"
                  sx={{ fontWeight: 800 }}
                />
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <InfoRow
              label="Post by"
              value={item.seller || item.postBy || item.ownerName}
            />
            <InfoRow label="Date" value={item.date || item.createdAt} />

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

            <Box sx={{ mt: 2 }}>
              <InfoRow label="Contact" value={item.contact} />
              <InfoRow label="Zip Code" value={item.zip || item.zipCode} />
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

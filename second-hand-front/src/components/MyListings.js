import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {
  Alert,
  Box,
  // Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Pagination,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL, TOKEN_KEY, USE_MOCK } from "../constants";

import NavBar from "./NavBarNew";
import "../styles/Buttons.css";

import { Row, Col, Tag, Button, Space, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import { mockListings } from "../mocks/mockListings";

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem(TOKEN_KEY);

  // Edit Modal States
  const [openEdit, setOpenEdit] = useState(false);
  const [editingItem, setEditingItem] = useState({
    id: "",
    title: "",
    price: "",
    description: "",
  });

  // --- Mark as Sold States ---
  const [soldDialogOpen, setSoldDialogOpen] = useState(false);
  const [itemToMarkSold, setItemToMarkSold] = useState(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    if (token) {
      fetchMyListings();
    } else {
      setError("No token found. Please log in first.");
      setLoading(false);
    }
  }, [token, currentPage]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      setError("");

      if (USE_MOCK) {
        setTimeout(() => {
          const { posts, total_pages } = mockListings.data;
          setListings(posts);
          setTotalPages(total_pages);
          setLoading(false);
        }, 600);
        return;
      }
      const response = await axios.get(`${BASE_URL}/mylistings`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page: currentPage, page_size: 6 },
      });

      if (response.data.success) {
        const { posts, total_pages } = response.data.data;
        setListings(posts || []);
        setTotalPages(total_pages || 0);
      } else {
        setError("Failed to load listings");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Mark as Sold (API: PUT /items/{id}?status=sold)
  const handleMarkAsSold = async () => {
    if (!itemToMarkSold) return;

    try {
      const response = await axios.put(
        `${BASE_URL}/items/${itemToMarkSold.id}?status=sold`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Update local state to show SOLD tag immediately
        setListings(
          listings.map((item) =>
            item.id === itemToMarkSold.id ? { ...item, status: "sold" } : item
          )
        );
        setSoldDialogOpen(false);
      }
    } catch (err) {
      console.error("Mark as sold failed:", err);
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await axios.delete(`${BASE_URL}/item/${itemToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setListings((prev) => prev.filter((item) => item.id !== itemToDelete.id));
    } catch (err) {
      alert("Server error: Could not delete item.");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this listing?")) {
  //     try {
  //       await axios.delete(`${BASE_URL}/item/${id}`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setListings(listings.filter((item) => item.id !== id));
  //     } catch (err) {
  //       alert("Server error: Could not delete item.");
  //     }
  //   }
  // };

  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
    setOpenEdit(true);
  };

  const handleUpdate = async () => {
    try {
      const updateData = {
        title: editingItem.title,
        price: parseFloat(editingItem.price),
        description: editingItem.description,
      };
      const response = await axios.put(
        `${BASE_URL}/item/${editingItem.id}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setListings(
          listings.map((item) =>
            item.id === editingItem.id ? { ...item, ...updateData } : item
          )
        );
        setOpenEdit(false);
        alert("Listing updated successfully!");
      }
    } catch (err) {
      alert("Failed to update item.");
    }
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading)
    return (
      <>
        <NavBar />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
          }}
        >
          <CircularProgress />
        </Box>
      </>
    );

  return (
    <>
      <NavBar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 64px)",
          bgcolor: "#f9f9f9",
        }}
      >
        <Container
          sx={{ flex: 1, display: "flex", flexDirection: "column", py: 3 }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              {" "}
              My Listings{" "}
            </Typography>

            {/* <Button
              variant="contained"
              sx={{
                bgcolor: "#FFDA00",
                color: "#000",
                borderRadius: "20px",
                fontWeight: "bold",
                "&:hover": { bgcolor: "#e6c500" },
              }}
              onClick={() => navigate("/upload")}
            >
              + Post New Item
            </Button> */}
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {listings.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                You haven't posted any items yet.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1 }}>
              {listings.map((item) => {
                const img =
                  item.image_urls?.[0] || "https://via.placeholder.com/800x600";
                const isSold = item.status === "sold";

                return (
                  <Box
                    key={item.id}
                    onClick={() => navigate(`/item/${item.id}`)}
                    sx={{
                      cursor: "pointer",
                      borderRadius: 16,
                      overflow: "hidden",
                      mb: 2,
                      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                      transition: "0.2s",
                      "&:hover": { boxShadow: "0 8px 24px rgba(0,0,0,0.12)" },
                      backgroundColor: "#fff",
                    }}
                  >
                    <Row
                      align="middle"
                      style={{
                        minHeight: 130,
                      }}
                    >
                      <Col
                        xs={24}
                        md={12}
                        style={{
                          padding: 28,
                          display: "flex",
                          flexDirection: "column",
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 800,
                              lineHeight: 1.2,
                              maxWidth: "100%",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={item.title}
                          >
                            {item.title}
                          </div>

                          {isSold && (
                            <Tag
                              color="red"
                              style={{ margin: 0, fontWeight: 700 }}
                            >
                              SOLD
                            </Tag>
                          )}
                        </div>

                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: "#ff4d4f",
                          }}
                        >
                          ${item.price}
                        </div>

                        <Space size={8} wrap>
                          {!isSold && (
                            <Tooltip title="Mark as Sold">
                              <Button
                                icon={<CheckCircleOutlined />}
                                type="primary"
                                style={{ background: "#52c41a" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setItemToMarkSold(item);
                                  setSoldDialogOpen(true);
                                }}
                              >
                                Sold
                              </Button>
                            </Tooltip>
                          )}

                          <Tooltip title="Edit">
                            <Button
                              icon={<EditOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(item);
                              }}
                            >
                              Edit
                            </Button>
                          </Tooltip>

                          <Tooltip title="Delete">
                            <Button
                              danger
                              icon={<DeleteOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(item);
                              }}
                            >
                              Delete
                            </Button>
                          </Tooltip>
                        </Space>
                      </Col>

                      <Col
                        xs={24}
                        md={12}
                        style={{
                          position: "relative",
                          minHeight: 130,
                        }}
                      >
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: 130,
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            filter: isSold ? "grayscale(100%)" : "none",
                            opacity: isSold ? 0.65 : 1,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.10) 100%)",
                            pointerEvents: "none",
                          }}
                        />
                      </Col>
                    </Row>
                  </Box>
                );
              })}
            </Box>
            // <Grid container spacing={3} sx={{ flex: 1 }}>
            //   {listings.map((item) => (
            //     <Grid item key={item.id} xs={12} sm={6} md={4}>
            //       <Card
            //         sx={{
            //           borderRadius: 4,
            //           boxShadow: 2,
            //           height: 360,
            //           display: "flex",
            //           flexDirection: "column",
            //           position: "relative",
            //           transition: "0.3s",
            //           "&:hover": { boxShadow: 6 }
            //         }}
            //       >
            //         {/* SOLD Tag Overlay */}
            //         {item.status === "sold" && (
            //           <Chip
            //             label="SOLD"
            //             color="error"
            //             sx={{
            //               position: "absolute",
            //               top: 15,
            //               left: 15,
            //               fontWeight: "bold",
            //               zIndex: 1,
            //               boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            //             }}
            //           />
            //         )}

            //         <CardMedia
            //           component="img"
            //           sx={{
            //             width: "100%",
            //             height: 200,
            //             objectFit: "cover",
            //             backgroundColor: "#f5f5f5",
            //             opacity: item.status === "sold" ? 0.6 : 1,
            //             filter: item.status === "sold" ? "grayscale(100%)" : "none"
            //           }}
            //           image={item.image_urls?.[0] || "https://via.placeholder.com/400x300"}
            //           alt={item.title}
            //         />
            //         <CardContent sx={{ py: 2, px: 2 }}>
            //           <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 0.5 }} noWrap>
            //             {item.title}
            //           </Typography>
            //           <Typography variant="h6" color="error" sx={{ fontWeight: "bold" }}>
            //             ${item.price}
            //           </Typography>
            //         </CardContent>

            //         <CardActions sx={{ justifyContent: "flex-end", px: 2, py: 1, borderTop: "1px solid #eee", mt: 'auto' }}>
            //           {item.status !== "sold" && (
            //             <IconButton
            //               onClick={() => {
            //                 setItemToMarkSold(item);
            //                 setSoldDialogOpen(true);
            //               }}
            //               color="success"
            //               title="Mark as Sold"
            //             >
            //               <CheckCircleIcon />
            //             </IconButton>
            //           )}
            //           <IconButton onClick={() => handleOpenEdit(item)} color="primary">
            //             <EditIcon />
            //           </IconButton>
            //           <IconButton onClick={() => handleDelete(item.id)} color="error">
            //             <DeleteIcon />
            //           </IconButton>
            //         </CardActions>
            //       </Card>
            //     </Grid>
            //   ))}
            // </Grid>
          )}
        </Container>

        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
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

      {/* Mark as Sold Confirmation Dialog */}
      <Dialog open={soldDialogOpen} onClose={() => setSoldDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: "bold" }}>Mark as Sold?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirm that <strong>"{itemToMarkSold?.title}"</strong> has been
            sold? This will add a "SOLD" tag and{" "}
            <strong> cannot be undone</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setSoldDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            className="green-btn"
            onClick={handleMarkAsSold}
            variant="contained"
            color="success"
            sx={{ borderRadius: "20px", fontWeight: "bold" }}
          >
            Confirm Sold
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Listing Dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Edit Listing</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={editingItem.title}
            onChange={(e) =>
              setEditingItem({ ...editingItem, title: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Price ($)"
            margin="normal"
            type="number"
            value={editingItem.price}
            onChange={(e) =>
              setEditingItem({ ...editingItem, price: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            rows={3}
            value={editingItem.description || ""}
            onChange={(e) =>
              setEditingItem({ ...editingItem, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleUpdate}
            variant="contained"
            sx={{
              bgcolor: "#FFDA00",
              color: "#000",
              fontWeight: "bold",
              borderRadius: "20px",
              "&:hover": { bgcolor: "#e6c500" },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
        }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Delete Listing?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>"{itemToDelete?.title}"</strong>?
            <br />
            This action <strong>cannot be undone</strong>.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              setItemToDelete(null);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            className="red-btn"
            onClick={handleDelete}
            variant="contained"
            sx={{ borderRadius: "20px", fontWeight: "bold" }}
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default MyListings;

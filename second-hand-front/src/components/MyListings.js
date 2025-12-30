import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { BASE_URL, TOKEN_KEY } from "../constants";

function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Initialize navigation hook
  const navigate = useNavigate();

  // State for edit modal
  const [openEdit, setOpenEdit] = useState(false);
  const [editingItem, setEditingItem] = useState({ id: "", title: "", price: "", description: "" });

  const token = localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        setLoading(true);
        setError("");

        // Optional: Toggle this block to test UI without a working backend
        /*
        const mockData = [
          { 
            id: 1, 
            title: "Vintage Film Camera", 
            price: 150, 
            description: "A well-maintained classic camera.",
            image_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500" 
          },
          { 
            id: 2, 
            title: "CS Textbook", 
            price: 45, 
            description: "Essential for your intro classes.",
            image_url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500" 
          }
        ];
        setListings(mockData);
        setLoading(false);
        return; 
        */

        // Real API request to fetch user-specific listings
        const response = await axios.get(`${BASE_URL}/mylistings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setListings(response.data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to connect to server. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMyListings();
    } else {
      setError("No token found. Please log in first.");
      setLoading(false);
    }
  }, [token]);

  // Handle item deletion from both UI and Database
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      // Optimistic UI update: remove item from state immediately
      const updatedListings = listings.filter(item => item.id !== id);
      setListings(updatedListings);

      try {
        await axios.delete(`${BASE_URL}/item/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) { 
        console.error("Delete failed on server:", err);
        alert("Server error: Could not delete item.");
        // Re-fetch or revert state if necessary
      }
    }
  };

  // Open the edit modal and populate with current item data
  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
    setOpenEdit(true);
  };

  // Handle the update submission
  const handleUpdate = async () => {
    try {
      // API call to update item (assuming PUT /item/{id})
      await axios.put(`${BASE_URL}/item/${editingItem.id}`, editingItem, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update local state to reflect changes
      setListings(listings.map(item => 
        item.id === editingItem.id ? { ...editingItem } : item
      ));
      
      setOpenEdit(false);
      alert("Listing updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update item on server.");
    }
  };

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>My Listings</Typography>
        <Button 
          variant="contained" 
          sx={{ 
            bgcolor: '#FFDA00', 
            color: '#000', 
            borderRadius: '20px', 
            fontWeight: 'bold',
            '&:hover': { bgcolor: '#e6c500' } 
          }}
          onClick={() => navigate('/sell')} // Navigates to the Sell page
        >
          + Post New Item
        </Button>
      </Box>
      
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      
      {listings.length === 0 ? (
        <Typography variant="body1" color="text.secondary">You haven't posted any items yet.</Typography>
      ) : (
        <Grid container spacing={3}>
          {listings.map((item) => (
            <Grid item key={item.id} xs={12} sm={6} md={4}>
              <Card sx={{ borderRadius: 3, boxShadow: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image_url || 'https://via.placeholder.com/200'}
                  alt={item.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" sx={{ fontWeight: 600 }} noWrap>
                    {item.title}
                  </Typography>
                  <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                    ${item.price}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, borderTop: '1px solid #eee' }}>
                  <IconButton onClick={() => handleOpenEdit(item)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(item.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal for editing item details */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 'bold' }}>Edit Listing</DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth label="Title" margin="normal"
            value={editingItem.title}
            onChange={(e) => setEditingItem({...editingItem, title: e.target.value})}
          />
          <TextField
            fullWidth label="Price ($)" margin="normal" type="number"
            value={editingItem.price}
            onChange={(e) => setEditingItem({...editingItem, price: e.target.value})}
          />
          <TextField
            fullWidth label="Description" margin="normal" multiline rows={3}
            value={editingItem.description || ""}
            onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenEdit(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            variant="contained" 
            sx={{ 
              bgcolor: '#FFDA00', 
              color: '#000', 
              fontWeight: 'bold', 
              borderRadius: '20px',
              '&:hover': { bgcolor: '#e6c500' }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyListings;

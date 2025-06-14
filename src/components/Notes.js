import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [open, setOpen] = useState(false);

  // Base URL for API requests
  const API_BASE_URL = 'http://localhost:5002';
  const API_URL = `${API_BASE_URL}/api/notes`;
  
  // Log the API URL for debugging
  console.log('API Base URL:', API_BASE_URL);
  console.log('API URL:', API_URL);
  
  // Common fetch options
  const getFetchOptions = (method, body = null) => ({
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Fetch all notes
  const fetchNotes = async () => {
    try {
      console.log('Fetching notes from:', API_URL);
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include' // Include credentials for CORS
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          // Try to parse as JSON, but fall back to raw text if it's not JSON
          const errorData = errorText ? JSON.parse(errorText) : {};
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
          console.error('Error parsing error response:', e);
          throw new Error(`Failed to fetch notes: ${errorText || response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Notes data:', data);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      // Show error to user in a more user-friendly way
      alert(`Failed to load notes. Please check your connection and try again.\n\nError: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create or update note
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }
    
    try {
      const url = editingNote ? `${API_URL}/${editingNote.id}` : API_URL;
      const method = editingNote ? 'PUT' : 'POST';
      
      console.log(`Sending ${method} request to:`, url);
      console.log('Request body:', { title, content });
      
      const response = await fetch(url, {
        ...getFetchOptions(method, { title, content }),
        credentials: 'include' // Include credentials for CORS
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
          // Try to parse as JSON, but fall back to raw text if it's not JSON
          const errorData = errorText ? JSON.parse(errorText) : {};
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
          console.error('Error parsing error response:', e);
          throw new Error(`Failed to save note: ${errorText || response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Note saved successfully:', data);
      
      // Reset form and refresh notes
      setOpen(false);
      setTitle('');
      setContent('');
      setEditingNote(null);
      await fetchNotes();
      
      // Show success message
      alert(`Note ${editingNote ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      console.error('Error saving note:', error);
      alert(`Failed to save note. Please try again.\n\nError: ${error.message}`);
    }
  };

  // Delete note
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        ...getFetchOptions('DELETE'),
        credentials: 'include' // Include credentials for CORS
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete note: ${errorText || response.statusText}`);
      }
      
      // Refresh the notes list
      await fetchNotes();
      alert('Note deleted successfully!');
    } catch (error) {
      console.error('Error deleting note:', error);
      alert(`Failed to delete note. Please try again.\n\nError: ${error.message}`);
    }
  };

  // Set up form for editing
  const handleEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setOpen(true);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingNote(null);
    setTitle('');
    setContent('');
  };

  return (
    <Container maxWidth="lg" style={{ marginTop: '2rem' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Notes
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickOpen}
            startIcon={<EditIcon />}
            sx={{ borderRadius: 2 }}
          >
            Add New Note
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Content</TableCell>
                <TableCell>Last Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.id} hover>
                  <TableCell>{note.title}</TableCell>
                  <TableCell>{note.content}</TableCell>
                  <TableCell>
                    <Typography variant="caption" color="textSecondary">
                      {new Date(note.updatedAt).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(note)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(note.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              type="text"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <TextField
              margin="dense"
              label="Content"
              type="text"
              fullWidth
              multiline
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary" variant="contained">
              {editingNote ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Notes;

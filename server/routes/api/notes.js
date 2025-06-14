const express = require('express');
const router = express.Router();

console.log('Notes route module loaded');

// In-memory storage
let notes = [];
let currentId = 1;

// Log function with timestamp
const log = (message) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
};

// Create a new note
router.post('/', (req, res) => {
    log('POST / - Creating new note');
    try {
        const { title, content } = req.body;
        log(`Request body: ${JSON.stringify({ title, content })}`);
        
        if (!title || !content) {
            log('Error: Title and content are required');
            return res.status(400).json({ message: 'Title and content are required' });
        }
        
        const newNote = {
            id: currentId++,
            title,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        notes.push(newNote);
        res.status(201).json(newNote);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all notes
router.get('/', (req, res) => {
    log('GET / - Fetching all notes');
    try {
        log(`Returning ${notes.length} notes`);
        res.json(notes);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get a single note by ID
router.get('/:id', (req, res) => {
    const noteId = req.params.id;
    log(`GET /${noteId} - Fetching note`);
    try {
        const note = notes.find(n => n.id === parseInt(noteId));
        if (!note) {
            log(`Note with ID ${noteId} not found`);
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a note
router.put('/:id', (req, res) => {
    const noteId = req.params.id;
    log(`PUT /${noteId} - Updating note`);
    try {
        const { title, content } = req.body;
        log(`Update data: ${JSON.stringify({ title, content })}`);
        
        const noteIndex = notes.findIndex(n => n.id === parseInt(noteId));
        
        if (noteIndex === -1) {
            log(`Note with ID ${noteId} not found for update`);
            return res.status(404).json({ message: 'Note not found' });
        }
        
        notes[noteIndex] = {
            ...notes[noteIndex],
            title: title || notes[noteIndex].title,
            content: content || notes[noteIndex].content,
            updatedAt: new Date().toISOString()
        };
        
        res.json(notes[noteIndex]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a note
router.delete('/:id', (req, res) => {
    const noteId = req.params.id;
    log(`DELETE /${noteId} - Deleting note`);
    try {
        const noteIndex = notes.findIndex(n => n.id === parseInt(noteId));
        
        if (noteIndex === -1) {
            log(`Note with ID ${noteId} not found for deletion`);
            return res.status(404).json({ message: 'Note not found' });
        }
        
        const deletedNote = notes.splice(noteIndex, 1)[0];
        res.json({ message: 'Note deleted', note: deletedNote });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

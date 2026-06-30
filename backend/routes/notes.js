const router = require('express').Router();
const Note = require('../models/note');
const auth = require('../middleware/authMiddleware'); // 👈 Import our security gatekeeper

// 1. GET ALL NOTES FOR THE LOGGED-IN USER ONLY
router.get('/', auth, async (req, res) => {
  try {
    // Only find notes belonging to this specific user ID extracted from the token
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. CREATE A NEW NOTE BOUND TO THE USER
router.post('/add', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const newNote = new Note({
      user: req.user.id, // 👈 Saves the logged-in user's ID into the document
      title,
      content,
      tags
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. UPDATE A NOTE (Ensuring ownership)
router.put('/update/:id', auth, async (req, res) => {
  try {
    // Ensure the note belongs to the user trying to edit it
    const note = await Note.findOne({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(44)
    }

    note.title = req.body.title || note.title;
    note.content = req.body.content || note.content;
    note.tags = req.body.tags || note.tags;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. DELETE A NOTE (Ensuring ownership)
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }
    res.json({ message: 'Note deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
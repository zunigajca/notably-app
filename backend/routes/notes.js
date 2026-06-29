const router = require('express').Router();
let Note = require('../models/Note');

// GET: Fetch all notes
router.route('/').get((req, res) => {
    Note.find().sort({ updatedAt: -1 }) // Newest or recently updated notes first
        .then(notes => res.json(notes))
        .catch(err => res.status(400).json('Error: ' + err));
});

// POST: Create a new note
router.route('/add').post((req, res) => {
    const { title, content, tags } = req.body;

    const newNote = new Note({
        title,
        content,
        tags
    });

    newNote.save()
        .then(() => res.json('Note added successfully!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// DELETE: Remove a note by ID
router.route('/:id').delete((req, res) => {
    Note.findByIdAndDelete(req.params.id)
        .then(() => res.json('Note deleted successfully!'))
        .catch(err => res.status(400).json('Error: ' + err));
});

// PUT: Update a note by ID
router.route('/update/:id').put((req, res) => {
    Note.findById(req.params.id)
        .then(note => {
            if (!note) return res.status(404).json('Note not found');

            // Update fields if provided in the request body
            note.title = req.body.title || note.title;
            note.content = req.body.content !== undefined ? req.body.content : note.content;
            note.tags = req.body.tags || note.tags;

            note.save()
                .then(() => res.json('Note updated successfully!'))
                .catch(err => res.status(400).json('Error: ' + err));
        })
        .catch(err => res.status(400).json('Error: ' + err));
});
module.exports = router;
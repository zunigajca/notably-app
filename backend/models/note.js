const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // 👈 Binds this note directly to a user account
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  tags: {
    type: [String],
    default: ['general']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Note', noteSchema);
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  // State to track if we are editing a note
  const [editingNoteId, setEditingNoteId] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:2550/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Populate the form fields with the selected note's data to start editing
  const handleEditSelect = (note) => {
    setEditingNoteId(note._id);
    setTitle(note.title);
    setContent(note.content || '');
    setTagInput(note.tags ? note.tags.join(', ') : '');
  };

  // Cancel out of edit mode and reset the form
  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setTitle('');
    setContent('');
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArray = tagInput
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag !== "");

    const noteData = {
      title,
      content,
      tags: tagsArray.length ? tagsArray : ['general']
    };

    try {
      if (editingNoteId) {
        // If editingNoteId exists, send a PUT request to update
        await axios.put(`http://localhost:2550/api/notes/update/${editingNoteId}`, noteData);
        setEditingNoteId(null);
      } else {
        // Otherwise, send a POST request to create a new one
        await axios.post('http://localhost:2550/api/notes/add', noteData);
      }
      
      // Reset form fields
      setTitle('');
      setContent('');
      setTagInput('');
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:2550/api/notes/${id}`);
      // If the note being deleted is currently active in the edit form, cancel the edit state
      if (editingNoteId === id) {
        handleCancelEdit();
      }
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white shadow-xs sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📝</span>
            <h1 className="text-xl font-bold tracking-tight text-indigo-600">Notably</h1>
          </div>
          <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
            MERN Stack app
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Form Panel (Handles BOTH Create & Update) */}
        <section className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editingNoteId ? '✏️ Edit Note' : '✨ Create New Note'}
            </h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="Note title..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Content</label>
                <textarea 
                  placeholder="Type your notes here..." 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium uppercase tracking-wide text-slate-500 mb-1">Tags (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="work, ideas, daily" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <button 
                  type="submit" 
                  className={`w-full cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xs transition-all hover:shadow-md active:scale-[0.98] ${
                    editingNoteId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {editingNoteId ? 'Update Changes' : 'Save Note'}
                </button>
                
                {editingNoteId && (
                  <button 
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-full cursor-pointer rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* Right Column: Note Dashboard Display */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              My Workspace
              <span className="flex items-center justify-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {notes.length}
              </span>
            </h2>
          </div>

          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
              <span className="text-4xl mb-3">📭</span>
              <h3 className="text-base font-semibold text-slate-800">Your workspace is empty</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-xs">Fill out the creation form on the left to pin your very first fullstack note to the board.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {notes.map(note => {
                const isBeingEdited = editingNoteId === note._id;
                return (
                  <div 
                    key={note._id} 
                    className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition-all ${
                      isBeingEdited 
                        ? 'border-amber-400 bg-amber-50/40 ring-2 ring-amber-100' 
                        : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-slate-950 text-base leading-snug">{note.title}</h3>
                        
                        {/* Edit Button (Pencil Icon) */}
                        <button
                          onClick={() => handleEditSelect(note)}
                          className={`cursor-pointer rounded-md p-1 transition-colors ${
                            isBeingEdited ? 'text-amber-600 bg-amber-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                          }`}
                          title="Edit Note"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                          </svg>
                        </button>
                      </div>
                      
                      <p className="text-slate-600 text-sm whitespace-pre-wrap line-clamp-4 mb-4">{note.content || "Empty content."}</p>
                    </div>
                    
                    <div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {note.tags?.map((tag, idx) => (
                          <span key={idx} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Note Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
                        <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(note._id)}
                          className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Delete Note"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
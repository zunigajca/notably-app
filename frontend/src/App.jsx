import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [suggestedTags, setSuggestedTags] = useState([]);

  // NEW: State for filtering notes
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  // Automatically calculate the top 6 most popular unique tags from all notes
  useEffect(() => {
    if (notes.length > 0) {
      const allTags = notes.flatMap(note => note.tags || []);
      
      const tagCounts = allTags.reduce((acc, tag) => {
        const cleanTag = tag.trim();
        if (cleanTag !== "") {
          acc[cleanTag] = (acc[cleanTag] || 0) + 1;
        }
        return acc;
      }, {});

      const sortedTags = Object.keys(tagCounts).sort((a, b) => tagCounts[b] - tagCounts[a]);
      const topTags = sortedTags.slice(0, 6);
      
      setSuggestedTags(topTags);
    }
  }, [notes]);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:2550/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleSuggestionClick = (tag) => {
    const currentTags = tagInput.split(',').map(t => t.trim()).filter(t => t !== "");
    if (!currentTags.includes(tag)) {
      const updatedTags = [...currentTags, tag];
      setTagInput(updatedTags.join(', '));
    }
  };

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
        await axios.put(`http://localhost:2550/api/notes/update/${editingNoteId}`, noteData);
        setEditingNoteId(null);
      } else {
        await axios.post('http://localhost:2550/api/notes/add', noteData);
      }
      
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
      if (editingNoteId === id) handleCancelEdit();
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // NEW: Filter logic matching query against Title OR individual Tags
  const filteredNotes = notes.filter(note => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    // Matches if query is found in the title...
    const matchesTitle = note.title.toLowerCase().includes(query);
    
    // ...or if the query matches one of the tags exactly (ignoring potential '#' symbols)
    const cleanQuery = query.startsWith('#') ? query.slice(1) : query;
    const matchesTags = note.tags?.some(tag => tag.toLowerCase().includes(cleanQuery));

    return matchesTitle || matchesTags;
  });

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
        
        {/* Left Column: Form Panel */}
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
                
                {suggestedTags.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">Existing Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {suggestedTags.map((tag, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSuggestionClick(tag)}
                          className="cursor-pointer text-xs font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                        >
                          +{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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

        {/* Right Column: Interactive Note Dashboard Display */}
        <section className="lg:col-span-2 flex flex-col gap-4">
          
          {/* NEW INTERACTIVE SEARCH BAR PANEL */}
          <div className="w-full relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.603 10.603Z" />
              </svg>
            </div>
            <input 
              type="text"
              placeholder="Search notes by title or keyword (#cats)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-10 py-3.5 text-sm font-medium shadow-xs transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 focus:outline-hidden"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {searchQuery ? '🔍 Search Results' : 'My Workspace'}
              <span className="flex items-center justify-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                {filteredNotes.length}
              </span>
            </h2>
          </div>

          {filteredNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
              <span className="text-4xl mb-3">{searchQuery ? '🔍' : '📭'}</span>
              <h3 className="text-base font-semibold text-slate-800">
                {searchQuery ? 'No matching notes found' : 'Your workspace is empty'}
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-xs">
                {searchQuery ? `Try modifying your search term or clear the filter to see all your notes.` : 'Fill out the creation form on the left to pin your first note.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filteredNotes.map(note => {
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
                        
                        <button
                          onClick={() => setEditingNoteId(note._id) || setTitle(note.title) || setContent(note.content || '') || setTagInput(note.tags ? note.tags.join(', ') : '')}
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
                      {/* Clickable Note Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {note.tags?.map((tag, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setSearchQuery(tag)}
                            className="cursor-pointer rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-400 font-medium">
                        <span>Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
                        
                        <button 
                          onClick={() => handleDelete(note._id)}
                          className="cursor-pointer rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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
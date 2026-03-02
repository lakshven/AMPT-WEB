import React, { useState } from "react";

const AdminAnnouncements: React.FC = () => {
  const [notes, setNotes] = useState([
    { message: "System maintenance scheduled for Friday 10 PM.", date: "Today" },
    { message: "New dropdown categories added.", date: "Yesterday" },
  ]);

  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes([{ message: newNote, date: "Just now" }, ...notes]);
    setNewNote("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4"
      style={{ color: "#0989B1" }}>
        Admin Announcements / Notes
      </h2>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0989B1]"
          placeholder="Write a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <button
          onClick={addNote}
          className="px-4 py-2 rounded-md text-white font-medium shadow"
          style={{ backgroundColor: "#0989B1" }}>
          Add
        </button>
      </div>

      <ul className="space-y-3">
        {notes.map((note, idx) => (
          <li key={idx} 
           className="p-4 rounded-md border shadow-sm bg-gray-50"
           style={{ borderColor: "#549E39" }}>
            <p className="font-medium text-gray-800">{note.message}</p>
            <p className="text-xs" style={{ color: "#066A6F" }}>{note.date}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminAnnouncements;
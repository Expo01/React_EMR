//NoteViewer.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function NoteViewer() {
  const { noteId } = useParams();
  const [noteData, setNoteData] = useState(null);

  useEffect(() => {
    async function fetchNote() {
      try {
        const res = await fetch(`http://localhost:3001/notes/${noteId}`);
        if (!res.ok) throw new Error('Failed to fetch note');
        const data = await res.json();
        console.log('Fetched note:', data); // 👈 This line logs the received data
        setNoteData(data);
      } catch (err) {
        console.error('Error fetching note:', err);
      }
    }
    fetchNote();
  }, [noteId]);

  if (!noteData) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="bg-blue-950 text-white min-h-screen p-6 space-y-4">
      <div className="border-b border-gray-700 pb-4 mb-4">
        <h2 className="text-xl font-bold">{noteData.fname} {noteData.lname}</h2>
        <p><strong>DOB:</strong> {noteData.dob.slice(0, 10)}</p>
        <p><strong>Phone:</strong> {noteData.phone}</p>
      </div>
      <div>
        <p className="text-sm text-gray-400 italic mb-2">
          {new Date(noteData.created_at).toLocaleString()} by {noteData.signed_therapist}
        </p>
        <p className="whitespace-pre-line bg-blue-900 p-4 rounded">{noteData.content}</p>
      </div>
    </div>
    // <p>anything else</p>
  );  
  
}

export default NoteViewer;

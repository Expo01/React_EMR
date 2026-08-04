//NoteViewer.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function NoteViewer() {
    const { noteId } = useParams();
    const [noteData, setNoteData] = useState(null);

    useEffect(() => {
        //obtain note associated with ID of clicked note
        async function fetchNote() {
            try {
                const res = await fetch(`http://localhost:3001/notes/${noteId}`);
                if (!res.ok) throw new Error('Failed to fetch note');
                const data = await res.json();
                setNoteData(data);
            } catch (err) {
                console.error('Error fetching note:', err);
            }
        }
        fetchNote();
    }, [noteId]);

    if (!noteData) return <div className="text-white p-4">no data</div>;

    return (
        <div className="bg-blue-950 text-white min-h-screen p-6 space-y-4">
            {/* sticky header of pt IDing info */}
            <div className="sticky top-0 bg-blue-950 z-10 p-6 border-b border-gray-700">
                <h2 className="text-xl font-bold">{noteData.fname} {noteData.lname}</h2>
                <p><strong>DOB:</strong> {noteData.dob.slice(0, 10)}</p>
                <p><strong>Phone:</strong> {noteData.phone}</p>
            </div>
            {/* note data */}
            <div>
                <p className="text-sm text-gray-400 italic mb-2">
                    {new Date(noteData.created_at).toLocaleString()} by {noteData.signed_therapist}
                </p>
                <p className="whitespace-pre-line bg-blue-900 p-4 rounded">{noteData.content}</p>
            </div>
        </div>
    );

}

export default NoteViewer;

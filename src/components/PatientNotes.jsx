// src/components/PatientNotes.jsx
import { useEffect, useState } from 'react';

function PatientNotes() {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/notes')
            .then((res) => res.json())
            .then((data) => setNotes(data))
            .catch((err) => console.error('Error fetching notes:', err));
    }, []);

    return (
        <div className="mb-8">
            <h1 className="text-2xl font-bold mb-4">Note List</h1>
            <table className="min-w-full table-auto border border-gray-300 bg-blue-950 text-white text-left">
                <thead className="bg-blue-900 text-gray-200">
                    <tr>
                        <th className="data-table-header">Signed Date</th>
                        <th className="data-table-header">Content</th>
                        <th className="data-table-header">Signed Therapist</th>
                    </tr>
                </thead>
                <tbody>
                    {notes.map((note) => (
                        <tr key={note.note_id} className="hover:bg-blue-800">
                            <td className="data-table-row">{note.created_at.slice(0, 10)}</td>
                            <td className="data-table-row">
                                {note.content.length > 20
                                    ? `${note.content.slice(0, 20)}...`
                                    : note.content}
                            </td>
                            <td className="data-table-row">{note.signed_therapist}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default PatientNotes;

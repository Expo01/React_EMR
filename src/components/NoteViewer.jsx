import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatientAccessGuard from '../hooks/usePatientAccessGuard';

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

  // The note response includes patient_id.
  // Pass null initially; the guard waits until the note loads.
  const isBlocked = usePatientAccessGuard(noteData?.patient_id);

  // Conditional returns must come after all hooks.
  if (isBlocked) {
    return (
      <div className="emr-page flex items-center justify-center">
        <div className="emr-workspace max-w-md text-center border border-emr-border">
          <h2 className="text-xl font-semibold text-emr-error mb-4">
            Access Denied
          </h2>

          <p className="text-emr-text">
            Another patient chart is already open.
          </p>

          <p className="emr-secondary-text mt-2 text-sm">
            Close all windows for the current patient before opening a different patient.
          </p>
        </div>
      </div>
    );
  }

  if (!noteData) {
    return (
      <div className="emr-page flex items-center justify-center">
        Loading note...
      </div>
    );
  }

  return (
    <div className="emr-page">
      <div className="emr-workspace min-h-[calc(100vh-1.5rem)]">

        {/* sticky header of pt IDing info */}
        <div className="emr-patient-header border-b border-emr-border">
          <h2 className="text-2xl font-bold text-emr-text">
            {noteData.fname} {noteData.lname}
          </h2>

          <p className="mt-2 text-emr-text">
            <strong>DOB:</strong> {noteData.dob.slice(0, 10)}
            <span className="mx-3 text-emr-border">|</span>
            <strong>Phone:</strong> {noteData.phone}
          </p>
        </div>

        {/* note data */}
        <div className="mt-6">
          <p className="emr-secondary-text text-sm italic mb-3 text-center">
            {new Date(noteData.created_at).toLocaleString()} by{' '}
            {noteData.signed_therapist}
          </p>

          <div className="border border-emr-border rounded-lg bg-emr-surface p-4">
            <p className="whitespace-pre-line text-emr-text text-left">
              {noteData.content}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default NoteViewer;
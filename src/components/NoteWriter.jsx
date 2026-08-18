import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatientAccessGuard from '../hooks/usePatientAccessGuard';

function NoteWriter() {
  const { patientId, noteId: routeNoteId } = useParams();

  const [patient, setPatient] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [noteId, setNoteId] = useState(routeNoteId || null);
  const [signingClinician, setSigningClinician] = useState('');
  const [isSigned, setIsSigned] = useState(false);

  // data fetching
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/patients/${patientId}`
        );

        if (!response.ok) {
          throw new Error('Unable to retrieve patient.');
        }

        const data = await response.json();
        setPatient(data);
      } catch (error) {
        setStatus(error.message);
      }
    };

    fetchPatient();
  }, [patientId]);

  // retrieve existing draft note when reopening for editing
  useEffect(() => {
    if (!routeNoteId) return;

    const fetchExistingNote = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/notes/${routeNoteId}`
        );

        if (!response.ok) {
          throw new Error('Unable to retrieve note.');
        }

        const data = await response.json();

        setNoteId(data.note_id);
        setContent(data.content || '');

        if (data.is_signed) {
          setIsSigned(true);
          setSigningClinician(data.signed_therapist || '');
          setStatus('This note has already been signed and locked.');
        }
      } catch (error) {
        setStatus(error.message);
      }
    };

    fetchExistingNote();
  }, [routeNoteId]);

  // Access guard
  const isBlocked = usePatientAccessGuard(patientId);

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
            Close all windows for the current patient before opening a different patient's chart.
          </p>
        </div>
      </div>
    );
  }

  // create the first draft or update an existing draft
  const saveDraft = async () => {
    if (!content.trim()) {
      setStatus('Enter note content before saving.');
      return null;
    }

    try {
      setIsSaving(true);
      setStatus('');

      let response;

      if (noteId) {
        response = await fetch(
          `http://localhost:3001/notes/${noteId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: content.trim(),
            }),
          }
        );
      } else {
        response = await fetch(
          'http://localhost:3001/notes',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              patient_id: Number(patientId),
              content: content.trim(),
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error('Unable to save note draft.');
      }

      const savedNote = await response.json();

      setNoteId(savedNote.note_id);
      setStatus('Note draft saved successfully.');

      return savedNote.note_id;
    } catch (error) {
      setStatus(error.message);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // formally sign and lock the note
  const signAndSubmit = async () => {
    if (!content.trim()) {
      setStatus('Enter note content before signing.');
      return;
    }

    if (!signingClinician.trim()) {
      setStatus('Signing clinician is required.');
      return;
    }

    try {
      setIsSaving(true);
      setStatus('');

      // A note must exist in the database before it can be signed.
      let currentNoteId = noteId;

      if (!currentNoteId) {
        currentNoteId = await saveDraft();

        if (!currentNoteId) {
          return;
        }
      }

      const response = await fetch(
        `http://localhost:3001/notes/${currentNoteId}/sign`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: content.trim(),
            signed_therapist: signingClinician.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Unable to sign note.');
      }

      await response.json();

      setIsSigned(true);
      setStatus('Note signed and submitted.');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="emr-page">
      <div className="emr-workspace min-h-[calc(100vh-1.5rem)]">

        {/* sticky header of pt IDing info */}
        <div className="emr-patient-header border-b border-emr-border">
          <h1 className="text-2xl font-bold text-emr-text">
            {routeNoteId ? 'Edit Draft Note' : 'New Note'}
          </h1>

          {patient ? (
            <div className="mt-2 text-emr-text">
              <p className="font-semibold">
                {patient.fname} {patient.lname}
              </p>

              <p className="mt-1">
                <strong>DOB:</strong>{' '}
                {patient.dob
                  ? patient.dob.slice(0, 10)
                  : 'Not available'}

                <span className="mx-3 text-emr-border">
                  |
                </span>

                <strong>Phone:</strong>{' '}
                {patient.phone || 'Not available'}
              </p>
            </div>
          ) : (
            <p className="emr-secondary-text mt-2">
              Loading patient information...
            </p>
          )}
        </div>

        <div className="mt-6">
          <textarea
            value={content}
            onChange={(event) =>
              setContent(event.target.value)
            }
            disabled={isSigned}
            placeholder="Enter note..."
            className="w-full min-h-[400px] p-4 bg-emr-surface border border-emr-border rounded text-emr-text resize-y focus:outline-none focus:border-emr-primary disabled:opacity-70"
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-emr-text mb-1">
              Signing Clinician
            </label>

            <input
              type="text"
              value={signingClinician}
              onChange={(event) =>
                setSigningClinician(event.target.value)
              }
              disabled={isSigned}
              placeholder="Clinician name"
              className="w-full p-3 bg-emr-surface border border-emr-border rounded text-emr-text focus:outline-none focus:border-emr-primary disabled:opacity-70"
            />
          </div>

          <div className="flex items-center gap-4 mt-4">
            {!isSigned && (
              <>
                <button
                  type="button"
                  onClick={saveDraft}
                  disabled={isSaving}
                  className="emr-primary-button disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  type="button"
                  onClick={signAndSubmit}
                  disabled={isSaving}
                  className="emr-primary-button disabled:opacity-50"
                >
                  Sign and Submit
                </button>
              </>
            )}

            {isSigned && (
              <p className="font-semibold text-emr-primary">
                Signed and locked
              </p>
            )}

            {status && (
              <p className="emr-secondary-text">
                {status}
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default NoteWriter;
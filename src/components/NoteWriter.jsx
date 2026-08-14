import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatientAccessGuard from '../hooks/usePatientAccessGuard';

function NoteWriter() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

  const saveNote = async () => {
    if (!content.trim()) {
      setStatus('Enter note content before saving.');
      return;
    }

    try {
      setIsSaving(true);
      setStatus('');

      const response = await fetch('http://localhost:3001/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: Number(patientId),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to save note.');
      }

      await response.json();

      setStatus('Note draft saved successfully.');
      setContent('');
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
            New Note
          </h1>

          {patient ? (
            <div className="mt-2 text-emr-text">
              <p className="font-semibold">
                {patient.fname} {patient.lname}
              </p>

              <p className="mt-1">
                <strong>DOB:</strong>{' '}
                {patient.dob ? patient.dob.slice(0, 10) : 'Not available'}
                <span className="mx-3 text-emr-border">|</span>
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
            onChange={(event) => setContent(event.target.value)}
            placeholder="Enter note..."
            className="w-full min-h-[400px] p-4 bg-emr-surface border border-emr-border rounded text-emr-text resize-y focus:outline-none focus:border-emr-primary"
          />

          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              onClick={saveNote}
              disabled={isSaving}
              className="emr-primary-button disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>

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
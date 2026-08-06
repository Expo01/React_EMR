import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function NoteWriter() {
  const { patientId } = useParams();

  const [patient, setPatient] = useState(null);
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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

      const savedNote = await response.json();

      setStatus(`Note draft saved successfully.`);
      setContent('');
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-600 pb-4 mb-4">
          <h1 className="text-2xl font-semibold">New Note</h1>

          {patient ? (
            <div className="mt-2 text-gray-300">
              <p>
                <strong>Patient:</strong> {patient.fname} {patient.lname}
              </p>
              <p>
                <strong>DOB:</strong>{' '}
                {patient.dob ? patient.dob.slice(0, 10) : 'Not available'}
              </p>
              <p>
                <strong>Phone:</strong> {patient.phone || 'Not available'}
              </p>
            </div>
          ) : (
            <p className="mt-2 text-gray-400">Loading patient information...</p>
          )}
        </header>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Enter note..."
          className="w-full min-h-[400px] p-4 bg-gray-800 border border-gray-600 rounded text-white resize-y focus:outline-none focus:border-blue-500"
        />

        <div className="flex items-center gap-4 mt-4">
          <button
            type="button"
            onClick={saveNote}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </button>

          {status && <p className="text-gray-300">{status}</p>}
        </div>
      </div>
    </div>
  );
}

export default NoteWriter;
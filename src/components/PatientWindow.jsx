import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatientAccessGuard from '../hooks/usePatientAccessGuard';
//patientappointments and patientnotes jsx files to be extracted later as is medicationlist
import MedicationList from './MedicationList';
import ClinicalDocuments from './ClinicalDocuments';

function PatientWindow() {
  const { id } = useParams(); // Get patient ID from URL
  const [patient, setPatient] = useState(null);
  const [view, setView] = useState('appointments'); // 'appointments' or 'notes'
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [medications, setMedications] = useState([]);
  const [documents, setDocuments] = useState([]);

  // helper functions
  const openNewNoteWindow = () => {
    window.open(
      `/patient/${id}/note/new`,
      "_blank",
      "width=800,height=700"
    );
  };

  //data fetching
  useEffect(() => {
    //fetches pt specific IDing info
    async function fetchPatient() {
      try {
        const res = await fetch(`http://localhost:3001/patients/${id}`);
        if (!res.ok) throw new Error('Failed to fetch patient');
        const data = await res.json();
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    }

    //fetches pt specific appointment list
    async function fetchAppointments() {
      try {
        const res = await fetch(`http://localhost:3001/appointments/${id}`);
        if (!res.ok) throw new Error('Failed to fetch appointments');
        const data = await res.json();
        setAppointments(data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    }

    //fetches pt specific note list
    async function fetchNotes() {
      try {
        const res = await fetch(`http://localhost:3001/notes/${id}/notes`);
        if (!res.ok) throw new Error('Failed to fetch notes');
        const data = await res.json();
        setNotes(data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    }

    async function fetchMedications() {
      try {
        const res = await fetch(
          `http://localhost:3001/medications/${id}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch medications');
        }

        setMedications(await res.json());
      } catch (error) {
        console.error('Error fetching medications:', error);
      }
    }

    async function fetchDocuments() {
      try {
        const res = await fetch(
          `http://localhost:3001/clinical-documents/${id}`
        );

        if (!res.ok) {
          throw new Error('Failed to fetch clinical documents');
        }

        const data = await res.json();
        setDocuments(data);
      } catch (error) {
        console.error('Error fetching clinical documents:', error);
      }
    }

    fetchPatient();
    fetchAppointments();
    fetchNotes();
    fetchMedications();
    fetchDocuments();
  }, [id]);

    // Access guard
  const isBlocked = usePatientAccessGuard(id);
    if (isBlocked) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="max-w-md w-full p-6 bg-blue-950 rounded-lg shadow-lg border border-red-500 text-center">
            <h2 className="text-xl font-semibold text-red-400 mb-4">
              Access Denied
            </h2>

            <p className="text-gray-200">
              Another patient chart is already open.
            </p>

            <p className="text-gray-400 mt-2 text-sm">
              Close all windows for the current patient before opening a different patient.
            </p>
          </div>
        </div>
);
    }


  if (!patient) return <div className="text-white">Loading...</div>;

    return (
    <div className="bg-blue-950 text-white p-6 rounded-lg shadow-lg min-h-screen max-w-4xl mx-auto">

      {/* Patient header */}
      <h1 className="text-2xl font-bold mb-4">
        {patient.fname} {patient.lname}
      </h1>

      <p><strong>DOB:</strong> {patient.dob.slice(0, 10)}</p>
      <p><strong>Phone:</strong> {patient.phone}</p>

      {/* Navigation */}
      <div className="mt-6 flex gap-4">
        <button
          className={`px-4 py-2 rounded ${view === 'appointments' ? 'bg-blue-800' : 'bg-gray-700'}`}
          onClick={() => setView('appointments')}
        >
          Appointments
        </button>

        <button
          className={`px-4 py-2 rounded ${view === 'notes' ? 'bg-blue-800' : 'bg-gray-700'}`}
          onClick={() => setView('notes')}
        >
          Notes
        </button>

        <button
          className={`px-4 py-2 rounded ${view === 'medications' ? 'bg-blue-800' : 'bg-gray-700'}`}
          onClick={() => setView('medications')}
        >
          Medications
        </button>

        <button
          className={`px-4 py-2 rounded ${view === 'documents'? 'bg-blue-800': 'bg-gray-700'}`}
          onClick={() => setView('documents')}
        >
          Clinical Documents
        </button>
      </div>

      <div className="mt-6">

        {/* Appointments */}
        {view === 'appointments' && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Appointments</h2>

            {appointments.length === 0 ? (
              <p className="text-gray-400">No appointments found.</p>
            ) : (
              <ul className="space-y-2">
                {appointments.map((appt) => (
                  <li
                    key={appt.appointment_id}
                    className="border-b border-gray-600 pb-2 text-gray-300"
                  >
                    {appt.scheduled_date.slice(0, 10)} @{' '}
                    {appt.scheduled_time.slice(0, 5)} with{' '}
                    {appt.scheduled_therapist}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Notes */}
        {view === 'notes' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Notes</h2>

              <button
                type="button"
                onClick={openNewNoteWindow}
                className="px-4 py-2 bg-blue-700 rounded hover:bg-blue-600"
              >
                New Note
              </button>
            </div>

            {notes.length === 0 ? (
              <p className="text-gray-400">No notes found.</p>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note.note_id}
                    className="p-4 bg-blue-900 rounded cursor-pointer hover:bg-blue-800"
                    onClick={() =>
                      window.open(
                        `/note/${note.note_id}`,
                        '_blank',
                        'width=800,height=600'
                      )
                    }
                  >
                    <p className="text-sm text-gray-300">
                      {new Date(note.created_at).toLocaleString(undefined, {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}{' '}
                      by {note.signed_therapist}
                    </p>

                    <p className="text-gray-400 italic">
                      Click to view full note
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Medications */}
        {view === 'medications' && (
          <MedicationList
            medications={medications}
            patientId={id}
          />
        )}

        {/* clinical docs */}
        {view === 'documents' && (
          <ClinicalDocuments
            documents={documents}
            patientId={id}
          />
        )}

      </div>
    </div>
  );
}

export default PatientWindow;

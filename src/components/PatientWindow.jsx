//patientwindow.jsx

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function PatientWindow() {
  const { id } = useParams(); // Get patient ID from URL
  const [patient, setPatient] = useState(null);
  const [view, setView] = useState('appointments'); // 'appointments' or 'notes'
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);

  useEffect(() => {
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

    fetchPatient();
    fetchAppointments();
    fetchNotes();
  }, [id]);

  if (!patient) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-blue-950 text-white p-6 rounded-lg shadow-lg min-h-screen max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{patient.fname} {patient.lname}</h1>
      <p><strong>DOB:</strong> {patient.dob.slice(0, 10)}</p>
      <p><strong>Phone:</strong> {patient.phone}</p>

      <div className="mt-6">
        <button
          className={`mr-4 px-4 py-2 rounded ${view === 'appointments' ? 'bg-blue-800' : 'bg-gray-700'}`}
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
      </div>

      <div className="mt-4">
        {view === 'appointments' ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">Appointments</h2>
            {appointments.length === 0 ? (
              <p className="text-gray-400">No appointments found.</p>
            ) : (
              <ul className="space-y-2">
                {appointments.map(appt => (
                  <p className="text-gray-300">
                    <li key={appt.appointment_id} className="border-b border-gray-600 pb-2">
                      {appt.scheduled_date.slice(0, 10)} @ {appt.scheduled_time.slice(0, 5)} with {appt.scheduled_therapist}
                    </li>
                  </p>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            {notes.length === 0 ? (
              <p className="text-gray-400">No notes found.</p>
            ) : (
              <ul className="space-y-4">
                {/* // uses new API route to joined patients and notes tables */}
                {notes.map(note => (
                  <div
                    key={note.note_id}
                    className="mb-4 p-4 bg-blue-900 rounded cursor-pointer hover:bg-blue-800"
                    onClick={() => window.open(`/note/${note.note_id}`, '_blank', 'width=800,height=600')}
                  >
                    <p className="text-sm text-gray-300">
                      {new Date(note.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} by {note.signed_therapist}
                    </p>
                    <p className="text-gray-400 italic">Click to view full note</p>
                  </div>
                ))}

              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientWindow;

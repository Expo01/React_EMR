import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function PatientWindow() {
  const { id } = useParams(); // Get patient ID from URL
  const [patient, setPatient] = useState(null);
  const [view, setView] = useState('appointments'); // 'appointments' or 'notes'
  const [appointments, setAppointments] = useState([]);
  const [notes, setNotes] = useState([]);

  const openNewNoteWindow = () => {
    window.open(
      `/patient/${id}/note/new`,
      "_blank",
      "width=800,height=700"
    );
  };

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

    fetchPatient();
    fetchAppointments();
    fetchNotes();
  }, [id]);



  if (!patient) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-blue-950 text-white p-6 rounded-lg shadow-lg min-h-screen max-w-4xl mx-auto">
     
      {/* pt IDing info header */}
      <h1 className="text-2xl font-bold mb-4">{patient.fname} {patient.lname}</h1>
      <p><strong>DOB:</strong> {patient.dob.slice(0, 10)}</p>
      <p><strong>Phone:</strong> {patient.phone}</p>

      {/* Appointments and Notes buttons */}
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
        {/* appointments vs notes logic */}
        {view === 'appointments' ? (
          // display appointments
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
          // display notes
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Notes</h2>
              {/* button to populate new note window for writing */}
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
              <ul className="space-y-4">
                {notes.map(note => (
                  <div
                    key={note.note_id}
                    className="mb-4 p-4 bg-blue-900 rounded cursor-pointer hover:bg-blue-800"
                    // open selected note in new window using route in app.jsx
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

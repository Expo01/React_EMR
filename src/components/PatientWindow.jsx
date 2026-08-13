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
      '_blank',
      'width=800,height=700'
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
      <div className="w-full bg-[#DCE7E7] text-[#183234] p-3">
        <div className="w-full bg-[#F4F8F8] rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-[#AD4E4E] mb-4">
            Access Denied
          </h2>

          <p className="text-[#183234]">
            Another patient chart is already open.
          </p>

          <p className="text-[#536C6E] mt-2 text-sm">
            Close all windows for the current patient before opening a different patient.
          </p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#DCE7E7] text-[#183234]">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#DCE7E7] text-[#183234] p-4">

      <div className="min-h-[calc(100vh-2rem)] w-full bg-[#F4F8F8] rounded-lg shadow-sm p-6">

        {/* Patient header */}
        <div className="sticky top-0 z-10 bg-[#F4F8F8] text-center pb-4">
          <h1 className="text-2xl font-bold text-[#183234]">
            {patient.fname} {patient.lname}
          </h1>

          <p className="mt-2 text-[#183234]">
            <strong>DOB:</strong> {patient.dob.slice(0, 10)}
            <span className="mx-3 text-[#97B5B5]">|</span>
            <strong>Phone:</strong> {patient.phone}
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded ${
              view === 'appointments'
                ? 'bg-[#0F777A] text-white'
                : 'bg-[#B9D0D0] text-[#183234] hover:bg-[#A8C4C4]'
            }`}
            onClick={() => setView('appointments')}
          >
            Appointments
          </button>

          <button
            className={`px-4 py-2 rounded ${
              view === 'notes'
                ? 'bg-[#0F777A] text-white'
                : 'bg-[#B9D0D0] text-[#183234] hover:bg-[#A8C4C4]'
            }`}
            onClick={() => setView('notes')}
          >
            Notes
          </button>

          <button
            className={`px-4 py-2 rounded ${
              view === 'medications'
                ? 'bg-[#0F777A] text-white'
                : 'bg-[#B9D0D0] text-[#183234] hover:bg-[#A8C4C4]'
            }`}
            onClick={() => setView('medications')}
          >
            Medications
          </button>

          <button
            className={`px-4 py-2 rounded ${
              view === 'documents'
                ? 'bg-[#0F777A] text-white'
                : 'bg-[#B9D0D0] text-[#183234] hover:bg-[#A8C4C4]'
            }`}
            onClick={() => setView('documents')}
          >
            Clinical Documents
          </button>
        </div>

        <div className="mt-6">

        {/* Appointments */}
        {view === 'appointments' && (
          <div>
            <h2 className="text-xl font-semibold mb-3 text-center text-[#183234]">
              Appointments
            </h2>

            {appointments.length === 0 ? (
              <p className="text-center text-[#536C6E]">
                No appointments found.
              </p>
            ) : (
              <div className="max-h-[430px] overflow-y-auto border border-[#97B5B5] rounded-lg bg-[#F4F8F8]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[#B9D0D0] text-[#183234]">
                    <tr>
                      <th className="px-4 py-3 text-center font-semibold">Date</th>
                      <th className="px-4 py-3 text-center font-semibold">Time</th>
                      <th className="px-4 py-3 text-center font-semibold">Therapist</th>
                    </tr>
                  </thead>

                  <tbody>
                    {appointments.map((appt) => (
                      <tr
                        key={appt.appointment_id}
                        className="border-t border-[#97B5B5] hover:bg-[#C9E0E0]"
                      >
                        <td className="px-4 py-3">
                          {appt.scheduled_date.slice(0, 10)}
                        </td>

                        <td className="px-4 py-3">
                          {appt.scheduled_time.slice(0, 5)}
                        </td>

                        <td className="px-4 py-3">
                          {appt.scheduled_therapist}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

          {/* Notes */}
          {view === 'notes' && (
            <div>
              <div className="relative mb-3">
                <h2 className="text-xl font-semibold text-center text-[#183234]">
                  Notes
                </h2>

                {/* button to populate new note window for writing */}
                <button
                  type="button"
                  onClick={openNewNoteWindow}
                  className="absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 bg-[#0F777A] text-white rounded text-sm font-medium hover:bg-[#0A6264]"
                >
                  New Note
                </button>
              </div>

              {notes.length === 0 ? (
                <p className="text-center text-[#536C6E]">
                  No notes found.
                </p>
              ) : (
                <div className="max-h-[430px] overflow-y-auto border border-[#97B5B5] rounded-lg bg-[#F4F8F8]">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[#B9D0D0] text-[#183234]">
                      <tr>
                        <th className="px-4 py-3 text-center font-semibold">
                          Date
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Time
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Therapist
                        </th>
                        <th className="px-4 py-3 text-center font-semibold">
                          Note
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {notes.map((note) => (
                        <tr
                          key={note.note_id}
                          className="border-t border-[#97B5B5] cursor-pointer hover:bg-[#C9E0E0]"
                          // open selected note in new window using route in app.jsx
                          onClick={() =>
                            window.open(
                              `/note/${note.note_id}`,
                              '_blank',
                              'width=800,height=600'
                            )
                          }
                        >
                          <td className="px-4 py-3 text-center">
                            {new Date(note.created_at).toLocaleDateString()}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {new Date(note.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="px-4 py-3 text-center">
                            {note.signed_therapist}
                          </td>

                          <td className="px-4 py-3 text-center text-[#0F777A] font-medium">
                            View
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
    </div>
  );
}

export default PatientWindow;
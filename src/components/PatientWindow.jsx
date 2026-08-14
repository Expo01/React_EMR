import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatientAccessGuard from '../hooks/usePatientAccessGuard';
//patientappointments and patientnotes jsx files to be extracted later as is medicationlist
import MedicationList from './MedicationList';
import ClinicalDocuments from './ClinicalDocuments';

function PatientWindow() {
  const { id } = useParams(); // Get patient ID from URL
  const [patient, setPatient] = useState(null);
  const [view, setView] = useState('appointments'); // appointments, notes, medications, or documents
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

  if (!patient) {
    return (
      <div className="emr-page flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="emr-page">

      <div className="emr-workspace min-h-[calc(100vh-1.5rem)]">

        {/* Patient header */}
        <div className="emr-patient-header">
          <h1 className="text-2xl font-bold text-emr-text">
            {patient.fname} {patient.lname}
          </h1>

          <p className="mt-2 text-emr-text">
            <strong>DOB:</strong> {patient.dob.slice(0, 10)}
            <span className="mx-3 text-emr-border">|</span>
            <strong>Phone:</strong> {patient.phone}
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-6 flex gap-4">
          <button
            className={
              view === 'appointments'
                ? 'emr-nav-button-active'
                : 'emr-nav-button'
            }
            onClick={() => setView('appointments')}
          >
            Appointments
          </button>

          <button
            className={
              view === 'notes'
                ? 'emr-nav-button-active'
                : 'emr-nav-button'
            }
            onClick={() => setView('notes')}
          >
            Notes
          </button>

          <button
            className={
              view === 'medications'
                ? 'emr-nav-button-active'
                : 'emr-nav-button'
            }
            onClick={() => setView('medications')}
          >
            Medications
          </button>

          <button
            className={
              view === 'documents'
                ? 'emr-nav-button-active'
                : 'emr-nav-button'
            }
            onClick={() => setView('documents')}
          >
            Clinical Documents
          </button>
        </div>

        <div className="mt-6">

          {/* Appointments */}
          {view === 'appointments' && (
            <div>
              <h2 className="emr-section-title">
                Appointments
              </h2>

              {appointments.length === 0 ? (
                <p className="emr-empty-message">
                  No appointments found.
                </p>
              ) : (
                <div className="emr-table-container">
                  <table className="emr-table">
                    <thead className="emr-table-header">
                      <tr>
                        <th className="emr-table-heading">Date</th>
                        <th className="emr-table-heading">Time</th>
                        <th className="emr-table-heading">Therapist</th>
                      </tr>
                    </thead>

                    <tbody>
                      {appointments.map((appt) => (
                        <tr
                          key={appt.appointment_id}
                          className="emr-table-row"
                        >
                          <td className="emr-table-cell">
                            {appt.scheduled_date.slice(0, 10)}
                          </td>

                          <td className="emr-table-cell">
                            {appt.scheduled_time.slice(0, 5)}
                          </td>

                          <td className="emr-table-cell">
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
                <h2 className="emr-section-title mb-0">
                  Notes
                </h2>

                {/* button to populate new note window for writing */}
                <button
                  type="button"
                  onClick={openNewNoteWindow}
                  className="emr-primary-button absolute right-0 top-1/2 -translate-y-1/2 text-sm"
                >
                  New Note
                </button>
              </div>

              {notes.length === 0 ? (
                <p className="emr-empty-message">
                  No notes found.
                </p>
              ) : (
                <div className="emr-table-container">
                  <table className="emr-table">
                    <thead className="emr-table-header">
                      <tr>
                        <th className="emr-table-heading">
                          Date
                        </th>
                        <th className="emr-table-heading">
                          Time
                        </th>
                        <th className="emr-table-heading">
                          Therapist
                        </th>
                        <th className="emr-table-heading">
                          Note
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {notes.map((note) => (
                        <tr
                          key={note.note_id}
                          className="emr-table-row cursor-pointer"
                          // open selected note in new window using route in app.jsx
                          onClick={() =>
                            window.open(
                              `/note/${note.note_id}`,
                              '_blank',
                              'width=800,height=600'
                            )
                          }
                        >
                          <td className="emr-table-cell">
                            {new Date(note.created_at).toLocaleDateString()}
                          </td>

                          <td className="emr-table-cell">
                            {new Date(note.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>

                          <td className="emr-table-cell">
                            {note.signed_therapist}
                          </td>

                          <td className="emr-table-cell text-emr-primary font-medium">
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
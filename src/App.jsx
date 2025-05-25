import './App.css'
import { useEffect, useState } from 'react'
import Patients from './Patients'
import Calendar from './Calendar'
import PatientWindow from './PatientWindow';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from 'react-router-dom'  // installed in terminal via npm


function NavDropdown() {


  return (
    <nav className="bg-blue-900 text-white px-4 py-3 relative group">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">EMR System</h1>
        <div className="relative">
          <div className="cursor-pointer">☰ Menu</div>

          <div className="absolute bg-blue-800 mt-2 rounded shadow-lg w-48 right-0 z-10 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
            <ul className="flex flex-col p-2 space-y-1">
              <li>
                <Link to="/calendar" className="main-burger">Calendar</Link>
              </li>
              <li>
                <Link to="/patients" className="main-burger">Patients</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>

  )
}

// 👇 Main App component
function App() {
  const [notes, setNotes] = useState([])
  const [appointments, setAppointments] = useState([])


  useEffect(() => {
    fetch('http://localhost:3001/notes')
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error('Error fetching notes:', err))
  }, [])

  useEffect(() => {
    fetch('http://localhost:3001/appointments')
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error('Error fetching appointments:', err))
  }, [])

  return (
    <>
      <Router>
        <NavDropdown />
        <Routes>
          <Route path="/" element={<Navigate to="/patients" />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/patient/:id" element={<PatientWindow />} />
        </Routes>
      </Router>
      <main className="p-4">



        {/* Notes Table */}
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
                    {note.content.length > 20 ? `${note.content.slice(0, 20)}...` : note.content}
                  </td>
                  <td className="data-table-row">{note.signed_therapist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Appointments Table */}
        <div>
          <h1 className="text-2xl font-bold mb-4">Appointment List</h1>
          <table className="min-w-full table-auto border border-gray-300 bg-blue-950 text-white text-left">
            <thead className="bg-blue-900 text-gray-200">
              <tr>
                <th className="data-table-header">Scheduled Date</th>
                <th className="data-table-header">Scheduled Time</th>
                <th className="data-table-header">Scheduled Therapist</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.appointment_id} className="hover:bg-blue-800">
                  <td className="data-table-row">{appointment.scheduled_date}</td>
                  <td className="data-table-row">{appointment.scheduled_time}</td>
                  <td className="data-table-row">{appointment.scheduled_therapist}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </>
  )
}

export default App
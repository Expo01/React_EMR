import './App.css'
import { useEffect, useState } from 'react'


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
                <a href="#" className="main-burger">Calendar</a>
              </li>
              <li>
                <a href="#" className="main-burger">Patients</a>
              </li>
              <li>
                <a href="#" className="main-burger">Notes</a>
              </li>
              <li>
                <a href="#" className="main-burger">Appointments</a>
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
  const [patients, setPatients] = useState([]) // setPatients() called in useEffect to update the state of patients[]
  const [notes, setNotes] = useState([])
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/patients') // GET request to backend via port 3001 where backend lives
      .then((res) => res.json()) // parse json from response
      .then((data) => setPatients(data)) // store data in react state
      .catch((err) => console.error('Error fetching patients:', err)) // handle any errors
  }, []) // run the effect once the component mounts 

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
      <NavDropdown />
      <main className="p-4">

        {/* Patients Table */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-4">Patient List</h1>
          <table className="min-w-full table-auto border border-gray-300 bg-blue-950 text-white text-left">
            <thead className="bg-blue-900 text-gray-200">
              <tr>
                <th className="data-table-header">First Name</th>
                <th className="data-table-header">Last Name</th>
                <th className="data-table-header">DOB</th>
                <th className="data-table-header">Phone</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-blue-800">
                  <td className="data-table-row">{patient.fname}</td>
                  <td className="data-table-row">{patient.lname}</td>
                  <td className="data-table-row">{patient.dob.slice(0, 10)}</td>
                  <td className="data-table-row">{patient.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
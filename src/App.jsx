//app.jsx

import './assets/App.css'
import Patients from './components/Patients'
import Calendar from './components/Calendar'
import PatientWindow from './components/PatientWindow';
import NavDropDown from './components/NavDropDown';
import PatientNotes from './components/PatientNotes';
import PatientAppointments from './components/PatientAppointments';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // instal w/ npm

// 👇 Main App component
function App() {

  return (
    <>

      <Router>
        <NavDropDown />
        <Routes>
          <Route path="/" element={<Navigate to="/patients" />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/patient/:id" element={<PatientWindow />} />
        </Routes>
      </Router>

      <main className="p-4">
        <PatientNotes />
        <PatientAppointments />
      </main>

    </>
  )
}

export default App
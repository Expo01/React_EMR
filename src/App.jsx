//app.jsx

import './assets/App.css'
import Patients from './components/Patients'
import Calendar from './components/Calendar'
import PatientWindow from './components/PatientWindow';
import NavDropDown from './components/NavDropDown';
import PatientNotes from './components/PatientNotes';
import PatientAppointments from './components/PatientAppointments';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // installed w/ npm
import NoteViewer from './components/NoteViewer';

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
          <Route path="/note/:noteId" element={<NoteViewer />} />
        </Routes>
      </Router>

      <main className="p-4">
      </main>

    </>
  )
}

export default App
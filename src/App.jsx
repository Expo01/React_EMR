//app.jsx

import './assets/App.css'
import Patients from './components/Patients'
import Calendar from './components/Calendar'
import PatientWindow from './components/PatientWindow';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // installed w/ npm
import NoteViewer from './components/NoteViewer';
import MainLayout from './components/layouts/MainLayout';
import MinimalLayout from './components/layouts/MinimalLayout';
import NoteWriter from './components/NoteWriter';
import MedicationWriter from './components/MedicationWriter';
import ClinicalDocumentViewer from './components/ClinicalDocumentViewer';


function App() {
  return (
    <Router>
      <Routes>
        {/* Routes with NavDropDown */}
        <Route path="/"element={<MainLayout><Navigate to="/patients" /></MainLayout>}/> 
        {/* <Navigate/> used for default route to patients on main page */}
        <Route path="/patients"element={<MainLayout><Patients /></MainLayout>}/>
        <Route path="/calendar" element={<MainLayout><Calendar /></MainLayout>}/>
        
        {/* Routes without NavDropDown */}
        <Route path="/patient/:id"element={<MinimalLayout><PatientWindow /></MinimalLayout>}/>
        <Route path="/note/:noteId"element={<MinimalLayout><NoteViewer /></MinimalLayout>}/>

        {/* generate new note */}
        <Route path="/patient/:patientId/note/new"element={<MinimalLayout><NoteWriter /></MinimalLayout>}/>
        <Route path="/patient/:patientId/note/:noteId/edit"element={<MinimalLayout><NoteWriter /></MinimalLayout>}
/>
        {/* edit medications */}
        <Route path="/patient/:patientId/medications/edit"element={<MinimalLayout><MedicationWriter /></MinimalLayout>}/>
        <Route path="/patient/:patientId/document/:documentId"element={<MinimalLayout><ClinicalDocumentViewer /></MinimalLayout>
  }
/>
      </Routes>
    </Router> 
  );
}

export default App
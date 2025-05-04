import './App.css'

// src/App.jsx
import { useEffect, useState } from 'react'

function App() {
  const [patients, setPatients] = useState([])

  useEffect(() => {
    fetch('http://localhost:3001/patients')
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error('Error fetching patients:', err))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Patient List</h1>
      <ul className="space-y-2">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className="bg-blue-950 shadow p-4 rounded border"
          >
            <p><strong>Name:</strong> {patient.name}</p>
            <p><strong>DOB:</strong> {patient.dob}</p>
            <p><strong>Phone:</strong> {patient.phone}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App






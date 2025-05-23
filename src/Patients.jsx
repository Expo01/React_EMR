// src/Patients.jsx
import { useEffect, useState } from 'react'

function Patients() {
  const [patients, setPatients] = useState([]) // setPatients() called in useEffect to update the state of patients[]

  useEffect(() => {
    fetch('http://localhost:3001/patients') // GET request to backend via port 3001 where backend lives
      .then((res) => res.json()) // parse json from response
      .then((data) => setPatients(data)) // store data in react state
      .catch((err) => console.error('Error fetching patients:', err)) // handle any errors
  }, []) // run the effect once the component mounts 

  return (
    <main className="p-4">
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
            <tr key={patient.patient_id} className="hover:bg-blue-800">
              <td className="data-table-row">{patient.fname}</td>
              <td className="data-table-row">{patient.lname}</td>
              <td className="data-table-row">{patient.dob.slice(0, 10)}</td>
              <td className="data-table-row">{patient.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}

export default Patients

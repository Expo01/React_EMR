import { useEffect, useState } from 'react'
import PatientWindow from './PatientWindow'

function Patients() {
  const [patients, setPatients] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)

  useEffect(() => {
    fetch('http://localhost:3001/patients')
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.error('Error fetching patients:', err))
  }, [])

  return (
    <div>
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
            <tr
              key={patient.patient_id}
              className="hover:bg-blue-800 cursor-pointer"
              onClick={() => setSelectedPatient(patient)}
            >
              <td className="data-table-row">{patient.fname}</td>
              <td className="data-table-row">{patient.lname}</td>
              <td className="data-table-row">{patient.dob.slice(0, 10)}</td>
              <td className="data-table-row">{patient.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedPatient && (
        <PatientWindow patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
      )}
    </div>
  )
}


export default Patients

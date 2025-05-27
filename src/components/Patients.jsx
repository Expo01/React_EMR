//patients.jsx

import { useEffect, useState } from 'react';

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/patients')
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error('Error fetching patients:', err));
  }, []);

  const openPatientInNewWindow = (id) => {
    const win = window.open(`/patient/${id}`, '_blank', 'width=900,height=700');
    if (win) win.focus();
    else alert('Popup blocked. Please allow popups for this site.');
  };

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Patient List</h1>
      <div className="max-h-[400px] overflow-y-auto border border-gray-300 rounded">
        <table className="min-w-full table-auto bg-blue-950 text-white text-left">
          <thead className="bg-blue-900 text-gray-200 sticky top-0">
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
                className="hover:bg-blue-700 cursor-pointer"
                onClick={() => openPatientInNewWindow(patient.patient_id)}
              >
                <td className="data-table-row">{patient.fname}</td>
                <td className="data-table-row">{patient.lname}</td>
                <td className="data-table-row">{patient.dob.slice(0, 10)}</td>
                <td className="data-table-row">{patient.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  

}

export default Patients;

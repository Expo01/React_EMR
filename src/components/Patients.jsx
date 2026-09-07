import { useEffect, useState } from 'react';
import { openReferenceWindow } from '../utils/openEmrWindow';

function Patients() {
  const [patients, setPatients] = useState([]);

  // retrieve all patients
  useEffect(() => {
    fetch('http://localhost:3001/patients')
      .then(res => res.json())
      .then(data => setPatients(data))
      .catch(err => console.error('Error fetching patients:', err));
  }, []);

// url opened for patient/:id and routing handled by app.jsx for new patient window
const openPatientInNewWindow = (id) => {
  const win = openReferenceWindow(`/patient/${id}`);

  if (!win) {
    alert('Popup blocked. Please allow popups for this site.');
  }
};

  return (
    <div className="emr-workspace">
      <h1 className="text-2xl font-bold text-emr-text mb-6">
        Patient List
      </h1>

      {patients.length === 0 ? (
        <p className="emr-empty-message">
          No patients found.
        </p>
      ) : (
        <div className="emr-table-container">
          <table className="emr-table">
            <thead className="emr-table-header">
              <tr>
                <th className="emr-table-heading">
                  First Name
                </th>

                <th className="emr-table-heading">
                  Last Name
                </th>

                <th className="emr-table-heading">
                  DOB
                </th>

                <th className="emr-table-heading">
                  Phone
                </th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.patient_id}
                  className="emr-table-row cursor-pointer"
                  onClick={() =>
                    openPatientInNewWindow(patient.patient_id)
                  }
                >
                  <td className="emr-table-cell">
                    {patient.fname}
                  </td>

                  <td className="emr-table-cell">
                    {patient.lname}
                  </td>

                  <td className="emr-table-cell">
                    {patient.dob.slice(0, 10)}
                  </td>

                  <td className="emr-table-cell">
                    {patient.phone}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Patients;
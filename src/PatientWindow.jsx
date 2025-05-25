import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

function PatientWindow() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3001/patients/${id}`)
      .then(res => res.json())
      .then(data => setPatient(data))
      .catch(err => console.error(err));
  }, [id]);

  if (!patient) return <div className="text-white">Loading...</div>;

  return (
    <div className="p-4 bg-blue-950 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{patient.fname} {patient.lname}</h1>
      <p><strong>Date of Birth:</strong> {patient.dob}</p>
      <p><strong>Phone:</strong> {patient.phone}</p>
      <div className="mt-6 italic text-gray-300">More patient details and actions will go here.</div>
    </div>
  );
}

export default PatientWindow;

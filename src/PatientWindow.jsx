import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function PatientWindow() {
  const { id } = useParams(); // get patient ID from URL
  const [patient, setPatient] = useState(null);

  useEffect(() => {
    async function fetchPatient() {
      try {
        // Use full backend URL for fetching
        const res = await fetch(`http://localhost:3001/patients/${id}`);
        if (!res.ok) throw new Error('Failed to fetch patient');
        const data = await res.json();
        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient:', error);
      }
    }
    fetchPatient();
  }, [id]);

  if (!patient) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-blue-950 text-white p-6 rounded-lg shadow-lg min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{patient.fname} {patient.lname}</h1>
      <p><strong>DOB:</strong> {patient.dob}</p>
      <p><strong>Phone:</strong> {patient.phone}</p>
      <div className="mt-4 text-gray-300 italic">More patient data will go here...</div>
    </div>
  );
}

export default PatientWindow;

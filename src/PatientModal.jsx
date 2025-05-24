// src/components/PatientModal.jsx
function PatientModal({ patient, onClose }) {
    if (!patient) return null
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-blue-950 text-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
          <button className="absolute top-2 right-2 text-white text-xl" onClick={onClose}>
            &times; {/* &times just renders a 'x' for the onClose function */}
          </button>
          <h2 className="text-xl font-bold mb-4">
            {patient.fname} {patient.lname}
          </h2>
          <p><strong>Date of Birth:</strong> {patient.dob}</p>
          <p><strong>Phone:</strong> {patient.phone}</p>
          {/* Later: Tabs for medications, appointments, notes */}
          <div className="mt-4 text-gray-300 italic">More patient details coming soon...</div>
        </div>
      </div>
    )
  }
  
  export default PatientModal
  
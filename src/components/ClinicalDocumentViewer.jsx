// view a single clinical document

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import usePatientAccessGuard from '../hooks/usePatientAccessGuard';

function ClinicalDocumentViewer() {
  const { patientId, documentId } = useParams();

  const [document, setDocument] = useState(null);
  const [status, setStatus] = useState('');

  const isBlocked = usePatientAccessGuard(patientId);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/clinical-documents/document/${documentId}`
        );

        if (!response.ok) {
          throw new Error('Unable to retrieve clinical document.');
        }

        const data = await response.json();
        setDocument(data);
      } catch (error) {
        setStatus(error.message);
      }
    };

    fetchDocument();
  }, [documentId]);

  if (isBlocked) {
    return (
      <p className="p-6 text-red-400">
        Another patient chart is already open.
      </p>
    );
  }

  if (status) {
    return (
      <p className="p-6 text-red-400">
        {status}
      </p>
    );
  }

  if (!document) {
    return (
      <p className="p-6 text-white">
        Loading document...
      </p>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white">
      <div className="p-4 bg-blue-950">
        <h1 className="text-xl font-semibold">
          {document.document_type}
        </h1>

        <p className="text-gray-300">
          {document.document_name}
        </p>
      </div>

      <iframe
        src={`http://localhost:3001${document.file_path}`}
        title={document.document_name}
        className="w-full h-[calc(100vh-80px)]"
      />
    </div>
  );
}

export default ClinicalDocumentViewer;
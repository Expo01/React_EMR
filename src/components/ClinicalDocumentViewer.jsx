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
      <div className="emr-page flex items-center justify-center">
        <div className="emr-workspace max-w-md text-center border border-emr-border">
          <h2 className="text-xl font-semibold text-emr-error mb-4">
            Access Denied
          </h2>

          <p className="text-emr-text">
            Another patient chart is already open.
          </p>

          <p className="emr-secondary-text mt-2 text-sm">
            Close all windows for the current patient before opening a different patient's chart.
          </p>
        </div>
      </div>
    );
  }

  if (status) {
    return (
      <div className="emr-page flex items-center justify-center">
        <p className="emr-error-text">
          {status}
        </p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="emr-page flex items-center justify-center">
        Loading document...
      </div>
    );
  }

  return (
    <div className="emr-page">
      <div className="emr-workspace min-h-[calc(100vh-1.5rem)]">

        {/* document header */}
        <div className="emr-patient-header border-b border-emr-border">
          <h1 className="text-2xl font-bold text-emr-text">
            {document.document_type}
          </h1>

          <p className="emr-secondary-text mt-2">
            {document.document_name}
          </p>
        </div>

        {/* document display */}
        <div className="mt-4 border border-emr-border rounded-lg overflow-hidden bg-emr-surface">
          <iframe
            src={`http://localhost:3001${document.file_path}`}
            title={document.document_name}
            className="w-full h-[calc(100vh-150px)]"
          />
        </div>

      </div>
    </div>
  );
}

export default ClinicalDocumentViewer;
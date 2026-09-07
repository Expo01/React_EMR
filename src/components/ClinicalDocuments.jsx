import { openReferenceWindow } from '../utils/openEmrWindow';
// view list of all clinical docs for a patient

function ClinicalDocuments({ documents, patientId }) {
  const openDocument = (documentId) => {
    openReferenceWindow(
      `/patient/${patientId}/document/${documentId}`
    );
  };

  return (
    <div>
      <h2 className="emr-section-title">
        Clinical Documents
      </h2>

      {documents.length === 0 ? (
        <p className="emr-empty-message">
          No clinical documents found.
        </p>
      ) : (
        <div className="emr-table-container">
          <table className="emr-table">
            <thead className="emr-table-header">
              <tr>
                <th className="emr-table-heading">Document Type</th>
                <th className="emr-table-heading">Document Name</th>
                <th className="emr-table-heading">Uploaded</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.document_id}
                  onClick={() => openDocument(document.document_id)}
                  className="emr-table-row-action"
                >
                  <td className="emr-table-cell">
                    {document.document_type}
                  </td>

                  <td className="emr-table-cell text-emr-primary font-medium">
                    {document.document_name}
                  </td>

                  <td className="emr-table-cell">
                    {document.uploaded_at
                      ? new Date(document.uploaded_at).toLocaleDateString()
                      : '—'}
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

export default ClinicalDocuments;
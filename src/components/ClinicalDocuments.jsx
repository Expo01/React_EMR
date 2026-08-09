// view list of all clinical docs for a patient

function ClinicalDocuments({ documents, patientId }) {
  const openDocument = (documentId) => {
    window.open(
      `/patient/${patientId}/document/${documentId}`,
      '_blank',
      'width=900,height=700'
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Clinical Documents
      </h2>

      {documents.length === 0 ? (
        <p className="text-gray-400">
          No clinical documents found.
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((document) => (
            <div
              key={document.document_id}
              onClick={() => openDocument(document.document_id)}
              className="p-4 bg-blue-900 rounded cursor-pointer hover:bg-blue-800"
            >
              <p className="font-semibold">
                {document.document_type}
              </p>

              <p className="text-gray-300">
                {document.document_name}
              </p>

              {document.uploaded_at && (
                <p className="text-sm text-gray-400">
                  {new Date(document.uploaded_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClinicalDocuments;
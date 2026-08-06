import { useEffect, useRef, useState } from 'react';

// Shared browser storage key used by all patient-related windows
const STORAGE_KEY = 'activePatientAccess';

function usePatientAccessGuard(patientId) {

  // Generate unique ID for this browser window.
  // useRef() keeps the same ID for the lifetime of the window.
  const windowId = useRef(crypto.randomUUID());

  // Indicates whether this patient should be blocked.
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {

    // Wait until a patient ID exists.
    if (!patientId) return;

    // Read current access information from browser localStorage.
    // If nothing exists yet, return null.
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');

    // Ensure IDs are compared as strings.
    const currentPatientId = String(patientId);

    // If another patient's chart is already active deny access to this one.
    if (stored && stored.patientId !== currentPatientId) {
      setIsBlocked(true);
      return;
    }

    // Existing open windows for this patient.
    const windowIds = stored?.windowIds || [];

    // Save this window's ID into localStorage.
    // Set() prevents duplicate entries.
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        patientId: currentPatientId,
        windowIds: [...new Set([...windowIds, windowId.current])],
      })
    );

    // Runs whenever this window closes.
    const releaseWindow = () => {

      // Reload current storage.
      const current = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || 'null'
      );

      // Nothing to release.
      if (!current || current.patientId !== currentPatientId) return;

      // Remove this window from the active window list.
      const remainingWindows =
        current.windowIds.filter(id => id !== windowId.current);

      // If this was the final open window,clear the patient lock entirely.
      if (remainingWindows.length === 0) {
        localStorage.removeItem(STORAGE_KEY);
      }

      // Otherwise update the remaining open windows.
      else {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...current,
            windowIds: remainingWindows,
          })
        );
      }
    };

    // Register listener for browser window closing.
    window.addEventListener('beforeunload', releaseWindow);

    // Cleanup when component unmounts.
    return () => {
      window.removeEventListener('beforeunload', releaseWindow);
      releaseWindow();
    };

  }, [patientId]);

  // Return whether access should be blocked.
  return isBlocked;
}

export default usePatientAccessGuard;
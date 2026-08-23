import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import usePatientAccessGuard from './usePatientAccessGuard';

const STORAGE_KEY = 'activePatientAccess';

describe('usePatientAccessGuard', () => {

  // Clear browser storage and reset mocks before each test so
  // every test starts without an active patient chart.
  beforeEach(() => {
    localStorage.clear();

    let idCounter = 0;

    vi.spyOn(globalThis.crypto, 'randomUUID')
      .mockImplementation(() => `test-window-${++idCounter}`);
  });


  // Unmount any rendered hooks, clear localStorage,
  // and restore the original browser functions after each test.
  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });


  // Verify that the first patient opened is allowed and
  // establishes the active patient context in localStorage.
  test('allows the first patient and establishes the active patient context', async () => {
    const { result } = renderHook(() =>
      usePatientAccessGuard(1)
    );

    await waitFor(() => {
      expect(result.current).toBe(false);
    });

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    expect(stored.patientId).toBe('1');
    expect(stored.windowIds).toHaveLength(1);
  });


  // Verify that another browser window for the same patient
  // is allowed and is added to the existing patient context.
  test('allows multiple windows for the same patient', async () => {
    const firstWindow = renderHook(() =>
      usePatientAccessGuard(1)
    );

    const secondWindow = renderHook(() =>
      usePatientAccessGuard(1)
    );

    await waitFor(() => {
      expect(firstWindow.result.current).toBe(false);
      expect(secondWindow.result.current).toBe(false);
    });

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    expect(stored.patientId).toBe('1');
    expect(stored.windowIds).toHaveLength(2);
  });


  // Verify that attempting to open a different patient while
  // another patient's chart is active is blocked.
  test('blocks a different patient while another patient is active', async () => {
    const firstWindow = renderHook(() =>
      usePatientAccessGuard(1)
    );

    await waitFor(() => {
      expect(firstWindow.result.current).toBe(false);
    });

    const differentPatientWindow = renderHook(() =>
      usePatientAccessGuard(2)
    );

    await waitFor(() => {
      expect(
        differentPatientWindow.result.current
      ).toBe(true);
    });

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    // The blocked patient must not replace the existing lock.
    expect(stored.patientId).toBe('1');
  });


  // Verify that closing one of several windows for the same
  // patient does not release the patient lock prematurely.
  test('keeps the patient active while another same-patient window remains open', async () => {
    const firstWindow = renderHook(() =>
      usePatientAccessGuard(1)
    );

    const secondWindow = renderHook(() =>
      usePatientAccessGuard(1)
    );

    await waitFor(() => {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      );

      expect(stored.windowIds).toHaveLength(2);
    });

    firstWindow.unmount();

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    expect(stored.patientId).toBe('1');
    expect(stored.windowIds).toHaveLength(1);

    secondWindow.unmount();
  });


  // Verify that closing the final window removes the active
  // patient context completely.
  test('releases the patient lock when the final window closes', async () => {
    const patientWindow = renderHook(() =>
      usePatientAccessGuard(1)
    );

    await waitFor(() => {
      expect(
        localStorage.getItem(STORAGE_KEY)
      ).not.toBeNull();
    });

    patientWindow.unmount();

    expect(
      localStorage.getItem(STORAGE_KEY)
    ).toBeNull();
  });


  // Verify that after the previous patient's final window closes,
  // a different patient can establish a new active context.
  test('allows a different patient after the previous patient is released', async () => {
    const firstPatientWindow = renderHook(() =>
      usePatientAccessGuard(1)
    );

    await waitFor(() => {
      expect(firstPatientWindow.result.current).toBe(false);
    });

    firstPatientWindow.unmount();

    expect(
      localStorage.getItem(STORAGE_KEY)
    ).toBeNull();

    const secondPatientWindow = renderHook(() =>
      usePatientAccessGuard(2)
    );

    await waitFor(() => {
      expect(secondPatientWindow.result.current).toBe(false);
    });

    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

    expect(stored.patientId).toBe('2');
    expect(stored.windowIds).toHaveLength(1);
  });

});
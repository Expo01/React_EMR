import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  openReferenceWindow,
  openWorkingWindow,
} from './openEmrWindow';

describe('openEmrWindow utilities', () => {

  // Reset mocked browser behavior before each test so every
  // test begins with a predictable screen size and window.open state.
  beforeEach(() => {
    vi.restoreAllMocks();

    Object.defineProperty(window.screen, 'availLeft', {
      configurable: true,
      value: 0,
    });

    Object.defineProperty(window.screen, 'availTop', {
      configurable: true,
      value: 0,
    });

    Object.defineProperty(window.screen, 'availWidth', {
      configurable: true,
      value: 1200,
    });

    Object.defineProperty(window.screen, 'availHeight', {
      configurable: true,
      value: 800,
    });
  });


  // Verify that reference/navigation windows open on the
  // left side of the available screen.
  test('opens reference windows on the left side of the screen', () => {
    const focus = vi.fn();

    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue({
        focus,
      });

    openReferenceWindow('/note/1');

    expect(openSpy).toHaveBeenCalledTimes(1);

    const [
      url,
      target,
      features,
    ] = openSpy.mock.calls[0];

    expect(url).toBe('/note/1');
    expect(target).toBe('_blank');

    expect(features).toContain('left=8');
    expect(features).toContain('top=8');

    expect(focus).toHaveBeenCalledTimes(1);
  });


  // Verify that writing/editing windows open on the
  // right side of the available screen.
  test('opens working windows on the right side of the screen', () => {
    const focus = vi.fn();

    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue({
        focus,
      });

    openWorkingWindow('/patient/1/note/new');

    expect(openSpy).toHaveBeenCalledTimes(1);

    const [
      url,
      target,
      features,
    ] = openSpy.mock.calls[0];

    expect(url).toBe('/patient/1/note/new');
    expect(target).toBe('_blank');

    // With a 1200px available screen and the current margin
    // calculation, the right-side window begins after the
    // left-side window plus the separating margins.
    expect(features).toContain('left=604');
    expect(features).toContain('top=8');

    expect(focus).toHaveBeenCalledTimes(1);
  });


  // Verify that window dimensions are calculated from the
  // available screen size instead of using fixed popup dimensions.
  test('sizes windows from the available screen dimensions', () => {
    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue({
        focus: vi.fn(),
      });

    openReferenceWindow('/patient/1');

    const features = openSpy.mock.calls[0][2];

    // Current helper calculation:
    // usableWidth = 1200 - (8 * 3) = 1176
    // windowWidth = floor(1176 / 2) = 588
    // windowHeight = 800 - (8 * 2) = 784
    expect(features).toContain('width=588');
    expect(features).toContain('height=784');
  });


  // Verify that both left and right window types use the
  // same calculated width and height so the screen is divided
  // into a predictable two-pane workflow.
  test('uses matching dimensions for reference and working windows', () => {
    const openSpy = vi
      .spyOn(window, 'open')
      .mockReturnValue({
        focus: vi.fn(),
      });

    openReferenceWindow('/note/1');
    openWorkingWindow('/patient/1/note/new');

    const referenceFeatures =
      openSpy.mock.calls[0][2];

    const workingFeatures =
      openSpy.mock.calls[1][2];

    expect(referenceFeatures).toContain(
      'width=588'
    );

    expect(workingFeatures).toContain(
      'width=588'
    );

    expect(referenceFeatures).toContain(
      'height=784'
    );

    expect(workingFeatures).toContain(
      'height=784'
    );
  });


  // Verify that popup blocking is handled safely.
  // window.open returns null when the browser blocks the popup,
  // and the helper should return null without attempting focus().
  test('returns null when the browser blocks the popup', () => {
    vi.spyOn(window, 'open')
      .mockReturnValue(null);

    const result = openWorkingWindow(
      '/patient/1/note/new'
    );

    expect(result).toBeNull();
  });

});
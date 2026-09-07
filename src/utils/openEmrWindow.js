// Shared helper for opening EMR windows in predictable screen positions.
//
// Workflow rule:
// - Viewing / navigation windows open on the left.
// - Writing / editing windows open on the right.

function getWindowDimensions(side) {
  const screenLeft = window.screen.availLeft || 0;
  const screenTop = window.screen.availTop || 0;
  const screenWidth = window.screen.availWidth;
  const screenHeight = window.screen.availHeight;

  // Small gap prevents windows from sitting directly against
  // the edge of the usable screen area.
  const margin = 8;

  const usableWidth = screenWidth - margin * 3;
  const windowWidth = Math.floor(usableWidth / 2);
  const windowHeight = screenHeight - margin * 2;

  const left =
    side === 'right'
      ? screenLeft + windowWidth + margin * 2
      : screenLeft + margin;

  const top = screenTop + margin;

  return {
    width: windowWidth,
    height: windowHeight,
    left,
    top,
  };
}


// Open a viewing or navigation window on the left side
// of the available screen.
export function openReferenceWindow(url) {
  const dimensions = getWindowDimensions('left');

  const win = window.open(
    url,
    '_blank',
    `
      width=${dimensions.width},
      height=${dimensions.height},
      left=${dimensions.left},
      top=${dimensions.top}
    `
  );

  if (win) {
    win.focus();
  }

  return win;
}


// Open a writing or editing window on the right side
// of the available screen.
export function openWorkingWindow(url) {
  const dimensions = getWindowDimensions('right');

  const win = window.open(
    url,
    '_blank',
    `
      width=${dimensions.width},
      height=${dimensions.height},
      left=${dimensions.left},
      top=${dimensions.top}
    `
  );

  if (win) {
    win.focus();
  }

  return win;
}
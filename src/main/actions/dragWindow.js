export const dragWindow = (mainWindow) => {
  mainWindow.webContents.executeJavaScript(`
  document.addEventListener('mousedown', (e) => {
    if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      window.isDragging = true;
      offset = { x: e.screenX - window.screenX, y: e.screenY - window.screenY };
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (window.isDragging) {
      const { screenX, screenY } = e;
      window.moveTo(screenX - offset.x, screenY - offset.y);
    }
  });

  document.addEventListener('mouseup', () => {
    window.isDragging = false;
  });
`)
}

let time = 1;
function onBodyLoad() {
  setTimeout(() => {
    const appConfig = window.PDFViewerApplication.appConfig;
    if (!appConfig) {
      time++;
      if (time > 10) {
        return
      }
      setTimeout(onBodyLoad, 100);
      return
    }
    try {
      appConfig.toolbar.openFile.setAttribute('hidden', 'true');
      appConfig.toolbar.print.setAttribute('hidden', 'true');
      appConfig.toolbar.scaleSelect.setAttribute('hidden', 'true');
      appConfig.secondaryToolbar.setAttribute('hidden', 'true');
      appConfig.toolbar.editorFreeTextButton.setAttribute('hidden', 'true');
      appConfig.toolbar.editorInButton.setAttribute('hidden', 'true');
      appConfig.toolbar.editorStampButton.setAttribute('hidden', 'true');
      appConfig.toolbar.zoomIn.setAttribute('hidden', 'true');
      appConfig.toolbar.zoomOut.setAttribute('hidden', 'true');
    } catch (error) {
      console.error(error)
    }
  }, 100)
}

window.onload = onBodyLoad();

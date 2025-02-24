import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;

export const getWebContainer = async () => {
  if (typeof WebContainer === 'undefined') {
    console.warn("WebContainer API is not available in this environment.");
    return null;
  }
  if (webContainerInstance === null) {
    webContainerInstance = await WebContainer.boot();
  }
  return webContainerInstance;
};

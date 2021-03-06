let windows = {app: 0, devtools: 0};

const MENU_APP = 'MENU_APP';
const MENU_DEVTOOLS = 'MENU_DEVTOOLS';

function createMenu(store) {
  addToMenu(MENU_APP, 'Redux Counter App', ['all']);
  addToMenu(MENU_DEVTOOLS, 'Background Redux DevTools', ['all']);

  chrome.contextMenus.onClicked.addListener((event) => {
    switch (event.menuItemId) {
      case MENU_APP: popWindow('open', 'window.html', 'app', {left: 0, width: 1080}); break;
      case MENU_DEVTOOLS: popWindow('open', 'devtools.html', 'devtools', {left: 1100, width: 320}, store); break;
    }
  });
}

function addToMenu(id, title, contexts) {
  chrome.contextMenus.create({
    id: id,
    title: title,
    contexts: contexts
  });
}

function popWindow(action, url, type, customOptions, store) {
  closeIfExist(type);
  let options = {
    type: 'popup',
    left: 100, top: 100,
    width: 800, height: 700,
    ...customOptions
  };
  if (action === 'open') {
    options.url = url;
    chrome.windows.create(options, (win) => {
      windows[type] = win.id;
    });
  }
}

function closeIfExist(type) {
  if (windows[type] > 0) {
    chrome.windows.remove(windows[type]);
    windows[type] = chrome.windows.WINDOW_ID_NONE;
  }
}

export default createMenu;

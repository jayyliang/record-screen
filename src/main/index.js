import { app, shell, BrowserWindow, ipcMain } from 'electron'
import path, { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import icon from '../../resources/icon.png?asset'
import { dragWindow } from './actions/dragWindow'
import { initTrayMenu } from './actions/trayMenu'
import { recordInit } from './actions/record'
export const RESOURCES_PATH = path.join(__dirname, '../../resources')
export const FILE_PATH = path.join(__dirname, '../../resources/file')
export const PRELOAD_URL = join(__dirname, '../preload/index.js')
export const loadHtml = (currentWindow) => {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    currentWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    currentWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}
const initFileFolder = () => {
  if (!fs.existsSync(FILE_PATH)) {
    fs.mkdirSync(FILE_PATH)
  }
}

initFileFolder()

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: PRELOAD_URL,
      sandbox: false
    }
  })
  // if (is.dev) {
  //   mainWindow.webContents.openDevTools()
  // }
  recordInit(ipcMain)

  initTrayMenu({ mainWindow })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
  mainWindow.webContents.on('did-finish-load', () => {
    dragWindow(mainWindow)
  })
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  loadHtml(mainWindow)
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

import { Menu, Tray, nativeImage } from 'electron'
import icon from '../../../resources/icon.png?asset'
import { openRecordArea, startRecording, stopRecording, closeArea } from './record'

export const initTrayMenu = (params) => {
  let trayIcon = nativeImage.createFromPath(icon)
  // 设置图标大小，这里是32x32像素
  trayIcon = trayIcon.resize({ width: 16, height: 16 })

  const tray = new Tray(trayIcon)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '选取区域',
      click: () => openRecordArea(params)
    },
    {
      label: '开始录制',
      click: () => startRecording(params)
    },
    { label: '停止录制', click: () => stopRecording(params) },

    { type: 'separator' },
    { label: '退出', type: 'normal', role: 'quit' }
  ])

  tray.setToolTip('JTransfer')
  tray.setContextMenu(contextMenu)
}

let ffmpegProcess // 保存子进程引用
let config = {}
import { spawn } from 'child_process'
import ffmpegPath from 'ffmpeg-static'
import { RECORD_EVNET } from '../../constant'
import { BrowserWindow, shell, screen } from 'electron'
import { FILE_PATH, PRELOAD_URL } from '..'
import fs from 'fs'
import moment from 'moment'
import { dragWindow } from './dragWindow'
import { isEmpty } from 'lodash'
export const recordInit = (ipcMain) => {
  ipcMain.on(RECORD_EVNET.SET_CONFIG, (e, data) => {
    config = data
  })
}
let fileName
let areaWindow
let cropRect = {}
const afterRecord = () => {
  if (fileName && fs.existsSync(fileName)) {
    const { ext, definition } = config
    let command
    let rate = Number(definition)
    const mainScreen = screen.getPrimaryDisplay()
    const { scaleFactor } = mainScreen
    const { width: physicalWidth, height: physicalHeight } = mainScreen.size
    let scale = [physicalWidth * scaleFactor * rate, physicalHeight * scaleFactor * rate]
    if (!isEmpty(cropRect)) {
      const cropXRate = cropRect.width / (physicalWidth * scaleFactor)
      const cropYRate = cropRect.height / (physicalHeight * scaleFactor)
      scale = [scale[0] * cropXRate, scale[1] * cropYRate]
    }

    scale = `${Math.round(scale[0])}:${Math.round(scale[1])}`

    const output = `${FILE_PATH}/record-${moment().format('YYYYMMDDHHmmss')}.${ext}`
    if (ext === 'mp4') {
      command = `${ffmpegPath} -i ${fileName} -vf "scale=${scale}" -c:a copy ${output}`
    } else if (ext === 'webm') {
      command = `${ffmpegPath} -i ${fileName} -vf "scale=${scale}" -c:v libvpx -c:a libvorbis ${output}`
    } else if (ext === 'gif') {
      command = `${ffmpegPath} -i ${fileName} -vf "fps=15,scale=${scale}:flags=lanczos" -c:v gif ${output}`
    }
    let progress = spawn(command, { shell: true })
    progress.stderr.on('data', (data) => {
      console.log(`FFmpeg Convert Log: ${data}`)
    })
    progress.on('exit', (code, signal) => {
      console.log(`Recording process exited with code ${code} and signal ${signal}`)
      fs.unlinkSync(fileName)
      if (code == 0) {
        shell.openPath(FILE_PATH)
        progress = null
        ffmpegProcess = null
      }
    })
  }
}

export const startRecording = async () => {
  cropRect = {}
  if (areaWindow) {
    const size = areaWindow.getSize()
    const position = areaWindow.getPosition()
    const [width, height] = size
    const [left, top] = position
    const mainScreen = screen.getPrimaryDisplay()
    const { scaleFactor } = mainScreen
    cropRect = {
      width: width * scaleFactor,
      height: height * scaleFactor,
      left: left * scaleFactor,
      top: top * scaleFactor
    }
  }
  closeArea()
  const { frameRate } = config
  fileName = `${FILE_PATH}/${moment().format('YYYYMMDDHHmmss')}.mp4`
  const cropString = !isEmpty(cropRect)
    ? `-vf "crop=${cropRect.width}:${cropRect.height}:${cropRect.left}:${cropRect.top}"`
    : ''
  /**统一先录制为mp4，避免受硬件影响 */
  const ffmpegCommand = `${ffmpegPath} -f avfoundation -r ${frameRate} -i "1" ${cropString} -c:v libx264 -preset ultrafast ${fileName}`
  ffmpegProcess = spawn(ffmpegCommand, { shell: true })
  ffmpegProcess.stderr.on('data', (data) => {
    console.log(`FFmpeg Record Log: ${data}`)
  })
  ffmpegProcess.on('exit', (code, signal) => {
    console.log(`Recording process exited with code ${code} and signal ${signal}`)
    afterRecord()
  })
}

export const closeArea = () => {
  if (areaWindow) {
    areaWindow.close()
    areaWindow = null
  }
}

export const openRecordArea = () => {
  if (areaWindow) {
    closeArea()
    return
  }
  const newWindow = new BrowserWindow({
    width: 600,
    height: 600,
    frame: false,
    transparent: true,
    webPreferences: {
      preload: PRELOAD_URL,
      sandbox: false
    }
  })
  areaWindow = newWindow
  newWindow.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent('<html><body></body></html>')}`
  )
  newWindow.on('ready-to-show', () => {
    newWindow.show()
  })
  newWindow.on('close', () => {
    areaWindow = null
  })
  newWindow.webContents.on('did-finish-load', () => {
    dragWindow(newWindow)
    newWindow.webContents.executeJavaScript(`
    const customStyles = \`
      html, body {
        padding: 0;
        margin: 0;
        background: transparent;
        border-radius:4px;
      }
      body {
        border: 2px dashed #ccc;
      }
      #root {
        display: none
      }
    \`;

    const styleTag = document.createElement('style');
    styleTag.textContent = customStyles;
    document.head.appendChild(styleTag);
  `)
  })
}

export const stopRecording = () => {
  if (ffmpegProcess) {
    ffmpegProcess.kill('SIGINT') // 发送中断信号停止录制
  }
}

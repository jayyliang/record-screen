import Versions from './components/Versions'
import icons from './assets/icons.svg'
import { useEffect, useMemo, useState } from 'react'
import { RECORD_EVNET } from '../../constant'
import { Button, Select } from 'antd'
import { getLocal, setLocal } from '../../utils'
const DEFINITION = 'DEFINITION'
const FRAME_RATE = 'FRAME_RATE'
const EXT = 'EXT'
const DEFINITION_LIST = [
  { label: '100%', value: '1' },
  { label: '75%', value: '0.75' },
  { label: '50%', value: '0.5' },
  { label: '25%', value: '0.25' }
]

const FRAME_RATE_LIST = [
  { label: '高', value: '60' },
  { label: '中', value: '30' },
  { label: '低', value: '15' }
]

const EXT_LIST = [
  { label: 'webm', value: 'webm' },
  { label: 'mp4', value: 'mp4' },
  { label: 'gif', value: 'gif' }
]

function App() {
  const [definition, setDefinition] = useState(getLocal(DEFINITION, '1'))
  const [frameRate, setFrameRate] = useState(getLocal(FRAME_RATE, '15'))
  const [ext, setExt] = useState(getLocal(EXT, 'webm'))
  useEffect(() => {
    setLocal(DEFINITION, definition)
  }, [definition])
  useEffect(() => {
    setLocal(FRAME_RATE, frameRate)
  }, [frameRate])
  useEffect(() => {
    setLocal(EXT, ext)
  }, [ext])
  useEffect(() => {
    const options = {
      definition,
      frameRate,
      ext
    }
    window.electron.ipcRenderer.send(RECORD_EVNET.SET_CONFIG, options)
  }, [definition, frameRate, ext])

  return (
    <div style={{ margin: 30 }}>
      <div>
        清晰度：
        <Select value={definition} options={DEFINITION_LIST} onChange={(e) => setDefinition(e)} />
      </div>
      <div style={{ marginTop: 16 }}>
        帧率：
        <Select
          style={{ marginLeft: 16, width: 100 }}
          value={frameRate}
          options={FRAME_RATE_LIST}
          onChange={(e) => setFrameRate(e)}
        />
      </div>
      <div style={{ marginTop: 16 }}>
        另存为：
        <Select
          style={{ marginLeft: 16, width: 100 }}
          value={ext}
          options={EXT_LIST}
          onChange={(e) => setExt(e)}
        />
      </div>
    </div>
  )
}

export default App

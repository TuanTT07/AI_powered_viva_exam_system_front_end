import { useEffect, useRef, useState } from 'react'

type MicStatus = 'untested' | 'testing' | 'passed' | 'error'
type SpeakerStatus = 'untested' | 'playing' | 'confirm' | 'passed' | 'error'
export function useDeviceCheck() {
  const [mic, setMic] = useState<MicStatus>('untested')
  const [speaker, setSpeaker] = useState<SpeakerStatus>('untested')
  const [volume, setVolume] = useState(0)
  const [error, setError] = useState('')
  const resources = useRef<{ stream?: MediaStream; micAudio?: AudioContext; speakerAudio?: AudioContext; frame?: number }>({})
  const alive = useRef(true)
  const request = useRef(0)
  const releaseMic = () => {
    const r = resources.current
    if (r.frame !== undefined) cancelAnimationFrame(r.frame)
    r.stream?.getTracks().forEach(track => { track.onended = null; track.stop() })
    if (r.micAudio && r.micAudio.state !== 'closed') void r.micAudio.close().catch(() => {})
    r.stream = undefined; r.micAudio = undefined; r.frame = undefined
  }
  useEffect(() => {
    alive.current = true
    const owned = resources.current
    return () => { alive.current = false; releaseMic(); const audio = owned.speakerAudio; if (audio && audio.state !== 'closed') void audio.close().catch(() => {}) }
  }, [])
  const startMic = async () => {
    releaseMic()
    const id = ++request.current
    setMic('testing'); setVolume(0); setError('')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Trình duyệt không hỗ trợ micro. Hãy mở bằng HTTPS hoặc localhost.')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      if (!alive.current || id !== request.current) { stream.getTracks().forEach(t => t.stop()); return }
      resources.current.stream = stream
      const audio = new AudioContext()
      resources.current.micAudio = audio
      await audio.resume()
      if (!alive.current || id !== request.current) return
      const analyser = audio.createAnalyser(); analyser.fftSize = 256
      audio.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      for (const track of stream.getAudioTracks()) track.onended = () => { if (alive.current) { setMic('error'); setError('Micro đã ngắt kết nối. Kết nối lại thiết bị và kiểm tra lại.'); releaseMic() } }
      const tick = () => {
        if (!alive.current || id !== request.current) return
        analyser.getByteFrequencyData(data)
        const level = Math.min(100, data.reduce((sum, n) => sum + n, 0) / data.length)
        setVolume(level)
        if (level > 15) setMic('passed')
        resources.current.frame = requestAnimationFrame(tick)
      }
      tick()
    } catch {
      if (!alive.current || id !== request.current) return
      releaseMic(); setMic('error'); setError('Không truy cập được micro. Kiểm tra quyền trình duyệt và kết nối thiết bị rồi thử lại.')
    }
  }
  const testSpeaker = async () => {
    setSpeaker('playing')
    try {
      const previous = resources.current.speakerAudio
      if (previous && previous.state !== 'closed') await previous.close()
      if (!alive.current) return
      const audio = new AudioContext(); resources.current.speakerAudio = audio
      await audio.resume()
      if (!alive.current) return
      const oscillator = audio.createOscillator(), gain = audio.createGain()
      oscillator.connect(gain); gain.connect(audio.destination)
      oscillator.frequency.value = 440; gain.gain.value = 0.08
      oscillator.onended = () => { if (alive.current) setSpeaker('confirm'); void audio.close().catch(() => {}) }
      oscillator.start(); oscillator.stop(audio.currentTime + 0.5)
    } catch { if (alive.current) setSpeaker('error') }
  }
  return { mic, speaker, volume, error, startMic, testSpeaker, confirmSpeaker: () => setSpeaker('passed'), stop: releaseMic }
}

import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { Button, Alert, Badge } from '../../../components/ui/primitives'

export function EquipmentCheckPage() {
  const { examId } = useParams()
  const navigate = useNavigate()
  
  const [micStatus, setMicStatus] = useState<'untested' | 'testing' | 'passed' | 'error'>('untested')
  const [speakerStatus, setSpeakerStatus] = useState<'untested' | 'playing' | 'passed'>('untested')
  const [volume, setVolume] = useState(0)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number>()

  // Dọn dẹp stream khi unmount
  useEffect(() => {
    return () => {
      stopMic()
    }
  }, [])

  const stopMic = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
    if (audioContextRef.current) audioContextRef.current.close()
    streamRef.current = null
    audioContextRef.current = null
    analyserRef.current = null
  }

  const startMicTest = async () => {
    try {
      setMicStatus('testing')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioCtx
      
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyserRef.current = analyser
      
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      
      const checkVolume = () => {
        if (!analyserRef.current) return
        analyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }
        const avg = sum / dataArray.length
        setVolume(avg)
        
        // Nếu bắt được âm thanh tương đối (avg > 15), tự động pass sau 2 giây
        if (avg > 15) {
          setMicStatus('passed')
        }
        
        animationFrameRef.current = requestAnimationFrame(checkVolume)
      }
      checkVolume()
      
    } catch (err) {
      console.error(err)
      setMicStatus('error')
    }
  }

  const testSpeaker = () => {
    setSpeakerStatus('playing')
    // Giả lập phát một đoạn âm thanh ngắn (beeps) hoặc có thể dùng file mp3 thực tế
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime) // Tần số 440 Hz (Nốt La)
    
    // Tạo tiếng tít tít nhỏ
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5)
    
    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.5)
    
    setTimeout(() => {
      setSpeakerStatus('passed')
    }, 600)
  }

  const allPassed = micStatus === 'passed' && speakerStatus === 'passed'

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 40 }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontFamily: 'var(--display)', color: 'var(--navy-dark)' }}>Kiểm tra thiết bị</h1>
        <p style={{ color: 'var(--secondary)' }}>Bạn cần đảm bảo Micro và Loa hoạt động tốt trước khi vào phòng thi vấn đáp.</p>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        {/* Kiểm tra Micro */}
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              🎤 Kiểm tra Microphone
              {micStatus === 'passed' && <Badge tone="success">Đã xác nhận</Badge>}
              {micStatus === 'error' && <Badge tone="danger">Lỗi cấp quyền</Badge>}
            </h2>
            <Button 
              variant={micStatus === 'untested' ? 'primary' : 'outline'} 
              onClick={startMicTest}
              disabled={micStatus === 'testing' || micStatus === 'passed'}
            >
              {micStatus === 'testing' ? 'Đang kiểm tra...' : micStatus === 'passed' ? 'Thử lại' : 'Bắt đầu kiểm tra'}
            </Button>
          </div>
          
          {micStatus === 'error' && (
            <Alert tone="danger">Không thể truy cập Microphone. Vui lòng kiểm tra quyền trên trình duyệt của bạn.</Alert>
          )}

          {micStatus !== 'untested' && micStatus !== 'error' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'var(--bg)', padding: 16, borderRadius: 8 }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--secondary)' }}>Hãy thử nói "A lô 1 2 3"</span>
              <div style={{ flex: 1, height: 12, background: 'var(--border)', borderRadius: 6, overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: micStatus === 'passed' ? 'var(--success)' : 'var(--primary)', 
                  width: `${Math.min(100, (volume / 100) * 100)}%`,
                  transition: 'width 0.1s ease-out, background 0.3s'
                }} />
              </div>
            </div>
          )}
        </section>

        {/* Kiểm tra Loa */}
        <section style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              🔊 Kiểm tra Loa / Tai nghe
              {speakerStatus === 'passed' && <Badge tone="success">Đã xác nhận</Badge>}
            </h2>
            <Button 
              variant={speakerStatus === 'untested' ? 'primary' : 'outline'} 
              onClick={testSpeaker}
              disabled={speakerStatus === 'playing'}
            >
              {speakerStatus === 'playing' ? 'Đang phát...' : 'Phát âm thanh'}
            </Button>
          </div>
          <p style={{ color: 'var(--secondary)', margin: 0, fontSize: '0.9rem' }}>
            Nhấn nút để nghe thử một âm thanh ngắn (tiếng bíp). Nếu bạn nghe rõ thì hệ thống loa của bạn hoạt động bình thường.
          </p>
        </section>
      </div>

      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <Link to={`/student/exams/${examId}`}>
          <Button variant="outline">Quay lại</Button>
        </Link>
        <Button 
          variant="primary" 
          disabled={!allPassed} 
          onClick={() => {
            stopMic()
            navigate(`/student/exams/${examId}/session`)
          }}
          style={{ padding: '0 32px' }}
        >
          {allPassed ? '🚀 Sẵn sàng - Vào phòng thi' : 'Hoàn tất kiểm tra để tiếp tục'}
        </Button>
      </div>
    </div>
  )
}

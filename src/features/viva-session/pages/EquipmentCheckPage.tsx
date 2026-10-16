import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Mic,
  Volume2,
  Wifi,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useSession } from '../../../app/providers/use-session';

export function EquipmentCheckPage() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();

  const [micStatus, setMicStatus] = useState<'untested' | 'testing' | 'passed' | 'error'>('untested');
  const [speakerStatus, setSpeakerStatus] = useState<'untested' | 'playing' | 'confirming' | 'passed' | 'failed'>('untested');
  const [networkPing, setNetworkPing] = useState<number | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'testing' | 'passed'>('testing');
  const [volume, setVolume] = useState(0);
  const [rulesAgreed, setRulesAgreed] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const stopMic = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    streamRef.current = null;
    audioContextRef.current = null;
    analyserRef.current = null;
  };

  useEffect(() => {
    // Đo độ trễ mạng giả lập khi vào trang
    const timer = setTimeout(() => {
      setNetworkPing(38);
      setNetworkStatus('passed');
    }, 600);

    return () => {
      clearTimeout(timer);
      stopMic();
    };
  }, []);

  const startMicTest = async () => {
    try {
      setMicStatus('testing');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolume(avg);

        // Nếu bắt được âm thanh (avg > 14) kéo dài, tự động pass
        if (avg > 14) {
          setTimeout(() => {
            setMicStatus('passed');
          }, 800);
        }

        animationFrameRef.current = requestAnimationFrame(checkVolume);
      };
      checkVolume();
    } catch {
      setMicStatus('error');
    }
  };

  const testSpeaker = () => {
    setSpeakerStatus('playing');
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.08, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Phát 2 tiếng bíp chuẩn
      const now = audioCtx.currentTime;
      playTone(523.25, now + 0.1, 0.25); // Nốt C5
      playTone(659.25, now + 0.45, 0.35); // Nốt E5

      setTimeout(() => {
        setSpeakerStatus('confirming');
      }, 900);
    } catch {
      setSpeakerStatus('failed');
    }
  };

  const allPassed = micStatus === 'passed' && speakerStatus === 'passed' && rulesAgreed;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 flex flex-col gap-8">
      {/* 1. Header Section */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--soft)]/60 text-[var(--navy)] border border-indigo-100 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Bước chuẩn bị tiền phòng thi (Preflight Checklist)
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-[var(--navy-dark)] mb-2">
              Kiểm tra Thiết bị & Điều kiện Phòng thi
            </h1>
            <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
              Vui lòng kiểm tra Microphone, Loa/Tai nghe và kết nối internet để đảm bảo hệ thống nhận diện giọng nói và truyền phát câu hỏi của Giám khảo AI hoạt động mượt mà nhất.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 bg-[var(--muted)]/40 px-4 py-3 rounded-xl border border-[var(--border)]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Mã ca thi</span>
            <span className="font-mono text-sm font-bold text-[var(--navy-dark)]">EXAM-{examId || 'TEST'}</span>
            <span className="text-xs text-stone-500">Thí sinh: <strong>{session.user?.displayName || 'Sinh viên'}</strong></span>
          </div>
        </div>
      </section>

      {/* 2. Device Check Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Microphone */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--navy-dark)]">1. Thu âm (Microphone)</h2>
                  <p className="text-xs text-stone-500">Ghi nhận câu trả lời của thí sinh</p>
                </div>
              </div>

              {micStatus === 'passed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đạt yêu cầu
                </span>
              )}
              {micStatus === 'error' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" /> Lỗi truy cập
                </span>
              )}
            </div>

            {micStatus === 'error' && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed mb-4">
                Không thể truy cập Microphone. Vui lòng cho phép quyền truy cập micro trong cài đặt trình duyệt của bạn và thử lại.
              </div>
            )}

            {micStatus !== 'untested' && micStatus !== 'error' && (
              <div className="space-y-3 bg-[var(--muted)]/40 p-4 rounded-xl border border-[var(--border)] mb-4">
                <div className="flex items-center justify-between text-xs text-stone-600">
                  <span>Mức âm lượng đầu vào:</span>
                  <span className="font-mono font-semibold">{Math.round(volume)}%</span>
                </div>
                <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 rounded-full ${
                      micStatus === 'passed' ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${Math.min(100, (volume / 80) * 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-stone-500 italic">
                  💡 Hãy thử nói: &quot;Tôi tên là {session.user?.displayName || 'Sinh viên'}, sẵn sàng tham gia phỏng vấn.&quot;
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="text-xs text-stone-500">
              {micStatus === 'passed' ? 'Âm thanh thu nhận rõ ràng' : 'Cần cấp quyền micro'}
            </span>
            <button
              type="button"
              onClick={startMicTest}
              disabled={micStatus === 'testing'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {micStatus === 'testing' ? (
                <>Đang lắng nghe...</>
              ) : micStatus === 'passed' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" /> Thử lại micro
                </>
              ) : (
                <>Bắt đầu thử micro</>
              )}
            </button>
          </div>
        </div>

        {/* Card 2: Speaker / Headphone */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[var(--navy-dark)]">2. Loa / Tai nghe</h2>
                  <p className="text-xs text-stone-500">Nghe câu hỏi từ Giám khảo AI</p>
                </div>
              </div>

              {speakerStatus === 'passed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Đạt yêu cầu
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed mb-4">
              Nhấn nút phát âm thanh mẫu để nghe thử 2 tiếng bíp kiểm tra. Hãy điều chỉnh âm lượng vừa đủ nghe rõ câu hỏi.
            </p>

            {speakerStatus === 'confirming' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-3 mb-4">
                <p className="font-semibold text-amber-900">
                  Bạn có nghe thấy rõ 2 tiếng bíp vừa phát ra không?
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSpeakerStatus('passed')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    Có, nghe rất rõ
                  </button>
                  <button
                    type="button"
                    onClick={testSpeaker}
                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg font-medium transition-colors"
                  >
                    Phát lại
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="text-xs text-stone-500">
              {speakerStatus === 'passed' ? 'Đã xác nhận nghe rõ' : 'Chưa kiểm tra loa'}
            </span>
            <button
              type="button"
              onClick={testSpeaker}
              disabled={speakerStatus === 'playing'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white text-xs font-semibold rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>{speakerStatus === 'playing' ? 'Đang phát âm...' : 'Phát âm thanh thử'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Network Latency & Server Connection Status */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <Wifi className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--navy-dark)]">3. Kết nối mạng & Máy chủ Viva AI</h3>
            <p className="text-xs text-stone-500">
              Kênh truyền âm thanh hai chiều (WebRTC/WebSocket Audio Channel)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {networkStatus === 'testing' ? 'Đang kiểm tra độ trễ...' : `Tốc độ ổn định (Độ trễ: ${networkPing}ms)`}
          </span>
        </div>
      </section>

      {/* 4. Examination Rules & Integrity Commitment */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[var(--soft)]/60 text-[var(--navy)] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-base font-serif font-bold text-[var(--navy-dark)]">
            Quy chế và Lưu ý phòng thi Vấn đáp trực tiếp
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-600 mb-6 leading-relaxed">
          <div className="p-3.5 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)]">
            <strong className="text-stone-800 block mb-1">1. Không gian yên tĩnh</strong>
            Thí sinh cần ngồi tại nơi yên tĩnh, hạn chế tối đa tiếng ồn xung quanh để micro ghi âm chuẩn xác nhất.
          </div>
          <div className="p-3.5 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)]">
            <strong className="text-stone-800 block mb-1">2. Trả lời súc tích, rõ ràng</strong>
            Nói to, rõ ràng theo đúng trọng tâm câu hỏi. Bạn có thể theo dõi biên bản transcript trực tiếp trên màn hình.
          </div>
          <div className="p-3.5 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)]">
            <strong className="text-stone-800 block mb-1">3. Câu hỏi mở rộng (Follow-up)</strong>
            Giám khảo AI có thể đặt thêm 1 - 2 câu hỏi phụ để làm rõ lập luận hoặc kiểm tra kiến thức mở rộng của bạn.
          </div>
          <div className="p-3.5 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)]">
            <strong className="text-stone-800 block mb-1">4. Ghi âm lưu trữ phục vụ phúc khảo</strong>
            Toàn bộ âm thanh được mã hóa lưu trữ phục vụ đối soát. Điểm số cuối cùng do Giảng viên duyệt chính thức.
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer select-none p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 transition-colors hover:bg-indigo-50">
          <input
            type="checkbox"
            checked={rulesAgreed}
            onChange={(e) => setRulesAgreed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-[var(--navy)] focus:ring-[var(--navy)] cursor-pointer"
          />
          <span className="text-xs text-stone-700 font-medium leading-relaxed">
            Tôi đã đọc kỹ quy chế thi, cam kết thiết bị hoạt động bình thường và trung thực trong suốt quá trình vấn đáp trực tiếp với Giám khảo AI.
          </span>
        </label>
      </section>

      {/* 5. Bottom Navigation Action Bar */}
      <div className="flex items-center justify-between border-t border-[var(--border)] pt-6 pb-12">
        <Link
          to={`/student/exams/${examId}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-stone-600 hover:text-stone-900 border border-[var(--border)] hover:bg-stone-50 rounded-xl text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại thông tin ca thi
        </Link>

        <button
          type="button"
          disabled={!allPassed}
          onClick={() => {
            stopMic();
            navigate(`/student/exams/${examId}/session`);
          }}
          className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-medium text-sm transition-all shadow-xs ${
            allPassed
              ? 'bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white cursor-pointer active:scale-95 shadow-md'
              : 'bg-stone-200 text-stone-400 border border-stone-300 cursor-not-allowed'
          }`}
        >
          <span>{allPassed ? 'Sẵn sàng - Vào phòng thi ngay' : 'Hoàn tất kiểm tra để vào thi'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

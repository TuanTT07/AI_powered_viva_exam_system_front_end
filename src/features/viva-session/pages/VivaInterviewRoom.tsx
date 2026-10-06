import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../../../app/providers/use-session';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { TranscriptMessage } from '../components/TranscriptMessage';

type SessionPhase = 'AI_SPEAKING' | 'WAITING_FOR_ANSWER' | 'STUDENT_SPEAKING';

export function VivaInterviewRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  
  const [phase, setPhase] = useState<SessionPhase>('AI_SPEAKING');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  type TranscriptItem = {
    id: string;
    role: 'ai' | 'student';
    text: string;
    timestamp: string;
    isPartial?: boolean;
    isFollowUp?: boolean;
  };
  
  // Mock data for transcript
  const [transcript, setTranscript] = useState<TranscriptItem[]>([
    {
      id: '1',
      role: 'ai',
      text: 'Chào bạn. Câu hỏi đầu tiên dành cho bạn: Bạn hãy trình bày về mô hình MVC (Model-View-Controller) trong phát triển phần mềm và cho ví dụ thực tế.',
      timestamp: '09:00',
      isPartial: false,
      isFollowUp: false
    }
  ]);
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [followUpCount, setFollowUpCount] = useState(0);
  const maxFollowUps = 2;
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Mock progression
  useEffect(() => {
    if (phase === 'AI_SPEAKING') {
      const t = setTimeout(() => {
        setPhase('WAITING_FOR_ANSWER');
      }, 4000);
      return () => clearTimeout(t);
    }
    
    if (phase === 'STUDENT_SPEAKING') {
      // Mock typing effect for STT
      const fullText = 'Dạ, mô hình MVC là một kiến trúc phần mềm chia ứng dụng thành 3 thành phần chính: Model quản lý dữ liệu, View hiển thị giao diện, và Controller xử lý logic điều hướng...';
      let i = 0;
      setCurrentAnswer('');
      
      const sttInterval = setInterval(() => {
        if (i < fullText.length) {
          setCurrentAnswer(prev => prev + fullText.charAt(i));
          i++;
        } else {
          clearInterval(sttInterval);
        }
      }, 50);
      
      return () => clearInterval(sttInterval);
    }
  }, [phase]);

  const handleStartSpeaking = () => {
    setPhase('STUDENT_SPEAKING');
  };

  const handleStopSpeaking = () => {
    setPhase('WAITING_FOR_ANSWER');
    // Save student answer
    if (currentAnswer) {
      setTranscript(prev => [...prev, {
        id: Date.now().toString(),
        role: 'student',
        text: currentAnswer,
        timestamp: '09:01',
        isPartial: false
      }]);
      setCurrentAnswer('');
    }
  };

  const handleSimulateFollowUp = () => {
    if (followUpCount >= maxFollowUps) return;
    setFollowUpCount(prev => prev + 1);
    setPhase('AI_SPEAKING');
    
    setTranscript(prev => [...prev, {
      id: Date.now().toString(),
      role: 'ai',
      text: 'Bạn vừa nhắc đến Model trong MVC, vậy Model tương tác thế nào với Database?',
      timestamp: '09:02',
      isPartial: false,
      isFollowUp: true
    }]);
    
    // Auto switch back to waiting after a delay
    setTimeout(() => {
      setPhase('WAITING_FOR_ANSWER');
    }, 4000);
  };

  const handleEndExam = () => {
    navigate(`/student/exams/${examId}/completed`);
  };

  const getPhaseIndicator = () => {
    switch (phase) {
      case 'AI_SPEAKING': return <span className="badge warning" style={{ background: '#bfdbfe', color: '#1e3a8a', border: 'none' }}>🤖 AI Đang nói</span>;
      case 'WAITING_FOR_ANSWER': return <span className="badge warning">⏳ Tới lượt bạn</span>;
      case 'STUDENT_SPEAKING': return <span className="badge success" style={{ animation: 'pulse 2s infinite', background: '#dcfce7', color: '#166534', border: 'none' }}>🎙️ Đang ghi âm</span>;
    }
  };

  // Auto scroll effect
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, currentAnswer]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 64px)', background: 'var(--bg)' }}>
      {/* 1. Exam Header Info */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontFamily: 'var(--display)', margin: '0 0 4px', color: 'var(--navy-dark)' }}>Phòng thi Vấn đáp Trực tiếp</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
            <span>Thí sinh: <span style={{ fontWeight: 700, color: 'var(--text)' }}>{session.user?.displayName || 'Sinh viên'}</span></span>
            <span style={{ color: 'var(--border)' }}>•</span> 
            <span>Mã đề: <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, background: 'var(--muted)', padding: '2px 6px', borderRadius: '4px' }}>EXAM-{examId || 'TEST'}</span></span>
            <span style={{ color: 'var(--border)' }}>•</span> 
            <span style={{ fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '12px' }}>
              Hỏi thêm: {followUpCount}/{maxFollowUps} lần
            </span>
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Thời gian còn lại</span>
            <span style={{ fontSize: '1.8rem', fontFamily: 'var(--mono)', fontWeight: 700, color: timeLeft < 60 ? 'var(--danger)' : 'var(--navy-dark)', animation: timeLeft < 60 ? 'pulse 1s infinite' : 'none' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button className="button outline" onClick={handleEndExam} style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}>
            Nộp bài sớm
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1000px', width: '100%', margin: '0 auto', padding: '24px', gap: '24px' }}>
        
        {/* 2. Audio Visualizer & Interaction Block */}
        <section className="panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderColor: 'var(--navy-dark)', boxShadow: '0 8px 24px rgba(8, 18, 52, 0.08)' }}>
          <div style={{ padding: '16px 20px', background: 'var(--navy-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--danger)', animation: 'pulse 1.5s infinite' }}></div>
              <span style={{ color: '#fff', fontWeight: 600 }}>Bản ghi âm trực tiếp</span>
            </div>
            {getPhaseIndicator()}
          </div>
          
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', background: 'var(--navy)' }}>
            <AudioVisualizer 
              isActive={phase === 'AI_SPEAKING' || phase === 'STUDENT_SPEAKING'} 
              status={phase === 'AI_SPEAKING' ? 'ai_speaking' : phase === 'STUDENT_SPEAKING' ? 'student_speaking' : 'idle'}
            />
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                className="button"
                onClick={handleStartSpeaking}
                disabled={phase === 'STUDENT_SPEAKING'}
                style={{ 
                  padding: '16px 32px', fontSize: '1.1rem', minHeight: '56px', borderRadius: '28px',
                  background: phase === 'STUDENT_SPEAKING' ? 'var(--navy-dark)' : '#2563eb',
                  color: phase === 'STUDENT_SPEAKING' ? 'var(--secondary)' : '#fff',
                  border: 'none',
                  cursor: phase === 'STUDENT_SPEAKING' ? 'not-allowed' : 'pointer',
                  boxShadow: phase === 'STUDENT_SPEAKING' ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)'
                }}
              >
                🎤 Bắt đầu trả lời
              </button>
              <button 
                className="button"
                onClick={handleStopSpeaking}
                disabled={phase !== 'STUDENT_SPEAKING'}
                style={{ 
                  padding: '16px 32px', fontSize: '1.1rem', minHeight: '56px', borderRadius: '28px',
                  background: phase !== 'STUDENT_SPEAKING' ? 'var(--navy-dark)' : '#16a34a',
                  color: phase !== 'STUDENT_SPEAKING' ? 'var(--secondary)' : '#fff',
                  border: 'none',
                  cursor: phase !== 'STUDENT_SPEAKING' ? 'not-allowed' : 'pointer',
                  boxShadow: phase !== 'STUDENT_SPEAKING' ? 'none' : '0 4px 12px rgba(22, 163, 74, 0.3)'
                }}
              >
                ✅ Hoàn tất câu trả lời
              </button>
            </div>
          </div>
        </section>

        {/* 3. Real-time Transcript Chat */}
        <section className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--navy-dark)', fontFamily: 'var(--display)' }}>
            <span>Biên bản hội thoại (Transcript)</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                className="button outline"
                onClick={handleSimulateFollowUp}
                disabled={followUpCount >= maxFollowUps || phase === 'STUDENT_SPEAKING'}
                style={{ fontSize: '0.75rem', padding: '0 12px', minHeight: '28px', borderColor: '#fcd34d', color: '#b45309', background: '#fffbeb' }}
              >
                + Mô phỏng Hỏi Xoáy (Dev)
              </button>
              <span className="badge info" style={{ background: '#e0f2fe', color: '#0369a1', border: 'none' }}>Live STT</span>
            </div>
          </h2>
          
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '16px' }}>
            {transcript.map((msg) => (
              <TranscriptMessage 
                key={msg.id} 
                role={msg.role} 
                text={msg.text} 
                timestamp={msg.timestamp} 
                isPartial={msg.isPartial}
                isFollowUp={msg.isFollowUp}
              />
            ))}
            
            {/* Real-time typing bubble for student */}
            {(phase === 'STUDENT_SPEAKING' || (currentAnswer && phase === 'WAITING_FOR_ANSWER')) && currentAnswer && (
              <TranscriptMessage 
                role="student" 
                text={currentAnswer} 
                timestamp="09:01" 
                isPartial={phase === 'STUDENT_SPEAKING'}
              />
            )}
            
            {/* Scroll anchor */}
            <div style={{ height: '16px' }} ref={scrollRef}></div>
          </div>
        </section>
        
      </div>
    </div>
  );
}

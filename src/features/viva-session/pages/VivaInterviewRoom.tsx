import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Badge } from '../../../components/ui/primitives';
import { AudioVisualizer } from '../components/AudioVisualizer';
import { TranscriptMessage } from '../components/TranscriptMessage';
import { useSession } from '../../../app/providers/use-session';

type SessionPhase = 'AI_SPEAKING' | 'WAITING_FOR_ANSWER' | 'STUDENT_SPEAKING';

export function VivaInterviewRoom() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  
  const [phase, setPhase] = useState<SessionPhase>('AI_SPEAKING');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  
  // Mock data for transcript
  const [transcript] = useState([
    {
      id: '1',
      role: 'ai' as const,
      text: 'Chào bạn. Câu hỏi đầu tiên dành cho bạn: Bạn hãy trình bày về mô hình MVC (Model-View-Controller) trong phát triển phần mềm và cho ví dụ thực tế.',
      timestamp: '09:00',
      isPartial: false
    }
  ]);
  
  const [currentAnswer, setCurrentAnswer] = useState('');
  
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
    // In reality, this would transition to AI_PROCESSING then AI_SPEAKING (Follow up)
  };

  const handleEndExam = () => {
    // Navigate to completion receipt page
    navigate(`/student/exams/${examId}/completed`);
  };

  const getPhaseIndicator = () => {
    switch (phase) {
      case 'AI_SPEAKING': return <Badge tone="ai">AI Đang nói</Badge>;
      case 'WAITING_FOR_ANSWER': return <Badge tone="warning">Tới lượt bạn</Badge>;
      case 'STUDENT_SPEAKING': return <Badge tone="success">Đang ghi âm</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] bg-gray-50">
      {/* 1. Exam Header Info */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Phòng thi Vấn đáp Trực tiếp</h1>
          <p className="text-sm text-slate-500 mt-1">
            Thí sinh: <span className="font-semibold text-slate-700">{session.user?.displayName || 'Sinh viên'}</span> 
            <span className="mx-2">•</span> 
            Mã đề: <span className="font-mono">EXAM-{examId || 'TEST'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Thời gian còn lại</span>
            <span className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <Button variant="outline" onClick={handleEndExam} className="border-red-200 text-red-600 hover:bg-red-50">
            Nộp bài sớm
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-6 gap-6">
        
        {/* 2. Audio Visualizer & Interaction Block */}
        <section className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-900 border-b border-slate-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-white font-medium">Bản ghi âm trực tiếp</span>
            </div>
            {getPhaseIndicator()}
          </div>
          
          <div className="p-8 flex flex-col items-center gap-8">
            <AudioVisualizer 
              isActive={phase === 'AI_SPEAKING' || phase === 'STUDENT_SPEAKING'} 
              status={phase === 'AI_SPEAKING' ? 'ai_speaking' : phase === 'STUDENT_SPEAKING' ? 'student_speaking' : 'idle'}
            />
            
            <div className="flex gap-4">
              <Button 
                onClick={handleStartSpeaking}
                disabled={phase === 'STUDENT_SPEAKING'}
                className={`px-8 py-4 text-lg font-medium rounded-xl transition-all ${
                  phase === 'STUDENT_SPEAKING' 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                }`}
              >
                🎤 Bắt đầu trả lời
              </Button>
              <Button 
                onClick={handleStopSpeaking}
                disabled={phase !== 'STUDENT_SPEAKING'}
                className={`px-8 py-4 text-lg font-medium rounded-xl transition-all ${
                  phase !== 'STUDENT_SPEAKING' 
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                }`}
              >
                ✅ Hoàn tất câu trả lời
              </Button>
            </div>
          </div>
        </section>

        {/* 3. Real-time Transcript Chat */}
        <section className="flex-1 bg-white rounded-2xl border shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-semibold border-b pb-4 mb-4 flex items-center justify-between text-slate-800">
            <span>Biên bản hội thoại (Transcript)</span>
            <Badge tone="info">Live STT</Badge>
          </h2>
          
          <div className="flex-1 overflow-y-auto pb-4 space-y-2">
            {transcript.map((msg) => (
              <TranscriptMessage 
                key={msg.id} 
                role={msg.role} 
                text={msg.text} 
                timestamp={msg.timestamp} 
                isPartial={msg.isPartial}
              />
            ))}
            
            {/* Real-time typing bubble for student */}
            {(phase === 'STUDENT_SPEAKING' || currentAnswer) && (
              <TranscriptMessage 
                role="student" 
                text={currentAnswer || '...'} 
                timestamp="09:01" 
                isPartial={phase === 'STUDENT_SPEAKING'}
              />
            )}
            
            {/* Scroll anchor */}
            <div className="h-4"></div>
          </div>
        </section>
        
      </div>
    </div>
  );
}

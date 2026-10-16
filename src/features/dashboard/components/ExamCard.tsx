import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';

export interface Exam {
  id: string;
  subjectName: string;
  examCode: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: 'upcoming' | 'completed';
  score?: number;
}

interface ExamCardProps {
  exam: Exam;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam }) => {
  const navigate = useNavigate();
  const isUpcoming = exam.status === 'upcoming';

  const handleAction = () => {
    if (isUpcoming) {
      navigate(`/student/exams/${exam.id}/session`);
    } else {
      navigate(`/student/exams/${exam.id}/report`);
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between h-full font-sans">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="bg-[var(--soft)] text-[var(--navy-dark)] text-xs font-semibold px-2.5 py-1 rounded-full">
            {exam.examCode}
          </span>
          {!isUpcoming && exam.score !== undefined && (
            <span className="bg-[#e8ece5] text-[#2e5d32] text-xs font-semibold px-2.5 py-1 rounded-full">
              {exam.score} / 10
            </span>
          )}
        </div>

        <h3 className="text-base font-bold text-[var(--navy-dark)] leading-snug line-clamp-2 mb-4 !font-sans">
          {exam.subjectName}
        </h3>

        <div className="space-y-1.5 text-xs text-[var(--secondary)]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[var(--secondary)] opacity-70 shrink-0" />
            <span>{exam.date}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[var(--secondary)] opacity-70 shrink-0" />
            <span>{exam.time} ({exam.durationMinutes} phút)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <button
          onClick={handleAction}
          className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-xs ${
            isUpcoming
              ? 'bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white'
              : 'bg-transparent hover:bg-black/5 text-[var(--navy-dark)] border border-[var(--border)]'
          }`}
        >
          {isUpcoming ? 'Vào thi' : 'Xem báo cáo'}
        </button>
      </div>
    </div>
  );
};

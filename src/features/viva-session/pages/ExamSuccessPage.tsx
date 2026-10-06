import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui/primitives';

export function ExamSuccessPage() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const handleReturnHome = () => {
    navigate('/student');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full flex flex-col items-center text-center">
        
        {/* 1. Success Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 uppercase tracking-tight mb-4">
            BÀI THI VẤN ĐÁP ĐÃ ĐƯỢC GHI NHẬN & NỘP THÀNH CÔNG
          </h1>
          <p className="text-gray-500 text-lg max-w-lg">
            Hệ thống đã lưu trữ bản ghi âm. AI đang tiến hành phân tích transcript và đánh giá kết quả...
          </p>
        </div>

        {/* 2. Exam Summary Card */}
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 w-full p-8 mb-8 text-left">
          <h2 className="text-lg font-semibold text-slate-800 border-b pb-4 mb-6">
            Tổng kết Phiên Vấn Đáp
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Thí sinh</span>
              <span className="font-medium text-slate-800">Phúc Đạt</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Mã đề thi</span>
              <span className="font-mono font-medium text-blue-600">{examId ? 'EXAM-' + examId : 'VIVA-CS101'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Thời gian làm bài</span>
              <span className="font-medium text-slate-800">12 phút 45 giây</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 mb-1">Số câu đã trả lời</span>
              <span className="font-medium text-slate-800">5/5 câu</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-blue-200 p-1.5 rounded">
                {/* Mini audio waveform icon */}
                <div className="w-1 h-3 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-5 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1 h-4 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="w-1 h-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '450ms' }}></div>
              </div>
              <div>
                <p className="text-sm font-semibold text-blue-900">Bản ghi âm đã được mã hoá và lưu trữ</p>
                <p className="text-xs text-blue-700 mt-0.5">Dữ liệu âm thanh an toàn. Khớp nối transcript: 100%</p>
              </div>
            </div>
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* 3. Action Footer */}
        <div className="w-full flex justify-center">
          <Button 
            variant="primary" 
            onClick={handleReturnHome}
            className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white shadow-md text-lg font-medium rounded-lg"
          >
            Quay về Trang chủ
          </Button>
        </div>
        
      </div>
    </div>
  );
}

import { useState } from 'react';
import {
  Sliders,
  Sparkles,
  Volume2,
  ShieldCheck,
  RotateCcw,
  Save,
  CheckCircle2,
  Cpu,
  Layers,
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'ai_params' | 'voice_stt' | 'security' | 'quota'>('ai_params');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form states
  const [model, setModel] = useState('viva-llama-3-70b');
  const [maxFollowUps, setMaxFollowUps] = useState(2);
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);
  const [language, setLanguage] = useState<'vi-VN' | 'en-US'>('vi-VN');
  const [voiceSpeed, setVoiceSpeed] = useState(1.0);
  const [voiceGender, setVoiceGender] = useState<'female' | 'male'>('female');
  const [micSensitivity, setMicSensitivity] = useState(75);
  const [retentionYears, setRetentionYears] = useState(3);
  const [maxConcurrentRooms, setMaxConcurrentRooms] = useState(30);

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDefaults = () => {
    setModel('viva-llama-3-70b');
    setMaxFollowUps(2);
    setConfidenceThreshold(85);
    setLanguage('vi-VN');
    setVoiceSpeed(1.0);
    setVoiceGender('female');
    setMicSensitivity(75);
    setRetentionYears(3);
    setMaxConcurrentRooms(30);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* 1. Header & Actions */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs text-stone-500 mb-2">
            <span className="font-semibold text-stone-700">Cấu hình Hệ thống AIVES</span>
            <span>•</span>
            <span className="font-mono text-stone-400">CFG-VIVA-2026.10</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[var(--navy-dark)] mb-2">
            Cấu hình Tham số AI & Giọng nói
          </h1>
          <p className="text-sm text-stone-600 max-w-2xl">
            Thiết lập động cơ suy luận LLM, nhận diện giọng nói (STT), tổng hợp giọng đọc AI (TTS) và các quy chuẩn bảo mật khảo thí.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-stone-600 hover:text-stone-900 border border-[var(--border)] hover:bg-stone-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--navy)] hover:bg-[var(--navy-dark)] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </section>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Cấu hình tham số Viva AI đã được lưu và áp dụng cho toàn bộ các phòng thi tiếp theo.</span>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('ai_params')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'ai_params'
              ? 'bg-[var(--navy)] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Động cơ AI & Suy luận</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('voice_stt')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'voice_stt'
              ? 'bg-[var(--navy)] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Ngôn ngữ & Giọng nói (STT/TTS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'security'
              ? 'bg-[var(--navy)] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>An toàn & Bảo mật Khảo thí</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('quota')}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'quota'
              ? 'bg-[var(--navy)] text-white shadow-xs'
              : 'text-stone-600 hover:bg-stone-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Giới hạn Phòng thi & Tải</span>
        </button>
      </div>

      {/* 3. Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Tab 1: AI Parameters */}
          {activeTab === 'ai_params' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-[var(--navy-dark)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Mô hình Khảo thí & Chiến lược Đặt câu hỏi
              </h2>

              <div className="space-y-4">
                <label className="block text-xs font-semibold text-stone-700">
                  Mô hình suy luận chính (Primary LLM)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setModel('viva-llama-3-70b')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      model === 'viva-llama-3-70b'
                        ? 'border-[var(--navy)] bg-indigo-50/50 ring-2 ring-[var(--navy)]/20'
                        : 'border-[var(--border)] hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-[var(--navy-dark)]">Viva-Llama 3 70B Academic</strong>
                      {model === 'viva-llama-3-70b' && <span className="text-xs text-indigo-600 font-bold">✓</span>}
                    </div>
                    <p className="text-[11px] text-stone-500">Mô hình nội bộ tinh chỉnh theo thuật ngữ tiếng Việt & giáo trình đại học</p>
                  </div>

                  <div
                    onClick={() => setModel('gpt-4o-enterprise')}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      model === 'gpt-4o-enterprise'
                        ? 'border-[var(--navy)] bg-indigo-50/50 ring-2 ring-[var(--navy)]/20'
                        : 'border-[var(--border)] hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-[var(--navy-dark)]">GPT-4o Enterprise Gateway</strong>
                      {model === 'gpt-4o-enterprise' && <span className="text-xs text-indigo-600 font-bold">✓</span>}
                    </div>
                    <p className="text-[11px] text-stone-500">Độ trễ thấp 1.1s, khả năng đa ngôn ngữ và phân tích lập luận sâu</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                      <span>Số câu hỏi phụ tối đa (Follow-ups):</span>
                      <span className="font-mono text-indigo-700">{maxFollowUps} lần</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      value={maxFollowUps}
                      onChange={(e) => setMaxFollowUps(Number(e.target.value))}
                      className="w-full accent-[var(--navy)]"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">Khuyến nghị: 1 - 2 lần cho ca thi 15 phút</span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                      <span>Ngưỡng tự tin đánh giá (Confidence):</span>
                      <span className="font-mono text-indigo-700">{confidenceThreshold}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="98"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                      className="w-full accent-[var(--navy)]"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">AI sẽ cảnh báo khi độ tin cậy dưới ngưỡng này</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Voice & STT/TTS */}
          {activeTab === 'voice_stt' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-[var(--navy-dark)] flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                Cấu hình Nhận diện & Giọng đọc AI (Speech-to-Text & Text-to-Speech)
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Ngôn ngữ khảo thí mặc định
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                      <input
                        type="radio"
                        name="lang"
                        checked={language === 'vi-VN'}
                        onChange={() => setLanguage('vi-VN')}
                        className="accent-[var(--navy)]"
                      />
                      <span>Tiếng Việt (vi-VN Academic)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                      <input
                        type="radio"
                        name="lang"
                        checked={language === 'en-US'}
                        onChange={() => setLanguage('en-US')}
                        className="accent-[var(--navy)]"
                      />
                      <span>English (en-US Standard)</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[var(--border)]">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Giọng đọc Giám khảo AI
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setVoiceGender('female')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                          voiceGender === 'female' ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border)] text-stone-700'
                        }`}
                      >
                        Nữ (Thanh lịch)
                      </button>
                      <button
                        type="button"
                        onClick={() => setVoiceGender('male')}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                          voiceGender === 'male' ? 'bg-[var(--navy)] text-white border-[var(--navy)]' : 'border-[var(--border)] text-stone-700'
                        }`}
                      >
                        Nam (Trang trọng)
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                      <span>Tốc độ đọc câu hỏi AI:</span>
                      <span className="font-mono text-indigo-700">{voiceSpeed}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.8"
                      max="1.3"
                      step="0.05"
                      value={voiceSpeed}
                      onChange={(e) => setVoiceSpeed(Number(e.target.value))}
                      className="w-full accent-[var(--navy)]"
                    />
                    <span className="text-[11px] text-stone-400 mt-1 block">Tốc độ chuẩn: 1.0x</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-2">
                    <span>Độ nhạy thu âm micro thí sinh (Noise Suppression Threshold):</span>
                    <span className="font-mono text-indigo-700">{micSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="95"
                    value={micSensitivity}
                    onChange={(e) => setMicSensitivity(Number(e.target.value))}
                    className="w-full accent-[var(--navy)]"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">Tự động lọc tiếng ồn môi trường và quạt gió</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Security & Compliance */}
          {activeTab === 'security' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-[var(--navy-dark)] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                Chính sách Lưu trữ & Toàn vẹn Khảo thí
              </h2>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-[var(--muted)]/40 rounded-xl border border-[var(--border)] space-y-2">
                  <strong className="text-stone-800 block text-sm">Mã hóa đầu cuối AES-256</strong>
                  <p className="text-stone-600 leading-relaxed">
                    Tất cả âm thanh và transcript trong suốt quá trình vấn đáp được bọc mã hóa tự động trước khi lưu xuống bộ nhớ đám mây của nhà trường.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between font-semibold text-stone-700 mb-2">
                    <span>Thời hạn lưu trữ bản ghi âm phục vụ phúc khảo:</span>
                    <span className="font-mono text-indigo-700">{retentionYears} năm</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={retentionYears}
                    onChange={(e) => setRetentionYears(Number(e.target.value))}
                    className="w-full accent-[var(--navy)]"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">Sau thời hạn này, dữ liệu âm thanh sẽ được tự động xóa theo quy định</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Room Quotas */}
          {activeTab === 'quota' && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              <h2 className="text-base font-bold text-[var(--navy-dark)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-700" />
                Giới hạn Phòng thi & Điều phối Băng thông
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex items-center justify-between font-semibold text-stone-700 mb-2">
                    <span>Số phòng thi vấn đáp đồng thời tối đa:</span>
                    <span className="font-mono text-indigo-700">{maxConcurrentRooms} phòng</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={maxConcurrentRooms}
                    onChange={(e) => setMaxConcurrentRooms(Number(e.target.value))}
                    className="w-full accent-[var(--navy)]"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">Đảm bảo băng thông đường truyền ổn định không vượt quá tải GPU</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Settings Summary & System Integrity Card */}
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[var(--navy-dark)] uppercase tracking-wider">
              Tóm tắt Cấu hình Đang Áp Dụng
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-stone-500">Mô hình:</span>
                <span className="font-semibold text-stone-800 font-mono text-[11px]">{model}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-stone-500">Hỏi thêm tối đa:</span>
                <span className="font-semibold text-stone-800">{maxFollowUps} lần</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-stone-500">Ngôn ngữ STT/TTS:</span>
                <span className="font-semibold text-stone-800">{language}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[var(--border)]">
                <span className="text-stone-500">Tốc độ đọc AI:</span>
                <span className="font-semibold text-stone-800">{voiceSpeed}x</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-stone-500">Lưu trữ Audio:</span>
                <span className="font-semibold text-emerald-700">AES-256 ({retentionYears} năm)</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-6 shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-700" />
              Lưu ý quy định Khảo thí
            </h4>
            <p className="text-indigo-900 leading-relaxed">
              Mọi thay đổi cấu hình sẽ được ghi nhận vào nhật ký kiểm toán hệ thống (Audit Trail) để đảm bảo tính công bằng và có thể kiểm tra lại khi có thanh tra khảo thí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

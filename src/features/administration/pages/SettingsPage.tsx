import { useState } from 'react';
import { PageHeader } from '../../../components/common/states';
import { Button } from '../../../components/ui/primitives';

export function SettingsPage() {
  const [sttLanguage, setSttLanguage] = useState('vi-VN');
  const [ttsLanguage, setTtsLanguage] = useState('vi-VN');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      alert('Đã lưu cấu hình hệ thống thành công');
    }, 1000);
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Cấu hình hệ thống"
        description="Cấu hình ngôn ngữ STT/TTS và các cài đặt chung của hệ thống."
        eyebrow="Administration"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '600px', marginTop: '24px' }}>
        <section className="panel" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #C6C5CF', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Speech-to-Text (STT)</h3>
          <p style={{ color: '#45464E', marginBottom: '16px' }}>Ngôn ngữ mặc định để nhận diện giọng nói của sinh viên.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" name="stt" value="vi-VN" checked={sttLanguage === 'vi-VN'} onChange={(e) => setSttLanguage(e.target.value)} />
              Tiếng Việt (vi-VN)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" name="stt" value="en-US" checked={sttLanguage === 'en-US'} onChange={(e) => setSttLanguage(e.target.value)} />
              Tiếng Anh (en-US)
            </label>
          </div>
        </section>

        <section className="panel" style={{ padding: '24px', backgroundColor: '#FFFFFF', border: '1px solid #C6C5CF', borderRadius: '4px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Text-to-Speech (TTS)</h3>
          <p style={{ color: '#45464E', marginBottom: '16px' }}>Ngôn ngữ mặc định cho giọng đọc của giám khảo ảo AI.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" name="tts" value="vi-VN" checked={ttsLanguage === 'vi-VN'} onChange={(e) => setTtsLanguage(e.target.value)} />
              Tiếng Việt (vi-VN)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="radio" name="tts" value="en-US" checked={ttsLanguage === 'en-US'} onChange={(e) => setTtsLanguage(e.target.value)} />
              Tiếng Anh (en-US)
            </label>
          </div>
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Button variant="primary" onClick={handleSave} pending={isSaving}>Lưu cấu hình</Button>
        </div>
      </div>
    </div>
  );
}

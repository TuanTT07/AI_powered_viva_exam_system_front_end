import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { VivaSessionView } from './VivaSessionView'

describe('VivaSessionView audio waveform and completion behavior', () => {
  it('renders resting state when not recording', () => {
    render(
      <VivaSessionView
        name="Nguyễn Văn A"
        title="Thi vấn đáp"
        phase="Sẵn sàng"
        timer="15:00"
        progress="1/3 câu"
        transcript={[]}
        notice={null}
        controls={<button type="button">Bắt đầu</button>}
        connection="Đã kết nối máy chủ"
        isRecording={false}
        audioLevel={0}
      />
    )

    expect(screen.getByText('Sẵn sàng trả lời')).toBeInTheDocument()
  })

  it('indicates listening when recording with low or zero audio level', () => {
    render(
      <VivaSessionView
        name="Nguyễn Văn A"
        title="Thi vấn đáp"
        phase="Đang trả lời"
        timer="14:50"
        progress="1/3 câu"
        transcript={[]}
        notice={null}
        controls={<button type="button">Xác nhận</button>}
        connection="Đã kết nối máy chủ"
        isRecording={true}
        audioLevel={0.01}
      />
    )

    expect(screen.getByText('Đang lắng nghe câu trả lời...')).toBeInTheDocument()
  })

  it('reacts dynamically with recognizing indicator when user speaks (audioLevel > 0.05)', () => {
    render(
      <VivaSessionView
        name="Nguyễn Văn A"
        title="Thi vấn đáp"
        phase="Đang trả lời"
        timer="14:40"
        progress="1/3 câu"
        transcript={[]}
        notice={null}
        controls={<button type="button">Xác nhận</button>}
        connection="Đã kết nối máy chủ"
        isRecording={true}
        audioLevel={0.45}
      />
    )

    expect(screen.getByText('Đang nhận diện giọng nói...')).toBeInTheDocument()
  })

  it('hides AI card and mic visualizer when exam is completed', () => {
    render(
      <VivaSessionView
        name="Nguyễn Văn A"
        title="Thi vấn đáp"
        phase="Phiên thi đã hoàn tất"
        timer="—"
        progress="3/3 câu"
        transcript={[]}
        notice={null}
        controls={<button type="button">Xem kết quả</button>}
        connection="Đã kết nối máy chủ"
        isCompleted={true}
      />
    )

    expect(screen.queryByText('Giám khảo AI')).not.toBeInTheDocument()
    expect(screen.queryByText('Sẵn sàng trả lời')).not.toBeInTheDocument()
    expect(screen.getByText(/Phiên thi đã kết thúc và câu trả lời của bạn đã được hệ thống ghi nhận/i)).toBeInTheDocument()
  })
})

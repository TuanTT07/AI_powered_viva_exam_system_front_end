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

  it('marks question 1 as active and NOT completed when student first enters the room', () => {
    render(
      <VivaSessionView
        name="Nguyễn Văn A"
        title="Thi vấn đáp"
        phase="Sẵn sàng trả lời"
        timer="15:00"
        progress="1/3 câu"
        currentStep={1}
        totalSteps={3}
        transcript={[]}
        notice={null}
        controls={<button type="button">Bắt đầu trả lời</button>}
        connection="Đã kết nối máy chủ"
        isRecording={false}
      />
    )

    expect(screen.getByText('Câu hỏi (Câu 1/3)')).toBeInTheDocument()
    expect(screen.getByText('1/3 câu')).toBeInTheDocument()

    // Question 1 should be active ("Đang trả lời"), not completed
    expect(screen.getByText('Đang trả lời')).toBeInTheDocument()
    expect(screen.queryByText('Đã hoàn thành')).not.toBeInTheDocument()
    expect(screen.getAllByText('Chưa diễn ra')).toHaveLength(2)
  })

  it('dynamically displays more than 3 questions when exam has 5 questions', () => {
    render(
      <VivaSessionView
        name="Nguyễn Văn A"
        title="Thi vấn đáp nâng cao"
        phase="Đang trả lời"
        timer="10:00"
        progress="4/5 câu"
        currentStep={4}
        totalSteps={5}
        transcript={[]}
        notice={null}
        controls={<button type="button">Xác nhận</button>}
        connection="Đã kết nối máy chủ"
        isRecording={false}
      />
    )

    expect(screen.getByText('Câu hỏi (Câu 4/5)')).toBeInTheDocument()
    expect(screen.getByText('4/5 câu')).toBeInTheDocument()

    // Questions 1 to 5 should all be rendered
    expect(screen.getByText('Câu 1')).toBeInTheDocument()
    expect(screen.getByText('Câu 2')).toBeInTheDocument()
    expect(screen.getByText('Câu 3')).toBeInTheDocument()
    expect(screen.getByText('Câu 4')).toBeInTheDocument()
    expect(screen.getByText('Câu 5')).toBeInTheDocument()

    // 3 completed, 1 active, 1 upcoming
    expect(screen.getAllByText('Đã hoàn thành')).toHaveLength(3)
    expect(screen.getAllByText('Đang trả lời').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Chưa diễn ra')).toBeInTheDocument()
  })

  it('renders both AI question and student answer in the transcript history panel', () => {
    const transcript = [
      {
        id: 'turn-1-ai',
        role: 'ai' as const,
        text: 'Em hãy giải thích tính đóng gói trong Java.',
        timestamp: '00:25',
      },
      {
        id: 'turn-1-student',
        role: 'student' as const,
        text: 'Tính đóng gói là việc che giấu thông tin của đối tượng bằng private.',
        timestamp: '00:26',
      },
    ]

    render(
      <VivaSessionView
        name="Nguyễn Văn A"
        title="Thi vấn đáp"
        phase="Sẵn sàng trả lời"
        timer="02:00"
        progress="2/3 câu"
        transcript={transcript}
        notice={null}
        controls={<button type="button">Xác nhận</button>}
        connection="Đã kết nối máy chủ"
        isRecording={false}
      />
    )

    // Transcript count badge should show 2 lượt
    expect(screen.getByText(/Biên bản hội thoại đã ghi nhận \(2 lượt\)/i)).toBeInTheDocument()
  })
})


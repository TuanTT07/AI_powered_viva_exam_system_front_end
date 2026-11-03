import { useCallback, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/primitives'
import { ErrorState, LoadingPage, PermissionDenied } from '../../../components/common/states'
import { InlineNotice } from '../../../components/common/inline-notice'
import { ApiError } from '../../../services/api/client'
import { useOnline } from '../../../hooks/use-online'
import type { StudentExamSlot } from '../../exams/api-student-exam-repository'
import { studentExamPath } from '../../exams/student-exam-navigation'
import { interviewApi } from '../interview-api'
import { ApiSpeechRoom } from './ApiSpeechRoom'
import { VivaSessionView } from './VivaSessionView'

export function ApiInterviewRoom({ slot, userId, name }: { slot: StudentExamSlot; userId: string; name: string }) {
  const client = useQueryClient()
  const online = useOnline()
  const [busy, setBusy] = useState(false)
  const key = ['student-interview', userId, slot.attemptId] as const
  const start = useMutation({
    mutationFn: () => interviewApi.start(slot.attemptId),
    retry: false,
    onMutate: () => client.cancelQueries({ queryKey: key }),
    onSuccess: data => client.setQueryData(key, data),
    onError: () => { void client.invalidateQueries({ queryKey: key }) },
  })
  const current = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => interviewApi.current(slot.attemptId, signal),
    enabled: !busy && online && !start.isPending,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    refetchInterval: query => busy || start.isPending || query.state.status === 'error' || query.state.data?.status === 'COMPLETED' ? false : 2000,
  })
  const snapshot = current.data
  const busyChanged = useCallback((next: boolean) => {
    // Cancel a read before media starts so a late response cannot replace its prompt.
    if (next) void client.cancelQueries({ queryKey: ['student-interview', userId, slot.attemptId] })
    setBusy(next)
  }, [client, userId, slot.attemptId])
  const answerSaved = useCallback(() => {
    void client.invalidateQueries({ queryKey: ['student-interview', userId, slot.attemptId] })
  }, [client, slot.attemptId, userId])
  const back = <Link className="button outline" to={studentExamPath(slot.examId, slot.attemptId)}>Về ca thi</Link>

  if (current.error instanceof ApiError && [401, 403].includes(current.error.status ?? 0)) return <PermissionDenied />
  if (current.isError && !busy) return <>
    <ErrorState description={current.error.message} />
    <Button disabled={!online || current.isFetching} onClick={() => void current.refetch()}>Đồng bộ lại phiên thi</Button>{back}
  </>
  if (!snapshot || !current.isFetchedAfterMount) return online ? <LoadingPage label="Đang lấy trạng thái phiên thi" /> : <><ErrorState description="Mất kết nối mạng. Kết nối lại để lấy trạng thái phiên thi." />{back}</>
  if (snapshot.status === 'AWAITING_ANSWER' && snapshot.prompt) return <ApiSpeechRoom
    key={`${userId}:${slot.attemptId}:${snapshot.prompt.questionTurnId}`}
    slot={slot} prompt={snapshot.prompt} userId={userId} name={name}
    onBusyChange={busyChanged} onAnswerSaved={answerSaved}
  />

  return <VivaSessionView
    name={name} title={slot.examTitle}
    phase={snapshot.status === 'READY' ? 'Sẵn sàng bắt đầu phiên thi' : snapshot.status === 'COMPLETED' ? 'Phiên thi đã hoàn tất' : 'Hệ thống đang xử lý lượt thi'}
    timer="—" timerLabel="Thời gian trả lời"
    progress={slot.slotNumber == null ? 'Ca thi của bạn' : `Ca ${slot.slotNumber}`}
    transcript={[]} connection={online ? 'Đồng bộ trạng thái phiên thi' : 'Mất kết nối mạng'}
    notice={<div className="space-y-2">
      {start.isError && <InlineNotice>{start.error.message} Hãy kiểm tra trạng thái phiên trước khi thử lại.</InlineNotice>}
      <InlineNotice>{snapshot.status === 'READY'
        ? 'Nhấn bắt đầu để hệ thống mở phiên thi và cấp câu hỏi đầu tiên.'
        : snapshot.status === 'COMPLETED'
          ? 'Hệ thống đã xác nhận phiên thi kết thúc. Kết quả sẽ hiển thị khi được công bố.'
          : 'Vui lòng chờ. Hệ thống sẽ cấp lượt hỏi tiếp theo hoặc xác nhận kết thúc phiên thi.'}</InlineNotice>
    </div>}
    controls={<>
      {snapshot.status === 'READY' && <Button disabled={!online || start.isPending || current.isFetching} onClick={() => start.mutate()}>{start.isPending ? 'Đang bắt đầu…' : 'Bắt đầu phiên thi'}</Button>}
      {snapshot.status === 'PROCESSING' && <Button disabled>Đang chờ hệ thống…</Button>}
      {snapshot.status !== 'COMPLETED' && <Button variant="outline" disabled={!online || current.isFetching || start.isPending} onClick={() => void current.refetch()}>Đồng bộ phiên thi</Button>}
      {back}
    </>}
  />
}

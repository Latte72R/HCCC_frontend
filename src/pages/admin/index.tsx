import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import RefreshIcon from '@mui/icons-material/Refresh'
import SearchIcon from '@mui/icons-material/Search'
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  InputAdornment, MenuItem, Paper, Skeleton, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Tabs, Tab, TextField, Typography,
} from '@mui/material'
import Head from 'next/head'
import { useMemo, useState } from 'react'

import AppLink from '@/components/atoms/AppLink'
import { useAuthContext } from '@/components/contexts/AuthProvider'
import ProblemManager from '@/components/organisms/admin/ProblemManager'
import BasicLayout from '@/components/templates/BasicLayout'
import {
  correctAdminJudgement,
  deleteAdminSubmission,
  rejudgeAdminSubmission,
  updateContestPeriod,
  useAdminOverview,
  useContestPeriod,
} from '@/features/api'
import { AdminOverview } from '@/features/types'

type RecentSubmission = AdminOverview['recentSubmissions'][number]
const results = ['AC', 'WA', 'WC', 'AE', 'LE', 'RE', 'TLE', 'Pending', 'SystemError']

const toLocalInputValue = (rfc3339: string) => {
  const date = new Date(rfc3339)
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const metricLabels = [
  ['users', '参加者', '人'],
  ['problems', '公開問題', '問'],
  ['submissions', '総提出', '件'],
  ['pending', '判定待ち', '件'],
  ['accepted', '正解', '件'],
] as const

export default function AdminPage() {
  const { user, isAdmin } = useAuthContext()
  const [submissionPage, setSubmissionPage] = useState(0)
  const { data, error, isLoading, refresh } = useAdminOverview(submissionPage * 20)
  const [tab, setTab] = useState(0)
  const { data: period, refresh: refreshPeriod } = useContestPeriod()
  const [beginInput, setBeginInput] = useState('')
  const [endInput, setEndInput] = useState('')
  const [eventInput, setEventInput] = useState('')
  const [periodError, setPeriodError] = useState('')
  const [periodSaving, setPeriodSaving] = useState(false)
  const [periodSaved, setPeriodSaved] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'error'>('all')
  const [editing, setEditing] = useState<RecentSubmission | null>(null)
  const [result, setResult] = useState('AC')
  const [errorMessage, setErrorMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [rejudging, setRejudging] = useState<RecentSubmission | null>(null)
  const [deleting, setDeleting] = useState<RecentSubmission | null>(null)
  const [actionError, setActionError] = useState('')
  const [acting, setActing] = useState(false)

  const openEditor = (row: RecentSubmission) => {
    setEditing(row)
    setResult(row.result)
    setErrorMessage(row.errorMessage)
    setSaveError('')
  }

  const refreshPeriodAndOverview = async () => {
    await Promise.all([refreshPeriod(), refresh()])
  }

  const beginValue = beginInput || (period ? toLocalInputValue(period.begin) : '')
  const endValue = endInput || (period ? toLocalInputValue(period.end) : '')
  const eventValue = eventInput || period?.eventName || ''

  const savePeriod = async () => {
    setPeriodSaving(true)
    setPeriodError('')
    setPeriodSaved(false)
    try {
      const begin = new Date(beginValue)
      const end = new Date(endValue)
      if (Number.isNaN(begin.getTime()) || Number.isNaN(end.getTime())) {
        setPeriodError('開始・終了の日時を入力してください。')
        return
      }
      if (begin >= end) {
        setPeriodError('終了は開始より後にしてください。')
        return
      }
      if (!eventValue.trim() || eventValue.length > 200) {
        setPeriodError('イベント名を1〜200文字で入力してください。')
        return
      }
      await updateContestPeriod(begin.toISOString(), end.toISOString(), eventValue.trim())
      await refreshPeriodAndOverview()
      setBeginInput(toLocalInputValue(begin.toISOString()))
      setEndInput(toLocalInputValue(end.toISOString()))
      setEventInput(eventValue.trim())
      setPeriodSaved(true)
    } catch {
      setPeriodError('保存できませんでした。権限または接続を確認してください。')
    } finally {
      setPeriodSaving(false)
    }
  }

  const saveCorrection = async () => {
    if (!editing) return
    setSaving(true)
    setSaveError('')
    try {
      await correctAdminJudgement(editing.id, result, errorMessage)
      await refresh()
      setEditing(null)
    } catch {
      setSaveError('修正を保存できませんでした。権限または接続を確認してください。')
    } finally {
      setSaving(false)
    }
  }

  const runRejudge = async () => {
    if (!rejudging) return
    setActing(true)
    setActionError('')
    try {
      await rejudgeAdminSubmission(rejudging.id)
      await refresh()
      setRejudging(null)
    } catch {
      setActionError('再判定を開始できませんでした。判定中の提出でないか確認してください。')
    } finally {
      setActing(false)
    }
  }

  const runDelete = async () => {
    if (!deleting) return
    setActing(true)
    setActionError('')
    try {
      await deleteAdminSubmission(deleting.id)
      await refresh()
      setDeleting(null)
    } catch {
      setActionError('提出を削除できませんでした。権限または接続を確認してください。')
    } finally {
      setActing(false)
    }
  }

  const rows = useMemo(() => data?.recentSubmissions.filter((row) => {
    const matchesQuery = `${row.id} ${row.userName} ${row.problemId} ${row.problemTitle}`
      .toLocaleLowerCase().includes(query.toLocaleLowerCase())
    const matchesFilter = filter === 'all' ||
      (filter === 'pending' && row.result === 'Pending') ||
      (filter === 'error' && ['AE', 'LE', 'RE', 'TLE', 'SystemError'].includes(row.result))
    return matchesQuery && matchesFilter
  }) ?? [], [data, query, filter])

  return <>
    <Head><title>管理画面 | HCCC</title></Head>
    <BasicLayout>
      <Box sx={{ pb: 10 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent='space-between' gap={2} sx={{ mb: 4 }}>
          <Box>
            <Stack direction='row' alignItems='center' spacing={1.5}>
              <AdminPanelSettingsIcon color='primary' fontSize='large' />
              <Typography variant='h4' fontWeight={800}>管理画面</Typography>
            </Stack>
            <Typography color='text.secondary' sx={{ mt: 1 }}>大会の状況と直近の判定を確認できます。</Typography>
          </Box>
          {isAdmin && <Button variant='outlined' startIcon={<RefreshIcon />} onClick={() => refresh()} sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}>更新する</Button>}
        </Stack>

        {!user && <Alert severity='info'>管理画面を見るには<AppLink href='/login'>ログイン</AppLink>してください。</Alert>}
        {user && !isAdmin && <Alert severity='warning'>このアカウントには管理権限がありません。</Alert>}
        {user && isAdmin && <>
          {error && <Alert severity='error' sx={{ mb: 3 }}>データを取得できませんでした。接続と API の設定を確認してください。</Alert>}
          <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
            <Tab label='判定・概要' />
            <Tab label='問題管理' />
          </Tabs>
          {tab === 0 && <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }, gap: 2, mb: 4 }}>
            {metricLabels.map(([key, label, unit]) => <Paper key={key} variant='outlined' sx={{ p: 2.5, borderRadius: 3, bgcolor: key === 'pending' ? '#fff8ec' : 'background.paper' }}>
              <Typography variant='body2' color='text.secondary'>{label}</Typography>
              <Typography variant='h4' fontWeight={800} sx={{ mt: 1 }}>{isLoading ? <Skeleton width={70} /> : data?.[key] ?? '—'}<Typography component='span' variant='body2' sx={{ ml: 0.5 }}>{unit}</Typography></Typography>
            </Paper>)}
          </Box>

          <Paper variant='outlined' sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Typography variant='h6' fontWeight={700}>大会期間</Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
              現在: {period ? `${new Date(period.begin).toLocaleString('ja-JP')} 〜 ${new Date(period.end).toLocaleString('ja-JP')}（{period.eventName}）` : '取得中…'}
             （問題公開・提出制限・トップ表示の判定に使われます）
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-end' }}>
              <TextField size='small' label='イベント名' value={eventValue} onChange={(event) => setEventInput(event.target.value)} sx={{ minWidth: 200 }} />
              <TextField size='small' type='datetime-local' label='開始' value={beginValue} onChange={(event) => setBeginInput(event.target.value)} InputLabelProps={{ shrink: true }} />
              <TextField size='small' type='datetime-local' label='終了' value={endValue} onChange={(event) => setEndInput(event.target.value)} InputLabelProps={{ shrink: true }} />
              <Button variant='contained' disabled={periodSaving} onClick={savePeriod}>期間を保存</Button>
            </Stack>
            {periodError && <Alert severity='error' sx={{ mt: 2 }}>{periodError}</Alert>}
            {periodSaved && <Alert severity='success' sx={{ mt: 2 }}>大会期間を更新しました。</Alert>}
          </Paper>

          <Paper variant='outlined' sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box><Typography variant='h6' fontWeight={700}>直近の提出</Typography><Typography variant='body2' color='text.secondary'>最新20件を15秒ごとに更新</Typography></Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField size='small' placeholder='ID・参加者・問題で検索' value={query} onChange={(event) => setQuery(event.target.value)} InputProps={{ startAdornment: <InputAdornment position='start'><SearchIcon fontSize='small' /></InputAdornment> }} />
                <Stack direction='row' spacing={0.5}>{([['all', 'すべて'], ['pending', '判定待ち'], ['error', 'エラー']] as const).map(([value, label]) => <Button key={value} size='small' variant={filter === value ? 'contained' : 'outlined'} onClick={() => setFilter(value)}>{label}</Button>)}</Stack>
              </Stack>
            </Box>
            <TableContainer><Table size='small'>
              <TableHead sx={{ bgcolor: '#f6f8fb' }}><TableRow><TableCell>ID</TableCell><TableCell>参加者</TableCell><TableCell>問題</TableCell><TableCell>判定</TableCell><TableCell>提出日時</TableCell><TableCell>操作</TableCell></TableRow></TableHead>
              <TableBody>{rows.map((row) => <TableRow key={row.id} hover>
                <TableCell><AppLink href={`/submissions/${row.id}`}>#{row.id}</AppLink></TableCell><TableCell>{row.userName}</TableCell><TableCell><AppLink href={`/problems/${row.problemId}`}>#{row.problemId} {row.problemTitle}</AppLink></TableCell>
                <TableCell><Chip size='small' label={row.result} color={row.result === 'AC' ? 'success' : row.result === 'Pending' ? 'warning' : 'default'} /></TableCell>
                <TableCell>{new Date(row.submittedAt).toLocaleString('ja-JP')}</TableCell>
                <TableCell>
                  <Stack direction='row' spacing={0.5} flexWrap='wrap' useFlexGap>
                    <Button size='small' onClick={() => openEditor(row)}>判定を修正</Button>
                    <Button
                      size='small'
                      disabled={row.result === 'Pending'}
                      onClick={() => { setActionError(''); setRejudging(row) }}
                    >
                      再判定
                    </Button>
                    <Button
                      size='small'
                      color='error'
                      onClick={() => { setActionError(''); setDeleting(row) }}
                    >
                      削除
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>)}</TableBody>
            </Table></TableContainer>
            {!isLoading && rows.length === 0 && <Typography color='text.secondary' align='center' sx={{ p: 4 }}>該当する提出はありません。</Typography>}
            <Stack direction='row' justifyContent='flex-end' alignItems='center' spacing={1} sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant='body2' color='text.secondary' sx={{ mr: 1 }}>
                {data && data.submissions > 0
                  ? `${submissionPage * 20 + 1}–${Math.min((submissionPage + 1) * 20, data.submissions)} / ${data.submissions}件`
                  : '0件'}
              </Typography>
              <Button
                size='small'
                variant='outlined'
                disabled={submissionPage === 0}
                onClick={() => setSubmissionPage((page) => Math.max(0, page - 1))}
              >
                前の20件
              </Button>
              <Button
                size='small'
                variant='outlined'
                disabled={!data || (submissionPage + 1) * 20 >= data.submissions}
                onClick={() => setSubmissionPage((page) => page + 1)}
              >
                次の20件
              </Button>
            </Stack>
          </Paper>
          </>}
          {tab === 1 && <ProblemManager />}
          <Dialog open={Boolean(editing)} onClose={() => !saving && setEditing(null)} fullWidth maxWidth='sm'>
            <DialogTitle>提出 #{editing?.id} の判定を修正</DialogTitle>
            <DialogContent>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>{editing?.userName} · {editing?.problemTitle}</Typography>
              <TextField select fullWidth label='判定結果' value={result} onChange={(event) => setResult(event.target.value)} sx={{ mb: 2 }}>
                {results.map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
              </TextField>
              <TextField fullWidth multiline minRows={3} label='エラーメッセージ' value={errorMessage} onChange={(event) => setErrorMessage(event.target.value)} inputProps={{ maxLength: 10000 }} />
              {saveError && <Alert severity='error' sx={{ mt: 2 }}>{saveError}</Alert>}
            </DialogContent>
            <DialogActions><Button disabled={saving} onClick={() => setEditing(null)}>キャンセル</Button><Button variant='contained' disabled={saving} onClick={saveCorrection}>保存する</Button></DialogActions>
          </Dialog>
          <Dialog open={Boolean(rejudging)} onClose={() => !acting && setRejudging(null)} fullWidth maxWidth='sm'>
            <DialogTitle>提出 #{rejudging?.id} を再判定</DialogTitle>
            <DialogContent>
              <Typography>
                現在の判定結果を破棄して Pending に戻し，judge に再投入します。
              </Typography>
              {actionError && <Alert severity='error' sx={{ mt: 2 }}>{actionError}</Alert>}
            </DialogContent>
            <DialogActions>
              <Button disabled={acting} onClick={() => setRejudging(null)}>キャンセル</Button>
              <Button variant='contained' disabled={acting} onClick={runRejudge}>再判定する</Button>
            </DialogActions>
          </Dialog>
          <Dialog open={Boolean(deleting)} onClose={() => !acting && setDeleting(null)} fullWidth maxWidth='sm'>
            <DialogTitle>提出 #{deleting?.id} を削除</DialogTitle>
            <DialogContent>
              <Alert severity='warning'>
                この提出記録と関連する判定修正履歴を完全に削除します。この操作は取り消せません。
              </Alert>
              {actionError && <Alert severity='error' sx={{ mt: 2 }}>{actionError}</Alert>}
            </DialogContent>
            <DialogActions>
              <Button disabled={acting} onClick={() => setDeleting(null)}>キャンセル</Button>
              <Button color='error' variant='contained' disabled={acting} onClick={runDelete}>削除する</Button>
            </DialogActions>
          </Dialog>
        </>}
      </Box>
    </BasicLayout>
  </>
}

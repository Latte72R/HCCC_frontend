import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import {
  Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, IconButton, MenuItem, Paper, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material'
import { useState } from 'react'

import AppLink from '@/components/atoms/AppLink'
import {
  createAdminProblem, deleteAdminProblem, getAdminProblem,
  updateAdminProblem, useAdminProblems,
} from '@/features/api'
import { AdminProblem, ProblemInput } from '@/features/types'

const testTargets = ['ExitCode', 'StdOut', 'NoTestCase']

const emptyInput: ProblemInput = {
  title: '',
  statement: '',
  code: '',
  inputDesc: '',
  outputDesc: '',
  testTarget: 'ExitCode',
  score: 100,
  isWrongCode: false,
  errorLineNumber: null,
  testcases: [{ input: '', expect: '' }],
}

export default function ProblemManager() {
  const { data, isLoading, refresh } = useAdminProblems()
  const [editingId, setEditingId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [input, setInput] = useState<ProblemInput>(emptyInput)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<AdminProblem | null>(null)
  const [actionError, setActionError] = useState('')

  const openCreate = () => {
    setEditingId(null)
    setInput(emptyInput)
    setSaveError('')
    setCreating(true)
  }

  const openEdit = async (row: AdminProblem) => {
    setActionError('')
    try {
      const detail = await getAdminProblem(row.id)
      setEditingId(row.id)
      setInput({
        title: detail.title,
        statement: detail.statement,
        code: detail.code,
        inputDesc: detail.inputDesc ?? '',
        outputDesc: detail.outputDesc ?? '',
        testTarget: detail.testTarget,
        score: detail.score,
        isWrongCode: detail.isWrongCode,
        errorLineNumber: detail.errorLineNumber,
        testcases: detail.testcases.length > 0
          ? detail.testcases.map((t) => ({ input: t.input ?? '', expect: t.expect ?? '' }))
          : [{ input: '', expect: '' }],
      })
      setSaveError('')
      setCreating(true)
    } catch {
      setActionError('問題を取得できませんでした。')
    }
  }

  const save = async () => {
    setSaving(true)
    setSaveError('')
    try {
      const payload: ProblemInput = {
        ...input,
        inputDesc: input.inputDesc || null,
        outputDesc: input.outputDesc || null,
        errorLineNumber: input.errorLineNumber,
        testcases: input.testTarget === 'NoTestCase' ? [] : input.testcases,
      }
      if (editingId === null) {
        await createAdminProblem(payload)
      } else {
        await updateAdminProblem(editingId, payload)
      }
      await refresh()
      setCreating(false)
    } catch {
      setSaveError('保存できませんでした。入力内容を確認してください。')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!deleting) return
    setSaving(true)
    try {
      await deleteAdminProblem(deleting.id)
      await refresh()
      setDeleting(null)
    } catch {
      setActionError('削除できませんでした。')
    } finally {
      setSaving(false)
    }
  }

  const set = <K extends keyof ProblemInput>(key: K, value: ProblemInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }))

  return <>
    <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 2 }}>
      <Typography color='text.secondary'>
        テストケースの編集ができます。提出時に参加者がアーキテクチャ（x86-64 / RISC-V）を選べます。削除すると提出も一緒に消えます。
      </Typography>
      <Button variant='contained' startIcon={<AddIcon />} onClick={openCreate}>新規作成</Button>
    </Stack>
    {actionError && <Alert severity='error' sx={{ mb: 2 }}>{actionError}</Alert>}
    <Paper variant='outlined' sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer><Table size='small'>
        <TableHead sx={{ bgcolor: '#f6f8fb' }}><TableRow>
          <TableCell>ID</TableCell><TableCell>タイトル</TableCell>
          <TableCell>判定方式</TableCell><TableCell>配点</TableCell><TableCell>ケース数</TableCell><TableCell>操作</TableCell>
        </TableRow></TableHead>
        <TableBody>{(data ?? []).map((row) => <TableRow key={row.id} hover>
          <TableCell>{row.id}</TableCell>
          <TableCell><AppLink href={`/problems/${row.id}`}>{row.title}</AppLink>{row.isWrongCode && <Chip size='small' label='ひっかけ' sx={{ ml: 1 }} />}</TableCell>
          <TableCell>{row.testTarget}</TableCell>
          <TableCell>{row.score}</TableCell>
          <TableCell>{row.testcaseCount}</TableCell>
          <TableCell>
            <IconButton size='small' onClick={() => openEdit(row)} aria-label='編集'><EditIcon fontSize='small' /></IconButton>
            <IconButton size='small' onClick={() => setDeleting(row)} aria-label='削除'><DeleteIcon fontSize='small' /></IconButton>
          </TableCell>
        </TableRow>)}</TableBody>
      </Table></TableContainer>
      {!isLoading && (data ?? []).length === 0 && <Typography color='text.secondary' align='center' sx={{ p: 4 }}>問題がありません。</Typography>}
    </Paper>

    <Dialog open={creating} onClose={() => !saving && setCreating(false)} fullWidth maxWidth='md'>
      <DialogTitle>{editingId === null ? '問題を新規作成' : `問題 #${editingId} を編集`}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField fullWidth label='タイトル' value={input.title} onChange={(e) => set('title', e.target.value)} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select fullWidth label='判定方式' value={input.testTarget} onChange={(e) => set('testTarget', e.target.value)}>
              {testTargets.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField fullWidth type='number' label='配点' value={input.score} onChange={(e) => set('score', Number(e.target.value))} />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems='center'>
            <FormControlLabel control={<Checkbox checked={input.isWrongCode} onChange={(e) => set('isWrongCode', e.target.checked)} />} label='ひっかけ問題（コンパイルエラーが正解）' />
            <TextField type='number' label='エラー行番号' value={input.errorLineNumber ?? ''} onChange={(e) => set('errorLineNumber', e.target.value === '' ? null : Number(e.target.value))} disabled={!input.isWrongCode} />
          </Stack>
          <TextField fullWidth multiline minRows={4} label='問題文' value={input.statement} onChange={(e) => set('statement', e.target.value)} />
          <TextField fullWidth multiline minRows={4} label='Cコード' value={input.code} onChange={(e) => set('code', e.target.value)} sx={{ '& textarea': { fontFamily: 'monospace' } }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField fullWidth multiline minRows={2} label='入力の説明' value={input.inputDesc ?? ''} onChange={(e) => set('inputDesc', e.target.value)} />
            <TextField fullWidth multiline minRows={2} label='出力の説明' value={input.outputDesc ?? ''} onChange={(e) => set('outputDesc', e.target.value)} />
          </Stack>
          <Box>
            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 1 }}>
              <Typography variant='subtitle1' fontWeight={700}>テストケース</Typography>
              <Button size='small' startIcon={<AddIcon />} onClick={() => set('testcases', [...input.testcases, { input: '', expect: '' }])}>追加</Button>
            </Stack>
            {input.testTarget === 'NoTestCase'
              ? <Typography variant='body2' color='text.secondary'>判定方式が NoTestCase のためテストケースは不要です。</Typography>
              : input.testcases.map((t, i) => <Stack key={i} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField size='small' fullWidth label={`入力 #${i + 1}`} value={t.input ?? ''} onChange={(e) => set('testcases', input.testcases.map((c, j) => j === i ? { ...c, input: e.target.value } : c))} />
                <TextField size='small' fullWidth label={`期待値 #${i + 1}`} value={t.expect ?? ''} onChange={(e) => set('testcases', input.testcases.map((c, j) => j === i ? { ...c, expect: e.target.value } : c))} />
                <IconButton size='small' onClick={() => set('testcases', input.testcases.filter((_, j) => j !== i))} aria-label='ケース削除'><DeleteIcon fontSize='small' /></IconButton>
              </Stack>)}
          </Box>
          {saveError && <Alert severity='error'>{saveError}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={() => setCreating(false)}>キャンセル</Button>
        <Button variant='contained' disabled={saving} onClick={save}>保存する</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={Boolean(deleting)} onClose={() => !saving && setDeleting(null)} maxWidth='xs' fullWidth>
      <DialogTitle>問題 #{deleting?.id} を削除</DialogTitle>
      <DialogContent>
        <Typography variant='body2'>「{deleting?.title}」を削除します。この問題への提出も一緒に消え、元に戻せません。</Typography>
      </DialogContent>
      <DialogActions>
        <Button disabled={saving} onClick={() => setDeleting(null)}>キャンセル</Button>
        <Button variant='contained' color='error' disabled={saving} onClick={remove}>削除する</Button>
      </DialogActions>
    </Dialog>
  </>
}

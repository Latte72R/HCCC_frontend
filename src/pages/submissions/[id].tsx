import { Typography, Box, Alert, AlertTitle, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from '@mui/material'
import Error from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useSWRConfig } from 'swr'

import Loading from '@/components/atoms/Loading'
import { useAuthContext } from '@/components/contexts/AuthProvider'
import SubmissionResultTable from '@/components/molecules/SubmissionResultTable'
import AssemblyError from '@/components/organisms/submission/AssemblyError'
import SubmitSourceCode from '@/components/organisms/submission/SubmitSourceCode'
import BasicLayout from '@/components/templates/BasicLayout'
import { correctAdminJudgement, useSubmission } from '@/features/api'
import { SubmissionJoinedUserResponse } from '@/features/types'

const Submission = () => {
  const router = useRouter()
  const { id } = router.query
  const { isAdmin } = useAuthContext()
  const { mutate } = useSWRConfig()
  const [editing, setEditing] = useState(false)
  const [result, setResult] = useState('AC')
  const [errorMessage, setErrorMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const { submissionResponse, isLoading, isError } = useSubmission(Number(id), {
    refreshInterval: (latest?: SubmissionJoinedUserResponse) =>
      !latest || latest.submission?.result === 'Pending' ? 2000 : 0,
  })

  useEffect(() => {
    if (submissionResponse?.status === 'login-required') {
      router.push('/login')
    }
  }, [submissionResponse?.status, router])

  if (isError) {
    return <Error statusCode={isError.status} title={isError.message} />
  }

  if (
    isLoading ||
    !submissionResponse ||
    submissionResponse.status === 'login-required'
  ) {
    return <Loading />
  }

  if (submissionResponse.status === 'ng') {
    return <Error statusCode={0} title={submissionResponse.errorMessage} />
  }

  const openEditor = () => {
    setResult(submissionResponse.submission.result)
    setErrorMessage(submissionResponse.submission.error_message)
    setSaveError('')
    setEditing(true)
  }

  const saveCorrection = async () => {
    setSaving(true)
    setSaveError('')
    try {
      await correctAdminJudgement(submissionResponse.submission.id, result, errorMessage)
      await mutate(`/api/submissions/${submissionResponse.submission.id}`)
      setEditing(false)
    } catch {
      setSaveError('修正を保存できませんでした。')
    } finally {
      setSaving(false)
    }
  }

  return (
    <BasicLayout>
      <Head>
        <title>submissions | HCCC</title>
        <meta name='description' content='人間Cコンパイラーコンテスト' />
      </Head>
      <Typography variant='h3' sx={{ fontWeight: '600' }}>
        Submission #{submissionResponse.submission.id}
      </Typography>
      {isAdmin && <Button variant='outlined' onClick={openEditor} sx={{ mt: 2 }}>判定を修正</Button>}
      {submissionResponse.status === 'forbidden' ? (
        <Alert severity='error' sx={{ my: '5rem' }}>
          <AlertTitle>{submissionResponse.errorMessage}</AlertTitle>
        </Alert>
      ) : (
        <Box>
          {/* 正常時の表示 */}
          <SubmitSourceCode
            submission={submissionResponse.submission}
            sx={{ m: '4rem 0' }}
          />
          {submissionResponse.submission.error_message && (
            <AssemblyError
              result={submissionResponse.submission.result}
              errorMessage={submissionResponse.submission.error_message}
              sx={{
                mt: '2rem',
              }}
            />
          )}

          <SubmissionResultTable submission={submissionResponse.submission} />
        </Box>
      )}
      <Dialog open={editing} onClose={() => !saving && setEditing(false)} fullWidth maxWidth='sm'>
        <DialogTitle>判定を修正</DialogTitle>
        <DialogContent>
          <TextField select fullWidth label='判定結果' value={result} onChange={(event) => setResult(event.target.value)} sx={{ mt: 1, mb: 2 }}>
            {['AC', 'WA', 'WC', 'AE', 'LE', 'RE', 'TLE', 'Pending', 'SystemError'].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
          </TextField>
          <TextField fullWidth multiline minRows={3} label='エラーメッセージ' value={errorMessage} onChange={(event) => setErrorMessage(event.target.value)} inputProps={{ maxLength: 10000 }} />
          {saveError && <Alert severity='error' sx={{ mt: 2 }}>{saveError}</Alert>}
        </DialogContent>
        <DialogActions><Button disabled={saving} onClick={() => setEditing(false)}>キャンセル</Button><Button variant='contained' disabled={saving} onClick={saveCorrection}>保存する</Button></DialogActions>
      </Dialog>
    </BasicLayout>
  )
}

export default Submission

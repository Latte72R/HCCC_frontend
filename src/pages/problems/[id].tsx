import { Typography, Box, Alert, AlertTitle } from '@mui/material'
import Error from 'next/error'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import Code from '@/components/atoms/Code'
import Loading from '@/components/atoms/Loading'
import TitleLabel from '@/components/atoms/TitleLabel'
import { useAuthContext } from '@/components/contexts/AuthProvider'
import SubmitSection from '@/components/organisms/problem/SubmitSection'
import BasicLayout from '@/components/templates/BasicLayout'
import {
  useProblem,
  requestSubmission,
  useSubmissionList,
} from '@/features/api'
import { SubmissionPost } from '@/features/types'
import { SubmitFormSchema } from '@/features/yupSchema'

const Problem = () => {
  const router = useRouter()
  const { id } = router.query
  const { user } = useAuthContext()

  const { problemResponse, isError: isProblemError } = useProblem(Number(id))
  const { submissionListResponse, isError: isSubmissionError } =
    useSubmissionList(user?.id)

  const [errorMessage, setErrorMessage] = useState('')
  const [isPostLoading, setIsPostLoading] = useState(false)

  useEffect(() => {
    if (problemResponse?.status === 'login-required') {
      router.push('/login')
      return
    }
  }, [router, problemResponse?.status])

  const onSubmit = async (data: SubmitFormSchema) => {
    setIsPostLoading(true)

    const param: SubmissionPost = {
      asm: data.asm || '',
      arch: data.arch,
      isCE: false,
    }
    const res = await requestSubmission(Number(id), param)

    if (res.status === 'ng') {
      setErrorMessage(res.errorMessage)
      setIsPostLoading(false)
      return
    }

    setIsPostLoading(false)
    await router.push(`/submissions/${res.submission.id}/`)
  }

  if (isProblemError) {
    return (
      <Error
        statusCode={isProblemError.status}
        title={isProblemError.message}
      />
    )
  }

  if (isSubmissionError) {
    return (
      <Error
        statusCode={isSubmissionError.status}
        title={isSubmissionError.message}
      />
    )
  }

  if (
    !problemResponse ||
    problemResponse.status === 'login-required' ||
    !submissionListResponse ||
    submissionListResponse.status === 'login-required'
  ) {
    return <Loading />
  }

  if (problemResponse.status === 'ng') {
    return <Error statusCode={0} title={problemResponse.errorMessage} />
  }

  const problem = problemResponse.problem

  return (
    <BasicLayout>
      <Head>
        <title>problem {problem.title} | HCCC</title>
        <meta name='description' content='人間Cコンパイラーコンテスト' />
      </Head>

      {problemResponse.status === 'forbidden' ? (
        <Alert severity='error' sx={{ my: '5rem' }}>
          <AlertTitle>{problemResponse.errorMessage}</AlertTitle>
        </Alert>
      ) : (
        <Box>
          <Typography variant='h3' sx={{ fontWeight: '600' }}>
            {problem.title}
          </Typography>
          <Typography variant='h6' sx={{ my: '2rem' }}>
            TimeLimit 2sec / Score {problem.score}
          </Typography>

          <Box sx={{ m: '2rem 0 3rem' }}>
            <TitleLabel label='Problem' sx={{ mb: '2rem' }} />
            <Typography variant='h6' sx={{ p: '1rem' }}>
              {problem.statement}
            </Typography>
          </Box>

          <Box sx={{ m: '3rem 0' }}>
            <TitleLabel label='Source Code' sx={{ mb: '2rem' }} />
            <Box sx={{ fontSize: '1.2rem' }}>
              <Code language='c'>{problem.code}</Code>
            </Box>
          </Box>

          <Box sx={{ m: '3rem 0' }}>
            <TitleLabel label='Input' sx={{ mb: '2rem' }} />
            <Typography variant='h6' sx={{ p: '1rem' }}>
              {problem.input_desc}
            </Typography>
          </Box>

          <Box sx={{ m: '3rem 0' }}>
            <TitleLabel label='Output' sx={{ mb: '2rem' }} />
            <Typography variant='h6'>{problem.output_desc}</Typography>
          </Box>

          <SubmitSection
            onSubmit={onSubmit}
            errorMessage={errorMessage}
            sx={{ m: '3rem 0' }}
          />
        </Box>
      )}

      {isPostLoading && <Loading />}
    </BasicLayout>
  )
}

export default Problem

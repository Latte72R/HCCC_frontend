import useSWR from 'swr'

import { UNEXPECTED_NETWORK_ERROR_STATUS } from '@/features/const'
import { NetworkError } from '@/features/errors'
import {
  UserPost,
  UserResponse,
  ResponseBase,
  ProblemListResponse,
  ProblemResponse,
  RankingResponse,
  SubmissionPost,
  SubmissionJoinedUserResponse,
  SubmissionJoinedUserListResponse,
  AdminOverview,
  ContestPeriod,
  AdminProblem,
  AdminProblemDetail,
  ProblemInput,
} from '@/features/types'

const Fetcher = async (path: string, options?: RequestInit): Promise<any> => {
  let res
  try {
    res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || '/api/backend'}${path}`, {
      ...options,
      credentials: 'include',
    })
  } catch (e: unknown) {
    // エラーログの出力
    console.error(e)

    if (e instanceof Error) {
      throw new NetworkError(e.message, UNEXPECTED_NETWORK_ERROR_STATUS)
    }

    throw new NetworkError('unexpected error', UNEXPECTED_NETWORK_ERROR_STATUS)
  }

  if (!res.ok) {
    /* 通信が完了したが、正しいリクエストではなかった場合のエラー（ステータスコードが2xxではない) */
    const error = new NetworkError(
      'An error occurred while fetching the data.',
      res.status,
    )
    throw error
  }

  return res.json()
}

export const useMe = () => {
  const { data, error } = useSWR<UserResponse, NetworkError>(
    `/api/users/me`,
    Fetcher,
    { revalidateOnFocus: false },
  )

  return {
    userResponse: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useAdminOverview = () => {
  const { data, error, isLoading, mutate } = useSWR<AdminOverview, NetworkError>(
    '/api/admin/overview',
    Fetcher,
    { refreshInterval: 15000 },
  )
  return { data, error, isLoading, refresh: mutate }
}

export const correctAdminJudgement = async (
  id: number,
  result: string,
  errorMessage: string,
): Promise<ResponseBase> => Fetcher(`/api/admin/submissions/${id}/judgement`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ result, errorMessage }),
})

export const rejudgeAdminSubmission = async (id: number): Promise<ResponseBase> =>
  Fetcher(`/api/admin/submissions/${id}/rejudge`, { method: 'POST' })

export const deleteAdminSubmission = async (id: number): Promise<ResponseBase> =>
  Fetcher(`/api/admin/submissions/${id}`, { method: 'DELETE' })

export const useContestPeriod = () => {
  const { data, error, isLoading, mutate } = useSWR<ContestPeriod, NetworkError>(
    '/api/admin/contest',
    Fetcher,
  )
  return { data, error, isLoading, refresh: mutate }
}

/** Public contest schedule (no login required). Falls back to build-time env. */
export const usePublicContestPeriod = () => {
  const { data, error } = useSWR<ContestPeriod, NetworkError>(
    '/api/contest/period',
    Fetcher,
  )
  const begin = data?.begin || process.env.NEXT_PUBLIC_CONTEST_BEGIN || ''
  const end = data?.end || process.env.NEXT_PUBLIC_CONTEST_END || ''
  return {
    begin: new Date(begin),
    end: new Date(end),
    eventName: data?.eventName || '',
    isLoading: !error && !data,
  }
}

export const updateContestPeriod = async (
  begin: string,
  end: string,
  eventName: string,
): Promise<ResponseBase> => Fetcher('/api/admin/contest', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ begin, end, eventName }),
})

export const useAdminProblems = () => {
  const { data, error, isLoading, mutate } = useSWR<AdminProblem[], NetworkError>(
    '/api/admin/problems',
    Fetcher,
  )
  return { data, error, isLoading, refresh: mutate }
}

export const getAdminProblem = (id: number): Promise<AdminProblemDetail> =>
  Fetcher(`/api/admin/problems/${id}`)

export const createAdminProblem = async (
  input: ProblemInput,
): Promise<{ status: string; id: number }> => Fetcher('/api/admin/problems', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(input),
})

export const updateAdminProblem = async (
  id: number,
  input: ProblemInput,
): Promise<ResponseBase> => Fetcher(`/api/admin/problems/${id}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(input),
})

export const deleteAdminProblem = async (id: number): Promise<ResponseBase> =>
  Fetcher(`/api/admin/problems/${id}`, { method: 'DELETE' })

export const useProblemList = () => {
  const { data, error } = useSWR<ProblemListResponse, NetworkError>(
    `/api/problems`,
    Fetcher,
  )

  return {
    problemListResponse: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useProblem = (id: number) => {
  const { data, error } = useSWR<ProblemResponse, NetworkError>(
    `/api/problems/${id}`,
    Fetcher,
  )

  return {
    problemResponse: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useSubmissionList = (userID?: number, options?: any) => {
  const url =
    userID === undefined || isNaN(userID)
      ? `/api/submissions`
      : `/api/submissions?user_id=${userID}`
  const { data, error } = useSWR<
    SubmissionJoinedUserListResponse,
    NetworkError
  >(url, Fetcher, options)

  return {
    submissionListResponse: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useSubmission = (id: number, options?: any) => {
  const { data, error } = useSWR<SubmissionJoinedUserResponse, NetworkError>(
    !isNaN(id) && `/api/submissions/${id}`,
    Fetcher,
    options,
  )

  return {
    submissionResponse: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const useRanking = () => {
  const { data, error } = useSWR<RankingResponse, NetworkError>(
    `/api/ranking`,
    Fetcher,
  )

  return {
    rankingResponse: data,
    isLoading: !error && !data,
    isError: error,
  }
}

export const requestLogin = async (data: UserPost): Promise<UserResponse> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }
  return await Fetcher(`/api/login`, options)
}

export const requestRegister = async (
  data: UserPost,
): Promise<UserResponse> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }
  return await Fetcher(`/api/register`, options)
}

export const requestLogout = async (): Promise<ResponseBase> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  }
  return await Fetcher(`/api/logout`, options)
}

export const requestSubmission = async (
  id: number,
  data: SubmissionPost,
): Promise<SubmissionJoinedUserResponse> => {
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }
  return await Fetcher(`/api/problems/${id}/submissions`, options)
}

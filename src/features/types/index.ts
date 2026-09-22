export type ResponseBase = {
  status: 'ok' | 'ng' | 'login-required' | 'forbidden'
  errorMessage: string
}

export type UserPost = {
  name: string
  password: string
}

export type User = {
  id: number
  name: string
}

export type UserResponse = ResponseBase & {
  user?: User
  isAdmin?: boolean
}

export type AdminOverview = {
  users: number
  problems: number
  submissions: number
  pending: number
  accepted: number
  recentSubmissions: {
    id: number
    userName: string
    problemTitle: string
    result: string
    errorMessage: string
    submittedAt: string
  }[]
}

export type ContestPeriod = {
  begin: string
  end: string
}

export type Problem = {
  id: number
  title: string
  statement: string
  code: string
  input_desc: string
  output_desc: string
  score: number
}

export type ProblemResponse = ResponseBase & {
  problem: Problem
}

export type ProblemListResponse = ResponseBase & {
  items: Problem[]
}

export type Ranking = {
  rank: number
  userName: string
  score: number
}

export type RankingResponse = ResponseBase & {
  items: Ranking[]
}

export type Submission = {
  id: number
  time: string
  asm: string
  result: string
  error_message: string
  isCE: boolean
  error_line_number?: number | null
}

export type SubmissionJoined = Submission & {
  user: User
  problem: Problem
}

export type SubmissionJoinedUserResponse = ResponseBase & {
  submission: SubmissionJoined
}

export type SubmissionJoinedUserListResponse = ResponseBase & {
  items: SubmissionJoined[]
}

export type SubmissionPost = {
  asm: string
  isCE: boolean
  error_line_number?: number
}

export type ProblemCardStatus = 'ac' | 'wc' | 'error' | 'notSolved'

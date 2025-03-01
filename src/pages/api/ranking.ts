import type { NextApiRequest, NextApiResponse } from 'next'
import { RankingResponse, SubmissionJoined } from '@/features/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RankingResponse>,
) {
  // reqヘッダーから絶対URLを作成
  const protocol = req.headers['x-forwarded-proto'] ? 'https' : 'http'
  const host = req.headers.host
  const baseUrl = `${protocol}://${host}`

  // All submits ページで利用している提出データ API から取得
  const submissionsRes = await fetch(`${baseUrl}/api/submissions`)
  if (!submissionsRes.ok) {
    return res.status(500).json({
      status: 'ng',
      errorMessage: '提出データの取得に失敗しました。',
      items: [],
    })
  }
  const submissions: SubmissionJoined[] = await submissionsRes.json()

  // ユーザーごと、さらに問題ごとにグループ化
  const userMap = new Map<
    number,
    { userName: string; problems: Map<number, SubmissionJoined[]> }
  >()

  submissions.forEach((submission) => {
    const userId = submission.user.id
    if (!userMap.has(userId)) {
      userMap.set(userId, {
        userName: submission.user.name,
        problems: new Map<number, SubmissionJoined[]>(),
      })
    }
    const userEntry = userMap.get(userId)!
    const problemId = submission.problem.id
    if (!userEntry.problems.has(problemId)) {
      userEntry.problems.set(problemId, [])
    }
    userEntry.problems.get(problemId)!.push(submission)
  })

  // 各ユーザーの得点を計算
  const rankingItems: { userName: string; score: number }[] = []
  userMap.forEach(({ userName, problems }) => {
    let totalScore = 0
    problems.forEach((subs) => {
      // 提出時刻順にソート（timeは ISO 8601 と仮定）
      subs.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
      // 最初のAC提出を探す
      const firstACIndex = subs.findIndex((s) => s.result === 'AC')
      if (firstACIndex === -1) {
        // ACしていない場合は得点なし
        return
      }
      // AC前の誤答数
      const wrongSubmissions = subs.slice(0, firstACIndex)
      const penalty = wrongSubmissions.length
      // WCが1件でもある場合はその問題の得点は0
      const hasWC = wrongSubmissions.some((s) => s.result === 'WC')
      const problemScore = subs[0].problem.score
      const earned = hasWC ? 0 : Math.max(problemScore - penalty, 0)
      totalScore += earned
    })
    rankingItems.push({ userName, score: totalScore })
  })

  // 得点順にソート
  rankingItems.sort((a, b) => b.score - a.score)

  const data: RankingResponse = {
    status: 'ok',
    errorMessage: '',
    items: rankingItems.map((user, index) => ({
      rank: index + 1,
      userName: user.userName,
      score: user.score,
    })),
  }

  res.status(200).json(data)
}

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { Box, Typography, Link } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { FC } from 'react'
import { usePublicContestPeriod } from '@/features/api'
import { formatPeriodRange } from '@/features/utils'

import TextWithIcon from '@/components/atoms/TextWithIcon'

type ScheduleProps = {
  sx?: SxProps<Theme>
}

const Schedule: FC<ScheduleProps> = ({ sx }) => {
  const { begin, end, eventName } = usePublicContestPeriod()
  return (
    <Box sx={{ ...sx }}>
      <TextWithIcon>
        <CalendarMonthIcon
          sx={{ width: '60px', height: '60px', marginRight: '1rem' }}
        />
        <Typography variant='h3'>Schedule</Typography>
      </TextWithIcon>

      <Box sx={{ width: { xs: '90%', md: '600px' }, m: '3rem auto' }}>
        <Typography variant='h4' align='center'>
          {formatPeriodRange(begin, end)}
        </Typography>
        <Typography variant='h6' sx={{ m: '2rem 0 1rem' }}>
          人間Cコンパイラコンテストは{eventName || 'KCS 夏合宿'}にて開催されます.
          このイベントに関する質問がある場合は Latte72 までお願いします．
        </Typography>
      </Box>
    </Box>
  )
}

export default Schedule

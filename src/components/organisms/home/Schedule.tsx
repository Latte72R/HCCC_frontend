import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import { Box, Typography, Link } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { FC } from 'react'

import TextWithIcon from '@/components/atoms/TextWithIcon'

type ScheduleProps = {
  sx?: SxProps<Theme>
}

const Schedule: FC<ScheduleProps> = ({ sx }) => {
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
          2025年3月7日(土) 13:00 〜
        </Typography>
        <Typography variant='h6' sx={{ m: '2rem 0 1rem' }}>
          人間Cコンパイラコンテストは KCS 2024 春合宿 にて開催されます.
          このイベントに関する質問がある場合は Latte72 までお願いします．
        </Typography>
      </Box>
    </Box>
  )
}

export default Schedule

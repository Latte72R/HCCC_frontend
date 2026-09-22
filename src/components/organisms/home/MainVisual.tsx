import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import Image from 'next/image'
import { FC } from 'react'
import { usePublicContestPeriod } from '@/features/api'
import { formatPeriodRange } from '@/features/utils'

type MainVisualProps = {
  sx?: SxProps<Theme>
}

const MainVisual: FC<MainVisualProps> = ({ sx }) => {
  const { begin, end, eventName } = usePublicContestPeriod()
  return (
    <Box
      sx={{
        height: '500px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: "url('/HomeBack.jpg')",
        ...sx,
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: '90%', md: '1000px' },
          bgcolor: 'primary.main',
          color: 'white',
          p: { xs: '2rem', md: '4rem' },
          opacity: 0.8,
          display: 'flex',
          borderRadius: '1rem',
        }}
      >
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Image
            src='/HCCC_logo.png'
            width={200}
            height={200}
            alt='HCCC Logo'
          />
        </Box>

        <Box sx={{ p: '1rem' }}>
          <Typography
            component='div'
            align='center'
            sx={{
              width: { xs: undefined, md: '600px' },
              fontSize: '2.2rem',
              fontWeight: '800',
              paddingBottom: '3rem',
              color: '#ffe0b2',
            }}
          >
            HCCC / 人間 Cコンパイラコンテスト
          </Typography>

          <Typography
            variant='h5'
            component='div'
            align='center'
            sx={{
              fontWeight: '700',
              maxWidth: '600px',
            }}
          >
            Day: {formatPeriodRange(begin, end)}
          </Typography>
          {eventName && (
            <Typography
              variant='h6'
              component='div'
              align='center'
              sx={{
                fontWeight: '700',
                pt: '0.5rem',
                maxWidth: '600px',
              }}
            >
              For {eventName}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default MainVisual

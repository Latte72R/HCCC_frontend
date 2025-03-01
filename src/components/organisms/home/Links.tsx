import { Box, Typography } from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import { FC } from 'react'

type LinksProps = {
  sx?: SxProps<Theme>
}

const Links: FC<LinksProps> = ({ sx }) => {
  return (
    <Box
      sx={{
        ...sx,
      }}
    >
      <Typography
        variant='h3'
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontWeight: '600',
          mb: '5rem',
          '&::before, &::after': {
            content: '""',
            display: 'block',
            maxWidth: '5rem',
            borderTop: 'solid 2px',
            flexGrow: 1,
          },
          '&::before': {
            mr: '2rem',
          },
          '&::after': {
            ml: '2rem',
          },
        }}
      >
        Links
      </Typography>

      <Box
        sx={{
          lineHeight: '1.5rem',
          backgroundColor: 'rgba(0, 0, 0, .03)',
          p: { xs: '1rem', md: '3rem' },
          borderRadius: '10px',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            wordBreak: 'break-word',
          }}
        >
          <ul>
            <li>
              プロジェクトのリポジトリ:
              <a
                href='https://github.com/Alignof/Human_C_Compiler_Contest'
                target='_blank'
                rel='noreferrer'
              >
                https://github.com/Alignof/Human_C_Compiler_Contest
              </a>
            </li>
            <li>
              チュートリアル:
              <a
                href='https://github.com/Alignof/HCCC_Tutorial'
                target='_blank'
                rel='noreferrer'
              >
                https://github.com/Alignof/HCCC_Tutorial
              </a>
            </li>
            <li>
              KCS HP:
              <a
                href='https://www.kcs1959.jp/'
                target='_blank'
                rel='noreferrer'
              >
                https://www.kcs1959.jp/
              </a>
            </li>
            <li>
              Latte72 HP:
              <a
                href='https://latte72.net/'
                target='_blank'
                rel='noreferrer'
              >
                https://latte72.net/
              </a>
            </li>
          </ul>
        </Typography>
      </Box>
    </Box>
  )
}

export default Links

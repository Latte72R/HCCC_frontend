import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import HelpIcon from '@mui/icons-material/Help'
import {
  Box,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import type { SxProps, Theme } from '@mui/material/styles'
import { FC } from 'react'

type QandAProps = {
  sx?: SxProps<Theme>
}

const QandA: FC<QandAProps> = ({ sx }) => {
  return (
    <Box sx={sx}>
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
        Q&A
      </Typography>

      <Accordion>
        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HelpIcon color='secondary' sx={{ mr: '1rem' }} />
          競技で使用できるCのバージョン, アーキテクチャを教えてください
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          C99 を採用しています．アーキテクチャは提出時に x86-64 / RISC-V から選択します．
          x86-64 は AMD64 ABI，RISC-V は RISC-V ELF psABI に従います．
        </StyledAccordionDetails>
      </Accordion>

      <Accordion>
        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HelpIcon color='secondary' sx={{ mr: '1rem' }} />
          AT&T記法とIntel記法のどちらも使えますか?
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          使えます.お好きな方で記述してください.
        </StyledAccordionDetails>
      </Accordion>

      <Accordion>
        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HelpIcon color='secondary' sx={{ mr: '1rem' }} />
          コンパイラを自作して使用しても良いですか？
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          今回は任意のコンパイラの使用を禁止しています.
          ですが,将来的に自作コンパイラを使った別の方向性のコンテストも考えています.
        </StyledAccordionDetails>
      </Accordion>

      <Accordion>
        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HelpIcon color='secondary' sx={{ mr: '1rem' }} />
          コンテスト中にWebページを閲覧しても良いですか？
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <a
            href='https://www.open-std.org/JTC1/SC22/WG14/www/docs/n1256.pdf'
            target='_blank'
            rel='noreferrer'
          >
            C99規格書
          </a>
          ,{' '}
          <a
            href='https://uclibc.org/docs/psABI-x86_64.pdf'
            target='_blank'
            rel='noreferrer'
          >
            System V Application Binary
          </a>
          ,{" "}
          <a
            href='https://github.com/Alignof/HCCC_Tutorial/'
            target='_blank'
            rel='noreferrer'
          >
            HCCCチュートリアル
          </a>
          ,{" "}
          <a
            href='https://speakerdeck.com/latte72/x86-64-assembly-essentials'
            target='_blank'
            rel='noreferrer'
          >
            x86-64 Assembly Essentials
          </a>
          を除き禁止しています.
        </StyledAccordionDetails>
      </Accordion>

      <Accordion>
        <StyledAccordionSummary expandIcon={<ExpandMoreIcon />}>
          <HelpIcon color='secondary' sx={{ mr: '1rem' }} />
          悪意のあるコードを提出しても良いですか？
        </StyledAccordionSummary>
        <StyledAccordionDetails>悪意のあるコードの提出は禁止されています.</StyledAccordionDetails>
      </Accordion>
    </Box>
  )
}

const StyledAccordionSummary = styled(AccordionSummary)({
  padding: '1rem',
  backgroundColor: 'rgba(0, 0, 0, .03)',
})

const StyledAccordionDetails = styled(AccordionDetails)({
  padding: '2rem 1rem',
})

export default QandA

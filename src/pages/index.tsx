import Container from '@mui/material/Container'
import type { NextPage } from 'next'
import Head from 'next/head'

import HCCCTarget from '@/components/organisms/home/HCCCTarget'
import JoinCondition from '@/components/organisms/home/JoinCondition'
import Links from '@/components/organisms/home/Links'
import MainVisual from '@/components/organisms/home/MainVisual'
import QandA from '@/components/organisms/home/QandA'
import Regulation from '@/components/organisms/home/Regulation'
import Schedule from '@/components/organisms/home/Schedule'
import WhatHCCC from '@/components/organisms/home/WhatHCCC'
import BasicLayout from '@/components/templates/BasicLayout'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Home | HCCC</title>
        <meta name='description' content='人間Cコンパイラーコンテスト' />
      </Head>

      <BasicLayout isHome>
        <MainVisual />
        <Container
          maxWidth='lg'
          sx={{
            p: '2rem 0.5rem 4rem',
          }}
        >
          <WhatHCCC sx={{ my: { xs: '2.5rem', md: '4rem' } }} />
          <HCCCTarget sx={{ mb: { xs: '2.5rem', md: '4rem' } }} />
          <Schedule sx={{ m: '4rem 0' }} />
          <JoinCondition sx={{ m: '3rem 0 4rem' }} />
          <Regulation />
          <QandA sx={{ m: '4rem 0 2rem' }} />
          <Links sx={{ m: '4rem 0 2rem' }} />
        </Container>
      </BasicLayout>
    </>
  )
}

export default Home

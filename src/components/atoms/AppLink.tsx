import MuiLink from '@mui/material/Link'
import type { LinkProps as MuiLinkProps } from '@mui/material/Link'
import Link from 'next/link'
import { FC, ReactNode } from 'react'

type AppLinkProps = {
  href: string
  children?: ReactNode
  sx?: MuiLinkProps['sx']
}

/** Site-wide link: inherits surrounding text color with underline on hover. */
const AppLink: FC<AppLinkProps> = ({ href, children, sx }) => {
  return (
    <MuiLink
      component={Link}
      href={href}
      sx={{
        color: 'inherit',
        textDecoration: 'none',
        '&:hover': { textDecoration: 'underline' },
        ...sx,
      }}
    >
      {children}
    </MuiLink>
  )
}

export default AppLink

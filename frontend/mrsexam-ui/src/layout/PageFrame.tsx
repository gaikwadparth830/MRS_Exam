import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

type PageFrameProps = {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export const PageFrame = ({
  title,
  description,
  actions,
  children,
}: PageFrameProps) => {
  return (
    <Stack spacing={2.5}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          alignItems: { xs: 'flex-start', md: 'flex-end' },
          pb: 0.5,
          borderBottom: '1px solid rgba(11, 79, 108, 0.12)',
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {actions ? <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box> : null}
      </Box>
      {children}
    </Stack>
  )
}

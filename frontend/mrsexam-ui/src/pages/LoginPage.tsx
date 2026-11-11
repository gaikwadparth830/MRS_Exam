import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import monoLogo from '../assets/MONO.png'
import { usePost } from '../hooks'

type LoginRequest = {
  userId: string
  password: string
}

type LoginResponse = {
  success?: boolean
  token?: string
  accessToken?: string
  userKey?: string
  userId?: string
  isSupervisor?: boolean
  message?: string
}

type LoginPageProps = {
  onLoginSuccess: () => void
}

const ACCESS_TOKEN_KEY = 'accessToken'
const CURRENT_USER_ID_KEY = 'currentUserId'
const IS_SUPERVISOR_KEY = 'isSupervisor'

const getTokenFromResponse = (payload: LoginResponse | null): string | null => {
  if (!payload) return null
  return payload.accessToken ?? payload.token ?? payload.userKey ?? null
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [form, setForm] = useState<LoginRequest>({ userId: '', password: '' })
  const [validationError, setValidationError] = useState<string | null>(null)
  const { post, error, isLoading } = usePost<LoginResponse, LoginRequest>('/api/Users/validate')

  const subtitle = useMemo(
    () => 'Sign in to continue Balbodhini examination office work.',
    [],
  )

  const onChange = (field: keyof LoginRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.userId.trim() || !form.password?.trim()) {
      setValidationError('User ID and password are required.')
      return
    }

    setValidationError(null)
    const response = await post({
      userId: form.userId.trim(),
      password: form.password,
    })

    if (!response || response.success === false) {
      setValidationError(response?.message ?? 'Invalid credentials.')
      return
    }

    const token = getTokenFromResponse(response)
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token)
    localStorage.setItem(CURRENT_USER_ID_KEY, (response.userId ?? form.userId).trim().toUpperCase())
    localStorage.setItem(IS_SUPERVISOR_KEY, response.isSupervisor ? 'Y' : 'N')
    onLoginSuccess()
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        background:
          'radial-gradient(circle at 12% 18%, rgba(11, 79, 108, 0.18), transparent 40%), radial-gradient(circle at 88% 12%, rgba(180, 83, 9, 0.14), transparent 34%), linear-gradient(160deg, #f7fafc 0%, #e7eef3 55%, #d9e5ec 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          sx={{
            p: { xs: 3, md: 4.5 },
            borderRadius: 3,
            boxShadow: '0 24px 48px rgba(18, 38, 58, 0.12)',
            overflow: 'hidden',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: '0 auto auto 0',
              width: '100%',
              height: 5,
              background: 'linear-gradient(90deg, #0b4f6c 0%, #1a6f92 55%, #b45309 100%)',
            },
          }}
        >
          <Stack spacing={2.5}>
            <Stack direction="row" spacing={1.75} alignItems="center">
              <Box
                component="img"
                src={monoLogo}
                alt="MRS Mono logo"
                sx={{ width: 64, height: 64, objectFit: 'contain' }}
              />
              <Box>
                <Typography variant="overline" color="primary" fontWeight={700}>
                  Maharashtra Rashtrabhasha Sabha
                </Typography>
                <Typography variant="h4" component="h1">
                  MRS Exam
                </Typography>
              </Box>
            </Stack>

            <Box>
              <Typography variant="h5" fontWeight={650}>
                Balbodhini sign in
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                {subtitle}
              </Typography>
            </Box>

            <Box component="form" onSubmit={onSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  id="userId"
                  name="userId"
                  label="User ID"
                  value={form.userId}
                  onChange={(event) => onChange('userId', event.target.value)}
                  autoComplete="username"
                  fullWidth
                />
                <TextField
                  id="password"
                  name="password"
                  type="password"
                  label="Password"
                  value={form.password ?? ''}
                  onChange={(event) => onChange('password', event.target.value)}
                  autoComplete="current-password"
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </Stack>
            </Box>

            {validationError ? <Alert severity="error">{validationError}</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

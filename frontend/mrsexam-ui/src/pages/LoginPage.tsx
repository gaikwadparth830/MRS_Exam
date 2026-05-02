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
  token?: string
  accessToken?: string
  userKey?: string
  message?: string
}

type LoginPageProps = {
  onLoginSuccess: () => void
}

const ACCESS_TOKEN_KEY = 'accessToken'
const CURRENT_USER_ID_KEY = 'currentUserId'

const getTokenFromResponse = (payload: LoginResponse | null): string | null => {
  if (!payload) {
    return null
  }

  return payload.accessToken ?? payload.token ?? payload.userKey ?? null
}

export const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [form, setForm] = useState<LoginRequest>({
    userId: '',
    password: '',
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const { post, data, error, isLoading } = usePost<LoginResponse, LoginRequest>('/api/Users/validate')

  const apiMessage = useMemo(() => {
    if (!data) {
      return null
    }

    return data.message ?? 'Login request submitted successfully.'
  }, [data])

  const onChange = (field: keyof LoginRequest, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
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

    const token = getTokenFromResponse(response)
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    }

    localStorage.setItem(CURRENT_USER_ID_KEY, form.userId.trim())

    if (response) {
      onLoginSuccess()
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        background:
          'radial-gradient(circle at 10% 20%, rgba(21, 94, 117, 0.2), transparent 42%), radial-gradient(circle at 90% 80%, rgba(59, 130, 246, 0.25), transparent 38%), #eef3fb',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={8} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Stack spacing={2.25}>
            <Box
              component="img"
              src={monoLogo}
              alt="MRS Mono logo"
              sx={{ width: 84, height: 84, objectFit: 'contain' }}
            />
            <Typography variant="overline" color="primary" fontWeight={700}>
              MRS Exam Portal
            </Typography>
            <Typography variant="h4" component="h1" fontWeight={700}>
              Sign in
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Use your credentials to continue.
            </Typography>

            <Box component="form" onSubmit={onSubmit} noValidate>
              <Stack spacing={2}>
                <TextField
                  id="userId"
                  name="userId"
                  label="User ID"
                  value={form.userId}
                  onChange={(event) => onChange('userId', event.target.value)}
                  autoComplete="username"
                  placeholder="Enter user ID"
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
                  placeholder="Enter password"
                  fullWidth
                />

                <Button type="submit" variant="contained" size="large" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Login'}
                </Button>
              </Stack>
            </Box>

            {validationError ? <Alert severity="error">{validationError}</Alert> : null}
            {error ? <Alert severity="error">{error}</Alert> : null}
            {apiMessage ? <Alert severity="success">{apiMessage}</Alert> : null}
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

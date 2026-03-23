import { useMemo, useState } from 'react'

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

    if (response) {
      onLoginSuccess()
    }
  }

  return (
    <main className="login-page">
      <section className="login-card" aria-label="Login form">
        <p className="eyebrow">MRS Exam Portal</p>
        <h1>Sign in</h1>
        <p className="subtitle">Use your credentials to continue.</p>

        <form className="login-form" onSubmit={onSubmit}>
          <label htmlFor="userId">User ID</label>
          <input
            id="userId"
            name="userId"
            value={form.userId}
            onChange={(event) => onChange('userId', event.target.value)}
            autoComplete="username"
            placeholder="Enter user ID"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password ?? ''}
            onChange={(event) => onChange('password', event.target.value)}
            autoComplete="current-password"
            placeholder="Enter password"
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        {validationError ? <p className="message error">{validationError}</p> : null}
        {error ? <p className="message error">{error}</p> : null}
        {apiMessage ? <p className="message success">{apiMessage}</p> : null}
      </section>
    </main>
  )
}

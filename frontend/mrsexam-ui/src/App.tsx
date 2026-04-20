import { useCallback, useState } from 'react'

import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'

const ACCESS_TOKEN_KEY = 'accessToken'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
  )

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  if (isAuthenticated) {
    return <DashboardPage />
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}

export default App

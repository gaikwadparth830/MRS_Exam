import { useCallback, useState } from 'react'

import { BalbodhiniWorkspace } from './pages/BalbodhiniWorkspace'
import { LoginPage } from './pages/LoginPage'

const ACCESS_TOKEN_KEY = 'accessToken'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
  )

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const handleSignOut = useCallback(() => {
    setIsAuthenticated(false)
  }, [])

  if (isAuthenticated) {
    return <BalbodhiniWorkspace onSignOut={handleSignOut} />
  }

  return <LoginPage onLoginSuccess={handleLoginSuccess} />
}

export default App

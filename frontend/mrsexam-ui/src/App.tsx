import { useCallback, useState } from 'react'

import { BalbodhiniWorkspace } from './pages/BalbodhiniWorkspace'
import { ExamSelectPage, type ExamModule } from './pages/ExamSelectPage'
import { LoginPage } from './pages/LoginPage'
import { PrathamikWorkspace } from './pages/PrathamikWorkspace'
import { PraveshikaWorkspace } from './pages/PraveshikaWorkspace'
import { SubodhWorkspace } from './pages/SubodhWorkspace'

const ACCESS_TOKEN_KEY = 'accessToken'
const EXAM_MODULE_KEY = 'examModule'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY)),
  )
  const [examModule, setExamModule] = useState<ExamModule | null>(() => {
    const stored = localStorage.getItem(EXAM_MODULE_KEY)
    return stored === 'balbodhini' || stored === 'prathamik' || stored === 'praveshika' || stored === 'subodh' ? stored : null
  })

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true)
  }, [])

  const handleSignOut = useCallback(() => {
    localStorage.removeItem(EXAM_MODULE_KEY)
    setExamModule(null)
    setIsAuthenticated(false)
  }, [])

  const handleSelectExam = useCallback((exam: ExamModule) => {
    localStorage.setItem(EXAM_MODULE_KEY, exam)
    setExamModule(exam)
  }, [])

  const handleSwitchExam = useCallback(() => {
    localStorage.removeItem(EXAM_MODULE_KEY)
    setExamModule(null)
  }, [])

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />
  }

  if (!examModule) {
    return <ExamSelectPage onSelect={handleSelectExam} />
  }

  if (examModule === 'prathamik') {
    return <PrathamikWorkspace onSignOut={handleSignOut} onSwitchExam={handleSwitchExam} />
  }

  if (examModule === 'praveshika') {
    return <PraveshikaWorkspace onSignOut={handleSignOut} onSwitchExam={handleSwitchExam} />
  }

  if (examModule === 'subodh') {
    return <SubodhWorkspace onSignOut={handleSignOut} onSwitchExam={handleSwitchExam} />
  }

  return <BalbodhiniWorkspace onSignOut={handleSignOut} onSwitchExam={handleSwitchExam} />
}

export default App

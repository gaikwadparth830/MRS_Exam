import { useEffect, useState } from 'react'
import { Alert, Card, CardContent, Typography } from '@mui/material'

import { prabodhApi, type CurrentSession } from '../api/prabodh/client'
import { SessionsService, type Session } from '../api/generatedClient'
import { BalbodhiniShell } from '../layout/BalbodhiniShell'
import { PageFrame } from '../layout/PageFrame'
import { defaultNavItemId, findNavItem, prabodhNav, type NavItemId } from '../layout/navConfig'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'
import { PrabodhBatchInsertPage } from './prabodh/PrabodhBatchInsertPage'
import { PrabodhFormEntryPage } from './prabodh/PrabodhFormEntryPage'
import {
  PrabodhGenerateResultPage,
  PrabodhResetLockPage,
} from './prabodh/PrabodhGenerateResultPage'
import { PrabodhMarksPage } from './prabodh/PrabodhMarksPage'
import { PrabodhRollNumbersPage } from './prabodh/PrabodhRollNumbersPage'
import { PrabodhReportsPage, isReportNavId } from './prabodh/PrabodhReportsPage'
import { SelectSessionPage } from './prabodh/SelectSessionPage'

const ACCESS_TOKEN_KEY = 'accessToken'
const CURRENT_USER_ID_KEY = 'currentUserId'
const IS_SUPERVISOR_KEY = 'isSupervisor'

const masterPageByNav: Partial<Record<NavItemId, MasterPageKey>> = {
  'master-region': 'Region Master',
  'master-district': 'District Master',
  'master-centre': 'Center Master',
  'master-exam': 'Exam Master',
  'master-paper': 'Paper Master',
  'master-session': 'Session Master',
}

type Props = {
  onSignOut: () => void
  onSwitchExam: () => void
}

export const PrabodhWorkspace = ({ onSignOut, onSwitchExam }: Props) => {
  const [activeItemId, setActiveItemId] = useState<NavItemId>(defaultNavItemId)
  const [defaultSession, setDefaultSession] = useState<Session | null>(null)
  const [currentSessionMeta, setCurrentSessionMeta] = useState<CurrentSession | null>(null)
  const userId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''
  const isSupervisor = localStorage.getItem(IS_SUPERVISOR_KEY) === 'Y'
  const isLocked = currentSessionMeta?.isLockedPrabodh
    ?? (defaultSession?.resgenPrabodh?.trim().toUpperCase() === 'Y')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const current = await prabodhApi.getCurrentSession()
        if (!mounted) return
        if (current) {
          setCurrentSessionMeta(current)
          setDefaultSession({
            sessionNo: current.sessionNo,
            month: current.month,
            defa: current.defa,
            backup: current.backup,
            resgenPrabodh: current.resgenPrabodh,
            resultDate: current.resultDate,
          } as Session)
          return
        }
        const payload = await SessionsService.getApiSessions()
        const list = Array.isArray(payload) ? payload as Session[] : []
        const match = list.find((session) => session.defa?.trim().toUpperCase() === 'Y') ?? null
        setDefaultSession(match)
        setCurrentSessionMeta(null)
      } catch {
        if (mounted) {
          setDefaultSession(null)
          setCurrentSessionMeta(null)
        }
      }
    }
    void load()
    return () => {
      mounted = false
    }
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(CURRENT_USER_ID_KEY)
    localStorage.removeItem(IS_SUPERVISOR_KEY)
    onSignOut()
  }

  const handleSessionChanged = (session: Session | null) => {
    setDefaultSession(session)
    if (session) {
      setCurrentSessionMeta({
        sessionNo: session.sessionNo,
        month: session.month,
        defa: session.defa,
        backup: session.backup,
        resgenPrabodh: session.resgenPrabodh,
        isLocked: false,
        isLockedPrabodh: session.resgenPrabodh?.trim().toUpperCase() === 'Y',
        isBackup: session.backup?.trim().toUpperCase() === 'Y',
        resultDate: session.resultDate,
      })
    } else {
      setCurrentSessionMeta(null)
    }
  }

  const renderContent = () => {
    const masterKey = masterPageByNav[activeItemId]
    if (masterKey) {
      return (
        <PageFrame title={masterKey} description="Shared master data used by Prabodh operations.">
          <MasterMenuPage pageKey={masterKey} />
        </PageFrame>
      )
    }

    switch (activeItemId) {
      case 'form-entry':
        return (
          <PrabodhFormEntryPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'marks':
        return (
          <PrabodhMarksPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'set-rolls':
        return <PrabodhRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="regular" />
      case 'aur-rolls':
        return <PrabodhRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="aur" />
      case 'clear-rolls':
        return <PrabodhRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="clear" />
      case 'generate-result':
        return <PrabodhGenerateResultPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'select-session':
        return (
          <SelectSessionPage
            currentDefaultSession={defaultSession}
            onDefaultSessionChanged={handleSessionChanged}
          />
        )
      case 'batch-insert':
        return <PrabodhBatchInsertPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'reset-lock':
        return <PrabodhResetLockPage />
      default: {
        if (isReportNavId(activeItemId)) {
          return (
            <PrabodhReportsPage
              reportId={activeItemId}
              defaultSessionNo={defaultSession?.sessionNo}
            />
          )
        }

        const item = findNavItem(activeItemId, prabodhNav)
        return (
          <PageFrame title={item?.label ?? 'Prabodh'} description={item?.description}>
            <Card>
              <CardContent>
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  This Prabodh screen is planned for a later milestone.
                </Alert>
                <Typography color="text.secondary">
                  Menu and core candidate / marks / roll / result flows are available now.
                </Typography>
              </CardContent>
            </Card>
          </PageFrame>
        )
      }
    }
  }

  return (
    <BalbodhiniShell
      activeItemId={activeItemId}
      onNavigate={setActiveItemId}
      navGroups={prabodhNav}
      examNameEn="Prabodh"
      examNameMr="प्रबोध"
      session={{
        sessionNo: defaultSession?.sessionNo,
        month: defaultSession?.month,
        isLocked,
      }}
      userId={userId}
      isSupervisor={isSupervisor}
      onSignOut={handleSignOut}
      onSwitchExam={onSwitchExam}
    >
      {renderContent()}
    </BalbodhiniShell>
  )
}
import { useEffect, useState } from 'react'
import { Alert, Card, CardContent, Typography } from '@mui/material'

import { balbodhiniApi, type CurrentSession } from '../api/balbodhini/client'
import { SessionsService, type Session } from '../api/generatedClient'
import { BalbodhiniShell } from '../layout/BalbodhiniShell'
import { PageFrame } from '../layout/PageFrame'
import { defaultNavItemId, findNavItem, type NavItemId } from '../layout/navConfig'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'
import { BalbodhiniBatchInsertPage } from './balbodhini/BalbodhiniBatchInsertPage'
import { BalbodhiniFormEntryPage } from './balbodhini/BalbodhiniFormEntryPage'
import {
  BalbodhiniGenerateResultPage,
  BalbodhiniResetLockPage,
} from './balbodhini/BalbodhiniGenerateResultPage'
import { BalbodhiniMarksPage } from './balbodhini/BalbodhiniMarksPage'
import { BalbodhiniRollNumbersPage } from './balbodhini/BalbodhiniRollNumbersPage'
import { BalbodhiniReportsPage, isReportNavId } from './balbodhini/BalbodhiniReportsPage'
import { SelectSessionPage } from './balbodhini/SelectSessionPage'

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
}

export const BalbodhiniWorkspace = ({ onSignOut }: Props) => {
  const [activeItemId, setActiveItemId] = useState<NavItemId>(defaultNavItemId)
  const [defaultSession, setDefaultSession] = useState<Session | null>(null)
  const [currentSessionMeta, setCurrentSessionMeta] = useState<CurrentSession | null>(null)
  const userId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''
  const isSupervisor = localStorage.getItem(IS_SUPERVISOR_KEY) === 'Y'
  const isLocked = currentSessionMeta?.isLocked
    ?? (defaultSession?.resgenBalbodhini?.trim().toUpperCase() === 'Y')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const current = await balbodhiniApi.getCurrentSession()
        if (!mounted) return
        if (current) {
          setCurrentSessionMeta(current)
          setDefaultSession({
            sessionNo: current.sessionNo,
            month: current.month,
            defa: current.defa,
            backup: current.backup,
            resgenBalbodhini: current.resgenBalbodhini,
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
        resgenBalbodhini: session.resgenBalbodhini,
        isLocked: session.resgenBalbodhini?.trim().toUpperCase() === 'Y',
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
        <PageFrame title={masterKey} description="Shared master data used by Balbodhini operations.">
          <MasterMenuPage pageKey={masterKey} />
        </PageFrame>
      )
    }

    switch (activeItemId) {
      case 'form-entry':
        return (
          <BalbodhiniFormEntryPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'marks':
        return (
          <BalbodhiniMarksPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'set-rolls':
        return <BalbodhiniRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="regular" />
      case 'aur-rolls':
        return <BalbodhiniRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="aur" />
      case 'clear-rolls':
        return <BalbodhiniRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="clear" />
      case 'generate-result':
        return <BalbodhiniGenerateResultPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'select-session':
        return (
          <SelectSessionPage
            currentDefaultSession={defaultSession}
            onDefaultSessionChanged={handleSessionChanged}
          />
        )
      case 'batch-insert':
        return <BalbodhiniBatchInsertPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'reset-lock':
        return <BalbodhiniResetLockPage />
      default: {
        if (isReportNavId(activeItemId)) {
          return (
            <BalbodhiniReportsPage
              reportId={activeItemId}
              defaultSessionNo={defaultSession?.sessionNo}
            />
          )
        }

        const item = findNavItem(activeItemId)
        return (
          <PageFrame title={item?.label ?? 'Balbodhini'} description={item?.description}>
            <Card>
              <CardContent>
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  This screen is planned for a later Balbodhini milestone.
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
      session={{
        sessionNo: defaultSession?.sessionNo,
        month: defaultSession?.month,
        isLocked,
      }}
      userId={userId}
      isSupervisor={isSupervisor}
      onSignOut={handleSignOut}
    >
      {renderContent()}
    </BalbodhiniShell>
  )
}

import { useEffect, useState } from 'react'
import { Alert, Card, CardContent, Typography } from '@mui/material'

import { praveshikaApi, type CurrentSession } from '../api/praveshika/client'
import { SessionsService, type Session } from '../api/generatedClient'
import { BalbodhiniShell } from '../layout/BalbodhiniShell'
import { PageFrame } from '../layout/PageFrame'
import { defaultNavItemId, findNavItem, praveshikaNav, type NavItemId } from '../layout/navConfig'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'
import { PraveshikaBatchInsertPage } from './praveshika/PraveshikaBatchInsertPage'
import { PraveshikaFormEntryPage } from './praveshika/PraveshikaFormEntryPage'
import {
  PraveshikaGenerateResultPage,
  PraveshikaResetLockPage,
} from './praveshika/PraveshikaGenerateResultPage'
import { PraveshikaMarksPage } from './praveshika/PraveshikaMarksPage'
import { PraveshikaRollNumbersPage } from './praveshika/PraveshikaRollNumbersPage'
import { PraveshikaReportsPage, isReportNavId } from './praveshika/PraveshikaReportsPage'
import { SelectSessionPage } from './praveshika/SelectSessionPage'

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

export const PraveshikaWorkspace = ({ onSignOut, onSwitchExam }: Props) => {
  const [activeItemId, setActiveItemId] = useState<NavItemId>(defaultNavItemId)
  const [defaultSession, setDefaultSession] = useState<Session | null>(null)
  const [currentSessionMeta, setCurrentSessionMeta] = useState<CurrentSession | null>(null)
  const userId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''
  const isSupervisor = localStorage.getItem(IS_SUPERVISOR_KEY) === 'Y'
  const isLocked = currentSessionMeta?.isLockedPraveshika
    ?? (defaultSession?.resgenPraveshika?.trim().toUpperCase() === 'Y')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const current = await praveshikaApi.getCurrentSession()
        if (!mounted) return
        if (current) {
          setCurrentSessionMeta(current)
          setDefaultSession({
            sessionNo: current.sessionNo,
            month: current.month,
            defa: current.defa,
            backup: current.backup,
            resgenPraveshika: current.resgenPraveshika,
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
        resgenPraveshika: session.resgenPraveshika,
        isLocked: false,
        isLockedPraveshika: session.resgenPraveshika?.trim().toUpperCase() === 'Y',
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
        <PageFrame title={masterKey} description="Shared master data used by Praveshika operations.">
          <MasterMenuPage pageKey={masterKey} />
        </PageFrame>
      )
    }

    switch (activeItemId) {
      case 'form-entry':
        return (
          <PraveshikaFormEntryPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'marks':
        return (
          <PraveshikaMarksPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'set-rolls':
        return <PraveshikaRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="regular" />
      case 'aur-rolls':
        return <PraveshikaRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="aur" />
      case 'clear-rolls':
        return <PraveshikaRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} mode="clear" />
      case 'generate-result':
        return <PraveshikaGenerateResultPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'select-session':
        return (
          <SelectSessionPage
            currentDefaultSession={defaultSession}
            onDefaultSessionChanged={handleSessionChanged}
          />
        )
      case 'batch-insert':
        return <PraveshikaBatchInsertPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'reset-lock':
        return <PraveshikaResetLockPage />
      default: {
        if (isReportNavId(activeItemId)) {
          return (
            <PraveshikaReportsPage
              reportId={activeItemId}
              defaultSessionNo={defaultSession?.sessionNo}
            />
          )
        }

        const item = findNavItem(activeItemId, praveshikaNav)
        return (
          <PageFrame title={item?.label ?? 'Praveshika'} description={item?.description}>
            <Card>
              <CardContent>
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  This Praveshika screen is planned for a later milestone.
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
      navGroups={praveshikaNav}
      officeLabel="Praveshika Office"
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
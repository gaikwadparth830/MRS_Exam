import { useEffect, useState } from 'react'

import { clearAuthClaims, loadAuthClaims } from '../auth/permissions'
import { Alert, Card, CardContent, Typography } from '@mui/material'

import { praveenApi, type CurrentSession } from '../api/praveen/client'
import { SessionsService, type Session } from '../api/generatedClient'
import { BalbodhiniShell } from '../layout/BalbodhiniShell'
import { PageFrame } from '../layout/PageFrame'
import { defaultNavItemId, findNavItem, praveenNav, type NavItemId } from '../layout/navConfig'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'
import { PraveenBatchInsertPage } from './praveen/PraveenBatchInsertPage'
import { PraveenFormEntryPage } from './praveen/PraveenFormEntryPage'
import {
  PraveenGenerateResultPage,
  PraveenResetLockPage,
} from './praveen/PraveenGenerateResultPage'
import { PraveenMarksPage } from './praveen/PraveenMarksPage'
import { PraveenRollNumbersPage } from './praveen/PraveenRollNumbersPage'
import { PraveenReportsPage, isReportNavId } from './praveen/PraveenReportsPage'
import { UserWiseFormsReportPage } from './common/UserWiseFormsReportPage'
import { CentreListReportPage } from './common/CentreListReportPage'
import { SelectSessionPage } from './praveen/SelectSessionPage'


const masterPageByNav: Partial<Record<NavItemId, MasterPageKey>> = {
  'master-region': 'Region Master',
  'master-district': 'District Master',
  'master-centre': 'Center Master',
  'master-exam': 'Exam Master',
  'master-paper': 'Paper Master',
  'master-session': 'Session Master',
  'master-user': 'User Master',
}

type Props = {
  onSignOut: () => void
  onSwitchExam: () => void
}

export const PraveenWorkspace = ({ onSignOut, onSwitchExam }: Props) => {
  const [activeItemId, setActiveItemId] = useState<NavItemId>(defaultNavItemId)
  const [defaultSession, setDefaultSession] = useState<Session | null>(null)
  const [currentSessionMeta, setCurrentSessionMeta] = useState<CurrentSession | null>(null)
  const claims = loadAuthClaims()
  const userId = claims.userId
  const isSupervisor = claims.isSupervisor || claims.role === 'SUPER'
  const isLocked = currentSessionMeta?.isLockedPraveen
    ?? ((defaultSession as Session & { resgenPraveen?: string | null })?.resgenPraveen?.trim().toUpperCase() === 'Y')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const current = await praveenApi.getCurrentSession()
        if (!mounted) return
        if (current) {
          setCurrentSessionMeta(current)
          setDefaultSession({
            sessionNo: current.sessionNo,
            month: current.month,
            defa: current.defa,
            backup: current.backup,
            resgenPraveen: current.resgenPraveen,
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
    clearAuthClaims()
    onSignOut()
  }

  const handleSessionChanged = (session: Session | null) => {
    setDefaultSession(session)
    if (session) {
      const resgen = (session as Session & { resgenPraveen?: string | null }).resgenPraveen
      setCurrentSessionMeta({
        sessionNo: session.sessionNo,
        month: session.month,
        defa: session.defa,
        backup: session.backup,
        resgenPraveen: resgen,
        isLocked: false,
        isLockedPraveen: resgen?.trim().toUpperCase() === 'Y',
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
        <PageFrame title={masterKey} description="Shared master data used by Praveen operations.">
          <MasterMenuPage pageKey={masterKey} />
        </PageFrame>
      )
    }

    switch (activeItemId) {
      case 'form-entry':
        return (
          <PraveenFormEntryPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'marks':
        return (
          <PraveenMarksPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'set-rolls':
        return <PraveenRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'generate-result':
        return <PraveenGenerateResultPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'select-session':
        return (
          <SelectSessionPage
            currentDefaultSession={defaultSession}
            onDefaultSessionChanged={handleSessionChanged}
          />
        )
      case 'batch-insert':
        return <PraveenBatchInsertPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'report-centre-list':
        return <CentreListReportPage />
      case 'report-userwise-forms':
        return <UserWiseFormsReportPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'reset-lock':
        return <PraveenResetLockPage />
      default: {
        if (isReportNavId(activeItemId)) {
          return (
            <PraveenReportsPage
              reportId={activeItemId}
              defaultSessionNo={defaultSession?.sessionNo}
            />
          )
        }

        const item = findNavItem(activeItemId, praveenNav)
        return (
          <PageFrame title={item?.label ?? 'Praveen'} description={item?.description}>
            <Card>
              <CardContent>
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  This Praveen screen is planned for a later milestone.
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
      navGroups={praveenNav}
      examNameEn="Praveen"
      examNameMr="प्रवीण"
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

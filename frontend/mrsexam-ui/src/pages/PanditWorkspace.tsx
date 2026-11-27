import { useEffect, useState } from 'react'

import { clearAuthClaims, loadAuthClaims } from '../auth/permissions'
import { Alert, Card, CardContent, Typography } from '@mui/material'

import { panditApi, type CurrentSession } from '../api/pandit/client'
import { SessionsService, type Session } from '../api/generatedClient'
import { BalbodhiniShell } from '../layout/BalbodhiniShell'
import { PageFrame } from '../layout/PageFrame'
import { defaultNavItemId, findNavItem, panditNav, type NavItemId } from '../layout/navConfig'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'
import { PanditBatchInsertPage } from './pandit/PanditBatchInsertPage'
import { PanditCrossReferencePage } from './pandit/PanditCrossReferencePage'
import { PanditFormEntryPage } from './pandit/PanditFormEntryPage'
import {
  PanditGenerateResultPage,
  PanditResetLockPage,
} from './pandit/PanditGenerateResultPage'
import { PanditMarksPage } from './pandit/PanditMarksPage'
import { PanditRollNumbersPage } from './pandit/PanditRollNumbersPage'
import { PanditReportsPage, isPanditReportNavId } from './pandit/PanditReportsPage'
import { UserWiseFormsReportPage } from './common/UserWiseFormsReportPage'
import { CentreListReportPage } from './common/CentreListReportPage'
import { SelectSessionPage } from './pandit/SelectSessionPage'


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

export const PanditWorkspace = ({ onSignOut, onSwitchExam }: Props) => {
  const [activeItemId, setActiveItemId] = useState<NavItemId>(defaultNavItemId)
  const [defaultSession, setDefaultSession] = useState<Session | null>(null)
  const [currentSessionMeta, setCurrentSessionMeta] = useState<CurrentSession | null>(null)
  const claims = loadAuthClaims()
  const userId = claims.userId
  const isSupervisor = claims.isSupervisor || claims.role === 'SUPER'
  const isLocked = currentSessionMeta?.isLockedPandit
    ?? ((defaultSession as Session & { resgenPandit?: string | null })?.resgenPandit?.trim().toUpperCase() === 'Y')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const current = await panditApi.getCurrentSession()
        if (!mounted) return
        if (current) {
          setCurrentSessionMeta(current)
          setDefaultSession({
            sessionNo: current.sessionNo,
            month: current.month,
            defa: current.defa,
            backup: current.backup,
            resgenPandit: current.resgenPandit,
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
      const resgen = (session as Session & { resgenPandit?: string | null }).resgenPandit
      setCurrentSessionMeta({
        sessionNo: session.sessionNo,
        month: session.month,
        defa: session.defa,
        backup: session.backup,
        resgenPandit: resgen,
        isLocked: false,
        isLockedPandit: resgen?.trim().toUpperCase() === 'Y',
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
        <PageFrame title={masterKey} description="Shared master data used by Pandit operations.">
          <MasterMenuPage pageKey={masterKey} />
        </PageFrame>
      )
    }

    switch (activeItemId) {
      case 'form-entry':
        return (
          <PanditFormEntryPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'marks':
        return (
          <PanditMarksPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'set-rolls':
        return <PanditRollNumbersPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'cross-reference':
        return <PanditCrossReferencePage defaultSessionNo={defaultSession?.sessionNo} />
      case 'generate-result':
        return <PanditGenerateResultPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'select-session':
        return (
          <SelectSessionPage
            currentDefaultSession={defaultSession}
            onDefaultSessionChanged={handleSessionChanged}
          />
        )
      case 'batch-insert':
        return <PanditBatchInsertPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'report-centre-list':
        return <CentreListReportPage />
      case 'report-userwise-forms':
        return <UserWiseFormsReportPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'reset-lock':
        return <PanditResetLockPage />
      default: {
        if (isPanditReportNavId(activeItemId)) {
          return (
            <PanditReportsPage
              reportId={activeItemId}
              defaultSessionNo={defaultSession?.sessionNo}
            />
          )
        }

        const item = findNavItem(activeItemId, panditNav)
        return (
          <PageFrame title={item?.label ?? 'Pandit'} description={item?.description}>
            <Card>
              <CardContent>
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  This Pandit screen is planned for a later milestone.
                </Alert>
                <Typography color="text.secondary">
                  Menu and core candidate / marks / cross-ref / result flows are available now.
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
      navGroups={panditNav}
      examNameEn="Pandit"
      examNameMr="पंडित"
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

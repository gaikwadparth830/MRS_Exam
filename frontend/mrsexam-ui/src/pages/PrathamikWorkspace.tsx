import { useEffect, useState } from 'react'
import { Alert, Button, Card, CardContent, Stack, Typography } from '@mui/material'

import { prathamikApi, type CurrentSession } from '../api/prathamik/client'
import { SessionsService, type Session } from '../api/generatedClient'
import { BalbodhiniShell } from '../layout/BalbodhiniShell'
import { PageFrame } from '../layout/PageFrame'
import { defaultNavItemId, findNavItem, prathamikNav, type NavItemId } from '../layout/navConfig'
import { MasterMenuPage, type MasterPageKey } from './master/MasterPages'
import { PrathamikBatchInsertPage } from './prathamik/PrathamikBatchInsertPage'
import { PrathamikFormEntryPage } from './prathamik/PrathamikFormEntryPage'
import { SelectSessionPage } from './prathamik/SelectSessionPage'

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

export const PrathamikWorkspace = ({ onSignOut, onSwitchExam }: Props) => {
  const [activeItemId, setActiveItemId] = useState<NavItemId>(defaultNavItemId)
  const [defaultSession, setDefaultSession] = useState<Session | null>(null)
  const [currentSessionMeta, setCurrentSessionMeta] = useState<CurrentSession | null>(null)
  const [lockMessage, setLockMessage] = useState<string | null>(null)
  const userId = localStorage.getItem(CURRENT_USER_ID_KEY)?.trim() ?? ''
  const isSupervisor = localStorage.getItem(IS_SUPERVISOR_KEY) === 'Y'
  const isLocked = currentSessionMeta?.isLockedPrathamik
    ?? (defaultSession?.resgenPrathamik?.trim().toUpperCase() === 'Y')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const current = await prathamikApi.getCurrentSession()
        if (!mounted) return
        if (current) {
          setCurrentSessionMeta(current)
          setDefaultSession({
            sessionNo: current.sessionNo,
            month: current.month,
            defa: current.defa,
            backup: current.backup,
            resgenPrathamik: current.resgenPrathamik,
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
        resgenPrathamik: session.resgenPrathamik,
        isLocked: false,
        isLockedPrathamik: session.resgenPrathamik?.trim().toUpperCase() === 'Y',
        isBackup: session.backup?.trim().toUpperCase() === 'Y',
        resultDate: session.resultDate,
      })
    } else {
      setCurrentSessionMeta(null)
    }
  }

  const onResetLock = async () => {
    setLockMessage(null)
    try {
      await prathamikApi.resetLock()
      setLockMessage('Prathamik result lock reset to N.')
      const current = await prathamikApi.getCurrentSession()
      if (current) {
        setCurrentSessionMeta(current)
      }
    } catch (err) {
      setLockMessage(prathamikApi.messageFromError(err, 'Unable to reset Prathamik lock.'))
    }
  }

  const renderContent = () => {
    const masterKey = masterPageByNav[activeItemId]
    if (masterKey) {
      return (
        <PageFrame title={masterKey} description="Shared master data used by Prathamik operations.">
          <MasterMenuPage pageKey={masterKey} />
        </PageFrame>
      )
    }

    switch (activeItemId) {
      case 'form-entry':
        return (
          <PrathamikFormEntryPage
            defaultSessionNo={defaultSession?.sessionNo}
            isLocked={isLocked}
          />
        )
      case 'batch-insert':
        return <PrathamikBatchInsertPage defaultSessionNo={defaultSession?.sessionNo} />
      case 'select-session':
        return (
          <SelectSessionPage
            currentDefaultSession={defaultSession}
            onDefaultSessionChanged={handleSessionChanged}
          />
        )
      case 'reset-lock':
        return (
          <PageFrame
            title="Reset Result Lock"
            description="Supervisor: set session.resgen_prathamik back to N so forms and marks can be edited again (BR-070)."
          >
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  {lockMessage ? <Alert severity="info">{lockMessage}</Alert> : null}
                  <Typography color="text.secondary">
                    Current Prathamik lock: {isLocked ? 'Y (locked)' : 'N (open)'}
                  </Typography>
                  <Button variant="contained" onClick={() => void onResetLock()}>
                    Reset Prathamik lock
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </PageFrame>
        )
      default: {
        const item = findNavItem(activeItemId, prathamikNav)
        return (
          <PageFrame title={item?.label ?? 'Prathamik'} description={item?.description}>
            <Card>
              <CardContent>
                <Alert severity="info" sx={{ mb: 1.5 }}>
                  This Prathamik screen is planned for a later milestone (BRD M4–M8).
                </Alert>
                <Typography color="text.secondary">
                  Form entry with Marathi transliteration is available now. Marks, rolls, result, and reports follow next.
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
      navGroups={prathamikNav}
      officeLabel="Prathamik Office"
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

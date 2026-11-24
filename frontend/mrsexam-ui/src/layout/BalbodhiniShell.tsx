import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  LockOpenRounded,
  LockRounded,
  LogoutRounded,
  MenuOpenRounded,
  MenuRounded,
} from '@mui/icons-material'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

import monoLogo from '../assets/MONO.png'
import { balbodhiniNav, findNavItem, type NavGroup, type NavItemId } from './navConfig'

type SessionInfo = {
  sessionNo?: number | null
  month?: string | null
  isLocked?: boolean
}

type BalbodhiniShellProps = {
  activeItemId: NavItemId
  onNavigate: (id: NavItemId) => void
  session?: SessionInfo | null
  userId?: string
  isSupervisor?: boolean
  onSignOut?: () => void
  onSwitchExam?: () => void
  /** English exam name, e.g. Balbodhini */
  examNameEn?: string
  /** Marathi exam name, e.g. बालबोधिनी */
  examNameMr?: string
  officeLabel?: string
  navGroups?: NavGroup[]
  children: ReactNode
}

const marathiExamSx = {
  fontFamily: '"Noto Sans Devanagari", "Source Serif 4", sans-serif',
  fontWeight: 700,
} as const

export const BalbodhiniShell = ({
  activeItemId,
  onNavigate,
  session,
  userId,
  isSupervisor = false,
  onSignOut,
  onSwitchExam,
  examNameEn = 'Balbodhini',
  examNameMr = 'बालबोधिनी',
  officeLabel,
  navGroups = balbodhiniNav,
  children,
}: BalbodhiniShellProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const mainRef = useRef<HTMLDivElement | null>(null)
  const activeItem = findNavItem(activeItemId, navGroups)

  const visibleGroups = useMemo(
    () => navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.supervisorOnly || isSupervisor),
      }))
      .filter((group) => group.items.length > 0),
    [isSupervisor, navGroups],
  )

  // Keep report/form filters in view after switching a lower menu item.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeItemId])

  const handleNavigate = (id: NavItemId) => {
    onNavigate(id)
  }

  return (
    <Box
      sx={{
        height: { xs: '100dvh', md: '100vh' },
        maxHeight: { xs: '100dvh', md: '100vh' },
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: collapsed ? '96px 1fr' : '280px 1fr',
        },
        transition: 'grid-template-columns 180ms ease',
      }}
    >
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          color: '#eef6fa',
          background:
            'linear-gradient(180deg, #0a3d54 0%, #0b4f6c 48%, #0a455c 100%)',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
        }}
      >
        <Stack spacing={1} sx={{ p: collapsed ? 1 : 2.25, pb: 1.5, alignItems: collapsed ? 'center' : 'stretch' }}>
          {collapsed ? (
            <Stack spacing={1} alignItems="center" sx={{ width: '100%' }}>
              <Tooltip title={`${examNameMr} (${examNameEn})`} placement="right">
                <Box
                  component="img"
                  src={monoLogo}
                  alt={`${examNameMr} ${examNameEn}`}
                  sx={{
                    width: 40,
                    height: 40,
                    objectFit: 'contain',
                    borderRadius: 1.5,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    p: 0.5,
                  }}
                />
              </Tooltip>
              <Tooltip title="Expand menu" placement="right">
                <IconButton
                  size="medium"
                  onClick={() => setCollapsed(false)}
                  sx={{
                    color: 'inherit',
                    bgcolor: 'rgba(255,255,255,0.16)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    width: 44,
                    height: 44,
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
                  }}
                  aria-label="Expand menu"
                >
                  <MenuRounded />
                </IconButton>
              </Tooltip>
              <Typography
                sx={{
                  ...marathiExamSx,
                  fontSize: '0.72rem',
                  lineHeight: 1.15,
                  textAlign: 'center',
                  maxWidth: 80,
                  opacity: 0.95,
                }}
              >
                {examNameMr}
              </Typography>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box
                component="img"
                src={monoLogo}
                alt="MRS"
                sx={{
                  width: 46,
                  height: 46,
                  objectFit: 'contain',
                  borderRadius: 1.5,
                  bgcolor: 'rgba(255,255,255,0.08)',
                  p: 0.5,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.1 }}>
                  MRS Exam
                </Typography>
                <Typography
                  sx={{
                    ...marathiExamSx,
                    mt: 0.35,
                    fontSize: '1.15rem',
                    lineHeight: 1.2,
                    color: '#fff',
                  }}
                >
                  {examNameMr}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600, display: 'block' }}>
                  {examNameEn}
                  {officeLabel ? ` · ${officeLabel}` : ' Office'}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setCollapsed(true)}
                sx={{ color: 'inherit', flexShrink: 0 }}
                aria-label="Collapse menu"
              >
                <MenuOpenRounded />
              </IconButton>
            </Stack>
          )}
        </Stack>

        <Box sx={{ px: 1.25, pb: 2, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {visibleGroups.map((group) => (
            <Box key={group.id} sx={{ mb: 1.75 }}>
              {!collapsed ? (
                <Typography
                  variant="overline"
                  sx={{ px: 1.25, opacity: 0.55, display: 'block', mb: 0.5 }}
                >
                  {group.label}
                </Typography>
              ) : (
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1 }} />
              )}
              <Stack spacing={0.4}>
                {group.items.map((item) => {
                  const active = item.id === activeItemId
                  return (
                    <Tooltip
                      key={item.id}
                      title={collapsed ? item.label : ''}
                      placement="right"
                    >
                      <Button
                        fullWidth
                        onClick={() => handleNavigate(item.id)}
                        disabled={item.comingSoon}
                        sx={{
                          justifyContent: collapsed ? 'center' : 'flex-start',
                          color: active ? '#0b4f6c' : 'rgba(238,246,250,0.92)',
                          bgcolor: active ? '#f4f8fb' : 'transparent',
                          px: collapsed ? 1 : 1.5,
                          py: 1,
                          minHeight: 42,
                          borderRadius: 2,
                          '&:hover': {
                            bgcolor: active ? '#f4f8fb' : 'rgba(255,255,255,0.08)',
                          },
                          '&.Mui-disabled': {
                            color: 'rgba(238,246,250,0.35)',
                          },
                        }}
                      >
                        {collapsed ? item.label.slice(0, 1) : item.label}
                        {!collapsed && item.comingSoon ? (
                          <Chip
                            size="small"
                            label="Soon"
                            sx={{
                              ml: 'auto',
                              height: 20,
                              bgcolor: 'rgba(255,255,255,0.12)',
                              color: 'inherit',
                            }}
                          />
                        ) : null}
                      </Button>
                    </Tooltip>
                  )
                })}
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ minWidth: 0, minHeight: 0, height: { xs: '100dvh', md: '100vh' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          component="header"
          sx={{
            flexShrink: 0,
            zIndex: 8,
            px: { xs: 2, md: 3 },
            py: 1.5,
            backdropFilter: 'blur(10px)',
            background: 'rgba(245, 248, 250, 0.88)',
            borderBottom: '1px solid rgba(11, 79, 108, 0.1)',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Box>
              <Typography variant="overline" color="text.secondary">
                Current exam
              </Typography>
              <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap" useFlexGap>
                <Typography
                  variant="h5"
                  sx={{
                    ...marathiExamSx,
                    lineHeight: 1.2,
                    color: '#0b4f6c',
                  }}
                >
                  {examNameMr}
                </Typography>
                <Typography variant="h6" sx={{ lineHeight: 1.2, fontWeight: 700, color: '#0b4f6c' }}>
                  {examNameEn}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {activeItem?.label ?? 'Workspace'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Chip
                label={`${examNameMr} · ${examNameEn}`}
                color="primary"
                sx={{
                  fontWeight: 700,
                  '& .MuiChip-label': {
                    fontFamily: '"Noto Sans Devanagari", "IBM Plex Sans", sans-serif',
                  },
                }}
              />
              <Chip
                label={`Session ${session?.sessionNo ?? '-'}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={session?.month?.trim() || 'Month -'}
                variant="outlined"
              />
              <Chip
                icon={session?.isLocked ? <LockRounded /> : <LockOpenRounded />}
                label={session?.isLocked ? 'Result locked' : 'Entry open'}
                color={session?.isLocked ? 'warning' : 'success'}
                variant="outlined"
              />
              <Chip
                label={userId ? `User ${userId}` : 'Signed in'}
                variant="outlined"
              />
              {onSwitchExam ? (
                <Button size="small" variant="text" onClick={onSwitchExam}>
                  Switch exam
                </Button>
              ) : null}
              {onSignOut ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<LogoutRounded />}
                  onClick={onSignOut}
                >
                  Sign out
                </Button>
              ) : null}
            </Stack>
          </Stack>

          {/* Mobile nav */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 1.5, overflowX: 'auto' }}>
            <Stack direction="row" spacing={1}>
              {visibleGroups.flatMap((group) => group.items).map((item) => (
                <Button
                  key={item.id}
                  size="small"
                  variant={item.id === activeItemId ? 'contained' : 'outlined'}
                  disabled={item.comingSoon}
                  onClick={() => handleNavigate(item.id)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box
          ref={mainRef}
          component="main"
          sx={{ p: { xs: 2, md: 3 }, flex: 1, minHeight: 0, overflowY: 'auto' }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

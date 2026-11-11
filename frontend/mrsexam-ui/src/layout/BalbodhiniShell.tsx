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
import { useMemo, useState } from 'react'

import monoLogo from '../assets/MONO.png'
import { balbodhiniNav, findNavItem, type NavItemId } from './navConfig'

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
  children: ReactNode
}

export const BalbodhiniShell = ({
  activeItemId,
  onNavigate,
  session,
  userId,
  isSupervisor = false,
  onSignOut,
  children,
}: BalbodhiniShellProps) => {
  const [collapsed, setCollapsed] = useState(false)
  const activeItem = findNavItem(activeItemId)

  const visibleGroups = useMemo(
    () => balbodhiniNav
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.supervisorOnly || isSupervisor),
      }))
      .filter((group) => group.items.length > 0),
    [isSupervisor],
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: collapsed ? '88px 1fr' : '280px 1fr',
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
          minHeight: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        <Stack spacing={1.5} sx={{ p: 2.25, pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
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
              }}
            />
            {!collapsed ? (
              <Box>
                <Typography sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700, fontSize: '1.2rem', lineHeight: 1.1 }}>
                  MRS Exam
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.78 }}>
                  Balbodhini Office
                </Typography>
              </Box>
            ) : null}
            <IconButton
              size="small"
              onClick={() => setCollapsed((value) => !value)}
              sx={{ ml: 'auto', color: 'inherit' }}
              aria-label={collapsed ? 'Expand menu' : 'Collapse menu'}
            >
              {collapsed ? <MenuRounded /> : <MenuOpenRounded />}
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ px: 1.25, pb: 2, overflowY: 'auto', flex: 1 }}>
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
                        onClick={() => onNavigate(item.id)}
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

      <Box sx={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Box
          component="header"
          sx={{
            position: 'sticky',
            top: 0,
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
                Current workspace
              </Typography>
              <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                {activeItem?.label ?? 'Balbodhini'}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
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
                  onClick={() => onNavigate(item.id)}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box component="main" sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

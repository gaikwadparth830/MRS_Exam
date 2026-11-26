import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'

import { CentersService, type Center } from '../../api/generatedClient'
import { httpClient } from '../../api/httpClient'
import {
  ALL_EXAMS,
  loadAuthClaims,
  type ExamModuleCode,
  type UserRole,
} from '../../auth/permissions'

type UserAdminListItem = {
  userId: string
  userKey?: string | null
  role: UserRole
  exams: string[]
  centres: string[]
}

type UserFormState = {
  userId: string
  password: string
  userKey: string
  role: UserRole
  exams: ExamModuleCode[]
  centres: string[]
}

const emptyForm = (): UserFormState => ({
  userId: '',
  password: '',
  userKey: '',
  role: 'OPERATOR',
  exams: [],
  centres: [],
})

const apiErrorMessage = (error: unknown, fallback: string): string => {
  const response = (error as { response?: { data?: { message?: unknown } } } | null)?.response?.data
  if (response && typeof response.message === 'string' && response.message.trim()) {
    return response.message.trim()
  }
  return error instanceof Error ? error.message : fallback
}

const centreLabel = (centre: Center): string => {
  const code = centre.centreNo?.trim() || ''
  const name = centre.centreName?.trim() || ''
  const city = centre.city?.trim() || ''
  if (name && city) return `${code} · ${name}, ${city}`
  if (name) return `${code} · ${name}`
  if (city) return `${code} · ${city}`
  return code
}

export const UserMasterPage = () => {
  const claims = loadAuthClaims()
  const isSuper = claims.role === 'SUPER' || claims.isSupervisor

  const [rows, setRows] = useState<UserAdminListItem[]>([])
  const [centres, setCentres] = useState<Center[]>([])
  const [form, setForm] = useState<UserFormState>(emptyForm)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedCentres = useMemo(
    () => centres.filter((centre) => form.centres.includes(centre.centreNo?.trim() ?? '')),
    [centres, form.centres],
  )

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await httpClient.get<UserAdminListItem[]>('/api/users/admin')
      const list = Array.isArray(data) ? data : []
      setRows(
        list.map((item) => ({
          userId: String(item.userId ?? '').trim().toUpperCase(),
          userKey: item.userKey ?? null,
          role: (String(item.role ?? 'OPERATOR').trim().toUpperCase() as UserRole) || 'OPERATOR',
          exams: Array.isArray(item.exams) ? item.exams.map((exam) => String(exam).toLowerCase()) : [],
          centres: Array.isArray(item.centres) ? item.centres.map((centre) => String(centre).trim()) : [],
        })),
      )
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Failed to load users.'))
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isSuper) return
    void loadUsers()
  }, [isSuper, loadUsers])

  useEffect(() => {
    if (!isSuper) return
    let mounted = true

    const loadCentres = async () => {
      try {
        const payload = await CentersService.getApiCenters()
        const list = Array.isArray(payload) ? (payload as Center[]) : []
        if (mounted) setCentres(list.filter((centre) => Boolean(centre.centreNo?.trim())))
      } catch {
        if (mounted) setCentres([])
      }
    }

    void loadCentres()
    return () => {
      mounted = false
    }
  }, [isSuper])

  if (!isSuper) {
    return (
      <Alert severity="warning">
        User Master is available to SUPER users only.
      </Alert>
    )
  }

  const resetForm = () => {
    setForm(emptyForm())
    setEditingUserId(null)
  }

  const onNew = () => {
    resetForm()
    setError(null)
    setSuccess(null)
  }

  const onEdit = (row: UserAdminListItem) => {
    setEditingUserId(row.userId)
    setForm({
      userId: row.userId,
      password: '',
      userKey: row.userKey?.trim() ?? '',
      role: row.role,
      exams: row.exams.filter((exam): exam is ExamModuleCode =>
        ALL_EXAMS.includes(exam as ExamModuleCode),
      ),
      centres: [...row.centres],
    })
    setError(null)
    setSuccess(null)
  }

  const toggleExam = (exam: ExamModuleCode) => {
    setForm((current) => {
      const exists = current.exams.includes(exam)
      return {
        ...current,
        exams: exists ? current.exams.filter((item) => item !== exam) : [...current.exams, exam],
      }
    })
  }

  const onSave = async () => {
    setError(null)
    setSuccess(null)

    const userId = form.userId.trim().toUpperCase()
    if (!userId) {
      setError('UserId is required.')
      return
    }

    if (!editingUserId && !form.password.trim()) {
      setError('Password is required when creating a user.')
      return
    }

    if (form.role === 'CENTRE' && (form.exams.length === 0 || form.centres.length === 0)) {
      setError('CENTRE users require at least one exam and one centre.')
      return
    }

    const payload = {
      userId,
      password: form.password.trim() ? form.password.trim() : null,
      userKey: form.userKey.trim() ? form.userKey.trim() : null,
      role: form.role,
      exams: form.role === 'SUPER' ? [] : form.exams,
      centres: form.role === 'CENTRE' ? form.centres : [],
    }

    setLoading(true)
    try {
      if (editingUserId) {
        await httpClient.put(`/api/users/admin/${encodeURIComponent(editingUserId)}`, {
          ...payload,
          userId: editingUserId,
        })
        setSuccess(`User ${editingUserId} updated.`)
      } else {
        await httpClient.post('/api/users/admin', payload)
        setSuccess(`User ${userId} created.`)
      }
      resetForm()
      await loadUsers()
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Save failed.'))
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    const target = editingUserId ?? form.userId.trim().toUpperCase()
    if (!target) {
      setError('Select a user to delete.')
      return
    }

    const confirmed = window.confirm(`Delete user ${target}? This cannot be undone.`)
    if (!confirmed) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await httpClient.delete(`/api/users/admin/${encodeURIComponent(target)}`)
      setSuccess(`User ${target} deleted.`)
      resetForm()
      await loadUsers()
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Delete failed.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ maxWidth: 1200 }} aria-label="User Master page">
      <Card elevation={1}>
        <CardContent>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" component="h2" fontWeight={700}>
                User Master
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                Create and edit users, roles, exam access, and centre assignments (SUPER only).
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  lg: 'repeat(3, minmax(0, 1fr))',
                },
              }}
            >
              <TextField
                size="small"
                label="UserId"
                value={form.userId}
                onChange={(event) => setForm((current) => ({ ...current, userId: event.target.value.toUpperCase() }))}
                disabled={Boolean(editingUserId) || loading}
                inputProps={{ maxLength: 10 }}
                required
                fullWidth
              />
              <TextField
                size="small"
                type="password"
                label={editingUserId ? 'Password (blank = keep)' : 'Password'}
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                disabled={loading}
                inputProps={{ maxLength: 10 }}
                required={!editingUserId}
                fullWidth
                autoComplete="new-password"
              />
              <TextField
                size="small"
                label="Key"
                value={form.userKey}
                onChange={(event) => setForm((current) => ({ ...current, userKey: event.target.value }))}
                disabled={loading}
                inputProps={{ maxLength: 5 }}
                fullWidth
              />
              <FormControl size="small" fullWidth>
                <InputLabel id="user-role-label">Role</InputLabel>
                <Select
                  labelId="user-role-label"
                  label="Role"
                  value={form.role}
                  onChange={(event) => {
                    const role = event.target.value as UserRole
                    setForm((current) => ({
                      ...current,
                      role,
                      centres: role === 'CENTRE' ? current.centres : [],
                      exams: role === 'SUPER' ? [] : current.exams,
                    }))
                  }}
                  disabled={loading}
                >
                  <MenuItem value="SUPER">SUPER</MenuItem>
                  <MenuItem value="OPERATOR">OPERATOR</MenuItem>
                  <MenuItem value="CENTRE">CENTRE</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {form.role !== 'SUPER' ? (
              <FormControl component="fieldset" variant="standard">
                <FormLabel component="legend">Exams</FormLabel>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                  {form.role === 'OPERATOR'
                    ? 'Empty selection = all exams at runtime (legacy OPERATOR rule).'
                    : 'Select at least one exam for CENTRE users.'}
                </Typography>
                <FormGroup row>
                  {ALL_EXAMS.map((exam) => (
                    <FormControlLabel
                      key={exam}
                      control={
                        <Checkbox
                          checked={form.exams.includes(exam)}
                          onChange={() => toggleExam(exam)}
                          disabled={loading}
                        />
                      }
                      label={exam}
                    />
                  ))}
                </FormGroup>
              </FormControl>
            ) : (
              <Alert severity="info">SUPER users have access to all exams and centres.</Alert>
            )}

            {form.role === 'CENTRE' ? (
              <Autocomplete
                multiple
                options={centres}
                value={selectedCentres}
                disabled={loading}
                getOptionLabel={(option) => centreLabel(option)}
                isOptionEqualToValue={(option, value) =>
                  (option.centreNo?.trim() ?? '') === (value.centreNo?.trim() ?? '')
                }
                onChange={(_event, value) => {
                  setForm((current) => ({
                    ...current,
                    centres: value
                      .map((centre) => centre.centreNo?.trim() ?? '')
                      .filter(Boolean),
                  }))
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index })
                    return (
                      <Chip
                        key={key}
                        label={option.centreNo?.trim() || centreLabel(option)}
                        size="small"
                        {...tagProps}
                      />
                    )
                  })
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Centres"
                    placeholder="Search and add centres"
                    helperText="CENTRE users need at least one centre."
                  />
                )}
              />
            ) : null}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="button" variant="outlined" onClick={onNew} disabled={loading}>
                New
              </Button>
              <Button type="button" variant="contained" onClick={() => void onSave()} disabled={loading}>
                Save
              </Button>
              <Button type="button" variant="outlined" color="error" onClick={() => void onDelete()} disabled={loading}>
                Delete
              </Button>
              <Button type="button" variant="outlined" onClick={() => void loadUsers()} disabled={loading}>
                Reload
              </Button>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}
            {success ? <Alert severity="success">{success}</Alert> : null}

            <Paper variant="outlined">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>UserId</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Exams</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Centres</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Key</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.length > 0 ? (
                      rows.map((row) => (
                        <TableRow
                          key={row.userId}
                          hover
                          selected={editingUserId === row.userId}
                          onClick={() => onEdit(row)}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>{row.userId}</TableCell>
                          <TableCell>{row.role}</TableCell>
                          <TableCell>
                            {row.role === 'SUPER'
                              ? 'ALL'
                              : row.exams.length > 0
                                ? row.exams.join(', ')
                                : row.role === 'OPERATOR'
                                  ? 'ALL (legacy)'
                                  : '-'}
                          </TableCell>
                          <TableCell>
                            {row.role === 'CENTRE'
                              ? (row.centres.length > 0 ? row.centres.join(', ') : '-')
                              : '-'}
                          </TableCell>
                          <TableCell>{row.userKey?.trim() || '-'}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <Typography variant="body2" color="text.secondary">
                            {loading ? 'Loading…' : 'No users found.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

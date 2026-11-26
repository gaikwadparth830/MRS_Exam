import { Box, Button, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import { useMemo } from 'react'

import { hasExam, loadAuthClaims } from '../auth/permissions'

export type ExamModule = 'balbodhini' | 'prathamik' | 'praveshika' | 'subodh' | 'prabodh' | 'praveen' | 'pandit' | 'sambhashan'

type Props = {
  onSelect: (exam: ExamModule) => void
}

const exams: Array<{
  id: ExamModule
  nameEn: string
  nameMr: string
  description: string
  accent: string
  tint: string
}> = [
  {
    id: 'balbodhini',
    nameEn: 'Balbodhini',
    nameMr: 'बालबोधिनी',
    description: 'Form entry, marks, rolls, result, and reports.',
    accent: '#0b4f6c',
    tint: '#e8f2f7',
  },
  {
    id: 'prathamik',
    nameEn: 'Prathamik',
    nameMr: 'प्राथमिक',
    description: 'Form entry with Marathi name assist, marks, rolls, result, and reports.',
    accent: '#1a6f92',
    tint: '#e6f4f8',
  },
  {
    id: 'praveshika',
    nameEn: 'Praveshika',
    nameMr: 'प्रवेशिका',
    description: 'Two-paper marks, rolls, result generation, and reports.',
    accent: '#0f766e',
    tint: '#e6f5f3',
  },
  {
    id: 'subodh',
    nameEn: 'Subodh',
    nameMr: 'सुबोध',
    description: 'Two-paper marks, rolls, result generation, and reports.',
    accent: '#3f6212',
    tint: '#eef5e6',
  },
  {
    id: 'prabodh',
    nameEn: 'Prabodh',
    nameMr: 'प्रबोध',
    description: 'Three papers plus oral marks, rolls, results, and reports.',
    accent: '#9a3412',
    tint: '#f8eee8',
  },
  {
    id: 'praveen',
    nameEn: 'Praveen',
    nameMr: 'प्रवीण',
    description: 'Five papers plus oral and project/reg lang, results, and reports.',
    accent: '#b45309',
    tint: '#f8f0e6',
  },
  {
    id: 'pandit',
    nameEn: 'Pandit',
    nameMr: 'पंडित',
    description: 'Khand I/II, portion NEW/OLD, concession, cross-ref, results, and reports.',
    accent: '#7c2d12',
    tint: '#f6ebe6',
  },
  {
    id: 'sambhashan',
    nameEn: 'Sambhashan Yogyata',
    nameMr: 'संभाषण योग्यता',
    description: 'One-paper form entry, marks, rolls, result, and reports.',
    accent: '#365314',
    tint: '#eef4e7',
  },
]

const marathiTitleSx = {
  fontFamily: '"Noto Sans Devanagari", "Source Serif 4", sans-serif',
  fontWeight: 700,
} as const

export const ExamSelectPage = ({ onSelect }: Props) => {
  const claims = useMemo(() => loadAuthClaims(), [])
  const visibleExams = useMemo(
    () => exams.filter((exam) => hasExam(exam.id, claims)),
    [claims],
  )

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 3,
        background: 'linear-gradient(160deg, #e8f1f6 0%, #f7fafc 55%, #eef6fa 100%)',
      }}
    >
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 980 }}>
        <Box textAlign="center">
          <Typography variant="h4" sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700, color: '#0b4f6c' }}>
            MRS Exam
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Choose the examination module to continue. / परीक्षा निवडा
          </Typography>
          {visibleExams.length === 0 ? (
            <Typography color="error" sx={{ mt: 1.5 }}>
              {claims.role === 'CENTRE'
                ? 'No exams assigned for this centre user. Ask SUPER to add USER_EXAM (and USER_CENTRE) rows.'
                : 'No exams are assigned to this user. Ask SUPER to add USER_EXAM rows, or log in as SUPER / an OPERATOR.'}
            </Typography>
          ) : null}
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
          }}
        >
          {visibleExams.map((exam) => (
            <Card
              key={exam.id}
              elevation={0}
              sx={{
                height: '100%',
                border: '1px solid',
                borderColor: 'rgba(11, 79, 108, 0.12)',
                borderLeft: `4px solid ${exam.accent}`,
                bgcolor: exam.tint,
                borderRadius: 2,
                transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 24px rgba(11, 79, 108, 0.12)',
                  borderColor: exam.accent,
                },
              }}
            >
              <CardActionArea onClick={() => onSelect(exam.id)} sx={{ height: '100%', alignItems: 'stretch' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: 148 }}>
                  <Typography
                    variant="h5"
                    sx={{ ...marathiTitleSx, color: exam.accent, lineHeight: 1.25 }}
                  >
                    {exam.nameMr}
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1f2937' }}>
                    {exam.nameEn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 'auto', pt: 1 }}>
                    {exam.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        {hasExam('balbodhini', claims) ? (
          <Button variant="text" onClick={() => onSelect('balbodhini')} sx={{ color: '#0b4f6c' }}>
            Continue with बालबोधिनी / Balbodhini
          </Button>
        ) : null}
      </Stack>
    </Box>
  )
}

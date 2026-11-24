import { Box, Button, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'

export type ExamModule = 'balbodhini' | 'prathamik' | 'praveshika' | 'subodh'

type Props = {
  onSelect: (exam: ExamModule) => void
}

const exams: Array<{
  id: ExamModule
  nameEn: string
  nameMr: string
  description: string
}> = [
  {
    id: 'balbodhini',
    nameEn: 'Balbodhini',
    nameMr: 'बालबोधिनी',
    description: 'Form entry, marks, rolls, result, and reports.',
  },
  {
    id: 'prathamik',
    nameEn: 'Prathamik',
    nameMr: 'प्राथमिक',
    description: 'Form entry with Marathi name assist, marks, rolls, result, and reports.',
  },
  {
    id: 'praveshika',
    nameEn: 'Praveshika',
    nameMr: 'प्रवेशिका',
    description: 'Two-paper marks, rolls, result generation, and reports.',
  },
  {
    id: 'subodh',
    nameEn: 'Subodh',
    nameMr: 'सुबोध',
    description: 'Two-paper marks, rolls, result generation, and reports.',
  },
]

const marathiTitleSx = {
  fontFamily: '"Noto Sans Devanagari", "Source Serif 4", sans-serif',
  fontWeight: 700,
} as const

export const ExamSelectPage = ({ onSelect }: Props) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        background: 'linear-gradient(160deg, #e8f1f6 0%, #f7fafc 55%, #eef6fa 100%)',
      }}
    >
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 880 }}>
        <Box textAlign="center">
          <Typography variant="h4" sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700 }}>
            MRS Exam
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Choose the examination module to continue. / परीक्षा निवडा
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          }}
        >
          {exams.map((exam) => (
            <Card key={exam.id} variant="outlined">
              <CardActionArea onClick={() => onSelect(exam.id)} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{ ...marathiTitleSx, color: '#0b4f6c', lineHeight: 1.2 }}
                  >
                    {exam.nameMr}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
                    {exam.nameEn}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {exam.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        <Button variant="text" onClick={() => onSelect('balbodhini')}>
          Continue with बालबोधिनी / Balbodhini
        </Button>
      </Stack>
    </Box>
  )
}

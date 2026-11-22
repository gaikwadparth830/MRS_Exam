import { Box, Button, Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'

export type ExamModule = 'balbodhini' | 'prathamik'

type Props = {
  onSelect: (exam: ExamModule) => void
}

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
      <Stack spacing={3} sx={{ width: '100%', maxWidth: 720 }}>
        <Box textAlign="center">
          <Typography variant="h4" sx={{ fontFamily: '"Source Serif 4", serif', fontWeight: 700 }}>
            MRS Exam
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Choose the examination module to continue.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          }}
        >
          <Card variant="outlined">
            <CardActionArea onClick={() => onSelect('balbodhini')} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Balbodhini</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Form entry, marks, rolls, result, and reports.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card variant="outlined">
            <CardActionArea onClick={() => onSelect('prathamik')} sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={700}>Prathamik</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Form entry with Marathi name assist (pilot). More screens follow the BRD.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>

        <Button variant="text" onClick={() => onSelect('balbodhini')}>
          Continue with Balbodhini
        </Button>
      </Stack>
    </Box>
  )
}

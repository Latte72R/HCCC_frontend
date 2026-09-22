import { yupResolver } from '@hookform/resolvers/yup'
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
} from '@mui/material'
import type { SxProps, Theme } from '@mui/material/styles'
import React, { FC, KeyboardEventHandler } from 'react'
import { useForm } from 'react-hook-form'
import TitleLabel from '@/components/atoms/TitleLabel'
import { SubmitFormSchema, submitFormSchema } from '@/features/yupSchema'

type SubmitSectionProps = {
  errorMessage: string
  onSubmit: (data: SubmitFormSchema) => void
  sx?: SxProps<Theme>
}

const SubmitSection: FC<SubmitSectionProps> = ({
  errorMessage,
  onSubmit,
  sx,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SubmitFormSchema>({
    resolver: yupResolver(submitFormSchema),
    defaultValues: { arch: 'x8664', isCE: false },
  })

  const handleKeyDown: KeyboardEventHandler<
    HTMLInputElement | HTMLTextAreaElement
  > = (e) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement
    const value = target.value

    if (e.key === 'Tab') {
      e.preventDefault()

      const cursorPosition = target.selectionStart
      const cursorEndPosition = target.selectionEnd
      const tab = '\t'
      if (cursorPosition === null || cursorEndPosition === null) {
        return
      }

      target.value =
        value.substring(0, cursorPosition) +
        tab +
        value.substring(cursorEndPosition)

      target.selectionStart = cursorPosition + 1
      target.selectionEnd = cursorPosition + 1
    }
  }

  return (
    <Box sx={sx}>
      <TitleLabel label='Submission' sx={{ mb: '2rem' }} />

      <Box>
        <Box sx={{ m: '2rem 0' }}>
          {errorMessage && <Alert severity='error'>{errorMessage}</Alert>}
        </Box>

        <TextField
          color='primary'
          label='submission'
          variant='filled'
          rows={20}
          multiline
          fullWidth
          placeholder='input assembly'
          error={'asm' in errors}
          helperText={errors.asm?.message ?? ''}
          {...register('asm')}
          InputProps={{
            onKeyDown: handleKeyDown,
          }}
          sx={{ '& textarea': { fontFamily: 'monospace' } }}
        />

        <FormControl sx={{ mt: '2rem' }} error={'arch' in errors}>
          <FormLabel>アーキテクチャ</FormLabel>
          <RadioGroup row defaultValue='x8664'>
            <FormControlLabel
              value='x8664'
              control={<Radio {...register('arch')} />}
              label='x86-64'
            />
            <FormControlLabel
              value='riscv'
              control={<Radio {...register('arch')} />}
              label='RISC-V'
            />
          </RadioGroup>
          <FormHelperText>{errors.arch?.message ?? ''}</FormHelperText>
        </FormControl>

          <Box sx={{ display: 'flex', justifyContent: 'center', m: '2rem' }}>
          <Button
            variant='contained'
            size='large'
            sx={{
              width: '300px',
              py: '1.2rem',
              fontSize: '1.1rem',
              fontWeight: '700',
              '&:hover': {
                opacity: 0.8,
              },
            }}
            onClick={handleSubmit(onSubmit)}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default SubmitSection

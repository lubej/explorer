import * as React from 'react'
import SelectUnstyled, { SelectUnstyledProps, selectUnstyledClasses } from '@mui/base/SelectUnstyled'
import OptionUnstyled, { optionUnstyledClasses } from '@mui/base/OptionUnstyled'
import PopperUnstyled from '@mui/base/PopperUnstyled'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { ForwardedRef, forwardRef, memo, ReactElement, useCallback, useId } from 'react'
import Typography from '@mui/material/Typography'
import Button, { ButtonProps } from '@mui/material/Button'
import { COLORS } from '../../../styles/theme/colors'
import chevronUp from '../../icons/chevron-up.svg'
import chevronDown from '../../icons/chevron-down.svg'
import { useTranslation } from 'react-i18next'

const StyledButton = styled(Button)(({ theme }) => ({
  height: 'unset',
  minWidth: '135px',
  padding: `7px ${theme.spacing(4)}`,
  borderRadius: '12px',
  color: COLORS.white,
  textTransform: 'none',
  justifyContent: 'space-between',
  [`&.${selectUnstyledClasses.focusVisible}`]: {
    backgroundColor: COLORS.brandExtraDark,
  },
  [`&.${selectUnstyledClasses.expanded}`]: {
    '&::after': {
      content: `url("${chevronUp}")`,
    },
  },
  '&::after': {
    position: 'absolute',
    right: theme.spacing(3),
    top: 'calc(50% + 3px)',
    transform: 'translateY(-50%)',
    content: `url("${chevronDown}")`,
  },
}))

const StyledListbox = styled('ul')(({ theme }) => ({
  boxSizing: 'border-box',
  padding: theme.spacing(0),
  margin: `${theme.spacing(3)} ${theme.spacing(0)}`,
  minWidth: '135px',
  borderRadius: '12px',
  overflow: 'auto',
  outline: 0,
  background: theme.palette.tertiary.main,
  filter: 'drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25))',
}))

const StyledOption = styled(OptionUnstyled)(({ theme }) => ({
  boxSizing: 'border-box',
  listStyle: 'none',
  padding: `6px ${theme.spacing(4)}`,
  borderRadius: '12px',
  cursor: 'default',
  color: COLORS.white,
  [`&:hover:not(.${optionUnstyledClasses.disabled})`]: {
    cursor: 'pointer',
  },
  [`&:hover:not(.${optionUnstyledClasses.disabled}),
  &.${optionUnstyledClasses.selected},
  &.${optionUnstyledClasses.highlighted}`]: {
    backgroundColor: COLORS.brandExtraDark,
  },
  [`&.${optionUnstyledClasses.disabled}`]: {
    backgroundColor: COLORS.lavenderGray,
  },
  transition: 'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
}))

const StyledPopper = styled(PopperUnstyled)`
  z-index: 1;
`

const TertiaryButton = forwardRef(
  ({ children, ...restProps }: ButtonProps, ref: ForwardedRef<HTMLButtonElement>) => {
    const { t } = useTranslation()

    return (
      <StyledButton ref={ref} color={'tertiary'} {...restProps}>
        <Typography variant="select">{children ? children : t('select.placeholder')}</Typography>
      </StyledButton>
    )
  },
)

const CustomSelect = React.forwardRef(function CustomSelect<TValue extends {}>(
  props: SelectUnstyledProps<TValue>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const slots: SelectUnstyledProps<TValue>['slots'] = {
    root: TertiaryButton,
    listbox: StyledListbox,
    popper: StyledPopper,
    ...props.slots,
  }

  return <SelectUnstyled {...props} ref={ref} slots={slots} />
}) as <TValue extends {}>(
  props: SelectUnstyledProps<TValue> & React.RefAttributes<HTMLButtonElement>,
) => JSX.Element

export interface SelectOptionBase {
  label: string | number
  value: string | number
}

interface SelectProps<T extends SelectOptionBase> {
  label?: string
  options: T[]
  defaultValue?: T['value']
  handleChange?: (selectedOption: T['value'] | null) => void
}

const SelectCmp = <T extends SelectOptionBase>({
  label,
  options,
  defaultValue,
  handleChange,
}: SelectProps<T>): ReactElement => {
  const selectId = useId()

  const onChange = useCallback(
    (
      _: React.MouseEvent | React.KeyboardEvent | React.FocusEvent | null,
      selectedValue: T['value'] | null,
    ) => {
      handleChange?.(selectedValue)
    },
    [handleChange],
  )

  return (
    <Box>
      {label && (
        <label htmlFor={selectId}>
          <Typography variant="body2">{label}</Typography>
        </label>
      )}
      <CustomSelect<T['value']> id={selectId} defaultValue={defaultValue} onChange={onChange}>
        {options.map(({ label, value }) => (
          <StyledOption key={value} value={value}>
            <Typography variant="select">{label}</Typography>
          </StyledOption>
        ))}
      </CustomSelect>
    </Box>
  )
}

export const Select = memo(SelectCmp) as typeof SelectCmp

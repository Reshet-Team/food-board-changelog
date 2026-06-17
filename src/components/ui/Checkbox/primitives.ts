import { styled } from '@/lib/styled'
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import styles from './Checkbox.module.scss'

export const CheckboxRoot = styled(BaseCheckbox.Root, styles.root)
export const CheckboxIndicator = styled(BaseCheckbox.Indicator, styles.indicator)

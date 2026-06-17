import { styled } from '@/lib/styled'
import { Field as BaseField } from '@base-ui/react/field'
import styles from './Field.module.scss'

export default {
  Root: styled(BaseField.Root, styles.root),
  Label: styled(BaseField.Label, styles.label),
  Control: styled(BaseField.Control, styles.control),
  Description: styled(BaseField.Description, styles.description),
  Error: styled(BaseField.Error, styles.error),
  Validity: BaseField.Validity,
  Item: styled(BaseField.Item, styles.item),
}

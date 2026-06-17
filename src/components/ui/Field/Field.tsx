import type { Field as BaseField } from '@base-ui/react/field'
import styles from './Field.module.scss'
import Primitives from './primitives'

const FieldRoot = Primitives.Root

export type FieldLabelIndicator = 'required' | 'optional'

export interface FieldLabelProps extends BaseField.Label.Props {
  indicator?: FieldLabelIndicator
}

function FieldLabel({ indicator, children, ...props }: FieldLabelProps) {
  return (
    <Primitives.Label {...props}>
      {children}
      {indicator === 'required' && (
        <span className={styles.indicatorRequired} aria-hidden>
          *
        </span>
      )}
      {indicator === 'optional' && <span className={styles.indicatorOptional}>(optional)</span>}
    </Primitives.Label>
  )
}

const FieldControl = Primitives.Control
const FieldDescription = Primitives.Description
const FieldError = Primitives.Error
const FieldValidity = Primitives.Validity
const FieldItem = Primitives.Item

export {
  FieldControl,
  FieldDescription,
  FieldError,
  FieldItem,
  FieldLabel,
  FieldRoot,
  FieldValidity,
}

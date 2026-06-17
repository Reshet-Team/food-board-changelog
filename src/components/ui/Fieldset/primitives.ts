import { styled } from '@/lib/styled'
import { Fieldset as BaseFieldset } from '@base-ui/react/fieldset'
import styles from './Fieldset.module.scss'

export default {
  Root: styled(BaseFieldset.Root, styles.root),
  Legend: styled(BaseFieldset.Legend, styles.legend),
}

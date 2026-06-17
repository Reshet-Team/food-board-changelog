import { styled } from '@/lib/styled'
import { Select as BaseSelect } from '@base-ui/react/select'
import styles from './Select.module.scss'

export default {
  Root: BaseSelect.Root,
  Portal: BaseSelect.Portal,
  Trigger: styled(BaseSelect.Trigger, styles.trigger),
  Value: styled(BaseSelect.Value, styles.value),
  Icon: styled(BaseSelect.Icon, styles.icon),
  Positioner: styled(BaseSelect.Positioner, styles.positioner),
  Popup: styled(BaseSelect.Popup, styles.popup),
  List: styled(BaseSelect.List, styles.list),
  Item: styled(BaseSelect.Item, styles.item),
  ItemText: styled(BaseSelect.ItemText, styles.itemText),
  ItemIndicator: styled(BaseSelect.ItemIndicator, styles.itemIndicator),
  Group: BaseSelect.Group,
  GroupLabel: styled(BaseSelect.GroupLabel, styles.groupLabel),
  ScrollUpArrow: styled(BaseSelect.ScrollUpArrow, styles.scrollArrow),
  ScrollDownArrow: styled(BaseSelect.ScrollDownArrow, styles.scrollArrow),
}

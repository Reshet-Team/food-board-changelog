import { styled } from '@/lib/styled'
import { Combobox as BaseCombobox } from '@base-ui/react/combobox'
import styles from './Combobox.module.scss'

export default {
  Root: BaseCombobox.Root,
  Portal: BaseCombobox.Portal,
  Collection: BaseCombobox.Collection,
  Group: BaseCombobox.Group,
  Value: BaseCombobox.Value,
  Label: styled(BaseCombobox.Label, styles.label),
  /** The InputGroup container (styled). Use `ComboboxInput` composite for common layouts. */
  InputGroupRoot: styled(BaseCombobox.InputGroup, styles.inputGroup),
  Input: styled(BaseCombobox.Input, styles.input),
  Trigger: styled(BaseCombobox.Trigger, styles.trigger),
  Clear: styled(BaseCombobox.Clear, styles.clear),
  Icon: styled(BaseCombobox.Icon, styles.icon),
  Positioner: styled(BaseCombobox.Positioner, styles.positioner),
  Popup: styled(BaseCombobox.Popup, styles.popup),
  Empty: styled(BaseCombobox.Empty, styles.empty),
  List: styled(BaseCombobox.List, styles.list),
  Item: styled(BaseCombobox.Item, styles.item),
  ItemIndicator: styled(BaseCombobox.ItemIndicator, styles.itemIndicator),
  GroupLabel: styled(BaseCombobox.GroupLabel, styles.groupLabel),
  Separator: styled(BaseCombobox.Separator, styles.separator),
  Status: styled(BaseCombobox.Status, styles.status),
  Chips: styled(BaseCombobox.Chips, styles.chips),
  Chip: styled(BaseCombobox.Chip, styles.chip),
  ChipRemove: styled(BaseCombobox.ChipRemove, styles.chipRemove),
}

import { styled } from '@/lib/styled'
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip'
import styles from './Tooltip.module.scss'

export default {
  Provider: BaseTooltip.Provider,
  Root: BaseTooltip.Root,
  Trigger: BaseTooltip.Trigger,
  Portal: BaseTooltip.Portal,
  Positioner: styled(BaseTooltip.Positioner, styles.positioner),
  Popup: styled(BaseTooltip.Popup, styles.popup),
  Arrow: styled(BaseTooltip.Arrow, styles.arrow),
  Viewport: styled(BaseTooltip.Viewport, styles.viewport),
}

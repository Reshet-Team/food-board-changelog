import { styled } from '@/lib/styled'
import { Toast as BaseToast } from '@base-ui/react/toast'
import styles from './Toast.module.scss'

export default {
  Provider: BaseToast.Provider,
  Portal: BaseToast.Portal,
  Viewport: styled(BaseToast.Viewport, styles.viewport),
  Root: styled(BaseToast.Root, styles.root),
  Content: styled(BaseToast.Content, styles.content),
  Title: styled(BaseToast.Title, styles.title),
  Description: styled(BaseToast.Description, styles.description),
  Close: styled(BaseToast.Close, styles.close),
  Action: styled(BaseToast.Action, styles.action),
  Positioner: styled(BaseToast.Positioner, styles.positioner),
  Arrow: styled(BaseToast.Arrow, styles.arrow),
}

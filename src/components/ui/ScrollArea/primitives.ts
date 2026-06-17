import { styled } from '@/lib/styled'
import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area'
import styles from './ScrollArea.module.scss'

export default {
  Root: styled(BaseScrollArea.Root, styles.root),
  Viewport: styled(BaseScrollArea.Viewport, styles.viewport),
  Content: styled(BaseScrollArea.Content, styles.content),
  Scrollbar: styled(BaseScrollArea.Scrollbar, styles.scrollbar),
  Thumb: styled(BaseScrollArea.Thumb, styles.thumb),
  Corner: styled(BaseScrollArea.Corner, styles.corner),
}

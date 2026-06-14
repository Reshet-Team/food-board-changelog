import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { useGreeting } from '../hooks/useGreeting'
import styles from './GreetingCard.module.scss'

export function GreetingCard() {
  const { name, setName, greeting } = useGreeting()

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>{greeting}</h1>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="הכנס את שמך"
        />
        <Button onClick={() => setName('')}>איפוס</Button>
      </div>
    </div>
  )
}

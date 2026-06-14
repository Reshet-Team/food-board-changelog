import { GreetingCard } from '@/features/greeting/components/GreetingCard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return <GreetingCard />
}

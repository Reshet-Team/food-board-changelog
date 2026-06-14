import { useState } from 'react'

export function useGreeting() {
  const [name, setName] = useState('')
  const greeting = name ? `שלום, ${name}!` : 'שלום!'
  return { name, setName, greeting }
}

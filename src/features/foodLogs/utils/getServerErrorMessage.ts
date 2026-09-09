// Written in the same comma-separated shape the service uses.
const GENERIC_MESSAGE = 'שגיאה בטעינת הנתונים, אירעה שגיאה בעת טעינת רשומות השינויים.'

// Thrown when the service explains in words why it has no rows, instead of returning them.
export class ServerMessageError extends Error {}

export interface ServerMessage {
  title: string
  description?: string
}

// The service sends one comma-separated line: a headline, then what to try next.
export function getServerMessage(error: unknown): ServerMessage {
  const text = error instanceof ServerMessageError ? error.message.trim() : ''
  // An unreachable backend answers with the SPA's HTML, which is no use to the user.
  const message = text && !text.startsWith('<') ? text : GENERIC_MESSAGE

  const [title = message, description] = message.split(',')
  return { title: title.trim(), ...(description && { description: description.trim() }) }
}

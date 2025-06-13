import { PropagateLoader } from 'react-spinners'

export default function Loading() {
  return (
    <PropagateLoader
      speedMultiplier={0.75}
      className="relative flex flex-1 place-items-center mx-auto"
      color="var(--accent-foreground)" />
  )
}

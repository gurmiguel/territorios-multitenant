export const overrideEvent = <Event extends React.SyntheticEvent>(...handlers: (((e: Event)=> void) | undefined)[]) =>
  (event: Event) => {
    handlers.forEach(handler => handler?.(event))
  }

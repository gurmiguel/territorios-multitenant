export type CustomDialogProps<Context = null> = {
  open: boolean
  onClose: ()=> void
} & (Context extends null ? { context?: never } : { context: Context })

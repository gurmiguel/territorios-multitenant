export interface CustomDialogProps<Context extends object> {
  context: Context
  open: boolean
  onClose: ()=> void
}

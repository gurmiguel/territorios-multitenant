export enum Action {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
}

export const ActionLabels = new Map(Object.entries({
  [Action.READ]: 'Visualizar',
  [Action.WRITE]: 'Alterar',
  [Action.DELETE]: 'Excluir',
} satisfies Record<Action, string>))

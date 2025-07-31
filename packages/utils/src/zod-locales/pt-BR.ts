import { core } from 'zod/v4'

const { util } = core

const error: ()=> core.$ZodErrorMap = () => {
  const Sizable: Record<string, { unit: string; verb: string }> = {
    string: { unit: 'caracteres', verb: 'ter' },
    file: { unit: 'bytes', verb: 'ter' },
    array: { unit: 'itens', verb: 'ter' },
    set: { unit: 'itens', verb: 'ter' },
  }

  function getSizing(origin: string): { unit: string; verb: string } | null {
    return Sizable[origin] ?? null
  }

  const parsedType = (data: any): string => {
    const t = typeof data

    switch (t) {
      case 'number': {
        return Number.isNaN(data) ? 'NaN' : 'número'
      }
      case 'object': {
        if (Array.isArray(data)) {
          return 'array'
        }
        if (data === null) {
          return 'nulo'
        }
        if (Object.getPrototypeOf(data) !== Object.prototype && data.constructor) {
          return data.constructor.name
        }
      }
    }
    return t
  }

  const Nouns: Partial<Record<core.$ZodStringFormats | (string & {}), string>> = {
    regex: 'padrão',
    email: 'endereço de e-mail',
    url: 'URL',
    emoji: 'emoji',
    uuid: 'UUID',
    uuidv4: 'UUIDv4',
    uuidv6: 'UUIDv6',
    nanoid: 'nanoid',
    guid: 'GUID',
    cuid: 'cuid',
    cuid2: 'cuid2',
    ulid: 'ULID',
    xid: 'XID',
    ksuid: 'KSUID',
    datetime: 'data e hora ISO',
    date: 'data ISO',
    time: 'hora ISO',
    duration: 'duração ISO',
    ipv4: 'endereço IPv4',
    ipv6: 'endereço IPv6',
    cidrv4: 'faixa de IPv4',
    cidrv6: 'faixa de IPv6',
    base64: 'texto codificado em base64',
    base64url: 'URL codificada em base64',
    json_string: 'texto JSON',
    e164: 'número E.164',
    jwt: 'JWT',
    template_literal: 'entrada',
  }

  return issue => {
    switch (issue.code) {
      case 'invalid_type':
        return `Tipo inválido: esperado ${issue.expected}, recebido ${parsedType(issue.input)}`
      case 'invalid_value':
        if (issue.values.length === 1) return 'Entrada inválida'
        return 'Opção inválida'
      case 'too_big': {
        const adj = issue.inclusive ? '<=' : '<'
        const sizing = getSizing(issue.origin)
        if (sizing)
          return `Máximo de ${sizing.unit ?? 'elementos'} ${adj}${issue.maximum}`
        return `Muito grande: máximo ${adj}${issue.maximum}`
      }
      case 'too_small': {
        const adj = issue.inclusive ? '>=' : '>'
        const sizing = getSizing(issue.origin)
        if (issue.minimum === 1)
          return 'Campo obrigatório'
        if (sizing)
          return `Mínimo de ${sizing.unit ?? 'elementos'} ${adj}${issue.minimum}`
        return `Muito pequeno: mínimo ${adj}${issue.minimum}`
      }
      case 'invalid_format': {
        const _issue = issue as core.$ZodStringFormatIssues
        if (_issue.format === 'starts_with') return `Inválido: deve começar com "${_issue.prefix}"`
        if (_issue.format === 'ends_with') return `Inválido: deve terminar com "${_issue.suffix}"`
        if (_issue.format === 'includes') return `Inválido: deve incluir "${_issue.includes}"`
        if (_issue.format === 'regex') return `Inválido: deve corresponder ao padrão ${_issue.pattern}`
        return `${Nouns[_issue.format] ?? issue.format} inválido`
      }
      case 'not_multiple_of':
        return `Número inválido: deve ser múltiplo de ${issue.divisor}`
      case 'unrecognized_keys':
        return `Chave${issue.keys.length > 1 ? 's' : ''} desconhecida${issue.keys.length > 1 ? 's' : ''}: ${util.joinValues(issue.keys, ', ')}`
      case 'invalid_key':
        return `Chave inválida em ${issue.origin}`
      case 'invalid_union':
        return 'Entrada inválida'
      case 'invalid_element':
        return `Valor inválido em ${issue.origin}`
      default:
        return 'Campo inválido'
    }
  }
}

export default function (): { localeError: core.$ZodErrorMap } {
  return {
    localeError: error(),
  }
}

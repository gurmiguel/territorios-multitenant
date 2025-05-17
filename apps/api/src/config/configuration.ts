import '@nestjs/config'

function configuration() {
  const host = process.env.HOST ?? 'http://localhost'
  const port = parseInt(process.env.PORT ?? '3333', 10)
  return {
    host,
    port,
    origin: process.env.PROXY_HOST ?? `${host}${port && port !== 80 ? `:${port}` : ''}`,
    auth: {
      secret: process.env.AUTH_SECRET!,
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      },
    },
    constants: {
      /** Amount of time a status update will override the previous one instead of creating a new one */
      statusThreshold: '1 minute',
    },
  }
}

export default configuration

export type Configuration = ReturnType<typeof configuration>

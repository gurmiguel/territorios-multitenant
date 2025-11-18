import '@nestjs/config'

function configuration() {
  const host = process.env.HOST ?? (process.env.HTTPS
    ? 'https://localhost'
    : 'http://localhost')
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
      defaultPassword: process.env.DEFAULT_PASSWORD ?? '@@default',
    },
    constants: {
      /** Amount of time a status update will override the previous one instead of creating a new one */
      statusThreshold: '1 minute',
      statusBleedingLimit: 3,
    },
    s3: {
      accountId: process.env.S3_ACCOUNT_ID!,
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      accessKeySecret: process.env.S3_ACCESS_KEY_SECRET!,
      region: 'auto',
      publicUrl: process.env.S3_PUBLIC_URL!,
      bucket: 'assets',
    },
  }
}

export default configuration

export type Configuration = ReturnType<typeof configuration>

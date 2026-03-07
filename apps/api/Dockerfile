FROM node:24-slim AS base
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package.json ./

RUN npm i -g $(npm pkg get packageManager | tr -d \")
RUN npm i -g turbo@$(npm show turbo version)

FROM base AS prepare
WORKDIR /app

COPY . .
COPY package.json ./
COPY package-lock.json ./
RUN turbo prune api --docker

FROM base AS build
WORKDIR /app

COPY --from=prepare /app/out/json/ .

RUN --mount=type=cache,id=npm,target=/root/.npm \
    npm ci

COPY --from=prepare /app/out/full/ .

ENV NODE_ENV=production

# prisma generate --sql requires a real db connection to work
# so we instantiate a lightweight postgres db during build for usage
RUN apt-get update -y && \
    apt-get install -y postgresql

RUN service postgresql start && \
    until pg_isready -q; do sleep 0.5; done && \
    su postgres -c "psql -c \"ALTER USER postgres WITH PASSWORD 'buildpass';\"" && \
    su postgres -c "createdb builddb" && \
    export DATABASE_URL=postgresql://postgres:buildpass@localhost/builddb && \
    turbo run api#build:ci

FROM base AS runner
WORKDIR /app

COPY --from=build /app/package-lock.json ./
RUN npm i -g prisma@$(npm show prisma version)

ENV NODE_ENV=production

COPY --from=build /app .

WORKDIR /app/apps/api

CMD ["/bin/sh", "-c", "npm run db:migrate && cd ../.. && turbo run api#start --env-mode=loose"]
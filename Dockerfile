FROM node:18-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /ownai

# Install dependencies
COPY package.json pnpm-lock.yaml .
RUN corepack enable pnpm
RUN pnpm i

COPY app ./app
COPY components ./components
COPY lib ./lib
COPY prisma ./prisma
COPY public ./public
COPY styles ./styles
COPY middleware.ts .
COPY next-env.d.ts .
COPY next.config.js .
COPY postcss.config.js .
COPY tailwind.config.ts .
COPY tsconfig.json .

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ARG NEXT_PUBLIC_ROOT_DOMAIN
ENV NEXT_PUBLIC_ROOT_DOMAIN=${NEXT_PUBLIC_ROOT_DOMAIN}
ARG POSTGRES_PRISMA_URL
ENV POSTGRES_PRISMA_URL=${POSTGRES_PRISMA_URL}
ARG POSTGRES_URL_NON_POOLING
ENV POSTGRES_URL_NON_POOLING=${POSTGRES_URL_NON_POOLING}
ARG BLOB_READ_WRITE_TOKEN
ENV BLOB_READ_WRITE_TOKEN=${BLOB_READ_WRITE_TOKEN}
ARG KV_URL
ENV KV_URL=${KV_URL}
ARG KV_REST_API_URL
ENV KV_REST_API_URL=${KV_REST_API_URL}
ARG KV_REST_API_TOKEN
ENV KV_REST_API_TOKEN=${KV_REST_API_TOKEN}
ARG KV_REST_API_READ_ONLY_TOKEN
ENV KV_REST_API_READ_ONLY_TOKEN=${KV_REST_API_READ_ONLY_TOKEN}
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ARG EMAIL_SERVER_USER
ENV EMAIL_SERVER_USER=${EMAIL_SERVER_USER}
ARG EMAIL_SERVER_PASSWORD
ENV EMAIL_SERVER_PASSWORD=${EMAIL_SERVER_PASSWORD}
ARG EMAIL_SERVER_HOST
ENV EMAIL_SERVER_HOST=${EMAIL_SERVER_HOST}
ARG EMAIL_SERVER_PORT
ENV EMAIL_SERVER_PORT=${EMAIL_SERVER_PORT}
ARG EMAIL_FROM
ENV EMAIL_FROM=${EMAIL_FROM}
ARG AUTH_BEARER_TOKEN
ENV AUTH_BEARER_TOKEN=${AUTH_BEARER_TOKEN}
ARG PROJECT_ID_VERCEL
ENV PROJECT_ID_VERCEL=${PROJECT_ID_VERCEL}
ARG TEAM_ID_VERCEL
ENV TEAM_ID_VERCEL=${TEAM_ID_VERCEL}
ARG AI_API_URL
ENV AI_API_URL=${AI_API_URL}
ARG AI_API_KEY
ENV AI_API_KEY=${AI_API_KEY}
ARG AI_API_TYPE
ENV AI_API_TYPE=${AI_API_TYPE}
ARG AI_MODELS
ENV AI_MODELS=${AI_MODELS}
ARG EMBEDDINGS_API_URL
ENV EMBEDDINGS_API_URL=${EMBEDDINGS_API_URL}
ARG EMBEDDINGS_API_KEY
ENV EMBEDDINGS_API_KEY=${EMBEDDINGS_API_KEY}
ARG EMBEDDINGS_API_MODEL
ENV EMBEDDINGS_API_MODEL=${EMBEDDINGS_API_MODEL}
ARG EMBEDDINGS_API_TYPE
ENV EMBEDDINGS_API_TYPE=${EMBEDDINGS_API_TYPE}
ARG STRIPE_API_KEY
ENV STRIPE_API_KEY=${STRIPE_API_KEY}
ARG STRIPE_WEBHOOK_SECRET
ENV STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
ARG STRIPE_PRO_MONTHLY_PLAN_ID
ENV STRIPE_PRO_MONTHLY_PLAN_ID=${STRIPE_PRO_MONTHLY_PLAN_ID}
ARG NEXT_PUBLIC_EXTERNAL_LINKS
ENV NEXT_PUBLIC_EXTERNAL_LINKS=${NEXT_PUBLIC_EXTERNAL_LINKS}
ARG NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS
ENV NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS=${NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS}
ARG NEXT_PUBLIC_ENABLE_SUBDOMAINS
ENV NEXT_PUBLIC_ENABLE_SUBDOMAINS=${NEXT_PUBLIC_ENABLE_SUBDOMAINS}
ARG NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS
ENV NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=${NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS}
ARG NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS
ENV NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=${NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS}
ARG NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS
ENV NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS=${NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS}
ARG NEXT_PUBLIC_ENABLE_LOCALHOST
ENV NEXT_PUBLIC_ENABLE_LOCALHOST=${NEXT_PUBLIC_ENABLE_LOCALHOST}

ENV BUILD_STANDALONE=1
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js
RUN pnpm standalone:build

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /ownai

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --chown=nextjs:nodejs admin.js .
COPY --from=builder --chown=nextjs:nodejs /ownai/public ./public
COPY --from=builder --chown=nextjs:nodejs /ownai/prisma ./prisma

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /ownai/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /ownai/.next/static ./.next/static

# Environment variables must be redefined at run time
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ARG NEXT_PUBLIC_ROOT_DOMAIN
ENV NEXT_PUBLIC_ROOT_DOMAIN=${NEXT_PUBLIC_ROOT_DOMAIN}
ARG POSTGRES_PRISMA_URL
ENV POSTGRES_PRISMA_URL=${POSTGRES_PRISMA_URL}
ARG POSTGRES_URL_NON_POOLING
ENV POSTGRES_URL_NON_POOLING=${POSTGRES_URL_NON_POOLING}
ARG BLOB_READ_WRITE_TOKEN
ENV BLOB_READ_WRITE_TOKEN=${BLOB_READ_WRITE_TOKEN}
ARG KV_URL
ENV KV_URL=${KV_URL}
ARG KV_REST_API_URL
ENV KV_REST_API_URL=${KV_REST_API_URL}
ARG KV_REST_API_TOKEN
ENV KV_REST_API_TOKEN=${KV_REST_API_TOKEN}
ARG KV_REST_API_READ_ONLY_TOKEN
ENV KV_REST_API_READ_ONLY_TOKEN=${KV_REST_API_READ_ONLY_TOKEN}
ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ARG EMAIL_SERVER_USER
ENV EMAIL_SERVER_USER=${EMAIL_SERVER_USER}
ARG EMAIL_SERVER_PASSWORD
ENV EMAIL_SERVER_PASSWORD=${EMAIL_SERVER_PASSWORD}
ARG EMAIL_SERVER_HOST
ENV EMAIL_SERVER_HOST=${EMAIL_SERVER_HOST}
ARG EMAIL_SERVER_PORT
ENV EMAIL_SERVER_PORT=${EMAIL_SERVER_PORT}
ARG EMAIL_FROM
ENV EMAIL_FROM=${EMAIL_FROM}
ARG AUTH_BEARER_TOKEN
ENV AUTH_BEARER_TOKEN=${AUTH_BEARER_TOKEN}
ARG PROJECT_ID_VERCEL
ENV PROJECT_ID_VERCEL=${PROJECT_ID_VERCEL}
ARG TEAM_ID_VERCEL
ENV TEAM_ID_VERCEL=${TEAM_ID_VERCEL}
ARG AI_API_URL
ENV AI_API_URL=${AI_API_URL}
ARG AI_API_KEY
ENV AI_API_KEY=${AI_API_KEY}
ARG AI_API_TYPE
ENV AI_API_TYPE=${AI_API_TYPE}
ARG AI_MODELS
ENV AI_MODELS=${AI_MODELS}
ARG EMBEDDINGS_API_URL
ENV EMBEDDINGS_API_URL=${EMBEDDINGS_API_URL}
ARG EMBEDDINGS_API_KEY
ENV EMBEDDINGS_API_KEY=${EMBEDDINGS_API_KEY}
ARG EMBEDDINGS_API_MODEL
ENV EMBEDDINGS_API_MODEL=${EMBEDDINGS_API_MODEL}
ARG EMBEDDINGS_API_TYPE
ENV EMBEDDINGS_API_TYPE=${EMBEDDINGS_API_TYPE}
ARG STRIPE_API_KEY
ENV STRIPE_API_KEY=${STRIPE_API_KEY}
ARG STRIPE_WEBHOOK_SECRET
ENV STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET}
ARG STRIPE_PRO_MONTHLY_PLAN_ID
ENV STRIPE_PRO_MONTHLY_PLAN_ID=${STRIPE_PRO_MONTHLY_PLAN_ID}
ARG NEXT_PUBLIC_EXTERNAL_LINKS
ENV NEXT_PUBLIC_EXTERNAL_LINKS=${NEXT_PUBLIC_EXTERNAL_LINKS}
ARG NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS
ENV NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS=${NEXT_PUBLIC_SUPPORT_EMAIL_ADDRESS}
ARG NEXT_PUBLIC_ENABLE_SUBDOMAINS
ENV NEXT_PUBLIC_ENABLE_SUBDOMAINS=${NEXT_PUBLIC_ENABLE_SUBDOMAINS}
ARG NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS
ENV NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS=${NEXT_PUBLIC_ENABLE_SUBSCRIPTIONS}
ARG NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS
ENV NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS=${NEXT_PUBLIC_ENABLE_VERCEL_ANALYTICS}
ARG NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS
ENV NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS=${NEXT_PUBLIC_ENABLE_VERCEL_SPEED_INSIGHTS}
ARG NEXT_PUBLIC_ENABLE_LOCALHOST
ENV NEXT_PUBLIC_ENABLE_LOCALHOST=${NEXT_PUBLIC_ENABLE_LOCALHOST}

ENV NEXT_TELEMETRY_DISABLED=1

# Note: Don't expose ports here, Compose will handle that for us

CMD ["npm", "run", "standalone:start"]

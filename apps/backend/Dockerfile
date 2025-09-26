# TODO: fix node version when use for production
FROM node:24-slim AS base
WORKDIR /app

# The web Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update this Dockerfile, the Dockerfile in the web workspace and copy that over to Dockerfile in the docs.

####################
# Builder

FROM base AS builder
RUN npm install -g turbo
COPY . .
RUN turbo prune backend --docker

####################
# Installer

FROM base AS installer

COPY --from=builder /app/out/json/ .
RUN npm ci

COPY --from=builder /app/out/full/ .

####################
# Runner

FROM base AS runner

COPY --from=installer /app .

CMD npm start --workspace=backend
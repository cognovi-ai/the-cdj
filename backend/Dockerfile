# syntax=docker/dockerfile:1

ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine AS dev-build

ENV NODE_ENV=dev

WORKDIR /usr/app

# Run the application as a non-root user.
RUN chown node:node /usr/app

USER node

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci

COPY --chown=node:node . .

EXPOSE 3000

# Run the application. -L for legacy mode to enable hot changes in container
# https://github.com/remy/nodemon?tab=readme-ov-file#application-isnt-restarting
CMD ["npm", "run", "dev"]

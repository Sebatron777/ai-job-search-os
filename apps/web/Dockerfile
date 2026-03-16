FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
COPY . /usr/src/app
WORKDIR /usr/src/app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run -r build
RUN pnpm deploy --filter=web /prod/web

FROM base AS web
COPY --from=build /prod/web /prod/web
WORKDIR /prod/web
RUN pnpm add -g serve
EXPOSE 8080
CMD [ "serve", "-s", "dist", "-l", "8080" ]

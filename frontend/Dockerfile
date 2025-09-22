# syntax=docker/dockerfile:1

FROM node:lts-alpine AS base

ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_FUND=false

WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . ./
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Build stage
FROM base AS build
RUN npm ci --only=production
COPY . ./
RUN npm run build

# Production stage
FROM caddy AS production
WORKDIR /app
COPY Caddyfile ./
RUN caddy fmt Caddyfile --overwrite
COPY --from=build /app/dist ./dist
CMD ["caddy", "run", "--config", "Caddyfile", "--adapter", "caddyfile"]
FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /data
RUN chown -R node:node /data

ENV NODE_ENV=production
# Force webhook registration at startup
ENV FORCE_REGISTER_WEBHOOKS=1

# Make sure the URL in the Docker environment matches your production URL
# Override this when running the container if needed
ENV APP_URL=https://notifier.elyxxa.com
ENV SHOPIFY_APP_URL=https://notifier.elyxxa.com

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli

COPY . .

RUN npm run build

CMD ["npm", "run", "docker-start"]

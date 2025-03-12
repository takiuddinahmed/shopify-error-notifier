FROM node:18-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

# Create data directory for SQLite
RUN mkdir -p /data
RUN chown -R node:node /data

ENV NODE_ENV=production

COPY package.json package-lock.json* ./
COPY .env ./

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli

COPY . .

RUN rm -rf node_modules && \
    npm install && \
    npx prisma generate && \
    npm run build

CMD ["npm", "run", "docker-start"]

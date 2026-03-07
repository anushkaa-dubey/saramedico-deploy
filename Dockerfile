FROM node:20-alpine AS builder

WORKDIR /app

# Copy package installation files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build args can be passed, allowing Next.js to bake them into the client build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js application
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# You need to ensure next.config.ts has output: "standalone" (or copy traditional Next.js build)
# Usually standalone is better, but since it requires config adjustment, we'll try standard next start first.
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT=3000

CMD ["npm", "run", "start"]

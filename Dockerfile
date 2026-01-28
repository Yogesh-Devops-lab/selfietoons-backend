# =========================
# 1️⃣ Build Stage
# =========================
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy only package files first (better cache)
COPY package.json package-lock.json ./

# Install dependencies (including devDeps for build if needed)
RUN npm ci

# Copy the rest of the source
COPY . .

# If you have a build step (optional)
# RUN npm run build


# =========================
# 2️⃣ Production Stage
# =========================
FROM node:20-alpine

# Set NODE_ENV
ENV NODE_ENV=production

# Create app directory
WORKDIR /app

# Copy only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built app from builder
COPY --from=builder /app .

# Expose your app port (change if needed)
EXPOSE 3000

# Start the app
CMD ["node", "main.js"]
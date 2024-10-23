# Stage 1: Install dependencies and build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
COPY apps/express-service ./apps/express-service
COPY libs ./libs
RUN npm install
RUN npm run build --workspace=apps/express-service

# Stage 2: Run the Express service
FROM node:18
WORKDIR /app

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean

# Create required directories
RUN mkdir -p uploads outputs

# Copy built application and dependencies
COPY --from=build /app/apps/express-service/dist /app
COPY --from=build /app/node_modules /app/node_modules

EXPOSE 3000
CMD ["node", "server.js"]

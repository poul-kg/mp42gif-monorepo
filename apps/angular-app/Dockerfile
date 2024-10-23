# Stage 1: Build the Angular app
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
COPY angular.json ./
COPY tsconfig.base.json ./
COPY apps/angular-app ./apps/angular-app
COPY libs ./libs
RUN npm install
RUN npm run build --workspace=apps/angular-app

# Stage 2: Serve the Angular app with Nginx
FROM nginx:alpine
COPY --from=build /app/dist/angular-app/browser /usr/share/nginx/html
COPY apps/angular-app/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

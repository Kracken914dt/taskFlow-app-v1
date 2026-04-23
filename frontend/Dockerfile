# Stage 1: Build
FROM node:20-alpine AS build

WORKDIR /app
ARG BACKEND_URL=/api
ARG VITE_IMPORT_EXPORT_API=
ENV BACKEND_URL=${BACKEND_URL}
ENV VITE_IMPORT_EXPORT_API=${VITE_IMPORT_EXPORT_API}

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
ENV BACKEND_URL=http://backend:3000
COPY nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

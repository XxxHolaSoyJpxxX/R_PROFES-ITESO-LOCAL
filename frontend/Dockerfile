# Build de Angular
FROM node:24 AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy build artifacts to a temporary directory
COPY --from=build /app/dist/public /tmp/build

# Move files to the correct location, handling the potential 'browser' subdirectory
RUN if [ -d "/tmp/build/browser" ]; then \
        cp -r /tmp/build/browser/* /usr/share/nginx/html; \
    else \
        cp -r /tmp/build/* /usr/share/nginx/html; \
    fi && \
    rm -rf /tmp/build

RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

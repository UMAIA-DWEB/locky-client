# Stage 1: build do React
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# em prod o client faz pedidos a /api/* e /auth/* relativos
# (o Nginx faz proxy para o container da API), por isso VITE_API_URL fica vazio
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: servir os ficheiros estaticos com Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

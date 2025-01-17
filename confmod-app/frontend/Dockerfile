FROM node:22 as buildFontend
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginxinc/nginx-unprivileged:stable
EXPOSE 8080
COPY nginx/app-confmod.conf /etc/nginx/conf.d/app-confmod.conf
COPY --from=buildFontend /app/dist/ /www/confmod

# build stage
FROM node:20-alpine as build

# Add ARGs for build-time environment variables
# Add an ARG for each variable you want to pass
ARG VITE_API_URL

# Set the environment variables from the ARGs
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

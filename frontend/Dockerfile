FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Vite inlines VITE_* vars at build time, so the admin area's Azure AD B2C
# config has to be supplied as build args, not container-run-time env.
ARG VITE_AZURE_B2C_TENANT_NAME
ARG VITE_AZURE_B2C_CLIENT_ID
ARG VITE_AZURE_B2C_SIGNIN_POLICY
ARG VITE_AZURE_B2C_RESET_POLICY
ARG VITE_AZURE_B2C_REDIRECT_URI
ENV VITE_AZURE_B2C_TENANT_NAME=$VITE_AZURE_B2C_TENANT_NAME \
    VITE_AZURE_B2C_CLIENT_ID=$VITE_AZURE_B2C_CLIENT_ID \
    VITE_AZURE_B2C_SIGNIN_POLICY=$VITE_AZURE_B2C_SIGNIN_POLICY \
    VITE_AZURE_B2C_RESET_POLICY=$VITE_AZURE_B2C_RESET_POLICY \
    VITE_AZURE_B2C_REDIRECT_URI=$VITE_AZURE_B2C_REDIRECT_URI

RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

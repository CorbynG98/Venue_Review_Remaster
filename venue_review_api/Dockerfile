# Fetching the minified node image on apline linux
FROM node:20
# Create app directory
WORKDIR /src/app
# Declaring env
ENV NODE_ENV production
ENV PORT 443
# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Bundle app source
COPY ./dist ./src/app/dist
COPY ./production.env /src/app/.production.env
# Exposing server port
EXPOSE 443
# Starting our application
CMD [ "npm", "start" ]
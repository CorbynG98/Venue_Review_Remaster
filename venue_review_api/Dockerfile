# Fetching the minified node image on apline linux
FROM node:18
# Create app directory
WORKDIR /src/app
# Declaring env
ENV NODE_ENV production
# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Bundle app source
COPY . .
# Exposing server port
EXPOSE 80
EXPOSE 443
# Starting our application
CMD [ "npm", "start" ]
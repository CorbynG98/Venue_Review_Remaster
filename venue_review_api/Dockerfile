# Fetching the minified node image on apline linux
FROM node:18
# Declaring env
ENV NODE_ENV production
# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Bundle app source
COPY . .
# Exposing server port
EXPOSE 5000
# Starting our application
CMD [ "npm", "start" ]
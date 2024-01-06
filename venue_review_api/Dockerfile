# Fetching the minified node image on apline linux
FROM node:20
# Declaring env
ENV NODE_ENV production
ENV PORT 443
# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev
# Bundle app source
COPY ./dist ./dist
COPY ./.production.env ./.production.env
# Exposing server port
EXPOSE 443
# Starting our application
CMD [ "npm", "start" ]
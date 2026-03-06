# use node image
FROM node:18-alpine

# create app directory
WORKDIR /app

# copy package files
COPY package*.json ./

# install dependencies
RUN npm install

# copy project
COPY . .

# build Next.js app
RUN npm run build

# expose port
EXPOSE 3000

# start
CMD [ "npm","start" ]
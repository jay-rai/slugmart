FROM node:18.17.1
WORKDIR /slugmart/slugmart
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]
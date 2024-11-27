FROM node:18.17.1
WORKDIR /slugmart/slugmart
COPY slugmart/slugmart/package.json ./
RUN npm install
COPY slugmart/slugmart/ ./
EXPOSE 3000
CMD ["npm", "run", "start"]
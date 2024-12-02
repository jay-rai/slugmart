# Use Node.js for the backend
FROM node:18.17.1

# Set working directory
WORKDIR /app/slugmart

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Build the React app
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]

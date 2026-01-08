# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the backend source code
COPY . .

# Expose API port
EXPOSE 8000

# Start the server
CMD ["npm", "start"]

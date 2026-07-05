# Use official lightweight Node.js image
FROM node:18-alpine

# Set the execution environment to production
ENV NODE_ENV=production

# Set working directory inside container
WORKDIR /app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application files
COPY . .

# Expose the port our app runs on
EXPOSE 8080

# Command to run the Express server
CMD ["node", "server.js"]

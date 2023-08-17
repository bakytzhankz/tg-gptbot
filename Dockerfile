FROM node:16-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm ci

# Copy the rest of the application code to the container
COPY . .

# Expose the port your Telegram bot will listen on (replace with the actual port)
EXPOSE 5000

# Define the command to run your application
CMD [ "npm", "start" ]

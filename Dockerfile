# Declare base image
FROM node:17

# Set Working Dir
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy example env to .env
COPY .env.example .env

# Install dependencies
RUN npm install

# Copy all files to the working directory
COPY . .

# Expose the required ports
EXPOSE 6400

# Start the application
CMD [ "node", "." ]
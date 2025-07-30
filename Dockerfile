# Set the container
FROM node:14-alpine
# Set working directory in the container
WORKDIR /usr/src/app
# Copy files
COPY index.html script.js style.css ./
# Expose to port 8080
EXPOSE 8080
# Command to run the app
CMD ["serve", "-s", ".", "-l", "8080"]
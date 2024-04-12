# WebMail System - Client

This is the web-mail system for the client side. To find the client side, please go to: https://github.com/Emmeline1101/webmail-server

## Setup
### Prerequisites
- Node.js and npm (as above)
- Webpack (if not already included in the project dependencies)

### Installation
1. Navigate to the client directory:
`cd path/to/client`

2. Install the required npm packages:
`npm install`

3. Running the Client
To run the client in development mode with hot-reloading:
`npm run start`

4. This command will compile the client application using Webpack and serve it on http://localhost:8080 by default. Open your browser and navigate to this URL to view the app.
To build the client for production:
`npm run build`

This will generate the dist directory inside the client folder, containing the compiled assets ready for deployment.
Development Notes
- The client application expects the server to be running and accessible.
- Make sure any API URLs in the client are pointing to the correct server address and port.
- Use environment variables to manage different API endpoints for development and production environments.

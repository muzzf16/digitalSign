# Deployment Guide for BPR Digital Signage

This guide explains how to deploy the application to a local server (production mode).

## Prerequisites
- **Node.js**: Ensure Node.js (LTS version recommended) is installed on the server.
- **Project Files**: Copy the entire project folder to the server.

## Deployment Steps

1.  **Install Dependencies**
    Open a terminal in the project folder and run:
    ```bash
    npm install
    ```

2.  **Build the Application**
    Build the frontend for production:
    ```bash
    npm run build
    ```
    This will create a `dist` folder containing the optimized static files.

3.  **Start the Server**
    Run the production server:
    ```bash
    npm start
    ```
    This will start the server on port **3001**.

4.  **Access the Application**
    Open a web browser and go to:
    `http://localhost:3001` (or the server's IP address:3001)

## Notes
- The server (`proxy-server.cjs`) handles both the API (`/api/data`) and serving the frontend.
- Data is persisted in `db.json`.
- Ensure port 3001 is open in the firewall if accessing from other machines.

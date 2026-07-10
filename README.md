# TracTechSpares — Factory Direct Tractor & Truck Parts

TracTechSpares is a high-performance, modern, mobile-responsive front-end web application built for showcasing factory-direct commercial vehicle seating, exhausts, and tractor spare parts directly to fleet operators and agricultural buyers.

This project is fully deployable, containerized, and structured to integrate seamlessly into production environments.

---

## 🚀 Key Features

*   **Premium Visual Showcase:** Complete integration of high-resolution product imagery and installation demo videos directly from manufacturing visual logs.
*   **Dynamic Product Routing:** Lightweight, client-side dynamic routing utilizing a centralized JavaScript database schema. Supports infinite product expansion from a single HTML detail template.
*   **Fully Functional Shopping Cart:** Persistent local storage cart integration with automated subtotaling, multi-item quantities adjustments, tax (GST 18%) calculations, and free delivery thresholds.
*   **Production Ready Server:** Backed by a lightweight Node.js Express server ready for cloud deployment.
*   **Containerized (Docker):** Standard container support with Alpine-grade layers and builds.

---

## 🛠️ Local Development Setup

To run the application locally, you have two options depending on your system tools.

### Option 1: Standard Node.js (Recommended)
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

1.  Clone the repository and open the workspace.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## 🐳 Containerization with Docker

This application is fully containerized. To build and run the Docker container locally:

1.  **Build the Docker image:**
    ```bash
    docker build -t tractechspares-frontend .
    ```
2.  **Run the container:**
    ```bash
    docker run -d -p 8080:8080 --name tractechspares-showcase tractechspares-frontend
    ```
3.  Open [http://localhost:8080](http://localhost:8080) to view the running container app.

---

## ☁️ Cloud Deployment Guide

This front-end can be deployed to a wide range of platforms:

### 1. Static Web Hosting (Vercel, Netlify, GitHub Pages)
Because this is a high-performance static SPA layout, you can deploy it directly without Node.js if desired:
*   **Vercel / Netlify:** Import the project root directly from GitHub. The platform will automatically recognize the static files and serve them worldwide with zero configuration needed.

### 2. Containerized Hosting (Google Cloud Run, AWS ECS, Azure Container App)
*   Deploy using the provided `Dockerfile`. This is the most secure and robust option for enterprise deployment.
*   For **Google Cloud Run**, run:
    ```bash
    gcloud run deploy tractechspares-showcase --source .
    ```

### 3. Node.js Hosting (Render, Heroku)
*   Link your GitHub repository to Render/Heroku.
*   Set the build command to `npm install` and start command to `npm start`.

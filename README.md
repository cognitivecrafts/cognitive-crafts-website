# Cognitive Crafts Website

This repository contains the codebase for the Cognitive Crafts website, a modern, responsive web application built using React and Tailwind CSS. The website serves as a digital presence for Cognitive Crafts, showcasing their expertise in AI and Java development, their services, products, leadership, and industry insights.

## Technologies Used

- **React:** Frontend JavaScript library for building user interfaces.
- **PocketBase:** Integrated backend for authentication, database, and file storage.
- **Lucide-React:** Feather-light and customizable SVG icons.
- **CSS:** Custom styling for components.

---

## 🚀 Deployment Guide

To deploy your application and make it accessible to others, you need to deploy the backend (PocketBase) and the frontend (React app) separately. This guide outlines how to do so for free using **Fly.io** for the backend and **Netlify/Vercel** for the frontend.

### Step 1: Deploy the PocketBase Backend to Fly.io

Fly.io allows you to deploy a server application for free. We will use it to host your PocketBase backend.

#### 1.1: Install Fly.io's Command-Line Tool (`flyctl`)

You'll need `flyctl` to deploy your application. Open your terminal and run the appropriate command for your operating system (you only need to do this once).

-   **macOS**: `brew install flyctl`
-   **Windows**: `iwr https://fly.io/install.ps1 -useb | iex`
-   **Linux**: `curl -L https://fly.io/install.sh | sh`

After installation, sign up for a Fly.io account by running:
`flyctl auth signup`

This will open your web browser to create an account. You may be asked for credit card details for identity verification, but you **will not be charged** as long as you stay within the free tier.

#### 1.2: Prepare Your Backend for Deployment

1.  **Create a `backend` directory**: To keep things organized, create a new folder named `backend` in the root of your project.
2.  **Move PocketBase data**: Move your `pb_data`, `pb_migrations`, and `pocketbase` executable (if you have it) into this new `backend` folder.
3.  **Navigate into the folder**: `cd backend`

#### 1.3: Launch the App on Fly.io

Now, run the launch command inside the `backend` directory:

`flyctl launch`

`flyctl` will automatically detect PocketBase and guide you through a few questions:

-   **App Name**: Choose a unique name (e.g., `cognitive-crafts-app`). This will become part of your URL.
-   **Region**: Select the region closest to you or your users.
-   **Create a volume to store your data?**: **Yes**. This is critical. It creates a persistent storage disk for your PocketBase SQLite database and files, so your data isn't lost when the app restarts.

This command creates a `fly.toml` file, which is your app's configuration.

#### 1.4: Deploy to Fly.io

After the launch command finishes, deploy your application:

`flyctl deploy`

This will package and upload your PocketBase server. Once complete, your backend will be live. You can get your backend's public URL by running:

`flyctl status`

Look for the **Hostname**. It will be something like `https://your-app-name.fly.dev`.

### Step 2: Update Your Frontend with the New Backend URL

Your React app needs to know where to send its API requests.

1.  **Edit the config file**: Open `src/lib/pocketbase.js`.
2.  **Change the URL**: Replace the old URL with the new public backend URL you got from Fly.io.

    ```javascript
    // src/lib/pocketbase.js

    import PocketBase from 'pocketbase';

    // ✅ REPLACE THIS with your live backend URL from Fly.io
    const pb = new PocketBase('https://your-app-name.fly.dev'); 
    
    pb.autoCancellation(false);

    export default pb;
    ```

### Step 3: Deploy the React Frontend (Free)

You can host your static React site on **Netlify** or **Vercel** for free.

1.  **Choose a Hosting Provider**: Sign up for an account at [Netlify](https://www.netlify.com/) or [Vercel](https://vercel.com/).
2.  **Connect Your Repository**: Link your GitHub/GitLab/Bitbucket account and select this project's repository.
3.  **Configure Build Settings**: The provider will likely auto-detect that it's a React app. Ensure the settings are as follows:
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `build`
4.  **Deploy**: Click the deploy button. The service will build and host your site on a public URL.

Once deployment is complete, your application will be fully live and accessible to the public, with the frontend correctly communicating with your new backend on Fly.io.

# Cognitive Crafts Website

## Project Description

This repository contains the codebase for the Cognitive Crafts website, a modern, responsive web application built using React and Tailwind CSS. The website serves as a digital presence for Cognitive Crafts, showcasing their expertise in AI and Java development, their services, products, leadership, and industry insights.

The project follows a component-based architecture, making it modular and easy to maintain. It features smooth scrolling between sections, dark mode support, and responsive design for various devices.

## Technologies Used

- **React:** Frontend JavaScript library for building user interfaces.
- **PocketBase:** Integrated backend for authentication, database, and file storage.
- **Lucide-React:** Feather-light and customizable SVG icons.
- **CSS:** Custom styling for components.

## Deployment Guide

To deploy your application and make it accessible to others, you need to deploy the backend (PocketBase) and the frontend (React app) separately.

### Step 1: Deploy the PocketBase Backend

Your PocketBase server needs to be hosted on a public server. For ease of use, we recommend a service like **PocketHost.io**, which offers a free tier for PocketBase hosting.

1.  **Sign Up**: Go to [PocketHost.io](https://pockethost.io) and create a free account.
2.  **Create a New Instance**: From your PocketHost dashboard, create a new PocketBase instance. Give it a name (e.g., `cognitive-crafts-app`).
3.  **Get Your Backend URL**: PocketHost will provide you with a public URL for your backend, which will look something like this: `https://your-app-name.pockethost.io`. **Copy this URL.**
4.  **Migrate Your Data (Optional)**: If you have existing data and collections in your local `pb_data` directory, you can upload a zip of this directory to your PocketHost instance via their admin dashboard. Otherwise, you can re-create your collections using the hosted admin UI.

### Step 2: Update Your Frontend Code

Your React app needs to know the address of your now-public backend.

1.  **Edit the PocketBase configuration file**: Open the file `src/lib/pocketbase.js`.
2.  **Change the URL**: On line 3, replace the local URL with the public backend URL you got from PocketHost.

    ```javascript
    // src/lib/pocketbase.js

    import PocketBase from 'pocketbase';

    // REPLACE THIS URL with your live backend URL
    const pb = new PocketBase('https://your-app-name.pockethost.io/'); 
    
    pb.autoCancellation(false);

    export default pb;
    ```

### Step 3: Deploy the React Frontend

You can host your static React site on various platforms. **Netlify** and **Vercel** are excellent free options that can connect directly to your code repository.

1.  **Choose a Hosting Provider**: Sign up for an account at [Netlify](https.com) or [Vercel](https://vercel.com).
2.  **Connect Your Repository**: Link your GitHub, GitLab, or Bitbucket account and select this project's repository.
3.  **Configure Build Settings**: The hosting provider will auto-detect that you have a React app. Ensure the build settings are configured as follows (this is usually the default):
    -   **Build Command**: `npm run build`
    -   **Publish Directory**: `build` (or `dist` if your project is configured differently)
4.  **Deploy**: Click the deploy button. The service will build your application and host it on a public URL (e.g., `https://your-site-name.netlify.app`).

Once deployment is complete, your app will be live and accessible to anyone with the link. Your frontend will be making live API calls to your public PocketBase backend.

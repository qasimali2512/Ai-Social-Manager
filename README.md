🚀 AI Social Manager

<div align="center">

Create • Schedule • Publish • Analyze

AI-powered social media management platform for creating content, managing connected accounts, scheduling posts, and tracking performance from one dashboard.

<br/>








</div>

✨ Overview

AI Social Manager is a full-stack social media management application built to simplify the complete content workflow.

Instead of switching between different tools, users can manage content from a single workspace:

🤖 Generate AI-powered social media content

🖼️ Generate and store post media

✍️ Edit and manage posts

📅 Schedule publications

🔗 Connect social media accounts

🚀 Publish content to supported platforms

📊 View analytics and platform performance

🔔 Manage notifications

🗂️ Keep track of post history

📋 Reuse content templates

🔐 Handle authentication and protected application routes

The application combines a React frontend, FastAPI backend, Supabase, Cloudflare Workers AI, OAuth integrations, and automation services into one platform.

🎯 Project Goals

The project was designed around a simple idea:

Create once. Manage everywhere.

The goal is to provide a centralized social media workspace where content creation, scheduling, publishing, account management, and analytics can be handled without maintaining separate workflows for every platform.

🧩 Core Features

🤖 AI Content Generation

Generate social media copy based on:

Topic

Platform

Tone

Language

Content length

Hashtag preference

Emoji preference

The backend integrates directly with Cloudflare Workers AI for text generation.

🖼️ AI Image Generation

Generate post visuals using an AI image model and store generated media in Supabase Storage.

Generated images can then be attached to posts and used as publication media.

✍️ Post Composer

Create and manage posts with:

Title

Caption/content

Topic

Tone

Language

Media

Draft status

Publication information

📅 Content Calendar

Manage scheduled content through the calendar interface and schedule publications for future dates.

The backend also includes a scheduler loop that checks for due publications.

🔗 Social Account Management

The application contains platform/account management flows and OAuth support for supported integrations.

Platform adapters are organized separately so publishing logic can be handled per platform.

🚀 Publishing

The backend includes publication and publishing services for handling:

Immediate publishing

Scheduled publishing

Publication records

Platform/account resolution

Media attachment

Publishing status

📊 Analytics

The dashboard includes analytics-related functionality for monitoring social media performance and synchronizing analytics data.

🔔 Notifications

Users can:

View notifications

Check unread notification count

Mark individual notifications as read

Mark all notifications as read

🗂️ History

The application provides a history section for previously generated/managed content and activity.

📋 Templates

Reusable content templates can be managed from the Templates section.

🔐 Authentication

The frontend uses an authentication context and protected routes to control access to application pages.

🌐 Supported Platform Integrations

The codebase contains platform adapters and OAuth configuration for:

Platform

Integration

LinkedIn

OAuth + publishing

Facebook

OAuth / social account flow

Instagram

OAuth / social account flow

X

OAuth + publishing

YouTube

OAuth + publishing

TikTok

OAuth configuration + publishing flow

Zernio

Account connection / publishing integration

Platform capabilities depend on the APIs, permissions, developer applications, account types, and access scopes configured for each provider.

🏗️ Architecture

┌───────────────────────────────────────────────────────────────┐
│                       AI SOCIAL MANAGER                       │
└───────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐         ┌────────▼────────┐
        │ React Frontend │         │ FastAPI Backend │
        │     + Vite     │         │     + Python    │
        └───────┬────────┘         └────────┬────────┘
                │                           │
                │                  ┌────────┼───────────────┐
                │                  │        │               │
                │            ┌─────▼───┐ ┌──▼─────────┐ ┌──▼────────────┐
                │            │ Supabase│ │ Cloudflare │ │ OAuth / Social│
                │            │ DB/Store│ │ Workers AI │ │ Platforms     │
                │            └─────────┘ └────────────┘ └───────────────┘
                │
                └────────────── API Requests ────────────────►

🛠️ Tech Stack

Frontend

React 19

Vite 8

React Router 7

Axios

Lucide React

CSS

Backend

Python

FastAPI

Pydantic Settings

HTTPX

REST API architecture

Background scheduler loop

Database & Storage

Supabase

PostgreSQL-backed database

Supabase Storage

Post/media/account/publication data

AI

Cloudflare Workers AI

AI text generation

AI image generation

Automation

n8n

Approval/publishing automation support

Integrations

LinkedIn

Facebook

Instagram

X

YouTube

TikTok

Zernio

📁 Project Structure

ai-social-manager/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── analytics.py
│   │   │   ├── calendar.py
│   │   │   ├── dashboard.py
│   │   │   ├── generate.py
│   │   │   ├── media.py
│   │   │   ├── notifications.py
│   │   │   ├── oauth.py
│   │   │   ├── platforms.py
│   │   │   ├── posts.py
│   │   │   ├── publications.py
│   │   │   ├── publish.py
│   │   │   ├── scheduler.py
│   │   │   ├── social_accounts.py
│   │   │   └── zernio.py
│   │   │
│   │   ├── core/
│   │   │   ├── auth.py
│   │   │   └── config.py
│   │   │
│   │   ├── db/
│   │   │   ├── schema.sql
│   │   │   └── supabase.py
│   │   │
│   │   ├── schemas/
│   │   ├── services/
│   │   │   ├── ai_post_service.py
│   │   │   ├── analytics_service.py
│   │   │   ├── calendar_service.py
│   │   │   ├── cloudflare_ai.py
│   │   │   ├── media_service.py
│   │   │   ├── oauth_service.py
│   │   │   ├── publication_service.py
│   │   │   ├── publisher_service.py
│   │   │   ├── scheduler_service.py
│   │   │   ├── social_account_service.py
│   │   │   ├── storage_service.py
│   │   │   └── platform_adapters/
│   │   │
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── lib/
│   │   ├── pages/
│   │   │   ├── Accounts/
│   │   │   ├── Analytics/
│   │   │   ├── Auth/
│   │   │   ├── Calendar/
│   │   │   ├── CreatePost/
│   │   │   ├── Dashboard/
│   │   │   ├── History/
│   │   │   ├── Landing/
│   │   │   ├── Notifications/
│   │   │   ├── Posts/
│   │   │   ├── Settings/
│   │   │   └── Templates/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
└── README.md

🔄 Application Flow

1. Generate Content

User
  ↓
Create Post
  ↓
Select topic / tone / language / platform
  ↓
FastAPI API
  ↓
Cloudflare Workers AI
  ↓
Generated caption

2. Generate Image

User Prompt
    ↓
FastAPI
    ↓
Cloudflare Workers AI
    ↓
Generated Image
    ↓
Supabase Storage
    ↓
Post Media

3. Schedule a Post

Create Post
    ↓
Select Social Account
    ↓
Choose Date & Time
    ↓
Create Publication
    ↓
Scheduler
    ↓
Due Publication
    ↓
Publisher
    ↓
Social Platform

🚀 Getting Started

1. Clone the Repository

git clone https://github.com/YOUR_USERNAME/ai-social-manager.git
cd ai-social-manager

2. Backend Setup

Open the backend directory:

cd backend

Create a virtual environment:

Windows

python -m venv venv
venv\Scripts\activate

macOS / Linux

python3 -m venv venv
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

3. Backend Environment Variables

Create:

backend/.env

Use the following structure:

# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# Application
DEMO_USER_ID=
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://127.0.0.1:8000
REQUIRE_AUTH=false

# n8n
N8N_APPROVAL_WEBHOOK_URL=

# Cloudflare Workers AI
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_TEXT_MODEL=@cf/zai-org/glm-4.7-flash
CLOUDFLARE_IMAGE_MODEL=@cf/black-forest-labs/flux-2-klein-9b
CLOUDFLARE_IMAGE_STEPS=20

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_SCOPES=openid profile email w_member_social

# YouTube / Google
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_SCOPES=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly
YOUTUBE_REDIRECT_URI=

# Meta - Facebook / Instagram
META_CLIENT_ID=
META_CLIENT_SECRET=
META_SCOPES=pages_show_list pages_read_engagement instagram_basic instagram_content_publish

# X
X_CLIENT_ID=
X_CLIENT_SECRET=
X_SCOPES=tweet.read tweet.write users.read offline.access media.write

# Zernio
ZERNIO_API_KEY=
ZERNIO_PROFILE_ID=
ZERNIO_API_BASE_URL=https://zernio.com/api/v1

# TikTok
TIKTOK_CLIENT_KEY=
TIKTOK_CLIENT_SECRET=
TIKTOK_REDIRECT_URI=
TIKTOK_SCOPES=user.info.basic video.publish

⚠️ Never commit real API keys, OAuth secrets, Supabase service credentials, or tokens to GitHub.

4. Database Setup

Create/configure a Supabase project and apply the SQL schema from:

backend/app/db/schema.sql

Then configure:

SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_key

For generated images, configure the required Supabase Storage bucket used by the backend.

5. Start the Backend

From:

backend/

run:

uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Health check:

http://127.0.0.1:8000/health

API root:

http://127.0.0.1:8000/

6. Frontend Setup

Open a second terminal:

cd frontend

Install dependencies:

npm install

Start development server:

npm run dev

The Vite development server normally runs at:

http://localhost:5173

🔐 Frontend Environment

Create:

frontend/.env

Configure the frontend variables expected by your frontend Supabase/API configuration.

Example:

VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

Use the exact variable names required by the frontend code/configuration in your deployment.

🧪 Development Commands

Frontend

npm run dev

Production build:

npm run build

Preview production build:

npm run preview

Lint:

npm run lint

Backend

Development server:

uvicorn app.main:app --reload

Production-style server:

uvicorn app.main:app --host 0.0.0.0 --port 8000

🔌 API Modules

The FastAPI backend is organized into modular routers:

Module

Purpose

/analytics

Analytics and synchronization

/calendar

Calendar events

/dashboard

Dashboard data

/generate

AI content generation

/media

Media upload and management

/notifications

Notifications

/oauth

Social platform OAuth

/platforms

Platform configuration

/posts

Post CRUD and media

/publications

Publication scheduling

/publish

Publishing

/scheduler

Scheduled post processing

/social_accounts

Connected accounts

/zernio

Zernio integration

🧠 AI Layer

The application currently uses Cloudflare Workers AI directly from the backend for AI generation.

Text Generation

Configured model:

@cf/zai-org/glm-4.7-flash

Image Generation

Configured model:

@cf/black-forest-labs/flux-2-klein-9b

The AI service handles:

Prompt construction

Text generation

Image generation

API response parsing

Base64 image handling

Error handling

🗃️ Media Storage

Generated images are uploaded to Supabase Storage.

The backend stores media information in the database and associates media with posts.

AI Image
   ↓
Base64
   ↓
FastAPI
   ↓
Supabase Storage
   ↓
Public Media URL
   ↓
Post / Post Media

🔐 Security Notes

Before deploying this project:

Keep .env files out of Git

Rotate any credentials that were accidentally exposed

Use restricted API tokens where possible

Configure OAuth redirect URLs correctly

Use HTTPS in production

Configure appropriate CORS origins

Avoid logging full secrets or access tokens

Use production authentication settings

Review provider-specific permissions/scopes

🌍 Production Deployment

The application can be deployed as two major parts:

                    Internet
                       │
              ┌────────▼────────┐
              │   Frontend      │
              │ React + Vite    │
              └────────┬────────┘
                       │
                    HTTPS
                       │
              ┌────────▼────────┐
              │    Backend      │
              │    FastAPI      │
              └──────┬─┬─┬──────┘
                     │ │ │
          ┌──────────┘ │ └──────────┐
          ▼            ▼            ▼
      Supabase      Cloudflare   Social APIs
      DB/Storage      Workers AI   + OAuth

For production, update:

FRONTEND_URL=https://your-frontend-domain.com
BACKEND_URL=https://your-backend-domain.com

and configure every OAuth provider with the production callback URL.

📸 Screenshots

Add your project screenshots here after pushing the repository:

## 📸 Screenshots

### Landing Page
![Landing Page](./screenshots/landing.png)

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Create Post
![Create Post](./screenshots/create-post.png)

### Analytics
![Analytics](./screenshots/analytics.png)

Recommended GitHub folder:

screenshots/
├── landing.png
├── dashboard.png
├── create-post.png
├── calendar.png
├── analytics.png
└── accounts.png

🗺️ Roadmap

AI text generation

AI image generation

Post creation

Media storage

Social account management

OAuth architecture

Scheduling system

Publishing architecture

Analytics module

Notifications

Templates

History

Advanced AI content optimization

Deeper platform-specific analytics

Improved campaign management

Advanced approval workflows

More automated content recommendations

Expanded platform integrations

💡 Why This Project?

Managing multiple social platforms manually can become repetitive:

Create content
     ↓
Resize / prepare media
     ↓
Open platform
     ↓
Write caption
     ↓
Upload media
     ↓
Schedule
     ↓
Repeat...

AI Social Manager aims to turn that into:

              AI SOCIAL MANAGER

                    ↓

        Generate → Edit → Schedule
                    ↓
                 Publish
                    ↓
                Analyze

One workspace. One workflow.

🤝 Contributing

Contributions are welcome.

Fork the repository

Create a feature branch

git checkout -b feature/your-feature

Commit your changes

git commit -m "Add your feature"

Push the branch

git push origin feature/your-feature

Open a Pull Request

🐛 Issues & Feedback

If you find a bug or have an improvement idea, please open an issue with:

Clear description

Steps to reproduce

Expected behavior

Actual behavior

Relevant logs/screenshots

Environment details

📄 License

Add your preferred license before publishing the repository.

For example:

MIT License

<div align="center">

⭐ If you find this project interesting, consider giving it a star!

AI Social Manager — AI-powered social media management from one workspace.

Built with ❤️ using React, FastAPI, Supabase & Cloudflare Workers AI.

</div>
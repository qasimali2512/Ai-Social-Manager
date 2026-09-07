<div align="center">

🤖 AI Social Manager

AI-Powered Social Media Management Platform

Create content. Generate visuals. Connect platforms. Schedule posts. Publish everywhere. Analyze performance.

<br>









<br>





</div>

<br>

✨ What is AI Social Manager?

AI Social Manager is a modern full-stack platform designed to bring the entire social-media workflow into one intelligent workspace.

Instead of creating content manually, switching between platforms, uploading media repeatedly, and tracking posts separately, the platform provides a centralized workflow for:

AI Content → Media → Post → Schedule → Publish → Analytics

🎯 The idea: Build one workspace that makes social-media management faster, smarter, and easier to automate.

🖥️ Platform at a Glance

<div align="center">

🤖 AI

📅 Planning

🚀 Publishing

📊 Insights

Text Generation

Content Calendar

Multi-platform

Analytics

Image Generation

Scheduling

OAuth Accounts

Performance

Smart Prompts

Templates

Publishing Queue

Activity

AI Workflows

History

Media Management

Notifications

</div>

🌟 Features

🤖 AI Content Generation

Generate social-media content with AI based on the requirements of the post.

✍️ AI-generated captions

🎯 Topic-based content

🎨 Tone selection

🌍 Language support

#️⃣ Hashtag generation

😊 Emoji preferences

📱 Platform-oriented content

🎨 AI Image Generation

Create visuals for social posts without leaving the application.

Prompt
  │
  ▼
Cloudflare Workers AI
  │
  ▼
Generated Image
  │
  ▼
Supabase Storage
  │
  ▼
Attach to Post

📝 Smart Post Composer

Create, edit, save and manage posts from one interface.

Post workflow:

Draft → Edit → Schedule → Publish → Track

Supports:

Captions

Topics

Tone

Languages

Media

Social accounts

Publication date/time

Drafts

Publishing status

📅 Content Calendar

Plan your social content visually with a centralized calendar.

Schedule future posts

View planned content

Manage publication dates

Track scheduled content

Connect scheduled posts with the publishing system

🔗 Social Account Management

Connect social platforms through OAuth-based account flows.

Integrations include:

Platform

Purpose

🔵 LinkedIn

OAuth + publishing

🔵 Facebook

Account / publishing flow

🟣 Instagram

Account / publishing flow

⚫ X

OAuth + publishing

🔴 YouTube

OAuth + publishing

⚫ TikTok

OAuth + publishing flow

🟢 Zernio

Account + publishing integration

Platform capabilities depend on each provider's API permissions, scopes, developer application, and account requirements.

🚀 Automated Publishing

A dedicated publishing layer handles publication requests and scheduled posts.

                    POST
                     │
          ┌──────────┴──────────┐
          │                     │
       Publish Now          Schedule
          │                     │
          │                Scheduler
          │                     │
          └──────────┬──────────┘
                     ▼
               Publisher
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       LinkedIn     X        YouTube
          │          │          │
          └──────────┴──────────┘
                     ▼
                  Status

📊 Analytics Dashboard

Track social-media activity and performance from the dashboard.

Includes architecture for:

Analytics synchronization

Platform metrics

Performance tracking

Dashboard summaries

Activity monitoring

🔔 Notifications

Stay informed about important account and publishing activity.

🔴 Unread count

📬 Notification list

✅ Mark as read

✅ Mark all as read

📋 Templates

Create reusable content templates to speed up repetitive content creation.

🗂️ History

Keep track of previously created and managed content from a centralized history section.

🧠 AI Layer

The AI layer is powered by Cloudflare Workers AI.

Text Model

@cf/zai-org/glm-4.7-flash

Image Model

@cf/black-forest-labs/flux-2-klein-9b

AI Pipeline

                 USER
                   │
                   ▼
            Prompt / Topic
                   │
                   ▼
            FastAPI Backend
                   │
          ┌────────┴────────┐
          ▼                 ▼
     Text Generation   Image Generation
          │                 │
          └────────┬────────┘
                   ▼
                Post
                   │
                   ▼
             Supabase

🏗️ Architecture

<div align="center">

Full-Stack Architecture

</div>

┌─────────────────────────────────────────────────────────────────┐
│                         AI SOCIAL MANAGER                       │
└─────────────────────────────────────────────────────────────────┘

                         USER / BROWSER
                               │
                               ▼
                  ┌─────────────────────────┐
                  │      React + Vite       │
                  │                         │
                  │  Dashboard              │
                  │  Posts                  │
                  │  Calendar               │
                  │  Analytics              │
                  │  Accounts               │
                  │  Templates              │
                  └────────────┬────────────┘
                               │
                            REST API
                               │
                               ▼
                  ┌─────────────────────────┐
                  │       FastAPI           │
                  │                         │
                  │  API Routers            │
                  │  Services               │
                  │  OAuth                  │
                  │  Publishing             │
                  │  Scheduler              │
                  │  AI Services             │
                  └───────┬─────┬─────┬──────┘
                          │     │     │
             ┌────────────┘     │     └─────────────┐
             ▼                  ▼                   ▼
      ┌────────────┐    ┌──────────────┐    ┌───────────────┐
      │  Supabase  │    │ Cloudflare   │    │ Social APIs   │
      │            │    │ Workers AI   │    │               │
      │ DB         │    │              │    │ OAuth         │
      │ Storage    │    │ Text + Image │    │ Publishing    │
      └────────────┘    └──────────────┘    └───────────────┘
                               │
                               ▼
                         ┌───────────┐
                         │    n8n    │
                         │Automation │
                         └───────────┘

🧰 Tech Stack

<div align="center">

Layer

Technologies

🎨 Frontend

React 19, Vite, React Router, Axios, Lucide React

⚡ Backend

Python, FastAPI, Pydantic Settings, HTTPX

🗄️ Database

Supabase / PostgreSQL

📦 Storage

Supabase Storage

🧠 AI

Cloudflare Workers AI

🔐 Authentication

OAuth + application authentication

🔄 Automation

n8n

🌐 Integrations

LinkedIn, Facebook, Instagram, X, YouTube, TikTok, Zernio

🚀 Deployment

Vercel / AWS-compatible deployment architecture

</div>

📂 Project Structure

AI-Social-Manager/
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
│   │   │
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
├── screenshots/
│   ├── landing.png
│   ├── dashboard.png
│   ├── create-post.png
│   ├── calendar.png
│   └── analytics.png
│
├── .gitignore
└── README.md

⚙️ Installation

1. Clone

git clone https://github.com/YOUR_USERNAME/ai-social-manager.git
cd ai-social-manager

2. Backend

cd backend

Create virtual environment:

Windows

python -m venv venv
venv\Scripts\activate

Linux / macOS

python3 -m venv venv
source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run backend:

uvicorn app.main:app --reload

API:

http://127.0.0.1:8000

Docs:

http://127.0.0.1:8000/docs

🎨 Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

Production build:

npm run build

🔐 Environment Variables

Create:

backend/.env

Example configuration:

# Application
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://127.0.0.1:8000
REQUIRE_AUTH=false

# Supabase
SUPABASE_URL=
SUPABASE_KEY=

# Cloudflare Workers AI
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_TEXT_MODEL=@cf/zai-org/glm-4.7-flash
CLOUDFLARE_IMAGE_MODEL=@cf/black-forest-labs/flux-2-klein-9b
CLOUDFLARE_IMAGE_STEPS=20

# n8n
N8N_APPROVAL_WEBHOOK_URL=

# LinkedIn
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_SCOPES=openid profile email w_member_social

# YouTube
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_SCOPES=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly
YOUTUBE_REDIRECT_URI=

# Meta
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

⚠️ Security

Never push real secrets to GitHub.

Keep these files private:

.env
.env.local
.env.production

🔄 Core Workflow

<div align="center">

┌──────────────┐
│   💡 IDEA    │
└──────┬───────┘
       ▼
┌──────────────┐
│  🤖 AI TEXT  │
└──────┬───────┘
       ▼
┌──────────────┐
│ 🎨 AI MEDIA  │
└──────┬───────┘
       ▼
┌──────────────┐
│ 📝 EDIT POST │
└──────┬───────┘
       ▼
┌──────────────┐
│ 📅 SCHEDULE  │
└──────┬───────┘
       ▼
┌──────────────┐
│ 🚀 PUBLISH   │
└──────┬───────┘
       ▼
┌──────────────┐
│ 📊 ANALYZE   │
└──────────────┘

</div>

📸 Screenshots

Add your real screenshots to the screenshots/ directory.

🏠 Landing Page

<img src="./screenshots/landing.png" alt="AI Social Manager Landing Page" width="900"/>

📊 Dashboard

<img src="./screenshots/dashboard.png" alt="AI Social Manager Dashboard" width="900"/>

✍️ Create Post

<img src="./screenshots/create-post.png" alt="AI Social Manager Create Post" width="900"/>

📅 Calendar

<img src="./screenshots/calendar.png" alt="AI Social Manager Calendar" width="900"/>

📈 Analytics

<img src="./screenshots/analytics.png" alt="AI Social Manager Analytics" width="900"/>

🗺️ Roadmap

✅ Completed

AI text generation

AI image generation

Post composer

Media management

Supabase storage

Social account architecture

OAuth architecture

Content calendar

Post scheduling

Publishing service

Analytics module

Notifications

Templates

History

n8n automation support

🚧 Planned

Advanced content optimization

AI-powered hashtag recommendations

Better platform-specific analytics

Campaign management

Team collaboration

Approval workflows

AI content recommendations

More social integrations

Advanced reporting

🧪 Development

Backend

cd backend
uvicorn app.main:app --reload

Frontend

cd frontend
npm run dev

Production Build

cd frontend
npm run build

🤝 Contributing

Contributions, ideas, and improvements are welcome.

# Fork the repository

git checkout -b feature/amazing-feature

git add .

git commit -m "Add amazing feature"

git push origin feature/amazing-feature

Then open a Pull Request.

🐛 Bug Reports

Found something wrong?

Open an issue and include:

What happened?

What did you expect?

Steps to reproduce

Screenshots

Console/server logs

Environment information

📌 Project Status

<div align="center">

🟢 Active Development

AI Social Manager is an evolving project focused on combining AI + Automation + Social Media APIs into a single full-stack application.

</div>

💻 Built With

<div align="center">

React · Vite · FastAPI · Python · Supabase · Cloudflare Workers AI · n8n · OAuth · REST APIs

</div>

📄 License

This project is licensed under the MIT License.

See the LICENSE file for details.

<div align="center">

⭐ Like the Project?

If AI Social Manager helped or inspired you, consider giving the repository a ⭐

<br>

Build smarter. Automate better. Manage everything from one place.

<br>

AI Social Manager

AI • Automation • Social Media • Full Stack

</div>
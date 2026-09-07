<div align="center">

# 🤖 AI Social Manager

### Create. Automate. Schedule. Publish. Analyze.

<p>
  <strong>An AI-powered social media management platform that brings content creation, AI generation, scheduling, publishing, and analytics into one modern workspace.</strong>
</p>

<br/>

<a href="https://react.dev/">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React"/>
</a>
<a href="https://vite.dev/">
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
</a>
<a href="https://fastapi.tiangolo.com/">
  <img src="https://img.shields.io/badge/FastAPI-0.116-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
</a>
<a href="https://www.python.org/">
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>
</a>

<br/><br/>

<a href="https://supabase.com/">
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase"/>
</a>
<a href="https://developers.cloudflare.com/workers-ai/">
  <img src="https://img.shields.io/badge/Cloudflare%20Workers%20AI-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers AI"/>
</a>
<a href="https://n8n.io/">
  <img src="https://img.shields.io/badge/n8n-Automation-EA4B71?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n"/>
</a>
<a href="#-license">
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License"/>
</a>

<br/><br/>

<img src="https://img.shields.io/badge/AI%20Content-Generation-8B5CF6?style=flat-square" alt="AI Content"/>
<img src="https://img.shields.io/badge/AI%20Images-Generation-EC4899?style=flat-square" alt="AI Images"/>
<img src="https://img.shields.io/badge/Multi--Platform-Publishing-0EA5E9?style=flat-square" alt="Multi Platform"/>
<img src="https://img.shields.io/badge/Automation-n8n-F97316?style=flat-square" alt="Automation"/>

</div>

<br/>

---

## ✨ Overview

**AI Social Manager** is a full-stack platform built to simplify the complete social media workflow.

Instead of creating content separately for every platform, uploading media manually, managing schedules in different tools, and checking analytics from multiple dashboards, everything can be managed from one place.

<div align="center">

### 💡 One workspace. One workflow.

**AI Content → Media → Post → Schedule → Publish → Analytics**

</div>

---

## 🎯 Why AI Social Manager?

<table>
<tr>
<td width="25%" align="center">

### 🤖
### Create

Generate captions and visuals with AI.

</td>
<td width="25%" align="center">

### 📅
### Plan

Organize drafts and schedule content.

</td>
<td width="25%" align="center">

### 🚀
### Publish

Manage connected social platforms.

</td>
<td width="25%" align="center">

### 📊
### Analyze

Track activity and performance.

</td>
</tr>
</table>

---

# 🌟 Features

<table>
<tr>
<td width="50%">

### 🤖 AI Content Generation

- AI-powered captions
- Topic-based generation
- Tone selection
- Language selection
- Hashtag support
- Emoji preferences
- Platform-oriented content

</td>
<td width="50%">

### 🎨 AI Image Generation

- Generate visuals from prompts
- Cloudflare Workers AI
- Automatic media handling
- Supabase Storage integration
- Attach generated media to posts

</td>
</tr>

<tr>
<td>

### 📝 Smart Post Composer

- Create and edit posts
- Draft management
- Media attachments
- Platform selection
- Publication status
- Scheduled publishing

</td>
<td>

### 📅 Content Calendar

- Visual content planning
- Schedule future posts
- Manage publication dates
- Track scheduled content
- Connect calendar with publishing

</td>
</tr>

<tr>
<td>

### 🔗 Social Accounts

OAuth-based account architecture for connected platforms.

- LinkedIn
- Facebook
- Instagram
- X
- YouTube
- TikTok
- Zernio

</td>
<td>

### 📊 Analytics & Activity

Centralized performance and activity management.

- Analytics synchronization
- Platform metrics
- Dashboard summaries
- Activity tracking
- Notifications
- History

</td>
</tr>
</table>

---

# 🔥 Core Workflow

<div align="center">

```text
                         ┌─────────────┐
                         │   💡 IDEA   │
                         └──────┬──────┘
                                │
                                ▼
                    ┌─────────────────────┐
                    │   🤖 AI CONTENT     │
                    │   Text + Image      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │    📝 POST EDITOR   │
                    │  Create / Customize │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
              ┌─────────────┐     ┌─────────────┐
              │  🚀 PUBLISH │     │ 📅 SCHEDULE │
              │     NOW     │     │    LATER    │
              └──────┬──────┘     └──────┬──────┘
                     │                   │
                     │             ┌─────▼─────┐
                     │             │ Scheduler │
                     │             └─────┬─────┘
                     │                   │
                     └─────────┬─────────┘
                               ▼
                     ┌────────────────────┐
                     │ 🌐 SOCIAL PLATFORMS│
                     └─────────┬──────────┘
                               │
                               ▼
                     ┌────────────────────┐
                     │ 📊 ANALYTICS       │
                     │ & ACTIVITY         │
                     └────────────────────┘
```

</div>

---

# 🧠 AI Architecture

The AI layer uses **Cloudflare Workers AI** for text and image generation.

```text
                         USER
                           │
                           ▼
                    React Frontend
                           │
                        REST API
                           │
                           ▼
                    FastAPI Backend
                           │
                 ┌─────────┴─────────┐
                 │                   │
                 ▼                   ▼
          Text Generation      Image Generation
                 │                   │
                 ▼                   ▼
        Cloudflare Workers AI   Cloudflare Workers AI
                 │                   │
                 └─────────┬─────────┘
                           ▼
                         POST
                           │
                           ▼
                    Supabase Storage
```

### AI Models

| Purpose | Model |
|---|---|
| ✍️ Text Generation | `@cf/zai-org/glm-4.7-flash` |
| 🎨 Image Generation | `@cf/black-forest-labs/flux-2-klein-9b` |

---

# 🏗️ System Architecture

```text
┌──────────────────────────────────────────────────────────────────┐
│                         AI SOCIAL MANAGER                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                         🌐 USER                                  │
│                           │                                      │
│                           ▼                                      │
│                 ┌─────────────────────┐                          │
│                 │   React + Vite      │                          │
│                 │                     │                          │
│                 │ Dashboard           │                          │
│                 │ Posts               │                          │
│                 │ Calendar            │                          │
│                 │ Analytics           │                          │
│                 │ Accounts            │                          │
│                 │ Templates           │                          │
│                 └──────────┬──────────┘                          │
│                            │                                     │
│                          REST API                                │
│                            │                                     │
│                            ▼                                     │
│                 ┌─────────────────────┐                          │
│                 │      FastAPI        │                          │
│                 │                     │                          │
│                 │ API Routers         │                          │
│                 │ Services            │                          │
│                 │ OAuth               │                          │
│                 │ Scheduler           │                          │
│                 │ Publisher           │                          │
│                 │ AI Services         │                          │
│                 └──────┬─────┬────────┘                          │
│                        │     │                                   │
│              ┌─────────┘     └──────────┐                        │
│              ▼                           ▼                        │
│      ┌───────────────┐          ┌────────────────┐               │
│      │   Supabase    │          │ Cloudflare AI  │               │
│      │               │          │                │               │
│      │ PostgreSQL    │          │ Text + Images  │               │
│      │ Storage       │          └────────────────┘               │
│      └───────────────┘                                           │
│                                                                  │
│                 ┌──────────────────────────┐                     │
│                 │ Social APIs + OAuth       │                     │
│                 │ LinkedIn • Meta • X       │                     │
│                 │ YouTube • TikTok • Zernio │                     │
│                 └──────────────────────────┘                     │
│                                                                  │
│                    🔄 n8n Automation                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

# 🧰 Tech Stack

<div align="center">

| Layer | Technology |
|:---|:---|
| 🎨 Frontend | **React 19** · **Vite 8** · React Router · Axios · Lucide React |
| ⚡ Backend | **Python 3.12** · **FastAPI** · Pydantic · HTTPX |
| 🗄️ Database | **Supabase / PostgreSQL** |
| 📦 Storage | **Supabase Storage** |
| 🧠 AI | **Cloudflare Workers AI** |
| 🔐 Authentication | OAuth + Application Authentication |
| 🔄 Automation | **n8n** |
| 🌐 APIs | REST APIs + Social Platform APIs |
| 🚀 Deployment | Vercel + AWS-compatible backend deployment |

</div>

---

# 🌍 Social Integrations

<div align="center">

| Platform | Integration |
|:---:|:---|
| 🔵 **LinkedIn** | OAuth + Publishing |
| 🔵 **Facebook** | OAuth / Publishing Flow |
| 🟣 **Instagram** | OAuth / Publishing Flow |
| ⚫ **X** | OAuth + Publishing |
| 🔴 **YouTube** | OAuth + Publishing |
| ⚫ **TikTok** | OAuth + Publishing Flow |
| 🟢 **Zernio** | Account + Publishing Integration |

</div>

> **Note:** Actual capabilities depend on each platform's API permissions, OAuth scopes, developer application configuration, and account requirements.

---

# 📂 Project Structure

```text
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
│   │   ├── db/
│   │   ├── schemas/
│   │   ├── services/
│   │   │   └── platform_adapters/
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
│   │   └── pages/
│   │       ├── Accounts/
│   │       ├── Analytics/
│   │       ├── Auth/
│   │       ├── Calendar/
│   │       ├── CreatePost/
│   │       ├── Dashboard/
│   │       ├── History/
│   │       ├── Landing/
│   │       ├── Notifications/
│   │       ├── Posts/
│   │       ├── Settings/
│   │       └── Templates/
│   │
│   ├── App.jsx
│   ├── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── screenshots/
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/AI-Social-Manager.git
cd AI-Social-Manager
```

## 2. Backend Setup

```bash
cd backend
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

API:

```text
http://127.0.0.1:8000
```

Swagger Docs:

```text
http://127.0.0.1:8000/docs
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
```

---

# 🔐 Environment Variables

Create:

```text
backend/.env
```

Example:

```env
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
```

### 🚨 Important

**Never commit real credentials to GitHub.**

Your `.gitignore` should include:

```gitignore
.env
.env.*
!.env.example
__pycache__/
*.pyc
venv/
node_modules/
dist/
```

---

# 📸 Screenshots

Add your actual application screenshots inside:

```text
screenshots/
```

Recommended:

```text
screenshots/
├── landing.png
├── dashboard.png
├── create-post.png
├── calendar.png
├── accounts.png
└── analytics.png
```

Then display them like:

```md
<div align="center">

<img src="./screenshots/dashboard.png" width="900"/>

</div>
```

---

# 🗺️ Roadmap

### ✅ Current

- [x] AI text generation
- [x] AI image generation
- [x] Smart post composer
- [x] Media management
- [x] Supabase Storage
- [x] Social account architecture
- [x] OAuth flows
- [x] Content calendar
- [x] Scheduling system
- [x] Publishing architecture
- [x] Analytics module
- [x] Notifications
- [x] Templates
- [x] History
- [x] n8n automation support

### 🚧 Next

- [ ] Advanced AI content optimization
- [ ] AI hashtag recommendations
- [ ] Better platform-specific analytics
- [ ] Campaign management
- [ ] Team collaboration
- [ ] Approval workflows
- [ ] AI content recommendations
- [ ] More platform integrations
- [ ] Advanced reports

---

# 🤝 Contributing

Contributions and ideas are welcome.

```bash
git checkout -b feature/your-feature

git add .

git commit -m "Add your feature"

git push origin feature/your-feature
```

Then open a Pull Request.

---

# 🐛 Issues

Found a bug?

Please open an issue with:

- 📝 Clear description
- 🔁 Steps to reproduce
- 🎯 Expected behavior
- ❌ Actual behavior
- 🖼️ Screenshots if applicable
- 📋 Relevant logs

---

# 📌 Project Status

<div align="center">

### 🟢 Active Development

This project is continuously evolving with new **AI capabilities, automation workflows, social integrations, and analytics features**.

</div>

---

# ⭐ Support the Project

<div align="center">

If you like this project, consider giving it a ⭐ on GitHub.

<br/>

### Build smarter. Automate better. Manage everything from one place.

<br/>

**🤖 AI Social Manager**

`AI` · `Automation` · `Social Media` · `Full Stack`

</div>

---

# 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for details.

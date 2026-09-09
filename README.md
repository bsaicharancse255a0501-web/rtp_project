AI News Suumarizer

A full-stack React + TypeScript application that extracts news articles from URLs, uses an LLM through the Groq OpenAI-compatible API to summarize and translate them, and stores authenticated users' reports in Supabase.

Overview

AI News Synthesizer is designed to turn one or more online news articles into concise, multilingual reports.

Main workflow

User signs in or creates an account.

User enters one or more article URLs.

The server fetches each article and extracts:

title

article text

source

image

author

publication date

Extracted content is sent to the Groq-hosted Llama model.

The AI generates:

topics

overall sentiment

individual article summaries

key highlights

translated headlines, summaries, and highlights

The result is displayed as an interactive report.

Reports are stored in Supabase and can be reopened from the Archive.

Additional languages can be generated later from the Results page.

Features

URL-based news article extraction

Multiple article input

AI-powered summarization

Article-by-article reports

Sentiment classification: Positive, Neutral, or Negative

Topic extraction

Multilingual reporting

Built-in support for:

English

Hindi

Telugu

Urdu

additional Indian languages

Supabase email/password authentication

Persistent summary history

Row Level Security policies for user-owned summaries

Interactive animated UI

Responsive design

Article images and metadata

API rate limiting

Development and production Vite/Express serving

Technology Stack

Frontend

React 19

TypeScript

Vite

Tailwind CSS v4

Motion

Lucide React

React Typed

React Intersection Observer

Axios

Backend

Node.js

Express

TypeScript

Axios

Cheerio

OpenAI SDK configured for Groq's OpenAI-compatible API

Express Rate Limit

AI

The server currently requests:

llama-3.3-70b-versatile

through Groq's OpenAI-compatible endpoint.

Database and Authentication

Supabase Auth

Supabase PostgreSQL

Supabase Row Level Security (RLS)

Project Structure

ainews-main/
├── src/
│   ├── components/
│   │   └── PremiumUI.tsx       # Animated/premium UI components
│   ├── lib/
│   │   ├── api.ts              # Frontend API helpers
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Tailwind/class utilities
│   ├── App.tsx                 # Main application and page flow
│   ├── index.css               # Global styles and animations
│   ├── main.tsx                # React entry point
│   └── types.ts                # Shared TypeScript types
├── server.ts                   # Express API + Vite server
├── supabase-schema.sql         # Database tables, trigger and RLS
├── extract.ts                  # Utility for finding Grok model names in output.txt
├── scrape.ts                   # Utility that scrapes xAI model documentation
├── test-groq.ts                # Groq API connectivity test
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md

Architecture

Browser
   │
   ├── Supabase Auth ───────────────► Supabase
   │
   └── Express API
          │
          ├── POST /api/extract
          │      └── Axios + Cheerio
          │             └── News website
          │
          ├── POST /api/summarize
          │      └── Groq / Llama
          │
          └── POST /api/translate
                 └── Groq / Llama

Supabase
   ├── Auth users
   └── summaries table
          └── RLS restricts records to the authenticated user

Requirements

Install the following before running the project:

Node.js with npm

A Supabase project

A Groq API key

Installation

1. Extract the project

unzip ainews-main.zip
cd ainews-main

2. Install dependencies

npm install

3. Configure environment variables

Copy the example file:

cp .env.example .env

On Windows PowerShell:

Copy-Item .env.example .env

Set the following values:

GROQ_API_KEY="your_groq_api_key"
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
APP_URL="http://localhost:3000"

Do not commit .env to source control.

Supabase Setup

Create a Supabase project.

Open the Supabase SQL Editor.

Run the contents of:

supabase-schema.sql

The schema creates:

public.users

public.summaries

a trigger that creates a public user record after Supabase Auth signup

RLS policies for summary records

The application queries summaries using the authenticated user's ID.

Run in Development

npm run dev

The Express server listens on:

http://localhost:3000

The server starts Vite in middleware mode during development.

Build for Production

npm run build

Then start the server in production mode:

NODE_ENV=production npm run dev

The Express server serves the generated dist directory when NODE_ENV=production.

Available Scripts

Script

Purpose

npm run dev

Start Express + Vite development server

npm run build

Build the React frontend

npm run preview

Preview the Vite build

npm run clean

Remove the dist directory

npm run lint

Run TypeScript type checking

API Endpoints

POST /api/extract

Extracts metadata and readable text from a supplied article URL.

Example request:

{
  "url": "https://example.com/article"
}

Returns data such as:

{
  "title": "Article title",
  "content": "Extracted article text...",
  "image": "https://example.com/image.jpg",
  "source": "example.com",
  "author": "Author",
  "publishedDate": "2026-01-01T00:00:00Z"
}

The server limits extracted article content to approximately 15,000 characters.

POST /api/summarize

Generates AI analysis for a list of extracted articles.

Request shape:

{
  "articles": [
    {
      "title": "Article title",
      "content": "Article content"
    }
  ],
  "targetLanguages": [
    "English",
    "Telugu"
  ]
}

The AI response is expected to contain:

topics

sentiment

individual reports

translated headlines

summaries

highlights

POST /api/translate

Translates a previously generated report into a requested language.

Request shape:

{
  "text": "Summary text",
  "targetLanguage": "Telugu",
  "originalHeadline": "Original headline"
}

Authentication

Authentication is handled by Supabase.

The application:

checks the current Supabase session on startup

listens for authentication state changes

supports email/password sign-in

supports account creation

supports sign-out

loads only the authenticated user's stored summaries

Database

The summaries table stores:

summary ID

authenticated user ID

creation timestamp

original articles as JSON

generated summaries as JSON

translated headlines

translated highlights

individual reports

topics

sentiment

RLS policies allow users to select, insert, update, and delete only their own summary records.

Article Extraction Details

The /api/extract endpoint uses Axios to download the target HTML and Cheerio to parse it.

It attempts common content selectors such as:

article
main
[role='main']
#mw-content-text
.article-body
.article-content
.post-content
.entry-content
.story-body
.story-content
.main-content

If those fail to produce enough text, it falls back to collecting paragraph elements.

It also reads common Open Graph/Twitter metadata for images and source information.

Important limitation

Some websites may:

block automated requests

require JavaScript rendering

require authentication

use anti-bot systems

expose incomplete article text

Therefore extraction will not work reliably for every website.

Security Notes

CRITICAL: Rotate the exposed Groq credential

The supplied project contains a Groq API credential directly in source code (server.ts and test-groq.ts). This is a security risk because anyone with access to the repository can potentially use the credential.

Before deploying or sharing this project:

Revoke/rotate the exposed Groq API key in the Groq console.

Remove hard-coded credentials from the source.

Use only process.env.GROQ_API_KEY.

Keep .env out of Git.

Never place the Groq secret in frontend code.

The server should use a pattern similar to:

const currentKey = process.env.GROQ_API_KEY;

if (!currentKey) {
  throw new Error("GROQ_API_KEY is not configured.");
}

Other security considerations

The API has a rate limiter of 100 requests per IP per 15-minute window.

Supabase RLS protects stored summary records.

URL fetching should be hardened further before production use to reduce SSRF risk.

Consider allow/deny-listing target hosts and blocking requests to private/internal IP ranges.

Consider maximum response-size limits when fetching arbitrary URLs.

Validate and constrain user-provided input on all API endpoints.

Current Code Review Findings

Strengths

Clear separation between React UI, API helpers, and server routes.

TypeScript types define article and summary structures.

Supabase RLS policies are included in the project.

API rate limiting is already implemented.

Article extraction has multiple selector fallbacks.

The UI supports multilingual reporting and individual article reports.

The application has a production serving path for the Vite build.

Issues to Address

Hard-coded Groq API key

Highest-priority security issue.

Rotate the credential immediately.

Supabase credentials have client-side fallback values

Prefer environment variables only.

Avoid committing project-specific values when distributing the application.

SSRF exposure in /api/extract

The server accepts arbitrary URLs and fetches them.

Add private-network/IP validation and host restrictions before production deployment.

AI JSON parsing is relatively fragile

The code removes Markdown fences and extracts the first { through the last }.

Prefer structured JSON/schema-constrained model output if supported by the chosen API/model.

scrape.ts, extract.ts, and test-groq.ts are development utilities

They are not part of the normal application request flow.

They should either be documented as developer tools or removed from production repositories.

No automated test suite is included

Add unit/integration tests for extraction, API validation, authentication flows, and AI response parsing.

Article extraction is HTML-selector based

It can fail on JavaScript-heavy or protected news sites.

A dedicated readability/content-extraction strategy could improve reliability.

Recommended Production Checklist

Before deployment:

Rotate the exposed Groq API key.

Remove all hard-coded secrets.

Configure production environment variables.

Run npm run lint.

Run npm run build.

Apply supabase-schema.sql.

Verify Supabase Auth settings.

Test RLS with multiple user accounts.

Add SSRF protection to /api/extract.

Add request and response size limits.

Add automated tests.

Review third-party website scraping terms and robots/access policies.

Configure HTTPS and a production reverse proxy/platform.

Monitor Groq API usage and rate limits.

Troubleshooting

GROQ_API_KEY is not configured

Check that .env contains:

GROQ_API_KEY="your_key"

Restart the development server after changing environment variables.

Article extraction fails

The source may block automated requests or require browser-side JavaScript. Try another publicly accessible article URL.

Supabase history is empty

Check:

the user is authenticated

VITE_SUPABASE_URL is correct

VITE_SUPABASE_ANON_KEY is correct

supabase-schema.sql has been executed

RLS policies exist

the browser console does not show Supabase errors

AI response parsing fails

The application expects valid JSON from the AI service. Model output that contains malformed JSON can cause a 500 response. Check the server logs and consider structured output/schema enforcement.

License

No explicit license is included in the supplied project. Add a license before publishing or redistributing the code.

Project Status

This README was generated from an inspection of the supplied ainews-main.zip project files. It describes the implementation present in that archive and intentionally calls out security and production-readiness issues visible in the source.

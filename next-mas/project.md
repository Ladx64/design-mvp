# Next.js with Shadcn UI Template

This is a modern web application template built with:
- Next.js 15.1.4
- TypeScript
- TailwindCSS
- Shadcn UI Components

## Project Structure

```
next-mas/
├── src/
│   ├── app/              # Next.js app router
│   │   └── upload/       # Image upload result page
│   ├── components/       # React components including Shadcn UI
│   │   └── upload-zone/  # Custom drag & drop upload component
│   └── lib/             # Utility functions and shared code
├── public/              # Static assets
└── package.json         # Project dependencies and scripts
```

## Features
- Modern React development with Next.js
- Type-safe development with TypeScript
- Utility-first CSS with TailwindCSS
- Pre-built UI components from Shadcn UI
- Dark mode support
- Responsive design
- Image upload functionality with drag & drop support

## Development
- Run `bun run dev` to start the development server
- Access the site at http://localhost:3000

## Pages
- `/` - Main page with image upload functionality
- `/upload` - Displays uploaded image

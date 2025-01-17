import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Globe, FileText, Layout } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-12">
      <main className="flex flex-col items-center gap-8 max-w-2xl text-center">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
            style={{ width: 'auto', height: 'auto' }}
          />
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Welcome to Next.js with Shadcn UI</h1>
          <p className="text-muted-foreground">
            This template includes Next.js, TypeScript, TailwindCSS, and Shadcn UI components
            for building modern web applications.
          </p>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button asChild>
            <a
              href="https://vercel.com/new"
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <Image
                src="/vercel.svg"
                alt="Vercel logomark"
                width={20}
                height={20}
                className="dark:invert"
                style={{ width: 'auto', height: 'auto' }}
              />
              Deploy to Vercel
            </a>
          </Button>
          
          <Button variant="outline" asChild>
            <a
              href="https://ui.shadcn.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Shadcn UI
            </a>
          </Button>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center">
        <Button variant="ghost" asChild className="gap-2">
          <a
            href="https://nextjs.org/learn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FileText className="h-4 w-4" />
            Learn
          </a>
        </Button>

        <Button variant="ghost" asChild className="gap-2">
          <a
            href="https://vercel.com/templates"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Layout className="h-4 w-4" />
            Examples
          </a>
        </Button>

        <Button variant="ghost" asChild className="gap-2">
          <a
            href="https://nextjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe className="h-4 w-4" />
            Visit nextjs.org
          </a>
        </Button>
      </footer>
    </div>
  );
}

import { UploadZone } from "@/components/upload-zone";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-12">
      <main className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold">Design Analysis</h1>
          <p className="text-muted-foreground">
            Upload an image to analyze its design elements
          </p>
        </div>

        <UploadZone />
      </main>
    </div>
  );
}

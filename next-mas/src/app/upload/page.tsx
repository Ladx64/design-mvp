import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Metadata } from "next";

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

function ImageDisplay({ src }: { src: string }) {
  return (
    <div className="relative w-full aspect-video">
      <Image
        src={src}
        alt="Uploaded image"
        fill
        className="object-contain rounded-lg"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      />
    </div>
  );
}

export async function generateMetadata(
  { searchParams }: PageProps
): Promise<Metadata> {
  const params = await Promise.resolve(searchParams);
  return {
    title: params?.image ? 'Uploaded Image' : 'No Image Selected',
  };
}

export default async function UploadPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const imageUrl = String(params?.image || '');

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">No Image Selected</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Upload
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Uploaded Image</CardTitle>
            <Button variant="outline" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Upload
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="w-full aspect-video bg-muted animate-pulse rounded-lg" />}>
            <ImageDisplay src={imageUrl} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}

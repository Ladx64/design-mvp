import Image from "next/image";

export default function UploadPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const imageUrl = searchParams.image as string;

  if (!imageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No image selected</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <h1 className="text-2xl font-bold">Uploaded Image</h1>
      <div className="relative w-full max-w-2xl aspect-video">
        <Image
          src={imageUrl}
          alt="Uploaded image"
          fill
          className="object-contain"
          priority
        />
      </div>
    </div>
  );
}


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";

export default function LoadingPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 5000); // 5 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [router]);

  return (
    <main
      className="flex items-center justify-center min-h-screen p-4 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('https://i.imgur.com/dCacamr.jpg')" }}
    >
        <div className="absolute inset-0 bg-black/50" />
        <div className="z-10 flex flex-col items-center justify-center text-center text-white">
            <Image
                src="https://i.imgur.com/WWZ10oQ.png"
                alt="ING Belgium Logo"
                width={150}
                height={150}
                className="mx-auto mb-6"
            />
            <LoaderCircle className="h-16 w-16 animate-spin mb-6" />
            <h1 className="text-2xl font-semibold font-headline">Connexion en cours...</h1>
            <p className="text-lg mt-2">Veuillez patienter.</p>
        </div>
    </main>
  );
}

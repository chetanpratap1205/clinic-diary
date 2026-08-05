import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedLogo } from "@/components/animated-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-200/20 blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px] -z-10" />

      <div className="text-center max-w-md w-full">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <AnimatedLogo theme="light" size="md" />
        </div>

        {/* 404 Number */}
        <div className="relative mb-6">
          <p className="text-[120px] sm:text-[160px] font-black text-slate-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center">
              <Search className="w-9 h-9 text-teal-600" />
            </div>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-3">
          Page not found
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. If you&apos;re a patient, please check your booking link.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white h-12 px-6 rounded-xl font-semibold shadow-md shadow-teal-700/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Link href="/login">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-6 rounded-xl font-medium bg-white border-slate-200"
            >
              Doctor Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

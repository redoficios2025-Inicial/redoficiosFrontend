"use client";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-neutral-100 border-t border-neutral-300 py-10 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <Image src="/assets/RedOficiosLogo.png" alt="logo" width={100} height={100} />
        </div>
        <nav className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-center">
          <a
            href="#"
            className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow-sm border border-indigo-600 hover:bg-indigo-500 transition-colors font-medium"
          >
            Términos
          </a>
          <a
            href="#"
            className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow-sm border border-indigo-600 hover:bg-indigo-500 transition-colors font-medium"
          >
            Privacidad
          </a>
          <a
            href="#"
            className="px-4 py-2 rounded-full bg-indigo-600 text-white shadow-sm border border-indigo-600 hover:bg-indigo-500 transition-colors font-medium"
          >
            Ayuda
          </a>
        </nav>

      </div>
    </footer>

  );
}

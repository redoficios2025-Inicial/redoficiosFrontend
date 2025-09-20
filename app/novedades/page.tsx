// app/novedades/page.tsx
"use client";

import Image from "next/image";

type Novedad = {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
};

const novedadesMock: Novedad[] = [
  {
    id: "1",
    title: "Nuevo sistema de pago seguro",
    date: "2025-08-26",
    description: "Ahora podés pagar tus servicios con más seguridad y rapidez desde nuestra plataforma.",
    image: "/assets/novedad1.jpg",
  },
  {
    id: "2",
    title: "Mujeres destacadas del mes",
    date: "2025-08-20",
    description: "Conocé a las profesionales más valoradas por nuestros usuarios este mes.",
    image: "/assets/novedad2.jpg",
  },
  {
    id: "3",
    title: "Actualización de perfiles",
    date: "2025-08-18",
    description: "Mejoramos la visualización de perfiles y las opciones de contacto con los trabajadores.",
  },
];

export default function NovedadesPage() {
  return (
    <main className="min-h-screen bg-emerald-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-8">Novedades</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {novedadesMock.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
              {item.image && (
                <div className="relative h-48 w-full">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
              )}
              <div className="p-5 flex flex-col gap-2">
                <h2 className="font-semibold text-lg">{item.title}</h2>
                <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</p>
                <p className="text-gray-700 mt-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

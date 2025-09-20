"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

export default function CambiarPassword() {
  const [correo, setCorreo] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [confirmarContraseña, setConfirmarContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleCambio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevaContraseña !== confirmarContraseña) {
      Swal.fire("Error", "Las contraseñas no coinciden", "error");
      return;
    }

    try {
      const res = await fetch("https://redoficios-back.vercel.app/api/auth/cambiar-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, nuevaContraseña }),
      });

      const data = await res.json();

      if (res.ok) {
        Swal.fire("Éxito", "Contraseña actualizada correctamente", "success").then(() => {
          router.push("/login"); // Redirige al login
        });
      } else {
        Swal.fire("Error", data.msg || "Ocurrió un error", "error");
      }
    } catch (error) {
      Swal.fire("Error", "No se pudo conectar al servidor", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <form
        onSubmit={handleCambio}
        className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Cambiar contraseña</h1>

        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          className="px-4 py-2 border rounded-xl"
          required
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nueva contraseña"
            value={nuevaContraseña}
            onChange={(e) => setNuevaContraseña(e.target.value)}
            className="px-4 py-2 border rounded-xl w-full pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirmar contraseña"
          value={confirmarContraseña}
          onChange={(e) => setConfirmarContraseña(e.target.value)}
          className="px-4 py-2 border rounded-xl"
          required
        />

        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  );
}

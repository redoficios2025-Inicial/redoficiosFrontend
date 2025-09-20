"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [correo, setCorreo] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await fetch("https://redoficios-back.vercel.app/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contraseña }),
      });

      const data = await res.json();

      console.log("Respuesta del backend:", data);

      if (!data.usuario) {
        Swal.fire("Error", "No se pudo obtener información del usuario", "error");
        return;
      }

      const userId = data.usuario.userId || data.usuario._id; // respaldo
      const perfilId = data.usuario.perfilId || data.usuario.perfil?._id || userId;

      // Guardar en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("perfilId", perfilId);
      // Marcar que el login fue exitoso para controlar la recarga
      localStorage.setItem("loginSuccess", "true");

      if (data.primerLogin) {
        Swal.fire({
          title: "Primer inicio de sesión",
          text: "¿Deseas cambiar tu contraseña ahora?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Sí, cambiar ahora",
          cancelButtonText: "No, ingresar igual",
        }).then((result) => {
          if (result.isConfirmed) {
            // Recargar y luego navegar
            window.location.href = "/cambiar-password";
          } else {
            Swal.fire("Bienvenido", "Inicio de sesión exitoso", "success").then(() => {
              // Recargar y luego navegar al dashboard
              window.location.href = "/dashboard";
            });
          }
        });
      } else {
        Swal.fire("Bienvenido", "Inicio de sesión exitoso", "success").then(() => {
          // Recargar y luego navegar al dashboard
          window.location.href = "/dashboard";
        });
      }

    } catch (error) {
      console.error("Error al hacer login:", error);
      Swal.fire("Error", "No se pudo conectar al servidor", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-center">Iniciar sesión</h1>

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
            placeholder="Contraseña"
            value={contraseña}
            onChange={(e) => setContraseña(e.target.value)}
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

        <button
          type="submit"
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition"
        >
          Iniciar sesión
        </button>

        <div className="flex justify-between mt-2 text-sm text-emerald-600">
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="hover:underline"
          >
            Registrarse
          </button>
          <button
            type="button"
            onClick={() => router.push("/cambiar-password")}
            className="hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </form>
    </div>
  );
}
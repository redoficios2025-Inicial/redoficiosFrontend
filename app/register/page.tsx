"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://redoficios-back.vercel.app/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Código enviado",
          text: "Revisa tu correo para obtener el código de verificación",
          input: "text",
          inputLabel: "Ingresa el código recibido",
          inputPlaceholder: "Código de 6 dígitos",
          showCancelButton: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            const codigo = result.value;
            const verifyRes = await fetch("https://redoficios-back.vercel.app/api/auth/verificarCodigo", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ correo, codigo }),
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              Swal.fire("Verificado", verifyData.msg, "success").then(() => {
                window.location.href = "/login"; // Redirige al login
              });
            } else {
              Swal.fire("Error", verifyData.msg, "error");
            }
          }
        });
      } else {
        Swal.fire("Error", data.msg, "error");
      }
    } catch (error) {
      setLoading(false);
      Swal.fire("Error", "Error en la solicitud", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre"
          className="px-4 py-2 border rounded-xl"
        />
        <input
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          placeholder="Correo"
          type="email"
          className="px-4 py-2 border rounded-xl"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition"
        >
          {loading ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}

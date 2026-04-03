"use client";

import React, { useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import clsx from "clsx";
import { crearRegistro } from "@/lib/registro-peticion-actions";

type Campos = "nombre" | "correo_electronico" | "telefono" | "asunto" | "peticion";

const placeholders: Record<Campos, string> = {
  nombre: "Nombre",
  correo_electronico: "Correo electrónico",
  telefono: "Teléfono (opcional)",
  asunto: "Asunto",
  peticion: "Describe tu petición",
};

const etiquetas: Record<Campos, string> = {
  nombre: "Nombre",
  correo_electronico: "Correo electrónico",
  telefono: "Teléfono",
  asunto: "Asunto",
  peticion: "Petición",
};

const camposOpcionales = new Set<Campos>(["correo_electronico", "telefono"]);

const mensajesError: Record<Campos, string> = {
  nombre: "Por favor ingresa un nombre válido (mín. 2 caracteres).",
  correo_electronico: "Verifica este dato (opcional).",
  telefono: "Ingresa un teléfono válido (opcional).",
  asunto: "Por favor ingresa un asunto válido (mín. 2 caracteres).",
  peticion: "Por favor describe tu petición (mín. 10 caracteres).",
};

const validarEmail = (correo_electronico: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo_electronico);

const validarTelefono = (telefono: string) =>
  /^\+?[0-9\s()\-]{7,20}$/.test(telefono);

function pemToArrayBuffer(pem?: string) {
  if (!pem) {
    throw new Error(
      "Clave pública RSA no encontrada en NEXT_PUBLIC_RSA_PUBLIC_KEY"
    );
  }

  const b64 = pem.replace(/-----.*?-----/g, "").replace(/\s+/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function bufferToHex(buffer: Uint8Array) {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function encryptE2EE(text: string) {
  const enc = new TextEncoder();

  const publicKey = await window.crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  const aesKeyRaw = window.crypto.getRandomValues(new Uint8Array(32));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const aesKey = await window.crypto.subtle.importKey(
    "raw",
    aesKeyRaw,
    "AES-GCM",
    false,
    ["encrypt"]
  );

  const cipherBuffer = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc.encode(text)
  );

  const encryptedAesKey = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    aesKeyRaw
  );

  return {
    peticion_cipher: bufferToHex(new Uint8Array(cipherBuffer)),
    peticion_iv: bufferToHex(iv),
    peticion_key_rsa: bufferToHex(new Uint8Array(encryptedAesKey)),
  };
}

const validarCampo = (field: Campos, value: string): boolean => {
  const val = value.trim();
  if (!val) return false;

  if (field === "correo_electronico") return validarEmail(val);
  if (field === "telefono") return validarTelefono(val);
  if (field === "peticion") return val.length >= 10;
  if (field === "nombre" || field === "asunto") return val.length >= 2;
  return false;
};

const validarTodosCampos = (inputs: Record<Campos, string>): Record<Campos, "valid" | "invalid" | "unset"> => ({
  nombre: validarCampo("nombre", inputs.nombre) ? "valid" : "invalid",
  correo_electronico:
    inputs.correo_electronico.trim() === "" ||
    validarCampo("correo_electronico", inputs.correo_electronico)
      ? "valid"
      : "invalid",
  telefono:
    inputs.telefono.trim() === "" || validarCampo("telefono", inputs.telefono)
      ? "valid"
      : "invalid",
  asunto: validarCampo("asunto", inputs.asunto) ? "valid" : "invalid",
  peticion: validarCampo("peticion", inputs.peticion) ? "valid" : "invalid",
});

interface InputProps {
  field: Campos;
  value: string;
  validationState: "valid" | "invalid" | "unset";
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (field: Campos, value: string) => void;
  isTextarea?: boolean;
}

const inputBaseClasses =
  "w-full px-4 py-3.5 pr-10 rounded-xl bg-muted/20 text-foreground placeholder-muted-foreground border border-border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring/60 focus:border-ring";

const InputField: React.FC<InputProps> = ({
  field,
  value,
  validationState,
  onChange,
  onBlur,
  isTextarea = false,
}) => {
  const isInvalid = validationState === "invalid";
  const isValid = validationState === "valid";
  const isOptional = camposOpcionales.has(field);
  const helperText =
    field === "peticion"
      ? "Mínimo 10 caracteres"
      : isOptional
      ? "Opcional"
      : "Obligatorio";
  const inputType =
    field === "correo_electronico"
      ? "email"
      : field === "telefono"
      ? "tel"
      : "text";

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <label htmlFor={field} className="font-medium text-foreground/90">
          {etiquetas[field]}
        </label>
        <span className="text-xs text-muted-foreground">{helperText}</span>
      </div>

      <div className="relative">
      <label htmlFor={field} className="sr-only">
        {etiquetas[field]}
      </label>

      {isTextarea ? (
        <textarea
          id={field}
          name={field}
          rows={5}
          required={!isOptional}
          placeholder={placeholders[field]}
          value={value}
          onChange={onChange}
          onBlur={(e) => onBlur(field, e.target.value)}
          aria-invalid={isInvalid}
          aria-required={!isOptional}
          aria-describedby={isInvalid ? `${field}-error` : undefined}
          className={clsx(
            inputBaseClasses,
            "autofill-fix resize-none",
            isInvalid && "border-2 border-red-600"
          )}
        />
      ) : (
        <input
          id={field}
          name={field}
          type={inputType}
          inputMode={field === "telefono" ? "tel" : undefined}
          autoComplete={
            field === "nombre"
              ? "name"
              : field === "correo_electronico"
              ? "email"
              : field === "telefono"
              ? "tel"
              : "off"
          }
          required={!isOptional}
          placeholder={placeholders[field]}
          value={value}
          onChange={onChange}
          onBlur={(e) => onBlur(field, e.target.value)}
          aria-invalid={isInvalid}
          aria-required={!isOptional}
          aria-describedby={isInvalid ? `${field}-error` : undefined}
          className={clsx(
            inputBaseClasses,
            "autofill-fix",
            isInvalid && "border-2 border-red-600"
          )}
        />
      )}

      {isValid && (
        <CheckCircle2
          size={20}
          className="absolute right-3 top-3 text-green-500 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {isInvalid && (
        <>
          <XCircle
            size={20}
            className="absolute right-3 top-3 text-red-600 transition-opacity duration-300"
            aria-hidden="true"
          />
          <p
            id={`${field}-error`}
            className="mt-1 text-sm text-red-600 font-semibold"
            role="alert"
          >
            {mensajesError[field]}
          </p>
        </>
      )}
      </div>
    </div>
  );
};

const PeticionDeOracion = () => {
  const [inputs, setInputs] = useState<Record<Campos, string>>({
    nombre: "",
    correo_electronico: "",
    telefono: "",
    asunto: "",
    peticion: "",
  });

  const [validaciones, setValidaciones] = useState<
    Record<Campos, "valid" | "invalid" | "unset">
  >({
    nombre: "unset",
    correo_electronico: "unset",
    telefono: "unset",
    asunto: "unset",
    peticion: "unset",
  });

  const [mensajeEnvio, setMensajeEnvio] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // ...eliminado: hook de recaptcha...

  const handleBlur = useCallback((field: Campos, value: string) => {
    if (value.trim() === "") {
      setValidaciones((prev) => ({ ...prev, [field]: "unset" }));
      return;
    }

    setValidaciones((prev) => ({
      ...prev,
      [field]: validarCampo(field, value) ? "valid" : "invalid",
    }));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      const field = name as Campos;
      setInputs((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nuevasValidaciones = validarTodosCampos(inputs);
    setValidaciones(nuevasValidaciones);

    const tieneError = Object.values(nuevasValidaciones).some(
      (estado) => estado !== "valid"
    );
    if (tieneError) {
      setMensajeEnvio("Por favor corrige los errores antes de enviar.");
      return;
    }

    setLoading(true);
    setMensajeEnvio(null);

    try {
      const contactoTelefono = inputs.telefono.trim();
      const peticionCompleta = `Asunto: ${inputs.asunto.trim()}${
        contactoTelefono ? `\nTeléfono: ${contactoTelefono}` : ""
      }\n\n${inputs.peticion.trim()}`;
      const e2ee = await encryptE2EE(peticionCompleta);

      const result = await crearRegistro({
        nombre: inputs.nombre.trim(),
        email: inputs.correo_electronico.trim() || undefined,
        anonimo: false,
        ...e2ee,
      });

      if (!result?.ok) {
        throw new Error(result?.debug || "Error desconocido al enviar la petición");
      }

      setMensajeEnvio("Petición enviada con éxito. ¡Gracias!");
      setInputs({
        nombre: "",
        correo_electronico: "",
        telefono: "",
        asunto: "",
        peticion: "",
      });
      setValidaciones({
        nombre: "unset",
        correo_electronico: "unset",
        telefono: "unset",
        asunto: "unset",
        peticion: "unset",
      });
    } catch (error: unknown) {
      console.error("❌ Error al enviar petición:", error);
      let errorMessage = "Error al enviar la petición";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Proporcionar mensajes más útiles según el tipo de error
        if (errorMessage.includes('relation "registro" does not exist')) {
          errorMessage = "La tabla de peticiones no existe en la base de datos. Por favor contacta al administrador.";
        } else if (errorMessage.includes("permission denied")) {
          errorMessage = "No tienes permisos para enviar peticiones. Verifica la configuración de seguridad.";
        } else if (errorMessage.includes("connection")) {
          errorMessage = "Error de conexión con la base de datos. Intenta de nuevo en unos momentos.";
        }
      }
      
      setMensajeEnvio(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // El tema se maneja automáticamente por next-themes
    // No necesitamos manipular CSS variables manualmente
  }, []);

  return (
    <main className="flex flex-col justify-center min-h-screen bg-background px-6 py-36">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-16">
        <header className="text-left">
          <h1 className="text-5xl font-semibold text-foreground mb-6">
            Petición de Oración
          </h1>
          <p className="text-lg text-foreground text-justify">
            Comparte tus peticiones con nosotros. Estamos aquí para orar contigo y
            apoyarte en tus necesidades espirituales.
          </p>
        </header>

        <section className="w-full rounded-2xl border border-border bg-background/95 shadow-lg p-6 sm:p-8">
          <form
            className="flex flex-col gap-7 items-start"
            onSubmit={handleSubmit}
            noValidate
          >
            {(["nombre", "correo_electronico", "telefono", "asunto"] as Campos[]).map((field) => (
              <InputField
                key={field}
                field={field}
                value={inputs[field]}
                validationState={validaciones[field]}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            ))}

            <InputField
              field="peticion"
              value={inputs.peticion}
              validationState={validaciones.peticion}
              onChange={handleChange}
              onBlur={handleBlur}
              isTextarea
            />

            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full py-3 font-bold rounded-xl bg-black text-white border border-black/30 dark:border-white/30 focus:ring-2 focus:ring-white/70 focus:outline-none hover:opacity-95 hover:shadow-md active:scale-[0.99] transition duration-300",
                loading && "opacity-60 cursor-not-allowed"
              )}
              aria-busy={loading}
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
        </section>

        {mensajeEnvio && (
          <section className="text-left mt-4" role="alert" aria-live="polite">
            <p
              className={clsx(
                "font-semibold rounded-xl border px-4 py-3",
                mensajeEnvio.startsWith("Error")
                  ? "text-red-700 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
                  : "text-green-700 border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800"
              )}
            >
              {mensajeEnvio}
            </p>
          </section>
        )}

        <section className="text-left">
          <p className="opacity-70 text-muted-foreground text-justify">
            Tu petición de oración será compartida con los voluntarios del Equipo de
            Oración de Monte Sion. Ellos se comprometen a orar por cada petición
            recibida.
            <br />
            Al enviar este formulario, aceptas que te contactemos por correo
            electrónico para informarte sobre el estado de tu petición y cualquier
            actualización relacionada, siempre manteniendo confidencialidad y respeto por tu privacidad, incluyendo la eliminación de información sensible si así lo solicitas.
            <br />
            Si tienes alguna pregunta o inquietud, no dudes en contactarnos a través de <br />
            <a href="mailto:ministeriomontesionoaxaca@gmail.com">ministeriomontesionoaxaca@gmail.com</a>.
          </p>
          
          {/* Eliminado mensaje de protección reCAPTCHA */}
        </section>
      </div>
    </main>
  );
};

export default PeticionDeOracion;
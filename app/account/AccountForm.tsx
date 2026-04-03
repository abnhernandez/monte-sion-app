"use client";

import type { FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AtSign,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Keyboard,
  LayoutTemplate,
  LogOut,
  Mail,
  MessageCircleMore,
  Phone,
  RotateCcw,
  Save,
  ShieldAlert,
  Sparkles,
  UserRound,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import AvatarUpload from "@/app/components/AvatarUpload";
import DeleteAccountButton from "@/app/components/delete";
import { logoutAction } from "@/lib/auth-actions";
import type { AccountProfile } from "@/lib/account";
import { updateAccount, type UpdateAccountInput } from "@/lib/account-actions";
import { formatRoleLabel } from "@/lib/camp/utils";
import { campRoles, guardianRelationships } from "@/lib/camp/types";
import { getRoleLabel } from "@/lib/roles";
import { cn } from "@/lib/utils";

const MAX_BIO_LENGTH = 140;
const MAX_NAME_LENGTH = 60;
const MIN_NAME_LENGTH = 2;
const MAX_USERNAME_LENGTH = 24;
const PHONE_DIGIT_LENGTH = 10;

const SECTION_LINKS = [
  {
    id: "datos-basicos",
    label: "Datos",
    description: "Nombre y acceso",
    icon: UserRound,
  },
  {
    id: "perfil-publico",
    label: "Perfil",
    description: "Bio y presentacion",
    icon: FileText,
  },
  {
    id: "identidad-cuenta",
    label: "Identidad",
    description: "Rol y cuenta",
    icon: AtSign,
  },
  {
    id: "autocompletado-formularios",
    label: "Autofill",
    description: "Formularios listos",
    icon: Wand2,
  },
  {
    id: "acciones-rapidas",
    label: "Acciones",
    description: "Acceso y sesion",
    icon: Sparkles,
  },
  {
    id: "seguridad-cuenta",
    label: "Seguridad",
    description: "Acciones sensibles",
    icon: ShieldAlert,
  },
  {
    id: "guardar-cambios",
    label: "Guardar",
    description: "Confirmar ajustes",
    icon: Save,
  },
] as const;

const BIO_PRESETS = [
  {
    id: "community",
    label: "Comunidad",
    description: "Cercano y sencillo",
    build: (name: string) =>
      `Soy ${name || "parte de la comunidad"} y me gusta conectar, servir y acompañar a otros con una actitud cercana.`,
  },
  {
    id: "service",
    label: "Servicio",
    description: "Enfocado en ayuda",
    build: (name: string) =>
      `${name || "Mi perfil"} participa con alegria en el servicio, el aprendizaje y el cuidado de la comunidad.`,
  },
  {
    id: "growth",
    label: "Crecimiento",
    description: "Mas personal",
    build: () =>
      `Estoy creciendo en mi fe y me gusta aprender, servir y construir relaciones sanas dentro de la comunidad.`,
  },
] as const;

type AccountFormValues = {
  name: string;
  bio: string;
  avatar_url: string | null;
  username: string;
  phone: string;
  autofillForms: boolean;
  churchName: string;
  city: string;
  campRole: AccountProfile["autofill"]["campRole"];
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  emergencyAddress: string;
  guardianName: string;
  guardianRelationship: AccountProfile["autofill"]["guardianRelationship"];
  guardianPhone: string;
  guardianEmail: string;
};

function normalizeForm(values: {
  name?: string;
  bio?: string;
  avatar_url?: string | null;
  username?: string | null;
  phone?: string | null;
  autofill?: Partial<AccountProfile["autofill"]>;
}): AccountFormValues {
  return {
    name: values.name ?? "",
    bio: values.bio ?? "",
    avatar_url: values.avatar_url ?? null,
    username: values.username ?? "",
    phone: values.phone ?? "",
    autofillForms: values.autofill?.enabled ?? true,
    churchName: values.autofill?.churchName ?? "",
    city: values.autofill?.city ?? "",
    campRole: values.autofill?.campRole ?? "participant",
    emergencyName: values.autofill?.emergencyName ?? "",
    emergencyPhone: values.autofill?.emergencyPhone ?? "",
    emergencyRelationship: values.autofill?.emergencyRelationship ?? "",
    emergencyAddress: values.autofill?.emergencyAddress ?? "",
    guardianName: values.autofill?.guardianName ?? "",
    guardianRelationship: values.autofill?.guardianRelationship ?? "",
    guardianPhone: values.autofill?.guardianPhone ?? "",
    guardianEmail: values.autofill?.guardianEmail ?? "",
  };
}

function serializeForm(values: AccountFormValues) {
  return JSON.stringify({
    name: values.name.replace(/\s+/g, " ").trim(),
    bio: values.bio.trim(),
    avatar_url: values.avatar_url ?? null,
    username: values.username.trim().toLowerCase(),
    phone: normalizePhone(values.phone),
    autofillForms: values.autofillForms,
    churchName: values.churchName.trim(),
    city: values.city.trim(),
    campRole: values.campRole,
    emergencyName: values.emergencyName.trim(),
    emergencyPhone: normalizePhone(values.emergencyPhone),
    emergencyRelationship: values.emergencyRelationship.trim(),
    emergencyAddress: values.emergencyAddress.trim(),
    guardianName: values.guardianName.trim(),
    guardianRelationship: values.guardianRelationship,
    guardianPhone: normalizePhone(values.guardianPhone),
    guardianEmail: values.guardianEmail.trim().toLowerCase(),
  });
}

function formatDate(date?: string | null) {
  if (!date) return "Aun sin registro";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(date));
  } catch {
    return "Fecha no disponible";
  }
}

function formatBirthdayDate(date?: string | null) {
  if (!date) return "Sin fecha";

  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  } catch {
    return "Fecha no disponible";
  }
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function toTitleCase(value: string) {
  return value
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function polishBioText(value: string) {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (/[.!?]$/.test(cleaned)) return cleaned;
  return `${cleaned}.`;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeUsername(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-\s]/g, "")
    .replace(/\s+/g, ".")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.|\.$/g, "")
    .slice(0, MAX_USERNAME_LENGTH);
}

function buildUsernameSuggestion(name: string, email?: string | null) {
  const fromName = sanitizeUsername(name);
  if (fromName.length >= 3) {
    return fromName;
  }

  const fromEmail = sanitizeUsername(String(email ?? "").split("@")[0] ?? "");
  return fromEmail;
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "TU";
}

function SectionCard({
  id,
  eyebrow,
  title,
  description,
  icon,
  children,
  tone = "primary",
  action,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  tone?: "primary" | "amber" | "destructive";
  action?: ReactNode;
}) {
  const eyebrowClassName =
    tone === "amber"
      ? "text-amber-700 dark:text-amber-300"
      : tone === "destructive"
        ? "text-destructive"
        : "text-primary";

  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <p
            className={cn(
              "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em]",
              eyebrowClassName,
            )}
          >
            {icon}
            {eyebrow}
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function AccountForm({ profile }: { profile: AccountProfile }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [baseline, setBaseline] = useState<AccountFormValues>(() =>
    normalizeForm(profile),
  );
  const [form, setForm] = useState<AccountFormValues>(() =>
    normalizeForm(profile),
  );
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    profile.updated_at,
  );
  const [isSaving, startSaveTransition] = useTransition();
  const [isLoggingOut, startLogoutTransition] = useTransition();
  const [previewMode, setPreviewMode] = useState<
    "card" | "comment" | "welcome"
  >("card");

  const normalizedName = form.name.replace(/\s+/g, " ").trim();
  const normalizedBio = form.bio.trim();
  const normalizedUsername = form.username.trim();
  const phoneDigits = normalizePhone(form.phone);
  const emergencyPhoneDigits = normalizePhone(form.emergencyPhone);
  const guardianPhoneDigits = normalizePhone(form.guardianPhone);
  const normalizedGuardianEmail = form.guardianEmail.trim().toLowerCase();
  const roleLabel = getRoleLabel(profile.role);
  const nameError =
    normalizedName.length === 0
      ? "Agrega tu nombre para identificar tu cuenta."
      : normalizedName.length < MIN_NAME_LENGTH
        ? "Tu nombre debe tener al menos 2 caracteres."
        : normalizedName.length > MAX_NAME_LENGTH
          ? "Tu nombre debe tener 60 caracteres o menos."
          : "";
  const bioError =
    form.bio.length > MAX_BIO_LENGTH
      ? "Tu descripcion debe tener 140 caracteres o menos."
      : "";
  const usernameError =
    normalizedUsername.length === 0
      ? ""
      : normalizedUsername.length < 3
        ? "Tu username debe tener al menos 3 caracteres."
        : normalizedUsername.length > MAX_USERNAME_LENGTH
          ? `Tu username debe tener ${MAX_USERNAME_LENGTH} caracteres o menos.`
          : /^[a-zA-Z0-9._-]+$/.test(normalizedUsername)
            ? ""
            : "Usa solo letras, numeros, punto, guion o guion bajo.";
  const phoneError =
    phoneDigits.length === 0 || phoneDigits.length === PHONE_DIGIT_LENGTH
      ? ""
      : "Ingresa un telefono de 10 digitos para reutilizarlo en formularios.";
  const emergencyPhoneError =
    emergencyPhoneDigits.length === 0 ||
    emergencyPhoneDigits.length === PHONE_DIGIT_LENGTH
      ? ""
      : "El telefono de emergencia debe tener 10 digitos.";
  const guardianPhoneError =
    guardianPhoneDigits.length === 0 ||
    guardianPhoneDigits.length === PHONE_DIGIT_LENGTH
      ? ""
      : "El telefono del tutor debe tener 10 digitos.";
  const guardianEmailError =
    normalizedGuardianEmail.length === 0 ||
    isValidEmail(normalizedGuardianEmail)
      ? ""
      : "Ingresa un correo valido para el tutor.";
  const hasValidationErrors = Boolean(
    nameError ||
    bioError ||
    usernameError ||
    phoneError ||
    emergencyPhoneError ||
    guardianPhoneError ||
    guardianEmailError,
  );
  const autofillReady =
    form.autofillForms &&
    form.churchName.trim().length >= 3 &&
    form.city.trim().length >= 3 &&
    form.emergencyName.trim().length >= 3 &&
    emergencyPhoneDigits.length === PHONE_DIGIT_LENGTH;

  const isDirty = serializeForm(form) !== serializeForm(baseline);
  const canSave =
    !hasValidationErrors &&
    isDirty &&
    !avatarUploading &&
    !isSaving &&
    !isLoggingOut;
  const completionItems = [
    { label: "Nombre visible", done: normalizedName.length >= MIN_NAME_LENGTH },
    { label: "Foto de perfil", done: Boolean(form.avatar_url) },
    { label: "Bio breve", done: normalizedBio.length >= 12 },
    { label: "Username", done: normalizedUsername.length >= 3 },
    { label: "Telefono", done: phoneDigits.length === PHONE_DIGIT_LENGTH },
    { label: "Autofill listo", done: autofillReady },
  ];
  const completionScore = Math.round(
    (completionItems.filter((item) => item.done).length /
      completionItems.length) *
      100,
  );

  const nextSuggestion =
    normalizedName.length < MIN_NAME_LENGTH
      ? {
          title: "Completa tu nombre",
          description:
            "Es el dato principal para reconocer tu cuenta dentro de la comunidad.",
          targetId: "datos-basicos",
          cta: "Ir a datos basicos",
        }
      : normalizedUsername.length < 3
        ? {
            title: "Configura tu username",
            description:
              "Te ayuda a personalizar saludos, cabecera y referencias internas de tu cuenta.",
            targetId: "identidad-cuenta",
            cta: "Ir a identidad",
          }
        : phoneDigits.length !== PHONE_DIGIT_LENGTH
          ? {
              title: "Agrega tu telefono",
              description:
                "Asi podremos reutilizarlo en registros y formularios del sitio.",
              targetId: "identidad-cuenta",
              cta: "Completar telefono",
            }
          : !form.avatar_url
            ? {
                title: "Sube una foto de perfil",
                description:
                  "Una imagen clara hace tu cuenta mas facil de ubicar visualmente.",
                targetId: "perfil-publico",
                cta: "Ir a perfil publico",
              }
            : normalizedBio.length < 12
              ? {
                  title: "Haz tu bio mas clara",
                  description:
                    "Una breve descripcion ayuda a explicar quien eres o como prefieres presentarte.",
                  targetId: "perfil-publico",
                  cta: "Completar bio",
                }
              : !form.autofillForms
                ? {
                    title: "Activa el autocompletado",
                    description:
                      "Conecta tu cuenta con formularios como campamento y peticiones para ahorrar tiempo.",
                    targetId: "autocompletado-formularios",
                    cta: "Configurar formularios",
                  }
                : !autofillReady
                  ? {
                      title: "Completa tu plantilla de formularios",
                      description:
                        "Iglesia, ciudad y un contacto de emergencia listo hacen el registro mucho mas rapido.",
                      targetId: "autocompletado-formularios",
                      cta: "Terminar plantilla",
                    }
                  : {
                      title: "Tu perfil ya se entiende bien",
                      description:
                        "Solo revisa y guarda si hiciste cambios recientes.",
                      targetId: "guardar-cambios",
                      cta: "Revisar guardado",
                    };

  const statusBadge = isLoggingOut
    ? {
        label: "Cerrando sesion",
        tone: "bg-primary/15 text-primary",
        icon: Clock3,
      }
    : avatarUploading
      ? {
          label: "Subiendo foto",
          tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
          icon: Clock3,
        }
      : isSaving
        ? {
            label: "Guardando cambios",
            tone: "bg-primary/15 text-primary",
            icon: Clock3,
          }
        : isDirty
          ? {
              label: "Cambios sin guardar",
              tone: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
              icon: Clock3,
            }
          : {
              label: "Todo sincronizado",
              tone: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
              icon: CheckCircle2,
            };

  const focusFieldById = (id: string) => {
    const element = document.getElementById(id) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement
      | null;

    element?.focus();
    element?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const focusFirstInvalidField = () => {
    if (nameError) {
      focusFieldById("account-name");
      return;
    }

    if (usernameError) {
      focusFieldById("account-username");
      return;
    }

    if (phoneError) {
      focusFieldById("account-phone");
      return;
    }

    if (bioError) {
      focusFieldById("account-bio");
      return;
    }

    if (emergencyPhoneError) {
      focusFieldById("account-emergency-phone");
      return;
    }

    if (guardianPhoneError) {
      focusFieldById("account-guardian-phone");
      return;
    }

    if (guardianEmailError) {
      focusFieldById("account-guardian-email");
    }
  };

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleShortcutSave = useEffectEvent(() => {
    if (canSave) {
      formRef.current?.requestSubmit();
      return;
    }

    if (hasValidationErrors) {
      toast.error(
        nameError ||
          usernameError ||
          phoneError ||
          bioError ||
          emergencyPhoneError ||
          guardianPhoneError ||
          guardianEmailError,
      );
      focusFirstInvalidField();
      return;
    }

    if (avatarUploading || isSaving) {
      toast.message("Espera a que termine la accion actual.");
      return;
    }

    toast.message(
      isDirty
        ? "Revisa los campos pendientes antes de guardar."
        : "No hay cambios pendientes por guardar.",
    );
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key.toLowerCase() !== "s") return;

      event.preventDefault();
      handleShortcutSave();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (hasValidationErrors) {
      toast.error(
        nameError ||
          usernameError ||
          phoneError ||
          bioError ||
          emergencyPhoneError ||
          guardianPhoneError ||
          guardianEmailError,
      );
      focusFirstInvalidField();
      return;
    }

    const payload: UpdateAccountInput = { ...form };

    startSaveTransition(async () => {
      try {
        const saved = await updateAccount(payload);
        const next = normalizeForm(saved);

        setForm(next);
        setBaseline(next);
        setLastSavedAt(saved.updated_at);
        toast.success("Tu perfil se actualizo correctamente.");
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error, "No pudimos guardar tus cambios."));
      }
    });
  };

  const handleReset = () => {
    setForm(baseline);
    toast.message("Se descartaron los cambios sin guardar.");
  };

  const handleRemoveAvatar = () => {
    setForm((current) => ({ ...current, avatar_url: null }));
    toast.message("La foto se quitara cuando guardes los cambios.");
  };

  const handleClearBio = () => {
    setForm((current) => ({ ...current, bio: "" }));
    bioTextareaRef.current?.focus();
    toast.message("La bio se limpio. Guarda para confirmar el cambio.");
  };

  const handleApplyBioPreset = (
    presetId: (typeof BIO_PRESETS)[number]["id"],
  ) => {
    const preset = BIO_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    setForm((current) => ({
      ...current,
      bio: preset.build(toTitleCase(current.name)),
    }));

    toast.success(`Plantilla "${preset.label}" aplicada.`);
  };

  const handleSmartPolish = () => {
    setForm((current) => ({
      ...current,
      name: toTitleCase(current.name),
      bio: polishBioText(current.bio),
      username:
        current.username.trim() ||
        buildUsernameSuggestion(current.name, profile.email),
    }));

    toast.success("Pulimos tu nombre, tu bio y sugerimos un username base.");
  };

  const handleSuggestUsername = () => {
    const suggestion = buildUsernameSuggestion(form.name, profile.email);

    if (!suggestion) {
      toast.message("Necesito tu nombre o correo para sugerir un username.");
      return;
    }

    setForm((current) => ({
      ...current,
      username: suggestion,
    }));
    toast.success(
      "Generamos un username base. Puedes ajustarlo antes de guardar.",
    );
  };

  const handleCopyEmail = async () => {
    if (!profile.email) {
      toast.error("No hay un correo disponible para copiar.");
      return;
    }

    try {
      await navigator.clipboard.writeText(profile.email);
      toast.success("Correo copiado al portapapeles.");
    } catch {
      toast.error("No pudimos copiar el correo.");
    }
  };

  const handleLogout = () => {
    startLogoutTransition(async () => {
      try {
        await logoutAction();
      } catch (error) {
        toast.error(getErrorMessage(error, "No pudimos cerrar la sesion."));
      }
    });
  };

  const StatusIcon = statusBadge.icon;

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="space-y-6 xl:sticky xl:top-24">
        <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Vista general
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                Asi se ve tu perfil
              </h2>
            </div>

            <span
              className={cn(
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                completionScore === 100
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-amber-500/15 text-amber-700 dark:text-amber-300",
              )}
            >
              {completionScore}% completo
            </span>
          </div>

          <div className="mt-6 rounded-[1.5rem] border border-border/70 bg-gradient-to-b from-primary/10 via-background to-background p-5">
            <AvatarUpload
              avatarUrl={form.avatar_url}
              name={normalizedName}
              disabled={isSaving || isLoggingOut}
              onUpload={(url) =>
                setForm((current) => ({ ...current, avatar_url: url }))
              }
              onUploadingChange={setAvatarUploading}
            />

            {form.avatar_url ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarUploading || isSaving || isLoggingOut}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Quitar foto
              </button>
            ) : null}
          </div>

          <div className="mt-5 space-y-2 text-center">
            <h3 className="text-xl font-semibold text-foreground">
              {normalizedName || "Tu nombre aparecera aqui"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {profile.email ?? "Sin correo de acceso"}
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              {normalizedBio ||
                "Agrega una descripcion breve para que otros sepan como presentarte."}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                Progreso del perfil
              </span>
              <span className="text-muted-foreground">{completionScore}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${completionScore}%` }}
              />
            </div>

            <div className="grid gap-2">
              {completionItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-3 py-2 text-sm"
                >
                  <span className="text-foreground">{item.label}</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-xs font-semibold",
                      item.done ? "text-emerald-600" : "text-muted-foreground",
                    )}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {item.done ? "Listo" : "Pendiente"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Cuenta creada
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {formatDate(profile.created_at)}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Ultimo guardado
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {formatDate(lastSavedAt)}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <ArrowRight className="h-3.5 w-3.5" />
            Secciones
          </p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {SECTION_LINKS.map((section) => {
              const Icon = section.icon;

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5"
                >
                  <div>
                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {section.label}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </a>
              );
            })}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Siguiente mejora
          </p>

          <div className="mt-4 rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
            <p className="text-sm font-semibold text-foreground">
              {nextSuggestion.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {nextSuggestion.description}
            </p>
            <a
              href={`#${nextSuggestion.targetId}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-80"
            >
              {nextSuggestion.cta}
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
            <Sparkles className="h-3.5 w-3.5" />
            Recomendaciones
          </p>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                Usa un nombre reconocible
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Facilita que otras personas identifiquen tu cuenta rapidamente.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                Manten tu bio concreta
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Una frase corta suele funcionar mejor que un texto largo.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
              <p className="text-sm font-semibold text-foreground">
                Guarda tambien con teclado
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Puedes usar{" "}
                <span className="font-medium text-foreground">
                  Ctrl/Cmd + S
                </span>{" "}
                para guardar mas rapido.
              </p>
            </div>
          </div>
        </section>
      </aside>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-6 pb-28 lg:pb-0"
      >
        <section className="rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div
                aria-live="polite"
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold",
                  statusBadge.tone,
                )}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {statusBadge.label}
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Estado de tu cuenta
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {isLoggingOut
                    ? "Estamos cerrando tu sesion."
                    : avatarUploading
                      ? "Tu nueva foto se esta cargando. Espera un momento antes de guardar."
                      : isSaving
                        ? "Estamos confirmando tus cambios."
                        : isDirty
                          ? "Tienes ajustes pendientes por confirmar."
                          : "No hay cambios pendientes en este momento."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Ultima actualizacion
                </p>
                <p className="mt-1 font-medium text-foreground">
                  {formatDate(lastSavedAt)}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm">
                <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <Keyboard className="h-3.5 w-3.5" />
                  Atajo rapido
                </p>
                <p className="mt-1 font-medium text-foreground">Ctrl/Cmd + S</p>
              </div>
            </div>
          </div>
        </section>

        <SectionCard
          id="datos-basicos"
          eyebrow="Datos de acceso"
          title="Informacion basica"
          description="Manten tu identidad principal clara y consistente. El correo se muestra solo como referencia del acceso."
          icon={<UserRound className="h-3.5 w-3.5" />}
        >
          <div className="grid gap-5 lg:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Nombre
              </span>
              <input
                id="account-name"
                ref={nameInputRef}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                maxLength={MAX_NAME_LENGTH}
                placeholder="Como quieres que aparezca tu nombre"
                autoComplete="name"
                aria-invalid={Boolean(nameError)}
                aria-describedby="account-name-help account-name-error"
                className={cn(
                  "w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                  nameError ? "border-destructive/50" : "border-input",
                )}
              />
              <div className="flex items-center justify-between gap-3">
                <p
                  id="account-name-help"
                  className="text-xs text-muted-foreground"
                >
                  Usa tu nombre real o el que la comunidad reconoce mejor.
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.name.length}/{MAX_NAME_LENGTH}
                </p>
              </div>
              {nameError ? (
                <p id="account-name-error" className="text-xs text-destructive">
                  {nameError}
                </p>
              ) : null}
            </label>

            <label className="space-y-2">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Correo de acceso
              </span>
              <input
                value={profile.email ?? ""}
                readOnly
                autoComplete="email"
                className="w-full rounded-2xl border border-input bg-muted/50 px-4 py-3 text-foreground focus:outline-none"
              />
              <p className="text-xs text-muted-foreground">
                Este dato se usa para entrar a tu cuenta y no se edita desde
                aqui.
              </p>
            </label>
          </div>
        </SectionCard>

        <SectionCard
          id="perfil-publico"
          eyebrow="Perfil publico"
          title="Como te veran los demas"
          description="Una bio breve y una foto clara ayudan a que tu perfil se entienda rapido."
          icon={<FileText className="h-3.5 w-3.5" />}
          tone="amber"
          action={
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
                {normalizedBio.length > 0
                  ? `${normalizedBio.length} caracteres visibles`
                  : "Sin descripcion aun"}
              </span>
              <button
                type="button"
                onClick={handleSmartPolish}
                disabled={isSaving || isLoggingOut}
                className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pulir texto
              </button>
              {form.bio ? (
                <button
                  type="button"
                  onClick={handleClearBio}
                  disabled={isSaving || isLoggingOut}
                  className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Limpiar bio
                </button>
              ) : null}
            </div>
          }
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-foreground">
                  Descripcion breve
                </span>
                <textarea
                  id="account-bio"
                  ref={bioTextareaRef}
                  rows={5}
                  maxLength={MAX_BIO_LENGTH}
                  value={form.bio}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      bio: event.target.value,
                    }))
                  }
                  placeholder="Cuentanos algo breve sobre ti, tu servicio o como prefieres presentarte."
                  aria-invalid={Boolean(bioError)}
                  aria-describedby="account-bio-help account-bio-error"
                  className={cn(
                    "w-full resize-none rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    bioError ? "border-destructive/50" : "border-input",
                  )}
                />
              </label>

              <div className="flex items-center justify-between gap-3">
                <p
                  id="account-bio-help"
                  className="text-xs text-muted-foreground"
                >
                  Tip: una frase de 1 a 2 lineas suele ser suficiente.
                </p>
                <p
                  className={cn(
                    "text-xs font-medium",
                    form.bio.length > MAX_BIO_LENGTH - 20
                      ? "text-amber-700 dark:text-amber-300"
                      : "text-muted-foreground",
                  )}
                >
                  {form.bio.length}/{MAX_BIO_LENGTH}
                </p>
              </div>

              {bioError ? (
                <p id="account-bio-error" className="text-xs text-destructive">
                  {bioError}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-300">
                      <Wand2 className="h-3.5 w-3.5" />
                      Bio Lab
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Aplica una base rapida o pule el texto para que suene
                      mejor.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  {BIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyBioPreset(preset.id)}
                      disabled={isSaving || isLoggingOut}
                      className="flex items-start justify-between rounded-[1.25rem] border border-border/70 bg-card px-4 py-3 text-left transition hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {preset.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {preset.description}
                        </p>
                      </div>
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Vista previa
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("card")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      previewMode === "card"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <LayoutTemplate className="h-3.5 w-3.5" />
                    Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("comment")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      previewMode === "comment"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <MessageCircleMore className="h-3.5 w-3.5" />
                    Comentario
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("welcome")}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      previewMode === "welcome"
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Bienvenida
                  </button>
                </div>

                <div className="mt-4 rounded-[1.25rem] border border-border/70 bg-card p-4">
                  {previewMode === "card" ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                          {getInitials(normalizedName)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-foreground">
                            {normalizedName || "Tu nombre"}
                          </p>
                          <p className="truncate text-sm text-muted-foreground">
                            Perfil publico
                          </p>
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-muted-foreground">
                        {normalizedBio ||
                          "Tu descripcion aparecera aqui para ayudarte a revisar tono, claridad y longitud."}
                      </p>
                    </div>
                  ) : null}

                  {previewMode === "comment" ? (
                    <div className="rounded-2xl border border-border/70 bg-background p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-sm font-semibold text-primary">
                          {getInitials(normalizedName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-foreground">
                            {normalizedName || "Tu nombre"}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {normalizedBio ||
                              "Tu texto de presentacion se veria asi en un contexto conversacional."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {previewMode === "welcome" ? (
                    <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        {normalizedName
                          ? `Hola, soy ${normalizedName}`
                          : "Hola, este podria ser tu mensaje de bienvenida"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {normalizedBio ||
                          "Una descripcion clara ayuda mucho cuando alguien ve tu perfil por primera vez."}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="identidad-cuenta"
          eyebrow="Identidad de cuenta"
          title="Datos vinculados y editables"
          description="Ajusta los datos que más se reutilizan dentro del sitio sin perder de vista tu rol ni el cumpleaños vinculado."
          icon={<AtSign className="h-3.5 w-3.5" />}
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <div className="space-y-4">
              <label className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <AtSign className="h-4 w-4 text-muted-foreground" />
                    Username
                  </span>
                  <button
                    type="button"
                    onClick={handleSuggestUsername}
                    disabled={isSaving || isLoggingOut}
                    className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Sugerir
                  </button>
                </div>
                <input
                  id="account-username"
                  value={form.username}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  maxLength={MAX_USERNAME_LENGTH}
                  placeholder="ej. abigail.perez"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="nickname"
                  aria-invalid={Boolean(usernameError)}
                  aria-describedby="account-username-help account-username-error"
                  className={cn(
                    "w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    usernameError ? "border-destructive/50" : "border-input",
                  )}
                />
                <div className="flex items-center justify-between gap-3">
                  <p
                    id="account-username-help"
                    className="text-xs text-muted-foreground"
                  >
                    Se usa en saludos y referencias rápidas dentro del sitio.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {form.username.length}/{MAX_USERNAME_LENGTH}
                  </p>
                </div>
                {usernameError ? (
                  <p
                    id="account-username-error"
                    className="text-xs text-destructive"
                  >
                    {usernameError}
                  </p>
                ) : null}
              </label>

              <label className="space-y-2">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  Telefono
                </span>
                <input
                  id="account-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="951 123 4567"
                  aria-invalid={Boolean(phoneError)}
                  aria-describedby="account-phone-help account-phone-error"
                  className={cn(
                    "w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                    phoneError ? "border-destructive/50" : "border-input",
                  )}
                />
                <p
                  id="account-phone-help"
                  className="text-xs text-muted-foreground"
                >
                  Si lo guardas aqui, se podra precargar en campamentos y otros
                  formularios.
                </p>
                {phoneError ? (
                  <p
                    id="account-phone-error"
                    className="text-xs text-destructive"
                  >
                    {phoneError}
                  </p>
                ) : null}
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Rol actual
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {roleLabel}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Define los permisos disponibles dentro de la app.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4">
                <p className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Cumpleanos
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {profile.birthday
                    ? formatBirthdayDate(profile.birthday.birthDate)
                    : "Sin vincular"}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {profile.birthday?.ministryName
                    ? `Ministerio: ${profile.birthday.ministryName}`
                    : profile.canAccessBirthdays
                      ? "Cuando lo vinculas en birthdays, tambien se reutiliza en formularios."
                      : "Si necesitas vincularlo, pide apoyo a liderazgo."}
                </p>
                {profile.birthday && profile.canAccessBirthdays ? (
                  <Link
                    href={`/birthdays/${profile.birthday.id}`}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-primary transition hover:opacity-80"
                  >
                    Ver cumpleaños vinculado
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="autocompletado-formularios"
          eyebrow="Formularios conectados"
          title="Autocompletado inteligente"
          description="Guarda una plantilla base para que formularios como /camp y /peticion se sientan más rápidos y consistentes."
          icon={<Wand2 className="h-3.5 w-3.5" />}
          action={
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                form.autofillForms
                  ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {form.autofillForms ? "Autofill activo" : "Autofill pausado"}
            </span>
          }
        >
          <div className="space-y-5">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Activar autocompletado de formularios
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Si lo dejas activo, reutilizaremos estos datos como base,
                    pero siempre podrás editarlos dentro de cada formulario.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      autofillForms: !current.autofillForms,
                    }))
                  }
                  className={cn(
                    "relative inline-flex h-8 w-14 rounded-full transition",
                    form.autofillForms ? "bg-primary" : "bg-muted",
                  )}
                  aria-pressed={form.autofillForms}
                  aria-label="Activar autocompletado de formularios"
                >
                  <span
                    className={cn(
                      "absolute top-1 h-6 w-6 rounded-full bg-white transition",
                      form.autofillForms ? "left-7" : "left-1",
                    )}
                  />
                </button>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[220px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                <div className="rounded-[1.25rem] border border-border/70 bg-card p-4">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Nacimiento para formularios
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {profile.birthday
                      ? formatBirthdayDate(profile.birthday.birthDate)
                      : "Sin fecha vinculada"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {profile.birthday
                      ? "La fecha conectada con birthdays se usará como base en /camp."
                      : "Si luego vinculas tu cumpleaños, aparecerá aquí automáticamente."}
                  </p>
                </div>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">
                    Iglesia o comunidad
                  </span>
                  <input
                    value={form.churchName}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        churchName: event.target.value,
                      }))
                    }
                    autoComplete="organization"
                    placeholder="Iglesia Cristiana Monte Sion"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">
                    Ciudad de origen
                  </span>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        city: event.target.value,
                      }))
                    }
                    autoComplete="address-level2"
                    placeholder="Santa Maria Atzompa, Oaxaca"
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-foreground">
                    Rol por defecto en campamento
                  </span>
                  <select
                    value={form.campRole}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        campRole: event.target
                          .value as AccountFormValues["campRole"],
                      }))
                    }
                    className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {campRoles.map((role) => (
                      <option
                        key={role}
                        value={role}
                        className="bg-background text-foreground"
                      >
                        {formatRoleLabel(role)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Contacto de emergencia predeterminado
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Ideal para registros donde siempre piden una persona de
                    respaldo.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Nombre
                    </span>
                    <input
                      value={form.emergencyName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          emergencyName: event.target.value,
                        }))
                      }
                      placeholder="Nombre completo"
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Telefono
                    </span>
                    <input
                      id="account-emergency-phone"
                      value={form.emergencyPhone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          emergencyPhone: event.target.value,
                        }))
                      }
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="951 987 6543"
                      aria-invalid={Boolean(emergencyPhoneError)}
                      className={cn(
                        "w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                        emergencyPhoneError
                          ? "border-destructive/50"
                          : "border-input",
                      )}
                    />
                    {emergencyPhoneError ? (
                      <p className="text-xs text-destructive">
                        {emergencyPhoneError}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Relacion
                    </span>
                    <input
                      value={form.emergencyRelationship}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          emergencyRelationship: event.target.value,
                        }))
                      }
                      placeholder="Mama, tio, lider..."
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>

                  <label className="space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-foreground">
                      Direccion de emergencia
                    </span>
                    <textarea
                      value={form.emergencyAddress}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          emergencyAddress: event.target.value,
                        }))
                      }
                      rows={3}
                      placeholder="Calle, colonia, municipio y referencias"
                      className="w-full resize-none rounded-2xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-4 sm:p-5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Tutor predeterminado
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Útil si regularmente completas registros para menores de
                    edad.
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Nombre del tutor
                    </span>
                    <input
                      value={form.guardianName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          guardianName: event.target.value,
                        }))
                      }
                      placeholder="Como aparece en la identificación"
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Parentesco
                    </span>
                    <select
                      value={form.guardianRelationship}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          guardianRelationship: event.target
                            .value as AccountFormValues["guardianRelationship"],
                        }))
                      }
                      className="w-full rounded-2xl border border-input bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option
                        value=""
                        className="bg-background text-foreground"
                      >
                        Selecciona una opcion
                      </option>
                      {guardianRelationships.map((relationship) => (
                        <option
                          key={relationship}
                          value={relationship}
                          className="bg-background text-foreground"
                        >
                          {relationship}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Telefono del tutor
                    </span>
                    <input
                      id="account-guardian-phone"
                      value={form.guardianPhone}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          guardianPhone: event.target.value,
                        }))
                      }
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="951 234 5678"
                      aria-invalid={Boolean(guardianPhoneError)}
                      className={cn(
                        "w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                        guardianPhoneError
                          ? "border-destructive/50"
                          : "border-input",
                      )}
                    />
                    {guardianPhoneError ? (
                      <p className="text-xs text-destructive">
                        {guardianPhoneError}
                      </p>
                    ) : null}
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm font-medium text-foreground">
                      Correo del tutor
                    </span>
                    <input
                      id="account-guardian-email"
                      value={form.guardianEmail}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          guardianEmail: event.target.value,
                        }))
                      }
                      type="email"
                      autoComplete="email"
                      placeholder="tutor@email.com"
                      aria-invalid={Boolean(guardianEmailError)}
                      className={cn(
                        "w-full rounded-2xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
                        guardianEmailError
                          ? "border-destructive/50"
                          : "border-input",
                      )}
                    />
                    {guardianEmailError ? (
                      <p className="text-xs text-destructive">
                        {guardianEmailError}
                      </p>
                    ) : null}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          id="acciones-rapidas"
          eyebrow="Opciones utiles"
          title="Acciones rapidas de cuenta"
          description="Aqui tienes accesos directos para tareas comunes, incluyendo formularios que ahora pueden reutilizar tu perfil."
          icon={<Sparkles className="h-3.5 w-3.5" />}
        >
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <button
              type="button"
              onClick={handleCopyEmail}
              disabled={!profile.email || isLoggingOut}
              className="flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="inline-flex rounded-full bg-primary/10 p-2 text-primary">
                <Copy className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Copiar correo
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Copia tu correo de acceso para usarlo rapidamente.
                </p>
              </div>
            </button>

            <Link
              href="/camp#registro"
              className="flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="inline-flex rounded-full bg-primary/10 p-2 text-primary">
                <CalendarDays className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Abrir registro camp
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Prueba el flujo con los datos base que guardaste aqui.
                </p>
              </div>
            </Link>

            <Link
              href="/peticion"
              className="flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="inline-flex rounded-full bg-primary/10 p-2 text-primary">
                <MessageCircleMore className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Ir a peticion
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Usa tu cuenta como base tambien en el formulario de oracion.
                </p>
              </div>
            </Link>

            <Link
              href="/forgot-password"
              className="flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="inline-flex rounded-full bg-primary/10 p-2 text-primary">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Cambiar contraseña
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Ve al flujo seguro para renovar tu contraseña.
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isSaving || avatarUploading || isLoggingOut}
              className="flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border border-border/70 bg-background/80 p-4 text-left transition hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="inline-flex rounded-full bg-primary/10 p-2 text-primary">
                <LogOut className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isLoggingOut ? "Cerrando sesion..." : "Cerrar sesion"}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Sal de tu cuenta desde este panel sin volver al menu
                  principal.
                </p>
              </div>
            </button>
          </div>
        </SectionCard>

        <SectionCard
          id="seguridad-cuenta"
          eyebrow="Seguridad"
          title="Privacidad y control de cuenta"
          description="Desde aqui puedes revisar acciones sensibles. La eliminacion de cuenta es permanente."
          icon={<ShieldAlert className="h-3.5 w-3.5" />}
          tone="destructive"
        >
          <DeleteAccountButton
            disabled={isSaving || avatarUploading || isLoggingOut}
          />
        </SectionCard>

        <section
          id="guardar-cambios"
          className="scroll-mt-24 rounded-[1.75rem] border border-border/70 bg-card/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] backdrop-blur sm:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Confirmar cambios
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                {isDirty
                  ? "Cuando guardes, actualizaremos tu perfil, tu identidad vinculada y tus plantillas para formularios."
                  : "No hay cambios pendientes por guardar."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={
                  !isDirty || isSaving || avatarUploading || isLoggingOut
                }
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer
              </button>

              <button
                type="submit"
                disabled={!canSave}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {avatarUploading
                  ? "Subiendo foto..."
                  : isSaving
                    ? "Guardando..."
                    : "Guardar cambios"}
              </button>
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {isLoggingOut
                  ? "Saliendo"
                  : avatarUploading
                    ? "Subiendo foto"
                    : isSaving
                      ? "Guardando"
                      : isDirty
                        ? "Pendiente"
                        : "Sin cambios"}
              </p>
              <p className="truncate text-sm font-medium text-foreground">
                {isDirty
                  ? nextSuggestion.title
                  : `Ultimo guardado ${formatDate(lastSavedAt)}`}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty || isSaving || avatarUploading || isLoggingOut}
              className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={!canSave}
              className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

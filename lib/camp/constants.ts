import type {
  CampRegistrationFormValues,
  CampStepDefinition,
} from "@/lib/camp/types";

export const CAMP_EVENT = {
  slug: "campamento-monte-sion-2026",
  name: "Campamento Monte Sion 2026",
  theme: "Volver a Su Presencia",
  fullTitle: "Campamento Monte Sion 2026",
  dateLabel: "Domigo 12 de Abril de 2026",
  dateRangeIso: {
    startsAt: "2026-04-12T00:00:00-00:00",
    endsAt: "2026-04-12T00:00:00-00:00",
  },
  durationLabel: "1 día",
  location: "Rancho Leche&Miel",
  city: "San Francisco Lachigoló, Oaxaca",
  venueLine:
    "Rancho Leche&Miel, UCTEM Universidad, San Francisco Lachigoló, Oaxaca, México",
  organizer: "Iglesia Cristiana Monte Sion",
  contacts: ["951 209 1644"],
  highlights: [
    "Talleres practicos y plenarias centradas en identidad y proposito.",
    "Fogata, tiempos de adoracion y comunidad con lideres del campamento.",
    "Registro digital con ticket QR y check-in agil para el equipo.",
  ],
  checklist: [
    "Ropa comoda para clima de bosque y actividades al aire libre.",
    "Identificacion oficial o carta responsiva si eres menor de edad.",
    "Medicamentos personales y detalle de alergias si aplica.",
  ],
} as const;

export const CAMP_PAGE_CONTENT = {
  badge: "Campamento cristiano 2026",
  heroTitle: CAMP_EVENT.fullTitle,
  heroDescription:
    "Una experiencia premium de fe, comunidad y naturaleza organizada por {{organizer}}. Regístrate en minutos, genera tu ticket con QR y prepárate para vivir algo profundo.",
  sectionEyebrow: "Lo que vivirás",
  sectionTitle: "Registro claro para una experiencia bien cuidada",
  sectionDescription:
    "Diseñamos el flujo de inscripción para que la logística sea confiable desde el primer momento: validación de CURP, contacto de emergencia, responsiva automatizada y ticket premium con QR.",
} as const;

export const CAMP_DETAIL_CARDS = [
  {
    title: "Fechas",
    body: `${CAMP_EVENT.dateLabel}. Un encuentro diseñado para vivir en comunidad.`,
    icon: "calendar",
  },
  {
    title: "Ubicación",
    body: "Bosque Nido del Aguila, Miahuatlan, Oaxaca. Un entorno natural para descansar y escuchar.",
    icon: "mapPin",
  },
  {
    title: "Experiencia",
    body: "Plenarias, fogata, tiempos de oración, dinámicas de integración y retos al aire libre.",
    icon: "tentTree",
  },
  {
    title: "Cuidado",
    body: "Control de alergias, registro con QR, carta responsiva y check-in administrado por líderes.",
    icon: "shieldCheck",
  },
] as const;

export const CAMP_FAQ_ITEMS = [
  {
    question: "¿Quiénes pueden registrarse?",
    answer:
      "Jóvenes, líderes, servidores e invitados. El formulario adapta automáticamente la responsiva si el asistente es menor de edad.",
  },
  {
    question: "¿Qué pasa si soy menor de 18 años?",
    answer:
      "Debes completar la carta responsiva con datos del tutor legal, firma digital y una identificación oficial vigente.",
  },
  {
    question: "¿Cuándo recibo mi ticket?",
    answer:
      "Se genera inmediatamente al confirmar el registro. También podrás abrirlo desde /camp/ticket/[ticketId].",
  },
  {
    question: "¿Necesito imprimir algo?",
    answer:
      "El ticket digital basta para el acceso. Si eres menor, conviene llevar además la responsiva en PDF por respaldo.",
  },
] as const;

export const guardianIdMaxFileSize = 5 * 1024 * 1024;

export const campStepDefinitions: CampStepDefinition[] = [
  {
    id: "personal",
    index: 1,
    label: "Datos personales",
    description: "Identidad y datos generales del asistente.",
  },
  {
    id: "contact",
    index: 2,
    label: "Contacto",
    description: "Canales principales para seguimiento.",
  },
  {
    id: "confirm",
    index: 3,
    label: "Confirmación",
    description: "Revisa tu información antes de enviar.",
  },
];

export const campRegistrationDefaults: CampRegistrationFormValues = {
  firstName: "",
  lastName: "",
  birthDate: "",
  curp: "",
  gender: "",
  attendanceConfirmation: "yes",
  needsTransport: null,
  interestedInBaptism: null,
  churchName: "",
  city: "",
  campRole: "participant",
  hasAllergies: null,
  allergiesDetails: "",
  email: "",
  phone: "",
  emergencyName: "No especificado",
  emergencyPhone: "0000000000",
  emergencyRelationship: "Familiar",
  emergencyAddress: "No especificada",
  guardianName: "",
  guardianRelationship: "",
  guardianCurp: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianSignatureDataUrl: "",
  guardianIdFile: null,
  termsAccepted: false,
};

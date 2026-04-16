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
  badge: "Registro esencial",
  heroTitle: CAMP_EVENT.fullTitle,
  heroDescription:
    "Solo lo necesario para registrar tu asistencia.",
  sectionEyebrow: "Datos esenciales",
  sectionTitle: "Registro rápido y directo",
  sectionDescription:
    "Nombre, apellidos, iglesia y teléfono. Nada más.",
} as const;

export const CAMP_REGISTRATION_OPEN = false;
export const CAMP_REGISTRATION_CLOSED_MESSAGE =
  "El registro para Campamento Monte Sion 2026 ya fue cerrado.";

export const CAMP_DETAIL_CARDS = [
  {
    title: "Fechas",
    body: `${CAMP_EVENT.dateLabel} | 10:00 AM (GMT-6).`,
    icon: "calendar",
  },
  {
    title: "Ubicación",
    body: "Rancho Leche & Miel by UCTEM Universidad, Calle 2 de Abril, San Sebastián Abasolo, 70407, Oaxaca, México.",
    icon: "mapPin",
  },
  {
    title: "Experiencia",
    body: "Bautizos + servicio general.",
    icon: "tentTree",
  },
  {
    title: "Cuidado",
    body: "Ticket con QR y acceso ágil.",
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
  curp: "",
  attendanceConfirmation: "yes",
  needsTransport: null,
  interestedInBaptism: null,
  churchName: "",
  campRole: "participant",
  hasAllergies: null,
  allergiesDetails: "",
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

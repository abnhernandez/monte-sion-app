export const campRoles = ["participant", "leader", "server", "guest"] as const;
export const legalGenderOptions = ["H", "M"] as const;
export const campAttendanceOptions = ["yes", "no", "maybe"] as const;
export const guardianRelationships = [
  "Padre",
  "Madre",
  "Tutor legal",
  "Abuelo/a",
  "Hermano/a mayor",
] as const;
export const campStepIds = ["personal", "contact", "guardian", "confirm"] as const;

export type CampRole = (typeof campRoles)[number];
export type LegalGender = (typeof legalGenderOptions)[number];
export type CampAttendanceOption = (typeof campAttendanceOptions)[number];
export type GuardianRelationship = (typeof guardianRelationships)[number];
export type CampStepId = (typeof campStepIds)[number];

export type CampStepDefinition = {
  id: CampStepId;
  index: number;
  label: string;
  description: string;
};

export type CampRegistrationFormValues = {
  firstName: string;
  lastName: string;
  birthDate: string;
  curp: string;
  gender: LegalGender | "";
  attendanceConfirmation: CampAttendanceOption | "";
  needsTransport: boolean | null;
  interestedInBaptism: boolean | null;
  churchName: string;
  city: string;
  campRole: CampRole | "";
  hasAllergies: boolean | null;
  allergiesDetails: string;
  email: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  emergencyAddress: string;
  guardianName: string;
  guardianRelationship: GuardianRelationship | "";
  guardianCurp: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianSignatureDataUrl: string;
  guardianIdFile: File | null;
  termsAccepted: boolean;
};

export type CampRegistrationPayload = Omit<
  CampRegistrationFormValues,
  "guardianIdFile"
> & {
  age: number;
  isMinor: boolean;
  guardianIdFile: File | null;
};

export type CampRegistrationRecord = {
  id: string;
  ticketId: string;
  qrPayload: string;
  status: "registered" | "checked_in";
  checkedInAt: string | null;
  checkedInBy: string | null;
  createdAt: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  age: number;
  isMinor: boolean;
  curp: string;
  gender: LegalGender;
  attendanceConfirmation: CampAttendanceOption;
  needsTransport: boolean;
  interestedInBaptism: boolean;
  churchName: string;
  city: string;
  campRole: CampRole;
  hasAllergies: boolean;
  allergiesDetails: string;
  email: string;
  phone: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  emergencyAddress: string;
  guardianName: string;
  guardianRelationship: GuardianRelationship | "";
  guardianCurp: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianSignatureDataUrl: string;
  guardianIdPath: string | null;
  termsAccepted: boolean;
};

export type CampTicketViewModel = {
  attendeeName: string;
  ticketId: string;
  ticketUrl: string;
  responsivaUrl: string | null;
  qrDataUrl: string;
  checkedInAt: string | null;
  isMinor: boolean;
  roleLabel: string;
  eventName: string;
  eventDateLabel: string;
  location: string;
  city: string;
  churchName: string;
  email: string;
  phone: string;
  createdAtLabel: string;
};

export type CampApiError = {
  success: false;
  message: string;
  issues?: Partial<Record<keyof CampRegistrationFormValues, string>>;
};

export type CampApiSuccess = {
  success: true;
  registration: CampRegistrationRecord;
  ticket: CampTicketViewModel;
  emailStatus: "sent" | "skipped" | "failed";
};

export type CampCheckInResponse = {
  success: true;
  alreadyCheckedIn: boolean;
  message: string;
  registration: Pick<
    CampRegistrationRecord,
    "ticketId" | "checkedInAt" | "isMinor" | "campRole"
  > & {
    attendeeName: string;
  };
};

import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";
import type {
  CampRegistrationPayload,
  CampRegistrationRecord,
} from "@/lib/camp/types";
import { buildTicketUrl, generateTicketId } from "@/lib/camp/utils";
import { uploadGuardianIdentification } from "@/lib/camp/storage";

const CAMP_TABLE = "camp_registrations";

type CampRegistrationRow = {
  id: string;
  ticket_id: string;
  qr_payload: string;
  status: "registered" | "checked_in";
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  birth_date: string;
  age: number;
  is_minor: boolean;
  curp: string;
  gender: "H" | "M";
  attendance_confirmation: CampRegistrationRecord["attendanceConfirmation"];
  needs_transport: boolean;
  interested_in_baptism: boolean;
  church_name: string;
  city: string;
  camp_role: CampRegistrationRecord["campRole"];
  has_allergies: boolean;
  allergies_details: string;
  email: string;
  phone: string;
  emergency_name: string;
  emergency_phone: string;
  emergency_relationship: string;
  emergency_address: string;
  guardian_name: string;
  guardian_relationship: CampRegistrationRecord["guardianRelationship"];
  guardian_curp: string;
  guardian_phone: string;
  guardian_email: string;
  guardian_signature_data_url: string;
  guardian_id_path: string | null;
  terms_accepted: boolean;
};

function mapCampRow(row: CampRegistrationRow): CampRegistrationRecord {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    qrPayload: row.qr_payload,
    status: row.status,
    checkedInAt: row.checked_in_at,
    checkedInBy: row.checked_in_by,
    createdAt: row.created_at,
    firstName: row.first_name,
    lastName: row.last_name,
    birthDate: row.birth_date,
    age: row.age,
    isMinor: row.is_minor,
    curp: row.curp,
    gender: row.gender,
    attendanceConfirmation: row.attendance_confirmation,
    needsTransport: row.needs_transport,
    interestedInBaptism: row.interested_in_baptism,
    churchName: row.church_name,
    city: row.city,
    campRole: row.camp_role,
    hasAllergies: row.has_allergies,
    allergiesDetails: row.allergies_details,
    email: row.email,
    phone: row.phone,
    emergencyName: row.emergency_name,
    emergencyPhone: row.emergency_phone,
    emergencyRelationship: row.emergency_relationship,
    emergencyAddress: row.emergency_address,
    guardianName: row.guardian_name,
    guardianRelationship: row.guardian_relationship,
    guardianCurp: row.guardian_curp,
    guardianPhone: row.guardian_phone,
    guardianEmail: row.guardian_email,
    guardianSignatureDataUrl: row.guardian_signature_data_url,
    guardianIdPath: row.guardian_id_path,
    termsAccepted: row.terms_accepted,
  };
}

async function generateUniqueTicketId() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const ticketId = generateTicketId();
    const { data, error } = await supabaseAdmin
      .from(CAMP_TABLE)
      .select("ticket_id")
      .eq("ticket_id", ticketId)
      .maybeSingle();

    if (error) {
      throw new Error(`No se pudo validar el ticket: ${error.message}`);
    }

    if (!data) {
      return ticketId;
    }
  }

  throw new Error("No se pudo generar un ticket unico.");
}

export async function createCampRegistration(payload: CampRegistrationPayload) {
  const ticketId = await generateUniqueTicketId();
  const guardianIdPath =
    payload.isMinor && payload.guardianIdFile
      ? await uploadGuardianIdentification(payload.guardianIdFile, ticketId)
      : null;

  const insertPayload = {
    ticket_id: ticketId,
    qr_payload: buildTicketUrl(ticketId),
    status: "registered" as const,
    first_name: payload.firstName,
    last_name: payload.lastName,
    birth_date: payload.birthDate,
    age: payload.age,
    is_minor: payload.isMinor,
    curp: payload.curp,
    gender: payload.gender,
    attendance_confirmation: payload.attendanceConfirmation,
    needs_transport: payload.needsTransport,
    interested_in_baptism: payload.interestedInBaptism,
    church_name: payload.churchName,
    city: payload.city,
    camp_role: payload.campRole,
    has_allergies: payload.hasAllergies,
    allergies_details: payload.allergiesDetails,
    email: payload.email,
    phone: payload.phone,
    emergency_name: payload.emergencyName,
    emergency_phone: payload.emergencyPhone,
    emergency_relationship: payload.emergencyRelationship,
    emergency_address: payload.emergencyAddress,
    guardian_name: payload.guardianName,
    guardian_relationship: payload.guardianRelationship,
    guardian_curp: payload.guardianCurp,
    guardian_phone: payload.guardianPhone,
    guardian_email: payload.guardianEmail,
    guardian_signature_data_url: payload.guardianSignatureDataUrl,
    guardian_id_path: guardianIdPath,
    terms_accepted: payload.termsAccepted,
  };

  const { data, error } = await supabaseAdmin
    .from(CAMP_TABLE)
    .insert(insertPayload)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo guardar el registro: ${error?.message ?? ""}`);
  }

  return mapCampRow(data as CampRegistrationRow);
}

export async function getCampRegistrationByTicketId(ticketId: string) {
  const { data, error } = await supabaseAdmin
    .from(CAMP_TABLE)
    .select("*")
    .eq("ticket_id", ticketId)
    .maybeSingle();

  if (error) {
    throw new Error(`No se pudo consultar el ticket: ${error.message}`);
  }

  return data ? mapCampRow(data as CampRegistrationRow) : null;
}

export async function listCampRegistrations() {
  const { data, error } = await supabaseAdmin
    .from(CAMP_TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`No se pudo cargar el panel: ${error.message}`);
  }

  return (data as CampRegistrationRow[]).map(mapCampRow);
}

export async function markCampRegistrationCheckedIn(
  ticketId: string,
  checkedInBy: string
) {
  const existing = await getCampRegistrationByTicketId(ticketId);

  if (!existing) {
    return null;
  }

  if (existing.checkedInAt) {
    return {
      registration: existing,
      alreadyCheckedIn: true,
    };
  }

  const checkedInAt = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from(CAMP_TABLE)
    .update({
      status: "checked_in",
      checked_in_at: checkedInAt,
      checked_in_by: checkedInBy,
    })
    .eq("ticket_id", ticketId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`No se pudo registrar el check-in: ${error?.message ?? ""}`);
  }

  return {
    registration: mapCampRow(data as CampRegistrationRow),
    alreadyCheckedIn: false,
  };
}

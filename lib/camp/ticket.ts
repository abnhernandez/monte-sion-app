import "server-only";

import { CAMP_EVENT } from "@/lib/camp/constants";
import { generateTicketQrDataUrl } from "@/lib/camp/qr";
import type {
  CampRegistrationRecord,
  CampTicketViewModel,
} from "@/lib/camp/types";
import {
  buildFullName,
  buildResponsivaUrl,
  buildTicketUrl,
  formatHumanDateTime,
  formatPhoneForDisplay,
  formatRoleLabel,
} from "@/lib/camp/utils";

export async function buildCampTicketViewModel(
  registration: CampRegistrationRecord
): Promise<CampTicketViewModel> {
  const ticketUrl = buildTicketUrl(registration.ticketId);

  return {
    attendeeName: buildFullName(registration.firstName, registration.lastName),
    ticketId: registration.ticketId,
    ticketUrl,
    responsivaUrl: registration.isMinor
      ? buildResponsivaUrl(registration.ticketId)
      : null,
    qrDataUrl: await generateTicketQrDataUrl(ticketUrl),
    checkedInAt: registration.checkedInAt,
    isMinor: registration.isMinor,
    roleLabel: formatRoleLabel(registration.campRole),
    eventName: `${CAMP_EVENT.name} - ${CAMP_EVENT.theme}`,
    eventDateLabel: CAMP_EVENT.dateLabel,
    location: CAMP_EVENT.location,
    city: registration.city,
    churchName: registration.churchName,
    email: registration.email,
    phone: formatPhoneForDisplay(registration.phone),
    createdAtLabel: formatHumanDateTime(registration.createdAt),
  };
}

import "server-only";

import type { CampTicketViewModel } from "@/lib/camp/types";

export async function sendCampConfirmationEmail(ticket: CampTicketViewModel) {
  void ticket;
  return "skipped" as const;
}

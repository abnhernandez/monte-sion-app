import "server-only";

import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import { CAMP_EVENT } from "@/lib/camp/constants";
import type { CampRegistrationRecord } from "@/lib/camp/types";
import { buildFullName, formatPhoneForDisplay } from "@/lib/camp/utils";

function drawWrappedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  options: {
    font: PDFFont;
    size: number;
    color: RGB;
    maxWidth: number;
    lineHeight: number;
  }
) {
  const words = text.split(/\s+/);
  let line = "";
  let cursorY = y;

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    const width = options.font.widthOfTextAtSize(candidate, options.size);

    if (width <= options.maxWidth) {
      line = candidate;
      continue;
    }

    page.drawText(line, {
      x,
      y: cursorY,
      font: options.font,
      size: options.size,
      color: options.color,
    });
    cursorY -= options.lineHeight;
    line = word;
  }

  if (line) {
    page.drawText(line, {
      x,
      y: cursorY,
      font: options.font,
      size: options.size,
      color: options.color,
    });
  }

  return cursorY - options.lineHeight;
}

export async function buildResponsivaPdf(registration: CampRegistrationRecord) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]);
  const sans = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const sansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const serif = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const forest = rgb(0.07, 0.19, 0.11);
  const gold = rgb(0.77, 0.57, 0.16);
  const text = rgb(0.12, 0.15, 0.12);

  page.drawRectangle({
    x: 0,
    y: 726,
    width: 612,
    height: 66,
    color: forest,
  });
  page.drawText("CARTA RESPONSIVA", {
    x: 40,
    y: 756,
    font: sansBold,
    size: 20,
    color: rgb(1, 1, 1),
  });
  page.drawText(`${CAMP_EVENT.name} - ${CAMP_EVENT.theme}`, {
    x: 40,
    y: 738,
    font: sans,
    size: 11,
    color: rgb(0.93, 0.89, 0.8),
  });

  page.drawRectangle({
    x: 40,
    y: 694,
    width: 532,
    height: 1.5,
    color: gold,
  });

  let cursorY = 662;

  cursorY = drawWrappedText(
    page,
    `Yo, ${registration.guardianName}, en mi caracter de ${registration.guardianRelationship.toLowerCase()} del menor ${buildFullName(
      registration.firstName,
      registration.lastName
    )}, autorizo su participación en ${CAMP_EVENT.fullTitle}, organizado por ${CAMP_EVENT.organizer}, a celebrarse del ${CAMP_EVENT.dateLabel} en ${CAMP_EVENT.venueLine}.`,
    40,
    cursorY,
    {
      font: serif,
      size: 12,
      color: text,
      maxWidth: 532,
      lineHeight: 18,
    }
  );

  cursorY = drawWrappedText(
    page,
    "Declaro que la información proporcionada es correcta, que conozco las actividades generales del evento y que asumo la responsabilidad por cualquier situación médica, accidente o traslado que pudiera requerirse durante la estancia del menor.",
    40,
    cursorY,
    {
      font: serif,
      size: 12,
      color: text,
      maxWidth: 532,
      lineHeight: 18,
    }
  );

  cursorY = drawWrappedText(
    page,
    "Autorizo al equipo del campamento a contactar al tutor registrado y gestionar atención médica inmediata en caso de emergencia. Confirmo además haber adjuntado una identificación oficial vigente para validar mi identidad.",
    40,
    cursorY,
    {
      font: serif,
      size: 12,
      color: text,
      maxWidth: 532,
      lineHeight: 18,
    }
  );

  page.drawText("Datos del tutor", {
    x: 40,
    y: cursorY - 8,
    font: sansBold,
    size: 12,
    color: forest,
  });

  const tutorDetails = [
    `Nombre: ${registration.guardianName}`,
    `CURP: ${registration.guardianCurp}`,
    `Teléfono: ${formatPhoneForDisplay(registration.guardianPhone)}`,
    `Correo: ${registration.guardianEmail}`,
    `Ticket: ${registration.ticketId}`,
  ];

  let detailY = cursorY - 30;
  for (const line of tutorDetails) {
    page.drawText(line, {
      x: 40,
      y: detailY,
      font: sans,
      size: 11,
      color: text,
    });
    detailY -= 16;
  }

  if (registration.guardianSignatureDataUrl.startsWith("data:image/")) {
    const signatureImage = await pdfDoc.embedPng(
      registration.guardianSignatureDataUrl
    );
    const scaled = signatureImage.scale(0.55);

    page.drawText("Firma del tutor", {
      x: 40,
      y: 188,
      font: sansBold,
      size: 11,
      color: forest,
    });
    page.drawImage(signatureImage, {
      x: 40,
      y: 110,
      width: scaled.width,
      height: scaled.height,
    });
  }

  page.drawRectangle({
    x: 40,
    y: 56,
    width: 532,
    height: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  page.drawText(
    `Contactos de emergencia del campamento: ${CAMP_EVENT.contacts.join(
      " / "
    )}`,
    {
      x: 40,
      y: 34,
      font: sans,
      size: 9,
      color: rgb(0.35, 0.35, 0.35),
    }
  );

  return pdfDoc.save();
}

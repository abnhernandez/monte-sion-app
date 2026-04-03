import "server-only";

import QRCode from "qrcode";

export async function generateTicketQrDataUrl(payload: string) {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 1,
    width: 360,
    color: {
      dark: "#10301d",
      light: "#0000",
    },
  });
}

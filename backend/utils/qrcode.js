const QRCode = require('qrcode');

/**
 * Generates a QR code as a base64 data URL encoding the ticket verification payload.
 * The payload is a simple JSON string containing the ticket code - in production
 * you may want to sign this (e.g. HMAC) so it can't be forged.
 */
const generateTicketQR = async (ticketCode) => {
  const payload = JSON.stringify({ ticketCode });
  const dataUrl = await QRCode.toDataURL(payload, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
  });
  return dataUrl;
};

// Converts a base64 data URL into a Buffer for email attachments
const dataUrlToBuffer = (dataUrl) => {
  const base64 = dataUrl.split(',')[1];
  return Buffer.from(base64, 'base64');
};

module.exports = { generateTicketQR, dataUrlToBuffer };

const fs = require("fs");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, // Use false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const FROM_ADDRESS = process.env.EMAIL_FROM;
const normalizeAttachments = (attachments = []) => {
  return attachments.map(({ filename, path }) => {
    if (path.startsWith("data:")) {
      const base64 = path.split(",")[1];
      return { filename, content: base64 };
    }

    const content = fs.readFileSync(path).toString("base64");
    return { filename, content };
  });
};

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    console.log("=== USING NODEMAILER ===");

    const info = await transporter.sendMail({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      attachments,
    });

    console.log("Email sent:", info.messageId);

    return {
      success: true,
      info: {
        messageId: info.messageId,
        response: info.response,
      },
    };
  } catch (err) {
    console.error("Email send failed:", err);

    return {
      success: false,
      error: err.message,
    };
  }
};

const sendTicketEmail = async ({
  to,
  userName,
  eventTitle,
  venue,
  startDate,
  seatLabel,
  ticketCode,
  qrCode,
}) => {
  const html = ticketConfirmationTemplate({
    userName,
    eventTitle,
    venue,
    startDate,
    seatLabel,
    ticketCode,
  });

  return sendEmail({
    to,
    subject: `Ticket Confirmation - ${eventTitle}`,
    html,
    attachments: qrCode
      ? [
          {
            filename: "ticket-qr.png",
            path: qrCode,
          },
        ]
      : [],
  });
};

const ticketConfirmationTemplate = ({
  userName,
  eventTitle,
  venue,
  startDate,
  seatLabel,
  ticketCode,
}) => `
<div style="
font-family:Arial,sans-serif;
max-width:500px;
margin:auto;
padding:20px;
">

<h2>You're going to ${eventTitle}! 🎉</h2>

<p>Hi ${userName},</p>

<p>
Your ticket has been confirmed successfully.
</p>


<table style="
width:100%;
border-collapse:collapse;
">

<tr>
<td><strong>Event</strong></td>
<td>${eventTitle}</td>
</tr>

<tr>
<td><strong>Venue</strong></td>
<td>${venue}</td>
</tr>

<tr>
<td><strong>Date</strong></td>
<td>${new Date(startDate).toLocaleString()}</td>
</tr>

${
  seatLabel
    ? `
<tr>
<td><strong>Seat</strong></td>
<td>${seatLabel}</td>
</tr>
`
    : ""
}


<tr>
<td><strong>Ticket Code</strong></td>
<td>${ticketCode}</td>
</tr>

</table>


<p>
Your QR ticket is attached.
</p>

<p>
See you there! 🎟️
</p>

</div>
`;

const eventStatusTemplate = ({
  organizerName,
  eventTitle,
  status,
  reason,
}) => `

<div style="font-family:Arial,sans-serif">

<h2>
Event ${status === "approved" ? "Approved ✅" : "Rejected ❌"}
</h2>


<p>
Hi ${organizerName},
</p>


<p>
Your event 
<strong>${eventTitle}</strong>
has been 
<strong>${status}</strong>
by the admin team.
</p>


${
  reason
    ? `
<p>
<strong>Reason:</strong> ${reason}
</p>
`
    : ""
}


</div>

`;

const verificationEmailTemplate = ({ name, code }) => `
<div style="font-family: Arial, sans-serif; max-width:600px; margin:auto;">
  <h2>Email Verification</h2>

  <p>Hello ${name},</p>

  <p>Thanks for signing up.</p>

  <p>Your verification code is:</p>

  <h1 style="
      letter-spacing:6px;
      color:#2563eb;
      text-align:center;
  ">
      ${code}
  </h1>

  <p>This code will expire in 10 minutes.</p>

  <p>If you didn't create this account, simply ignore this email.</p>
</div>
`;

module.exports = {
  sendEmail,
  sendTicketEmail,
  ticketConfirmationTemplate,
  eventStatusTemplate,
  verificationEmailTemplate,
};
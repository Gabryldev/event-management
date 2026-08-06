const fs = require("fs");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "onboarding@resend.dev";
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
  console.log("=== USING RESEND EMAIL SERVICE ===");
  try {
    console.log("TO:", to);
    console.log("FROM:", FROM_ADDRESS);

    // Ensure `to` is an array as expected by many providers
    const toList = Array.isArray(to) ? to : [to];

    // Call Resend and log full response for easier debugging
    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to: toList,
      subject,
      html,
      attachments: normalizeAttachments(attachments),
    });

    console.log("Resend send response:", response);

    // Older or different SDK shapes may wrap data; handle common cases
    const messageId = response?.id || response?.data?.id;
    const error = response?.error || response?.errors?.[0];

    if (error) {
      console.error("Email send failed:", error.message || error);
      return { success: false, error: error.message || String(error) };
    }

    return {
      success: true,
      info: {
        messageId,
        response: "accepted by Resend",
      },
    };
  } catch (err) {
    console.error("Email send failed:", err && err.message ? err.message : err);
    return { success: false, error: err && err.message ? err.message : String(err) };
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
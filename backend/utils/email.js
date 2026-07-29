const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Test SMTP connection when server starts
transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection failed:", error.message);
  } else {
    console.log("SMTP server ready ✅");
  }
});


const sendEmail = async ({ 
  to, 
  subject, 
  html, 
  attachments = [] 
}) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
      attachments,
    });

    console.log(`Email sent: ${info.messageId}`);
    return info;

  } catch (err) {
    console.error("Email send failed:", err.message);
    return null;
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
Event ${
  status === "approved"
    ? "Approved ✅"
    : "Rejected ❌"
}
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
  ticketConfirmationTemplate,
  eventStatusTemplate,
  verificationEmailTemplate,
};
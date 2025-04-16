const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email transporter verification failed:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

const sendIncidentEmail = async (
  parentEmail,
  childName,
  incidentType,
  description,
  parentName
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: parentEmail,
    subject: `Incident Report for ${childName}`,
    html: `
      <h2>Incident Report</h2>
      <p>Dear ${parentName},</p>
      <p>We are writing to inform you about an incident involving your child:</p>
      <p><strong>Child:</strong> ${childName}</p>
      <p><strong>Incident Type:</strong> ${incidentType}</p>
      <p><strong>Description:</strong> ${description}</p>
      <br>
      <p>If you have any concerns or questions, please contact us at ${process.env.EMAIL_USER}.</p>

    `,
  };

  try {
    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
    });

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
    return true;
  } catch (error) {
    console.error("Detailed email error:", {
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorCommand: error.command,
      errorResponse: error.response,
      stack: error.stack,
    });
    throw error;
  }
};

module.exports = {
  sendIncidentEmail,
};

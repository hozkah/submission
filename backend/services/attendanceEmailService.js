const nodemailer = require("nodemailer");
require("dotenv").config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendAttendanceEmail = async (
  parentEmail,
  childName,
  status,
  parentName
) => {
  const emailSubject = `Child ${status} Notification`;
  const emailHtml = `
    <h2>Child ${status} Notification</h2>
    <p>Dear ${parentName},</p>
    <p>This is to inform you that your child ${childName} has ${
    status === "check-in" ? "checked in" : "checked out"
  } at ${new Date().toLocaleString()}.</p>
    <p>If you have any questions, please contact us.</p>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: parentEmail,
    subject: emailSubject,
    html: emailHtml,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Attendance email sending failed:", error.message);
    throw error;
  }
};

module.exports = {
  sendAttendanceEmail,
};

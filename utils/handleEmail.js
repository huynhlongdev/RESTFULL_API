const nodemailer = require("nodemailer");

exports.handleEmail = async (action, email, link) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: "no-reply@yourdomain.com",
      to: email,
      subject: "",
      text: "",
    };

    if (action == "reset") {
      mailOptions.subject = `Password Reset Request`;
      mailOptions.text = `You are receiving this email because you (or someone else) has requested a password reset. Please click on the link below to reset your password: \n\n ${link}`;
    }

    await transporter.sendMail(mailOptions);

    return {
      message: "Email sent successfully",
      success: true,
    };
  } catch (error) {
    return {
      message: "Failed to send email",
      error: error.message,
      success: false,
    };
  }
};

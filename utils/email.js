const sgMail = require('@sendgrid/mail');

const sendEmail = async verificationCode => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: 'someuser@gmail.com',
    from: 'developer@gamil.com',
    subject: 'aasdsad',
    text: `Your 4 digit code to recover tour account is ${verificationCode}`
  };
  await sgMail.send(msg);
};

module.exports = sendEmail;

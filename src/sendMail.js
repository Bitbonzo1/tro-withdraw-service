const sgMail = require('@sendgrid/mail');

const sendMail = async(subject, data) => {
    sgMail.setApiKey('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');
    
    const msg = {
        from: 'sudeep@trodl.com',
        to: 'sudeep.dev.block@gmail.com', 
        subject: `${subject}`,
        html: `<div><p><strong>${data.status}</strong></p><p>${data.message}</p></div>`,
    }
    
    await sgMail.send(msg);
}

module.exports = sendMail;
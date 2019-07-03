const emailConfig = require('../config/email');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const util = require('util');

let transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

transport.use(
    'compile',
    hbs({
        viewEngine: {
            extName: 'handlebars',
            partialsDir: __dirname + '/../views/emails',
            layoutsDir: __dirname + '/../views/emails',
            defaultLayout: 'reset.handlebars'
        },
        viewPath: __dirname + '/../views/emails',
        extName: '.handlebars'
    })
);

exports.send = async(options) => {
    const emailOptions = {
        from: 'devJobs noreply@devJobs.com',
        to: options.user.email,
        subject: options.subject,
        template: options.template,
        context: {
            resetUrl: options.resetUrl
        }
    };
    const sendMail = util.promisify(transport.sendMail, transport);
    return sendMail.call(transport, emailOptions);
}
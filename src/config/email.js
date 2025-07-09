/*
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
        process.env.G_CLIENT_ID,
        process.env.G_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
        refresh_token: process.env.G_REFRESH_TOKEN,
    });

    const { token } = await oauth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.G_SENDER_EMAIL,
            accessToken: token,
            clientId: process.env.G_CLIENT_ID,
            clientSecret: process.env.G_CLIENT_SECRET,
            refreshToken: process.env.G_REFRESH_TOKEN,
        },
    });

    return transporter;
};

module.exports = createTransporter;
*/

const nodemailer = require('nodemailer');

/**
 * @function createTransporter
 * @summary Configura e cria uma instância do Nodemailer para envio de e-mails via SMTP.
 * @description Utiliza as credenciais SMTP da Hostinger para criar um "transportador"
 * reutilizável, responsável por despachar os e-mails transacionais da aplicação.
 * A senha é obtida de forma segura a partir das variáveis de ambiente.
*/
async function createTransporter() {
    
    const smtpUser = 'contact@stksystem.shop';
    const smtpPass = process.env.HOSTINGER_EMAIL_PASSWORD;

    if (!smtpPass) {
        throw new Error('HOSTINGER_EMAIL_PASSWORD não está definido.');
    }

    const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true, // Usa SSL/TLS.
        auth: {
            user: smtpUser,
            pass: smtpPass,
        },
    });

    return transporter;
}

module.exports = createTransporter;
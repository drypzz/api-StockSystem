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
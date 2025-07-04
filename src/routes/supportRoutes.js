const express = require('express');
const router = express.Router();

const { User } = require('../models');

const createTransporter = require('../config/email');

router.post('/support/contact', async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });

        const userStatusInfo = existingUser
            ? `<span style="color: #22c55e; font-weight: bold;">✔ Registrado</span> (ID: ${existingUser.id})`
            : `<span style="color: #ef4444; font-weight: bold;">✖ Não Registrado</span>`;

        const emailTransporter = await createTransporter();

        const mailOptions = {
            from: `"STK | Suporte" <contact@stksystem.shop>`,
            to: 'contact@stksystem.shop',
            subject: `📩 Novo Contato de Suporte - ${name} ${existingUser ? '(Cliente)' : '(Visitante)'}`,
            html: `
                <!DOCTYPE html>
                <html lang="pt-br">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
                    <title>Nova Mensagem de Suporte</title>
                </head>
                <body style="margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #0f172a; padding: 40px 0;">
                        <tr>
                            <td align="center">
                                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #1e293b; border: 1px solid #334155;">
                                    <tr>
                                        <td style="background-color: #0f172a; padding: 24px; text-align: center; border-bottom: 1px solid #334155;">
                                            <img src="https://api.stksystem.shop/assets/transparent.png" alt="STK System" width="120" style="display: block;">
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 32px; color: #cbd5e1;">
                                            <h1 style="font-size: 24px; font-weight: 700; color: #f1f5f9; margin: 0 0 24px;">📬 Nova Mensagem de Suporte</h1>
                                            <p style="font-size: 16px; margin: 0 0 8px;"><strong>Nome:</strong> ${name}</p>
                                            <p style="font-size: 16px; margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
                                            <p style="font-size: 16px; margin: 16px 0 8px;"><strong>Status do Usuário:</strong> ${userStatusInfo}</p>
                                            <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;">
                                            <p style="font-size: 16px; margin: 0 0 8px;"><strong>Mensagem:</strong></p>
                                            <p style="font-size: 16px; margin: 8px 0 0; white-space: pre-line; line-height: 1.6;">${message.replace(/\n/g, '<br>')}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="background-color: #0f172a; border-top: 1px solid #334155; padding: 24px; text-align: center; font-size: 12px; color: #94a3b8;">
                                            <p style="margin: 0;">Responda diretamente por este canal.</p>
                                            <p style="margin: 8px 0 0;">STK &copy; ${new Date().getFullYear()} Todos os direitos reservados.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
            `,
        };

        await emailTransporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('[Support Route] Erro ao processar contato:', error);
        res.status(500).json({ message: 'Erro interno ao processar a solicitação.' });
    }
});

module.exports = router;
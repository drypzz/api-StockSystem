const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const components = require('./swaggerComponents'); 
const packageJson = require('../../package.json');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'StockSystem API',
      version: packageJson.version,
      description: `
        API RESTful para um sistema de e-commerce completo, com gestão de usuários, produtos, categorias, pedidos e integração de pagamento via PIX (Mercado Pago).
        A arquitetura é cloud-native, implantada no **Google App Engine** e utiliza o **Google Secret Manager** para o gerenciamento de credenciais.

        **Funcionalidades:**
        - Autenticação JWT
        - CRUD completo para todas as entidades
        - Fluxo de pagamento com QR Code
        - Notificações de Webhook
        - Envio de e-mails transacionais
      `,
      contact: {
        name: 'drypzz',
        url: 'https://drypzz.netlify.app',
      },
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'https://api.stksystem.shop',
        description: 'Servidor de Produção (Google App Engine)',
      },
    ],
    components: components,
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
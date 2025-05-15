const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const schemas = require('../components/schemas');
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API RESTful com Node.js, Express e Sequelize',
      version: '1.0.0',
      description: `
      Esta API foi desenvolvida para fins de estudo e prática de boas práticas com Node.js, Express, Sequelize e autenticação JWT.  
      Ela cobre os principais conceitos de um sistema CRUD completo, incluindo:

      - Autenticação de usuários (JWT)
      - Gerenciamento de usuários, produtos, categorias e pedidos
      - Documentação interativa com Swagger

      > ⚙️ Tecnologias: Node.js, Express, Sequelize, MySQL, JWT, Swagger.
      `,
      contact: {
        name: 'Drypzz',
        url: 'https://drypzz.netlify.app'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local de desenvolvimento'
      }
    ],
    components: {
      schemas,
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      { bearerAuth: [] }
    ],
  },
  apis: ['./src/routes/*.js'], // Caminho para os comentários JSDoc nas rotas
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec };
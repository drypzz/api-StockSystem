/**
 * @summary Centraliza todos os componentes reutilizáveis da especificação OpenAPI.
 * @description Este objeto define schemas de dados, respostas padronizadas, parâmetros
 * e esquemas de segurança, promovendo a consistência e a manutenibilidade da
 * documentação da API.
*/
const components = {
  // 'schemas' define os modelos de dados para requests e responses.
  schemas: {
    User: {
      type: 'object',
      required: ['id', 'name', 'email'],
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'João da Silva' },
        email: { type: 'string', format: 'email', example: 'joao@exemplo.com' },
      },
    },

    NewUser: {
      type: 'object',
      required: ['name', 'email', 'password'],
      properties: {
        name: { type: 'string', example: 'João da Silva' },
        email: { type: 'string', format: 'email', example: 'joao@exemplo.com' },
        password: { type: 'string', example: 'senhaForte123' },
      },
    },

    Category: {
      type: 'object',
      required: ['id', 'name'],
      properties: {
        id: { type: 'integer', example: 1 },
        name: { type: 'string', example: 'Eletrônicos' },
      },
    },

    Product: {
      type: 'object',
      required: ['id', 'name', 'description', 'price', 'quantity', 'categoryId'],
      properties: {
        id: { type: 'integer', example: 101 },
        name: { type: 'string', example: 'Smartphone X Pro' },
        description: { type: 'string', example: 'O smartphone mais moderno do mercado.' },
        price: { type: 'number', format: 'double', example: 3999.90 },
        quantity: { type: 'integer', example: 50 },
        categoryId: { type: 'integer', example: 1 },
      },
    },

    Order: {
      type: 'object',
      required: ['id', 'publicId', 'userId', 'paymentStatus', 'confirmationEmailSent', 'createdAt', 'updatedAt'],
      properties: {
        id: { type: 'integer', example: 76 },
        publicId: { type: 'string', format: 'uuid', example: 'c3a10791-1c57-41df-9628-0c2263d323af' },
        userId: { type: 'integer', example: 1 },
        paymentStatus: { type: 'string', example: 'approved' },
        confirmationEmailSent: { type: 'boolean', example: true },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    },

    OrderDetail: {
      allOf: [
        { $ref: '#/components/schemas/Order' },
        {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            products: {
              type: 'array',
              items: {
                allOf: [
                  { $ref: '#/components/schemas/Product' },
                  {
                    type: 'object',
                    properties: {
                      order_products: {
                        type: 'object',
                        properties: {
                          quantity: { type: 'integer', example: 2 },
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    },

    LoginRequest: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', example: 'joao@exemplo.com' },
        password: { type: 'string', example: 'senha123' },
      },
    },

    TokenResponse: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
      },
    },

    NewOrderRequest: {
      type: 'object',
      required: ['items'],
      properties: {
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['productId', 'quantity'],
            properties: {
              productId: { type: 'integer', example: 1 },
              quantity: { type: 'integer', example: 2 },
            },
          },
        },
      },
      example: {
        items: [
          { productId: 1, quantity: 2 },
          { productId: 3, quantity: 1 },
        ],
      },
    },

    PaymentResponse: {
      type: 'object',
      required: ['publicOrderId', 'paymentId', 'qrCode', 'qrCodeBase64', 'expiresAt', 'amount'],
      properties: {
        publicOrderId: { type: 'string', format: 'uuid', example: 'c3a10791-1c57-41df-9628-0c2263d323af' },
        paymentId: { type: 'string', example: '9876543210' },
        qrCode: { type: 'string', description: 'O código PIX (copia e cola)', example: '000201263...' },
        qrCodeBase64: {
          type: 'string',
          format: 'byte',
          description: 'A imagem do QR Code em Base64',
          example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...',
        },
        expiresAt: { type: 'string', format: 'date-time', example: '2024-06-30T12:34:56Z' },
        amount: { type: 'number', format: 'double', example: 3999.90 },
      },
    },

    Error: {
      type: 'object',
      required: ['message'],
      properties: {
        message: { type: 'string', example: 'Recurso não encontrado' },
        code: { type: 'integer', example: 404 },
      },
    },
  },

  // 'responses' define respostas HTTP padronizadas para reutilização.
  responses: {
    Unauthorized: {
      description: 'Não autorizado (token ausente ou inválido)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    NotFound: {
      description: 'Recurso não encontrado',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    BadRequest: {
      description: 'Requisição inválida (dados ausentes ou incorretos)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    Conflict: {
      description: 'Conflito de dados (recurso já existe)',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
    ServerError: {
      description: 'Erro interno do servidor',
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/Error' },
        },
      },
    },
  },

  // 'parameters' define parâmetros de requisição comuns.
  parameters: {
    idParam: {
      in: 'path',
      name: 'id',
      required: true,
      schema: { type: 'integer' },
      description: 'ID numérico do recurso',
    },
    publicIdParam: {
      in: 'path',
      name: 'publicId',
      required: true,
      schema: { type: 'string', format: 'uuid' },
      description: 'ID público (UUID) do recurso',
    },
  },

  // 'securitySchemes' define os métodos de autenticação da API.
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
};

module.exports = components;

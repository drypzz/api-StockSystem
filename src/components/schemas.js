const schemas = {

  // Schemas para a documentação Swagger
  
  User: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "John Doe" },
      email: { type: "string", example: "john@example.com" },
      password: { type: "string", example: "hashed_password" },
    },
    required: ["name", "email", "password"],
  },

  Category: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "Eletrônicos" },
    },
    required: ["name"],
  },

  Product: {
    type: "object",
    properties: {
      id: { type: "integer", example: 10 },
      name: { type: "string", example: "Smartphone" },
      description: { type: "string", example: "Descrição do produto" },
      price: { type: "number", format: "float", example: 1299.99 },
      categoryId: { type: "integer", example: 2 },
    },
    required: ["name", "description", "price", "categoryId"],
  },

  OrderProduct: {
    type: "object",
    properties: {
      orderId: { type: "integer", example: 5 },
      productId: { type: "integer", example: 10 },
      quantity: { type: "integer", example: 3 },
    },
    required: ["quantity", "productId"],
  },

  Order: {
    type: "object",
    properties: {
      id: { type: "integer", example: 7 },
      userId: { type: "integer", example: 1 },
    },
    required: ["userId"],
  },
};

module.exports = schemas;

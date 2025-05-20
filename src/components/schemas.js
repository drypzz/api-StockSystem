const schemas = {
  // Schemas para a documentação Swagger

  User: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "John Doe" },
      email: { type: "string", example: "john@example.com" },
      password: { type: "string", example: "hashed_password" },
      _links: {
        type: "object",
        properties: {
          self: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/user/1" },
              method: { type: "string", example: "GET" }
            }
          },
          update: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/user/1" },
              method: { type: "string", example: "PUT" }
            }
          },
          delete: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/user/1" },
              method: { type: "string", example: "DELETE" }
            }
          }
        }
      }
    },
    required: ["name", "email", "password"]
  },

  Category: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      name: { type: "string", example: "Eletrônicos" },
      _links: {
        type: "object",
        properties: {
          self: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/category/1" },
              method: { type: "string", example: "GET" }
            }
          },
          update: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/category/1" },
              method: { type: "string", example: "PUT" }
            }
          },
          delete: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/category/1" },
              method: { type: "string", example: "DELETE" }
            }
          }
        }
      }
    },
    required: ["name"]
  },

  Product: {
    type: "object",
    properties: {
      id: { type: "integer", example: 10 },
      name: { type: "string", example: "Smartphone" },
      description: { type: "string", example: "Descrição do produto" },
      price: { type: "number", format: "float", example: 1299.99 },
      quantity: { type: "integer", example: 50 },
      categoryId: { type: "integer", example: 2 },
      _links: {
        type: "object",
        properties: {
          self: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/product/10" },
              method: { type: "string", example: "GET" }
            }
          },
          update: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/product/10" },
              method: { type: "string", example: "PUT" }
            }
          },
          delete: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/product/10" },
              method: { type: "string", example: "DELETE" }
            }
          }
        }
      }
    },
    required: ["name", "description", "price", "categoryId"]
  },

  OrderProduct: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      orderId: { type: "integer", example: 5 },
      productId: { type: "integer", example: 10 },
      quantity: { type: "integer", example: 3 },
    },
    required: ["quantity", "productId"]
  },

  Order: {
    type: "object",
    properties: {
      id: { type: "integer", example: 7 },
      userId: { type: "integer", example: 1 },
      _links: {
        type: "object",
        properties: {
          self: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/order/7" },
              method: { type: "string", example: "GET" }
            }
          },
          delete: {
            type: "object",
            properties: {
              href: { type: "string", example: "/api/v1/order/7" },
              method: { type: "string", example: "DELETE" }
            }
          }
        }
      }
    },
    required: ["userId"]
  }
};

module.exports = schemas;

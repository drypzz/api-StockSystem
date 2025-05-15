# 📦 StockSystem API

> API RESTful para gerenciamento de usuários, categorias, produtos e pedidos.  
Desenvolvida com Node.js, Express, Sequelize ORM e MySQL.

[![Status](https://img.shields.io/badge/status-completo-green.svg)]()

---

## 🚀 Tecnologias Utilizadas

- ✅ [Node.js](https://nodejs.org/)
- ✅ [Express](https://expressjs.com/)
- ✅ [Sequelize](https://sequelize.org/)
- ✅ [MySQL](https://www.mysql.com/)
- ✅ [JWT](https://jwt.io/)
- ✅ [Swagger](https://swagger.io/)

---

## 📁 Estrutura do Projeto

```bash
src/
├── config/              # Configurações do Sequelize, banco e Swagger
├── controllers/         # Lógica de negócios das rotas
├── middlewares/         # Validações, autenticação, etc.
├── models/              # Modelos Sequelize
├── routes/              # Endpoints da API organizados por domínio
├── components/          # Esquemas reutilizáveis do Swagger
├── server.js            # Ponto de entrada da aplicação
├── .env                 # Variáveis de ambiente
└── README.md            # Este arquivo
```

---

## 🔐 Autenticação

A autenticação é feita via **JWT Bearer Token**.  
Você pode testar via Swagger em `/api/v1/docs`.

---

## 📄 Documentação

A documentação da API está disponível via Swagger em:  
**[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)**

Inclui:

- 🔑 Autenticação (Login, Registro)
- 👤 Usuários
- 🛒 Pedidos
- 📦 Produtos
- 🗂️ Categorias

---

## ✅ Como rodar o projeto localmente

1. Clone o repositório:
   ```bash
   git clone https://github.com/drypzz/api-StockSystem.git
   cd api-StockSystem
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure seu `.env`:
   ```env
   API_PORT=3000
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=stocksystem
   DB_HOST=localhost
   JWT_SECRET=drypzz
   ```

4. Rode o servidor:
   ```bash
   npm start
   ```

---

## 👨‍💻 Desenvolvedor

| Nome     | Website                   |
|----------|---------------------------|
| Drypzz   | [drypzz.dev](https://drypzz.netlify.app) |

---

> by drypzz
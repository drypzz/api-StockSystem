# 🛒 StockSystem - API

> API RESTful para um sistema de e-commerce completo, com gestão de usuários, produtos, categorias, pedidos e integração de pagamento ponta-a-ponta com PIX via Mercado Pago.

<p align="center">
  <a href="https://stksystem.vercel.app" target="_blank">
    <img alt="Deploy na Vercel" src="https://img.shields.io/badge/Ver%20Demo-stksystem.vercel.app-%23000000?style=for-the-badge&logo=vercel">
  </a>
</p>

[![Status](https://img.shields.io/badge/status-ativo-brightgreen.svg?style=for-the-badge)]()
[![Node.js](https://img.shields.io/badge/Node.js-24.x-339933?style=for-the-badge&logo=node.js)]()
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express)]()
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?style=for-the-badge&logo=sequelize)]()

---

## 🎯 Sobre a API

A **API StockSystem** é o cérebro por trás da aplicação de mesmo nome. Desenvolvida em **Node.js** com **Express** e **Sequelize**, ela oferece um conjunto completo de endpoints RESTful para gerenciar todos os aspectos de um sistema de e-commerce.

Além do CRUD tradicional para usuários, produtos e categorias, o grande diferencial desta API é a sua robusta implementação do fluxo de pagamento:

* **Integração com Mercado Pago:** Orquestra a criação de cobranças PIX de forma segura.
* **Geração de QR Code:** Utiliza bibliotecas no backend para criar um QR Code personalizado, melhorando a identidade visual e a experiência do usuário na hora do pagamento.
* **Webhooks:** Processa notificações do Mercado Pago para atualizar o status dos pedidos em tempo real (ex: de "pendente" para "aprovado").

A infraestrutura de banco de dados é provida pelo **Supabase**, utilizando **PostgreSQL**.

---

## ✨ Funcionalidades Principais

* **👤 Autenticação e Usuários:**
    * Registro e Login com senhas criptografadas (bcrypt).
    * Autenticação de rotas via JWT (JSON Web Tokens).
    * Operações de CRUD para usuários, com regras de negócio.

* **🗃️ Gestão de Produtos e Categorias:**
    * CRUD completo para Categorias.
    * CRUD completo para Produtos, com associação a categorias.

* **🛒 Pedidos e Pagamentos:**
    * Criação de pedidos a partir de um carrinho de itens, com validação de estoque.
    * Listagem de pedidos por usuário, com tratamento inteligente para o caso de produtos do histórico terem sido deletados.
    * Cancelamento de pedidos, com a lógica de restauração de estoque e cancelamento da cobrança no gateway.
    * Endpoint para iniciar o processo de pagamento, que se comunica com o Mercado Pago.
    * Endpoint de Webhook para receber e processar as atualizações de status do pagamento.

---

## 🛠️ Tecnologias Utilizadas

* **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript no servidor.
* **[Express.js](https://expressjs.com/)**: Framework para construção da API e gerenciamento de rotas.
* **[Sequelize](https://sequelize.org/)**: ORM para modelagem e interação com o banco de dados PostgreSQL.
* **[Supabase](https://supabase.io/)**: Provedor de infraestrutura para o banco de dados **PostgreSQL**.
* **[Mercado Pago SDK](https://www.mercadopago.com.br/developers)**: Para integração com o gateway de pagamento.
* **[JWT (jsonwebtoken)](https://jwt.io/)**: Para geração e validação de tokens de autenticação.
* **[Bcrypt.js](https://www.npmjs.com/package/bcrypt)**: Para criptografia de senhas.
* **[qrcode](https://www.npmjs.com/package/qrcode) & [sharp](https://sharp.pixelplumbing.com/)**: Para geração e manipulação de imagem do QR Code no backend.
* **[Swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)**: Para documentação interativa da API.

---

## 🌱 Como Começar

Para executar a API localmente, siga os passos abaixo.

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) e [npm](https://www.npmjs.com/) instalados.
* Uma conta no [Supabase](https://supabase.io/) com um projeto criado para obter a string de conexão do banco.
* Uma conta de desenvolvedor no [Mercado Pago](https://www.mercadopago.com.br/developers) para obter o `ACCESS_TOKEN`.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone git@github.com:drypzz/api-StockSystem.git
    cd api-StockSystem
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto e preencha com suas credenciais:
    ```env
    # Porta da API
    API_PORT=3001

    # String de conexão do seu banco de dados PostgreSQL no Supabase
    DATABASE_URL=postgresql://postgres:[SUA_SENHA]@[ID_DO_PROJETO].db.supabase.co:5432/postgres

    # Token de acesso do Mercado Pago (encontrado nas suas credenciais)
    MERCADO_PAGO_ACCESS_TOKEN=APP_USR-SEU-TOKEN-AQUI

    # Segredo para gerar os tokens JWT (pode ser qualquer string segura)
    JWT_SECRET=SEU_SEGREDO_SUPER_SECRETO

    # URL base do backend (usada em algumas integrações como a de notificação do MP)
    BACKEND_URL=https://SUA_URL_DO_BACK_END
    ```
    > **Importante:** Substitua os valores de exemplo pelas suas credenciais reais.

4.  **Rode o servidor:**
    ```bash
    npm start
    ```
    A API estará em execução na porta `3001`.

---

## 📄 Documentação da API

A documentação interativa da API, gerada com Swagger, está disponível no endpoint `/api/v1/docs` enquanto o servidor estiver rodando.

**URL Local:** **[http://localhost:3001/api/v1/docs](http://localhost:3001/api/v1/docs)**

Lá, você pode testar todos os endpoints, incluindo o fluxo de autenticação.

---

## 📁 Estrutura do Projeto

```
src/
├── config/         # Configurações do Sequelize e do Swagger
├── controllers/    # Lógica de negócios das rotas
├── errors/         # Classes de erros customizados
├── middlewares/    # Autenticação, validações, etc.
├── models/         # Modelos e associações do Sequelize
├── routes/         # Definição dos endpoints da API
├── utils/          # Funções utilitárias
└── server.js       # Ponto de entrada da aplicação
```

> by drypzz

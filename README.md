# 🛒 StockSystem - API

> API RESTful para um sistema de e-commerce completo, desenvolvida com uma arquitetura cloud-native em Node.js e implantada no Google App Engine.

<div align="center">
  <a href="https://www.stksystem.shop" target="_blank">
    <img alt="Ver Frontend" src="https://img.shields.io/badge/Build%20-stksystem-%23000000?style=for-the-badge&logo=vercel">
  </a>
</div>

---

[![Status](https://img.shields.io/badge/status-ativo-brightgreen.svg?style=for-the-badge)]()
[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=node.js)]()
[![Express.js](https://img.shields.io/badge/Express.js-5.x-000000?style=for-the-badge&logo=express)]()
[![Sequelize](https://img.shields.io/badge/Sequelize-6.x-52B0E7?style=for-the-badge&logo=sequelize)]()
[![Documentação](https://img.shields.io/badge/Documentação-API-blueviolet?style=for-the-badge&logo=swagger)](https://api.stksystem.shop/api/v1/docs)

---

## 🎯 Sobre a API

A **API StockSystem** é o cérebro por trás da aplicação de e-commerce de mesmo nome. Desenvolvida em **Node.js** com **Express** e **Sequelize**, ela oferece um conjunto completo de endpoints RESTful para gerenciar todos os aspectos de um sistema de vendas online, desde a autenticação de usuários até a confirmação de pagamentos.

A arquitetura foi projetada para ser robusta e escalável, rodando em um ambiente serverless no **Google App Engine** e utilizando o **Google Secret Manager** para o gerenciamento seguro de credenciais, eliminando a necessidade de arquivos `.env` em produção.

## ✨ Funcionalidades Principais

* **👤 Autenticação e Usuários:**
    * Registro e Login com senhas criptografadas (bcrypt).
    * Autenticação de rotas via JWT (JSON Web Tokens).
    * Operações de CRUD para usuários.

* **🗃️ Gestão de Produtos e Categorias:**
    * CRUD completo para Categorias e Produtos, com associações e controle de estoque.

* **🛒 Pedidos e Pagamentos (Ponta-a-Ponta):**
    * Criação de pedidos com validação de estoque.
    * Listagem de pedidos por usuário.
    * Integração com o **Mercado Pago** para criação de cobranças PIX.
    * Geração de QR Code no backend com logo da marca para uma melhor experiência de pagamento.
    * Processamento de **Webhooks** para atualização de status dos pedidos em tempo real (ex: de `pending` para `approved`).
    * Cancelamento de pedidos expirados com restauração de estoque, via **jobs agendados (cron)**.

* **📧 Notificações por E-mail:**
    * Envio de e-mail de confirmação de pagamento para o cliente utilizando **Nodemailer** e a **API do Gmail (OAuth2)**.
    * Lógica de idempotência com transações e bloqueio no banco de dados para garantir o envio de apenas um e-mail por pedido.

---

## 🛠️ Arquitetura e Stack de Tecnologias

### Backend
* **[Node.js](https://nodejs.org/)**: Ambiente de execução JavaScript.
* **[Express.js](https://expressjs.com/)**: Framework para construção da API e gerenciamento de rotas.
* **[Sequelize](https://sequelize.org/)**: ORM para interação com o banco de dados PostgreSQL.
* **[Mercado Pago SDK](https://www.mercadopago.com.br/developers)**: Integração com o gateway de pagamento.
* **[JWT (jsonwebtoken)](https://jwt.io/)**: Geração e validação de tokens de autenticação.
* **[Bcrypt.js](https://www.npmjs.com/package/bcrypt)**: Criptografia de senhas.
* **[Nodemailer](https://nodemailer.com/)**: Envio de e-mails transacionais.
* **[qrcode](https://www.npmjs.com/package/qrcode) & [sharp](https://sharp.pixelplumbing.com/)**: Geração e manipulação de imagem do QR Code.
* **[node-cron](https://www.npmjs.com/package/node-cron)**: Agendamento de tarefas (jobs).
* **[Swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express)**: Documentação interativa da API.

### Infraestrutura e Deploy
* **[Google App Engine](https://cloud.google.com/appengine)**: Plataforma serverless para deploy e hosting da aplicação.
* **[Google Secret Manager](https://cloud.google.com/secret-manager)**: Gerenciamento centralizado e seguro das credenciais de produção.
* **[Google Cloud Logging](https://cloud.google.com/logging)**: Monitoramento e depuração de logs da aplicação.
* **[Supabase](https://supabase.io/)**: Provedor de infraestrutura para o banco de dados **PostgreSQL**.

---

## ☁️ Configuração e Deploy

Esta API foi projetada para ser implantada no Google App Engine e não é destinada à execução local, devido à sua profunda integração com serviços em nuvem.

### 1. Configuração de Segredos
A aplicação não utiliza arquivos `.env` em produção. Em vez disso, ela carrega as seguintes variáveis do **Google Secret Manager**. Para replicar o ambiente, você precisaria criar estes segredos:

* `DATABASE_URL`: String de conexão do banco PostgreSQL (Supabase).
* `JWT_SECRET`: Segredo para assinar os tokens JWT.
* `MERCADO_PAGO_ACCESS_TOKEN`: Token de acesso de produção do Mercado Pago.
* `BACKEND_URL`: URL pública da aplicação no App Engine.
* `G_CLIENT_ID`: Client ID do seu projeto Google Cloud para a API do Gmail.
* `G_CLIENT_SECRET`: Client Secret do seu projeto Google Cloud.
* `G_REFRESH_TOKEN`: Refresh Token do OAuth2 para autorizar o envio de e-mails.
* `G_SENDER_EMAIL`: E-mail do Gmail usado para enviar as notificações.

### 2. Serviços Externos
Para o funcionamento completo, é necessário configurar contas e obter credenciais dos seguintes serviços:
* **Google Cloud Platform:** Um projeto com App Engine, Secret Manager e a API do Gmail ativados.
* **Supabase:** Um projeto para o banco de dados PostgreSQL.
* **Mercado Pago:** Uma conta de desenvolvedor com uma aplicação criada para obter as credenciais de pagamento.

### 3. Implantação (Deploy)
O deploy é feito através do Google Cloud CLI. O arquivo `app.yaml` na raiz do projeto contém as configurações para o App Engine, incluindo a definição dos handlers de arquivos estáticos.

```bash
# Comando de exemplo para fazer o deploy
gcloud app deploy
```

---

## 📄 Documentação da API

A documentação interativa da API, gerada com Swagger, está disponível no endpoint `/api/v1/docs` da aplicação em produção.

**URL de Produção:** **[https://api.stksystem.shop/api/v1/docs](https://api.stksystem.shop/api/v1/docs)**

Lá, é possível visualizar e testar todos os endpoints.

---

## 📁 Estrutura do Projeto

```
src/
├── config/         # Configurações do Sequelize, Swagger, etc.
├── controllers/    # Lógica de negócios das rotas
├── errors/         # Classes de erros customizados
├── jobs/           # Tarefas agendadas (cron jobs)
├── middlewares/    # Autenticação, validações, etc.
├── models/         # Modelos e associações do Sequelize
├── routes/         # Definição dos endpoints da API
├── services/       # Lógica de serviços desacoplados (ex: envio de e-mail)
└── server.js       # Ponto de entrada da aplicação
```

> by drypzz

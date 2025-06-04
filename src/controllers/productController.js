const { Product, Category } = require("../models");
const { generateLinks } = require("../utils/hateoas");

const NotFound = require("../errors/not-found");
const MissingValues = require("../errors/missing-values");
const Unauthorized = require("../errors/unauthorized");

class ProductController {
    
    static async getAll(req, res) {
        const product = await Product.findAll();

        const response = product.map(product => ({
            ...product.toJSON(),
            _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
        }));

        res.status(200).json({
            count: response.length,
            products: response,
            _links: generateLinks("product", null, ["GET", "POST"])
        });
    };

    static async getByID(req, res) {
        const id = Number(req.params.id);
        
        // Verificar se o produto existe
        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFound("Produto não encontrado")
        };

        res.status(200).json({
            ...product.toJSON(),
            _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
        });
    };

    static async create(req, res) {
        const { name, price, quantity, description, categoryId } = req.body;

        // Verificar se os campos obrigatórios estão presentes
        if (!name || !price || !quantity || !description || !categoryId) {
            throw new MissingValues({ name, price, quantity, description, categoryId })
        };

        // Verificar se o preço e a quantidade são números positivos
        if (price < 0 || quantity < 0) {
            throw new Unauthorized("Preço e quantidade devem ser maiores que zero")
        };

        // Verificar se a categoria existe
        const findCategoryId = await Category.findOne({ where: { id: categoryId } });
        if (!findCategoryId) {
            throw new NotFound("Categoria não encontrado")
        };

        // Cria o produto
        const newProduct = await Product.create({ name, description, price, quantity, categoryId });

        return res.status(201).json({
            message: "Produto criado com sucesso",
            newProduct: {
                ...newProduct.toJSON(),
                _links: generateLinks("product", newProduct.id, ["GET", "PUT", "DELETE"])
            }
        });
    };

    static async update(req, res) {
        const id = Number(req.params.id);
        const { name, price, quantity, categoryId } = req.body;
        
        const product = await Product.findByPk(id);
        
        // Verificar se o produto existe
        if (!product) {
            throw new NotFound("Produto não encontrado")
        };

        // Atualiza os campos do produto
        if (name) product.name = name;
        if (price) product.price = price;
        if (quantity) product.quantity = quantity;

        // Atualiza e verifica se a categoria existe
        if (categoryId && categoryId !== product.categoryId) {
            const findCategoryId = await Product.findOne({ where: { categoryId } });
            if (!findCategoryId) {
                throw new NotFound("Categoria não encontrada")
            };
            product.categoryId = categoryId;
        };
        
        // Salva as alterações
        await product.save();

        return res.status(200).json({
            message: "Produto atualizado com sucesso",
            product: {
                ...product.toJSON(),
                _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
            }
        });
    };

    static async delete(req, res) {
        const id = Number(req.params.id);
        
        // Verifica se o produto existe
        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFound("Produto não encontrado")
        };
        
        // Deleta o produto
        await product.destroy();

        return res.json({
            message: "Produto deletado com sucesso",
            _links: generateLinks("product", null, ["GET", "POST"])
        });
    };
};

module.exports = ProductController;
const { Product, Category } = require("../models");
const { generateLinks } = require("../utils/hateoas");

const NotFound = require("../errors/not-found");
const MissingValues = require("../errors/missing-values");
const Conflict = require("../errors/conflict");

/**
 * @class ProductController
 * @summary Gerencia as operações de CRUD para Produtos.
*/
class ProductController {

    /**
     * @method getAll
     * @summary Lista todos os produtos com links HATEOAS.
    */
    static async getAll(req, res) {
        const products = await Product.findAll();

        const response = products.map(product => ({
            ...product.toJSON(),
            _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
        }));

        res.status(200).json({
            count: response.length,
            products: response,
            _links: generateLinks("product", null, ["GET", "POST"])
        });
    }

    /**
     * @method getByID
     * @summary Busca um único produto pelo ID.
    */
    static async getByID(req, res) {
        const id = Number(req.params.id);

        if (isNaN(id)){
            throw new Unauthorized("ID invalido")
        };

        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFound("Produto não encontrado");
        }

        res.status(200).json({
            ...product.toJSON(),
            _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
        });
    }

    /**
     * @method create
     * @summary Cria um novo produto, validando os dados e a existência da categoria.
    */
    static async create(req, res) {
        const { name, price, quantity, description, categoryId } = req.body;

        if (!name || price === undefined || quantity === undefined || !description || !categoryId) {
            throw new MissingValues({ name, price, quantity, description, categoryId });
        }

        if (price < 0 || quantity < 0) {
            throw new Conflict("Preço e quantidade devem ser maiores ou iguais a zero");
        }

        const category = await Category.findByPk(categoryId);
        if (!category) {
            throw new NotFound("Categoria não encontrada");
        }

        const newProduct = await Product.create({ name, description, price, quantity, categoryId });

        return res.status(201).json({
            message: "Produto criado com sucesso",
            newProduct: {
                ...newProduct.toJSON(),
                _links: generateLinks("product", newProduct.id, ["GET", "PUT", "DELETE"])
            }
        });
    }

    /**
     * @method update
     * @summary Atualiza os dados de um produto existente.
    */
    static async update(req, res) {
        const id = Number(req.params.id);
        const { name, price, description, quantity, categoryId } = req.body;

        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFound("Produto não encontrado");
        }

        if (price !== undefined && price < 0) {
            throw new Conflict("Preço não pode ser negativo");
        }

        if (quantity !== undefined && quantity < 0) {
            throw new Conflict("Quantidade não pode ser negativa");
        }

        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        if (quantity !== undefined) product.quantity = quantity;
        if (description) product.description = description;

        if (categoryId && categoryId !== product.categoryId) {
            const category = await Category.findByPk(categoryId);
            if (!category) {
                throw new NotFound("Categoria não encontrada");
            }
            product.categoryId = categoryId;
        }

        await product.save();

        return res.status(200).json({
            message: "Produto atualizado com sucesso",
            product: {
                ...product.toJSON(),
                _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
            }
        });
    }

    /**
     * @method delete
     * @summary Deleta um produto do banco de dados.
    */
    static async delete(req, res) {
        const id = Number(req.params.id);

        const product = await Product.findByPk(id);
        if (!product) {
            throw new NotFound("Produto não encontrado");
        }

        await product.destroy();

        return res.json({
            message: "Produto deletado com sucesso",
            _links: generateLinks("product", null, ["GET", "POST"])
        });
    }
}

module.exports = ProductController;

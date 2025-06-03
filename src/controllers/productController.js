const { Product, Category } = require("../models");
const { generateLinks } = require("../utils/hateoas");

class ProductController {
    
    static async getAll(req, res) {
        try {
            const product = await Product.findAll();

            const response = product.map(product => ({
                ...product.toJSON(),
                _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
            }));

            res.status(200).json({
                count: response.length,
                product: response,
                _links: generateLinks("product", null, ["GET", "POST"])
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar produtos", error: error.message });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);
            
            // Verificar se o produto existe
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: "Produto não encontrado" });
            };

            res.status(200).json({
                ...product.toJSON(),
                _links: generateLinks("product", product.id, ["GET", "PUT", "DELETE"])
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar o produto", error: error.message });
        };
    };

    static async create(req, res) {
        try {
            const { name, price, quantity, description, categoryId } = req.body;

            // Verificar se os campos obrigatórios estão presentes
            if (!name || !price || !quantity || !description || !categoryId) {
                return res.status(400).json({ message: "Todos os campos sao obrigatórios" });
            };

            // Verificar se o preço e a quantidade são números positivos
            if (price < 0 || quantity < 0) {
                return res.status(400).json({ message: "Preço e quantidade devem ser maiores que zero" });
            };

            // Verificar se a categoria existe
            const findCategoryId = await Category.findOne({ where: { id: categoryId } });
            if (!findCategoryId) {
                return res.status(400).json({ message: "Categoria não encontrada" });
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
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar o produto", error: error.message });
        };
    };

    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name, price, quantity, categoryId } = req.body;
            
            const product = await Product.findByPk(id);
            
            // Verificar se o produto existe
            if (!product) {
                return res.status(404).json({ message: "Produto não encontrado" });
            };

            // Atualiza os campos do produto
            if (name) product.name = name;
            if (price) product.price = price;
            if (quantity) product.quantity = quantity;

            // Atualiza e verifica se a categoria existe
            if (categoryId && categoryId !== product.categoryId) {
                const findCategoryId = await Product.findOne({ where: { categoryId } });
                if (!findCategoryId) {
                    return res.status(400).json({ message: "Categoria não encontrada" });
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
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar produto", error: error.message });
        };
    };

    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
            
            // Verifica se o produto existe
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: "Produto não encontrado" });
            };
            
            // Deleta o produto
            await product.destroy();
    
            return res.json({
                message: "Produto deletado com sucesso",
                _links: generateLinks("product", null, ["GET", "POST"])
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar produto", error: error.message });
        };
    };
};

module.exports = ProductController;
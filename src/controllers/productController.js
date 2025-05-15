const Product = require("../models/Product");
const Category = require("../models/Category");

class ProductController {
    
    static async getAll(req, res) {
        try {
            const products = await Product.findAll(); // Lista todos os produtos
            res.status(200).json({products});
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

            res.json(product);
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

            // Verificar se a categoria existe
            const findCategoryId = await Category.findOne({ where: { id: categoryId } });
            if (!findCategoryId) {
                return res.status(400).json({ message: "Categoria não encontrada" });
            };

            // Cria o produto
            const newProduct = await Product.create({ name, price, quantity, description, categoryId });

            res.status(201).json({ message: "Produto criado com sucesso", newProduct });
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
            if (name) Product.name = name;
            if (price) Product.price = price;
            if (quantity) Product.quantity = quantity;

            // Atualiza e verifica se a categoria existe
            if (categoryId && categoryId !== Product.categoryId) {
                const findCategoryId = await Product.findOne({ where: { categoryId } });
                if (!findCategoryId) {
                    return res.status(400).json({ message: "Categoria não encontrada" });
                };
                Product.categoryId = categoryId;
            };
            
            // Salva as alterações
            await Product.save();
    
            return res.status(200).json({ message: "Produto atualizado com sucesso", product });
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
            await Product.destroy();
    
            res.json({ message: "Produto deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar produto", error: error.message });
        };
    };
};

module.exports = ProductController;
const Product = require("../models/Product");
const Category = require("../models/Category");

class ProductController {
    
    static async getAll(req, res) {
        try {
            const products = await Product.findAll();
            res.status(200).json({products});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar produtos", error });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);
            const product = await Product.findByPk(id);

            if (!product) {
                return res.status(404).json({ message: "Produto não encontrado" });
            };

            res.json(product);
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar o produto", error });
        };
    };

    static async create(req, res) {
        try {
            const { name, price, quantity, categoryId } = req.body;

            if (!name || !price || !quantity || !categoryId) {
                return res.status(400).json({ message: "Todos os campos sao obrigatórios" });
            };

            const findCategoryId = await Category.findOne({ where: { categoryId } });
            if (!findCategoryId) {
                return res.status(400).json({ message: "Categoria não encontrada" });
            };

            const newProduct = await Product.create({ name, price, quantity, categoryId });

            res.status(201).json({ message: "Produto criado com sucesso", newProduct });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar o produto", error });
        };
    };

    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name, price, categoryId } = req.body;
    
            const product = await Product.findByPk(id);
    
            if (!product) {
                return res.status(404).json({ message: "Produto não encontrado" });
            };

            if (name) Product.name = name;
            if (price) Product.price = price;
            if (quantity) Product.quantity = quantity;

            if (categoryId && categoryId !== Product.categoryId) {
                const findCategoryId = await Product.findOne({ where: { categoryId } });
                if (!findCategoryId) {
                    return res.status(400).json({ message: "Categoria não encontrada" });
                };
                Product.categoryId = categoryId;
            };
    
            await Product.save();
    
            return res.status(200).json({ message: "Usuário atualizado com sucesso", product });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar usuário", error });
        };
    };

    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
    
            const product = await Product.findByPk(id);
            if (!product) {
                return res.status(404).json({ message: "Produto não encontrado" });
            };
    
            await Product.destroy();
    
            res.json({ message: "Produto deletado com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar usuário", error });
        };
    };
};

module.exports = ProductController;
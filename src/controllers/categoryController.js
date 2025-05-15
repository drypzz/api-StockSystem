const Category = require('../models/Category');
const Product = require('../models/Product');

class CategoryController {
    
    static async getAll(req, res) {
        try {
            const categorys = await Category.findAll(); // Lista todas as categorias
            res.status(200).json({categorys});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar categorias", error: error.message });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);

            // Verificar se a categoria existe
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Categoria não encontrada" });
            };

            res.json(category);
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar a categoria", error: error.message });
        };
    };

    static async create(req, res) {
        try {
            const { name } = req.body;

            // Verificar se os campos obrigatórios estão presentes
            if (!name) {
                return res.status(400).json({ message: "O campo 'nome' é obrigatório" });
            };

            // Verificar se a categoria já esta cadastrada
            const findExistingName = await Category.findOne({ where: { name } });
            if (findExistingName) {
                return res.status(400).json({ message: "Categoria ja registrada" });
            };

            // Cria a categoria
            const newCategory = await Category.create({ name });

            res.status(201).json({ message: "Categoria criada com sucesso", newCategory });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar a categoria", error: error.message });
        };
    };

    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name } = req.body;
            
            // Verificar se a categoria existe
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Categoria não encontrada" });
            };

            // Atualiza e Verifica se a categoria já esta cadastrada
            if (name && name !== Category.name) {
                const findCategoryId = await Category.findOne({ where: { name } });
                if (findCategoryId) {
                    return res.status(400).json({ message: "Categoria ja registrada" });
                };
                Category.name = name;
            };
            
            // Atualiza os campos da categoria
            await Category.save();
    
            return res.status(200).json({ message: "Categoria atualizada com sucesso", category });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar a categoria", error: error.message });
        };
    };

    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
    
            // Verifica se a categoria existe
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Categoria não encontrada" });
            };
            
            // Verifica se existem produtos vinculados a categoria
            const product = await Product.findAll({ where: { categoryId: id } });
            
            // Se existirem produtos vinculados, não é possível deletar a categoria
            if (product.length > 0) {
                return res.status(400).json({ message: "Não é possível deletar a categoria, pois existem produtos vinculados a ela" });
            };
    
            // Deleta a categoria
            await Category.destroy();

            res.json({ message: "Categoria deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar a categoria", error: error.message });
        };
    };
};

module.exports = CategoryController;
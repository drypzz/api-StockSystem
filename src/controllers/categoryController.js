const { Category, Product } = require("../models");
const { generateLinks } = require("../utils/hateoas");

class CategoryController {
    
    static async getAll(req, res) {
        try {
            const category = await Category.findAll();

            const response = category.map(category => ({
                ...category.toJSON(),
                _links: generateLinks("category", category.id, ["GET", "PUT", "DELETE"])
            }));

            res.status(200).json({
                count: response.length,
                category: response,
                _links: generateLinks("category", null, ["GET", "POST"])
            });
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

            res.status(200).json({
                ...category.toJSON(),
                _links: generateLinks("category", category.id, ["GET", "PUT", "DELETE"])
            });
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

            return res.status(201).json({
                message: "Categoria criada com sucesso",
                category: {
                    ...newCategory.toJSON(),
                    _links: generateLinks("category", newCategory.id, ["GET", "PUT", "DELETE"])
                }
            });
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

            // Verifica se o novo nome é diferente e se já está em uso
            if (name && name !== category.name) {
                const findCategory = await Category.findOne({ where: { name } });
                if (findCategory) {
                    return res.status(400).json({ message: "Categoria já registrada" });
                }
                category.name = name;
            };

            // Salva a categoria atualizada
            await category.save();

            return res.status(200).json({
                message: "Categoria atualizada com sucesso",
                category: {
                    ...category.toJSON(),
                    _links: generateLinks("category", category.id, ["GET", "PUT", "DELETE"])
                }
            });
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

            return res.json({
                message: "Categoria deletada com sucesso",
                _links: generateLinks("category", null, ["GET", "POST"])
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar a categoria", error: error.message });
        };
    };
};

module.exports = CategoryController;
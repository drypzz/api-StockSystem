const Category = require('../models/Category');
const Product = require('../models/Product');

class CategoryController {
    
    static async getAll(req, res) {
        try {
            const categorys = await Category.findAll();
            res.status(200).json({categorys});
        } catch (error) {
            res.status(500).json({ message: "Erro ao listar categorias", error });
        };
    };

    static async getByID(req, res) {
        try {
            const id = Number(req.params.id);
            const category = await Category.findByPk(id);

            if (!category) {
                return res.status(404).json({ message: "Categoria não encontrada" });
            };

            res.json(category);
        } catch (error) {
            res.status(500).json({ message: "Erro ao encontrar a categoria", error });
        };
    };

    static async create(req, res) {
        try {
            const { name } = req.body;

            if (!name) {
                return res.status(400).json({ message: "O campo 'nome' é obrigatório" });
            };

            const findExistingName = await Category.findOne({ where: { name } });
            if (findExistingName) {
                return res.status(400).json({ message: "Categoria ja registrada" });
            };

            const newcategory = await Category.create({ name });

            res.status(201).json({ message: "Categoria criada com sucesso", newcategory });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar a categoria", error });
        };
    };

    static async update(req, res) {
        try {
            const id = Number(req.params.id);
            const { name } = req.body;
    
            const category = await Category.findByPk(id);
    
            if (!category) {
                return res.status(404).json({ message: "Categoria não encontrada" });
            };

            if (name && name !== Category.name) {
                const findCategoryId = await Category.findOne({ where: { name } });
                if (findCategoryId) {
                    return res.status(400).json({ message: "Categoria ja registrada" });
                };
                Category.name = name;
            };
    
            await Category.save();
    
            return res.status(200).json({ message: "Categoria atualizada com sucesso", category });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar a categoria", error });
        };
    };

    static async delete(req, res) {
        try {
            const id = Number(req.params.id);
    
            const category = await Category.findByPk(id);
            if (!category) {
                return res.status(404).json({ message: "Categoria não encontrada" });
            };
            
            const product = await Product.findAll({ where: { categoryId: id } });
                
            if (product.length > 0) {
                return res.status(400).json({ message: "Não é possível deletar a categoria, pois existem produtos vinculados a ela" });
            };
    
            await Category.destroy();
            res.json({ message: "Categoria deletada com sucesso" });
        } catch (error) {
            res.status(500).json({ message: "Erro ao deletar a categoria", error });
        };
    };
};

module.exports = CategoryController;
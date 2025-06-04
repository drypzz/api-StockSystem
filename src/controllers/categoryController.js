const { Category, Product } = require("../models");
const { generateLinks } = require("../utils/hateoas");

const NotFound = require("../errors/not-found");
const MissingValues = require("../errors/missing-values");
const Unauthorized = require("../errors/unauthorized");
const Conflict = require("../errors/conflict");

class CategoryController {
    
    static async getAll(req, res) {
        const category = await Category.findAll();

        const response = category.map(category => ({
            ...category.toJSON(),
            _links: generateLinks("category", category.id, ["GET", "PUT", "DELETE"])
        }));

        res.status(200).json({
            count: response.length,
            categories: response,
            _links: generateLinks("category", null, ["GET", "POST"])
        });
    };

    static async getByID(req, res) {
        const id = Number(req.params.id);

        // Verificar se a categoria existe
        const category = await Category.findByPk(id);
        if (!category) {
            throw new NotFound("Categoria não encontrada")
        };

        res.status(200).json({
            ...category.toJSON(),
            _links: generateLinks("category", category.id, ["GET", "PUT", "DELETE"])
        });
    };

    static async create(req, res) {
        try {
            const { name } = req.body;

            // Verificar se os campos obrigatórios estão presentes
            if (!name) {
                throw new MissingValues({ name })
            };

            // Verificar se a categoria já esta cadastrada
            const findExistingName = await Category.findOne({ where: { name } });
            if (findExistingName) {
                throw new Conflict("Essa categoria ja existe")
            };

            // Cria a categoria
            const newCategory = await Category.create({ name });

            return res.status(201).json({
                message: "Categoria criada com sucesso",
                newCategory: {
                    ...newCategory.toJSON(),
                    _links: generateLinks("category", newCategory.id, ["GET", "PUT", "DELETE"])
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao criar a categoria", error: error.message });
        };
    };

    static async update(req, res) {
        const id = Number(req.params.id);
        const { name } = req.body;

        // Verificar se a categoria existe
        const category = await Category.findByPk(id);
        if (!category) {
            throw new NotFound("Categoria não encontrada")
        };

        // Verifica se o novo nome é diferente e se já está em uso
        if (name && name !== category.name) {
            const findCategory = await Category.findOne({ where: { name } });
            if (findCategory) {
                throw new Conflict("Essa categoria ja existe")
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
    };


    static async delete(req, res) {
        const id = Number(req.params.id);

        // Verifica se a categoria existe
        const category = await Category.findByPk(id);
        if (!category) {
            throw new NotFound("Categoria não encontrada")
        };
        
        // Verifica se existem produtos vinculados a categoria
        const product = await Product.findAll({ where: { categoryId: id } });
        
        // Se existirem produtos vinculados, não é possível deletar a categoria
        if (product.length > 0) {
            throw new Unauthorized("Não é possível deletar a categoria, pois existem produtos vinculados a ela")
        };

        // Deleta a categoria
        await Category.destroy();

        return res.json({
            message: "Categoria deletada com sucesso",
            _links: generateLinks("category", null, ["GET", "POST"])
        });
    };
};

module.exports = CategoryController;
const { Category, Product } = require("../models");
const { generateLinks } = require("../utils/hateoas");

const NotFound = require("../errors/not-found");
const MissingValues = require("../errors/missing-values");
const Conflict = require("../errors/conflict");

/**
 * @class CategoryController
 * @summary Gerencia as operações de CRUD (Criar, Ler, Atualizar, Deletar) para Categorias.
*/
class CategoryController {

    /**
     * @method getAll
     * @summary Lista todas as categorias com links HATEOAS.
    */
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
    }

    /**
     * @method getByID
     * @summary Busca uma única categoria pelo ID.
    */
    static async getByID(req, res) {
        const id = Number(req.params.id);
        const category = await Category.findByPk(id);

        if (isNaN(id)){
            throw new Unauthorized("ID invalido")
        };

        if (!category) {
            throw new NotFound("Categoria não encontrada");
        }

        res.status(200).json({
            ...category.toJSON(),
            _links: generateLinks("category", category.id, ["GET", "PUT", "DELETE"])
        });
    }

    /**
     * @method create
     * @summary Cria uma nova categoria, validando e evitando nomes duplicados.
    */
    static async create(req, res) {
        const { name } = req.body;

        if (!name) {
            throw new MissingValues({ name });
        }

        const findExistingName = await Category.findOne({ where: { name } });
        if (findExistingName) {
            throw new Conflict("Essa categoria já existe com esse nome");
        }

        const newCategory = await Category.create({ name });

        return res.status(201).json({
            message: "Categoria criada com sucesso",
            newCategory: {
                ...newCategory.toJSON(),
                _links: generateLinks("category", newCategory.id, ["GET", "PUT", "DELETE"])
            }
        });
    }

    /**
     * @method update
     * @summary Atualiza uma categoria existente, checando por conflitos de nome.
    */
    static async update(req, res) {
        const id = Number(req.params.id);
        const { name } = req.body;

        const category = await Category.findByPk(id);
        if (!category) {
            throw new NotFound("Categoria não encontrada");
        }

        if (name && name !== category.name) {
            const findCategory = await Category.findOne({ where: { name } });
            if (findCategory) {
                throw new Conflict("Essa categoria já existe com esse nome");
            }
            category.name = name;
        }

        await category.save();

        return res.status(200).json({
            message: "Categoria atualizada com sucesso",
            category: {
                ...category.toJSON(),
                _links: generateLinks("category", category.id, ["GET", "PUT", "DELETE"])
            }
        });
    }

    /**
     * @method delete
     * @summary Deleta uma categoria, mas impede a exclusão se houver produtos vinculados a ela.
    */
    static async delete(req, res) {
        const id = Number(req.params.id);

        const category = await Category.findByPk(id);
        if (!category) {
            throw new NotFound("Categoria não encontrada");
        }

        const product = await Product.findAll({ where: { categoryId: id } });
        if (product.length > 0) {
            throw new Conflict("Não é possível deletar a categoria, pois existem produtos vinculados a ela");
        }

        await Category.destroy({ where: { id } });

        return res.json({
            message: "Categoria deletada com sucesso",
            _links: generateLinks("category", null, ["GET", "POST"])
        });
    }
}

module.exports = CategoryController;

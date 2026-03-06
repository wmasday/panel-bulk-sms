const { Template } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const templates = await Template.findAll();
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const template = await Template.findByPk(req.params.id);
        if (template) {
            res.json(template);
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const template = await Template.create(req.body);
        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Template.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedTemplate = await Template.findByPk(req.params.id);
            res.json(updatedTemplate);
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Template.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Template deleted' });
        } else {
            res.status(404).json({ message: 'Template not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

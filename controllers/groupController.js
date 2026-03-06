const { Group, Phone } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const { show_all } = req.query;
        const where = show_all === 'true' ? {} : { status: true };
        const groups = await Group.findAll({ where });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const group = await Group.findByPk(req.params.id, {
            include: [{ model: Phone }]
        });
        if (group) {
            res.json(group);
        } else {
            res.status(404).json({ message: 'Group not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const group = await Group.create(req.body);
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Group.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedGroup = await Group.findByPk(req.params.id);
            res.json(updatedGroup);
        } else {
            res.status(404).json({ message: 'Group not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Group.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Group deleted' });
        } else {
            res.status(404).json({ message: 'Group not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

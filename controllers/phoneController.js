const { Phone, Group } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const { show_all } = req.query;
        const where = show_all === 'true' ? {} : { status: true };
        const phones = await Phone.findAll({
            where,
            include: Group
        });
        res.json(phones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const phone = await Phone.findByPk(req.params.id, { include: Group });
        if (phone) {
            res.json(phone);
        } else {
            res.status(404).json({ message: 'Phone not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const phone = await Phone.create(req.body);
        res.status(201).json(phone);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Phone.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedPhone = await Phone.findByPk(req.params.id);
            res.json(updatedPhone);
        } else {
            res.status(404).json({ message: 'Phone not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Phone.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Phone deleted' });
        } else {
            res.status(404).json({ message: 'Phone not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.bulkCreate = async (req, res) => {
    try {
        if (!Array.isArray(req.body)) {
            return res.status(400).json({ message: 'Body must be an array of phone objects' });
        }
        const phones = await Phone.bulkCreate(req.body);
        res.status(201).json(phones);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

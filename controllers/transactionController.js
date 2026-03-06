const { Transaction, Group, Template } = require('../models');

exports.getAll = async (req, res) => {
    try {
        const transactions = await Transaction.findAll({
            include: [Group, Template]
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const transaction = await Transaction.findByPk(req.params.id, {
            include: [Group, Template]
        });
        if (transaction) {
            res.json(transaction);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.create = async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const [updated] = await Transaction.update(req.body, {
            where: { id: req.params.id }
        });
        if (updated) {
            const updatedTransaction = await Transaction.findByPk(req.params.id);
            res.json(updatedTransaction);
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await Transaction.destroy({
            where: { id: req.params.id }
        });
        if (deleted) {
            res.json({ message: 'Transaction deleted' });
        } else {
            res.status(404).json({ message: 'Transaction not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

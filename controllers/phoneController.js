const { Phone, Group } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
    try {
        const { show_all, q, page = 1, limit = 20 } = req.query;

        // Status filter
        const statusWhere = show_all === 'true' ? {} : { status: true };

        // Search filter on phone number
        const searchWhere = q && q.trim()
            ? { phone: { [Op.like]: `%${q.trim()}%` } }
            : {};

        const where = { ...statusWhere, ...searchWhere };

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(200, Math.max(1, parseInt(limit) || 20));
        const offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Phone.findAndCountAll({
            where,
            include: Group,
            limit: limitNum,
            offset,
            order: [['id', 'DESC']]
        });

        res.json({
            rows,
            total: count,
            page: pageNum,
            totalPages: Math.ceil(count / limitNum),
            limit: limitNum
        });
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

/**
 * Bulk create phones with automatic group assignment.
 * Splits every 500 phones into a new auto-created group.
 *
 * Body: {
 *   phones: string[],          // list of phone numbers
 *   type: 'whatsapp' | 'sms',
 *   status: boolean,
 *   groupPrefix: string        // base name for generated groups, e.g. "Batch"
 *   chunkSize: number          // phones per group (1–1000, default 500)
 * }
 */
exports.bulkCreateAutoGroup = async (req, res) => {
    const sequelize = Group.sequelize;
    const t = await sequelize.transaction();
    try {
        const { phones: phoneList, type, status, groupPrefix, chunkSize } = req.body;

        if (!Array.isArray(phoneList) || phoneList.length === 0) {
            return res.status(400).json({ message: 'phones must be a non-empty array of phone number strings' });
        }

        // User-defined chunk size: clamp between 1 and 1000, default 500
        const CHUNK_SIZE = Math.min(1000, Math.max(1, parseInt(chunkSize) || 500));
        const prefix = (groupPrefix || 'Auto Group').trim();
        const createdGroups = [];
        const createdPhones = [];

        // Split phone numbers into chunks of CHUNK_SIZE
        for (let i = 0; i < phoneList.length; i += CHUNK_SIZE) {
            const chunk = phoneList.slice(i, i + CHUNK_SIZE);
            const groupIndex = Math.floor(i / CHUNK_SIZE) + 1;

            // Create a group for this chunk
            const group = await Group.create({
                title: `${prefix} ${groupIndex}`,
                type: type || 'whatsapp',
                status: status !== undefined ? status : true
            }, { transaction: t });

            createdGroups.push(group);

            // Build phone records referencing the new group
            const phoneRecords = chunk.map(phone => ({
                phone: String(phone).trim(),
                type: type || 'whatsapp',
                group_id: group.id,
                status: status !== undefined ? status : true
            }));

            const inserted = await Phone.bulkCreate(phoneRecords, { transaction: t });
            createdPhones.push(...inserted);
        }

        await t.commit();

        res.status(201).json({
            message: `Successfully created ${createdGroups.length} group(s) with ${createdPhones.length} phone(s).`,
            groups: createdGroups,
            totalPhones: createdPhones.length
        });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
};

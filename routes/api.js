const express = require('express');
const router = express.Router();
const phoneController = require('../controllers/phoneController');
const groupController = require('../controllers/groupController');
const templateController = require('../controllers/templateController');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// Phone Routes
router.get('/phones', phoneController.getAll);
router.get('/phones/:id', phoneController.getById);
router.post('/phones', phoneController.create);
router.post('/phones/bulk', phoneController.bulkCreate);
router.post('/phones/bulk-auto-group', phoneController.bulkCreateAutoGroup);
router.post('/phones/import-excel', upload.single('file'), phoneController.importExcel);
router.put('/phones/:id', phoneController.update);
router.delete('/phones/:id', phoneController.delete);

// Group Routes
router.get('/groups', groupController.getAll);
router.get('/groups/:id', groupController.getById);
router.post('/groups', groupController.create);
router.put('/groups/:id', groupController.update);
router.delete('/groups/:id', groupController.delete);

// Template Routes
router.get('/templates', templateController.getAll);
router.get('/templates/:id', templateController.getById);
router.post('/templates', templateController.create);
router.put('/templates/:id', templateController.update);
router.delete('/templates/:id', templateController.delete);

// Transaction Routes
router.get('/transactions', transactionController.getAll);
router.get('/transactions/:id', transactionController.getById);
router.post('/transactions', transactionController.create);
router.put('/transactions/:id', transactionController.update);
router.delete('/transactions/:id', transactionController.delete);

module.exports = router;

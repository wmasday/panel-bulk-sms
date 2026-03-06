require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes/api');
const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // IMPORTANT

app.use(express.json());
app.use(express.static('public'));

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'Bulk SMS Panel API' });
});

app.listen(PORT, HOST, async () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    try {
        await db.sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});
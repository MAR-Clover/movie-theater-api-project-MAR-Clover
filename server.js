const express = require('express');
const app = express();
const userRoutes = require('./routes/users');
const showRoutes = require('./routes/shows');

// Use routes
app.use(express.json());

app.use('/users', userRoutes);
app.use('/shows', showRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to your Express server!');
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

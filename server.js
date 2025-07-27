// @ts-ignore
const express   = require('express');
const connectDB = require('./config/db.js');

const app  = express();
const port = process.env.PORT || 3000;
connectDB();

app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('Hello World!'));
app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/posts', require('./routes/api/post'));

app.listen(port, () => console.log(`Listening on port ${port}`));

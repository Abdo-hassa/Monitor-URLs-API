const express = require('express');
const app = express();
const cors = require('cors');
const { errorHandler, notFound } = require('./middlewares/errorMiddlewares');
app.use(cors());
app.use(express.json());
const authRoute = require('./routes/auth');
const checkRoute = require('./routes/check');
app.get('/', (req, res) => {
	res.send('api is running');
});
app.use('/api/auth', authRoute);
app.use('/api/check', checkRoute);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

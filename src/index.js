const app = require('./app.js');
require('dotenv').config();
const { monitor } = require('./urlmonitor');
const PORT = process.env.PORT || 4000;
const { connectDB } = require('./utils/db');
monitor();
connectDB()
	.then(client => {
		console.log(`connected to database 🚀`);
		app.listen(PORT, () => {
			console.log(`Server is listening on port: ${PORT}`);
		});
	})
	.catch(e => console.log(e));

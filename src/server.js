import propertyRoute from './routes/property-route';
import openRoute from './routes/open-data-route';

const propertyRouter = propertyRoute.router;
const openRouter = openRoute.router;
let cors = require('cors');
let express = require('express');
let app = express();

app.use(cors());
app.use(express.json());
app.use('/property', propertyRouter);
app.use('/open/', openRouter);
let port = 8080;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

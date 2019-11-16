let propertyRoute = require('./routes/property-route').router;
let cors = require('cors');
let express = require('express');
let app = express();

app.use(cors());
app.use(express.json());
app.use('/property', propertyRoute);
let port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
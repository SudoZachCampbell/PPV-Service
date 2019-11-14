var propertyRoute = require('./routes/property-route').router;
var cors = require('cors');
var express = require('express');
var app = express();

app.use(cors());
app.use(express.json());
app.use('/property', propertyRoute);
var port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
var propertyRoute = require('./src/routes/property-route').router;
var express = require('express');
var app = express();

app.use(express.json());
app.use('/property', propertyRoute);
var port = 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
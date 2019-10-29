var env = require('dotenv').config();
var aws = require('aws-sdk');

var accessKey = process.env.AccessKeyID;
var secretKey = process.env.SecretAccessKey;
var tableName = process.env.TableName;
var region = process.env.Region;

aws.config.update({
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
    region: region
});

var docClient = new aws.DynamoDB.DocumentClient();

exports.saveProperty = (key, propertyObj) => {
    return new Promise((resolve, reject) => {
        console.table(propertyObj);
        var params = {
            TableName: tableName,
            Item: propertyObj
        };
        docClient.put(params, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}
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

/**
 * Unused
 */
let saveProperty = (key, propertyObj) => {
    return new Promise((resolve, reject) => {
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

let getSearch = (searchId) => {
    return new Promise((resolve, reject) => {
        var params = {
            TableName: tableName,
            KeyConditionExpression: "#search = :search",
            ExpressionAttributeNames:{
                "#search": "search_id"
            },
            ExpressionAttributeValues: {
                ":search": searchId
            }
        };
        docClient.query(params, (err, data) => {
            if (err) reject(err);
            resolve(data);
        });
    });
}

module.exports = {
    saveProperty,
    getSearch
}
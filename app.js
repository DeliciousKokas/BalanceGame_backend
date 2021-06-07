const express = require("express");
const cors = require('cors');
const app = express();
const mysql = require('mysql');
const AWS = require("aws-sdk");

AWS.config.update({
  region: "ap-northeast-1",
  endpoint: "dynamodb.ap-northeast-1.amazonaws.com:443"
});

const docClient = new AWS.DynamoDB.DocumentClient();
const table = "balance-game-db-dev";

// mysql情報を入力し、接続
const db = mysql.createConnection({
  host: 'db',
  user: 'root',
  password: 'root',
  database: 'balance_db'
});
db.connect(function(err) {
  if (err) throw err;
  console.log('Connected');
});

// すべてのAPIをCORS許可
app.use(cors());
app.use(express.json())

// server起動
const server = app.listen(3000, () => {
  console.log("It works!")
});

app.get('/api/boxs', (req, res) => {
  console.log('req: get /api/boxs');

  docClient.scan({
    TableName: table,
    Select: "COUNT"
  },  
  function(err, data){
    if(err){
      console.log(err);
    }else{
      const dataCount = data.Count
      const randomID = Math.floor((Math.random() * dataCount) + 1 );

      docClient.get({
        TableName: table,
        Key:{
            "id": randomID,
        }
      }, (err, data) => {
        if (err) {
          console.log(err);
        } else {
          console.log(data)
          res.send(data.Item);
        }
      });
    };
  });
});

app.put('/api/boxs/vote', (req, res) => {
  console.log('req: put /api/boxs/vote');
  console.log(req.body.voted);

  const params = {
    TableName:table,
    Key:{ "id": req.body.id },
    UpdateExpression: (req.body.voted === "left") ? "set left_voted_amount = left_voted_amount + :val" : "set right_voted_amount = right_voted_amount + :val",
    ExpressionAttributeValues:{
        ":val": 1
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.update(params, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data)
      res.send(data.Item);
    }
  });
});

app.put('/api/boxs/like', (req, res) => {
  console.log('req: put /api/boxs/like');

  const params = {
    TableName:table,
    Key:{ "id": req.body.id },
    UpdateExpression: "set liked = liked + :val",
    ExpressionAttributeValues:{
        ":val": 1
    },
    ReturnValues:"UPDATED_NEW"
  };

  docClient.update(params, function(err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data)
      res.send(data.Item);
    }
  });
});

app.get('/api/comments', (req, res) => {
  console.log('req: get /api/comments');
  console.log(req.query.id);

  const sql = "SELECT * FROM `comments` WHERE card_id = ?;"

  db.query(sql, [req.query.id], function (err, result, fields) {  
    if (err) throw err;
    res.send(result);

    console.log(result);
    });
  
  // const sql = "SELECT tmp.* FROM `cards` AS tmp INNER JOIN (SELECT CEIL(RAND() * (SELECT MAX(`id`) FROM `cards`)) AS `id`) AS `random` ON tmp.id = random.id;"

	// db.query(sql, function (err, result, fields) {  
  //   if (err) throw err;
  //   res.send(result)

  //   console.log(result);
  //   });
});

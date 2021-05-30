const express = require("express");
const cors = require('cors');
const app = express();
const mysql = require('mysql');

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

  const sql = "SELECT tmp.* FROM `cards` AS tmp INNER JOIN (SELECT CEIL(RAND() * (SELECT MAX(`id`) FROM `cards`)) AS `id`) AS `random` ON tmp.id = random.id;"

	db.query(sql, function (err, result, fields) {  
    if (err) throw err;
    res.send(result)

    console.log(result);
    });
});

app.put('/api/boxs/vote', (req, res) => {
  console.log('req: put /api/boxs/vote');
  console.log(req.body.voted);
  
  const sql = (req.body.voted === "left") ? "UPDATE cards SET left_voted_amount = left_voted_amount + 1 WHERE ID = ?;" :  "UPDATE cards SET right_voted_amount = right_voted_amount + 1 WHERE ID = ?;"

	db.query(sql, req.body.id, function (err, result, fields) {  
    if (err) throw err;
    res.send("like request has been succeed!");

    console.log(result);
    });
});

app.put('/api/boxs/like', (req, res) => {
  console.log('req: put /api/boxs/like');

  const sql = "UPDATE cards SET liked = liked + ? WHERE ID = ?;"

	db.query(sql, [req.body.count, req.body.id], function (err, result, fields) {  
    if (err) throw err;
    res.send("like request has been succeed!");

    console.log(result);
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

const express = require('express');
const app = express();
var admin = require("firebase-admin");
const path = require('path');

var serviceAccount = require(path.join(__dirname, 'svAcc', 'serviceAccount.json'));

// Initialize Firebase Admin SDK (you need to set up your credentials)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://boxdots-ba3ca-default-rtdb.firebaseio.com"
});

// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = admin.database();
var ref = db.ref("urls");

ref.on("value", function(snapshot) {
  var data = snapshot.val();
  console.log(data);
});

// Start the API server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});


// /getUserEmail -> /getUrlResult
// username -> link
// users -> urls
// name -> url
// email -> urlResult
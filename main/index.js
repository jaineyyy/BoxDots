const express = require('express');
const app = express();
var admin = require("firebase-admin");
const path = require('path');

const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);

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

// Define an endpoint to retrieve a specific child data
app.get('/getUrl', (req, res) => {
  const link = req.query.link; // Get the link from the request
  
  // Construct a query to find the urlResult with the given link
  const urlsRef = admin.database().ref('urlResult');
  urlsRef.orderByChild('url').equalTo(link).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        // Access the "urlResult" field for the app user
        const linkKey = Object.keys(snapshot.val())[0]; // Get the link's key
        const linkResult = snapshot.child(linkKey).child('urlResult').val();
        res.json({ urlResult: linkResult });
      } else {
        res.status(404).json({ error: 'Link not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Server error' });
    });
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
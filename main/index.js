const express = require('express');
const app = express();
var admin = require("firebase-admin");

const FIREBASE_SERVICE_ACCOUNT = process.env.FIREBASE_SERVICE_ACCOUNT;
const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT);

// Initialize Firebase Admin SDK (you need to set up your credentials)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://boxdots-ba3ca-default-rtdb.firebaseio.com"
});

// Asks for API key
const api_key = process.env.API_KEY;

// Middleware to validate the API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.get('Authorization'); // Assume API key is in the 'Authorization' header

  if (api_key === apiKey) {
    // API key is valid, proceeds to the route
    next();
  } else {
    // API key is invalid, unauthorized
    res.status(401).json({ error: 'Unauthorized' });
  }
};


// Define an endpoint to retrieve a specific child data
app.get('/url', validateApiKey, (req, res) => {
  const link = req.query.link; // Get the link from the request
  
  // Construct a query to find the urlResult with the given link
  const urlsRef = admin.database().ref('urls');
  urlsRef.orderByChild('url').equalTo(link).once('value')
    .then(snapshot => {
      if (snapshot.exists()) {
        // Access the "urlResult" field for the app user
        const linkKey = Object.keys(snapshot.val())[0]; // Get the link's key
        const linkResult = snapshot.child(linkKey).child('urlResult').val();
        res.json({ urlResult: linkResult });
      } else {
        res.json({ urlResult: 'Link not found' });
      }
    })
    .catch(error => {
      res.status(500).json({ error: 'Server error' });
    });
});
app.post('/addUrl', validateApiKey, (req, res) => {
  const link = req.body.link;
  const linkResult = req.body.extraData;

  //Get the ref from the database
  const addUrlRef = admin.database().ref('urls');

  // Push the new link to the local database
  const newLinkRef = addUrlRef.push();
  newLinkRef.set({
    url: link,
    urlResult: linkResult
  })
  .then(() => {
    console.log('URL added to the Firebase Realtime Database');
    res.status(200).json({ message: 'URL with its result is added to the database' });
  })
 .catch((error) => {
    console.error('Error adding URL to the Firebase Realtime Database:', error);
    res.status(500).json({ error: 'Server error' });
  });
  
});

// Start the API server
const PORT = process.env.PORT || 1000;
app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}`);
});


// /getUserEmail -> /getUrlResult
// username -> link
// users -> urls
// name -> url
// email -> urlResult
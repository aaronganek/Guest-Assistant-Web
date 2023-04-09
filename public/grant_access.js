// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyBNrfpbEe1TP_gbNTd9xGtSh74AFN3a2YQ",
  authDomain: "guestassistant-378f6.firebaseapp.com",
  projectId: "guestassistant-378f6",
  storageBucket: "guestassistant-378f6.appspot.com",
  messagingSenderId: "186980398604",
  appId: "1:186980398604:web:726d2be366477e6dc3a029"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get DOM elements
const signInButton = document.getElementById('signInButton');
const statusMessage = document.getElementById('statusMessage');

// Set up Google Sign-In provider
const provider = new firebase.auth.GoogleAuthProvider();

// Sign in with Google when the button is clicked
signInButton.addEventListener('click', () => {
  firebase.auth().signInWithPopup(provider).then(async (result) => {
    // Get the token from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    // Access Firestore
    const db = firebase.firestore();

    // Look up the access request information in the "PendingEmails" collection
    const accessRequestRef = db.collection("PendingEmails").doc(token);
    const accessRequestSnapshot = await accessRequestRef.get();

    // Check if the access request exists
    if (!accessRequestSnapshot.exists) {
      statusMessage.textContent = "Access request not found.";
      return;
    }

    // Get the access request data
    const accessRequestData = accessRequestSnapshot.data();

    // Create a new document in the "AuthorizedEmails" collection
    await db.collection("AuthorizedEmails")
      .doc(accessRequestData.email)
      .set(accessRequestData);

    // Delete the access request from the "PendingEmails" collection
    await accessRequestRef.delete();

    // Display a success message
    statusMessage.textContent = "Access granted successfully.";
  }).catch((error) => {
    // Display an error message
    statusMessage.textContent = "Error: " + error.message;
  });
});

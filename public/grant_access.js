// Import the required Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Export the grantAccess function
export const grantAccess = () => {
  // Get DOM elements
  const signInButton = document.getElementById('signInButton');
  const statusMessage = document.getElementById('statusMessage');

  // Set up Google Sign-In provider
  const provider = new GoogleAuthProvider();

  // Get the Auth and Firestore instances
  const auth = getAuth();
  const db = getFirestore();

  // Sign in with Google when the button is clicked
  signInButton.addEventListener('click', () => {
    signInWithPopup(auth, provider).then(async (result) => {
      // Get the token from the URL query parameter
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');

      // Look up the access request information in the "PendingEmails" collection
      const accessRequestRef = doc(db, "PendingEmails", token);
      const accessRequestSnapshot = await getDoc(accessRequestRef);

      // Check if the access request exists
      if (!accessRequestSnapshot.exists()) {
        statusMessage.textContent = "Access request not found.";
        return;
      }

      // Get the access request data
      const accessRequestData = accessRequestSnapshot.data();

      // Create a new document in the "AuthorizedEmails" collection
      await setDoc(doc(db, "AuthorizedEmails", accessRequestData.email), accessRequestData);

      // Delete the access request from the "PendingEmails" collection
      await deleteDoc(accessRequestRef);

      // Display a success message
      statusMessage.textContent = "Access granted successfully.";
    }).catch((error) => {
      // Display an error message
      statusMessage.textContent = "Error: " + error.message;
    });
  });
};

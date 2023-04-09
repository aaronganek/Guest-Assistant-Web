// Import the required Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-firestore.js";

// Your Firebase configuration object
const firebaseConfig = {
  // Your Firebase configuration here
};

// Initialize Firebase
initializeApp(firebaseConfig);

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
  signInButton.addEventListener('click', async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      // Check if the user is an admin
      const adminsQuery = query(collection(db, "Admins"), where("email", "==", userEmail));
      const adminsSnapshot = await getDocs(adminsQuery);
      if (adminsSnapshot.empty) {
        statusMessage.textContent = "You are not authorized to grant access.";
        return;
      }

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
    } catch (error) {
      // Display an error message
      statusMessage.textContent = "Error: " + error.message;
    }
  });
};

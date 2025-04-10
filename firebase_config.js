import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getDatabase, ref, get, child, onValue } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCn553qWsVz2VF1dZ4Ji5OkQDGFvMORbJE",
  authDomain: "pg-data-ed1c2.firebaseapp.com",
  projectId: "pg-data-ed1c2",
  storageBucket: "pg-data-ed1c2.appspot.com",
  messagingSenderId: "884858492190",
  appId: "1:884858492190:web:67b7606ff790064ef3250f"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, get, child, onValue };

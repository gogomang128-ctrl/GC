
const firebaseConfig = {
  apiKey: "AIzaSyDpM3hBc2HDcMaRjVVnlXHpAOiNkaADTzw",
  authDomain: "gccc-d1051.firebaseapp.com",
  databaseURL: "https://gccc-d1051-default-rtdb.firebaseio.com",
  projectId: "gccc-d1051",
  storageBucket: "gccc-d1051.firebasestorage.app",
  messagingSenderId: "1046366134936",
  appId: "1:1046366134936:web:65caf6ae787a4d737026ed",
  measurementId: "G-GWF1F79LM8"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();

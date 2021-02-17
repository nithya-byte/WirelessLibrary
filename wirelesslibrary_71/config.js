import * as firebase from 'firebase';
require('@firebase/firestore');

var firebaseConfig = {
    apiKey: "AIzaSyB2Og262qBKhYKZOGimncTbx0snmblr0H0",
    authDomain: "willylatest.firebaseapp.com",
    databaseURL: "https://willylatest.firebaseio.com",
    projectId: "willylatest",
    storageBucket: "willylatest.appspot.com",
    messagingSenderId: "228897416520",
    appId: "1:228897416520:web:5e67019414f1395a02ff7d"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore();
  
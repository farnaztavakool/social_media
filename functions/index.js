
const {getAllScreams,postAllScreams, getScream, commentOnScream ,likeScream,unlikeScream, screamDelete, markNotificationsRead, getUserDetails} = require('./handler/screams')
const functions = require('firebase-functions');
const express = require('express')
const FBAuth = require('./util/fbauth')
app = express();
const db = require('./util/admin')
const {signUp, login, uploadImage,addUserDetails,getAuthenticatedUser} = require('./handler/users')



app.get('/scream-2',getAllScreams);
app.get('/scream-2:screamId',getScream);
app.post('/scream-2/:screamId/comment',FBAuth,commentOnScream)
app.get('/scream-2/:screamId/like',FBAuth, likeScream)
app.get('/scream-2/:screamId/unlike',FBAuth, unlikeScream)
app.delete('/scream-2/:screamId/delete', FBAuth, screamDelete)
// TODO: delete a scream , like a scream, unlike a scream, comment on scream, 
app.post('/scream-2',FBAuth,postAllScreams);
app.post('/signUp',signUp)
app.post('/login',login)
app.post('/user/image',FBAuth,uploadImage)
app.post('/user',FBAuth,addUserDetails)
app.get('/user',FBAuth,getAuthenticatedUser)
app.get('/user/:handle', getUserDetails)
app.post('/notifications',FBAuth, markNotificationsRead)

exports.api = functions.region('europe-west1').https.onRequest(app);
exports.createNotificationOnLike = functions
  .region('europe-west1')
  .firestore.document('likes/{id}')
  .onCreate((snapshot) => {
    // return res.json({message: "yes"})
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch((err) => console.error(err));
  });

// exports.deleteNotificationOnUnlike = functions.region('asia-east2').firestore.document('likes/{id}')
// .onDelete((snapshot) => {
//     db.doc(`/notification/${snapshot.id}`)
//         .delete()
//         .then(() => {
//             return;
//         })
//         .catch( err => {
//             console.log(err)
//             return res.status(500).json(err)
//         })

// })
// exports.createNotificationsOnComment = functions.region('asia-east2').firestore.document('comment/{id}')
// .onCreate((snapshot) => {
//     db.doc(`/scream-2/${snapshot.data().screamId}`).get()
//         .then( doc => {
//             if (doc.exists) {
//                 return db.doc(`/notification/${snapshot.id}`).set({
//                     createdAt: new Date().toISOString,
//                     recipient: doc.data().userHandle,
//                     sender: snapshot.data().userHandle,
//                     type: 'comment',
//                     read: false,
//                     screamId: doc.id

//                 })
//             }
//         })
//         .then(() => {
//             return ;
//         })
//         .catch( err => {
//             console.log(err)
//             return res.status(500).json(err)
//         })
// })

const {admin,db} = require('./admin')
module.exports =  (req,res,next) => {
    let itToken
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        idToken = req.headers.authorization.split('Bearer ')[1]
    } else {
        console.log('No token found')
        return res.status(403).json({error: "Unauthorized"})
    }
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            console.log(decodedToken)
            req.user = decodedToken
            return db.collection('users')
                .where('userId','==',req.user.uid)
                .limit(1)
                .get();
        })
        
        .then (data => {
            req.user.handle = data.docs[0].data().handle;
            req.user.imageURL = data.docs[0].data().imageURL
            return next()
        })
        .catch(err => {
            console.error('Error while varifying token ',err);
            return res.status(403).json({err})
        })
}
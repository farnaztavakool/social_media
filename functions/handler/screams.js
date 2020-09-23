
const {db,admin} = require('../util/admin')
exports.getAllScreams = (req,res)=> {
    admin.firestore().collection('users')
    .orderBy('createdAt','desc')
    .get()
        .then(data => {
            let scream = []
            data.forEach(doc => {
                scream.push({
                    screamId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                });
            });
            return res.json(scream)
        })
        .catch(err => console.log(err));
}
exports.postAllScreams = (req,res) => {
   
    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        userImage: req.user.imageURL,
        createdAt : new Date().toISOString(),
        likeCount:0,
        commentCount:0
    };

    admin.firestore()
        .collection('scream-2')
        .add(newScream)
        .then( doc => {
            const resScream = newScream
            resScream.screamId = doc.id
            res.json(resScream)
        })
        .catch(err =>{
            console.log(err)
        })
    
}

//  the scream with the screamId
exports.getScream = (req,res) => {
    let screamData = {}
    // find the one with this id 
    db.doc(`/scream-2/${req.params.screamId}`).get()
        .then(doc => {
            
            if (!doc.exists) {
                return res.status(404).json({error: "scream not found"})
            }
            
            screamData = doc.data()
            screamData.screamId = doc.id
            db.collection('comments').get()
            .then ( doc => { 
                doc.forEach( data => { 
                    console.log(  data.data()['screamId'].length,req.params.screamId.length)
                })
            return db.collection('comments')
            .orderBy('createdAt','desc')
            .where('screamId', '==',req.params.screamId).get()
            
        })
        .then(data => {
            screamData.comments = []
            // console.log(data)
            data.forEach( doc => {
                // console.log(doc)

                screamData.comments.push(doc.data())
            })
            return res.json(screamData)
        })
        .catch(err => {
            console.log(err)
            return res.status(400).json(err)
        })
        
        })
    }

exports.commentOnScream = (req,res) => {
    if (req.body.body.trim() === '') return res.status(400).json({error: ' comment cant be empty'})
    const comment = {
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString(),
        body: req.body.body,
        userImage: req.user.imageURL
    }
    db.doc(`/scream-2/${req.params.screamId}`).get()
        .then( data => {
            if (!data.exists) return res.status(404).json({error: 'post doesnt exist'})
            return data.ref.update({commentCount: data.data().commentCount + 1 })
        })
        .then( () => {
            return db.collection('comments').add(comment)
        })
        .then(() => {
            return res.json(comment)
        })
        
        .catch(err =>{
             console.log(err)
             return res.status(500).json(err)
        })
}

exports.likeScream = (req,res) => {
    // checks if the document has already been liked
    // doesnt understand the necessity of adding limit 
    const likeDocument = db.collection('/likes').where('userHandle', '==',req.user.handle)
    .where('screamId','==',req.params.screamId)
    .limit(1)
    const screamDocument = db.doc(`/scream-2/${req.params.screamId}`)
    let screamdData = {}
    screamDocument.get()
        .then((doc) => {
            if (doc.exists) {
                screamData = doc.data()
                screamData.screamId = doc.id
                console.log(screamdData)

                return likeDocument.get()
            } else {
                return res.status(404).json({error: "scream not found"})
            }
        })
        .then( data => {
            if (data.empty) {
                return db.collection('/likes').add({
                    screamId: req.params.screamId,
                    userHandle: req.user.handle
                })
                .then( () => {
                    screamData.likeCount++
                    return screamDocument.update({likeCount: screamData.likeCount})
                })
                .then (()=> {
                    return res.json(screamData)
                })
                
            }
            else {
                return res.status(400).json({error: 'scream already liked'})
            }
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json(err)
        })
}

exports.unlikeScream = (req,res) => {
    // checking if it has been like already 
    // document exists
    // update the counts on the document
    const likeDocument = db.collection('/likes').where('userHandle', '==',req.user.handle)
    .where('screamId','==',req.params.screamId)
    .limit(1)

    const screamDocument = db.doc(`/scream-2/${req.params.screamId}`)
    let screamdData = {}
    screamDocument.get()
        .then((doc) => {
            if (doc.exists) {
                
                screamData = doc.data()
               
                screamData.screamId = doc.id
                return likeDocument.get()
            } else {
                return res.status(404).json({error: "scream not found"})
            }
        })
        
        .then( data => {
           
            if (!data.empty) {
                console.log(data.docs[0].id)
                db.doc(`/likes/${data.docs[0].id}`).delete()
                .then (() => {
                    screamData.likeCount--
                    return screamDocument.update({likeCount: screamData.likeCount})
                })
                .then(() => {
                    return res.json(screamdData)
                })
            }
            else {
                return res.status(400).json({err: "yoo first like the post ya bitch"})
            }

        })
        .catch(err => {
            console.log(err)
            return res.status(500).json(err)
        })
}

exports.screamDelete = (req,res) => {
  
    // if the use is the owner of the scream i.e: has authority 
    const document = db.doc(`/scream-2/${req.params.screamId}`)
    document.get()
        .then( doc => {
            if (!doc.exists) return res.status(404).json({error: "scream doesnt exist"})
            // console.log(doc.data().userHandle,req.user.Handle )
            if (doc.data().userHandle != req.user.handle) return res.status(403).json({error: "unauthorised access"})
            else {
               return document.delete()
            }
           
        })
        .then (() => {
            res.json({message: "scream deleted successfully"})
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json(err)
        })

}
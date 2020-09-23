const {db,admin} = require('../util/admin')
const firebase = require('firebase')
const config = require('../util/config')
const {validateSignupData, validateLoginData, reduceUserDetails} = require('../util/validators')
firebase.initializeApp(config)
exports.signUp = (req,res)=> {
    // admin.firebase.collection("user").get
    
    const new_user = {
        email: req.body.email,
        password: req.body.password,
        confirm: req.body.confirm,
        handle :req.body.handle
    };
    const {valid, errors} = validateSignupData(new_user)
    if(!valid) return res.status(400).json({errors})
    const imageurl = 'noimage.png'
    db.doc(`/users/${new_user.handle}`).get()
        .then(doc => {
            if(doc.exists) {
                return res.status(500).json({handle:"this handle already exists"})
            }else {
                return firebase
            .auth()
            .createUserWithEmailAndPassword(new_user.email,new_user.password);
                }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken()
        }) 
        .then (token => {
            token = token;
            const userCredentials = {
                handle: new_user.handle,
                email: new_user.email,
                createdAt: new Date().toISOString(),
                imageURL: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageurl}?alt=media`,
                userId
            }
            db.collection('users').doc(`${new_user.handle}`).set(userCredentials);
            return res.status(400).json({token:token})
            
        })
    
        .catch(err => {
            console.error(err)
            return res.status(500).json(({error: err.code}))
        })
        
}
exports.login = (req,res)=> {
    const user = {
        'email': req.body.email,
        'password':req.body.password
    }
   
    const {valid,error} = validateLoginData(user)
    if (!valid) return res.json(400).json({error})
    
    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
        .then(data =>{
            return data.user.getIdToken();
        })
        .then (token => {
            return res.json({token});
        })
        .catch(err => {
            console.log(err)
            if (err.code == 'auth/wrong-password') {
                return res.status(500).json({general:'Wrong Credentials Please Try Again'})
            }
            else return res.status(500).json({error:err.code})
        })
}

exports.uploadImage = (req,res) => {
    const Busboy = require('busboy')
    const path = require('path')
    const os = require('os')
    const fs = require('fs')
    let imageFileName;
    let imageTobeUploaded = {}
    const busboy = new Busboy({headers: req.headers})
    busboy.on('file',(fieldname,file,filename,encoding,mimetype) => {
        if(mimetype !== 'image/jpeg' && mimetype !== "image/png") return res.status(400).json({"error":"wrong format"})
        console.log(fieldname)
        console.log(filename)
        console.log(mimetype)
        const imageExtenion = filename.split('.')[filename.split('.').length-1]
        imageFileName =` ${Math.round(Math.random()*10000000)}.${imageExtenion}`
        const filePath = path.join(os.tmpdir(),imageFileName)
        imageTobeUploaded = {filePath,mimetype}
        file.pipe(fs.createWriteStream(filePath))
    })
    busboy.on('finish',() =>{ 
        admin.storage().bucket().upload(imageTobeUploaded.filePath,{
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageTobeUploaded.mimetype
                }
            }
        })
        .then(()=>{
            const imageURL = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`
            // return res.json({user:req.user})
            return db.doc(`/users/${req.user.handle}`).update({imageURL})
        })
        .then(()=> {
            return res.json({message:'image uploaded'})
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json({err})
        })
    })
    busboy.end(req.rawBody)
}

exports.addUserDetails = (req,res) => {
    let userDetails = reduceUserDetails(req.body);
    db.doc(`/users/${req.user.handle}`).update(userDetails)
        .then(() => {
            return res.status(400).json({message: "details added successfully"})
        })
        .catch(err => {
            console.log(err)
            return res.status(500).json(err)
        })

}

exports.getAuthenticatedUser = (req,res) => {
    let userData = {}
    db.doc(`/users/${req.user.handle}`).get()
        .then( doc => {
            if (doc.exists) {
                userData.credentials = doc.data()
                return db.collection('likes').where('userHandle', '==' ,req.user.handle).get()
            }
        })
        .then( data => {
            userData.likes = []
            data.forEach( doc => {
                userData.likes.push(doc.data())
            })
            return db.collection('notification').where('recipient', '==', req.user.handle)
            .orderBy('createdAt','desc' )
        })
        .then( data => {
            userData.notification = []
            data.forEach (doc => {
                userData.notification.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    screamId: doc.data().screamId,
                    type: doc.data().type,
                })
            })
        })
        return res.json(userData)
        .catch(err => {
            console.log(err)
            return res.status(500).json()
        })
}
//Get any user's detail 
exports.getUserDetails = (req,res) => {
    let userData = {}
    db.doc(`/users/${req.params.handle}`)
    .get()
    .then( doc => {
        if (doc.exists) {
            userData.user = doc.data()
            return db.collection('scream-2').where( 'userHandle' , '==', req.params.handle)
                .orderBy('createdAt', 'desc')
        }
    })
}
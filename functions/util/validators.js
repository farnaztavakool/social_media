const empty = (string) => {
    if(string.trim() == "") return true
    else return false
};
const isEmail = (email) => {
    const regEx = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
    if (email.match(regEx)) return true
    else return false
};
//we dont return from here 
exports.validateSignupData = (data) => {
    let errors = {}
    if (empty(data.email))  {
        errors.email = "must not be emtpy"
    } else if (!isEmail(data.email)) {
        errors.email = "must be a valid email"
    }
    if (empty(data.password)) {
        errors.password = " must not be emtpy"
    }
    if (data.confirm != data.password) {
        errors.password = "password doesnt match"
    }
    if (empty(data.handle)) {
        errors.handle = "must not be emtpy"
    }
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true: false
    }
}
exports.validateLoginData = data => {
    let errors = {}
    if (empty(data.email)) errors.email = "must not be emtpy"
    if (empty(data.password)) errors.password = "must not be emtpy"
    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true: false
    }    
}

exports.reduceUserDetails = (data) => {
    let userDetails = {}
    if (!empty(data.bio.trim())) userDetails.bio = data.bio;
    if (!empty(data.website.trim())) {
        if (data.website.trim().substring(0,4) !== 'http') {
            userDetails.website = `http://${data.website.trim()}`
        }
        else {
            userDetails.website = data.website
        }
        if (!empty(data.location.trim())) userDetails.location = data.location;

        return userDetails
    
    }
    

}


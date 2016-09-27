//Required Files
var mongoose = require('mongoose');
var M_USER = mongoose.model('CHN_User');
var Messages = require('./../class/CL_Messages').CL_Messages;

//GET - Return all Users in the DB
exports.findAllUsers = function (req, res) {
    M_USER.find(function (err, users) {

        var result = {
            status_code: Messages.Generals.Success.status_code,
            error_code: Messages.Generals.Success.error_code,
            message: Messages.Generals.Success.message,
            is_success: Messages.Generals.Success.is_success,
            users: null
        };

        if (err) {
            result.status_code = Messages.Generals.ServerError.status_code;
            result.error_code = Messages.Generals.ServerError.error_code;
            result.message = err.message;
            result.is_success = Messages.Generals.ServerError.is_success;
        } else if (users.length == 0) {
            result.status_code = Messages.Users.DoesNotExist.status_code;
            result.error_code = Messages.Users.DoesNotExist.error_code;
            result.message = Messages.Users.DoesNotExist.message;
            result.is_success = Messages.Users.DoesNotExist.is_success;
        } else {
            result.users = users;
        }
        res.status(200).jsonp(result);
    });
};

//GET - Return a User with specified ID
exports.findById = function (req, res) {
    M_USER.findById(req.params.id, function (err, user) {
        var result = {
            status_code: Messages.Generals.Success.status_code,
            error_code: Messages.Generals.Success.error_code,
            message: Messages.Generals.Success.message,
            is_success: Messages.Generals.Success.is_success,
            user: null
        };

        if (err) {
            result.status_code = Messages.Generals.ServerError.status_code;
            result.error_code = Messages.Generals.ServerError.error_code;
            result.message = err.message;
            result.is_success = Messages.Generals.ServerError.is_success;
        } else if (user == null) {
            result.status_code = Messages.Users.DoesNotExist.status_code;
            result.error_code = Messages.Users.DoesNotExist.error_code;
            result.message = Messages.Users.DoesNotExist.message;
            result.is_success = Messages.Users.DoesNotExist.is_success;
        } else {
            result.user = user;
        }
        res.status(200).jsonp(result);
    });
};

//POST - Insert a new User in the DB
exports.addUser = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user: null
    };

    var t_user = new M_USER({
        name: req.body.name
        , email: req.body.email
        , gender: req.body.gender
        , birthday: req.body.birthday
        , picture: req.body.picture
        , fb_token: req.body.fb_token
        , date_created: Date.now()
        , location_lat: "0"
        , location_lon: "0"
        , location_north: "0"
        , location_west: "0"
    });

    result = t_user.ValidateModel();

    if (result.is_success) {
        M_USER.find({ email: t_user.email }, function (err, users) {
            if (err) {
                result.status_code = Messages.Generals.ServerError.status_code;
                result.error_code = Messages.Generals.ServerError.error_code;
                result.message = err.message;
                result.is_success = Messages.Generals.ServerError.is_success;
                res.status(200).jsonp(result);
            } else if (users.length == 0) {
                t_user.save(function (err, user) {
                    if (err) {
                        result.status_code = Messages.Generals.ServerError.status_code;
                        result.error_code = Messages.Generals.ServerError.error_code;
                        result.message = err.message;
                        result.is_success = Messages.Generals.ServerError.is_success;
                    } else {
                        result.user = user;
                    }
                    res.status(200).jsonp(result);
                });
            } else {
                result.status_code = Messages.Users.EmailAlreadyExist.status_code;
                result.error_code = Messages.Users.EmailAlreadyExist.error_code;
                result.message = Messages.Users.EmailAlreadyExist.message;
                result.is_success = Messages.Users.EmailAlreadyExist.is_success;
                res.status(200).jsonp(result);
            }
        });

    } else {
        res.status(200).jsonp(result);
    }
};

//PUT - Update user location
exports.updateLocation = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user: null
    };

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el usuario exista
        M_USER.find({ fb_token: req.body.fb_token }, function (err, users) {

            if (err) {
                result.status_code = Messages.Generals.ServerError.status_code;
                result.error_code = Messages.Generals.ServerError.error_code;
                result.message = err.message;
                result.is_success = Messages.Generals.ServerError.is_success;
                res.status(200).jsonp(result);
            } else if (users.length == 0) {
                result.status_code = Messages.Generals.InvalidFbToken.status_code;
                result.error_code = Messages.Generals.InvalidFbToken.error_code;
                result.message = Messages.Generals.InvalidFbToken.message;
                result.is_success = Messages.Generals.InvalidFbToken.is_success;
                res.status(200).jsonp(result);
            } else {

                result = users[0].ValidateLocation(req.body.lat, req.body.lon);

                if (result.is_success) {
                    users[0].location_lat = req.body.lat;
                    users[0].location_lon = req.body.lon;
                    users[0].save(function (err) {
                        if (err) {
                            result.status_code = Messages.Generals.ServerError.status_code;
                            result.error_code = Messages.Generals.ServerError.error_code;
                            result.message = err.message;
                            result.is_success = Messages.Generals.ServerError.is_success;
                        } else {
                            result.user = users[0];
                        }
                        res.status(200).jsonp(result);
                    });
                } else {
                    res.status(200).jsonp(result);
                }
            }
        });
    } else {
        result.status_code = Messages.Generals.EmptyFbToken.status_code;
        result.error_code = Messages.Generals.EmptyFbToken.error_code;
        result.message = Messages.Generals.EmptyFbToken.message;
        result.is_success = Messages.Generals.EmptyFbToken.is_success;
        res.status(200).jsonp(result);
    }
};

//PUT - Update an User already exists
exports.updateUser = function (req, res) {
    M_USER.findById(req.params.id, function (err, user) {

        var result = {
            status_code: Messages.Generals.Success.status_code,
            error_code: Messages.Generals.Success.error_code,
            message: Messages.Generals.Success.message,
            is_success: Messages.Generals.Success.is_success,
            user: null
        };

        if (err) {
            result.status_code = Messages.Generals.ServerError.status_code;
            result.error_code = Messages.Generals.ServerError.error_code;
            result.message = err.message;
            result.is_success = Messages.Generals.ServerError.is_success;
            res.status(200).jsonp(result);
        } else if (user == null) {
            result.status_code = Messages.Users.DoesNotExist.status_code;
            result.error_code = Messages.Users.DoesNotExist.error_code;
            result.message = Messages.Users.DoesNotExist.message;
            result.is_success = Messages.Users.DoesNotExist.is_success;
            res.status(200).jsonp(result);
        } else {
            user.name = req.body.name;
            user.email = req.body.email;
            user.gender = req.body.gender;
            user.birthday = req.body.birthday;
            user.picture = req.body.picture;
            user.fb_token = req.body.fb_token;

            result = user.ValidateModel();

            if (result.is_success) {

                M_USER.find({ email: user.email, _id: { $ne: req.params.id } }, function (err, users) {
                    if (err) {
                        result.status_code = Messages.Generals.ServerError.status_code;
                        result.error_code = Messages.Generals.ServerError.error_code;
                        result.message = err.message;
                        result.is_success = Messages.Generals.ServerError.is_success;
                        res.status(200).jsonp(result);
                    } else if (users.length > 0) {
                        result.status_code = Messages.Users.EmailAlreadyExist.status_code;
                        result.error_code = Messages.Users.EmailAlreadyExist.error_code;
                        result.message = Messages.Users.EmailAlreadyExist.message;
                        result.is_success = Messages.Users.EmailAlreadyExist.is_success;
                        res.status(200).jsonp(result);
                    } else {
                        user.save(function (err) {
                            if (err) {
                                result.status_code = Messages.Generals.ServerError.status_code;
                                result.error_code = Messages.Generals.ServerError.error_code;
                                result.message = err.message;
                                result.is_success = Messages.Generals.ServerError.is_success;
                            } else {
                                result.user = user;
                            }
                            res.status(200).jsonp(result);
                        });
                    }
                });                
            } else {
                res.status(200).jsonp(result);
            }
        }
        
    });
};
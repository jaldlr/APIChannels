//File: controllers/tvshows.js
var mongoose = require('mongoose');
var M_GROUP = mongoose.model('CHN_Group');
var M_USER = mongoose.model('CHN_User');
var Messages = require('./../class/CL_Messages').CL_Messages;

//GET - Return all Groups in the DB
exports.findAllGroups = function (req, res) {

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el usuario que el usuario que se está tratando de salir del grupo exista
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
                M_GROUP.find({ enabled: true })
                    .populate('user_creator')
                    .exec(function (err, groups) {
                        var result = {
                            status_code: Messages.Generals.Success.status_code,
                            error_code: Messages.Generals.Success.error_code,
                            message: Messages.Generals.Success.message,
                            is_success: Messages.Generals.Success.is_success,
                            groups: null
                        };

                        if (err) {
                            result.status_code = Messages.Generals.ServerError.status_code;
                            result.error_code = Messages.Generals.ServerError.error_code;
                            result.message = err.message;
                            result.is_success = Messages.Generals.ServerError.is_success;
                        } else {
                            result.groups = groups;
                        }
                        res.status(200).jsonp(result);
                    });
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

//GET - Return a Group with specified ID
exports.findById = function (req, res) {
    M_GROUP.findById(req.params.id)
        .populate('user_creator')
        .exec(function (err, group) {
            var result = {
                status_code: Messages.Generals.Success.status_code,
                error_code: Messages.Generals.Success.error_code,
                message: Messages.Generals.Success.message,
                is_success: Messages.Generals.Success.is_success,
                group: null
            };

            if (err) {
                result.status_code = Messages.Generals.ServerError.status_code;
                result.error_code = Messages.Generals.ServerError.error_code;
                result.message = err.message;
                result.is_success = Messages.Generals.ServerError.is_success;
            } else if (group == null) {
                result.status_code = Messages.Groups.DoesNotExist.status_code;
                result.error_code = Messages.Groups.DoesNotExist.error_code;
                result.message = Messages.Groups.DoesNotExist.message;
                result.is_success = Messages.Groups.DoesNotExist.is_success;
            } else {
                result.group = group;
            }
            res.status(200).jsonp(result);
        });
};

//POST - Insert a new Group in the DB
exports.addGroup = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        group: null
    };

    var tgroup = new M_GROUP({
        name: req.body.name
        , subname: req.body.subname
        , image: req.body.image
        , adult_audience: req.body.adult_audience
        , enabled: req.body.enabled
        , is_public: req.body.is_public
        , type: req.body.type
        , email_domain: req.body.email_domain
        , certified: req.body.certified
        , user_creator: req.body.user_creator
        , vip_code: req.body.vip_code
    });

    result = tgroup.ValidateModel();

    if (result.is_success) {
        M_GROUP.find({ name: tgroup.name, subname: tgroup.subname }, function (err, groups) {
            if (err) {
                result.status_code = Messages.Generals.ServerError.status_code;
                result.error_code = Messages.Generals.ServerError.error_code;
                result.message = err.message;
                result.is_success = Messages.Generals.ServerError.is_success;
                res.status(200).jsonp(result);
            } else if (groups.length > 0) {
                result.status_code = Messages.Groups.AlreadyExist.status_code;
                result.error_code = Messages.Groups.AlreadyExist.error_code;
                result.message = Messages.Groups.AlreadyExist.message;
                result.is_success = Messages.Groups.AlreadyExist.is_success;
                res.status(200).jsonp(result);
            } else {
                tgroup.save(function (err, group) {
                    if (err) {
                        result.status_code = Messages.Generals.ServerError.status_code;
                        result.error_code = Messages.Generals.ServerError.error_code;
                        result.message = err.message;
                        result.is_success = Messages.Generals.ServerError.is_success;
                    } else {
                        result.group = group;
                    }
                    res.status(200).jsonp(result);
                });
                
            }
        });

    } else {
        res.status(200).jsonp(result);
    }
};

//PUT - Update a Group already exists
exports.updateGroup = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        group: null
    };

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el usuario que el usuario que se está tratando de salir del grupo exista
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
                M_GROUP.findById(req.params.id, function (err, group) {
                    if (err) {
                        result.status_code = Messages.Generals.ServerError.status_code;
                        result.error_code = Messages.Generals.ServerError.error_code;
                        result.message = err.message;
                        result.is_success = Messages.Generals.ServerError.is_success;
                        res.status(200).jsonp(result);
                    } else if (group == null) {
                        result.status_code = Messages.Groups.DoesNotExist.status_code;
                        result.error_code = Messages.Groups.DoesNotExist.error_code;
                        result.message = Messages.Groups.DoesNotExist.message;
                        result.is_success = Messages.Groups.DoesNotExist.is_success;
                        res.status(200).jsonp(result);
                    } else {
                        group.name = req.body.name;
                        group.subname = req.body.subname;
                        group.image = req.body.image;
                        group.adult_audience = req.body.adult_audience;
                        group.enabled = req.body.enabled;
                        group.is_public = req.body.is_public;
                        group.type = req.body.type;
                        group.email_domain = req.body.email_domain;
                        group.certified = req.body.certified;
                        group.vip_code = req.body.vip_code;

                        result = group.ValidateModel();

                        if (result.is_success) {

                            M_GROUP.find({ name: group.name, subname: group.subname, _id: { $ne: req.params.id } }, function (err, groups) {
                                if (err) {
                                    result.status_code = Messages.Generals.ServerError.status_code;
                                    result.error_code = Messages.Generals.ServerError.error_code;
                                    result.message = err.message;
                                    result.is_success = Messages.Generals.ServerError.is_success;
                                    res.status(200).jsonp(result);
                                } else if (groups.length > 0) {
                                    result.status_code = Messages.Groups.AlreadyExist.status_code;
                                    result.error_code = Messages.Groups.AlreadyExist.error_code;
                                    result.message = Messages.Groups.AlreadyExist.message;
                                    result.is_success = Messages.Groups.AlreadyExist.is_success;
                                    res.status(200).jsonp(result);
                                } else {
                                    group.save(function (err) {
                                        if (err) {
                                            result.status_code = Messages.Generals.ServerError.status_code;
                                            result.error_code = Messages.Generals.ServerError.error_code;
                                            result.message = err.message;
                                            result.is_success = Messages.Generals.ServerError.is_success;
                                        } else {
                                            result.group = group;
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
//Required Files
var mongoose = require('mongoose');
var M_USERGROUP = mongoose.model('CHN_UserGroup');
var M_CHANNEL = mongoose.model('CHN_Channel');
var M_USER = mongoose.model('CHN_User');
var M_GROUP = mongoose.model('CHN_Group');
var Messages = require('./../class/CL_Messages').CL_Messages;
var Utilities = require('./../class/CL_Utilities').CL_Utilities;

//POST - Get all UserGroups from DB
exports.findAllUserGroups = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user_groups: null
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
                
                M_USERGROUP.find({})
                    .populate('user_id')
                    .populate('group_id')
                    .exec(function (err, list) {
                        if (err) {
                            result.status_code = Messages.Generals.ServerError.status_code;
                            result.error_code = Messages.Generals.ServerError.error_code;
                            result.message = err.message;
                            result.is_success = Messages.Generals.ServerError.is_success;
                            res.status(200).jsonp(result);
                        } else{
                            result.user_groups = list;
                            res.status(200).jsonp(result);
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

//POST - Insert a new private UserGroup in the DB
exports.addUserToPrivateGroup = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user_group: null
    };

    var t_userGroup = new M_USERGROUP({
        user_id: req.body.user_id
        , group_id: req.body.group_id
        , is_validated: false
    });

    var vip_code = (req.body.vip_code === undefined) ? '' : (req.body.vip_code == null) ? '' : req.body.vip_code;
    var email_domain = (req.body.email_domain === undefined) ? '' : (req.body.email_domain == null) ? '' : req.body.email_domain;

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el usuario que trata de agregar al amigo exista
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

                var host_user = users[0];
                t_userGroup.host_user_id = host_user._id;
                result = t_userGroup.ValidateModel(vip_code, req.body.host_lat, req.body.host_lon);
                
                if (result.is_success) {

                    if (vip_code == '') {//No tiene un código VIP y por lo tanto implican más validaciones

                        //Validamos que el amigo exista en el sistema
                        M_USER.findById(t_userGroup.user_id, function (err, friend_user) {

                            if (err) {
                                result.status_code = Messages.Generals.ServerError.status_code;
                                result.error_code = Messages.Generals.ServerError.error_code;
                                result.message = err.message;
                                result.is_success = Messages.Generals.ServerError.is_success;
                                res.status(200).jsonp(result);
                            } else if (friend_user == null) {
                                result.status_code = Messages.UserPrivateChannels.FriendUserDoesNotExist.status_code;
                                result.error_code = Messages.UserPrivateChannels.FriendUserDoesNotExist.error_code;
                                result.message = Messages.UserPrivateChannels.FriendUserDoesNotExist.message;
                                result.is_success = Messages.UserPrivateChannels.FriendUserDoesNotExist.is_success;
                                res.status(200).jsonp(result);
                            } else {

                                //Validamos que el grupo exista
                                M_GROUP.findById(t_userGroup.group_id, function (err, group) {
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

                                        //Validamos que el usuario que trata de agregar al amigo exista en el grupo
                                        M_USERGROUP.find({ user_id: t_userGroup.host_user_id, group_id: t_userGroup.group_id, is_validated: true }, function (err, host_users) {
                                            if (err) {
                                                result.status_code = Messages.Generals.ServerError.status_code;
                                                result.error_code = Messages.Generals.ServerError.error_code;
                                                result.message = err.message;
                                                result.is_success = Messages.Generals.ServerError.is_success;
                                                res.status(200).jsonp(result);
                                            } else if (host_users.length == 0) {
                                                result.status_code = Messages.UserGroups.AccessDenied.status_code;
                                                result.error_code = Messages.UserGroups.AccessDenied.error_code;
                                                result.message = Messages.UserGroups.AccessDenied.message;
                                                result.is_success = Messages.UserGroups.AccessDenied.is_success;
                                                res.status(200).jsonp(result);
                                            } else {

                                                //validamos que no exista el amigo ya en el grupo, para evitar que se agregue 2 veces
                                                M_USERGROUP.find({ user_id: friend_user._id, group_id: t_userGroup.group_id }, function (err, duplicated_friends) {
                                                    if (err) {
                                                        result.status_code = Messages.Generals.ServerError.status_code;
                                                        result.error_code = Messages.Generals.ServerError.error_code;
                                                        result.message = err.message;
                                                        result.is_success = Messages.Generals.ServerError.is_success;
                                                        res.status(200).jsonp(result);
                                                    } else if (duplicated_friends.length > 0) {
                                                        result.status_code = Messages.UserGroups.AlreadyExist.status_code;
                                                        result.error_code = Messages.UserGroups.AlreadyExist.error_code;
                                                        result.message = Messages.UserGroups.AlreadyExist.message;
                                                        result.is_success = Messages.UserGroups.AlreadyExist.is_success;
                                                        res.status(200).jsonp(result);
                                                    } else {

                                                        //Validamos que el usuario este cerca del que se desea agregar este cerca del host
                                                        if (Utilities.CalcDistance(req.body.host_lat, req.body.host_lon, parseFloat(friend_user.location_lat), parseFloat(friend_user.location_lon)) <= 0.300) {
                                                            
                                                            //Validamos si el grupo solicita dominio de correo
                                                            if (group.email_domain != null && group.email_domain != '') {

                                                                //Validamos si el email_domain fue agregado en el request
                                                                if (email_domain == '') {
                                                                    result.status_code = Messages.UserGroups.RequiredMailDomain.status_code;
                                                                    result.error_code = Messages.UserGroups.RequiredMailDomain.error_code;
                                                                    result.message = Messages.UserGroups.RequiredMailDomain.message;
                                                                    result.is_success = Messages.UserGroups.RequiredMailDomain.is_success;
                                                                    res.status(200).jsonp(result);
                                                                } else if (!Utilities.EmailDomainValidation(group.email_domain, email_domain)) {//Validamos que coincidan los dominios
                                                                    result.status_code = Messages.UserGroups.DomainNamesDontMatch.status_code;
                                                                    result.error_code = Messages.UserGroups.DomainNamesDontMatch.error_code;
                                                                    result.message = Messages.UserGroups.DomainNamesDontMatch.message;
                                                                    result.is_success = Messages.UserGroups.DomainNamesDontMatch.is_success;
                                                                    res.status(200).jsonp(result);
                                                                }
                                                            }

                                                            if (result.is_success) {
                                                                t_userGroup.is_validated = group.is_public;
                                                                t_userGroup.save(function (err, user_group) {
                                                                    if (err) {
                                                                        result.status_code = Messages.Generals.ServerError.status_code;
                                                                        result.error_code = Messages.Generals.ServerError.error_code;
                                                                        result.message = err.message;
                                                                        result.is_success = Messages.Generals.ServerError.is_success;
                                                                    } else {
                                                                        result.user_group = user_group;
                                                                    }
                                                                    res.status(200).jsonp(result);
                                                                });
                                                            }
                                                        } else {
                                                            result.status_code = Messages.UserPrivateChannels.DistantFriend.status_code;
                                                            result.error_code = Messages.UserPrivateChannels.DistantFriend.error_code;
                                                            result.message = Messages.UserPrivateChannels.DistantFriend.message;
                                                            result.is_success = Messages.UserPrivateChannels.DistantFriend.is_success;
                                                            res.status(200).jsonp(result);
                                                        }
                                                    }
                                                });
                                            }
                                        });

                                    }
                                });

                            }
                        });

                    } else {//Si tiene un código VIP y por o tanto no hay que hacer validaciones

                        //Validamos que el usuario no haya sido registrado anteriormente al grupo
                        M_USERGROUP.find({ user_id: t_userGroup.host_user_id, group_id: t_userGroup.group_id }, function (err, user_groups) {
                            if (err) {
                                result.status_code = Messages.Generals.ServerError.status_code;
                                result.error_code = Messages.Generals.ServerError.error_code;
                                result.message = err.message;
                                result.is_success = Messages.Generals.ServerError.is_success;
                                res.status(200).jsonp(result);
                            } else if (user_groups.length > 0) {
                                result.status_code = Messages.UserGroups.AlreadyExist.status_code;
                                result.error_code = Messages.UserGroups.AlreadyExist.error_code;
                                result.message = Messages.UserGroups.AlreadyExist.message;
                                result.is_success = Messages.UserGroups.AlreadyExist.is_success;
                                res.status(200).jsonp(result);
                            } else {
                                //Validamos que el pase VIP realmente exista para el grupo indicado
                                M_GROUP.find({ vip_code: vip_code, _id: t_userGroup.group_id }, function (err, groups) {
                                    if (err) {
                                        result.status_code = Messages.Generals.ServerError.status_code;
                                        result.error_code = Messages.Generals.ServerError.error_code;
                                        result.message = err.message;
                                        result.is_success = Messages.Generals.ServerError.is_success;
                                        res.status(200).jsonp(result);
                                    } else if (groups.length == 0) {
                                        result.status_code = Messages.UserGroups.IncorrectPassVIP.status_code;
                                        result.error_code = Messages.UserGroups.IncorrectPassVIP.error_code;
                                        result.message = Messages.UserGroups.IncorrectPassVIP.message;
                                        result.is_success = Messages.UserGroups.IncorrectPassVIP.is_success;
                                        res.status(200).jsonp(result);
                                    } else {

                                        t_userGroup.is_validated = true;
                                        t_userGroup.save(function (err, user_group) {
                                            if (err) {
                                                result.status_code = Messages.Generals.ServerError.status_code;
                                                result.error_code = Messages.Generals.ServerError.error_code;
                                                result.message = err.message;
                                                result.is_success = Messages.Generals.ServerError.is_success;
                                            } else {
                                                result.privateChannel = user_group;
                                            }
                                            res.status(200).jsonp(result);
                                        });

                                    }
                                });
                            }
                        });
                    }
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

//POST - Insert a new public UserGroup in the DB
exports.addUserToPublicGroup = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user_group: null
    };

    var t_userGroup = new M_USERGROUP({
        group_id: req.body.group_id
        , is_validated: true
    });

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el usuario que está intentando entrar al grupo exista
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

                t_userGroup.user_id = users[0]._id;
                result = t_userGroup.ValidateModel('', '0', '0');

                if (result.is_success) {

                    //Validamos que el grupo exista
                    M_GROUP.findById(t_userGroup.group_id, function (err, group) {
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
                        } else if(!group.is_public){
                            result.status_code = Messages.UserGroups.PrivateGroup.status_code;
                            result.error_code = Messages.UserGroups.PrivateGroup.error_code;
                            result.message = Messages.UserGroups.PrivateGroup.message;
                            result.is_success = Messages.UserGroups.PrivateGroup.is_success;
                            res.status(200).jsonp(result);                        
                        } else {

                            //validamos que no exista el usuario ya en el grupo, para evitar que se agregue 2 veces
                            M_USERGROUP.find({ user_id: t_userGroup.user_id, group_id: t_userGroup.group_id }, function (err, duplicated_friends) {
                                if (err) {
                                    result.status_code = Messages.Generals.ServerError.status_code;
                                    result.error_code = Messages.Generals.ServerError.error_code;
                                    result.message = err.message;
                                    result.is_success = Messages.Generals.ServerError.is_success;
                                    res.status(200).jsonp(result);
                                } else if (duplicated_friends.length > 0) {
                                    result.status_code = Messages.UserGroups.AlreadyExist.status_code;
                                    result.error_code = Messages.UserGroups.AlreadyExist.error_code;
                                    result.message = Messages.UserGroups.AlreadyExist.message;
                                    result.is_success = Messages.UserGroups.AlreadyExist.is_success;
                                    res.status(200).jsonp(result);
                                } else {

                                    t_userGroup.save(function (err, user_group) {
                                        if (err) {
                                            result.status_code = Messages.Generals.ServerError.status_code;
                                            result.error_code = Messages.Generals.ServerError.error_code;
                                            result.message = err.message;
                                            result.is_success = Messages.Generals.ServerError.is_success;
                                        } else {
                                            result.user_group = user_group;
                                        }
                                        res.status(200).jsonp(result);
                                    });
                                }
                            });

                        }
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

//DELETE - Delete an UserGroup with specified ID
exports.deleteUserGroup = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success
    };

    var t_userGroup = new M_USERGROUP({
        group_id: req.body.group_id
    });
    
    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el usuario que se está tratando de salir del grupo exista
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

                t_userGroup.user_id = users[0]._id;
                result = t_userGroup.ValidateModel('', '0', '0');

                if (result.is_success) {

                    M_USERGROUP.find({ group_id: t_userGroup.group_id, user_id: t_userGroup.user_id }, function (err, items) {

                        if (err) {
                            result.status_code = Messages.Generals.ServerError.status_code;
                            result.error_code = Messages.Generals.ServerError.error_code;
                            result.message = err.message;
                            result.is_success = Messages.Generals.ServerError.is_success;
                            res.status(200).jsonp(result);
                        } else if (items.length == 0) {
                            result.status_code = Messages.UserGroups.DetachedGroup.status_code;
                            result.error_code = Messages.UserGroups.DetachedGroup.error_code;
                            result.message = Messages.UserGroups.DetachedGroup.message;
                            result.is_success = Messages.UserGroups.DetachedGroup.is_success;
                            res.status(200).jsonp(result);
                        } else {
                            items[0].remove(function (err) {
                                if (err) {
                                    result.status_code = Messages.Generals.ServerError.status_code;
                                    result.error_code = Messages.Generals.ServerError.error_code;
                                    result.message = err.message;
                                    result.is_success = Messages.Generals.ServerError.is_success;
                                } else {
                                    result.status_code = Messages.UserGroups.DetachedGroup.status_code;
                                    result.error_code = Messages.UserGroups.DetachedGroup.error_code;
                                    result.message = Messages.UserGroups.DetachedGroup.message;
                                    result.is_success = Messages.UserGroups.DetachedGroup.is_success;
                                }
                                res.status(200).jsonp(result);
                            })
                        }
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

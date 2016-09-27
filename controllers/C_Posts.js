//Required Files
var mongoose = require('mongoose');
var M_POST = mongoose.model('CHN_Post');
var M_USERPRIVATECHANNEL = mongoose.model('CHN_UserPrivateChannel');
var M_CHANNEL = mongoose.model('CHN_Channel');
var M_USER = mongoose.model('CHN_User');
var M_GROUP = mongoose.model('CHN_Group');
var M_USERGROUP = mongoose.model('CHN_UserGroup');
var Messages = require('./../class/CL_Messages').CL_Messages;
var Utilities = require('./../class/CL_Utilities').CL_Utilities;

//POST - Insert a new post in the DB
exports.addPost = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        privateChannel: null
    };

    var t_post = new M_POST({
        channel_id: req.body.channel_id
        , lat: req.body.lat
        , lon: req.body.lon
        , description: req.body.description
        , image: req.body.image
    });

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el usuario que trata de agregar el post exista
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

                var user_creator = users[0];
                t_post.user_creator = user_creator._id;

                result = t_post.ValidateModel();
                
                if (result.is_success) {

                    //Validamos que el canal exista
                    M_CHANNEL.findById(t_post.channel_id, function (err, channel) {

                        if (err) {
                            result.status_code = Messages.Generals.ServerError.status_code;
                            result.error_code = Messages.Generals.ServerError.error_code;
                            result.message = err.message;
                            result.is_success = Messages.Generals.ServerError.is_success;
                            res.status(200).jsonp(result);
                        } else if (channel == null) {
                            result.status_code = Messages.Channels.DoesNotExist.status_code;
                            result.error_code = Messages.Channels.DoesNotExist.error_code;
                            result.message = Messages.Channels.DoesNotExist.message;
                            result.is_success = Messages.Channels.DoesNotExist.is_success;
                            res.status(200).jsonp(result);
                        } else {

                            //Revisamos is el canal es privado
                            if (!channel.is_public) {

                                //Validar que el usuario este en el canal
                                M_USERPRIVATECHANNEL.find({}, function (err, p_channels) {
                                    if (err) {
                                        result.status_code = Messages.Generals.ServerError.status_code;
                                        result.error_code = Messages.Generals.ServerError.error_code;
                                        result.message = err.message;
                                        result.is_success = Messages.Generals.ServerError.is_success;
                                        res.status(200).jsonp(result);
                                    } else if (p_channels.length == 0) {
                                        result.status_code = Messages.UserPrivateChannels.UserDoesNotExist.status_code;
                                        result.error_code = Messages.UserPrivateChannels.UserDoesNotExist.error_code;
                                        result.message = Messages.UserPrivateChannels.UserDoesNotExist.message;
                                        result.is_success = Messages.UserPrivateChannels.UserDoesNotExist.is_success;
                                        res.status(200).jsonp(result);
                                    } else {

                                        var p_channel = p_channels[0];
                                        //Validamos que exista el grupo
                                        M_GROUP.findById(p_channel.group_id, function (err, grupo) {
                                            if (err) {
                                                result.status_code = Messages.Generals.ServerError.status_code;
                                                result.error_code = Messages.Generals.ServerError.error_code;
                                                result.message = err.message;
                                                result.is_success = Messages.Generals.ServerError.is_success;
                                                res.status(200).jsonp(result);
                                            } else if (grupo == null) {
                                                result.status_code = Messages.Groups.DoesNotExist.status_code;
                                                result.error_code = Messages.Groups.DoesNotExist.error_code;
                                                result.message = Messages.Groups.DoesNotExist.message;
                                                result.is_success = Messages.Groups.DoesNotExist.is_success;
                                                res.status(200).jsonp(result);
                                            } else {

                                                //Validamos que el usuario tenga validada su cuenta
                                                M_USERGROUP.find({ user_id: t_post.user_creator, is_validated: true, group_id: grupo ._id}, function (err, items) {
                                                    if (err) {
                                                        result.status_code = Messages.Generals.ServerError.status_code;
                                                        result.error_code = Messages.Generals.ServerError.error_code;
                                                        result.message = err.message;
                                                        result.is_success = Messages.Generals.ServerError.is_success;
                                                        res.status(200).jsonp(result);
                                                    } else if (items.length == 0) {
                                                        result.status_code = Messages.UserGroups.AccessDenied.status_code;
                                                        result.error_code = Messages.UserGroups.AccessDenied.error_code;
                                                        result.message = Messages.UserGroups.AccessDenied.message;
                                                        result.is_success = Messages.UserGroups.AccessDenied.is_success;
                                                        res.status(200).jsonp(result);
                                                    } else {

                                                        //Validamos que el canal pertenezca al grupo especificado
                                                        if (!channel.group_id == group._id) {
                                                            result.status_code = Messages.UserPrivateChannels.UnAssignedChannel.status_code;
                                                            result.error_code = Messages.UserPrivateChannels.UnAssignedChannel.error_code;
                                                            result.message = Messages.UserPrivateChannels.UnAssignedChannel.message;
                                                            result.is_success = Messages.UserPrivateChannels.UnAssignedChannel.is_success;
                                                            res.status(200).jsonp(result);
                                                        } else {
                                                            t_post.save(function (err, post) {
                                                                if (err) {
                                                                    result.status_code = Messages.Generals.ServerError.status_code;
                                                                    result.error_code = Messages.Generals.ServerError.error_code;
                                                                    result.message = err.message;
                                                                    result.is_success = Messages.Generals.ServerError.is_success;
                                                                } else {
                                                                    result.post = post;
                                                                }
                                                                res.status(200).jsonp(result);
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                        });

                                    }
                                });

                            } else {
                                t_post.save(function (err, post) {
                                    if (err) {
                                        result.status_code = Messages.Generals.ServerError.status_code;
                                        result.error_code = Messages.Generals.ServerError.error_code;
                                        result.message = err.message;
                                        result.is_success = Messages.Generals.ServerError.is_success;
                                    } else {
                                        result.post = post;
                                    }
                                    res.status(200).jsonp(result);
                                });
                            }

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

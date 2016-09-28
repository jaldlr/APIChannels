//Required Files
var mongoose = require('mongoose');
var M_USERPRIVATECHANNEL = mongoose.model('CHN_UserPrivateChannel');
var M_CHANNEL = mongoose.model('CHN_Channel');
var M_USER = mongoose.model('CHN_User');
var M_GROUP = mongoose.model('CHN_Group');
var M_USERGROUP = mongoose.model('CHN_UserGroup');
var Messages = require('./../class/CL_Messages').CL_Messages;
var Utilities = require('./../class/CL_Utilities').CL_Utilities;

//POST - Insert a new provate channel in the DB
exports.addPrivateChannel = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        private_channel: null
    };

    var t_channel = new M_USERPRIVATECHANNEL({
        group_id: req.body.group_id
        , channel_id: req.body.channel_id
        , user_id: req.body.user_id
        , host_user_id: null
        , is_add_by_system: false
    });

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
                t_channel.host_user_id = host_user._id;

                result = t_channel.ValidateModel(req.body.host_lat, req.body.host_lon);
                
                if (result.is_success) {

                    //Validamos que el amigo exista en el sistema
                    M_USER.findById(t_channel.user_id, function (err, friend_user) {
                        
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
                            M_GROUP.findById(t_channel.group_id, function (err, group) {
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

                                    //Validamos que el usuario que trata de agregar al amigo exista en el grupo del canal y que ya halla validado su cuenta
                                    M_USERGROUP.find({ group_id: group._id, user_id: t_channel.host_user_id, is_validated: true }, function (err, user_hosts) {
                                        if (err) {
                                            result.status_code = Messages.Generals.ServerError.status_code;
                                            result.error_code = Messages.Generals.ServerError.error_code;
                                            result.message = err.message;
                                            result.is_success = Messages.Generals.ServerError.is_success;
                                            res.status(200).jsonp(result);
                                        } else if (user_hosts.length == 0) {
                                            result.status_code = Messages.UserPrivateChannels.HostAccessDenied.status_code;
                                            result.error_code = Messages.UserPrivateChannels.HostAccessDenied.error_code;
                                            result.message = Messages.UserPrivateChannels.HostAccessDenied.message;
                                            result.is_success = Messages.UserPrivateChannels.HostAccessDenied.is_success;
                                            res.status(200).jsonp(result);
                                        } else {

                                            //Validamos que el amigo ya haya sido agregado anteriormente al grupo para poder ser agregado al canal y que haya validado su cuenta
                                            M_USERGROUP.find({ group_id: group._id, user_id: t_channel.user_id, is_validated: true }, function (err, user_friends) {
                                                if (err) {
                                                    result.status_code = Messages.Generals.ServerError.status_code;
                                                    result.error_code = Messages.Generals.ServerError.error_code;
                                                    result.message = err.message;
                                                    result.is_success = Messages.Generals.ServerError.is_success;
                                                    res.status(200).jsonp(result);
                                                } else if (user_friends.length == 0) {
                                                    result.status_code = Messages.UserPrivateChannels.FriendAccessDenied.status_code;
                                                    result.error_code = Messages.UserPrivateChannels.FriendAccessDenied.error_code;
                                                    result.message = Messages.UserPrivateChannels.FriendAccessDenied.message;
                                                    result.is_success = Messages.UserPrivateChannels.FriendAccessDenied.is_success;
                                                    res.status(200).jsonp(result);
                                                } else {
                                                    //Validamos que el canal exista y pertenezca al grupo especificado
                                                    M_CHANNEL.find({ _id: t_channel.channel_id, group_id: t_channel.group_id }, function (err, channels) {

                                                        if (err) {
                                                            result.status_code = Messages.Generals.ServerError.status_code;
                                                            result.error_code = Messages.Generals.ServerError.error_code;
                                                            result.message = err.message;
                                                            result.is_success = Messages.Generals.ServerError.is_success;
                                                            res.status(200).jsonp(result);
                                                        } else if (channels.length == 0) {
                                                            result.status_code = Messages.UserPrivateChannels.UnAssignedChannel.status_code;
                                                            result.error_code = Messages.UserPrivateChannels.UnAssignedChannel.error_code;
                                                            result.message = Messages.UserPrivateChannels.UnAssignedChannel.message;
                                                            result.is_success = Messages.UserPrivateChannels.UnAssignedChannel.is_success;
                                                            res.status(200).jsonp(result);
                                                        } else {

                                                            var channel = channels[0];

                                                            //Validamos que el usuario este cerca del que se desea agregar este cerca del host
                                                            if (Utilities.CalcDistance(req.body.host_lat, req.body.host_lon, parseFloat(friend_user.location_lat), parseFloat(friend_user.location_lon)) <= 0.300) {

                                                                //validamos que no exista el amigo ya en el canal, para evitar que se agregue 2 veces
                                                                M_USERPRIVATECHANNEL.find({ user_id: friend_user._id, channel_id: t_channel.channel_id, group_id: t_channel.group_id }, function (err, duplicated_friends) {
                                                                    if (err) {
                                                                        result.status_code = Messages.Generals.ServerError.status_code;
                                                                        result.error_code = Messages.Generals.ServerError.error_code;
                                                                        result.message = err.message;
                                                                        result.is_success = Messages.Generals.ServerError.is_success;
                                                                        res.status(200).jsonp(result);
                                                                    } else if (duplicated_friends.length > 0) {
                                                                        result.status_code = Messages.UserPrivateChannels.DuplicatedFriend.status_code;
                                                                        result.error_code = Messages.UserPrivateChannels.DuplicatedFriend.error_code;
                                                                        result.message = Messages.UserPrivateChannels.DuplicatedFriend.message;
                                                                        result.is_success = Messages.UserPrivateChannels.DuplicatedFriend.is_success;
                                                                        res.status(200).jsonp(result);
                                                                    } else {

                                                                        //Validamos que no pase el rango de edad y pase el filtro del genero
                                                                        var channel_validation = channel.ValidateFilters(friend_user);
                                                                        if (channel_validation.is_success) {
                                                                            t_channel.save(function (err, private_channel) {
                                                                                if (err) {
                                                                                    result.status_code = Messages.Generals.ServerError.status_code;
                                                                                    result.error_code = Messages.Generals.ServerError.error_code;
                                                                                    result.message = err.message;
                                                                                    result.is_success = Messages.Generals.ServerError.is_success;
                                                                                } else {
                                                                                    result.private_channel = private_channel;
                                                                                }
                                                                                res.status(200).jsonp(result);
                                                                            });

                                                                        } else {
                                                                            result.status_code = channel_validation.status_code;
                                                                            result.error_code = channel_validation.error_code;
                                                                            result.message = channel_validation.message;
                                                                            result.is_success = channel_validation.is_success;
                                                                            res.status(200).jsonp(result);
                                                                        }
                                                                    }
                                                                });

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

//DELETE - Delete a private channel
exports.deletePrivateChannel = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success
    };

    var t_channel = new M_USERPRIVATECHANNEL({
        group_id: req.body.group_id
        , channel_id: req.body.channel_id
        , user_id:null
        , host_user_id: null
    });

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

                t_channel.user_id = users[0]._id;
                t_channel.host_user_id = t_channel.user_id;
                var tmp_result = t_channel.ValidateModel('0', '0');

                //Validamos los datos requeridos
                if (tmp_result.is_success) {

                    //Validamos que el grupo exista
                    M_GROUP.findById(t_channel.group_id, function (err, grupo) {

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

                            //Validamos que el usuario exista en el grupo
                            M_USERGROUP.find({ user_id: t_channel.user_id, group_id : t_channel.group_id}, function (err, items) {
                                if (err) {
                                    result.status_code = Messages.Generals.ServerError.status_code;
                                    result.error_code = Messages.Generals.ServerError.error_code;
                                    result.message = err.message;
                                    result.is_success = Messages.Generals.ServerError.is_success;
                                    res.status(200).jsonp(result);
                                } else if (items.length == 0) {
                                    result.status_code = Messages.UserGroups.UserDoesNotExist.status_code;
                                    result.error_code = Messages.UserGroups.UserDoesNotExist.error_code;
                                    result.message = Messages.UserGroups.UserDoesNotExist.message;
                                    result.is_success = Messages.UserGroups.UserDoesNotExist.is_success;
                                    res.status(200).jsonp(result);
                                } else {

                                    //Validamos que el canal exista
                                    M_CHANNEL.findById(t_channel.channel_id, function (err, channel) {
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

                                            //validamos que el usuario pertenezca al canal
                                            M_USERPRIVATECHANNEL.find({ user_id: t_channel.user_id, channel_id: t_channel.channel_id, group_id : t_channel.group_id}, function (err, items) {
                                                if (err) {
                                                    result.status_code = Messages.Generals.ServerError.status_code;
                                                    result.error_code = Messages.Generals.ServerError.error_code;
                                                    result.message = err.message;
                                                    result.is_success = Messages.Generals.ServerError.is_success;
                                                    res.status(200).jsonp(result);
                                                } else if (items.length == 0) {
                                                    result.status_code = Messages.UserPrivateChannels.UserDoesNotExist.status_code;
                                                    result.error_code = Messages.UserPrivateChannels.UserDoesNotExist.error_code;
                                                    result.message = Messages.UserPrivateChannels.UserDoesNotExist.message;
                                                    result.is_success = Messages.UserPrivateChannels.UserDoesNotExist.is_success;
                                                    res.status(200).jsonp(result);
                                                } else {

                                                    //Borramos el registro del usuario
                                                    items[0].remove(function (err) {
                                                        if (err) {
                                                            result.status_code = Messages.Generals.ServerError.status_code;
                                                            result.error_code = Messages.Generals.ServerError.error_code;
                                                            result.message = err.message;
                                                            result.is_success = Messages.Generals.ServerError.is_success;
                                                            res.status(200).jsonp(result);
                                                        } else {

                                                            result.status_code = Messages.UserPrivateChannels.DetachedChannel.status_code;
                                                            result.error_code = Messages.UserPrivateChannels.DetachedChannel.error_code;
                                                            result.message = Messages.UserPrivateChannels.DetachedChannel.message;
                                                            result.is_success = Messages.UserPrivateChannels.DetachedChannel.is_success;

                                                            //Validamos si el channel se quedó sin usuarios
                                                            M_USERPRIVATECHANNEL.find({ channel_id: t_channel.channel_id, group_id: t_channel.group_id }, function (err, items) {
                                                                if (err) {
                                                                    result.status_code = Messages.Generals.ServerError.status_code;
                                                                    result.error_code = Messages.Generals.ServerError.error_code;
                                                                    result.message = err.message;
                                                                    result.is_success = Messages.Generals.ServerError.is_success;
                                                                    res.status(200).jsonp(result);
                                                                } else if (items.length > 0) {                                                                    
                                                                    res.status(200).jsonp(result);
                                                                } else {
                                                                    //Borramos el channel por que se quedó sin usuarios
                                                                    channel.remove(function (err) {
                                                                        if (err) {
                                                                            result.status_code = Messages.Generals.ServerError.status_code;
                                                                            result.error_code = Messages.Generals.ServerError.error_code;
                                                                            result.message = err.message;
                                                                            result.is_success = Messages.Generals.ServerError.is_success;
                                                                            res.status(200).jsonp(result);
                                                                        } else {
                                                                            res.status(200).jsonp(result);
                                                                        }
                                                                    });
                                                                }
                                                            });
                                                        }
                                                    })

                                                }
                                            });

                                        }
                                    });

                                }
                            });
                        }
                    });

                } else {
                    result.status_code = tmp_result.status_code;
                    result.error_code = tmp_result.error_code;
                    result.message = tmp_result.message;
                    result.is_success = tmp_result.is_success;
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


//Required Files
var mongoose = require('mongoose');
var M_CHANNEL = mongoose.model('CHN_Channel');
var M_USER = mongoose.model('CHN_User');
var M_GROUP = mongoose.model('CHN_Group');
var Messages = require('./../class/CL_Messages').CL_Messages;

//GET - Return all Channels in the DB
exports.findAllChannels = function (req, res) {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        channels: null
    };

    var group_id = (req.body.group_id !== undefined && req.body.group_id != null && req.body.group_id != '') ? req.body.group_id : null;

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        //Validamos que el fb_token pertenezca a un usuario
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

                var condition = {};
                if(group_id != -1){
                    condition = { _id: group_id }
                }

                //Validamos que el grupo exista en caso de que el group_id != -1
                M_GROUP.find(condition, function (err, groups) {
                    if (err) {
                        result.status_code = Messages.Generals.ServerError.status_code;
                        result.error_code = Messages.Generals.ServerError.error_code;
                        result.message = err.message;
                        result.is_success = Messages.Generals.ServerError.is_success;
                        res.status(200).jsonp(result);
                    } else if(group_id != -1 && groups.length == 0) {
                        result.status_code = Messages.Groups.DoesNotExist.status_code;
                        result.error_code = Messages.Groups.DoesNotExist.error_code;
                        result.message = Messages.Groups.DoesNotExist.message;
                        result.is_success = Messages.Groups.DoesNotExist.is_success;
                        res.status(200).jsonp(result);
                    } else {

                        if (group_id != -1) {

                            M_CHANNEL.find({group_id: group_id, is_public: true})
                            .populate('user_creator')
                            .populate('group_id')
                            .exec(function (err, channels) {
                                if (err) {
                                    result.status_code = Messages.Generals.ServerError.status_code;
                                    result.error_code = Messages.Generals.ServerError.error_code;
                                    result.message = err.message;
                                    result.is_success = Messages.Generals.ServerError.is_success;
                                } else {
                                    result.channels = channels;
                                }
                                res.status(200).jsonp(result);
                            });

                        } else {

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

//POST - Insert a new Channel in the DB
exports.addChannel = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        channel: null
    };

    var t_channel = new M_CHANNEL({
         name: req.body.name
        , group_id: req.body.group_id
        , is_public: req.body.is_public
        , filter_age: req.body.filter_age
        , filter_gender: req.body.filter_gender
        , is_default: req.body.is_default
        , life_time: req.body.life_time
        , certified: req.body.certified
        , picture: req.body.picture
    });

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        result = t_channel.ValidateModel();

        if (result.is_success) {

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

                    var user = users[0];
                    t_channel.user_creator = user._id;

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

                            M_CHANNEL.find({ name: t_channel.name }, function (err, channels) {

                                if (err) {
                                    result.status_code = Messages.Generals.ServerError.status_code;
                                    result.error_code = Messages.Generals.ServerError.error_code;
                                    result.message = err.message;
                                    result.is_success = Messages.Generals.ServerError.is_success;
                                    res.status(200).jsonp(result);
                                } else if (channels.length > 0) {
                                    result.status_code = Messages.Channels.AlreadyExist.status_code;
                                    result.error_code = Messages.Channels.AlreadyExist.error_code;
                                    result.message = Messages.Channels.AlreadyExist.message;
                                    result.is_success = Messages.Channels.AlreadyExist.is_success;
                                    res.status(200).jsonp(result);
                                } else {

                                    result = t_channel.ValidateFilters(user);

                                    if (result.is_success) {
                                        t_channel.save(function (err, channel) {
                                            if (err) {
                                                result.status_code = Messages.Generals.ServerError.status_code;
                                                result.error_code = Messages.Generals.ServerError.error_code;
                                                result.message = err.message;
                                                result.is_success = Messages.Generals.ServerError.is_success;
                                            } else {
                                                result.channel = channel;
                                            }
                                            res.status(200).jsonp(result);
                                        });
                                    } else {
                                        res.status(200).jsonp(result);
                                    }
                                }
                            });
                        }
                    });
                }
            });

        } else {
            res.status(200).jsonp(result);
        }
    } else {
        result.status_code = Messages.Generals.EmptyFbToken.status_code;
        result.error_code = Messages.Generals.EmptyFbToken.error_code;
        result.message = Messages.Generals.EmptyFbToken.message;
        result.is_success = Messages.Generals.EmptyFbToken.is_success;
        res.status(200).jsonp(result);
    }
};

//PUT - Update a Channel already exists
exports.updateChannel = function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        channel: null
    };

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        if (req.params.id !== undefined && req.params.id != null && req.params.id != '') {

            var t_channel = new M_CHANNEL({
                _id: req.params.id,
                name: req.body.name
            });

            //Validamos que el usuario que esta tratando de eliminar el grupo exista
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

                    t_channel.user_creator = users[0]._id;

                    //Validamos que el canal especificado exista
                    M_CHANNEL.find({ user_creator: t_channel.user_creator, _id: t_channel._id }, function (err, channels) {

                        if (err) {
                            result.status_code = Messages.Generals.ServerError.status_code;
                            result.error_code = Messages.Generals.ServerError.error_code;
                            result.message = err.message;
                            result.is_success = Messages.Generals.ServerError.is_success;
                            res.status(200).jsonp(result);
                        } else if (channels.length == 0) {
                            result.status_code = Messages.Channels.AccessDenied.status_code;
                            result.error_code = Messages.Channels.AccessDenied.error_code;
                            result.message = Messages.Channels.AccessDenied.message;
                            result.is_success = Messages.Channels.AccessDenied.is_success;
                            res.status(200).jsonp(result);
                        } else {
                            //Actualizamos el channel
                            channel = channels[0];
                            channel.name = req.body.name;

                            result = channel.ValidateModel();

                            if (result.is_success) {

                                M_CHANNEL.find({ name: channel.name, subname: channel.subname, _id: { $ne: req.params.id } }, function (err, channels) {
                                    if (err) {
                                        result.status_code = Messages.Generals.ServerError.status_code;
                                        result.error_code = Messages.Generals.ServerError.error_code;
                                        result.message = err.message;
                                        result.is_success = Messages.Generals.ServerError.is_success;
                                        res.status(200).jsonp(result);
                                    } else if (channels.length > 0) {
                                        result.status_code = Messages.Channels.AlreadyExist.status_code;
                                        result.error_code = Messages.Channels.AlreadyExist.error_code;
                                        result.message = Messages.Channels.AlreadyExist.message;
                                        result.is_success = Messages.Channels.AlreadyExist.is_success;
                                        res.status(200).jsonp(result);
                                    } else {
                                        channel.save(function (err) {
                                            if (err) {
                                                result.status_code = Messages.Generals.ServerError.status_code;
                                                result.error_code = Messages.Generals.ServerError.error_code;
                                                result.message = err.message;
                                                result.is_success = Messages.Generals.ServerError.is_success;
                                            } else {
                                                result.channel = channel;
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

            result.error_code = Messages.Channels.EmptyFields.status_code;
            result.error_code = Messages.Channels.EmptyFields.error_code;
            result.message = Messages.Channels.EmptyFields.message.replace('{FIELDS}', 'id');
            result.is_success = Messages.Channels.EmptyFields.is_success;
            res.status(200).jsonp(result);

        }

    } else {
        result.status_code = Messages.Generals.EmptyFbToken.status_code;
        result.error_code = Messages.Generals.EmptyFbToken.error_code;
        result.message = Messages.Generals.EmptyFbToken.message;
        result.is_success = Messages.Generals.EmptyFbToken.is_success;
        res.status(200).jsonp(result);
    }
};

//DELETE - Delete a Channel with specified ID and user_creatorID
exports.deleteChannel= function (req, res) {

    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success
    };

    if (req.body.fb_token !== undefined && req.body.fb_token != null && req.body.fb_token != '') {

        if (req.body.channel_id !== undefined && req.body.channel_id != null && req.body.channel_id != '') {

            var t_channel = new M_CHANNEL({
                _id: req.body.channel_id
            });

            //Validamos que el usuario que esta tratando de eliminar el grupo exista
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

                    t_channel.user_creator = users[0]._id;

                    //Validamos que el canal especificado exista
                    M_CHANNEL.find({ user_creator: t_channel.user_creator, _id: t_channel._id }, function (err, channels) {

                        if (err) {
                            result.status_code = Messages.Generals.ServerError.status_code;
                            result.error_code = Messages.Generals.ServerError.error_code;
                            result.message = err.message;
                            result.is_success = Messages.Generals.ServerError.is_success;
                            res.status(200).jsonp(result);
                        } else if (channels.length == 0) {
                            result.status_code = Messages.Channels.DoesNotExist.status_code;
                            result.error_code = Messages.Channels.DoesNotExist.error_code;
                            result.message = Messages.Channels.DoesNotExist.message;
                            result.is_success = Messages.Channels.DoesNotExist.is_success;
                            res.status(200).jsonp(result);
                        } else {
                            //Removemos el channel
                            channels[0].remove(function (err) {
                                if (err) {
                                    result.status_code = Messages.Generals.ServerError.status_code;
                                    result.error_code = Messages.Generals.ServerError.error_code;
                                    result.message = err.message;
                                    result.is_success = Messages.Generals.ServerError.is_success;
                                } else {
                                    result.status_code = Messages.Channels.RemovedSuccess.status_code;
                                    result.error_code = Messages.Channels.RemovedSuccess.error_code;
                                    result.message = Messages.Channels.RemovedSuccess.message;
                                    result.is_success = Messages.Channels.RemovedSuccess.is_success;
                                }
                                res.status(200).jsonp(result);
                            })
                        }
                    });
                }
            });

        } else {

            result.error_code = Messages.Channels.EmptyFields.status_code;
            result.error_code = Messages.Channels.EmptyFields.error_code;
            result.message = Messages.Channels.EmptyFields.message.replace('{FIELDS}', 'channel_id');
            result.is_success = Messages.Channels.EmptyFields.is_success;
            res.status(200).jsonp(result);

        }

    } else {
        result.status_code = Messages.Generals.EmptyFbToken.status_code;
        result.error_code = Messages.Generals.EmptyFbToken.error_code;
        result.message = Messages.Generals.EmptyFbToken.message;
        result.is_success = Messages.Generals.EmptyFbToken.is_success;
        res.status(200).jsonp(result);
    }
};
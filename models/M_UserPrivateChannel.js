// JavaScript source code
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Messages = require('./../class/CL_Messages').CL_Messages;
var Utilities = require('./../class/CL_Utilities').CL_Utilities;

var userPrivateChannelSchema = new Schema({
    group_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_Group' }]
    , channel_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_Channel' }]
    , user_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_User' }]
    , host_user_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_User' }]
    , is_add_by_system: { type: Boolean }
});

userPrivateChannelSchema.methods.ValidateModel = function (host_lat, host_lon) {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        privateChannel: null
    };

    try {
        var fields = '';

        if (this.group_id == null) {
            fields = 'group_id';
        }
        if (this.channel_id == null) {
            if (fields != '')
                fields += ', ';
            fields += 'channel_id';
        }
        if (this.user_id == null) {
            if (fields != '')
                fields += ', ';
            fields += 'user_id';
        }
        if (this.host_user_id == null) {
            if (fields != '')
                fields += ', ';
            fields += 'host_user_id';
        }
        if (host_lat == null) {
            if (fields != '')
                fields += ', ';
            fields += 'host_lat';
        }
        if (host_lon == null) {
            if (fields != '')
                fields += ', ';
            fields += 'host_lon';
        }
        
        if (fields != '') {
            result.status_code = Messages.UserPrivateChannels.EmptyFields.status_code;
            result.error_code = Messages.UserPrivateChannels.EmptyFields.error_code;
            result.message = Messages.UserPrivateChannels.EmptyFields.message.replace('{FIELDS}', fields);
            result.is_success = Messages.UserPrivateChannels.EmptyFields.is_success;
        }
    }
    catch (err) {
        result.status_code = Messages.Generals.ServerError.status_code;
        result.error_code = Messages.Generals.ServerError.error_code;
        result.message = err.message;
        result.is_success = Messages.Generals.ServerError.is_success;
    }

    return result;
}

module.exports = mongoose.model('CHN_UserPrivateChannel', userPrivateChannelSchema);
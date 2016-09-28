// JavaScript source code
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Messages = require('./../class/CL_Messages').CL_Messages;
var Utilities = require('./../class/CL_Utilities').CL_Utilities;

var userGroupSchema = new Schema({
    user_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_User' }]
    ,group_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_Group' }]
    ,is_validated: { type: Boolean }
});

userGroupSchema.methods.ValidateModel = function (vip_code, host_lat, host_lon) {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user_group: null
    };

    vip_code = (vip_code == null) ? '' : vip_code;

    try {
        var fields = '';

        if (this.group_id == null) {
            fields = 'group_id';
        }

        if (vip_code == '') {
            if (this.user_id == null) {
                if (fields != '')
                    fields += ', ';
                fields += 'user_id';
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
        }
        
        if (fields != '') {
            result.status_code = Messages.UserGroups.EmptyFields.status_code;
            result.error_code = Messages.UserGroups.EmptyFields.error_code;
            result.message = Messages.UserGroups.EmptyFields.message.replace('{FIELDS}', fields);
            result.is_success = Messages.UserGroups.EmptyFields.is_success;
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

module.exports = mongoose.model('CHN_UserGroup', userGroupSchema);
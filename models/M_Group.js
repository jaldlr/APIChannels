// JavaScript source code
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Messages = require('./../class/CL_Messages').CL_Messages;

var groupSchema = new Schema({
    name: { type: String }
    , subname: { type: String }
    , image: { type: String }
    , adult_audience: { type: Boolean }
    , enabled: { type: Boolean }
    , is_public: { type: Boolean }
    , "type": { type: Number }
    , email_domain: { type: String }
    , certified: { type: Boolean }
    , user_creator: [{ type: Schema.Types.ObjectId, ref: 'CHN_User' }]
    , vip_code: { type: String }
});

groupSchema.methods.ValidateModel = function () {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        group: null
    };

    try {
        var fields = '';
        if (this.name == null || (this.name != null && this.name.trim() == '')) {
            fields = 'name';
        }
        if (this.subname == null || (this.subname != null && this.subname.trim() == '')) {
            if (fields != '')
                fields += ', ';
            fields += 'subname';
        }
        if (this.user_creator == null) {
            if (fields != '')
                fields += ', ';
            fields += 'user_creator';
        }

        if (fields != '') {
            result.status_code = Messages.Groups.EmptyFields.status_code;
            result.error_code = Messages.Groups.EmptyFields.error_code;
            result.message = Messages.Groups.EmptyFields.message.replace('{FIELDS}', fields);
            result.is_success = Messages.Groups.EmptyFields.is_success;
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

module.exports = mongoose.model('CHN_Group', groupSchema);
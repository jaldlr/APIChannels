// JavaScript source code
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Messages = require('./../class/CL_Messages').CL_Messages;

var postSchema = new Schema({
    user_creator: [{ type: Schema.Types.ObjectId, ref: 'CHN_User' }]
    , channel_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_Channel' }]
    , lat: { type: String }
    , lon: { type: String }
    , description: { type: String }
    , image: { type: String }
    , date_created: { type: Date, default: Date.now }
});

postSchema.methods.ValidateModel = function () {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        post: null
    };

    try {
        var fields = '';
        if (this.channel_id == null || (this.channel_id != null && this.nachannel_idme == '')) {
            fields = 'channel_id';
        }
        if (this.lat == null || (this.lat != null && this.lat == '')) {
            fields = 'lat';
        }
        if (this.lon == null || (this.lon != null && this.lon == '')) {
            fields = 'lon';
        }
        if (this.description == null || (this.description != null && this.description == '')) {
            fields = 'description';
        }

        if (fields != '') {
            result.status_code = Messages.Posts.EmptyFields.status_code;
            result.error_code = Messages.Posts.EmptyFields.error_code;
            result.message = Messages.Posts.EmptyFields.message.replace('{FIELDS}', fields);
            result.is_success = Messages.Posts.EmptyFields.is_success;
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

module.exports = mongoose.model('CHN_Post', postSchema);
// JavaScript source code
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Messages = require('./../class/CL_Messages').CL_Messages;
var Utilities = require('./../class/CL_Utilities').CL_Utilities;

var channelSchema = new Schema({
    user_creator: [{ type: Schema.Types.ObjectId, ref: 'CHN_User' }]
    , name: { type: String }
    , group_id: [{ type: Schema.Types.ObjectId, ref: 'CHN_Group' }]
    , is_public: { type: Boolean }
    , filter_age: { type: Number }
    , filter_gender: { type: Number }
    , is_default: { type: Boolean }
    , life_time: { type: Number }
    , create_time: { type: Date, default: Date.now }
    , picture: { type: String }
});

channelSchema.methods.ValidateModel = function () {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        channel: null
    };

    if (this.filter_age == null){
        this.filter_age = -1;
    }
    if (this.filter_gender == null){
       this.filter_gender = -1;
    }

    try {
        var fields = '';
        if (this.name == null || (this.name != null && this.name.trim() == '')) {
            fields = 'name';
        }
        if (this.group_id == null) {
            if (fields != '')
                fields += ', ';
            fields += 'group_id';
        }
        if (this.is_public == null) {
            if (fields != '')
                fields += ', ';
            fields += 'is_public';
        }
        if (this.life_time == null) {
            if (fields != '')
                fields += ', ';
            fields += 'life_time';
        }

        if (fields != '') {
            result.error_code = Messages.Channels.EmptyFields.status_code;
            result.error_code = Messages.Channels.EmptyFields.error_code;
            result.message = Messages.Channels.EmptyFields.message.replace('{FIELDS}', fields);
            result.is_success = Messages.Channels.EmptyFields.is_success;
        }
    }
    catch (err) {
        result.error_code = Messages.Generals.ServerError.status_code;
        result.error_code = Messages.Generals.ServerError.error_code;
        result.message = Messages.Generals.ServerError.message;
        result.is_success = Messages.Generals.ServerError.is_success;
    }

    return result;
}

channelSchema.methods.ValidateFilters = function (user) {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user: null
    };

    try {
        if (this.filter_age != -1 && (user.birthday == null || Utilities.CalculateAge(user.birthday) < this.filter_age)) {
            result.status_code = Messages.Channels.MinumunAge.status_code;
            result.error_code = Messages.Channels.MinumunAge.error_code;
            result.message = Messages.Channels.MinumunAge.message.replace('{AGE}', this.filter_age);
            result.is_success = Messages.Channels.MinumunAge.is_success;
        } else if (this.filter_gender != -1 && this.filter_gender != user.gender) {
            result.status_code = Messages.Channels.SpecificGender.status_code;
            result.error_code = Messages.Channels.SpecificGender.error_code;
            result.message = Messages.Channels.SpecificGender.message.replace('{GENDER}', (this.filter_gender == 0 ? "Men" : "Women"));;
            result.is_success = Messages.Channels.SpecificGender.is_success;
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

module.exports = mongoose.model('CHN_Channel', channelSchema);
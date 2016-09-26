// JavaScript source code
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Messages = require('./../class/CL_Messages').CL_Messages;

var userSchema = new Schema({
    name: { type: String }
    , email: { type: String }
    , gender: { type: Number }
    , birthday: { type: Date }
    , picture: { type: String }
    , fb_token: { type: String }
    , date_created: { type: Date, default: Date.now }
    , location_lat: { type: String }
    , location_lon: { type: String }
    , location_north: { type: String }
    , location_west: { type: String }
});

userSchema.methods.ValidateModel = function () {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user: null
    };

    try {
        var fields = '';
        if (this.name == null || (this.name != null && this.name.trim() == '')) {
            fields = 'name';
        }
        if (this.email == null || (this.email != null && this.email.trim() == '')) {
            if (fields != '')
                fields += ', ';
            fields += 'email';
        }
        if (this.gender == null) {
            if (fields != '')
                fields += ', ';
            fields += 'gender';
        }
        if (this.birthday == null) {
            if (fields != '')
                fields += ', ';
            fields += 'birthday';
        }
        if (this.fb_token == null || (this.fb_token != null && this.fb_token.trim() == '')) {
            if (fields != '')
                fields += ', ';
            fields += 'fb_token';
        }

        if (fields != '') {
            result.status_code = Messages.Users.EmptyFields.status_code;
            result.error_code = Messages.Users.EmptyFields.error_code;
            result.message = Messages.Users.EmptyFields.message.replace('{FIELDS}', fields);
            result.is_success = Messages.Users.EmptyFields.is_success;
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

userSchema.methods.ValidateLocation = function (lat, lon) {
    var result = {
        status_code: Messages.Generals.Success.status_code,
        error_code: Messages.Generals.Success.error_code,
        message: Messages.Generals.Success.message,
        is_success: Messages.Generals.Success.is_success,
        user: null
    };

    try {
        var fields = '';
        lat = (lat === undefined) ? null : lat + '';
        lon = (lon === undefined) ? null : lon + '';

        if (lat == null || (lat != null && lat.trim() == '')) {
            fields = 'lat';
        }
        if (lon == null || (lon != null && lon.trim() == '')) {
            if (fields != '')
                fields += ', ';
            fields += 'lon';
        }

        if (fields != '') {
            result.status_code = Messages.Users.EmptyFields.status_code;
            result.error_code = Messages.Users.EmptyFields.error_code;
            result.message = Messages.Users.EmptyFields.message.replace('{FIELDS}', fields);
            result.is_success = Messages.Users.EmptyFields.is_success;
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

module.exports = mongoose.model('CHN_User', userSchema);
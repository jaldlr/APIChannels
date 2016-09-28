var CL_Utilities = new Object();

CL_Utilities.CalculateAge = function(birthday) { // birthday is a date
    var ageDifMs = Date.now() - birthday.getTime();
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};


CL_Utilities.CalcDistance = function (lat1, lon1, lat2, lon2) { //lat1 DECIMAL(10,6), long1 DECIMAL(10,6), lat2 DECIMAL(10,6), long2 DECIMAL(10,6)
    var result = (6353 * 2 * Math.asin(Math.sqrt(
	    Math.pow(Math.asin((lat1 - Math.abs(lat2)) * Math.PI / 180 / 2), 2) +
	    (
		    Math.cos(lat1 * Math.PI / 180) *
		    Math.cos(Math.abs(lat2) * Math.PI / 180) *
		    Math.pow(Math.sin((lon1 - lon2) * Math.PI / 180 / 2), 2)
	    )
    )));

    return result;
};

//PARAM emailDomain
//  TYPE: STRING
//  Examples: 
//       @hotmail.com
//       @gmail.com
//       @smarttie.io
//PARAM emailToValid
//  TYPE: STRING
//  Examples: 
//       jorge@hotmail.com
//       jorge@gmail.com
//       jorge@smarttie.io
CL_Utilities.EmailDomainValidation = function (emailDomain, emailToValid) { 
    
    if (emailDomain == null)
        emailDomain = '';
    if (emailToValid == null)
        emailToValid = '';

    emailDomain = emailDomain.trim().toLowerCase();
    emailToValid = emailToValid.trim().toLowerCase();

    return emailToValid.endsWith(emailDomain);
};

exports.CL_Utilities = CL_Utilities;

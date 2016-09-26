var CL_Messages = new Object();

CL_Messages.Generals = {
    Success: {
        status_code: 200,
        error_code: -1,
        message: "success",
        is_success: true
    },
    ServerError: {
        status_code: 500,
        error_code: 0,
        message: "Server error",
        is_success: false
    },
    EmptyFbToken: {
        status_code: 200,
        error_code: 1,
        message: "fb_token is required",
        is_success: false
    },
    InvalidFbToken: {
        status_code: 200,
        error_code: 2,
        message: "Invalid FB Token",
        is_success: false
    }
};

CL_Messages.Users = {
    EmptyFields: {
        status_code: 200,
        error_code: 100,
        message: "These fields are required: ({FIELDS}).",
        is_success: false
    },
    EmailAlreadyExist: {
        status_code: 200,
        error_code: 101,
        message: "This email already exist.",
        is_success: false
    },
    DoesNotExist: {
        status_code: 200,
        error_code: 102,
        message: "This user doesn't exist.",
        is_success: false
    }
};

CL_Messages.Groups = {
    EmptyFields: {
        status_code: 200,
        error_code: 200,
        message: "These fields are required: ({FIELDS}).",
        is_success: false
    },
    AlreadyExist: {
        status_code: 200,
        error_code: 201,
        message: "This group already exist.",
        is_success: false
    },
    DoesNotExist: {
        status_code: 200,
        error_code: 202,
        message: "This group doesn't exist.",
        is_success: false
    }
};

CL_Messages.Channels = {
    EmptyFields: {
        status_code: 200,
        error_code: 300,
        message: "These fields are required: ({FIELDS}).",
        is_success: false
    },
    AlreadyExist: {
        status_code: 200,
        error_code: 301,
        message: "This channel already exist.",
        is_success: false
    },
    DoesNotExist: {
        status_code: 200,
        error_code: 302,
        message: "This channel doesn't exist.",
        is_success: false
    },
    MinumunAge: {
        status_code: 200,
        error_code: 303,
        message: "Does not meet the minimum age of {AGE}.",
        is_success: false
    },
    SpecificGender: {
        status_code: 200,
        error_code: 303,
        message: "You can not add the user , the channel only allows {GENDER}.",
        is_success: false
    },
    RemovedSuccess: {
        status_code: 200,
        error_code: 304,
        message: "The channel was removed successfully.",
        is_success: true
    },
    AccessDenied: {
        status_code: 200,
        error_code: 305,
        message: "There is no specified channel or do not have permission to modify.",
        is_success: false
    }
};

CL_Messages.UserPrivateChannels = {
    EmptyFields: {
        status_code: 200,
        error_code: 400,
        message: "These fields are required: ({FIELDS}).",
        is_success: false
    },
    AlreadyExist: {
        status_code: 200,
        error_code: 401,
        message: "This record already exist.",
        is_success: false
    },
    DoesNotExist: {
        status_code: 200,
        error_code: 402,
        message: "This record doesn't exist.",
        is_success: false
    },
    FriendUserDoesNotExist: {
        status_code: 200,
        error_code: 403,
        message: "The friend user doesn't exist.",
        is_success: false
    },
    UnAssignedChannel: {
        status_code: 200,
        error_code: 404,
        message: "This channel has not been assigned to this group.",
        is_success: false
    },
    DistantFriend: {
        status_code: 200,
        error_code: 405,
        message: "Remember that you can only add close friends.",
        is_success: false
    },
    DuplicatedFriend: {
        status_code: 200,
        error_code: 406,
        message: "The user has already been previously added.",
        is_success: false
    },
    HostAccessDenied: {
        status_code: 200,
        error_code: 407,
        message: "The user does not have permission to add people to this channel , does not belong to this group has not validated or access.",
        is_success: false
    },
    FriendAccessDenied: {
        status_code: 200,
        error_code: 408,
        message: "The guest does not belong to the group or has not validated their access to group.",
        is_success: false
    },
    UserDoesNotExist: {
        status_code: 200,
        error_code: 409,
        message: "This user doesn't exist in this channel.",
        is_success: false
    },
    DetachedChannel: {
        status_code: 200,
        error_code: 410,
        message: "Channel successfully detached.",
        is_success: true
    }
};

CL_Messages.UserGroups = {
    EmptyFields: {
        status_code: 200,
        error_code: 500,
        message: "These fields are required: ({FIELDS}).",
        is_success: false
    },
    AlreadyExist: {
        status_code: 200,
        error_code: 501,
        message: "This user already exist in this group.",
        is_success: false
    },
    DoesNotExist: {
        status_code: 200,
        error_code: 502,
        message: "This record doesn't exist.",
        is_success: false
    },
    IncorrectPassVIP: {
        status_code: 200,
        error_code: 503,
        message: "It seems that your pass is not VIP.",
        is_success: false
    },
    AccessDenied: {
        status_code: 200,
        error_code: 504,
        message: "The user does not have permission to add people to this channel , does not belong to this group has not validated or access.",
        is_success: false
    },
    RequiredMailDomain: {
        status_code: 200,
        error_code: 505,
        message: "This group requires a mail domain.",
        is_success: false
    },
    DomainNamesDontMatch: {
        status_code: 200,
        error_code: 506,
        message: "Domain names do not match.",
        is_success: false
    },
    DetachedGroup: {
        status_code: 200,
        error_code: 507,
        message: "User Group successfully detached.",
        is_success: true
    },
    PrivateGroup: {
        status_code: 200,
        error_code: 508,
        message: "This is a private group.",
        is_success: true
    },
    UserDoesNotExist: {
        status_code: 200,
        error_code: 509,
        message: "This user doesn't exist in this group.",
        is_success: false
    }
};

CL_Messages.Posts = {
    EmptyFields: {
        status_code: 200,
        error_code: 600,
        message: "These fields are required: ({FIELDS}).",
        is_success: false
    },
    AlreadyExist: {
        status_code: 200,
        error_code: 601,
        message: "This post already exist.",
        is_success: false
    },
    DoesNotExist: {
        status_code: 200,
        error_code: 602,
        message: "This post doesn't exist.",
        is_success: false
    }
};

exports.CL_Messages = CL_Messages;

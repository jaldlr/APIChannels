var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    mongoose = require('mongoose');

// Connection to DB MONGODB
mongoose.connect('mongodb://localhost/channels', function (err, res) {
    if (err) throw err;
    console.log('Connected to Database');
});

// Middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());

// Import Models
var ModUser = require('./models/M_User')(app, mongoose);
var ModGroup = require('./models/M_Group')(app, mongoose);
var ModChannel = require('./models/M_Channel')(app, mongoose);
var ModUserPrivateChannel = require('./models/M_UserPrivateChannel')(app, mongoose);
var ModUserGroup = require('./models/M_UserGroup')(app, mongoose);
var ModPost = require('./models/M_Post')(app, mongoose);

// Import Controllers
var CtrlUser = require('./controllers/C_Users');
var CtrlGroup = require('./controllers/C_Groups');
var CtrlChannel = require('./controllers/C_Channels');
var CtrlUserPrivateChannel = require('./controllers/C_UserPrivateChannels');
var CtrlUserGroup = require('./controllers/C_UserGroups');
var CtrlUserPost= require('./controllers/C_Posts');


// Example Route
var router = express.Router();
router.get('/', function (req, res) {
    res.send("This action is not enabled");
});
app.use(router);

// API routes
var ApiChannels = express.Router();

//USERS
ApiChannels.route('/users/getAll').get(CtrlUser.findAllUsers)
ApiChannels.route('/users/add').post(CtrlUser.addUser);
ApiChannels.route('/users/get/:id').get(CtrlUser.findById)
ApiChannels.route('/users/update/:id').put(CtrlUser.updateUser)
ApiChannels.route('/users/updateLocation/').put(CtrlUser.updateLocation)

//GROUPS
ApiChannels.route('/groups/getAll').post(CtrlGroup.findAllGroups)
ApiChannels.route('/groups/add').post(CtrlGroup.addGroup);
ApiChannels.route('/groups/get/:id').get(CtrlGroup.findById)
ApiChannels.route('/groups/update/:id').put(CtrlGroup.updateGroup)

//CHANNELS
ApiChannels.route('/channels/getAll').post(CtrlChannel.findAllChannels);
ApiChannels.route('/channels/add').post(CtrlChannel.addChannel);
ApiChannels.route('/channels/update/:id').put(CtrlChannel.updateChannel)
ApiChannels.route('/channels/delete').delete(CtrlChannel.deleteChannel);

//USERPRIVATECHANNELS
ApiChannels.route('/userprivatechannels/add').post(CtrlUserPrivateChannel.addPrivateChannel);
ApiChannels.route('/userprivatechannels/delete').delete(CtrlUserPrivateChannel.deletePrivateChannel);

//USERGROUPS
ApiChannels.route('/usergroups/getAll').post(CtrlUserGroup.findAllUserGroups);
ApiChannels.route('/usergroups/addToPrivateGroup').post(CtrlUserGroup.addUserToPrivateGroup);
ApiChannels.route('/usergroups/addToPublicGroup').post(CtrlUserGroup.addUserToPublicGroup);
ApiChannels.route('/usergroups/delete').delete(CtrlUserGroup.deleteUserGroup);

//POSTS
ApiChannels.route('/posts/add').post(CtrlUserPost.addPost);

app.use('/api', ApiChannels);

// Start server
app.listen(3000, function () {
    console.log("Node server running on http://localhost:3000");
});
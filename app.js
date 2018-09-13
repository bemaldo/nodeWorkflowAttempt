var express = require('express'),
mongoose = require('mongoose'),
methodOverride = require("method-override"),
bodyParser = require('body-parser'),
expressSanitizer = require("express-sanitizer"),
schedule = require('node-schedule'),
app = express();

//APP CONFIG
//mongoose.connect('mongodb://localhost/restful_blog_app');
mongoose.connect('mongodb://localhost/workflow_app');
app.set('view engine', 'ejs');
app.use(express.static('public'));//serves custom stylesheet
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());//needs to go after body parser

//MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now}
});
var Blog = mongoose.model("Blog", blogSchema);

/*
var stageSchema = new mongoose.Schema({
	project: String,
	type: String,
	dueData: {type: Date},
	Participants: String,
	Description: String,
	numOfParticipants: Number,
	particpantCompletionList: String,
	stageStatus: String,//(Active, Inactive, Completed)
	nextStage:  [{type: mongoose.Schema.ObjectId, ref: "Stage"}]//mongoose.Schema.ObjectId
});
var workFlowStage = mongoose.model("Stage", stageSchema);

var workflowSchema = new mongoose.Schema({
	title:String,
	description: String,
	document: String,
	stages: [stageSchema],
	activeStage: stageSchema//mongoose.Schema.ObjectId
});
var Workflow = mongoose.model("Workflow", workflowSchema);


*/

/*
var workflowSchema = new mongoose.Schema({
	title: String,
	description: String,
	activeStage: Stage_id
	_id (provided by mongoose)
});
/*
var workFlow = mongoose.model("WorkFlow", workflowSchema);

var stageSchema = new mongoose.Schema({
	project: String,
	type: string,
	dueDate: {type: Date},
	Participants: String
	Description: String,
	numOfParticipants: number (int?)
	participantCompletionList: string (incomplete, complete),
	stageStatus: string (Active, Inactive, Completed)
	nextStage: nextStage_id
});//compate participantsCompletionList with participants, determine who has not completed their task and notify them, if all 
	// participants have completed their tasks then mark the stage as completed and execute next stage
*/

var stageSchema = new mongoose.Schema({
	stageNumber: Number,
	project: String,
	stageType: String,
	dueDate: {type: Date},
	participants: [String],
	description: String,
	stageStatus: String,//(Active, Inactive, Completed)
	participantsCompleted: [String]//this will let me know who has completed their task when comparing to 'participants'
});
var workFlowStage = mongoose.model("Stage", stageSchema);

var workflowSchema = new mongoose.Schema({
	title:String,
	description: String,
	document: String,
	stages: [stageSchema],
	activeStage: stageSchema,//mongoose.Schema.ObjectId
});
var Workflow = mongoose.model("Workflow", workflowSchema);

//RESTFUL ROUTES

//	INDEX ROUTES
app.get("/", function(req, res){
	//res.redirect("/blogs");
	res.redirect("/workflow");
});

app.get("/workflow",function(req, res){

	Workflow.find({}, function(err, workflowsFound){
		if(err){
			console.log("Error!");
		}else{
			res.render("workflow", {workflows: workflowsFound});
		}
	});
});
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){//Blog.find returns 'blogs' which is passed into the function
		if(err){
			console.log("ERROR!");
		}
		else {
			res.render("index", {blogs: blogs});
		}
	});
});

// 	NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render('new');
});
app.get("/workflow/new", function(req, res){
	res.render('wnew');
});

//	CREATE ROUTE
app.post("/blogs", function(req, res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);//sanitize user input

	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			//then, redirect to the index
			res.redirect("/blogs");
		}
	});
});

app.post("/workflow", function(req, res){

	
	console.log(req.body);
	
	var wf = {
		'title' :req.body.Title,
		'description' : req.body.Description,
		'document' : req.body.Document,
		'stages' : []//,
		//'activeStage' : actStage
	}

	var stages = parseInt(req.body.Stages);
	console.log("\n\n***Number of stages: " + stages);

	for(var i=0; i < stages; i++){
		console.log("\n\n*** Stage "+ (i + 1));

		var aStage = JSON.parse(req.body.StageList2)[i];

		var newStage =  new workFlowStage({
			stageNumber				: 	i+1,
			project					: 	aStage.Project,
			stageType				:   aStage.Type,
			dueDate					: 	aStage.DueDate,
			participants			:	aStage.Participants,
			description				:	aStage.Description,
			stageStatus				:	"Inactive",//(Active, Inactive, Completed)
			participantsCompleted	:	[]
		});

		newStage.save(function(err){
			if(err){
				console.error(error);
			}
			else{
				console.log("saved new stage!");
			}
		});

		wf.stages.push(newStage);
	}

	
	
	
	Workflow.create(wf, function(err, newWorkflow){
		if(err){
			res.render("something went wrong: "+err);

		}
		else{
			res.redirect("/workflow/");
		}
	});
	



});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog: foundBlog});
		}
	});
});

// EDIT ROUTE
app.get("/blogs/:id/edit/", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");	
		}else{
			res.render("edit", {blog: foundBlog});
		}
	});
});

// UPDATE ROUTE 
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);//sanitize user input
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}

	});
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});


//TODO: start cron job for each stage execution upon user stage completion.
//		Execute a next stage analysis, if any, notify participants of the next
//		stage that their turn is up on that particular task.  Kick off
//		notification timer task.

// var j = schedule.scheduleJob('*/1 * * * * *', function(fireDate){
// 	console.log('This job was supposed to run at ' + fireDate + ', but actually ran at ' + new Date());
//   });

// var checkStepStatusReminderJob = schedule.scheduleJob('*/10 * * * * *', function(fireDate){
// 	console.log('checking for users that have not complete assigned steps...');

// 	// look up the active stage of every open/active workflow in mongoose and verify the stage date due.
// 	// remind on day before and day due.  This reminder shall be based on participant completion.

// });

app.listen(3000, function(){
	console.log("listening on localhost:3000");
});


var idCounter=0;
var stages=0;
var validIds = new Array();

function createStageDescriptionField(){
    var descriptionInput = document.createElement("textarea");
    descriptionInput.setAttribute("class","InputAddOn-field");
    descriptionInput.setAttribute("type","text");
    descriptionInput.setAttribute("placeholder","Description");
    descriptionInput.setAttribute('id','descriptionInput'+idCounter.toString());

    return descriptionInput;
}

function createAddButton(){
    var addButton = document.createElement("button");
    addButton.setAttribute("class","InputAddon-item ui primary button");
    addButton.setAttribute("onclick","addStage()");
    addButton.setAttribute("id",idCounter.toString());
    var buttonText = document.createTextNode("+");
    addButton.appendChild(buttonText);

    return addButton;
}

function createRemoveButton(){
    var removeButton = document.createElement("button");
    removeButton.setAttribute("class","InputAddon-item ui negative button");
    removeButton.setAttribute("onclick","removeStage(this.id)");
    removeButton.setAttribute("id",idCounter.toString());
    var buttonText = document.createTextNode("-");
    removeButton.appendChild(buttonText);

    return removeButton;
}

function removeStage(id){
    var btn = document.getElementById(id);
    var parent = btn.parentNode;
    parent.parentNode.removeChild(parent);// grandparent? lol

    stages-=1;
    validIds.splice(validIds.indexOf(id.toString()),1);
    
}

function createStageContainer(){
    var stageContainer= document.createElement("div");
    stageContainer.setAttribute("class","InputAddOn");
    //stageContainer.setAttribute("id",idCounter.toString());
    stageContainer.setAttribute("style","padding-top: 20px;");
    
    return stageContainer;
}

function changeAddbuttonToRemoveButton(){
    var btn = document.getElementById(idCounter.toString());
    var newbtn = createRemoveButton();
    btn.parentNode.appendChild(newbtn);
    btn.parentNode.removeChild(btn);
}

function createStageFieldsContainer(stageFieldsContainer){
    var stageFieldsContainer= document.createElement("div");
    stageFieldsContainer.setAttribute("id","stageFields"+idCounter.toString());

    populateStageFieldsContainer(stageFieldsContainer);
    
    return stageFieldsContainer;
}

function createProjectInputField(){
    var projectField = document.createElement("input");
    
    projectField.setAttribute("class", "InputAddOn-field")
    projectField.setAttribute("type","text");
    projectField.setAttribute("name","blog[project]");
    projectField.setAttribute("placeholder", "Project");
    projectField.setAttribute("id", "projectInput"+idCounter.toString());


    return projectField;
}

function createTypeInputField(){
    var typeField = document.createElement("input");

    typeField.setAttribute("class", "InputAddOn-field")
    typeField.setAttribute("type","text");
    typeField.setAttribute("name","blog[project]");
    typeField.setAttribute("placeholder", "Type");
    typeField.setAttribute('id','typeInput'+idCounter.toString());

    return typeField;
}

function createDateInputField(){
    var dateField = document.createElement("input");

    dateField.setAttribute("class", "InputAddOn-field")
    //dateField.setAttribute("type","date");
    dateField.setAttribute("type","text");
    dateField.setAttribute("name","stage[dueDate]");
    dateField.setAttribute("placeholder", "mm/dd/yyyy");
    dateField.setAttribute('id','dateInput'+idCounter.toString());

    return dateField;
}

function createParticipantsField(){
    //TODO: need to get the list of participants and populate dropdown
    // with available participants.  Allow multiple selection.
    var participantsField = document.createElement("input");
    participantsField.setAttribute("class", "InputAddOn-field");
    participantsField.setAttribute("type","text");
    participantsField.setAttribute("name","stage[participants]");
    participantsField.setAttribute("placeholder", "Participant(s)");
    participantsField.setAttribute('id','participantsInput'+idCounter.toString());

    return participantsField;
}

function populateStageFieldsContainer(stageFieldsContainer){

    // create project input
    stageFieldsContainer.appendChild(createProjectInputField());
    
    //create type input
    stageFieldsContainer.appendChild(createTypeInputField());

    // create date input
    stageFieldsContainer.appendChild(createDateInputField());

    // create participants input
    stageFieldsContainer.appendChild(createParticipantsField());

    //create description textarea
    stageFieldsContainer.appendChild(createStageDescriptionField());


    return stageFieldsContainer;
}

function addStage(){
    if(stages !== 0)
        changeAddbuttonToRemoveButton();
    ++idCounter;
    ++stages;
    validIds.push(idCounter.toString());
    var stageContainer = createStageContainer();
    stageContainer.appendChild(createStageFieldsContainer());
    stageContainer.appendChild(createAddButton());

    document.querySelector("#stagesContainer").appendChild(stageContainer);
    
}

function redirectHome(){
    location.href = "/workflow";
}        

function getTitle(){
    return document.getElementById("workflowTitle").value;
}

function getDescription(){
    return document.getElementById("workflowDescription").value;
}

function getProjectInput(id){
    return document.getElementById("projectInput"+id).value;

}

function getTypeInput(id){
    return document.getElementById("typeInput"+id).value;
}

function getDateInput(id){
    return document.getElementById("dateInput"+id).value;
}

function getParticipantsInput(id){
    return document.getElementById("participantsInput"+id).value;
}

function getStageDescriptionInput(id){
    return document.getElementById("descriptionInput"+id).value;
}

function processRequest(){
    //save document
    //TODO: store document in mongodb(this probably needs to be handled on
    //      the express side)

    var filePath = document.getElementById('document').value;//.files[0];

    var workFlow = {};
    var stage =  {};
    workFlow['Title'] = getTitle();
    workFlow['Description'] = getDescription();
    workFlow['Document'] = filePath;
    var stagelist = [];
    for(var i = 0; i < validIds.length; i++)
    {
        stage['StageNumber'] = i+1;
        stage['Project'] =getProjectInput(validIds[i]);
        stage['Type'] =getTypeInput(validIds[i]);
        stage['DueDate'] =getDateInput(validIds[i]);
        stage['Participants'] =getParticipantsInput(validIds[i]);
        stage['Description'] =getStageDescriptionInput(validIds[i]);
        workFlow['Stage'+(i+1).toString()] = JSON.stringify(stage);
        stagelist.push(stage);
        console.log('Stage ' + ((i+1).toString()) + ' Project: ' + stage.Project);

        stage ={};//must recreate the object to preserve data
    }

    

    workFlow['StageList'] = stagelist;
    workFlow['StageList2'] = JSON.stringify(stagelist);

    
    //console.log('\n\n**** stagelist: ' + JSON.stringify(stagelist));
    
    //asociate stage info with workflow id
    //TODO: this should be done on the express side
    //store stage/step number in stage object to maintain order
    //TODO: this should be done on the express side
    //save stage to db
    //TODO: this should be done on the express side
    //asociate workflow with amount of stages
    //TODO: this amount of stages should be stored on the express side
    workFlow['Stages'] =stages;
    //save the workflow object to the database.
    //TODO: this should be done on the express side

    //check for save as template
    if(document.getElementById("saveTemplateCheckBox").checked)
        workFlow['SaveTemplate'] = 'true';
    else
        workFlow['SaveTemplate'] = 'false';

    //encode processed data into encoded data pairs
    var urlEncodedData="";
    var urlEncodedDataPairs = [];
    var name;
    for (name in workFlow){
        urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(workFlow[name]));
    }

    //format encoded data pairs
    urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

    //send post request to server and listen for success or error
    var x = XMLHttpRequest();
    x.addEventListener('load', function(event){
        redirectHome();//TODO: redirect to newly created workflow instance
    });

    x.open("POST", '/workflow');
    x.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    x.send(urlEncodedData);
    
}



//TODO: form validation
function allInputsValid(){


    return false;
}
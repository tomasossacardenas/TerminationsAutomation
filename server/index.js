if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const fs=require('fs');
const axios = require('axios');
const operatorGroups=require('./operatorGroups.json');

const {getCredentials, fillEmployeeInfo, fillTemplates}=require('./functions')

console.log(process.env.USER);
console.log(process.env.APPLICATION_PASSWORD);

app.get('/', (req, res) => {
  res.send('Successful response.');
});

app.listen(3000, () => console.log('Example app is listening on port 3000.'));

var templates=['applications', 'hardware', 'infosec', 'salesforce', 'server', 'telecom']
var groups = ["TOPDeskAdmins", "EndpointManagement", "Infosec", "Salesforce", "Server", "Telecom"];//NOT THE CORRECT ONE (APPS TO TOPDESK ADMINS TO TEST)
//var operatorGroups = ["Applications", "EndpointManagement", "Salesforce", "Infosec", "Server", "Telecom"]; // THIS IS THE CORRECT ONE FOR PRODUCTION

var employee = {
    firstName: null, 
    surName: null, 
    networkLoginName:null,
    effectiveDate:null,
    employeeNumber:null, 
    email:null, 
    id:null, 
    manager:null, 
    jobTitle:null,
    mainIncident:null,
    assets:[]
    }

async function goIncident(){
    const response= await axios.get('https://helpdesk.saintleo.edu/tas/api/incidents?query=number=="I2308-999"', {
        auth: {
            username: process.env.USER,
            password: process.env.APPLICATION_PASSWORD
          }
    })
    return response.data    
}

async function main() {
    //Fill employee info from incident info: firstName, surname, effectiveDate
    const incidentInfo=await goIncident();
    employee.firstName=getCredentials(JSON.stringify(incidentInfo)).workerName.split('.')[0];
    employee.surName=getCredentials(JSON.stringify(incidentInfo)).workerName.split('.')[1];
    employee.effectiveDate=getCredentials(JSON.stringify(incidentInfo)).effectiveDate;
    employee.mainIncident=incidentInfo[0].id;

    //Fill the rest of employee Information
    personData=await goPerson(employee.firstName,employee.surName);
    employee=fillEmployeeInfo(personData, employee);

    //Fill employee.manager email
    const [managerFirst, managerLast]= employee.manager.split(" ")
    var employeeData=await goPerson(managerFirst,managerLast);
    employee.manager= employeeData.email;
    
    //Fill employee assets list receives employee object id
    employee.assets = await goAssets("14b4b761-7071-4d7f-8e50-cca5c69727f3");

    const temporaryAssets = await getAssetsInfo(employee.assets);

    // Assign the temporary assets array to employee.assets
    employee.assets = temporaryAssets;

    //Fill templates
    fillTemplates(templates, employee);
    createPartials(employee)
    console.log(employee);
}
main();

//Get method to retrieve info of a single incident, to get all is: https://helpdesk.saintleo.edu/tas/api/incidents?query=subcategory.name=="TERMINATION"

async function goPerson(firstName, surName){
    try{
        var personUrl=`https://helpdesk.saintleo.edu/tas/api/persons?query=firstName=="${firstName}";surName=="${surName}"`
        console.log(personUrl)
        const response=await axios.get(personUrl, {
            auth: {
                username: process.env.USER,
                password: process.env.APPLICATION_PASSWORD
            }
        })
        //console.log(JSON.stringify(response.data));
        return response.data[0]
        
    }catch(error){
        console.log(error)
    }   
}

//Go to assets related to the person id, returns a list of the id's of assets of the person
async function goAssets(personId){
    try{
        var assetUrl=`https://helpdesk.saintleo.edu/tas/api/assetmgmt/assets?linkedTo=person/${personId}`
        console.log(assetUrl)
        const response=await axios.get(assetUrl, {
            auth: {
                username: process.env.USER,
                password: process.env.APPLICATION_PASSWORD
            }
        })
        //console.log(JSON.stringify(response.data.dataSet));
        //console.log(JSON.parse(JSON.stringify(response.data.dataSet)))
        const data = response.data.dataSet;

        // Create an array to store the "id" values
        const idList = [];

        // Iterate through the data array and extract "id" values
        for (const item of data) {
            idList.push(item.id);
        }

        return idList;
        
    }catch(error){
        console.log(error)
    }   
}

async function getAssetsInfo(assetIds) {
    const temporaryAssets = [];

    // Use Promise.all to concurrently fetch information for all asset IDs
    const assetPromises = assetIds.map(async (assetId) => {
        try {
            const assetUrl = `https://helpdesk.saintleo.edu/tas/api/assetmgmt/assets/${assetId}`;
            const response = await axios.get(assetUrl, {
                auth: {
                    username: process.env.USER,
                    password: process.env.APPLICATION_PASSWORD
                }
            });
            
            // Extract the desired data from the response
            const assetInfo = {
                'asset-tag': response.data.data['asset-tag'],
                serial: response.data.data.serial
            };
            
            temporaryAssets.push(assetInfo);
        } catch (error) {
            console.log(`Error fetching asset info for ID ${assetId}: ${error}`);
        }
    });

    // Wait for all assetPromises to complete
    await Promise.all(assetPromises);

    return temporaryAssets;
}

async function createPartials(employee){
    for (let i = 0; i < templates.length; i++ ){ //IN PRODUCTION TAKE OUT THE &&i<1 (this only crates the partial of topdeskadmins for testing)
        let departmentName = templates[i];
        let operatorGroup=groups[i];
        requestData=createPartial(departmentName, operatorGroup, employee)

        try{
            var url=`https://helpdesk.saintleo.edu/tas/api/incidents/`
            console.log("Creating partials", url)
            const response=await axios.post(url, requestData,{
                auth: {
                    username: process.env.USER,
                    password: process.env.APPLICATION_PASSWORD
                }
            })
            //console.log(JSON.stringify(response.data.dataSet));
            //console.log(JSON.parse(JSON.stringify(response.data.dataSet)))
            const data = response.data;
    
            console.log(data)
    
            
        }catch(error){
            console.error('Error:', error.response.status, error.response.data);
        }   
    };
    
}

function createPartial(department, group, employee){
    var status="partial";
    const requestText = fs.readFileSync(`./templatesResponses/${department.toLowerCase()}.txt`, 'utf8');
    const briefDescription= `Employee Termination ${department.toUpperCase()} (${employee.networkLoginName})(${employee.employeeNumber})`; //need to add involuntary or not 
    console.log(briefDescription)

    const operatorGroupObject = operatorGroups.find(entry => Object.keys(entry)[0] === group);
    const operatorGroup = operatorGroupObject ? operatorGroupObject[group] : null;

    console.log("this is operator group", operatorGroup);
    //const operator= operatorGroup ;//tomas ossa

    const requestData = {
        "status":status, 
        "request":requestText,
        "briefDescription":briefDescription,
        "operatorGroup" :  {"id" :  `${operatorGroup}`},
        "operator": {"id": `${operatorGroup}`},
        "mainIncident": { "id":`${employee.mainIncident}`}
    }

    return requestData;
}

function sendEmail(){
    
}
if (process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const fs=require('fs');
const axios = require('axios');

const {getCredentials, fillEmployeeInfo}=require('./functions')

console.log(process.env.USER);
console.log(process.env.APPLICATION_PASSWORD);

app.get('/', (req, res) => {
  res.send('Successful response.');
});

app.listen(3000, () => console.log('Example app is listening on port 3000.'));

var employee = {
    firstName: null, 
    surName: null, 
    networkLoginName:null,
    effectiveDate:null,
    employeeNumber:null, 
    email:null, 
    id:null, 
    manager:null, 
    jobTitle:null
    }

async function goIncident(){
    const response= await axios.get('https://helpdesk.saintleo.edu/tas/api/incidents?query=number=="I2308-999"', {
        auth: {
            username: process.env.USER,
            password: process.env.APPLICATION_PASSWORD
          }
    })
    employee.firstName=getCredentials(JSON.stringify(response.data)).workerName.split('.')[0];
    employee.surName=getCredentials(JSON.stringify(response.data)).workerName.split('.')[1];
    employee.effectiveDate=getCredentials(JSON.stringify(response.data)).effectiveDate;
    

    //get employee Information
    personData=await goPerson(employee.firstName,employee.surName);
    employee=fillEmployeeInfo(personData, employee);

    //get Manager email
    const [managerFirst, managerLast]= employee.manager.split(" ")
    employeeData=await goPerson(managerFirst,managerLast);
    employee.manager= employeeData.email;

    console.log(employee);
}

goIncident();

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

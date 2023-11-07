//Given a body of the incident returns the name of the person and the effective date or null if there is something wrong.
module.exports.getCredentials=function(text){
    // Define regular expressions to match "Worker:" and "effective on" followed by the respective values
    const workerRegex = /Worker:\s*(\w+\s+\w+)/;
    const effectiveDateRegex = /effective on (\d{2}\/\d{2}\/\d{4})/;

    // Use the regular expressions to search for matches in the text
    const workerMatch = text.match(workerRegex);
    const effectiveDateMatch = text.match(effectiveDateRegex);

    // Check if matches were found for both worker and effective date
    if (workerMatch && effectiveDateMatch) {
    // Extract the worker name and effective date from the matches
    const workerName = workerMatch[1].replace(" ", ".").toLowerCase();
    const effectiveDate = effectiveDateMatch[1];
    
    return { workerName, effectiveDate };
    } else {
    // Return a message indicating that the information was not found
    return null;
    }
}

module.exports.fillEmployeeInfo= function (response, employee) {
    //response.replace("[", "").replace("]", "");
  
    employee.firstName = response.firstName;
    employee.surName = response.surName;
    employee.networkLoginName = response.networkLoginName;
    employee.employeeNumber = response.employeeNumber;
    employee.email = response.email;
    employee.id = response.id;
    employee.manager = response.manager.name;
    employee.jobTitle = response.jobTitle;
  
    return employee;
  }
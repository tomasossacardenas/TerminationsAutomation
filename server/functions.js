const fs=require('fs');
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


  module.exports.fillTemplates = function (templates, employee) {
    for (const template of templates) {
        fs.readFile(`./templates/${template}.txt`, 'utf8', (err, templateScript) => {
            if (err) throw err;

            templateScript = templateScript.replaceAll("(username)", employee.networkLoginName);
            templateScript = templateScript.replaceAll("(position)", employee.jobTitle);
            templateScript = templateScript.replaceAll("(sluid)", employee.employeeNumber);
            templateScript = templateScript.replaceAll("(effectiveDate)", employee.effectiveDate);
            //templateScript = templateScript.replace("(termStatus)", terminationEntry.value);
            templateScript = templateScript.replaceAll("(supervisorEmail)", employee.manager);
            templateScript = templateScript.replace("(assets)", assetsToString(employee.assets));

            fs.writeFile(`./templatesResponses/${template}.txt`, templateScript, 'utf8', (err) => {
                if (err) throw err;
                console.log("Data written successfully!");
            });
        });
    }
}

function assetsToString(assets) {
    if (!assets || assets.length === 0) {
        return "No assets linked to this employee";
    }

    const assetStrings = assets.map((asset, index) => {
        return `Asset ${index + 1}:
            - Serial: ${asset.serial}
            - Asset Tag: ${asset['asset-tag']}`;
    });

    return assetStrings.join('\n\n');
}
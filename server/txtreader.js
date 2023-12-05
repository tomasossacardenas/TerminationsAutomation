const fs=require('fs');

const requestText = fs.readFileSync(`./templatesResponses/hardware.txt`, 'utf8');
console.log(requestText)
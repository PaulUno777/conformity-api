/* eslint-disable prettier/prettier */

const { table } = require("console");
const { stringify } = require("querystring");

let date = '1988/10/25';
let resDate
if (date.includes('/')) {
const tempDate = date.split('/');
    if(Number(tempDate[0])>31){
        
    }
    if (tempDate.length>2) {
        resDate = new Date(tempDate[2] + '/' + tempDate[1] + '/' + tempDate[0])
    }else{
        resDate = new Date(tempDate[1] + '/' + tempDate[0])
    }
}

console.log(date.includes('/'));
console.log(resDate.toISOString().slice(0, 10))

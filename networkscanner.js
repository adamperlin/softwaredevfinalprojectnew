/* This is a node module that uses built in unix tools in order to pinpoint the best networks for use, and possibly to be able to position some kind of robot
based on network strength and triangulating position*/
"use strict";
var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
const cmd = require('child_process').spawn
var dns = require('dns');
module.exports = (iname)=>{
  return new iwlist(iname);
}
function iwlist(iname){
  if(!(this instanceof iwlist)) return new iwlist(iname);
  this.iname = iname;
}
iwlist.prototype = new EventEmitter();
iwlist.prototype.isonline = function(callback) {
  dns.lookup('www.google.com', (err, addresses)=>{
    if(err) return callback(err);
    else return;
  });
}
 //get core exec function from child_process module
iwlist.prototype.scan = function(callback){
/*var toRun = "iwlist "+this.iname.toString()+" scan"; // command to run: iwlist [wireless interface name] scan. This command will get all the connections the interface can detect and give information about their addresses and connection strength
console.log(toRun);
  var child = cmd(toRun, (err, stdout, stderr)=>{ //create a child process to execute a command
    if (err){
      console.error("Error occurred"); //should print to stderr
    }else {
      console.log("executed iwlist");
      return callback(this.parse(stdout));
    }
  }); */
  var scan_data = '';
  const spawn = cmd('iwlist', [this.iname, 'scan']);
  spawn.stdout.on('data', (buff) =>{
    console.log('command working');
    scan_data += buff.toString();
  });
  spawn.stderr.on('data', (data)=>{
    console.error('data');
    throw "Error: iwlist failed";
  });
  spawn.on('exit', (exit_code)=>{
    console.log('exited with code: %d', exit_code);
    console.log(scan_data);
    return callback(this.parse(scan_data));
  });
};

iwlist.prototype.parse = function (stdout) {
var cells = stdout.split("Cell"); //output divided into "cells", which are connections iwlist found
var objects = [];
for (var i = 1; i < cells.length; i++){
    var temp = new Object();
    var element = cells[i];
    if (element.match(/ESSID:+\"[a-zA-Z]+\"/g) != null){
    temp.ESSID = element.match(/ESSID:+\"([a-zA-Z]|\d*)+\"/g).toString().replace("ESSID:\"","").replace("\"","");
  }else{
    console.log('parse error');
     continue;
  }
    temp.QUALITY = element.match(/Quality=+\d+\/+\d+/g).toString().replace("Quality=","").replace(",","");
    temp.SIGNAL = element.match(/Signal level=+(\W|\d)+/g).toString().replace("Signal level=","");
    temp.MACADDR = element.match(/Address: +([a-zA-Z]|\d|:)+/g).toString().replace("Address: ","");
    objects.push(temp);
}
objects = (function(objs){
  var minObj = {};
  var temp;
  for (var i = 0; i < objs.length; i++){
    for (var j = 0; j < (objs.length-i-1); j++){
      if (Number(objs[j].SIGNAL) > Number(objs[j+1].SIGNAL)){
        temp = objs[j];
        objs[j] = objs[j+1];
        objs[j+1] = temp;
      }
    }
  }
  return objs;
})(objects);
return objects;
};

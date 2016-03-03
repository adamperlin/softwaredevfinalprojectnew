var iwlist = require('./networkscanner.js')('wlp2s0');

iwlist.scan((data)=>{
  console.log(data);
});

var spawn = require('child_process').spawn;

const cmd = spawn('iwlist', ['wlp2s0','scan']);

cmd.stdout.on('data',(data)=>{
  console.log(data.toString());
});

cmd.stderr.on('data',(data)=>{
  console.error(data.toString());
});

cmd.on('close', (code) =>{
  console.log(`exited with code %s`, code);
});

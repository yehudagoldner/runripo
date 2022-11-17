const { exec } = require("child_process");
const fs  = require("fs");
const glob = require('glob');
const express = require("express");
const app = express()
app.use('/tmp', express.static(__dirname+'/tmp'))

app.get('/run', async (req, res)=>{
    if(fs.existsSync('tmp')) {
        console.log(123454);
        
        fs.rmSync('tmp', { recursive: true, force: true });
    }
    const child =  exec(`git clone ${req.query.rep} tmp`, shellLog);        
    child.on('close', ()=>{
        const files = new glob.sync('**/*.html',  {dot:true });
        const index = files.find(f=>f.endsWith('index.html'))
        if(index) {
            res.redirect(index)
            return
        } 
        res.redirect(files[0])
    })
})

app.listen(1111, ()=>{
    console.log("server running on 1111");
})


function shellLog(error, stdout, stderr){    
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);            
}
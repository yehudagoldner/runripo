const { exec } = require("child_process");
const fs  = require("fs");
const glob = require('glob');
const express = require("express");
const app = express()
const PORT = process.env.PORT || "6378"
app.use('/tmp', express.static(__dirname+'/tmp'))

app.get('/run', async (req, res)=>{
    if(fs.existsSync('tmp')) {        
        fs.rmSync('tmp', { recursive: true, force: true });
    }
    const child =  exec(`git clone ${req.query.rep} tmp`, shellLog);        
    child.on('close', ()=>{
        const files = new glob.sync('**/*.html',  {dot:true });
        const index = files.find(f=>f.endsWith('index.html'))
        if(index) {
            let newurl = `${index}?rep=${req.query.rep}`
            res.redirect(newurl)
            return
        } 
        res.redirect(`${files[0]}?rep=${req.query.rep}`)
    })
})

app.listen(PORT, ()=>{
    console.log(`server running on ${PORT}`);
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



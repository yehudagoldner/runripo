const { exec } = require("child_process");
const fs = require("fs");
const glob = require('glob');
const express = require("express");
const path = require("path");
const https = require('https');
const G = require("glob");
const app = express()
const PORT = process.env.PORT || "6378"
app.use('/', express.static(__dirname + '/tmp'))
app.use('/public', express.static(__dirname + '/public'))
app.set('view engine', 'ejs')





app.get('/run', async (req, res) => {
    let react_port = 3333
    let child = null
    const rep = req.query.rep
    const dir = req.query.rep.replace('https://', '').replace('.git', '').replaceAll('/', '_')
    let command = `git clone ${rep} ./tmp/${dir} `
    const appType = req.query.appType
    switch(appType) {
        case 'react':
            command += ` && cd ./tmp/${dir} && npm i && cross-env PORT=${react_port++} npm start`
            break;
    }    
    const runApp = () => {
        if(appType === 'react') return;
        
        const files = new glob.sync(`./tmp/${dir}/**/*.html`, { dot: true });
        let index = getShortest(files.filter(f => f.endsWith('index.html')))
        console.log(index);
        if(!index) index = getShortest(files.filter(f => f.endsWith('main.html')))
        
        const projectUrl = (index ? index : files[0]).replace(`tmp/`, '') + `?rep=${req.query.rep}`
        console.log(projectUrl);
        res.redirect(`${projectUrl}`)
        // res.render('index.ejs', { projectUrl: projectUrl.replace('tmp', ''), codeRevirew: req.query.rep.replace('.git', '/pull/1/files') })
    }
    
    child && await child.kill()

    if(appType==="react"){
        res.status(301).redirect(req.query.rep.replace('.git', '/pull/1/files'))
    }
    if(fs.existsSync(`tmp/${dir}`) && appType==="react"){
        console.log(`cd ./tmp/${dir} && cross-env PORT=${react_port++} npm start  `);        
        child = exec(`cd ./tmp/${dir} && cross-env PORT=${react_port++} npm start`, shellLog);    
        return
    }

    if (!fs.existsSync(`tmp/${dir}`)){
        console.log(command);
        child =  exec(command, shellLog);
        child.on('close', runApp)
        return
    }

    runApp()
   
})

app.get('/*', (req, res)=>{
    const publicDirectoryPath = path.join(__dirname, 'tmp/build');
    const htmlPath = path.resolve( publicDirectoryPath, 'index.html')
    res.sendFile(htmlPath);
})


app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
})

function getShortest(arr){
    console.log(arr);
    return arr.sort((a,b)=>a.length - b.length)[0]
}
function shellLog(error, stdout, stderr) {
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



const { exec } = require("child_process");
const fs = require("fs");
const glob = require('glob');
const express = require("express");
const path = require("path");
const https = require('https');
const app = express()
const PORT = process.env.PORT || "6378"
app.use('/', express.static(__dirname + '/tmp'))
app.use('/public', express.static(__dirname + '/public'))
app.set('view engine', 'ejs')


app.get('/run', async (req, res) => {
    if (fs.existsSync('tmp')) {
        console.log(1);
       await  fs.rmSync('tmp', { recursive: true, force: true });
    }
    let command = `git clone ${req.query.rep} tmp`
    switch(req.query.appType) {
        case 'react':
            command += `&& cd tmp && npm i &&  npm start`
            break;
    }
    console.log(command);
    const child = exec(command, shellLog);
    child.on('close', () => {
        if(req.query.appType == 'react') {
            res.redirect(`http://localhost:3000?rep=${req.query.rep}`)
            return;
        }
        const files = new glob.sync('**/*.html', { dot: true });
        let index = getShortest(files.filter(f => f.endsWith('index.html')))
        console.log(index);
        if(!index) index = getShortest(files.filter(f => f.endsWith('main.html')))

        const projectUrl = (index ? index : files[0]).replace('tmp/', '') + `?rep=${req.query.rep}`
        console.log(projectUrl);
        res.redirect(`${projectUrl}`)
        // res.render('index.ejs', { projectUrl: projectUrl.replace('tmp', ''), codeRevirew: req.query.rep.replace('.git', '/pull/1/files') })
    })
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



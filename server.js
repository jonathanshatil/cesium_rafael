const fs = require('fs');
var cors = require('cors')
var CONFIG = require('./config');
const express = require('express')
const request=require('request')
const app = express()
const PORT = CONFIG.local_server_port
const KML_DIR = CONFIG.kml_dir

var kmls={}//format: file_name:{'mtime':time,'mode':c/a/d/u} c=changed a=added d=deleted u=unchanged
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
app.use(cors())

app.get('/kml',(req,res)=>
{
    console.log("KMLs requsted")
    getKmls();
    console.log(kmls);
    res.send(JSON.stringify(kmls));
})

app.get('/',(req,res)=>
{
    console.log("first enter")
    kmls={}
    getKmls();
    console.log(kmls);
    res.send(JSON.stringify(kmls));
})

app.get('/:somthing',(req,res)=>
{
    //reciving info from the gee server and sending it to the client here
})
app.listen(PORT, () => console.log(`listening on port ${PORT}!`))

async function getKmls(){
    var files = fs.readdirSync(KML_DIR)
    for(var key in kmls){
        if (kmls[key]['mode']=='d')
        {
            delete kmls[key];
        }
        else if(!files.includes(key))
        {
            kmls[key]['mode']='d';
        }
    }
    files.forEach(function (file) {     
        if (file.includes('kml'))
        {
            mt=fs.statSync(KML_DIR+'/'+file).mtimeMs;//last modifing time
            if(Object.keys(kmls).includes(file)){
                if(mt!=kmls[file]['mtime']){
                    kmls[file]={mtime: mt, mode :'c'} 
                }
                else{
                    kmls[file]={mtime : mt, mode :'u'}
                }
            }
            else{
                kmls[file]={ mtime :mt, mode :'a'}
            }
        } 
    });
}

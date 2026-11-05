const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');const Exp=require('./dist/expeditions.js');
const source=fs.readFileSync('dist/game.js','utf8');const render=source.slice(source.indexOf('function drawExpeditionAtmosphere('),source.indexOf('function start(){'));
for(const [W,H,zoom] of [[1920,1080,1.1],[360,800,.58],[800,360,.58]]){
 let trace=[];const ctx=new Proxy({},{get:(_,key)=>(...args)=>trace.push([key,...args]),set:(_,key,value)=>{trace.push([key,value]);return true;}});
 const run={expedition:{id:'current',phase:'active',elapsed:6}},camera={zoom};const sandbox={run,camera,W,H,Exp,ctx,Math,ellipse:(...args)=>trace.push(['ellipse',...args])};vm.createContext(sandbox);vm.runInContext(render,sandbox);
 const snapshot=JSON.stringify([run,camera]);const draw=()=>{trace=[];sandbox.drawExpeditionAtmosphere(200,200);return JSON.stringify(trace)};
 const before=draw();assert.equal(draw(),before,'same active time freezes current animation');assert.equal(JSON.stringify([run,camera]),snapshot,'render never mutates event or camera');
 assert(!trace.some(([name])=>['fillRect','filter','setTransform','translate','scale','rotate','bezierCurveTo','drawImage'].includes(name)),'no full-screen effect or distortion');
 const heads=trace.filter(([name])=>name==='ellipse').length/2;assert(heads>0&&heads<=64,'strict visible budget');let xs=[];for(const [name,...args] of trace){if(name==='beginPath')xs=[];if(['moveTo','lineTo','quadraticCurveTo'].includes(name))for(let i=0;i<args.length;i+=2)xs.push(args[i]);if(name==='stroke'&&xs.length)assert((Math.max(...xs)-Math.min(...xs))*zoom<=78.001,'short local trail');}
 run.expedition.elapsed+=.5;assert.notEqual(draw(),before,'streams animate');run.expedition.phase='done';draw();assert.equal(trace.length,0,'no lingering effect');console.log(W+'x'+H+': local strokes <=78px, '+heads+' visible streams, bounded deterministic animation, zero simulation writes');
}
console.log('PASS current rendering');

import test from "node:test";
import assert from "node:assert/strict";

test("real app renders dashboard, catalog, roadmap and quiz in a simulated DOM",async()=>{
 const elements=new Map(),handlers={};
 const classList={add(){},remove(){},toggle(){}};
 function node(sel){
  if(!elements.has(sel))elements.set(sel,{innerHTML:"",textContent:"",value:"",selectionStart:0,style:{},classList,focus(){},setSelectionRange(){},setAttribute(){}});
  return elements.get(sel);
 }
 const previous={window:globalThis.window,document:globalThis.document,location:globalThis.location,history:globalThis.history,localStorage:globalThis.localStorage,setInterval:globalThis.setInterval};
 const data=new Map();
 globalThis.localStorage={getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)};
 globalThis.document={querySelector:node,getElementById:id=>node("#"+id),body:{classList,appendChild(){}},addEventListener:(type,fn)=>handlers[type]=fn,createElement:()=>node("#temp")};
 globalThis.window={addEventListener(){},scrollTo(){},speechSynthesis:null};
 globalThis.location={hash:""};
 globalThis.history={replaceState(_state,_title,url){globalThis.location.hash=url}};
 globalThis.setInterval=()=>1;
 try{
  await import("../app.js");
  assert.match(node("#content").innerHTML,/Eine Welt/);
  assert.match(node("#sidebar").innerHTML,/Sprachen/);
  function click(dataset){
   const el={dataset,hasAttribute:name=>name==="data-nav"&&Object.hasOwn(dataset,"nav"),closest(){return this},classList,style:{}};
   handlers.click({target:el,preventDefault(){}});
  }
  click({nav:"languages"});
  assert.match(node("#content").innerHTML,/78 Sprachen/);
  assert.match(node("#content").innerHTML,/Japanisch/);
  click({action:"select-lang",id:"ja"});
  assert.match(node("#content").innerHTML,/Hiragana/);
  assert.match(node("#content").innerHTML,/A1–C2/);
  click({action:"start-lesson",topic:"Begrüßungen",level:"A1"});
  assert.match(node("#content").innerHTML,/Lernkarte 1/);
  click({action:"card-reveal"});
  assert.match(node("#content").innerHTML,/こんにちは/);
  for(let i=0;i<9;i++)click({action:"card-next"});
  assert.match(node("#content").innerHTML,/Wissen sichern/);
  assert.match(node("#content").innerHTML,/Antwort prüfen/);
 }finally{
  for(const [k,v]of Object.entries(previous)){if(v===undefined)delete globalThis[k];else globalThis[k]=v}
 }
});

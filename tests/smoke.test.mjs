import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {LANGUAGES,LEVELS,KANA,getPhrases,hasTopic,getLanguage,getTopicPhrases} from "../data/languages.js";

test("at least 50 distinct languages with a real starter pack",()=>{
 assert.ok(LANGUAGES.length>=50,"minimum 50 languages");
 assert.equal(new Set(LANGUAGES.map(l=>l.id)).size,LANGUAGES.length);
 for(const lang of LANGUAGES){
  assert.ok(lang.name&&lang.native&&lang.locale&&lang.flag,lang.id+" metadata");
  const phrases=getPhrases(lang.id);
  assert.ok(phrases.length>=5,lang.id+" has five beginner phrases");
  assert.equal(new Set(phrases.map(p=>p.id)).size,phrases.length);
  assert.ok(phrases.every(p=>p.source&&p.answer&&p.topic),lang.id+" has valid translations");
  assert.ok(hasTopic(lang.id,"Begrüßungen","A1"),lang.id+" has playable A1 entry");
 }
});
test("six CEFR roadmap stages with 36 planned modules",()=>{
 assert.deepEqual(LEVELS.map(l=>l.id),["A1","A2","B1","B2","C1","C2"]);
 assert.equal(LEVELS.reduce((n,l)=>n+l.topics.length,0),36);
});
test("Japanese writing and several thematic lessons",()=>{
 assert.equal(getLanguage("ja").name,"Japanisch");
 assert.ok(getPhrases("ja").length>=35);
 assert.equal(KANA.Hiragana.split(",").length,46);
 assert.equal(KANA.Katakana.split(",").length,46);
 assert.ok(getTopicPhrases("ja","Vorstellung","A1").length>=4);
 assert.ok(getTopicPhrases("ja","Essen & Trinken","A1").length>=4);
 assert.ok(getTopicPhrases("ja","Unterwegs","A2").length>=2);
});
test("spoken language starter packs across continents",()=>{
 for(const id of ["en","es","fr","ko","zh","ar","tr","sw","hi","ru","vi"]){
  assert.ok(getPhrases(id).length>=5,id+" can learn");
 }
});
test("application assets are valid and interface is connected",()=>{
 execFileSync(process.execPath,["--check","app.js"]);
 execFileSync(process.execPath,["--check","data/languages.js"]);
 const html=readFileSync("index.html","utf8");
 const script=readFileSync("app.js","utf8");
 const style=readFileSync("assets/novalab.css","utf8");
 const manifest=JSON.parse(readFileSync("manifest.webmanifest","utf8"));
 assert.match(html,/type="module" src="\.\/app\.js(?:\?v=\d+)?"/);
 for(const id of ["content","sidebar","bottom-nav","timer-header","modal-root"])assert.ok(html.includes('id="'+id+'"'),id);
 for(const component of ["quizQuestions","finishQuiz","checkin","recordSpeak","speakingPage","renderTimerModal","exportData","localStorage"])assert.ok(script.includes(component),component);
 assert.ok(style.includes(".nv-roadmap"));
 assert.ok(style.includes("@media"));
 assert.equal(manifest.start_url,"./#home");
 assert.equal(manifest.display,"standalone");
});

import {LANGUAGES,LEVELS,KANA,getLanguage,getPhrases,getTopicPhrases,hasTopic} from "./data/languages.js";
import {GRAMMAR_NOTES} from "./data/lesson-expansion.js";
import {renderExtra,avatarMarkup,bannerMarkup,ISSUE_URL,DISCORD_URL} from "./extras/academy-pages.js";

/* NovaLab Academy Languages • client-only learning experience */
const KEY="novalab-languages-v1";
const DEFAULT={language:"ja",name:"Sprachentdecker",xp:0,completed:{},reviews:{},favorites:[],streak:{date:"",count:0},theme:"dark",focusMinutes:25,animations:true,profileAvatar:"novalab",profileTitle:"Sprachentdecker",bio:"Jeden Tag ein Wort weiter.",romanAccept:false};
function load(){
 try {
  const v=JSON.parse(localStorage.getItem(KEY)||"null");
  if(!v||typeof v!=="object"||Array.isArray(v))return {...DEFAULT};
  return {...DEFAULT,...v,completed:v.completed&&typeof v.completed==="object"?v.completed:{},reviews:v.reviews&&typeof v.reviews==="object"?v.reviews:{},favorites:Array.isArray(v.favorites)?v.favorites:[],streak:v.streak&&typeof v.streak==="object"?v.streak:{date:"",count:0}};
 }catch{return {...DEFAULT}}
}
let db=load();
let ui={route:"home",search:"",vocabSearch:"",onlyFavorites:false,level:"A1",topic:"Begrüßungen",phase:"cards",deck:[],cardIndex:0,cardRevealed:false,questions:[],questionIndex:0,choice:null,answered:false,correct:false,quizScore:0,sessionKey:"",kanaSet:"Hiragana",menu:false,shopTerm:1,writeDeck:[],writeIndex:0,writeDirection:"forward",writeResult:null,writeHint:false,writeDraft:"",supportSubject:""};
let timer={running:false,seconds:db.focusMinutes*60};
const qs=(sel)=>document.querySelector(sel);
const main=qs("#content");
const modal=qs("#modal-root");
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function store(){try{localStorage.setItem(KEY,JSON.stringify(db))}catch{toast("Speichern ist in diesem Browser nicht verfügbar.")}}
function dateKey(d=new Date()){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function previousDate(){const d=new Date();d.setDate(d.getDate()-1);return dateKey(d)}
function dueCount(id=db.language){return getPhrases(id).filter(p=>db.reviews[p.id]&&db.reviews[p.id].due<=dateKey()).length}
function lessonKey(lang,level,topic){return [lang,level,topic].join("/")}
function completedCount(lang=db.language){return Object.keys(db.completed).filter(k=>k.startsWith(lang+"/")&&db.completed[k].passed).length}
function availableCount(lang=db.language){return LEVELS.reduce((n,l)=>n+l.topics.filter(t=>hasTopic(lang,t,l.id)).length,0)}
function percentage(lang=db.language){const a=availableCount(lang);return a?Math.min(100,Math.round(completedCount(lang)/a*100)):0}
function currentLang(){return getLanguage(db.language)}
function todayDone(){return db.streak.date===dateKey()}
function checkin(silent=false){
 const today=dateKey();
 if(db.streak.date===today){if(!silent)toast("Heutiger Streak ist schon gesichert! 🔥");return}
 db.streak.count=db.streak.date===previousDate()?Math.max(0,Number(db.streak.count)||0)+1:1;
 db.streak.date=today;store();renderHeader();if(!silent)toast("🔥 Tages-Streak gesichert!");renderPage();
}
function toast(message){
 const el=qs("#toast");if(!el)return;
 el.textContent=message;el.classList.add("show");el.style.cssText="position:fixed;bottom:calc(95px + env(safe-area-inset-bottom));right:16px;z-index:200;padding:13px 17px;border:1px solid #8f67ad;border-radius:13px;background:#2c1c40;color:white;max-width:min(360px,90vw);box-shadow:0 20px 50px #05000dce";
 if(toast.id)clearTimeout(toast.id);
 toast.id=setTimeout(()=>el.classList.remove("show"),3800);
}
function relativeUrl(route){return "#"+route}
const NAV=[
 ["home","Startseite","⌂"],["languages","Sprachen","🌍"],["roadmap","Roadmap","✦"],
 ["vocabulary","Vokabeln","▤"],["writing","Schreiben","✎"],["exams","Prüfungen","🏆"],["grammar","Grammatik","📖"],["scripts","Schriftzeichen","あ"],["speaking","Sprechen","🎙"],["shop","Shop","◇"],["support","Support","✉"],["achievements","Erfolge","★"],["profile","Profil","◉"],["settings","Einstellungen","⚙"],["help","Hilfe","?"]
];
function navBtn(item){
 const active=ui.route===item[0]||ui.route==="lesson"&&item[0]==="roadmap";
 return '<button class="side-link'+(active?' active':'')+'" type="button" data-nav="'+item[0]+'"><span class="side-icon">'+item[2]+'</span>'+item[1]+'</button>';
}
function renderNavigation(){
 const lang=currentLang();
 qs("#sidebar").innerHTML='<div class="nv-side-brand"><img src="./assets/novalab-logo.webp" alt=""> <div>NovaLab Academy<small>LANGUAGES</small></div></div>'+
  '<span class="side-label">DEIN LERNBEREICH</span>'+NAV.slice(0,9).map(navBtn).join("")+
  '<span class="side-label">DEIN ACCOUNT</span>'+NAV.slice(9).map(navBtn).join("")+
  '<div class="nv-side-footer"><div class="nv-side-locale"><span>'+lang.flag+'</span><div><span class="nv-tiny">Aktuelle Sprache</span><strong>'+esc(lang.name)+'</strong></div></div><div class="nv-progress"><span style="width:'+percentage()+'%"></span></div><p>'+completedCount()+' von '+availableCount()+' verfügbaren Modulen geschafft</p></div>';
 const mobile=[NAV[0],NAV[1],NAV[2],NAV[4],NAV[12]];
 qs("#bottom-nav").innerHTML=mobile.map(item=>'<button type="button" data-nav="'+item[0]+'" class="'+(ui.route===item[0]?'active':'')+'"><span>'+item[2]+'</span>'+item[1]+'</button>').join("");
}
function renderHeader(){
 qs("#xp-header").textContent="✦ "+Math.max(0,Number(db.xp)||0)+" XP";
 qs("#streak-header").textContent="🔥 "+Math.max(0,Number(db.streak.count)||0);
 const av=qs(".avatar-btn");if(av)av.innerHTML=avatarMarkup(db,esc,"nv-avatar-mini");
 qs("#timer-header").textContent="◷ "+timerText();
 document.body.classList.toggle("nv-light",db.theme==="light");
 document.body.classList.toggle("nv-no-animations",!db.animations);
}
function timerText(){return String(Math.floor(timer.seconds/60)).padStart(2,"0")+":"+String(timer.seconds%60).padStart(2,"0")}
setInterval(()=>{
 if(!timer.running)return;
 if(timer.seconds>0)timer.seconds--;
 else{timer.running=false;toast("Fokuszeit geschafft! ✨");}
 const el=qs("#timer-header");if(el)el.textContent="◷ "+timerText();
 const t=qs("#timer-time");if(t)t.textContent=timerText();
},1000);
function navigate(route,updateHash=true){
 const allowed=NAV.map(n=>n[0]).concat(["lesson"]);
 ui.route=allowed.includes(route)?route:"home";
 if(updateHash&&location.hash!==relativeUrl(ui.route))history.replaceState(null,"",relativeUrl(ui.route));
 closeMenu();renderPage();window.scrollTo({top:0,behavior:"instant"});
}
function closeMenu(){qs("#sidebar").classList.remove("open");qs("#nav-backdrop").classList.remove("show");ui.menu=false}
function openMenu(){ui.menu=!ui.menu;qs("#sidebar").classList.toggle("open",ui.menu);qs("#nav-backdrop").classList.toggle("show",ui.menu)}
function button(text,action,extra="",cls=""){return '<button type="button" class="nv-btn '+cls+'" data-action="'+action+'" '+extra+'>'+text+'</button>'}
function hero(label,title,description,art,buttons){
 return '<section class="nv-hero"><div class="nv-hero-content"><span class="nv-kicker">'+label+'</span><h1>'+title+'</h1><p>'+description+'</p><div class="nv-actions">'+(buttons||"")+'</div></div><div class="nv-hero-art" aria-hidden="true"><span>'+art+'</span></div></section>';
}
function heading(title,subtitle,action){
 return '<div class="nv-section-title"><div><h2>'+title+'</h2>'+(subtitle?'<p>'+subtitle+'</p>':"")+'</div>'+(action||"")+'</div>';
}
function stats(){
 return '<div class="nv-stat-grid">'+[
 ["✦",db.xp,"Gesammelte XP"],["🔥",db.streak.count+" Tage","Daily Streak"],["✓",completedCount(),"Abgeschlossene Module"],["⌛",dueCount(),"Fällige Wiederholungen"]
 ].map(s=>'<div class="nv-stat"><div class="nv-stat-icon">'+s[0]+'</div><strong>'+esc(s[1])+'</strong><span>'+s[2]+'</span></div>').join("")+'</div>';
}
function langCard(lang){
 const active=lang.id===db.language;
 const total=availableCount(lang.id),done=completedCount(lang.id);
 return '<article class="nv-card"><div class="nv-course-heading"><span class="nv-flag">'+lang.flag+'</span><div><strong>'+esc(lang.name)+'</strong><small>'+esc(lang.native)+'</small></div></div>'+
  '<div class="nv-card-foot"><span class="nv-tag '+(active?'mint':'')+'">'+(active?"Aktiver Kurs":lang.featured?"Erweiterte Lektionen":"Starterkurs")+'</span><span class="nv-tiny">'+total+' Module</span></div>'+
  '<div class="nv-progress"><span style="width:'+percentage(lang.id)+'%"></span></div>'+
  '<p>'+done+' / '+total+' Module abgeschlossen · Lernplan A1–C2</p>'+
  '<div class="nv-card-foot">'+button(active?"Roadmap öffnen":"Sprache lernen","select-lang",'data-id="'+lang.id+'"',"primary tiny")+
  '<span class="nv-tiny">'+(lang.id==="ja"?"Kana & mehr":lang.featured?"Mehr Themen":"Grundwortschatz")+'</span></div></article>';
}
function homePage(){
 const lang=currentLang(),target=getPhrases(db.language);
 const available=LEVELS.flatMap(l=>l.topics.filter(t=>hasTopic(db.language,t,l.id)).map(t=>({topic:t,level:l.id})));
 const next=available.find(x=>!db.completed[lessonKey(db.language,x.level,x.topic)]?.passed)||available[0];
 const quick=next?button("▶ Weiterlernen","start-lesson",'data-level="'+next.level+'" data-topic="'+esc(next.topic)+'"',"primary"):button("Sprachen ansehen","go-languages","","primary");
 return bannerMarkup()+hero("NOVA LAB • LANGUAGE EXPLORER","Eine Welt.<br>Unendlich viele Worte.","Lerne neue Sprachen mit echten Übungen, deinem persönlichen Lernpfad und motivierenden Mini-Etappen. Von den ersten Grüßen bis zur C2-Roadmap.",lang.flag,quick+button("Alle Sprachen","go-languages"))+
  stats()+
  heading("Dein Lernpfad","Setze dort fort, wo du aufgehört hast.")+
  '<div class="nv-grid two"><article class="nv-card"><span class="nv-kicker">AKTUELLER KURS</span><div class="nv-course-heading" style="margin-top:12px"><span class="nv-flag">'+lang.flag+'</span><div><strong>'+esc(lang.name)+'</strong><small>'+esc(lang.native)+'</small></div></div><h3>'+(next?esc(next.level+" · "+next.topic):"Neue Sprache wählen")+'</h3><p>'+target.length+' Lernwörter und Ausdrücke · '+completedCount()+' Module geschafft</p><div class="nv-progress"><span style="width:'+percentage()+'%"></span></div><div class="nv-card-foot">'+quick+button("Roadmap","go-roadmap","","tiny")+'</div></article>'+
  '<article class="nv-card"><span class="nv-kicker">HEUTE</span><h3>'+ (todayDone()?"Dein Streak ist gesichert!":"Bleib im Lernfluss 🔥")+'</h3><p>'+(todayDone()?"Du hast heute bereits eingecheckt. Eine kurze Wiederholung bringt dich trotzdem weiter.":"Ein Lern-Check-in pro Kalendertag. Zusammen mit Übungen wird Lernen zur Gewohnheit.")+'</p><div class="nv-card-foot">'+button(todayDone()?"✓ Heute erledigt":"🔥 Streak abholen","checkin",todayDone()?'disabled':"","primary tiny")+button("Vokabeln wiederholen","go-vocab","","tiny")+'</div></article></div>'+
  heading("Deine Möglichkeiten","Verschiedene Lernwege in einer Academy.")+
  '<div class="nv-grid">'+[
  ["🗺️","Lern-Roadmaps","Sechs Etappen von A1 bis C2. Du siehst, welche Kapitel schon ausgearbeitet sind.","go-roadmap"],
  ["🧠","Vokabeltraining","Lernkarten, Schreibaufgaben und intelligente Wiederholungen für deinen Wortschatz.","go-vocab"],
  ["🎙","Sprechen trainieren","Sätze anhören, nachsprechen und per Spracherkennung vergleichen.","go-speaking"],
  ["✎","Schreibstudio","Schriftzeichen, Wörter und ganze Sätze schreiben und gezielt verbessern.","go-writing"],
  ["🏆","Prüfungscenter","Deinen Lernstand mit passenden Mini-Prüfungen überprüfen.","go-exams"],
  ["📖","Wissensbibliothek","Grammatik und wichtige Sprachregeln verständlich erklärt.","go-grammar"],
  ["◇","Shop & Abos","Mitgliedschaften und geplante Erweiterungen kennenlernen.","go-shop"],
  ["✉","Support","Fehler melden, Vorschläge einreichen oder dem Discord beitreten.","go-support"],
  ["あ","Japanische Schrift","Hiragana & Katakana mit Lautumschrift und Aussprache trainieren.","go-scripts"]
  ].map(x=>'<article class="nv-card"><div style="font-size:33px">'+x[0]+'</div><h3>'+x[1]+'</h3><p>'+x[2]+'</p>'+button("Entdecken",""+x[3],"","tiny")+'</article>').join("")+'</div>'+
  heading("Beliebte Sprachen","Wechsle jederzeit deinen aktiven Kurs.",button("Alle "+LANGUAGES.length+" Sprachen","go-languages","","tiny"))+
  '<div class="nv-grid">'+["ja","en","es"].map(id=>langCard(getLanguage(id))).join("")+'</div>'+
  '<p class="nv-note">Lernstand: Starterlektionen sind in allen Sprachen vorhanden; ausführlichere Übungen gibt es derzeit für ausgewählte Sprachen. Höhere Niveaus in der Roadmap sind als geplanter Ausbau sichtbar.</p>';
}
function languagesPage(){
 const langs=LANGUAGES.filter(l=>(l.name+" "+l.native+" "+l.id).toLocaleLowerCase().includes(ui.search.toLocaleLowerCase())&&(!ui.onlyFavorites||l.featured));
 return hero("SPRACHEN WELTWEIT",LANGUAGES.length+" Sprachen.<br>Dein Weg.","Wähle eine Sprache und starte sofort mit den ersten Wörtern. Schwerpunktsprachen enthalten schon weitere Lektionen.", "🌐",button("Japanisch starten","select-lang",'data-id="ja"',"primary") )+
  '<div class="nv-search-wrap"><input id="language-search" class="nv-input" type="search" placeholder="🔎 Sprache suchen …" aria-label="Sprache suchen" value="'+esc(ui.search)+'"><button class="nv-pill'+(ui.onlyFavorites?" active":"")+'" data-action="featured-filter">✦ Schwerpunktsprachen</button><span class="nv-tag">'+langs.length+" Ergebnisse</span></div>"+
  '<div class="nv-grid">'+langs.map(langCard).join("")+'</div>'+
  '<p class="nv-note">Alle Sprachen bieten einen fünfteiligen Einstieg. Mehrstufige Kursinhalte und Übersetzungen werden schrittweise ergänzt und vor Veröffentlichung fachlich überprüft.</p>';
}
function roadmapPage(){
 const lang=currentLang();
 let levelsHtml=LEVELS.map((level,i)=>{
 const count=level.topics.filter(t=>hasTopic(lang.id,t,level.id)).length;
 const children=level.topics.map((topic,j)=>{
  const available=hasTopic(lang.id,topic,level.id),done=!!db.completed[lessonKey(lang.id,level.id,topic)]?.passed;
  return '<button type="button" class="nv-module'+(done?" done":"")+'" data-action="start-lesson" data-level="'+level.id+'" data-topic="'+esc(topic)+'" '+(available?"":"disabled title=\"Inhalte in Vorbereitung\"")+'><span><span class="nv-module-number">'+String(j+1).padStart(2,"0")+'</span>'+esc(topic)+'</span><span>'+(done?"✓":available?"↗":"🔒")+'</span></button>';
 }).join("");
 return '<div class="nv-roadmap-level '+(count?"available":"")+'"><div class="nv-roadmap-head"><div><strong><em>'+level.id+'</em> '+esc(level.name)+'</strong><p>'+esc(level.desc)+'</p></div><span class="nv-tag '+(count?"mint":"ghost")+'">'+count+'/'+level.topics.length+' verfügbar</span></div><div class="nv-modules">'+children+'</div></div>';
 }).join("");
 return hero("DEIN SPRACH-LERNPFAD",lang.flag+" "+esc(lang.name)+"<br>Roadmap","Alle Niveaus im Blick. Grüne Kapitel sind abgeschlossen, violette können bearbeitet werden und gesperrte Kapitel befinden sich noch im Ausbau.",lang.flag,button("Andere Sprache wählen","go-languages","","primary"))+
  '<div class="nv-stat-grid"><div class="nv-stat"><div class="nv-stat-icon">◈</div><strong>A1–C2</strong><span>6 Entwicklungsstufen</span></div><div class="nv-stat"><div class="nv-stat-icon">🗺️</div><strong>36</strong><span>Geplante Lernmodule</span></div><div class="nv-stat"><div class="nv-stat-icon">✓</div><strong>'+completedCount()+'</strong><span>Module abgeschlossen</span></div><div class="nv-stat"><div class="nv-stat-icon">◷</div><strong>'+percentage()+'%</strong><span>Von aktuell verfügbaren Modulen</span></div></div>'+
  (lang.id==="ja"?'<div class="nv-note">🇯🇵 Für Japanisch gibt es zusätzlich eine Einführung in Hiragana und Katakana. '+button("Schriftzeichen üben","go-scripts","","tiny")+'</div>':"")+
  heading("Deine Lernstationen","Lernpfad mit Kapiteln, Aufgaben und Checks.")+
  '<div class="nv-roadmap">'+levelsHtml+'</div>'+
  '<p class="nv-note">Wichtig: A1, A2, B1, B2, C1 und C2 sind hier thematische Ziele nach dem Gemeinsamen Europäischen Referenzrahmen, keine verliehenen Zertifikate. Ein Abschluss der vorhandenen Kurzlektionen bestätigt noch kein gesamtes GER-Niveau.</p>';
}
function normalize(s){return String(s||"").normalize("NFKC").toLocaleLowerCase().replace(/[.!?¿¡،。！？'’"„“\s]+/g,"").trim()}
function shuffleDeterministic(items,n){return items.map((item,i)=>({item,k:(i*17+n*13)%23})).sort((a,b)=>a.k-b.k).map(x=>x.item)}
function quizQuestions(deck,mode){
 const pool=(mode==="kana"?deck:getPhrases(db.language)).filter(p=>p.answer);
 const unique=deck.slice(0,mode==="kana"?10:Math.min(5,deck.length));
 return unique.map((p,i)=>{
  const other=[...new Map(pool.filter(x=>x.answer!==p.answer).map(x=>[x.answer,x.answer])).values()];
  const distractors=shuffleDeterministic(other,i).slice(0,3);
  const listen=mode!=="kana"&&i%3===1;
  const hearOptions=shuffleDeterministic([...new Set(pool.filter(x=>x.source!==p.source).map(x=>x.source))],i).slice(0,3);
  const options=listen?shuffleDeterministic([p.source,...hearOptions],i+3):shuffleDeterministic([p.answer,...distractors],i+3);
  return {phrase:p,kind:mode==="kana"?"choice":i%3===1?"listen":i%3===2?"write":"choice",options};
 });
}
function startLesson(topic,level="A1"){
 const deck=getTopicPhrases(db.language,topic,level);
 if(deck.length<2){toast("Dieses Kapitel wird noch erstellt.");return}
 ui.level=level;ui.topic=topic;ui.deck=deck.slice(0,topic.endsWith("-Check")?12:15);ui.cardIndex=0;ui.cardRevealed=false;ui.phase="cards";ui.sessionKey=lessonKey(db.language,level,topic);ui.questions=[];ui.questionIndex=0;ui.quizScore=0;ui.choice=null;ui.answered=false;ui.kanaTraining=false;navigate("lesson");
}
function startKana(){
 const cells=KANA[ui.kanaSet].split(",").map((x,i)=>{
  const [symbol,latin]=x.split("|");
  return {id:"ja-kana-"+ui.kanaSet+"-"+i,source:"Welches Zeichen steht für „"+latin+"“?",answer:symbol,roman:latin,topic:ui.kanaSet,level:"A1"};
 });
 ui.deck=cells;ui.sessionKey="ja/scripts/"+ui.kanaSet;ui.phase="quiz";ui.kanaTraining=true;ui.questions=quizQuestions(shuffleDeterministic(cells,Math.floor(Date.now()/86400000)).slice(0,10),"kana");ui.questionIndex=0;ui.quizScore=0;ui.answered=false;ui.choice=null;navigate("lesson");
}
function beginningQuiz(){
 ui.phase="quiz";ui.questions=quizQuestions(ui.deck,"lesson");ui.questionIndex=0;ui.quizScore=0;ui.answered=false;ui.choice=null;renderPage();
}
function markReview(phrase,correct){
 const prev=db.reviews[phrase.id]||{interval:0};
 const interval=correct?Math.min(60,Math.max(1,prev.interval?prev.interval*2:1)):1;
 const next=new Date();next.setDate(next.getDate()+interval);
 db.reviews[phrase.id]={interval,due:dateKey(next),last:dateKey(),correct:!!correct};store();
}
function judgeAnswer(){
 const q=ui.questions[ui.questionIndex];if(!q||ui.answered)return;
 const guess=q.kind==="choice"||q.kind==="listen"?ui.choice:qs("#nv-written")?.value||"";
 if(!String(guess).trim()){toast("Bitte wähle oder schreibe zuerst eine Antwort.");return}
 const expected=q.kind==="listen"?q.phrase.source:q.phrase.answer;
 ui.correct=normalize(guess)===normalize(expected)||(q.kind==="write"&&db.romanAccept&&q.phrase.roman&&normalize(guess)===normalize(q.phrase.roman));
 if(ui.correct)ui.quizScore++;
 if(!ui.kanaTraining)markReview(q.phrase,ui.correct);
 ui.answered=true;renderPage();
}
function finishQuiz(){
 const passed=ui.quizScore>=Math.ceil(ui.questions.length*.75);
 const old=db.completed[ui.sessionKey];
 if(passed){
  if(!old?.passed){db.xp+=ui.kanaTraining?25:50;db.completed[ui.sessionKey]={passed:true,score:ui.quizScore,max:ui.questions.length,date:dateKey()}}
  else if((old.score||0)<ui.quizScore){db.completed[ui.sessionKey]={...old,score:ui.quizScore,max:ui.questions.length}}
  checkin(true);
 }
 store();ui.phase="result";renderPage();
}
function lessonPage(){
 const lang=currentLang();
 if(ui.phase==="result"){
  const count=ui.questions.length;const passed=ui.quizScore>=Math.ceil(count*.75);
  return '<div class="nv-exercises">'+hero("LEKTION ABSCHLUSS",passed?"Großartig gemacht!":"Weiter üben lohnt sich",passed?"Du hast den Check bestanden. Dein Fortschritt wurde gespeichert.":"Du hast noch ein paar Fehler. Wiederhole die Karten und probiere es erneut.",passed?"🏆":"📖","")+
   '<div class="nv-stat-grid"><div class="nv-stat"><strong>'+ui.quizScore+'/'+count+'</strong><span>Richtig beantwortet</span></div><div class="nv-stat"><strong>'+Math.round(ui.quizScore/count*100)+'%</strong><span>Ergebnis</span></div><div class="nv-stat"><strong>'+(passed?"✓":"↻")+'</strong><span>'+(passed?"Bestanden":"Wiederholen")+'</span></div><div class="nv-stat"><strong>'+esc(db.xp)+'</strong><span>Gesamte XP</span></div></div>'+
   '<div class="nv-actions">'+button("Zur Roadmap","go-roadmap","","primary")+button("Erneut üben","retry-lesson","","")+'</div><p class="nv-note">Für bestandene Lektionen werden XP nur beim ersten erfolgreichen Abschluss vergeben.</p></div>';
 }
 const note=(GRAMMAR_NOTES[lang.id]||[]).find(n=>n[0]===ui.level);
 const lessonTip=note?'<div class="nv-lesson-explainer"><span class="nv-kicker">WISSENSBAUSTEIN · '+esc(ui.level)+'</span><strong>'+esc(note[1])+'</strong><p>'+esc(note[2])+'</p></div>':"";
 const breadcrumb='<div class="nv-breadcrumb"><button data-action="go-roadmap">Roadmap</button> / '+esc(lang.name)+' / '+esc(ui.kanaTraining?ui.kanaSet:ui.level+" · "+ui.topic)+'</div>';
 if(ui.phase==="cards"){
  const p=ui.deck[ui.cardIndex];
  if(!p)return '<div class="nv-empty">Noch kein Lerninhalt vorhanden.</div>';
  return '<div class="nv-exercises">'+breadcrumb+lessonTip+
    heading("Neue Wörter entdecken","Lernkarte "+(ui.cardIndex+1)+" von "+ui.deck.length)+
    '<div class="nv-lesson-steps">'+ui.deck.map((_,i)=>'<span class="nv-step '+(i<ui.cardIndex?"done":i===ui.cardIndex?"active":"")+'"></span>').join("")+'</div>'+
    '<article class="nv-card nv-lesson-card"><span class="nv-kicker">DEUTSCH → '+esc(lang.name.toUpperCase())+'</span><h2>'+esc(p.source)+'</h2>'+
    '<p class="nv-lesson-note">Sprich den Satz laut nach und versuche dich zu erinnern, bevor du die Antwort öffnest.</p>'+
    (ui.cardRevealed?'<div class="nv-hr"></div><div class="nv-phrase">'+esc(p.answer)+'</div>'+(p.roman?'<div class="nv-pronunciation">Aussprachehilfe: '+esc(p.roman)+'</div>':""):'<div class="nv-empty" style="margin:20px 0">Tippe auf „Lösung zeigen“</div>')+
    '<div class="nv-actions">'+button("👁 Lösung "+(ui.cardRevealed?"verbergen":"zeigen"),"card-reveal","","")+
     button("🔊 Anhören","speak",'data-say="'+esc(p.answer)+'"',"")+'</div></article>'+
    '<div class="nv-card-foot">'+button("← Zurück","card-prev",ui.cardIndex===0?"disabled":"","")+
    button(ui.cardIndex===ui.deck.length-1?"Jetzt Wissen testen →":"Nächste Karte →","card-next","","primary")+'</div></div>';
 }
 const q=ui.questions[ui.questionIndex];
 if(!q)return '<div class="nv-empty">Es konnten keine Quizfragen erstellt werden.</div>';
 const choices=q.kind==="choice"||q.kind==="listen"?'<div class="nv-answer-choices">'+q.options.map((option,i)=>{
  const chosen=ui.choice===option;const answerRight=ui.answered&&option===(q.kind==="listen"?q.phrase.source:q.phrase.answer);const answerWrong=ui.answered&&chosen&&!ui.correct;
  return '<button type="button" data-action="quiz-choose" data-option="'+esc(option)+'" class="nv-choice '+(chosen?'selected ':'')+(answerRight?'correct ':'')+(answerWrong?'wrong':'')+'" '+(ui.answered?"disabled":"")+'><span class="nv-tiny">'+String.fromCharCode(65+i)+'</span><div>'+esc(option)+'</div></button>';
 }).join("")+'</div>':
 '<label for="nv-written" class="nv-muted">Schreibe die Übersetzung in der Zielsprache</label><input class="nv-input" id="nv-written" type="text" style="display:block;width:100%;margin:12px 0" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Deine Übersetzung …" '+(ui.answered?"disabled":"")+'>';
 return '<div class="nv-exercises">'+breadcrumb+
  heading(ui.kanaTraining?"Schriftzeichen-Challenge":"Wissen sichern","Frage "+(ui.questionIndex+1)+" von "+ui.questions.length+" · "+ui.quizScore+" richtig")+
  '<div class="nv-lesson-steps">'+ui.questions.map((_,i)=>'<span class="nv-step '+(i<ui.questionIndex?"done":i===ui.questionIndex?"active":"")+'"></span>').join("")+'</div>'+
  lessonTip+'<article class="nv-card nv-lesson-card"><span class="nv-kicker">'+(q.kind==="write"?"SCHREIBÜBUNG":q.kind==="listen"?"HÖRVERSTEHEN":"RICHTIGE ANTWORT WÄHLEN")+'</span><h2>'+(q.kind==="listen"?"Was hörst du?":esc(q.phrase.source))+'</h2><p class="nv-muted">'+(q.kind==="listen"?"Höre zu und wähle die deutsche Bedeutung.":"Was ist die richtige Übersetzung?")+'</p>'+(q.kind==="listen"?button("🔊 Satz abspielen","speak",'data-say="'+esc(q.phrase.answer)+'"',"primary"):"")+

  choices+
  (ui.answered?'<div class="nv-feedback '+(ui.correct?"good":"bad")+'"><strong>'+(ui.correct?"✓ Richtig!":"Noch nicht ganz.")+'</strong><div>Richtige Antwort: <strong>'+esc(q.kind==="listen"?q.phrase.source:q.phrase.answer)+'</strong>'+(q.phrase.roman?" · "+esc(q.phrase.roman):"")+'</div></div>':"")+
  '<div class="nv-actions">'+(ui.answered?button(ui.questionIndex===ui.questions.length-1?"Ergebnis anzeigen":"Nächste Frage →","quiz-next","","primary"):button("Antwort prüfen","quiz-check","","primary"))+
  (!ui.kanaTraining?button("🔊 Aussprache","speak",'data-say="'+esc(q.phrase.answer)+'"',""):"")+'</div></article>'+
  '<p class="nv-lesson-note">Schreibaufgaben prüfen die Eingabe inklusive Schriftzeichen. Zeichensetzung und Leerzeichen werden beim Vergleich ignoriert.</p></div>';
}
function vocabularyPage(){
 const lang=currentLang();
 const matches=getPhrases(db.language).filter(p=>(p.source+" "+p.answer+" "+p.topic).toLocaleLowerCase().includes(ui.vocabSearch.toLocaleLowerCase()));
 return hero("VOKABELTRAINER","Wörter. Wissen.<br>Wiederholen.","Wortschatz durch kleine Übungen festigen. Markiere deine Lieblingswörter und wiederhole sie zum passenden Zeitpunkt.","🧠",button("Fällige Vokabeln üben","study-due","","primary"))+
  '<div class="nv-stat-grid"><div class="nv-stat"><strong>'+getPhrases(db.language).length+'</strong><span>Vorhandene Einträge</span></div><div class="nv-stat"><strong>'+dueCount()+'</strong><span>Heute fällig</span></div><div class="nv-stat"><strong>'+db.favorites.filter(id=>id.startsWith(db.language+"-")).length+'</strong><span>Favoriten</span></div><div class="nv-stat"><strong>'+esc(lang.flag)+'</strong><span>Aktive Sprache</span></div></div>'+
  '<div class="nv-search-wrap"><input id="vocab-search" class="nv-input" type="search" aria-label="Vokabel suchen" placeholder="Vokabeln durchsuchen …" value="'+esc(ui.vocabSearch)+'"></div>'+
  '<div class="nv-vocab-grid">'+matches.map(p=>'<div class="nv-card nv-word"><div><span class="nv-kicker">'+esc(p.topic)+'</span><strong>'+esc(p.answer)+'</strong><small>'+esc(p.source)+'</small>'+(p.roman?'<small style="display:block;color:#89f2c7">'+esc(p.roman)+'</small>':"")+
  (db.reviews[p.id]?'<small class="nv-review-due" style="display:block">Nächste Wiederholung: '+esc(db.reviews[p.id].due)+'</small>':"")+'</div>'+
  '<div class="nv-word-actions"><button type="button" class="nv-iconbutton" data-action="speak" data-say="'+esc(p.answer)+'" title="Anhören">🔊</button><button type="button" class="nv-iconbutton" data-action="favorite" data-id="'+esc(p.id)+'" title="Favorisieren">'+(db.favorites.includes(p.id)?"★":"☆")+'</button></div></div>').join("")+'</div>'+
  (matches.length?"":'<div class="nv-empty">Keine Einträge gefunden.</div>');
}
function scriptsPage(){
 const lang=currentLang();
 if(lang.id!=="ja")return hero("SCHRIFT LERNEN","Japanische<br>Schriftzeichen","Dieses Schriftzeichen-Lab ist derzeit für Japanisch vorbereitet. Wähle Japanisch, um Hiragana und Katakana zu lernen.","あ",button("Japanisch wählen","select-lang",'data-id="ja"',"primary"));
 const cells=KANA[ui.kanaSet].split(",").map(x=>x.split("|"));
 return hero("JAPANISCH • SCHRIFT",ui.kanaSet+"<br>entdecken","Lerne die grundlegenden Zeichen der japanischen Silbenschriften und teste dich in einer 10-Fragen-Challenge.","あ",button("10 Zeichen testen","kana-practice","","primary"))+
  '<div class="nv-pill-row">'+Object.keys(KANA).map(k=>'<button type="button" class="nv-pill '+(ui.kanaSet===k?"active":"")+'" data-action="kana-set" data-id="'+k+'">'+k+'</button>').join("")+'</div>'+
  heading(ui.kanaSet+"-Tabelle",cells.length+" Grundzeichen · tippe zum Anhören")+
  '<div class="nv-kana">'+cells.map(([symbol,latin])=>'<button type="button" class="nv-kana-tile" data-action="speak" data-say="'+esc(symbol)+'" title="Aussprache anhören"><strong>'+esc(symbol)+'</strong><small>'+esc(latin)+'</small></button>').join("")+'</div>'+
  '<p class="nv-note">Hinweis: Die vollständige japanische Schrift umfasst zusätzlich kombinierte Zeichen, Dakuten, Yōon, lange Vokale und Kanji. Diese Übersicht konzentriert sich auf die Grundzeichen.</p>';
}
function speakingPage(){
 const lang=currentLang(),deck=getPhrases(lang.id).slice(0,25);
 return hero("SPRECHEN • SHADOWING","Hören.<br>Nachsprechen.","Höre dir eine Beispielphrase an und sprich sie nach. Falls der Browser Spracherkennung unterstützt, kannst du die erkannte Transkription vergleichen.","🎙",button("Zur Roadmap","go-roadmap","","primary"))+
  '<div class="nv-note">Mikrofon ist optional. Browser-Spracherkennung benötigt möglicherweise Internet und übermittelt Sprache an den jeweiligen Browseranbieter. Sie bewertet keine Aussprachequalität wie eine Lehrkraft.</div>'+
  heading("Dein Sprechstudio",esc(lang.name)+" · "+deck.length+" Beispielsätze")+
  '<div class="nv-grid two">'+deck.map(p=>
    '<article class="nv-card"><span class="nv-kicker">'+esc(p.topic)+'</span><h3>'+esc(p.source)+'</h3><div class="nv-phrase" style="font-size:clamp(21px,3vw,29px);margin:12px 0">'+esc(p.answer)+'</div>'+
    (p.roman?'<p class="nv-pronunciation">'+esc(p.roman)+'</p>':"")+
    '<div class="nv-actions">'+button("🔊 Anhören","speak",'data-say="'+esc(p.answer)+'"',"tiny")+button("🎙 Nachsprechen","record",'data-id="'+esc(p.id)+'"',"primary tiny")+'</div>'+
    '<div class="nv-feedback" style="display:none" id="speech-feedback-'+esc(p.id)+'" role="status"></div></article>'
  ).join("")+'</div>';
}
function recordSpeak(id){
 const phrase=getPhrases(db.language).find(p=>p.id===id);
 if(!phrase)return;
 const feedback=document.getElementById("speech-feedback-"+id);
 const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!Rec){toast("Spracherkennung steht in diesem Browser nicht zur Verfügung.");return}
 try{
  const rec=new Rec();
  rec.lang=currentLang().locale;rec.interimResults=false;rec.maxAlternatives=1;rec.continuous=false;
  if(feedback){feedback.style.display="block";feedback.textContent="🎙 Höre zu … Sprich jetzt den Satz."}
  rec.onresult=(event)=>{
   const text=event.results?.[0]?.[0]?.transcript||"";
   const expected=normalize(phrase.answer),actual=normalize(text);
   const distance=levenshtein(expected,actual);
   const accuracy=Math.max(0,Math.round((1-distance/Math.max(expected.length,actual.length,1))*100));
   if(feedback){feedback.textContent="Erkannt: "+text+" • Textübereinstimmung: "+accuracy+" %. "+(accuracy>=75?"Gut erkannt!":"Vergleiche den Satz und versuche es erneut.")+" Hinweis: keine zuverlässige Akzentbewertung.";feedback.className="nv-feedback "+(accuracy>=75?"good":"bad")}
  };
  rec.onerror=event=>{if(feedback)feedback.textContent="Spracherkennung nicht möglich ("+event.error+"). Bitte Browser- und Mikrofonrechte prüfen."};
  rec.onnomatch=()=>{if(feedback)feedback.textContent="Nichts sicher erkannt. Bitte noch einmal versuchen."};
  rec.start();
 }catch{toast("Das Mikrofon konnte nicht gestartet werden.")}
}
function levenshtein(a,b){
 const prev=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){
  let before=prev[0];prev[0]=i;
  for(let j=1;j<=b.length;j++){
   const up=prev[j];
   prev[j]=Math.min(prev[j]+1,prev[j-1]+1,before+(a[i-1]===b[j-1]?0:1));
   before=up;
  }
 }
 return prev[b.length];
}
function profilePage(){return renderExtra("profile",extraContext())}
function settingsPage(){
 return hero("PERSÖNLICHE EINSTELLUNGEN","So lernst du<br>am liebsten.","Passe dein Lernerlebnis an. Einstellungen und Fortschritte bleiben lokal auf deinem Gerät.","⚙",button("Fortschritt sichern","export","","primary"))+
  '<div class="nv-grid two"><section class="nv-card"><span class="nv-kicker">DARSTELLUNG</span><h3>Design & Animationen</h3>'+
  '<div class="nv-form-row"><label for="setting-theme">Darstellung</label><select class="nv-select" id="setting-theme"><option value="dark" '+(db.theme==="dark"?"selected":"")+'>NovaLab Dark</option><option value="light" '+(db.theme==="light"?"selected":"")+'>Hell</option></select></div>'+
  '<div class="nv-form-row"><label for="setting-animation">Animationen</label><input id="setting-animation" type="checkbox" '+(db.animations?"checked":"")+'></div></section>'+
  '<section class="nv-card"><span class="nv-kicker">SCHREIBEN</span><h3>Übersetzungen prüfen</h3><p>Umschrift bei Sprachen wie Japanisch optional akzeptieren. Für echtes Schreibenlernen ist die Originalschrift empfohlen.</p><div class="nv-form-row"><label for="setting-roman">Romaji / Umschrift erlauben</label><input id="setting-roman" type="checkbox" '+(db.romanAccept?"checked":"")+'></div></section>'+
  '<section class="nv-card"><span class="nv-kicker">LERNEN</span><h3>Fokus-Timer</h3><p>Stelle eine persönliche Lernsession ein. Timer läuft weiter, solange die Website geöffnet ist.</p>'+
  '<div class="nv-form-row"><label for="setting-timer">Minuten</label><select class="nv-select" id="setting-timer">'+[5,15,25,45,60].map(n=>'<option value="'+n+'" '+(db.focusMinutes===n?"selected":"")+'>'+n+' Min</option>').join("")+'</select></div>'+
  '<div class="nv-actions">'+button("Timer öffnen","timer","","tiny")+'</div></section>'+
  '<section class="nv-card"><span class="nv-kicker">DATEN</span><h3>Fortschritt exportieren</h3><p>Speichere deinen Fortschritt als JSON-Datei und importiere ihn später auf einem anderen Gerät.</p>'+
  '<div class="nv-actions">'+button("⬇ Exportieren","export","","primary tiny")+'<label for="import-file" class="nv-btn tiny" tabindex="0">⬆ Importieren</label><input id="import-file" type="file" accept=".json,application/json" class="nv-is-hidden"></div></section>'+
  '<section class="nv-card"><span class="nv-kicker">DATENSCHUTZ</span><h3>Lokale Daten</h3><p>Keine Accounts, kein Cloud-Upload. Eine Browser-Datenlöschung entfernt den lokalen Lernstand.</p>'+
  '<div class="nv-actions">'+button("Lernstand zurücksetzen","reset-request","","danger tiny")+'</div></section></div>';
}
function helpPage(){
 return hero("HILFE & TRANSPARENZ","Lernen mit<br>NovaLab Academy.","Diese Website ist die erste Version einer eigenständigen Sprachlern-Academy mit Roadmaps, praktischen Übungen und lokalem Fortschritt.","💬",button("Sprachen entdecken","go-languages","","primary"))+
  '<div class="nv-grid two">'+[
  ["Wie starte ich?","Wähle unter Sprachen ein Ziel und öffne anschließend die Roadmap. Verfügbare Lernmodule sind direkt anklickbar."],
  ["Wie funktioniert die Prüfung?","Nach den Lernkarten folgen Multiple-Choice- und Schreibfragen. Mit mindestens 75 % richtigen Antworten ist das Modul bestanden."],
  ["Kann ich wirklich bis C2 lernen?","Die komplette A1–C2-Roadmap ist geplant und sichtbar. Bislang sind nur einzelne Module tatsächlich gefüllt; fehlende Module sind gesperrt und werden ausgebaut."],
  ["Geht das Sprechen?","Das Abspielen von Beispielen nutzt die Sprachausgabe des Browsers. Verfügbare Stimmen und Aussprachequalität unterscheiden sich zwischen Geräten."],
  ["Wird mein Lernstand gespeichert?","Ja, über localStorage im verwendeten Browser. Um ein anderes Gerät zu nutzen, exportiere und importiere die Sicherungsdatei."],
  ["Wer macht die Academy?","NovaLab Academy Languages ist ein unabhängiger Lernzweig. Made with 💙 by NyxAtheris."]
  ].map(x=>'<article class="nv-card"><h3>'+x[0]+'</h3><p>'+x[1]+'</p></article>').join("")+'</div>';
}
function extraContext(){return {db,ui,lang:currentLang(),phrases:getPhrases(db.language),LEVELS,esc,button,hero,heading,stats,getTopicPhrases,grammar:GRAMMAR_NOTES[db.language]||[]}}
function extraPage(route){return renderExtra(route,extraContext())}
function renderPage(){
 const routes={home:homePage,languages:languagesPage,roadmap:roadmapPage,lesson:lessonPage,vocabulary:vocabularyPage,scripts:scriptsPage,speaking:speakingPage,writing:()=>extraPage("writing"),exams:()=>extraPage("exams"),grammar:()=>extraPage("grammar"),shop:()=>extraPage("shop"),support:()=>extraPage("support"),achievements:()=>extraPage("achievements"),profile:profilePage,settings:settingsPage,help:helpPage};
 main.innerHTML=(routes[ui.route]||homePage)();
 renderNavigation();renderHeader();
}
function speak(textValue){
 const synth=window.speechSynthesis;
 if(!synth||typeof SpeechSynthesisUtterance==="undefined"){toast("Sprachausgabe wird von deinem Browser nicht unterstützt.");return}
 try{const utter=new SpeechSynthesisUtterance(textValue);utter.lang=currentLang().locale;utter.rate=db.language==="ja"?.8:.87;synth.cancel();synth.speak(utter)}
 catch{toast("Die Sprachausgabe konnte nicht gestartet werden.")}
}
function goAction(a,el){
 if(a==="menu"){openMenu();return}
 if(a==="menu-close"){closeMenu();return}
 if(a==="go-languages"){navigate("languages");return}
 if(a==="go-roadmap"){navigate("roadmap");return}
 if(a==="go-vocab"){navigate("vocabulary");return}
 if(a==="go-scripts"){navigate("scripts");return}
 if(a==="go-speaking"){navigate("speaking");return}
 if(a==="go-writing"){navigate("writing");return}
 if(a==="go-exams"){navigate("exams");return}
 if(a==="go-grammar"){navigate("grammar");return}
 if(a==="go-shop"){navigate("shop");return}
 if(a==="go-support"){navigate("support");return}
 if(a==="go-achievements"){navigate("achievements");return}
 if(a==="checkin"){checkin();return}
 if(a==="featured-filter"){ui.onlyFavorites=!ui.onlyFavorites;renderPage();return}
 if(a==="select-lang"){
  const id=el.dataset.id;if(!LANGUAGES.some(l=>l.id===id))return;
  db.language=id;store();ui.level="A1";ui.search="";ui.writeDeck=[];ui.writeResult=null;ui.writeIndex=0;navigate("roadmap");return
 }
 if(a==="start-lesson"){startLesson(el.dataset.topic,el.dataset.level);return}
 if(a==="card-reveal"){ui.cardRevealed=!ui.cardRevealed;renderPage();return}
 if(a==="card-prev"){ui.cardIndex=Math.max(0,ui.cardIndex-1);ui.cardRevealed=false;renderPage();return}
 if(a==="card-next"){
  if(ui.cardIndex<ui.deck.length-1){ui.cardIndex++;ui.cardRevealed=false;renderPage()}
  else beginningQuiz();
  return
 }
 if(a==="quiz-choose"){if(ui.answered)return;ui.choice=el.dataset.option;renderPage();return}
 if(a==="quiz-check"){judgeAnswer();return}
 if(a==="quiz-next"){
  if(!ui.answered)return;
  if(ui.questionIndex+1<ui.questions.length){ui.questionIndex++;ui.choice=null;ui.answered=false;renderPage()}
  else finishQuiz();
  return
 }
 if(a==="retry-lesson"){if(ui.kanaTraining){startKana()}else startLesson(ui.topic,ui.level);return}
 if(a==="speak"){speak(el.dataset.say||"");return}
 if(a==="record"){recordSpeak(el.dataset.id);return}
 if(a==="favorite"){
  const id=el.dataset.id;if(!getPhrases(db.language).some(p=>p.id===id))return;
  db.favorites=db.favorites.includes(id)?db.favorites.filter(x=>x!==id):db.favorites.concat(id);
  store();renderPage();return;
 }
 if(a==="study-due"){
  const due=getPhrases(db.language).filter(p=>db.reviews[p.id]&&db.reviews[p.id].due<=dateKey());
  if(due.length<2){toast("Noch keine zwei fälligen Karten. Öffne erst eine Lektion.");return}
  ui.deck=due.slice(0,15);ui.sessionKey=db.language+"/review/"+dateKey();ui.kanaTraining=false;ui.phase="cards";ui.cardIndex=0;ui.cardRevealed=false;ui.topic="Wiederholung";ui.level="A1";navigate("lesson");return;
 }
 if(a==="kana-set"){if(Object.hasOwn(KANA,el.dataset.id)){ui.kanaSet=el.dataset.id;renderPage()}return}
 if(a==="kana-practice"){startKana();return}
 if(a==="save-name"){
 db.name=(qs("#profile-name")?.value||"Sprachentdecker").trim().slice(0,28)||"Sprachentdecker";
 db.profileTitle=(qs("#profile-title")?.value||"Sprachentdecker").trim().slice(0,36)||"Sprachentdecker";
 db.bio=(qs("#profile-bio")?.value||"").trim().slice(0,140);store();renderPage();toast("Profil gespeichert.");return
 }
 if(a==="avatar-change"){db.profileAvatar=el.dataset.avatar==="initials"?"initials":"novalab";store();renderPage();return}
 if(a==="writing-reset"){ui.writeDeck=shuffleDeterministic(getPhrases(db.language),Math.floor(Math.random()*100000));ui.writeIndex=0;ui.writeResult=null;ui.writeDraft="";ui.writeHint=false;renderPage();return}
 if(a==="writing-dir"){ui.writeDirection=el.dataset.mode==="backward"?"backward":"forward";ui.writeResult=null;ui.writeDraft="";ui.writeHint=false;renderPage();return}
 if(a==="writing-hint"){ui.writeHint=!ui.writeHint;renderPage();return}
 if(a==="writing-next"){const n=(ui.writeDeck.length||getPhrases(db.language).length);ui.writeIndex=(ui.writeIndex+1)%Math.max(1,n);ui.writeResult=null;ui.writeDraft="";ui.writeHint=false;renderPage();return}
 if(a==="writing-check"){
  const pool=ui.writeDeck.length?ui.writeDeck:getPhrases(db.language),p=pool[ui.writeIndex%pool.length];
  const entered=(qs("#writing-answer")?.value||"").trim();if(!entered){toast("Bitte zuerst eine Antwort eingeben.");return}
  const backward=ui.writeDirection==="backward",target=backward?p.source:p.answer;
  const correct=normalize(entered)===normalize(target)||(!backward&&db.romanAccept&&p.roman&&normalize(entered)===normalize(p.roman));
  ui.writeResult={correct,given:entered};ui.writeDraft=entered;markReview(p,correct);renderPage();return;
 }
 if(a==="shop-term"){const n=Number(el.dataset.term);if([1,3,12].includes(n)){ui.shopTerm=n;renderPage()}return}
 if(a==="plan-interest"){ui.supportSubject="Beta-Anfrage: "+String(el.dataset.plan||"Plus").slice(0,20);navigate("support");const category=qs("#support-category");if(category)category.value="Mitgliedschaft / Beta";return}
 if(a==="open-discord"){window.open(DISCORD_URL,"_blank","noopener,noreferrer");return}
 if(a==="send-support"){
  const subject=(qs("#support-subject")?.value||"").trim(),body=(qs("#support-body")?.value||"").trim();
  const type=qs("#support-category")?.value||"Allgemeine Frage";
  if(subject.length<5||body.length<12){toast("Bitte einen Betreff (mind. 5 Zeichen) und eine Beschreibung (mind. 12 Zeichen) eingeben.");return}
  const url=ISSUE_URL+"?title="+encodeURIComponent("["+type+"] "+subject)+"&body="+encodeURIComponent(body+"\n\n---\nNovaLab Academy Languages\nSprache: "+currentLang().name);
  window.open(url,"_blank","noopener,noreferrer");toast("GitHub-Anfrage geöffnet – dort noch bestätigen.");return
 }
 if(a==="timer"){renderTimerModal();return}
 if(a==="timer-toggle"){timer.running=!timer.running;renderTimerModal();return}
 if(a==="timer-reset"){timer.running=false;timer.seconds=db.focusMinutes*60;renderHeader();renderTimerModal();return}
 if(a==="modal-close"){modal.innerHTML="";return}
 if(a==="export"){exportData();return}
 if(a==="reset-request"){modal.innerHTML='<div class="nv-modal-wrap"><div class="nv-modal" role="dialog" aria-modal="true"><h2>Fortschritt wirklich löschen?</h2><p class="nv-muted">XP, Streaks, Lernstände und Einstellungen werden nur aus diesem Browser gelöscht. Eine zuvor exportierte Sicherung bleibt erhalten.</p><div class="nv-actions">'+button("Abbrechen","modal-close","","")+button("Ja, löschen","reset-confirm","","danger")+'</div></div></div>';return}
 if(a==="reset-confirm"){db={...DEFAULT,completed:{},reviews:{},favorites:[],streak:{date:"",count:0}};store();modal.innerHTML="";timer.running=false;timer.seconds=db.focusMinutes*60;navigate("home");toast("Lokaler Lernstand zurückgesetzt.");return}
}
function renderTimerModal(){
 modal.innerHTML='<div class="nv-modal-wrap" data-action="modal-close"><div class="nv-modal" role="dialog" aria-modal="true" aria-label="Fokus-Timer"><span class="nv-kicker">LERNE IN DEINEM TEMPO</span><h2>Dein Fokus-Timer</h2><div id="timer-time" style="font-size:58px;font-weight:950;letter-spacing:-.06em;margin:14px 0;color:#8ff9cf">'+timerText()+'</div><p class="nv-muted">Du kannst den Timer pausieren oder in den Einstellungen eine andere Dauer wählen.</p><div class="nv-actions">'+button(timer.running?"⏸ Pausieren":"▶ Starten","timer-toggle","","primary")+button("↻ Zurücksetzen","timer-reset")+button("Schließen","modal-close")+'</div></div></div>';
}
function exportData(){
 const textData=JSON.stringify({schema:1,exportedAt:new Date().toISOString(),data:db},null,2);
 const b=new Blob([textData],{type:"application/json;charset=utf-8"});
 const link=document.createElement("a");link.href=URL.createObjectURL(b);link.download="novalab-fortschritt-"+dateKey()+".json";document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),2000);
 toast("Fortschritt wurde als Datei vorbereitet.");
}
document.addEventListener("click",event=>{
 const el=event.target.closest("[data-nav],[data-action]");
 if(!el)return;
 if(el.hasAttribute("data-nav")){event.preventDefault();navigate(el.dataset.nav);return}
 const action=el.dataset.action;
 if(action==="modal-close"&&el.classList.contains("nv-modal-wrap")){modal.innerHTML="";return}
 if(action==="modal-close"&&event.target!==el&&el.classList.contains("nv-modal-wrap"))return;
 event.preventDefault();goAction(action,el);
});
document.addEventListener("input",event=>{
 if(event.target.id==="writing-answer"){ui.writeDraft=event.target.value;return}
 if(event.target.id==="language-search"||event.target.id==="vocab-search"){
  const field=event.target,position=field.selectionStart,which=field.id;
  if(which==="language-search")ui.search=field.value;else ui.vocabSearch=field.value;
  renderPage();const next=qs("#"+which);
  if(next){next.focus();try{next.setSelectionRange(position,position)}catch{}}
 }
});
document.addEventListener("change",async event=>{
 const el=event.target;
 if(el.id==="setting-theme"){db.theme=el.value==="light"?"light":"dark";store();renderPage()}
 if(el.id==="setting-animation"){db.animations=!!el.checked;store();renderPage()}
 if(el.id==="setting-roman"){db.romanAccept=!!el.checked;store();renderPage()}
 if(el.id==="setting-timer"){
  const n=Number(el.value);if([5,15,25,45,60].includes(n)){db.focusMinutes=n;timer.running=false;timer.seconds=n*60;store();renderPage()}
 }
 if(el.id==="avatar-upload"&&el.files?.[0]){
  const file=el.files[0];if(!["image/png","image/jpeg","image/webp"].includes(file.type)||file.size>300000){toast("Bitte ein PNG-, JPG- oder WebP-Bild bis 300 KB wählen.");return}
  const reader=new FileReader();reader.onload=()=>{
   const value=String(reader.result||"");if(!/^data:image\/(?:png|jpeg|webp);base64,/.test(value))return;
   db.customAvatar=value;db.profileAvatar="custom";store();renderPage();toast("Eigenes Profilbild gespeichert.");
  };reader.onerror=()=>toast("Das Profilbild konnte nicht gelesen werden.");reader.readAsDataURL(file);return
 }
 if(el.id==="import-file"&&el.files?.[0]){
  const file=el.files[0];
  if(file.size>1024*1024){toast("Die Sicherungsdatei darf höchstens 1 MB groß sein.");return}
  try{
   const parsed=JSON.parse(await file.text());
   if(parsed.schema!==1||!parsed.data||typeof parsed.data!=="object"||Array.isArray(parsed.data))throw Error("Format");
   const d=parsed.data;
   db={...DEFAULT,...d,language:LANGUAGES.some(l=>l.id===d.language)?d.language:"ja",name:String(d.name||"Sprachentdecker").slice(0,28),xp:Number.isFinite(Number(d.xp))?Math.min(1e7,Math.max(0,Number(d.xp))):0,
   completed:d.completed&&typeof d.completed==="object"&&!Array.isArray(d.completed)?d.completed:{},reviews:d.reviews&&typeof d.reviews==="object"&&!Array.isArray(d.reviews)?d.reviews:{},
   favorites:Array.isArray(d.favorites)?d.favorites.filter(x=>typeof x==="string").slice(0,1000):[],streak:d.streak&&typeof d.streak==="object"?d.streak:{date:"",count:0},
   focusMinutes:[5,15,25,45,60].includes(d.focusMinutes)?d.focusMinutes:25,theme:d.theme==="light"?"light":"dark",animations:d.animations!==false,profileAvatar:["novalab","initials","custom"].includes(d.profileAvatar)?d.profileAvatar:"novalab",
 customAvatar:typeof d.customAvatar==="string"&&d.customAvatar.length<450000&&/^data:image\/(?:png|jpeg|webp);base64,/.test(d.customAvatar)?d.customAvatar:null,
 profileTitle:String(d.profileTitle||"Sprachentdecker").slice(0,36),bio:String(d.bio||"").slice(0,140),romanAccept:!!d.romanAccept};
   timer.seconds=db.focusMinutes*60;timer.running=false;store();navigate("home");toast("Fortschritt importiert!");
  }catch{toast("Ungültige Sicherungsdatei. Import wurde abgebrochen.")}
 }
});
document.addEventListener("keydown",event=>{
 if(event.key==="Escape"){modal.innerHTML="";closeMenu()}
 if(event.key==="Enter"&&event.target.id==="nv-written"){event.preventDefault();judgeAnswer()}
 if(event.key==="Enter"&&event.target.id==="writing-answer"&&(event.ctrlKey||event.metaKey)){event.preventDefault();goAction("writing-check",event.target)}
});
window.addEventListener("hashchange",()=>{const r=location.hash.slice(1);if(r!==ui.route)navigate(r,false)});
const first=location.hash.slice(1);
if(NAV.some(n=>n[0]===first))ui.route=first;
renderPage();

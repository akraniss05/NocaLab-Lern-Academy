/* NovaLab Academy Languages: expanded UI modules, pure renderers */
export const PLANS=[
 {name:"Free",perMonth:0,info:"Kostenloser Zugang zur Academy",points:["Basislektionen & Vokabeln","Lernkarten und Schreibübungen","Persönlicher Lernstand"]},
 {name:"Plus",perMonth:1.99,info:"Geplant: doppelte Lernkontingente gegenüber Free",points:["Mehr tägliche Übungen","Erweiterte Wiederholungen","Weitere Übungsprüfungen"]},
 {name:"Ultimate",perMonth:5.99,info:"Geplant: dreifache Lernkontingente gegenüber Free",points:["Höhere Lernkontingente","Mehr Lernmaterial","Vertiefende Übungen"]},
 {name:"Max",perMonth:11.99,info:"Geplant: alle veröffentlichten Premium-Funktionen",points:["Alle Premium-Inhalte","Unbegrenztes geplantes Kontingent","Alle Premium-Übungsprüfungen"]}
];
export const DISCORD_URL="https://discord.gg/livery-lab";
export const ISSUE_URL="https://github.com/akraniss05/NocaLab-Lern-Academy/issues/new";
const money=n=>n.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
export function avatarSrc(db){
 if(db.profileAvatar==="initials")return null;
 if(db.profileAvatar==="custom"&&typeof db.customAvatar==="string"&&db.customAvatar.length<450000&&/^data:image\/(?:png|jpeg|webp);base64,/.test(db.customAvatar))return db.customAvatar;
 return "./assets/novalab-logo.webp";
}
export function avatarMarkup(db,escape,cls="nv-profile-avatar"){
 const src=avatarSrc(db);
 return src?'<img src="'+escape(src)+'" class="'+cls+'" alt="Profilbild">':'<span class="'+cls+' nv-initial-avatar">'+escape((db.name||"N").slice(0,1).toUpperCase())+'</span>';
}
export function bannerMarkup(){
 return '<div class="nv-brand-banner"><img src="./assets/novalab-banner.webp" alt="NovaLab Academy – violette Lichter über einer Stadt" loading="eager"><div class="nv-banner-caption"><strong>NovaLab Academy</strong><span>LANGUAGE LEARNING • LEARN. SPEAK. GROW.</span></div></div>';
}
function writePage(c){
 const {db,ui,lang,phrases,esc,button,hero,heading}=c;
 const deck=ui.writeDeck?.length?ui.writeDeck:phrases;
 const ix=(ui.writeIndex||0)%deck.length,p=deck[ix];
 if(!p)return '<div class="nv-empty">Für diesen Kurs gibt es noch keine Schreibübungen.</div>';
 const backwards=ui.writeDirection==="backward";
 const prompt=backwards?p.answer:p.source,expected=backwards?p.source:p.answer;
 const result=ui.writeResult;
 return hero("NOVA WRITING STUDIO","Schreiben.<br>Wissen sichern.","Übe Schriftzeichen, Wörter und kurze Sätze. Mit Hilfestellungen und genauem Lösungsvergleich.","✎",button("Neu mischen","writing-reset","","primary"))+
 '<div class="nv-grid two nv-writing-grid"><article class="nv-card nv-writing-main"><span class="nv-kicker">AUFGABE '+(ix+1)+' / '+deck.length+'</span><div class="nv-pill-row nv-writing-toggle">'+
 '<button class="nv-pill '+(!backwards?'active':'')+'" data-action="writing-dir" data-mode="forward">Deutsch → '+esc(lang.name)+'</button>'+
 '<button class="nv-pill '+(backwards?'active':'')+'" data-action="writing-dir" data-mode="backward">'+esc(lang.name)+' → Deutsch</button></div>'+
 '<h2 class="nv-writing-prompt">'+esc(prompt)+'</h2><p class="nv-muted">Übersetze den Satz '+(backwards?"ins Deutsche":"in die Lernsprache")+'.</p>'+
 '<textarea class="nv-input nv-writing-field" id="writing-answer" maxlength="250" rows="3" placeholder="Schreibe deine Antwort …" spellcheck="false" autocapitalize="off" autocorrect="off" '+(result?'disabled':'')+'>'+esc(ui.writeDraft||"")+'</textarea>'+
 '<div class="nv-actions">'+(result?button("Nächste Aufgabe →","writing-next","","primary"):button("Antwort prüfen","writing-check","","primary"))+
 button("Hinweis","writing-hint","","tiny")+button("🔊 Hören","speak",'data-say="'+esc(p.answer)+'"',"tiny")+'</div>'+
 (ui.writeHint?'<div class="nv-feedback"><strong>Tipp</strong><p>'+(p.roman&&!backwards?'Aussprache: '+esc(p.roman):'Die Musterlösung beginnt mit: '+esc(expected.slice(0,Math.max(2,Math.min(5,expected.length))))+'…')+'</p></div>':'')+
 (result?'<div class="nv-feedback '+(result.correct?"good":"bad")+'"><strong>'+(result.correct?"✓ Richtig geschrieben!":"✎ Noch nicht ganz richtig")+'</strong><p>Deine Antwort: <em>'+esc(result.given)+'</em></p><p>Musterlösung: <strong>'+esc(expected)+'</strong></p>'+(p.roman?'<small>'+esc(p.roman)+'</small>':'')+'</div>':'')+
 '</article><aside class="nv-card nv-writing-aside"><span class="nv-kicker">DEINE LERNHILFE</span><h3>'+esc(p.topic)+'</h3><div class="nv-progress"><span style="width:'+Math.round(ix/deck.length*100)+'%"></span></div><p>Höre dir den Satz an, merke dir die Struktur und versuche, ihn selbst zu formulieren.</p>'+
 '<p>Antworten werden mit einer Musterübersetzung verglichen. Andere korrekte Formulierungen sind möglich und werden noch nicht automatisch erkannt.</p>'+
 '<div class="nv-card-foot">'+button("Grammatik lernen","go-grammar","","tiny")+button("Zur Roadmap","go-roadmap","","tiny")+'</div></aside></div>';
}
function examsPage(c){
 const {ui,lang,LEVELS,db,esc,button,hero,heading,getTopicPhrases}=c;
 return hero("NOVA EXAM CENTER","Wissen testen.<br>Erfolge feiern.","Teste deinen Wortschatz mit echten Fragen aus den verfügbaren Lernmodulen. Fehlende Prüfungen bleiben ehrlich als geplant markiert.","🏆",button("Roadmap ansehen","go-roadmap","","primary"))+
 heading("Deine Sprachprüfungen","Mini-Tests für "+esc(lang.name))+
 '<div class="nv-grid">'+LEVELS.map(level=>{
 const deck=getTopicPhrases(lang.id,level.id+"-Check",level.id),ready=deck.length>=3;
 const key=[lang.id,level.id,level.id+"-Check"].join("/");
 const passed=!!db.completed[key]?.passed;
 return '<article class="nv-card nv-exam-card"><span class="nv-tag '+(passed?"mint":"")+'">'+esc(level.id)+' · '+(passed?"BESTANDEN":"MINI-TEST")+'</span><h3>'+esc(level.name)+'</h3><p>'+deck.length+' verfügbare Beispielsätze</p><p>Erfolgreich mit mindestens 75 % richtigen Antworten.</p>'+
 '<div class="nv-card-foot">'+button(ready?"Jetzt testen":"Noch in Vorbereitung","start-lesson",'data-level="'+level.id+'" data-topic="'+level.id+'-Check" '+(ready?"":"disabled"),"primary tiny")+'</div></article>';
 }).join("")+'</div>'+
 '<div class="nv-note">Diese Tests prüfen einzelne Lerninhalte; sie sind keine offiziellen Sprachzertifikate und beweisen noch keine umfassende A1–C2-Kompetenz.</div>';
}
function grammarPage(c){
 const {lang,grammar,esc,button,hero,heading}=c;
 return hero("NOVA KNOWLEDGE LIBRARY","Grammatik<br>einfach erklärt.","Verstehe wichtige Regeln mit Beispielen. Je nach Sprache werden weitere Kapitel ergänzt.","📚",button("Im Schreibstudio üben","go-writing","","primary"))+
 heading("Grammatik für "+esc(lang.name),grammar.length+" verständliche Erklärungen")+
 (grammar.length?'<div class="nv-grid two">'+grammar.map(x=>'<article class="nv-card nv-grammar-card"><span class="nv-tag mint">'+esc(x[0])+'</span><h3>'+esc(x[1])+'</h3><p>'+esc(x[2])+'</p></article>').join("")+'</div>':'<div class="nv-empty">Für diese Sprache werden ausführlichere Erklärungen noch vorbereitet. Der Starterwortschatz ist bereits lernbar.</div>')+
 '<div class="nv-note">Kurzregeln ersetzen kein vollständiges Grammatiklehrbuch. Dialekte, Ausnahmen und Sprachniveaus werden bei weiteren Ausbaustufen ergänzt.</div>';
}
function achievementPage(c){
 const {db,esc,button,hero,heading}=c,passed=Object.values(db.completed).filter(x=>x?.passed).length;
 const trophies=[
 ["🌱","Erste Schritte","Erste Lektion abschließen",passed>=1],
 ["⭐","Wortfinder","100 XP sammeln",db.xp>=100],
 ["⚡","Lernprofi","500 XP sammeln",db.xp>=500],
 ["🗺️","Entdecker","5 Lektionen bestehen",passed>=5],
 ["🔥","3-Tage-Serie","3 Tage in Folge einchecken",db.streak.count>=3],
 ["💜","Sammler","5 Wörter favorisieren",db.favorites.length>=5],
 ["🏆","Prüfungsheld","Einen Kapitel-Check bestehen",Object.keys(db.completed).some(k=>k.endsWith("-Check")&&db.completed[k]?.passed)],
 ["🌍","Weltenbummler","10 Lektionen bestehen",passed>=10]];
 return hero("NOVA ACHIEVEMENTS","Deine Erfolge.<br>Dein Weg.","Freischaltbare Abzeichen für Lernfortschritt, Streaks und Prüfungen. Deine Leistungen bleiben lokal gespeichert.","🏅",button("Weiterlernen","go-roadmap","","primary"))+
 heading("Erfolge & Meilensteine",trophies.filter(t=>t[3]).length+" von "+trophies.length+" freigeschaltet")+
 '<div class="nv-grid">'+trophies.map(t=>'<article class="nv-card nv-trophy '+(t[3]?"unlocked":"locked")+'"><span class="nv-trophy-symbol">'+(t[3]?t[0]:"🔒")+'</span><h3>'+esc(t[1])+'</h3><p>'+esc(t[2])+'</p><span class="nv-tag '+(t[3]?"mint":"ghost")+'">'+(t[3]?"Freigeschaltet":"Noch gesperrt")+'</span></article>').join("")+'</div>';
}
function shopPage(c){
 const {ui,esc,button,hero,heading}=c,period=[1,3,12].includes(ui.shopTerm)?ui.shopTerm:1;
 return hero("NOVA MEMBERSHIPS","Free. Plus.<br>Ultimate. Max.","Vergleiche die geplanten Mitgliedschaften und Laufzeiten. Du kannst aktuell kostenlos lernen; bezahlte Pakete sind noch nicht freigeschaltet.","◇",button("Kostenlos lernen","go-roadmap","","primary"))+
 '<div class="nv-note">Shop-Vorschau: Noch keine Zahlungen, keine Aboverwaltung und keine kostenpflichtige Freischaltung. Alle vorhandenen Lerninhalte bleiben derzeit gratis erreichbar.</div>'+
 heading("Wähle deine Laufzeit","Vorgesehene Preise für 1 Monat, 3 Monate oder 1 Jahr")+
 '<div class="nv-pill-row nv-shop-terms">'+[[1,"1 Monat"],[3,"3 Monate"],[12,"12 Monate · 5 % Rabatt"]].map(x=>'<button class="nv-pill '+(period===x[0]?"active":"")+'" data-action="shop-term" data-term="'+x[0]+'">'+x[1]+'</button>').join("")+'</div>'+
 '<div class="nv-grid nv-pricing-grid">'+PLANS.map(p=>{
 const total=p.perMonth*period*(period===12 ? .95 : 1);
 return '<article class="nv-card nv-plan '+(p.name==="Max"?"featured":"")+'"><span class="nv-tag '+(p.name==="Free"?"mint":"")+'">'+(p.name==="Free"?"Kostenlos":"Geplant · Beta")+'</span><h2>'+p.name+'</h2>'+
 '<div class="nv-plan-cost">'+money(total/period)+'<small> / Monat</small></div><p>'+esc(p.info)+'</p>'+
 '<p class="nv-plan-total">Gesamt '+period+' '+(period===1?"Monat":"Monate")+': <strong>'+money(total)+'</strong></p><ul>'+p.points.map(x=>'<li>✓ '+esc(x)+'</li>').join("")+'</ul>'+
 '<div class="nv-card-foot">'+button(p.perMonth?"Beta-Interesse melden":"Gratis starten",p.perMonth?"plan-interest":"go-roadmap",'data-plan="'+esc(p.name)+'"',"primary")+'</div></article>';
 }).join("")+'</div>'+
 '<p class="nv-note">Hinweis: Die Preise sind nur eine Planung, kein rechtsverbindliches Verkaufsangebot. Shop, Abonnements und Zahlungsabwicklung sind noch nicht aktiv.</p>';
}
function supportPage(c){
 const {ui,esc,button,hero}=c;
 return hero("NOVA SUPPORT","Wir hören<br>dir zu.","Melde Fehler, stelle Fragen oder schlage neue Sprachen vor. Nutze unseren Discord oder erstelle eine GitHub-Anfrage.","✉",button("Zum Discord","open-discord","","primary"))+
 '<div class="nv-grid two"><article class="nv-card"><span class="nv-kicker">SUPPORT-ANFRAGE</span><h3>Deine Nachricht</h3>'+
 '<p>Die Anfrage wird auf GitHub vorbereitet. Zum tatsächlichen Absenden brauchst du dort ein GitHub-Konto.</p>'+
 '<label for="support-category">Kategorie</label><select id="support-category" class="nv-select nv-full">'+["Fehler","Verbesserung","Neue Sprache","Mitgliedschaft / Beta","Allgemeine Frage"].map(x=>'<option>'+x+'</option>').join("")+'</select>'+
 '<label for="support-subject">Betreff</label><input id="support-subject" class="nv-input nv-full" maxlength="100" value="'+esc(ui.supportSubject||"")+'" placeholder="Worum geht es?">'+
 '<label for="support-body">Nachricht</label><textarea id="support-body" class="nv-input nv-full" rows="6" maxlength="3000" placeholder="Was möchtest du melden oder fragen?"></textarea>'+
 '<p class="nv-tiny">GitHub-Issues sind öffentlich. Bitte niemals Passwörter, Tokens oder private Daten hineinschreiben.</p>'+
 '<div class="nv-actions">'+button("Auf GitHub fortfahren","send-support","","primary")+button("Discord öffnen","open-discord","","tiny")+'</div></article>'+
 '<article class="nv-card"><span class="nv-kicker">HILFECENTER</span><h3>Weitere Kontaktmöglichkeiten</h3><p>Für private Anliegen kannst du dem NovaLab/LiveryLab-Community-Discord beitreten und dort das Team kontaktieren.</p>'+
 '<div class="nv-actions">'+button("Community-Discord","open-discord","","primary")+'</div><div class="nv-hr"></div>'+
 '<details><summary>Warum gibt es noch nicht alle Kurse bis C2?</summary><p>Die Roadmap zeigt das geplante Ziel. Schon verfügbar sind Anfängerinhalte und in mehreren Sprachen zusätzliche Niveaustufen.</p></details>'+
 '<details><summary>Kann ich ein Abonnement kaufen?</summary><p>Der Shop ist noch eine transparente Vorschau. Es gibt derzeit keine aktiven Zahlungen.</p></details>'+
 '<details><summary>Wo wird mein Fortschritt gespeichert?</summary><p>Auf deinem Gerät im Browser; er wird nicht in ein Konto synchronisiert.</p></details></article></div>';
}
function profilePage(c){
 const {db,lang,esc,button,hero,heading,stats}=c;
 const done=Object.keys(db.completed).filter(k=>db.completed[k]?.passed);
 return '<div class="nv-profile-cover"><img src="./assets/novalab-banner.webp" alt="NovaLab Academy Banner"><div class="nv-profile-details">'+avatarMarkup(db,esc,'nv-profile-avatar')+
 '<div><h2>'+esc(db.name)+'</h2><span class="nv-tag mint">'+esc(db.profileTitle||"Sprachentdecker")+'</span><p>'+esc(db.bio||"")+'</p></div></div></div>'+
 stats()+
 '<div class="nv-grid two"><article class="nv-card"><span class="nv-kicker">DEIN PROFIL</span><h3>Profil anpassen</h3>'+
 '<label for="profile-name">Anzeigename</label><input id="profile-name" class="nv-input nv-full" maxlength="28" value="'+esc(db.name)+'">'+
 '<label for="profile-title">Titel</label><input id="profile-title" class="nv-input nv-full" maxlength="36" value="'+esc(db.profileTitle||"Sprachentdecker")+'">'+
 '<label for="profile-bio">Profilbeschreibung</label><textarea id="profile-bio" class="nv-input nv-full" maxlength="140" rows="3">'+esc(db.bio||"")+'</textarea>'+
 '<div class="nv-actions">'+button("Profil speichern","save-name","","primary")+'</div></article>'+
 '<article class="nv-card"><span class="nv-kicker">PROFILBILDER</span><h3>NovaLab-Design wählen</h3>'+
 '<div class="nv-avatar-options"><button data-action="avatar-change" data-avatar="novalab" class="nv-avatar-option"><img src="./assets/novalab-logo.webp" alt="NovaLab-Profilbild"><span>NovaLab</span></button>'+
 '<button data-action="avatar-change" data-avatar="initials" class="nv-avatar-option"><span class="nv-letter-avatar">'+esc((db.name||"N")[0].toUpperCase())+'</span><span>Initiale</span></button></div>'+
 '<label for="avatar-upload" class="nv-btn tiny">Eigenes Bild wählen</label><input id="avatar-upload" type="file" accept="image/png,image/jpeg,image/webp" class="nv-is-hidden">'+
 '<p class="nv-tiny">Bilder bis 300 KB bleiben nur in deinem Browser. Das NovaLab-Logo ist als Standard gesetzt.</p>'+
 '<div class="nv-hr"></div><h3>Dein Kurs</h3><p>'+esc(lang.flag+" "+lang.name)+'</p>'+button("Sprache wechseln","go-languages","","tiny")+'</article></div>'+
 heading("Abgeschlossene Stationen","XP gibt es nur beim ersten erfolgreichen Abschluss einer Lektion.")+
 (done.length?'<div class="nv-grid two">'+done.slice(-20).reverse().map(k=>'<div class="nv-card"><span class="nv-tag mint">✓ Abgeschlossen</span><h3>'+esc(k.split("/").slice(1).join(" · "))+'</h3><p>'+esc(k.split("/")[0].toUpperCase())+'</p></div>').join("")+'</div>':'<div class="nv-empty">Noch keine bestandene Lektion. Starte mit deiner ersten Roadmap-Station!</div>');
}
export function renderExtra(route,ctx){
 switch(route){
  case "writing":return writePage(ctx);
  case "exams":return examsPage(ctx);
  case "grammar":return grammarPage(ctx);
  case "achievements":return achievementPage(ctx);
  case "shop":return shopPage(ctx);
  case "support":return supportPage(ctx);
  case "profile":return profilePage(ctx);
  default:return null;
 }
}

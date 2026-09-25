/* LICRO — casual conversation packs (Casual, Funny, Deep, Late-night, Close-friend, Emotional).
   Each category is one continuous back-and-forth: your line, then LICRO's line, and so on.
   Type close to "your" line (typos/emojis/punctuation don't matter) and LICRO replies with the
   next line, remembering where you are in that conversation so it keeps flowing naturally. */
(()=>{
const CATS={
 casual:[
  "bro what are you doing 😂","nothing much, just existing",
  "same bro 😭","you ate?",
  "yeah, finally 😂 you?","not yet",
  "bro it's literally 2pm 💀","I know 😭 don't remind me",
  "okay okay my bad 😂","what's going on with you?",
  "honestly? nothing and everything at the same time","that's suspiciously deep for a Wednesday 💀"
 ],
 funny:[
  "wait wait... hear me out 😂","oh no",
  "what?","whenever you say 'hear me out', something questionable is coming 😭",
  "bro trust me","that's exactly what someone with a bad idea would say 💀",
  "okay fine, tell me","see? you knew I'd listen 😂",
  "I have absolutely no idea what I'm doing","finally, some honesty 😂",
  "don't judge me","I'm literally an AI. Judging you is not in my job description... probably 😭"
 ],
 deep:[
  "you ever feel like you're doing a lot but somehow going nowhere?","yeah... more often than I'd like to admit.",
  "sometimes I just want everything to slow down for a while.","I get that.",
  "it's weird how you can be surrounded by people and still feel alone.","yeah. sometimes you don't need people around you. you just need someone who actually understands.",
  "exactly.","and sometimes you don't even know what you're feeling yourself.",
  "that's probably the hardest part.","you don't have to figure everything out tonight.",
  "maybe I just needed to hear that.","then stay here for a minute. No pressure."
 ],
 latenight:[
  "you awake?","unfortunately 😂",
  "can't sleep?","nope",
  "thinking too much again?","maybe.",
  "about what?","life. future. everything.",
  "classic 2am brain 💀","exactly 😭",
  "you know what I hate?","what?",
  "during the day everything feels manageable.","and at night?",
  "my brain suddenly opens 47 tabs.","HAHAHA that's painfully accurate 😂"
 ],
 closefriend:[
  "bro I have something to tell you","I'm listening 👀",
  "don't laugh","I already want to laugh 😂",
  "brooo 😭","okay okay, serious mode activated",
  "thanks 😂","you know what's funny?",
  "what?","we started talking about one thing and somehow ended up here.",
  "that's literally every conversation with you 💀","and yet you keep coming back.\nunfortunately, you're entertaining 😂"
 ],
 emotional:[
  "I don't know why, but today feels different.","different good or different bad?",
  "I honestly don't know.","sometimes you don't need to name the feeling immediately.",
  "yeah...","just let yourself feel it for a bit.",
  "I wish my brain understood that.","your brain is dramatic sometimes 😂",
  "sometimes?","okay... very dramatic 💀",
  "fair.","but hey, you're still here. That's something.\nyeah. I guess it is."
 ]
};
function buildPairs(lines){const p=[];for(let i=0;i+1<lines.length;i+=2)p.push({u:lines[i],a:lines[i+1]});return p}
const PAIRS={};for(const k in CATS)PAIRS[k]=buildPairs(CATS[k]);

function norm(s){return String(s||'').toLowerCase().replace(/\p{Extended_Pictographic}/gu,'').replace(/[’']/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
function words(s){return s.split(' ').filter(Boolean)}
function jaccard(a,b){const wa=new Set(words(a)),wb=new Set(words(b));if(!wa.size||!wb.size)return 0;let inter=0;wa.forEach(w=>{if(wb.has(w))inter++});return inter/new Set([...wa,...wb]).size}
function matches(inputNorm,line){
 const ln=norm(line);
 if(!inputNorm||!ln)return false;
 if(inputNorm===ln)return true;
 if(ln.length<=14)return inputNorm.includes(ln)||ln.includes(inputNorm);
 return jaccard(inputNorm,ln)>=.5;
}

let active=null; // {cat, i}
function matchCasual(text){
 const t=norm(text);if(!t)return null;
 if(active){
  const pairs=PAIRS[active.cat],ni=active.i+1;
  if(ni<pairs.length&&matches(t,pairs[ni].u)){active.i=ni;return pairs[ni].a}
 }
 for(const cat in PAIRS){if(matches(t,PAIRS[cat][0].u)){active={cat,i:0};return PAIRS[cat][0].a}}
 for(const cat in PAIRS){const pairs=PAIRS[cat];for(let i=1;i<pairs.length;i++){if(matches(t,pairs[i].u)){active={cat,i};return pairs[i].a}}}
 return null;
}
window.LICRO_CASUAL={match:matchCasual,reset:()=>{active=null}};
})();

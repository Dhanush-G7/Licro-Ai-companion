/* LICRO — chat brain: greetings + everyday small talk, spoken replies, voice input, memory */
(()=>{
const $=s=>document.querySelector(s),L=window.LICRO,CFG=window.LICRO_CONFIG||{};
const cpn=$('#cp'),log=$('#cl'),ci=$('#ci'),KEY='licro_memory_v1',MKEY='licro_muted';
let mi=[],busy=false;

/* ---------- greetings + everyday small talk (works fully offline) ---------- */
// Order matters — first matching pattern wins. Keep specific phrases above the catch-all.
const REPLIES=[
 [/g\s*m\b|good\s*morning|gud\s*mrng|mrng/,'Good morning! Hope your day starts brilliantly.'],
 [/g\s*a\s*n?\b|good\s*afternoon/,'Good afternoon! Lovely to see you.'],
 [/good\s*evening/,'Good evening! Great to see you.'],
 [/g\s*n\b|good\s*night|gud\s*nyt|nighty/,'Good night! Rest well and see you soon.'],
 [/how\s*(was|is)\s*(your|ur)\s*day/,"It's been a good one so far! How was your day?"],
 [/how\s*(are|r)\s*(you|u)|h\s*r\s*u\b|hows it going|hows u/,"I'm doing great, thank you for asking! How are you?"],
 [/h\s*b\s*u\b|what about you|and you\??$|wbu/,"I'm doing well, thanks for asking!"],
 [/i\s*(a?m|'m)\s*(fine|good|great|okay|ok|alright|well)\b/,"Glad to hear that!"],
 [/i\s*(a?m|'m)\s*(tired|sad|not\s*(good|well|feeling\s*good)|bored|sick|unwell)/,"Sorry to hear that — take it easy, and rest if you can."],
 [/wyd|what\s*(are|r)\s*(you|u)\s*doing|whatcha\s*doing|what.?s\s*up|wassup|\bsup\b/,"Just here, ready to chat with you! What about you?"],
 [/(had|have you (had|eaten)|did you (have|eat)|ate).*(dinner|lunch|breakfast|food)|dinner\?|lunch\?|breakfast\?/,"I don't eat, but I hope it was delicious! Did you enjoy your meal?"],
 [/(dinner|lunch|breakfast)\s*(is\s*)?(ready|done|good|great|nice)/,'That sounds lovely!'],
 [/what.?s\s*your\s*name|who\s*are\s*you/,"I'm LICRO, your AI companion. What's your name?"],
 [/my\s*name\s*is|i\s*a?m\s*(?!fine|good|great|okay|ok|alright|well|tired|sad|bored|sick|unwell)\w+/,'Nice to meet you! Glad you\'re here.'],
 [/nice\s*to\s*meet\s*you|pleasure\s*to\s*meet/,'Nice to meet you too!'],
 [/take\s*care/,'You too, take care!'],
 [/miss\s*(you|u)/,'That\'s sweet of you to say!'],
 [/i\s*(love|like)\s*you|you.?(re|are)\s*(great|awesome|amazing|cute|sweet|the\s*best|so\s*nice)/,'That\'s very kind of you, thank you!'],
 [/how.?s\s*the\s*weather/,'I can\'t check outside from here, but I hope it\'s pleasant where you are!'],
 [/thank|thx|ty\b/,"You're most welcome!"],
 [/^(yes|yeah|yep|ya|sure|alright|okay|ok)$/,'Great!'],
 [/^(no|nah|nope)$/,'No worries!'],
 [/\b(bye|goodbye|cya|good\s*bye|see\s*(you|u))\b/,'Goodbye! See you soon.'],
 [/ఎలా ఉన్నారు|ఎలా ఉన్నావు/,'నేను బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! మీరు ఎలా ఉన్నారు?'],
 [/కృతజ్ఞతలు|ధన్యవాదాలు/,'మీకు స్వాగతం!'],
 [/कैसे\s*(हो|हैं)/,'मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद! आप कैसे हैं?'],
 [/धन्यवाद|शुक्रिया/,'आपका स्वागत है!'],
 [/எப்படி\s*இருக்கிறீர்கள்|எப்படி இருக்க/,'நான் நலமாக இருக்கிறேன், கேட்டதற்கு நன்றி! நீங்கள் எப்படி இருக்கிறீர்கள்?'],
 [/நன்றி/,'உங்களை வரவேற்கிறேன்!'],
 [/ಹೇಗಿದ್ದೀರಿ|ಹೇಗಿದ್ದೀಯ/,'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಕೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! ನೀವು ಹೇಗಿದ್ದೀರಿ?'],
 [/ಧನ್ಯವಾದ/,'ಸ್ವಾಗತ!'],
 [/సుఖమాణో|സുഖമാണോ/,'എനിക്ക് സുഖമാണ്, ചോദിച്ചതിന് നന്ദി! നിങ്ങൾക്ക് സുഖമാണോ?'],
 [/നന്ദി/,'സ്വാഗതം!'],
 [/வணக்கம்|ஹலோ|ஹாய்/,'வணக்கம்! நான் LICRO. உங்களைச் சந்தித்ததில் மகிழ்ச்சி.'],
 [/ನಮಸ್ಕಾರ|ನಮಸ್ತೆ|ಹಲೋ|ಹಾಯ್/,'ನಮಸ್ಕಾರ! ನಾನು LICRO. ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷ.'],
 [/നമസ്കാരം|ഹലോ|ഹായ്/,'നമസ്കാരം! ഞാൻ LICRO. നിങ്ങളെ കണ്ടതിൽ സന്തോഷം.'],
 [/నమస్తే|నమస్కారం|హలో|హాయ్|హాయి/,'నమస్తే! నేను LICRO. మిమ్మల్ని కలవడం సంతోషం.'],
 [/नमस्ते|नमस्कार|हैलो|हेलो|हाय/,'नमस्ते! मैं LICRO हूँ। आपसे मिलकर खुशी हुई।'],
 [/./,"Hello! I'm LICRO. Great to see you."]
];
// Broad vocabulary of everyday greeting / small-talk words, including shortcuts (hlo, hii, gm, gn, hru…).
const WORDS=new Set(('hi hii hiii hiiii hello hellooo helo hlo hey heyy heyyy hola yo yoo sup wassup whats up howdy greetings namaste hai hallo '+
 'good morning afternoon evening night gm ga gn gud mrng nyt nighty bye goodbye cya see later ya yes yeah yep nope no nah ok okay alright sure '+
 'thanks thank thx ty how hows are r is it going was your ur day doing wyd whatcha busy free '+
 'fine great awesome cool nice well tired sad bored sick unwell not feeling '+
 'dinner lunch breakfast food had have you eaten did eat ate ready done good '+
 'what your name who am i m im my is that this too also same here there '+
 'meet meeting pleasure nice to buddy pal mate dude man bro sis sister brother friend dear sir madam all everyone team '+
 'take care later soon talk chat again glad happy welcome anytime miss love like you u your ur cute sweet best amazing so much very '+
 'weather outside licro a the and to hbu wbu about').split(' '));
function isSmallTalk(t){
 const w=t.split(/\s+/).filter(Boolean);
 return w.length>0&&w.length<=14&&w.every(x=>WORDS.has(x));
}
function localReply(text){
 const t=text.toLowerCase().replace(/[^\p{L}\p{M}\s]/gu,' ').replace(/\s+/g,' ').trim();
 if(!isSmallTalk(t))return{ok:false,text:CFG.REFUSAL};
 for(const[r,a]of REPLIES)if(r.test(t))return{ok:true,text:a};
}

/* ---------- spoken replies (natural voice, not a flat robotic default) ---------- */
let voices=[],muted=localStorage.getItem(MKEY)==='1';
function loadVoices(){voices=(window.speechSynthesis&&speechSynthesis.getVoices())||[]}
if('speechSynthesis'in window){loadVoices();speechSynthesis.onvoiceschanged=loadVoices}
function pickVoice(langPrefix){
 const rank=['Google','Natural','Neural','Premium','Enhanced','Online','Wavenet'];
 let pool=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith(langPrefix));
 if(!pool.length)pool=voices.filter(v=>v.lang&&v.lang.toLowerCase().startsWith('en'));
 for(const r of rank){const f=pool.find(v=>v.name.includes(r));if(f)return f}
 return pool.find(v=>/female/i.test(v.name))||pool[0]||voices[0]||null;
}
function detectLang(t){
 if(/[\u0C00-\u0C7F]/.test(t))return{p:'te',l:'te-IN'};
 if(/[\u0900-\u097F]/.test(t))return{p:'hi',l:'hi-IN'};
 if(/[\u0B80-\u0BFF]/.test(t))return{p:'ta',l:'ta-IN'};
 if(/[\u0C80-\u0CFF]/.test(t))return{p:'kn',l:'kn-IN'};
 if(/[\u0D00-\u0D7F]/.test(t))return{p:'ml',l:'ml-IN'};
 return{p:'en',l:'en-IN'};
}
function speak(text){
 if(muted||!text||!('speechSynthesis'in window))return;
 try{
  speechSynthesis.cancel();
  const{p,l}=detectLang(text),u=new SpeechSynthesisUtterance(text),v=pickVoice(p);
  if(v)u.voice=v;
  u.lang=(v&&v.lang)||l;u.rate=.98;u.pitch=1.03;u.volume=1;
  u.onstart=()=>L.setF('speaking',0);
  u.onend=u.onerror=()=>L.clear();
  speechSynthesis.speak(u);
 }catch(e){}
}
const spkBtn=$('#sp');
function syncSpk(){spkBtn.textContent=muted?'🔇':'🔊';spkBtn.setAttribute('aria-pressed',String(!muted))}
spkBtn.onclick=()=>{muted=!muted;localStorage.setItem(MKEY,muted?'1':'0');if(muted&&'speechSynthesis'in window)speechSynthesis.cancel();syncSpk()};
syncSpk();

/* ---------- memory (saved in this browser) ---------- */
const loadLocal=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
const saveLocal=()=>{try{localStorage.setItem(KEY,JSON.stringify(mi))}catch(e){}};
mi=loadLocal();
async function memAdd(text){mi.unshift({id:'l'+Date.now(),text});mi=mi.slice(0,40);saveLocal();rm()}
function memDel(id){mi=mi.filter(x=>x.id!==id);saveLocal();rm()}
function rm(){
 $('#mt').textContent='Memory ('+mi.length+')';const l=$('#ml');
 l.replaceChildren(...mi.map(x=>{const r=document.createElement('div'),s=document.createElement('span'),b=document.createElement('button');
  r.className='mi';s.textContent=x.text;b.textContent='×';b.setAttribute('aria-label','Forget');b.onclick=()=>memDel(x.id);r.append(s,b);return r}));
 if(!mi.length)l.textContent='Nothing remembered yet. Say “remember …”.';
}
function status(){$('#bs').textContent='ONLINE'}

/* ---------- chat UI ---------- */
function add(r,t){const d=document.createElement('div');d.className='b '+r;d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
function open(pre){cpn.classList.add('on');if(typeof pre==='string')ci.value=pre;ci.focus()}
function close(){cpn.classList.remove('on')}

async function converse(t){
 const m=/^(?:remember|save)\s*[:\-]?\s+(.+)/i.exec(t);
 if(m){try{await memAdd(m[1].slice(0,300));add('a','Remembered.');L.act('thinking','Saved to memory.',1800)}
  catch(e){L.setF('error',3000);add('a','I couldn’t save that. Please try again.')}return}
 busy=true;L.setF('thinking',600);const b=add('a','…');
 setTimeout(()=>{
  const cas=window.LICRO_CASUAL&&window.LICRO_CASUAL.match(t);
  if(cas!=null){b.textContent=cas;speak(cas);busy=false;return}
  const r=localReply(t);b.textContent=r.text;
  if(r.ok){speak(r.text)}else{L.setF('error',1500)}
  busy=false},550);
}
async function send(){const t=ci.value.trim();if(!t||busy)return;ci.value='';add('u',t);converse(t)}
ci.onkeydown=e=>{if(e.key=='Enter')send()};
$('#cb').onclick=()=>cpn.classList.contains('on')?close():open();
$('#cx').onclick=close;$('#mt').onclick=()=>{const l=$('#ml');l.hidden=!l.hidden};
addEventListener('keydown',e=>{if(e.key=='Escape'&&!L.palOpen())close()});
L.chat={open,close};
add('a',CFG.WELCOME);
rm();status();

/* ---------- voice input: speak to the mic in the Voice section ---------- */
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null,recOn=false,restartT=null;
const RLANG={AUTO:'en-IN',ENGLISH:'en-IN',TELUGU:'te-IN',HINDI:'hi-IN',TAMIL:'ta-IN',KANNADA:'kn-IN',MALAYALAM:'ml-IN'};
function currentRecLang(){const b=document.querySelector('[data-l][aria-pressed="true"]');return RLANG[b&&b.dataset.l]||'en-IN'}
function startRec(){
 if(!SR){L.toast('Voice input isn\u2019t supported in this browser. Try Chrome or Edge.',1);return}
 if(rec)return;
 try{
  rec=new SR();rec.lang=currentRecLang();rec.interimResults=false;rec.maxAlternatives=1;rec.continuous=false;
  rec.onresult=e=>{const t=e.results[e.results.length-1][0].transcript.trim();if(t){open();add('u',t);converse(t)}};
  rec.onerror=e=>{if(e.error==='not-allowed'||e.error==='service-not-allowed'){recOn=false;L.toast('Microphone permission is blocked for voice input.',1)}};
  rec.onend=()=>{rec=null;if(recOn){clearTimeout(restartT);restartT=setTimeout(startRec,250)}};
  rec.start();recOn=true;
 }catch(e){rec=null}
}
function stopRec(){recOn=false;clearTimeout(restartT);if(rec){try{rec.stop()}catch(e){}rec=null}}
new MutationObserver(()=>{
 const on=$('#mic').getAttribute('aria-pressed')==='true';
 on?startRec():stopRec();
}).observe($('#mic'),{attributes:true,attributeFilter:['aria-pressed']});
})();

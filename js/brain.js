/* LICRO — chat brain: greetings responder + memory */
(()=>{
const $=s=>document.querySelector(s),L=window.LICRO,CFG=window.LICRO_CONFIG||{};
const cpn=$('#cp'),log=$('#cl'),ci=$('#ci'),KEY='licro_memory_v1';
let mi=[],busy=false;

/* ---------- greetings-only responder (works offline) ---------- */
const REPLIES=[
 [/good\s*morning/,'Good morning! Hope your day starts brilliantly.'],
 [/good\s*afternoon/,'Good afternoon! Lovely to see you.'],
 [/good\s*evening/,'Good evening! Great to see you.'],
 [/good\s*night/,'Good night! Rest well and see you soon.'],
 [/how\s*(are|r)\s*(you|u)|hows it going|whats up|\bsup\b/,"I'm doing great, thank you for asking! How are you?"],
 [/thank|thx/,"You're most welcome!"],
 [/\b(bye|goodbye|cya)\b|see you/,'Goodbye! See you soon.'],
 [/ఎలా ఉన్నారు|ఎలా ఉన్నావు/,'నేను బాగున్నాను, అడిగినందుకు ధన్యవాదాలు! మీరు ఎలా ఉన్నారు?'],
 [/కృతజ్ఞతలు|ధన్యవాదాలు/,'మీకు స్వాగతం!'],
 [/कैसे\s*(हो|हैं)/,'मैं बहुत अच्छा हूँ, पूछने के लिए धन्यवाद! आप कैसे हैं?'],
 [/धन्यवाद|शुक्रिया/,'आपका स्वागत है!'],
 [/எப்படி\s*இருக்கிறீர்கள்|எப்படி இருக்க/,'நான் நலமாக இருக்கிறேன், கேட்டதற்கு நன்றி! நீங்கள் எப்படி இருக்கிறீர்கள்?'],
 [/நன்றி/,'உங்களை வரவேற்கிறேன்!'],
 [/ಹೇಗಿದ್ದೀರಿ|ಹೇಗಿದ್ದೀಯ/,'ನಾನು ಚೆನ್ನಾಗಿದ್ದೇನೆ, ಕೇಳಿದ್ದಕ್ಕೆ ಧನ್ಯವಾದಗಳು! ನೀವು ಹೇಗಿದ್ದೀರಿ?'],
 [/ಧನ್ಯವಾದ/,'ಸ್ವಾಗತ!'],
 [/സുഖമാണോ/,'എനിക്ക് സുഖമാണ്, ചോദിച്ചതിന് നന്ദി! നിങ്ങൾക്ക് സുഖമാണോ?'],
 [/നന്ദി/,'സ്വാഗതം!'],
 [/வணக்கம்|ஹலோ|ஹாய்/,'வணக்கம்! நான் LICRO. உங்களைச் சந்தித்ததில் மகிழ்ச்சி.'],
 [/ನಮಸ್ಕಾರ|ನಮಸ್ತೆ|ಹಲೋ|ಹಾಯ್/,'ನಮಸ್ಕಾರ! ನಾನು LICRO. ನಿಮ್ಮನ್ನು ಭೇಟಿಯಾಗಿ ಸಂತೋಷ.'],
 [/നമസ്കാരം|ഹലോ|ഹായ്/,'നമസ്കാരം! ഞാൻ LICRO. നിങ്ങളെ കണ്ടതിൽ സന്തോഷം.'],
 [/నమస్తే|నమస్కారం|హలో|హాయ్|హాయి/,'నమస్తే! నేను LICRO. మిమ్మల్ని కలవడం సంతోషం.'],
 [/नमस्ते|नमस्कार|हैलो|हेलो|हाय/,'नमस्ते! मैं LICRO हूँ। आपसे मिलकर खुशी हुई।'],
 [/./,"Hello! I'm LICRO. Great to see you."]
];
const WORDS=new Set(('hi hii hiii hello hellooo helo hey heyy hola yo howdy greetings namaste hai hallo '+
 'good morning afternoon evening night bye goodbye cya see later thanks thank thx sup whats up how are is r u you it going '+
 'licro there buddy friend dear bro sir madam all everyone team so much very a the and to nice meet too '+
 'నమస్తే నమస్కారం హలో హాయ్ హాయి ఎలా ఉన్నారు ఉన్నావు కృతజ్ఞతలు ధన్యవాదాలు नमस्ते नमस्कार हैलो हेलो हाय कैसे हो हैं आप धन्यवाद शुक्रिया '+
 'வணக்கம் ஹலோ ஹாய் எப்படி இருக்கிறீர்கள் இருக்க நன்றி ನಮಸ್ಕಾರ ನಮಸ್ತೆ ಹಲೋ ಹಾಯ್ ಹೇಗಿದ್ದೀರಿ ಹೇಗಿದ್ದೀಯ ಧನ್ಯವಾದ ಧನ್ಯವಾದಗಳು നമസ്കാരം ഹലോ ഹായ് സുഖമാണോ നന്ദി').split(' '));
function isGreeting(t){
 const w=t.split(/\s+/).filter(Boolean);
 return w.length>0&&w.length<=8&&w.every(x=>WORDS.has(x));
}
function localReply(text){
 const t=text.toLowerCase().replace(/[^\p{L}\p{M}\s]/gu,' ').replace(/\s+/g,' ').trim();
 if(!isGreeting(t))return{ok:false,text:CFG.REFUSAL};
 for(const[r,a]of REPLIES)if(r.test(t))return{ok:true,text:a};
}

/* ---------- memory (saved in this browser) ---------- */
const loadLocal=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
const saveLocal=()=>{try{localStorage.setItem(KEY,JSON.stringify(mi))}catch(e){}};
mi=loadLocal();
async function memAdd(text){
 mi.unshift({id:'l'+Date.now(),text});mi=mi.slice(0,40);saveLocal();rm();
}
function memDel(id){
 mi=mi.filter(x=>x.id!==id);saveLocal();rm();
}
function rm(){
 $('#mt').textContent='Memory ('+mi.length+')';const l=$('#ml');
 l.replaceChildren(...mi.map(x=>{const r=document.createElement('div'),s=document.createElement('span'),b=document.createElement('button');
  r.className='mi';s.textContent=x.text;b.textContent='×';b.setAttribute('aria-label','Forget');b.onclick=()=>memDel(x.id);r.append(s,b);return r}));
 if(!mi.length)l.textContent='Nothing remembered yet. Say “remember …”.';
}
function status(){$('#bs').textContent='GREETING MODE'}


/* ---------- chat UI ---------- */
function add(r,t){const d=document.createElement('div');d.className='b '+r;d.textContent=t;log.appendChild(d);log.scrollTop=log.scrollHeight;return d}
function open(pre){cpn.classList.add('on');if(typeof pre==='string')ci.value=pre;ci.focus()}
function close(){cpn.classList.remove('on')}

async function send(){
 const t=ci.value.trim();if(!t||busy)return;ci.value='';add('u',t);
 const m=/^(?:remember|save)\s*[:\-]?\s+(.+)/i.exec(t);
 if(m){try{await memAdd(m[1].slice(0,300));add('a','Remembered.');L.act('thinking','Saved to memory.',1800)}
  catch(e){L.setF('error',3000);add('a','I couldn’t save that. Please try again.')}return}
 busy=true;L.setF('thinking',600);const b=add('a','…');
 setTimeout(()=>{const r=localReply(t);b.textContent=r.text;
  if(r.ok)L.setF('speaking',1800);else L.setF('error',1500);busy=false},550);
}
ci.onkeydown=e=>{if(e.key=='Enter')send()};
$('#cb').onclick=()=>cpn.classList.contains('on')?close():open();
$('#cx').onclick=close;$('#mt').onclick=()=>{const l=$('#ml');l.hidden=!l.hidden};
addEventListener('keydown',e=>{if(e.key=='Escape'&&!L.palOpen())close()});
L.chat={open,close};
add('a',CFG.WELCOME);
rm();status();
})();

const root=document.documentElement;
const grid=document.getElementById('linksGrid');
const loader=document.getElementById('loader');
const savedTheme=localStorage.getItem('bp-theme');
let rawAccent='#b7ff3c';

if(savedTheme) root.dataset.theme=savedTheme;

const themeBtn=document.getElementById('themeBtn');

function hexToRgb(hex){
 const h=String(hex||'').trim().replace('#','');
 if(!/^[0-9a-fA-F]{6}$/.test(h)) return null;
 return {
  r:parseInt(h.slice(0,2),16),
  g:parseInt(h.slice(2,4),16),
  b:parseInt(h.slice(4,6),16)
 };
}

function rgbToHex({r,g,b}){
 const c=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');
 return '#'+c(r)+c(g)+c(b);
}

function rgbToHsl({r,g,b}){
 r/=255;g/=255;b/=255;
 const max=Math.max(r,g,b),min=Math.min(r,g,b);
 let h=0,s=0;
 const l=(max+min)/2;
 if(max!==min){
  const d=max-min;
  s=l>.5?d/(2-max-min):d/(max+min);
  switch(max){
   case r:h=(g-b)/d+(g<b?6:0);break;
   case g:h=(b-r)/d+2;break;
   default:h=(r-g)/d+4;
  }
  h/=6;
 }
 return {h:h*360,s:s*100,l:l*100};
}

function hslToRgb({h,s,l}){
 h=((h%360)+360)%360/360;s/=100;l/=100;
 if(s===0){const v=l*255;return {r:v,g:v,b:v}}
 const hue2rgb=(p,q,t)=>{
  if(t<0)t+=1;if(t>1)t-=1;
  if(t<1/6)return p+(q-p)*6*t;
  if(t<1/2)return q;
  if(t<2/3)return p+(q-p)*(2/3-t)*6;
  return p;
 };
 const q=l<.5?l*(1+s):l+s-l*s;
 const p=2*l-q;
 return {
  r:hue2rgb(p,q,h+1/3)*255,
  g:hue2rgb(p,q,h)*255,
  b:hue2rgb(p,q,h-1/3)*255
 };
}

function safeAccentForTheme(hex,theme){
 const rgb=hexToRgb(hex);
 if(!rgb) return '#b7ff3c';
 const hsl=rgbToHsl(rgb);

 if(theme==='dark'){
  if(hsl.l<58) hsl.l=64;
  if(hsl.s<35) hsl.s=45;
 }

 if(theme==='light'){
  const isYellow=hsl.h>=42&&hsl.h<=72&&hsl.s>=55;
  const isVeryBright=hsl.l>56;
  if(isYellow){
   hsl.s=Math.max(hsl.s,72);
   hsl.l=36;
  }else if(isVeryBright){
   hsl.l=42;
  }
 }

 return rgbToHex(hslToRgb(hsl));
}

function applyAccent(){
 const safe=safeAccentForTheme(rawAccent,root.dataset.theme);
 root.style.setProperty('--accent-original',rawAccent);
 root.style.setProperty('--accent',safe);
}

function syncThemeIcon(){themeBtn.textContent=root.dataset.theme==='dark'?'☀':'☾'}

syncThemeIcon();
applyAccent();

themeBtn.addEventListener('click',()=>{
 root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
 localStorage.setItem('bp-theme',root.dataset.theme);
 applyAccent();
 syncThemeIcon();
});

function safeText(id,text){const el=document.getElementById(id);if(el) el.textContent=text||''}
function normalizeWa(phone){return String(phone||'').replace(/\D/g,'').replace(/^0/,'62')}

function render(data){
 if(data.accent) rawAccent=data.accent;
 if(data.theme&&!savedTheme) root.dataset.theme=data.theme;
 applyAccent();

 safeText('name',data.name);
 safeText('handle',data.handle);
 safeText('tagline',data.tagline);
 safeText('bio',data.bio);
 safeText('statusText',data.status);
 safeText('phoneText',data.phone);
 safeText('aboutText',data.about);
 safeText('addressText',data.address);

 document.title=`${data.name||'Bapas Kelas II Palopo'} — Link Hub`;

 const phoneQuick=document.getElementById('phoneQuick');
 if(phoneQuick) phoneQuick.href=`https://wa.me/${normalizeWa(data.phone)}`;

 ['mapsQuick','aboutMaps'].forEach(id=>{
  const el=document.getElementById(id);
  if(el) el.href=data.maps||'#';
 });

 grid.innerHTML='';

 (data.links||[]).forEach((link,index)=>{
  const a=document.createElement('a');
  a.className='link-card reveal'+(link.featured?' featured':'');
  a.dataset.platform=link.platform||'';
  a.href=link.url||'#';
  a.target='_blank';
  a.rel='noopener noreferrer';
  a.style.transitionDelay=`${Math.min(index*45,220)}ms`;

  const top=document.createElement('div');
  top.className='link-top';

  const badge=document.createElement('span');
  badge.className='icon-badge';
  badge.textContent=link.icon||'↗';

  const arrow=document.createElement('span');
  arrow.className='arrow';
  arrow.textContent='↗';

  top.append(badge,arrow);

  const bottom=document.createElement('div');
  const h=document.createElement('h3');
  h.textContent=link.title||'Link';

  const p=document.createElement('p');
  p.textContent=link.subtitle||'';

  bottom.append(h,p);
  a.append(top,bottom);
  grid.append(a);
 });

 observeReveals();
 syncThemeIcon();
}

function observeReveals(){
 const obs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
   e.target.classList.add('visible');
   obs.unobserve(e.target);
  }
 }),{threshold:.08});

 document.querySelectorAll('.reveal:not(.visible)').forEach(el=>obs.observe(el));
}

async function init(){
 try{
  const data=await fetch('data/profile.json',{cache:'no-store'}).then(r=>{
   if(!r.ok) throw new Error();
   return r.json();
  });
  render(data);
 }catch(e){
  grid.innerHTML='<div class="link-card featured"><h3>Data belum tersedia</h3><p>Periksa data/profile.json.</p></div>';
  observeReveals();
 }finally{
  const min=650;
  setTimeout(()=>{
   loader?.classList.add('done');
   document.body.classList.add('page-ready');
  },min);
 }
}

init();
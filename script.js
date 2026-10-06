const root=document.documentElement;
const grid=document.getElementById('linksGrid');
const loader=document.getElementById('loader');
const savedTheme=localStorage.getItem('bp-theme');
let palette={light:'#00223D',dark:'#F1BF60',darkBg:'#071B2A'};

if(savedTheme) root.dataset.theme=savedTheme;

const themeBtn=document.getElementById('themeBtn');

function applyPalette(){
 const theme=root.dataset.theme==='dark'?'dark':'light';
 const accent=theme==='dark'?palette.dark:palette.light;
 root.style.setProperty('--accent',accent);
 root.style.setProperty('--dark-bg',palette.darkBg);
}

function syncThemeIcon(){themeBtn.textContent=root.dataset.theme==='dark'?'☀':'☾'}

syncThemeIcon();
applyPalette();

themeBtn.addEventListener('click',()=>{
 root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
 localStorage.setItem('bp-theme',root.dataset.theme);
 applyPalette();
 syncThemeIcon();
});

function safeText(id,text){const el=document.getElementById(id);if(el) el.textContent=text||''}

function renderLogo(data){
 const text=document.getElementById('avatarText');
 const image=document.getElementById('avatarImage');
 if(!text||!image) return;

 const mode=data.logoMode||'text';
 const fallback=data.logoText||'BP';
 const url=(data.logoUrl||'').trim();

 function showText(){
  image.hidden=true;
  image.removeAttribute('src');
  text.hidden=false;
  text.textContent=fallback;
 }

 if(mode==='image'&&url){
  text.hidden=true;
  image.hidden=false;
  image.src=url;
  image.onerror=showText;
 }else{
  showText();
 }
}
function normalizeWa(phone){return String(phone||'').replace(/\D/g,'').replace(/^0/,'62')}

function render(data){
 palette={
  light:data.accentLight||data.accent||'#00223D',
  dark:data.accentDark||'#F1BF60',
  darkBg:data.darkBg||'#071B2A'
 };
 if(data.theme&&!savedTheme) root.dataset.theme=data.theme;
 applyPalette();

 safeText('name',data.name);
 safeText('handle',data.handle);
 safeText('tagline',data.tagline);
 safeText('bio',data.bio);
 safeText('statusText',data.status);
 safeText('phoneText',data.phone);
 safeText('aboutText',data.about);
 safeText('addressText',data.address);
 renderLogo(data);

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

  const top=document.createElement('div');top.className='link-top';
  const badge=document.createElement('span');badge.className='icon-badge';badge.textContent=link.icon||'↗';
  const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';
  top.append(badge,arrow);

  const bottom=document.createElement('div');
  const h=document.createElement('h3');h.textContent=link.title||'Link';
  const p=document.createElement('p');p.textContent=link.subtitle||'';
  bottom.append(h,p);a.append(top,bottom);grid.append(a);
 });

 observeReveals();
 syncThemeIcon();
}

function observeReveals(){
 const obs=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target)}
 }),{threshold:.08});
 document.querySelectorAll('.reveal:not(.visible)').forEach(el=>obs.observe(el));
}

async function init(){
 try{
  const data=await fetch('data/profile.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json()});
  render(data);
 }catch(e){
  grid.innerHTML='<div class="link-card featured"><h3>Data belum tersedia</h3><p>Periksa data/profile.json.</p></div>';
  observeReveals();
 }finally{
  setTimeout(()=>{loader?.classList.add('done');document.body.classList.add('page-ready')},650);
 }
}

init();
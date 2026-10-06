const $=s=>document.querySelector(s);
const list=$('#linkList');
const tpl=$('#linkTemplate');
const profileKeys=['name','handle','tagline','bio','status','accent','theme','phone','address','maps','about'];
let data={name:'',handle:'',tagline:'',bio:'',status:'',accent:'#b7ff3c',theme:'dark',phone:'',address:'',maps:'',about:'',links:[]};

function isValidHex(v){return /^#[0-9a-fA-F]{6}$/.test(String(v||'').trim())}
function normalizeHex(v){
 let s=String(v||'').trim();
 if(s&&!s.startsWith('#'))s='#'+s;
 return s.toUpperCase();
}
function syncAccentFields(from){
 const picker=$('#accent');
 const hex=$('#accentHex');
 if(!picker||!hex)return;
 if(from==='hex'){
  const value=normalizeHex(hex.value);
  hex.value=value;
  if(isValidHex(value)){picker.value=value;data.accent=value;hex.classList.remove('invalid');markDirty()}
  else{hex.classList.add('invalid')}
 }else{
  const value=normalizeHex(picker.value);
  hex.value=value;
  hex.classList.remove('invalid');
  data.accent=value;
  markDirty();
 }
}
function fillProfile(){
 profileKeys.forEach(k=>{const el=$('#'+k);if(el)el.value=data[k]??''});
 const hex=$('#accentHex');
 if(hex){hex.value=normalizeHex(data.accent||'#B7FF3C');hex.classList.remove('invalid')}
}

function readProfile(){
 profileKeys.forEach(k=>{const el=$('#'+k);if(el)data[k]=el.value});
 const hex=$('#accentHex');
 if(hex){
  const value=normalizeHex(hex.value);
  if(isValidHex(value))data.accent=value;
 }
}
function markDirty(){const el=$('#saveState');if(el)el.textContent='Ada perubahan yang belum dipublish.'}
function renderLinks(){
 list.innerHTML='';
 data.links.forEach((link,index)=>{
  const node=tpl.content.firstElementChild.cloneNode(true);
  node.querySelectorAll('[data-k]').forEach(el=>{
   const k=el.dataset.k;
   if(el.type==='checkbox')el.checked=!!link[k];else el.value=link[k]??'';
   el.addEventListener('input',()=>{link[k]=el.type==='checkbox'?el.checked:el.value;markDirty()});
  });
  node.querySelector('[data-act="up"]').onclick=()=>{if(index>0){[data.links[index-1],data.links[index]]=[data.links[index],data.links[index-1]];renderLinks();markDirty()}};
  node.querySelector('[data-act="down"]').onclick=()=>{if(index<data.links.length-1){[data.links[index+1],data.links[index]]=[data.links[index],data.links[index+1]];renderLinks();markDirty()}};
  node.querySelector('[data-act="delete"]').onclick=()=>{if(confirm('Hapus tautan ini?')){data.links.splice(index,1);renderLinks();markDirty()}};
  list.append(node);
 });
}
function utf8ToBase64(str){const bytes=new TextEncoder().encode(str);let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s)}
async function load(){
 try{
  data=await fetch('../data/profile.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json()});
  if(!Array.isArray(data.links))data.links=[];
  fillProfile();renderLinks();$('#saveState').textContent='Data terbaru sudah dimuat dari website.';
 }catch{$('#saveState').textContent='Gagal memuat data/profile.json.'}
}
function publish(){
 readProfile();
 const payload=utf8ToBase64(JSON.stringify(data));
 const title='[LINKHUB-PUBLISH] Update konten Bapas Palopo';
 const body=`Permintaan publish Link Hub Bapas Palopo.\n\n> Jangan mengubah payload di bawah ini. Workflow hanya akan memproses issue yang dibuat oleh akun pemilik repository.\n\n<!-- LINKHUB_PAYLOAD_START -->\n${payload}\n<!-- LINKHUB_PAYLOAD_END -->`;
 const url='https://github.com/bapaspalopo/bapaspalopo.github.io/issues/new?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
 $('#saveState').textContent='Konfirmasi publish di tab GitHub yang baru dibuka.';
 window.open(url,'_blank','noopener,noreferrer');
}
profileKeys.forEach(k=>document.addEventListener('input',e=>{if(e.target.id===k)markDirty()}));
$('#accent')?.addEventListener('input',()=>syncAccentFields('picker'));
$('#accentHex')?.addEventListener('input',()=>syncAccentFields('hex'));
$('#accentHex')?.addEventListener('blur',()=>{
 const hex=$('#accentHex');
 const value=normalizeHex(hex.value);
 if(isValidHex(value)){hex.value=value;hex.classList.remove('invalid')}
});
$('#addLink').onclick=()=>{data.links.push({title:'Tautan Baru',subtitle:'Deskripsi singkat',url:'https://',platform:'link',icon:'NEW',featured:false});renderLinks();markDirty()};
$('#reloadBtn').onclick=()=>{if(confirm('Buang perubahan yang belum dipublish dan muat ulang data publik?'))load()};
$('#publishBtn').onclick=()=>{if(confirm('Lanjut ke GitHub untuk mengonfirmasi publish?'))publish()};
load();
const $=s=>document.querySelector(s);
const list=$('#linkList');
const tpl=$('#linkTemplate');
const profileKeys=['name','handle','tagline','bio','status','logoMode','logoText','logoData','accent','accentPreset','accentLight','accentDark','darkBg','theme','phone','address','maps','about'];
let data={
 name:'',handle:'',tagline:'',bio:'',status:'',
 accent:'#00223D',
 accentPreset:'pas',
 accentLight:'#00223D',
 accentDark:'#F1BF60',
 darkBg:'#071B2A',
 theme:'light',
 logoMode:'text',logoText:'BP',logoData:'',
 phone:'',address:'',maps:'',about:'',
 links:[]
};

function setActivePreset(preset){
 $('#logoFile')?.addEventListener('change',async e=>{
 const file=e.target.files?.[0];
 if(!file)return;
 try{
  $('#saveState').textContent='Memproses logo...';
  data.logoData=await compressLogo(file);
  data.logoMode='image';
  data.logoText=data.logoText||'BP';
  $('#logoMode').value='image';
  $('#logoText').value=data.logoText;
  $('#logoData').value=data.logoData;
  renderLogoPreview();
  markDirty();
 }catch(err){
  alert(err.message||'Gagal memproses logo.');
 }
 e.target.value='';
});

$('#removeLogo')?.addEventListener('click',()=>{
 data.logoMode='text';
 data.logoData='';
 data.logoText='BP';
 $('#logoMode').value='text';
 $('#logoText').value='BP';
 $('#logoData').value='';
 renderLogoPreview();
 markDirty();
});

document.querySelectorAll('.color-swatch').forEach(btn=>{
  btn.classList.toggle('active',btn.dataset.preset===preset);
 });
}

function fillProfile(){
 profileKeys.forEach(k=>{
  const el=$('#'+k);
  if(el) el.value=data[k]??'';
 });
 setActivePreset(data.accentPreset||'pas');
 renderLogoPreview();
}

function readProfile(){
 profileKeys.forEach(k=>{
  const el=$('#'+k);
  if(el) data[k]=el.value;
 });
}

function renderLogoPreview(){
 const text=$('#logoPreviewText');
 const image=$('#logoPreviewImage');
 if(!text||!image)return;
 if(data.logoMode==='image'&&data.logoData){
  image.src=data.logoData;
  image.hidden=false;
  text.hidden=true;
 }else{
  image.hidden=true;
  image.removeAttribute('src');
  text.hidden=false;
  text.textContent=data.logoText||'BP';
 }
}

async function compressLogo(file){
 if(!file||!file.type.startsWith('image/')) throw new Error('File harus berupa gambar.');
 if(file.size>8*1024*1024) throw new Error('Ukuran gambar terlalu besar. Maksimal 8 MB.');

 const objectUrl=URL.createObjectURL(file);
 try{
  const img=new Image();
  await new Promise((resolve,reject)=>{
   img.onload=resolve;
   img.onerror=()=>reject(new Error('Gambar tidak dapat dibaca.'));
   img.src=objectUrl;
  });

  const max=256;
  const scale=Math.min(1,max/Math.max(img.width,img.height));
  const width=Math.max(1,Math.round(img.width*scale));
  const height=Math.max(1,Math.round(img.height*scale));
  const canvas=document.createElement('canvas');
  canvas.width=width;
  canvas.height=height;
  const ctx=canvas.getContext('2d');
  ctx.clearRect(0,0,width,height);
  ctx.drawImage(img,0,0,width,height);

  let result=canvas.toDataURL('image/webp',0.82);
  if(result.length>48000) result=canvas.toDataURL('image/webp',0.68);
  if(result.length>60000) throw new Error('Logo masih terlalu besar setelah dikompres. Gunakan logo yang lebih sederhana/kecil.');
  return result;
 }finally{
  URL.revokeObjectURL(objectUrl);
 }
}

function markDirty(){
 const el=$('#saveState');
 if(el) el.textContent='Ada perubahan yang belum dipublish.';
}

function renderLinks(){
 list.innerHTML='';
 data.links.forEach((link,index)=>{
  const node=tpl.content.firstElementChild.cloneNode(true);

  node.querySelectorAll('[data-k]').forEach(el=>{
   const k=el.dataset.k;
   if(el.type==='checkbox') el.checked=!!link[k];
   else el.value=link[k]??'';

   el.addEventListener('input',()=>{
    link[k]=el.type==='checkbox'?el.checked:el.value;
    markDirty();
   });
  });

  node.querySelector('[data-act="up"]').onclick=()=>{
   if(index>0){
    [data.links[index-1],data.links[index]]=[data.links[index],data.links[index-1]];
    renderLinks();
    markDirty();
   }
  };

  node.querySelector('[data-act="down"]').onclick=()=>{
   if(index<data.links.length-1){
    [data.links[index+1],data.links[index]]=[data.links[index],data.links[index+1]];
    renderLinks();
    markDirty();
   }
  };

  node.querySelector('[data-act="delete"]').onclick=()=>{
   if(confirm('Hapus tautan ini?')){
    data.links.splice(index,1);
    renderLinks();
    markDirty();
   }
  };

  list.append(node);
 });
}

function utf8ToBase64(str){
 const bytes=new TextEncoder().encode(str);
 let s='';
 for(const b of bytes) s+=String.fromCharCode(b);
 return btoa(s);
}

async function load(){
 try{
  const fresh=await fetch('../data/profile.json',{cache:'no-store'}).then(r=>{
   if(!r.ok) throw new Error();
   return r.json();
  });

  data={
   ...data,
   ...fresh,
   accentPreset:fresh.accentPreset||'pas',
   accentLight:fresh.accentLight||fresh.accent||'#00223D',
   accentDark:fresh.accentDark||'#F1BF60',
   darkBg:fresh.darkBg||'#071B2A',
   links:Array.isArray(fresh.links)?fresh.links:[]
  };

  fillProfile();
  renderLinks();
  $('#saveState').textContent='Data terbaru sudah dimuat dari website.';
 }catch(e){
  console.error(e);
  $('#saveState').textContent='Gagal memuat data/profile.json.';
 }
}

function publish(){
 readProfile();

 const payload=utf8ToBase64(JSON.stringify(data));
 const title='[LINKHUB-PUBLISH] Update konten Bapas Palopo';
 const body=`Permintaan publish Link Hub Bapas Palopo.

> Jangan mengubah payload di bawah ini. Workflow hanya akan memproses issue yang dibuat oleh akun pemilik repository.

<!-- LINKHUB_PAYLOAD_START -->
${payload}
<!-- LINKHUB_PAYLOAD_END -->`;

 const url='https://github.com/bapaspalopo/bapaspalopo.github.io/issues/new?title='
  +encodeURIComponent(title)
  +'&body='
  +encodeURIComponent(body);

 $('#saveState').textContent='Konfirmasi publish di tab GitHub yang baru dibuka.';
 window.open(url,'_blank','noopener,noreferrer');
}

profileKeys.forEach(k=>{
 document.addEventListener('input',e=>{
  if(e.target.id===k) markDirty();
 });
});

document.querySelectorAll('.color-swatch').forEach(btn=>{
 btn.addEventListener('click',()=>{
  data.accentPreset=btn.dataset.preset;
  data.accentLight=btn.dataset.light;
  data.accentDark=btn.dataset.dark;
  data.darkBg=btn.dataset.bg;
  data.accent=btn.dataset.light;

  $('#accentPreset').value=data.accentPreset;
  $('#accentLight').value=data.accentLight;
  $('#accentDark').value=data.accentDark;
  $('#darkBg').value=data.darkBg;
  $('#accent').value=data.accent;

  setActivePreset(data.accentPreset);
  markDirty();
 });
});

$('#addLink').onclick=()=>{
 data.links.push({
  title:'Tautan Baru',
  subtitle:'Deskripsi singkat',
  url:'https://',
  platform:'link',
  icon:'NEW',
  featured:false
 });
 renderLinks();
 markDirty();
};

$('#reloadBtn').onclick=()=>{
 if(confirm('Buang perubahan yang belum dipublish dan muat ulang data publik?')) load();
};

$('#publishBtn').onclick=()=>{
 if(confirm('Lanjut ke GitHub untuk mengonfirmasi publish?')) publish();
};

load();

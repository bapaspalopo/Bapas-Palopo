const $=s=>document.querySelector(s);
const list=$('#linkList');
const tpl=$('#linkTemplate');
const profileKeys=['name','handle','tagline','bio','status','accent','accentPreset','accentLight','accentDark','darkBg','theme','phone','address','maps','about'];
let data={name:'',handle:'',tagline:'',bio:'',status:'',accent:'#00223D',accentPreset:'pas',accentLight:'#00223D',accentDark:'#F1BF60',darkBg:'#071B2A',theme:'light',phone:'',address:'',maps:'',about:'',links:[]};

function setActivePreset(preset){
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
$('#addLink').onclick=()=>{data.links.push({title:'Tautan Baru',subtitle:'Deskripsi singkat',url:'https://',platform:'link',icon:'NEW',featured:false});renderLinks();markDirty()};
$('#reloadBtn').onclick=()=>{if(confirm('Buang perubahan yang belum dipublish dan muat ulang data publik?'))load()};
$('#publishBtn').onclick=()=>{if(confirm('Lanjut ke GitHub untuk mengonfirmasi publish?'))publish()};
load();
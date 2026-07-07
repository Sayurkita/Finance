
let db=JSON.parse(localStorage.financeFinal||'{"tx":[],"goal":0,"theme":"dark"}'),edit=-1;
goal.value=db.goal||0;if(db.theme=="light")document.body.classList.add("light");
t.onclick=()=>{document.body.classList.toggle("light");db.theme=document.body.classList.contains("light")?"light":"dark";save();}
function save(){localStorage.financeFinal=JSON.stringify(db);render()}
function add(){let o={d:desc.value,a:+amt.value,t:type.value,c:cat.value,date:date.value||new Date().toISOString().slice(0,10)};if(edit>=0){db.tx[edit]=o;edit=-1}else db.tx.unshift(o);save();}
function render(){let b=0,i=0,e=0;list.innerHTML='';let arr=db.tx.filter(x=>(filter.value=="all"||x.t==filter.value)&&x.d.toLowerCase().includes(search.value.toLowerCase()));arr.forEach((x,n)=>{x.t=="income"?(i+=x.a,b+=x.a):(e+=x.a,b-=x.a);list.innerHTML+=`<li><b>${x.d}</b> ${x.date} (${x.c}) Rp${x.a} <button onclick="ed(${n})">Edit</button><button onclick="rm(${n})">Hapus</button></li>`});stats.innerHTML=`<div class=card>Saldo Rp${b}</div><div class=card>Masuk Rp${i}</div><div class=card>Keluar Rp${e}</div>`;prog.value=db.goal?Math.min(100,Math.max(0,b)/db.goal*100):0}
function ed(n){let x=db.tx[n];edit=n;desc.value=x.d;amt.value=x.a;type.value=x.t;cat.value=x.c;date.value=x.date}
function rm(n){db.tx.splice(n,1);save()}
function saveGoal(){db.goal=+goal.value;save()}
function exp(){let a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)]));a.download='finance.json';a.click()}
function imp(ev){let r=new FileReader();r.onload=()=>{db=JSON.parse(r.result);save()};r.readAsText(ev.target.files[0])}
render();

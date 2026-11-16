(function(){
var b=document.querySelector('.menu-btn'),n=document.querySelector('.main-nav');
if(b)b.addEventListener('click',function(){var o=n.classList.toggle('open');b.setAttribute('aria-expanded',o)});
document.querySelectorAll('.sub-toggle').forEach(function(t){t.addEventListener('click',function(e){var li=t.parentElement,o=!li.classList.contains('open');
document.querySelectorAll('.has-sub.open').forEach(function(x){if(x!==li)x.classList.remove('open')});li.classList.toggle('open',o);t.setAttribute('aria-expanded',o)})});
document.addEventListener('click',function(e){if(!e.target.closest('.has-sub'))document.querySelectorAll('.has-sub.open').forEach(function(x){if(window.innerWidth>1020)x.classList.remove('open')})});
// lightbox
var links=[].slice.call(document.querySelectorAll('a.lb'));
links.forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();open(i)})});
function open(i){var d=document.createElement('div');d.className='lbx';d.innerHTML='<img alt=""><button class="x" aria-label="Close">×</button><button class="pv" aria-label="Previous">‹</button><button class="nx" aria-label="Next">›</button>';
var im=d.querySelector('img');function show(){im.src=links[i].href}show();document.body.appendChild(d);
function close(){d.remove();document.removeEventListener('keydown',k)}
function k(e){if(e.key==='Escape')close();if(e.key==='ArrowRight'){i=(i+1)%links.length;show()}if(e.key==='ArrowLeft'){i=(i-1+links.length)%links.length;show()}}
document.addEventListener('keydown',k);d.addEventListener('click',function(e){if(e.target===d||e.target.classList.contains('x'))close();if(e.target.classList.contains('nx')){i=(i+1)%links.length;show()}if(e.target.classList.contains('pv')){i=(i-1+links.length)%links.length;show()}})}
// contact form -> mailto
var f=document.getElementById('contactForm');
if(f){var q=new URLSearchParams(location.search).get('interest');if(q)document.getElementById('interest').value=q;
f.addEventListener('submit',function(e){e.preventDefault();var d=new FormData(f);var body='Name: '+d.get('name')+'\nPhone: '+d.get('phone')+'\nEmail: '+d.get('email')+'\nInterested in: '+d.get('interest')+'\n\n'+d.get('message');
location.href='mailto:'+f.dataset.to+'?subject='+encodeURIComponent('Website inquiry: '+(d.get('interest')||'General'))+'&body='+encodeURIComponent(body)})}

// Official color swatch picker on model detail pages
document.querySelectorAll("[data-color-picker]").forEach(function(picker){
  var img=picker.querySelector(".detail-photo img");
  var label=picker.querySelector(".color-current");
  var noteEl=picker.querySelector(".color-photo-note");
  var btns=[].slice.call(picker.querySelectorAll(".swatch-btn"));
  var fallback=picker.getAttribute("data-fallback")||"";
  if(!img||!btns.length)return;
  function select(btn, fromKey){
    var name=btn.getAttribute("data-name")||"";
    var src=btn.getAttribute("data-src")||fallback;
    var note=btn.getAttribute("data-note")||"";
    btns.forEach(function(b){
      var on=b===btn;
      b.classList.toggle("is-selected",on);
      b.setAttribute("aria-selected",on?"true":"false");
      b.tabIndex=on?0:-1;
    });
    if(src)img.src=src;
    if(name){
      img.alt=img.alt.replace(/\s+in\s+.+$/,"")+" in "+name;
      if(label)label.textContent="Color: "+name;
    }
    if(noteEl){
      noteEl.textContent=note;
      noteEl.classList.toggle("is-hidden",!note);
    }
    if(fromKey)btn.focus();
  }
  btns.forEach(function(btn){
    btn.addEventListener("click",function(){select(btn,false)});
  });
  picker.querySelector(".swatch-list").addEventListener("keydown",function(e){
    var i=btns.indexOf(document.activeElement);
    if(i<0)i=btns.findIndex(function(b){return b.classList.contains("is-selected")});
    if(i<0)i=0;
    var n=-1;
    if(e.key==="ArrowRight"||e.key==="ArrowDown")n=(i+1)%btns.length;
    else if(e.key==="ArrowLeft"||e.key==="ArrowUp")n=(i-1+btns.length)%btns.length;
    else if(e.key==="Home")n=0;
    else if(e.key==="End")n=btns.length-1;
    if(n<0)return;
    e.preventDefault();
    select(btns[n],true);
  });
});
})();

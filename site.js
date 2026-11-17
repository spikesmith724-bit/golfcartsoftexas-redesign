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

function qs(name){
  try{return new URLSearchParams(location.search).get(name)}catch(e){return null}
}
function fillReplyTo(form){
  var email=form.querySelector('[name="email"]');
  var reply=form.querySelector('[name="_replyto"]');
  if(email && reply) reply.value=email.value||"";
}
function mailtoBody(form){
  var skip={_subject:1,_template:1,_captcha:1,_next:1,_honey:1,_replyto:1};
  var lines=[];
  Array.prototype.forEach.call(form.elements,function(el){
    if(!el.name||skip[el.name]||el.type==="file"||el.type==="submit"||el.type==="button")return;
    if((el.type==="radio"||el.type==="checkbox")&&!el.checked)return;
    var val=(el.value||"").trim();
    if(!val)return;
    lines.push((el.name.replace(/_/g," "))+": "+val);
  });
  return lines.join("\n");
}
function showThanks(form){
  var box=form.parentElement.querySelector(".form-done");
  var fallback=form.parentElement.querySelector(".form-fallback");
  form.hidden=true;
  if(fallback)fallback.hidden=true;
  if(box){
    box.hidden=false;
    var slot=box.querySelector(".form-done-btns");
    if(slot && !slot.childElementCount){
      slot.innerHTML='<a class="btn btn-lime" href="tel:281-559-3171">Call 281-559-3171</a> <a class="btn" href="sms:832-814-0452">Text 832-814-0452</a> <a class="btn" href="'+form.getAttribute("data-thanks")+'">Done</a>';
    }
    box.scrollIntoView({behavior:"smooth",block:"start"});
  }
}

document.querySelectorAll("form.js-gct-form").forEach(function(form){
  var cart=qs("cart")||qs("interest");
  var cartField=form.querySelector("#interested-cart")||form.querySelector('[name="interested_cart"]');
  if(cart && cartField) cartField.value=cart;
  var next=form.querySelector('[name="_next"]');
  if(next && form.getAttribute("data-thanks")){
    try{next.value=new URL(form.getAttribute("data-thanks"), location.href).href}catch(e){}
  }
  if(!form.querySelector('[name="_replyto"]')){
    var h=document.createElement("input");
    h.type="hidden";h.name="_replyto";
    form.appendChild(h);
  }
  var email=form.querySelector('[name="email"]');
  if(email){email.addEventListener("input",function(){fillReplyTo(form)});fillReplyTo(form)}

  var mailBtn=form.parentElement.querySelector(".form-mailto");
  if(mailBtn){
    mailBtn.addEventListener("click",function(){
      var to=form.getAttribute("data-to")||"Golfcartsoftexas@gmail.com";
      var kind=form.getAttribute("data-kind")||"quote";
      var subject=kind==="trade-in"?"Website trade-in request":"Website quote request";
      location.href="mailto:"+to+"?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(mailtoBody(form));
    });
  }

  form.addEventListener("submit",function(e){
    // Honeypot: if a bot filled it, abort quietly (no request, so we never ping FormSubmit).
    var honey=form.querySelector('[name="_honey"]');
    if(honey && honey.value){e.preventDefault();return}
    fillReplyTo(form);
    var ajax=form.getAttribute("data-ajax");
    if(!ajax || !window.fetch) return; // native POST to FormSubmit, then _next
    e.preventDefault();
    var btn=form.querySelector('[type="submit"]');
    if(btn){btn.disabled=true;btn.dataset.label=btn.textContent;btn.textContent="Sending…"}
    var fd=new FormData(form);
    fetch(ajax,{method:"POST",body:fd,headers:{Accept:"application/json"}})
      .then(function(r){return r.json().catch(function(){return {success:r.ok}}).then(function(j){return {ok:r.ok,j:j}})})
      .then(function(res){
        // Success, or a first-time activation response, both count as "the shop will see this."
        showThanks(form);
      })
      .catch(function(){
        // Network or CORS issue: fall back to a native POST so FormSubmit still gets it.
        form.submit();
      })
      .finally(function(){
        if(btn){btn.disabled=false;btn.textContent=btn.dataset.label||"Send"}
      });
  });
});


// Facebook embeds are often blank in locked-down or headless browsers.
// Leave a poster + "Watch on Facebook" link behind the iframe; promote it if the iframe never paints.
document.querySelectorAll(".fb-video").forEach(function(card){
  var frame = card.querySelector(".fb-video-frame");
  var iframe = card.querySelector("iframe");
  if(!frame || !iframe) return;
  var done = false;
  function showFallback(){
    if(done) return;
    done = true;
    card.classList.add("is-fallback");
  }
  // If the iframe errors, or stays at 0x0 / never loads, show the poster.
  iframe.addEventListener("error", showFallback);
  setTimeout(function(){
    try{
      // Cross-origin: we cannot read the Facebook document. If the iframe
      // element itself has no layout box, treat it as blocked.
      var r = iframe.getBoundingClientRect();
      if(r.width < 2 || r.height < 2) showFallback();
    }catch(e){ showFallback(); }
  }, 4000);
});

})();

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
})();

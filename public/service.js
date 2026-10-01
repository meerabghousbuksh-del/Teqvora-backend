function initServicePage(root){
root=root||document;
const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
const hasG=typeof gsap!=='undefined',hasST=hasG&&typeof ScrollTrigger!=='undefined';
if(hasST)gsap.registerPlugin(ScrollTrigger);
let cur=SERVICES[0],q='',tt;const trg={};
const esc=t=>t.replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
const hl=t=>{const i=q.trim()?t.toLowerCase().indexOf(q.trim().toLowerCase()):-1;return i<0?t:t.slice(0,i)+'<mark>'+t.slice(i,i+q.trim().length)+'</mark>'+t.slice(i+q.trim().length)};
const found=()=>{const w=q.toLowerCase().trim().split(/\s+/).filter(Boolean);return SERVICES.filter(s=>{const h=(s.name+' '+s.cat+' '+s.kw).toLowerCase();return w.every(x=>h.includes(x))})};
const dd=$('#searchResultsDropdown');
const setTheme=t=>document.documentElement.setAttribute('data-theme',t);
const reveal=(els,key)=>{if(!hasST)return;(trg[key]||[]).forEach(t=>t.kill());gsap.set(els,{opacity:0,y:40});
 trg[key]=ScrollTrigger.batch(els,{start:'top 92%',once:true,onEnter:b=>gsap.to(b,{opacity:1,y:0,duration:.7,stagger:.12,ease:'power3.out',overwrite:true})});ScrollTrigger.refresh()};
const renderTabs=anim=>{const l=found();
 $('#tabContainer').innerHTML=l.length?l.map(s=>`<button data-svc="${s.id}" class="svc-tab ${s.id===cur.id?'active':''}"><i class="${s.icon}"></i>${hl(s.name)}</button>`).join(''):'<span class="text-sm py-1.5 text-[var(--color-text-muted)]">No services found</span>';
 $('#activeCountBadge').textContent=l.length+' Service'+(l.length===1?'':'s')+' Available';
 if(anim&&hasG)gsap.from($$('.svc-tab'),{opacity:0,y:10,duration:.35,stagger:.05,ease:'power2.out'})};
const renderDD=()=>{const l=found();
 dd.innerHTML=l.length?l.map(s=>`<button data-svc="${s.id}" class="sr-item"><span class="sr-ic"><i class="${s.icon}"></i></span><span><b>${hl(s.name)}</b><small>${s.cat}</small></span></button>`).join(''):`<div class="sr-empty"><i class="fa-regular fa-face-frown"></i><p>No services found for "<b>${esc(q)}</b>"</p><button data-reset class="btn-secondary px-4 py-2 text-xs">Reset search</button></div>`;
 dd.classList.remove('hidden');if(hasG)gsap.from(dd.children,{opacity:0,y:8,duration:.25,stagger:.04})};
const renderContent=anim=>{const s=cur,i=SERVICES.indexOf(s);
 $('#heroBreadcrumb').textContent=s.name;$('#heroCategoryBadge').textContent=s.cat;$('#heroTitle').textContent=s.title;$('#heroDescription').textContent=s.desc;$('#heroPrimaryCta').textContent=s.cta;
 $('#whatWeDoHeading').textContent=s.name+': practical support built around your next move.';
 $('#deliverablesGrid').innerHTML=s.items.map((d,n)=>`<div class="custom-card p-6"><div class="ic-box"><i class="fa-solid ${['fa-bolt','fa-chart-line','fa-shield-halved'][n]}"></i></div><h3 class="text-lg font-bold text-[var(--color-navy)] mb-2">${d[0]}</h3><p class="text-sm text-[var(--color-text-secondary)] leading-relaxed">${d[1]}</p></div>`).join('');
 $('#exploreGrid').innerHTML=[1,2,3].map(n=>SERVICES[(i+n)%SERVICES.length]).map(x=>`<div class="custom-card p-6 flex flex-col gap-3"><div class="ic-box"><i class="${x.icon}"></i></div><h3 class="text-lg font-bold text-[var(--color-navy)]">${x.name}</h3><p class="text-sm text-[var(--color-text-secondary)] flex-1">${x.desc}</p><button data-svc="${x.id}" class="text-sm font-bold text-[var(--color-primary)] text-left">Explore <i class="fa-solid fa-arrow-right text-xs"></i></button></div>`).join('');
 if(hasG&&anim)gsap.fromTo([$('#heroTitle'),$('#heroDescription'),$('#heroPrimaryCta').closest('button')],{opacity:0,y:24},{opacity:1,y:0,duration:.55,stagger:.1,ease:'power3.out'});
 reveal($$('#deliverablesGrid > div'),'d');reveal($$('#exploreGrid > div'),'e')};
const sync=v=>{['#navSearchInput','#mobileSearchInput'].forEach(k=>{const e=$(k);if(e&&e.value!==v)e.value=v});$('#searchClearBtn').classList.toggle('hidden',!v)};
const handleSearchInput=v=>{q=v;sync(v);const l=found();setTheme(q.trim()&&l.length===1?l[0].theme:cur.theme);renderTabs(true);q.trim()?renderDD():dd.classList.add('hidden')};
const selectService=(id,scroll)=>{cur=SERVICES.find(s=>s.id===id)||cur;q='';sync('');dd.classList.add('hidden');setTheme(cur.theme);renderTabs();renderContent(true);
 if(scroll)$('#heroTitle').scrollIntoView({behavior:'smooth',block:'center'})};
const modal=(id,open)=>{const m=$('#'+id);if(open){m.classList.remove('hidden');m.classList.add('flex');if(hasG){gsap.fromTo(m,{opacity:0},{opacity:1,duration:.25});gsap.fromTo(m.firstElementChild,{opacity:0,y:30,scale:.96},{opacity:1,y:0,scale:1,duration:.4,ease:'power3.out'})}}
 else{const done=()=>{m.classList.add('hidden');m.classList.remove('flex')};hasG?gsap.to(m,{opacity:0,duration:.2,onComplete:done}):done()}};
const toast=(t,m)=>{$('#toastTitle').textContent=t;$('#toastMessage').textContent=m;const e=$('#toastNotification');e.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('show'),3500)};
const fmt=n=>'$'+Math.round(n).toLocaleString('en-US');
const calc=()=>{const v=+$('#revSlider').value,e=v*1.428;$('#revVal').textContent=fmt(v);$('#estRev').textContent=fmt(e)+'/mo';$('#estLift').textContent='+'+fmt((e-v)*12)};
const api={handleSearchInput,handleSearchFocus:()=>renderDD(),clearSearch:()=>handleSearchInput(''),
 openBookingModal:()=>{$('#modalServiceInput').value=cur.name;modal('bookingModal',true)},closeBookingModal:()=>modal('bookingModal',false),
 openRoiModal:()=>{calc();modal('roiModal',true)},closeRoiModal:()=>modal('roiModal',false),calculateRoi:calc,
 handleFormSubmit:e=>{e.preventDefault();e.target.reset();toast('Enquiry sent!','We will reply within 24 hours.')},
 handleModalSubmit:e=>{e.preventDefault();e.target.reset();modal('bookingModal',false);toast('Call booked!','A growth partner will confirm by email.')},
 toggleMobileMenu:()=>$('#mobileMenu').classList.toggle('hidden')};
Object.assign(window,api);
const onClick=e=>{const t=e.target,b=t.closest('[data-svc]');
 if(b&&root.contains(b))return selectService(b.dataset.svc,!b.classList.contains('svc-tab'));
 if(t.closest('[data-reset]'))return api.clearSearch();
 if(t.id==='bookingModal'||t.id==='roiModal')modal(t.id,false);
 if(!t.closest('#searchResultsDropdown,#navSearchInput'))dd.classList.add('hidden')};
const onKey=e=>{if(!/SearchInput/.test(e.target.id||''))return;
 if(e.key==='Enter'&&found()[0])selectService(found()[0].id,true);if(e.key==='Escape')dd.classList.add('hidden')};
document.addEventListener('click',onClick);document.addEventListener('keydown',onKey);
setTheme(cur.theme);renderTabs();renderContent(false);calc();
if(hasG){gsap.from($$('main > section:first-child .lg\\:col-span-7 > *'),{opacity:0,y:30,duration:.7,stagger:.1,ease:'power3.out'});
 reveal($$('.text-center.max-w-3xl,#process .custom-card,#difference .custom-card,#metrics .custom-card,main > section:last-child .grid > div'),'s')}
return()=>{document.removeEventListener('click',onClick);document.removeEventListener('keydown',onKey);Object.keys(api).forEach(k=>delete window[k]);Object.values(trg).flat().forEach(t=>t.kill());document.documentElement.removeAttribute('data-theme')};
}
/*AUTO*/document.readyState==='loading'?document.addEventListener('DOMContentLoaded',()=>initServicePage()):initServicePage();
 let lastX = 0;
        let lastY = 0;

        window.addEventListener('mousemove', function(e) {
            // Calculate distance between mouse points to fill gaps
            const distX = e.pageX - lastX;
            const distY = e.pageY - lastY;
            const distance = Math.hypot(distX, distY);

            // Interpolation: Fill gaps when cursor moves fast
            const steps = Math.max(1, Math.floor(distance / 3));

            for (let i = 0; i < steps; i++) {
                const x = lastX + (distX / steps) * i;
                const y = lastY + (distY / steps) * i;

                createTrailDot(x, y);
            }

            lastX = e.pageX;
            lastY = e.pageY;
        });

        function createTrailDot(x, y) {
            const trail = document.createElement('div');
            trail.className = 'trail';
            trail.style.left = x + 'px';
            trail.style.top = y + 'px';

            document.body.appendChild(trail);

            setTimeout(() => {
                trail.remove();
            }, 500);
        }
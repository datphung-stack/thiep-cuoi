/* script.js - controls modules, admin, wishes, petal effect, export */
document.getElementById('wish-send').addEventListener('click', ()=>{
const name = wishName.value.trim();
const text = wishText.value.trim();
if(!text) return alert('Vui lòng nhập lời chúc');
const item = {name, text, time: new Date().toISOString()};
wishes.unshift(item); // newest first
localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
wishName.value=''; wishText.value='';
renderWishes();
});
document.getElementById('wish-clear').addEventListener('click', ()=>{ wishText.value=''; wishName.value=''; });


function renderWishes(){
wishesList.innerHTML = '';
if(wishes.length===0){ wishesList.innerHTML='<p class="small">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc!</p>'; return; }
wishes.forEach(w=>{
const div = document.createElement('div'); div.className='wish-item';
const who = w.name ? `<strong>${escapeHtml(w.name)}</strong>` : '<strong>Khách mời</strong>';
div.innerHTML = `${who} <div style="font-size:0.9rem;color:#666;margin-top:6px">${escapeHtml(w.text)}</div>`;
wishesList.appendChild(div);
});
}


// Export wishes to Excel
document.getElementById('export-wishes').addEventListener('click', ()=>{
if(wishes.length===0) return alert('Chưa có lời chúc để xuất');
const ws_data = [['Họ tên','Lời chúc','Thời gian']];
wishes.slice().reverse().forEach(w=>{ ws_data.push([w.name||'', w.text, w.time]); });
const ws = XLSX.utils.aoa_to_sheet(ws_data);
const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'LoiChuc');
XLSX.writeFile(wb, 'loi_chuc.xlsx');
});


// Music control
musicToggle.addEventListener('click', ()=>{
if(bgAudio.paused){ bgAudio.play(); musicToggle.textContent='Âm nhạc: Bật'; }
else{ bgAudio.pause(); musicToggle.textContent='Âm nhạc: Tắt'; }
});


// Petal effect
function createPetal(){
const p = document.createElement('div'); p.className='petal';
const size = (Math.random()*12)+6; p.style.width = size+'px'; p.style.height = (size*1.6)+'px';
p.style.left = Math.random()*100 + 'vw';
p.style.opacity = 0.6 + Math.random()*0.4;
const dur = 6 + Math.random()*6; p.style.transition = `transform ${dur}s linear, opacity ${dur}s linear`;
document.body.appendChild(p);
setTimeout(()=>{ p.style.transform = `translateY(110vh) rotate(${Math.random()*720}deg)`; p.style.opacity=0.2; },50);
setTimeout(()=>{ p.remove(); }, (dur+0.5)*1000);
}
setInterval(createPetal, 300);


// Utilities
function escapeHtml(s){ return String(s).replace(/[&"'<>]/g, function(m){ return {'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[m]; }); }


// Export full HTML (serialize current DOM into downloadable HTML)
function exportFullHTML(){
if(!confirm('Xuất ra file index.html với nội dung hiện tại?')) return;
const doc = document.documentElement.cloneNode(true);
// remove toolbar and modal from exported
const toolbarNode = doc.querySelector('#toolbar'); if(toolbarNode) toolbarNode.remove();
const modalNode = doc.querySelector('#modal'); if(modalNode) modalNode.remove();
const scripts = doc.querySelectorAll('script'); scripts.forEach(s=>s.remove());
// Inline CSS
const css = fetch('style.css').then(r=>r.text()).catch(()=>null);
css.then(styleText=>{
const head = doc.querySelector('head');
const s = doc.createElement('style'); s.textContent = styleText || '';
head.appendChild(s);
const html = '<!doctype html>
' + doc.outerHTML;
const blob = new Blob([html], {type:'text/html'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a'); a.href = url; a.download = 'index.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});
}


// On load
window.addEventListener('load', ()=>{
// Put toolbar login button if not shown
const loginBtn = document.createElement('button'); loginBtn.className='btn'; loginBtn.textContent='Admin';
loginBtn.style.position='fixed'; loginBtn.style.right='18px'; loginBtn.style.top='18px'; loginBtn.style.zIndex=1300;
loginBtn.addEventListener('click', ()=>{ askAdmin(); });
document.body.appendChild(loginBtn);


// If modules empty, seed one example
if(modules.length===0){ modules.push({type:'text', title:'Lời mời', content:'Trân trọng kính mời quý khách đến dự lễ thành hôn của chúng tôi.'}); saveAndRender(); }


render();
});


})();
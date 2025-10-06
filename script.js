let modules = JSON.parse(localStorage.getItem('wedding_modules') || '[]');
let wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');

const wishName = document.getElementById('wish-name');
const wishText = document.getElementById('wish-text');
const wishesList = document.getElementById('wishes-list');
const musicToggle = document.getElementById('music-toggle');
const ytplayer = document.getElementById('ytplayer');

document.getElementById('wish-send').addEventListener('click', ()=>{
  const name = wishName.value.trim();
  const text = wishText.value.trim();
  if(!text) return alert('Vui lòng nhập lời chúc');
  const item = {name, text, time: new Date().toISOString()};
  wishes.unshift(item);
  localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  wishName.value=''; wishText.value='';
  renderWishes();
});

document.getElementById('wish-clear').addEventListener('click', ()=>{ wishText.value=''; wishName.value=''; });

function renderWishes(){
  wishesList.innerHTML = '';
  if(wishes.length===0){
    wishesList.innerHTML='<p class="small">Chưa có lời chúc nào. Hãy là người đầu tiên gửi lời chúc!</p>';
    return;
  }
  wishes.forEach(w=>{
    const div = document.createElement('div'); div.className='wish-item';
    const who = w.name ? `<strong>${escapeHtml(w.name)}</strong>` : '<strong>Khách mời</strong>';
    div.innerHTML = `${who}<div style="font-size:0.9rem;color:#666;margin-top:6px">${escapeHtml(w.text)}</div>`;
    wishesList.appendChild(div);
  });
}

document.getElementById('export-wishes').addEventListener('click', ()=>{
  if(wishes.length===0) return alert('Chưa có lời chúc để xuất');
  const ws_data = [['Họ tên','Lời chúc','Thời gian']];
  wishes.slice().reverse().forEach(w=>{ ws_data.push([w.name||'', w.text, w.time]); });
  const ws = XLSX.utils.aoa_to_sheet(ws_data);
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'LoiChuc');
  XLSX.writeFile(wb, 'loi_chuc.xlsx');
});

musicToggle.addEventListener('click', ()=>{
  ytplayer.src = ytplayer.src.replace('autoplay=0','autoplay=1');
  alert('Nhạc sẽ bắt đầu phát 🎵');
});

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
setInterval(createPetal, 400);

function escapeHtml(s){ return String(s).replace(/[&"'<>]/g, m => ({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[m])); }

window.addEventListener('load', ()=>{ renderWishes(); });

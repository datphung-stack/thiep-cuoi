/* script.js - controls modules, admin, wishes, petal effect, export */
(function(){
  const ADMIN_PWD = 'TienLinh';

  // Elements
  const modulesArea = document.getElementById('modules-area');
  const toolbar = document.getElementById('toolbar');
  const modal = document.getElementById('modal');
  const moduleType = document.getElementById('module-type');
  const moduleFields = document.getElementById('module-fields');
  const musicToggle = document.getElementById('music-toggle');
  const ytPlayer = document.getElementById('yt-player');

  // Wishes elements
  const wishName = document.getElementById('wish-name');
  const wishText = document.getElementById('wish-text');
  const wishesList = document.getElementById('wishes-list');

  // Data stores
  let modules = JSON.parse(localStorage.getItem('wedding_modules') || '[]');
  let wishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');

  // Seed default module if empty
  if(modules.length===0){
    modules.push({type:'text', title:'Lời mời', content:'Trân trọng kính mời quý khách đến dự lễ thành hôn của chúng tôi.'});
    localStorage.setItem('wedding_modules', JSON.stringify(modules));
  }

  // Render modules and static info
  function render(){
    // clear modules area then re-add static info and saved modules
    modulesArea.innerHTML = '';
    // add saved modules
    modules.forEach((m, idx)=>{
      const sec = document.createElement('section');
      sec.className = 'card module';
      if(m.type==='text'){
        sec.innerHTML = `<h3>${escapeHtml(m.title||'')}</h3><p>${m.content||''}</p>`;
      } else if(m.type==='image'){
        sec.innerHTML = `<h3>${escapeHtml(m.title||'')}</h3><img src="${m.src}" alt="">`;
      } else if(m.type==='video'){
        sec.innerHTML = `<h3>${escapeHtml(m.title||'')}</h3><div style="position:relative;padding-top:56.25%"><iframe src="${m.embed}" frameborder="0" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%"></iframe></div>`;
      }
      modulesArea.appendChild(sec);
    });
    // append static info card (info is included initially in index file; keep it at top)
    const info = document.getElementById('module-info');
    if(info) modulesArea.insertBefore(info, modulesArea.firstChild);
    renderWishes();
  }

  // Save and render
  function saveAndRender(){
    localStorage.setItem('wedding_modules', JSON.stringify(modules));
    render();
  }

  // Admin login prompt
  function askAdmin(){
    const pwd = prompt('Nhập mật khẩu admin để chỉnh sửa:');
    if(pwd === ADMIN_PWD){
      toolbar.style.display = 'flex';
      modal.style.display = 'none';
      // show delete buttons by re-rendering (future enhancement)
      alert('Đã bật chế độ admin. Bạn có thể Thêm mục.');
    } else if(pwd){
      alert('Mật khẩu sai');
    }
  }

  // Modal handling for adding module
  document.getElementById('btn-add').addEventListener('click', ()=>{ showModal(); });
  document.getElementById('modal-cancel').addEventListener('click', ()=>{ modal.style.display='none'; });
  moduleType.addEventListener('change', renderModuleFields);

  function showModal(){
    moduleFields.innerHTML='';
    modal.style.display='flex';
    renderModuleFields();
  }

  function renderModuleFields(){
    const t = moduleType.value;
    moduleFields.innerHTML='';
    if(t==='text'){
      moduleFields.innerHTML = `<div class="form-row"><label>Tiêu đề (không bắt buộc)</label><input id="m-title" type="text"></div>
      <div class="form-row"><label>Nội dung</label><textarea id="m-content"></textarea></div>`;
    } else if(t==='image'){
      moduleFields.innerHTML = `<div class="form-row"><label>Tiêu đề (không bắt buộc)</label><input id="m-title" type="text"></div>
      <div class="form-row"><label>Chọn ảnh (upload từ máy)</label><input id="m-file" type="file" accept="image/*"></div>`;
      const fileInput = moduleFields.querySelector('#m-file');
      fileInput.addEventListener('change', ()=>{
        const f = fileInput.files[0];
        if(!f) return;
        const reader = new FileReader();
        reader.onload = ()=>{ fileInput.dataset.src = reader.result; };
        reader.readAsDataURL(f);
      });
    } else if(t==='video'){
      moduleFields.innerHTML = `<div class="form-row"><label>Tiêu đề (không bắt buộc)</label><input id="m-title" type="text"></div>
      <div class="form-row"><label>URL YouTube (ví dụ: https://www.youtube.com/watch?v=...)</label><input id="m-src" type="text"></div>`;
    }
  }

  document.getElementById('modal-add').addEventListener('click', ()=>{
    const t = moduleType.value;
    if(t==='text'){
      const title = (moduleFields.querySelector('#m-title')||{}).value || '';
      const content = (moduleFields.querySelector('#m-content')||{}).value || '';
      modules.push({type:'text', title, content});
    } else if(t==='image'){
      const title = (moduleFields.querySelector('#m-title')||{}).value || '';
      const fileInput = moduleFields.querySelector('#m-file');
      const src = fileInput.dataset.src || '';
      if(!src){ alert('Chưa chọn ảnh'); return; }
      modules.push({type:'image', title, src});
    } else if(t==='video'){
      const title = (moduleFields.querySelector('#m-title')||{}).value || '';
      const src = (moduleFields.querySelector('#m-src')||{}).value || '';
      if(!src){ alert('Chưa nhập link video'); return; }
      // convert to embed URL
      const embed = toYouTubeEmbed(src);
      modules.push({type:'video', title, src, embed});
    }
    modal.style.display='none';
    saveAndRender();
  });

  // Wishes logic
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

  // Music: embed YouTube on demand (after user interaction)
  const YT_VIDEO = 'https://www.youtube.com/watch?v=F5iR0tG3PE0';
  let ytEmbedded = false;
  musicToggle.addEventListener('click', ()=>{
    if(!ytEmbedded){
      // create iframe autoplay (muted first, then unmute on toggle if allowed)
      const vid = toYouTubeEmbed(YT_VIDEO) + '?autoplay=1&rel=0&modestbranding=1';
      ytPlayer.innerHTML = `<iframe id="ytframe" src="${vid}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:0;height:0;visibility:hidden"></iframe>`;
      ytEmbedded = true;
      musicToggle.textContent = 'Âm nhạc: Bật';
    } else {
      // toggle by removing or adding iframe
      const f = document.getElementById('ytframe');
      if(f){ ytPlayer.innerHTML = ''; musicToggle.textContent = 'Âm nhạc: Tắt'; ytEmbedded=false; }
      else { const vid = toYouTubeEmbed(YT_VIDEO) + '?autoplay=1&rel=0&modestbranding=1'; ytPlayer.innerHTML = `<iframe id="ytframe" src="${vid}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:0;height:0;visibility:hidden"></iframe>`; ytEmbedded=true; musicToggle.textContent = 'Âm nhạc: Bật'; }
    }
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

  // Export full HTML (serialize current DOM into downloadable HTML)
  function exportFullHTML(){
    if(!confirm('Xuất ra file index.html với nội dung hiện tại?')) return;
    const doc = document.documentElement.cloneNode(true);
    const toolbarNode = doc.querySelector('#toolbar'); if(toolbarNode) toolbarNode.remove();
    const modalNode = doc.querySelector('#modal'); if(modalNode) modalNode.remove();
    const scripts = doc.querySelectorAll('script'); scripts.forEach(s=>s.remove());
    // Inline CSS
    fetch('style.css').then(r=>r.text()).then(styleText=>{
      const head = doc.querySelector('head');
      const s = doc.createElement('style'); s.textContent = styleText || '';
      head.appendChild(s);
      const html = `<!doctype html>
${doc.outerHTML}`;
      const blob = new Blob([html], {type:'text/html'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'index.html'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    }).catch(()=>{ alert('Không thể đọc style.css để nhúng.'); });
  }

  document.getElementById('btn-export').addEventListener('click', exportFullHTML);
  document.getElementById('btn-clear').addEventListener('click', ()=>{ if(confirm('Xóa tất cả mục đã thêm?')){ modules=[]; localStorage.removeItem('wedding_modules'); render(); }});

  // Utilities
  function escapeHtml(s){ return String(s).replace(/[&"'<>]/g, function(m){ return {'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[m]; }); }
  function toYouTubeEmbed(url){ try{ const u = new URL(url); let v = u.searchParams.get('v'); if(!v && u.pathname.includes('/embed/')) v = u.pathname.split('/embed/')[1]; if(!v && u.pathname.length>1) v = u.pathname.split('/').pop(); return 'https://www.youtube.com/embed/' + v; }catch(e){ return url; } }

  // Add admin login button on load
  window.addEventListener('load', ()=>{
    const loginBtn = document.createElement('button'); loginBtn.className='btn'; loginBtn.textContent='Admin';
    loginBtn.style.position='fixed'; loginBtn.style.right='18px'; loginBtn.style.top='18px'; loginBtn.style.zIndex=1300;
    loginBtn.addEventListener('click', ()=>{ askAdmin(); });
    document.body.appendChild(loginBtn);
    render();
  });

})();
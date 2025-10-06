let wishes = JSON.parse(localStorage.getItem('wedding_wishes')||'[]');
const wishName=document.getElementById('wish-name');
const wishText=document.getElementById('wish-text');
const wishesList=document.getElementById('wishes-list');

document.getElementById('wish-send').addEventListener('click', ()=>{
  const name = wishName.value.trim();
  const text = wishText.value.trim();
  if(!text) return alert('Vui lòng nhập lời chúc');
  const item = {name, text, time: new Date().toLocaleString()};
  wishes.unshift(item);
  localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
  wishName.value=''; wishText.value='';
  renderWishes();
});

document.getElementById('wish-clear').addEventListener('click', ()=>{wishText.value='';wishName.value='';});

function renderWishes(){
  wishesList.innerHTML='';
  if(wishes.length===0){wishesList.innerHTML='<p class="small">Chưa có lời chúc nào.</p>';return;}
  wishes.forEach(w=>{
    const div=document.createElement('div');div.className='wish-item';
    const who=w.name?`<strong>${w.name}</strong>`:'<strong>Khách mời</strong>';
    div.innerHTML=`${who}<div>${w.text}</div>`;
    wishesList.appendChild(div);
  });
}

document.getElementById('export-wishes').addEventListener('click', ()=>{
  if(wishes.length===0) return alert('Chưa có lời chúc để xuất');
  const ws_data=[['Họ tên','Lời chúc','Thời gian']];
  wishes.forEach(w=>ws_data.push([w.name||'',w.text,w.time]));
  const ws=XLSX.utils.aoa_to_sheet(ws_data);
  const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,'LoiChuc');
  XLSX.writeFile(wb,'loi_chuc.xlsx');
});

function copyToClipboard(text){
  navigator.clipboard.writeText(text);
  alert('Đã sao chép STK: '+text);
}

renderWishes();

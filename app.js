(() => {
  const seed = [
    {guest:'Amara Okafor',room:'Deluxe King · 204',stay:'Oct 02 — Oct 05',status:'Checked in',amount:55500,initials:'AO'},
    {guest:'James Mwangi',room:'Executive Suite · 501',stay:'Oct 02 — Oct 04',status:'Arriving',amount:64000,initials:'JM'},
    {guest:'Sofia Patel',room:'Garden Twin · 116',stay:'Oct 02 — Oct 06',status:'Arriving',amount:58000,initials:'SP'},
    {guest:'Daniel Kimani',room:'Premier Suite · 602',stay:'Sep 30 — Oct 02',status:'Checked out',amount:96000,initials:'DK'},
    {guest:'Zuri Njeri',room:'Deluxe King · 208',stay:'Oct 02 — Oct 03',status:'Arriving',amount:18500,initials:'ZN'}
  ];
  const rooms = [
    {guest:'Room 101',room:'Standard Queen',stay:'Ground floor · Garden side',status:'Available',amount:'KES 12,500'},
    {guest:'Room 204',room:'Deluxe King',stay:'2nd floor · City view',status:'Occupied',amount:'KES 18,500'},
    {guest:'Room 305',room:'Garden Twin',stay:'3rd floor · Garden view',status:'Needs cleaning',amount:'KES 14,500'},
    {guest:'Room 501',room:'Executive Suite',stay:'5th floor · Lounge access',status:'Occupied',amount:'KES 32,000'},
    {guest:'Room 602',room:'Premier Suite',stay:'6th floor · Balcony',status:'Available',amount:'KES 42,000'}
  ];
  const housekeeping = [
    {guest:'Room 305',room:'Garden Twin',stay:'Checkout 11:00 AM · Guest departed',status:'Needs cleaning',amount:'High priority'},
    {guest:'Room 116',room:'Garden Twin',stay:'Checkout 12:00 PM · Guest departing',status:'Needs cleaning',amount:'Standard'},
    {guest:'Room 204',room:'Deluxe King',stay:'Guest service request · Fresh towels',status:'In progress',amount:'Assigned: Mia'},
    {guest:'Room 411',room:'Deluxe King',stay:'Stayover service · Due by 2:00 PM',status:'Assigned',amount:'Assigned: Jo'}
  ];
  let bookings;
  let activeView = 'overview';
  try { bookings = JSON.parse(localStorage.getItem('cypherBookings')) || seed; } catch { bookings = seed; }
  const $ = s => document.querySelector(s);
  const rows = $('#bookingRows'), secondaryRows = $('#secondaryRows'), dialog = $('#bookingDialog'), form = $('#bookingForm');
  const money = n => 'KES ' + Number(n).toLocaleString('en-KE');
  const initials = name => name.trim().split(/\s+/).slice(0,2).map(x => x[0]).join('').toUpperCase();
  const statusClass = s => s === 'Checked in' ? 'checked' : s === 'Arriving' ? 'arriving' : 'out';
  const operationalStatusClass = s => s === 'Available' ? 'checked' : s === 'Occupied' ? 'arriving' : 'out';
  const dateLabel = s => { if (!s) return '—'; const d = new Date(s + 'T12:00:00'); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}); };
  function render() {
    rows.innerHTML = bookings.slice(0,5).map((b,i) => `<tr><td><div class="guest-cell"><span class="guest-avatar ${i%3===1?'v2':i%3===2?'v3':''}">${b.initials || initials(b.guest)}</span>${escapeHtml(b.guest)}</div></td><td>${escapeHtml(b.room)}</td><td>${escapeHtml(b.stay)}</td><td><span class="status ${statusClass(b.status)}">${escapeHtml(b.status)}</span></td><td><button class="row-more" aria-label="Reservation options" data-toast="Reservation details are up to date">···</button></td></tr>`).join('');
    $('#reservationCount').textContent = String(bookings.length).padStart(2,'0');
    const q = ($('#searchInput')?.value || '').toLowerCase(), f = $('#statusFilter')?.value || 'all';
    const currentView = activeView;
    const operational = currentView === 'rooms' ? rooms : currentView === 'housekeeping' ? housekeeping : null;
    const source = operational || bookings;
    const found = source.filter(b => (f === 'all' || b.status === f || operational && (f === 'Checked in' && b.status === 'Occupied') || operational && (f === 'Arriving' && b.status === 'Available') || operational && (f === 'Checked out' && b.status === 'Needs cleaning')) && (b.guest.toLowerCase().includes(q) || b.room.toLowerCase().includes(q)));
    secondaryRows.innerHTML = found.map((b,i) => `<tr><td><div class="guest-cell"><span class="guest-avatar ${i%3===1?'v2':i%3===2?'v3':''}">${b.initials || (operational ? b.guest.replace('Room ','') : initials(b.guest))}</span>${escapeHtml(b.guest)}</div></td><td>${escapeHtml(b.room)}</td><td>${escapeHtml(b.stay)}</td><td><span class="status ${operational ? operationalStatusClass(b.status) : statusClass(b.status)}">${escapeHtml(b.status)}</span></td><td>${operational ? escapeHtml(b.amount) : money(b.amount)}</td></tr>`).join('');
    $('#emptyState').hidden = found.length > 0;
    $('#arrivalStat').textContent = String(bookings.filter(b => b.status === 'Arriving').length + 9).padStart(2,'0');
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  let toastTimer;
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600); }
  function setView(name) {
    activeView = name;
    const overview = name === 'overview'; $('#overviewView').classList.toggle('active',overview); $('#secondaryView').classList.toggle('active',!overview);
    document.querySelectorAll('.nav-link[data-view]').forEach(a => a.classList.toggle('active',a.dataset.view===name));
    const title = ({bookings:'Reservations',rooms:'Rooms',guests:'Guests',restaurant:'Restaurant',housekeeping:'Housekeeping',reports:'Reports'})[name] || 'Overview';
    const desc = ({bookings:'Manage your guests and upcoming stays.',rooms:'Track room availability, occupancy, and service status.',guests:'Guest profiles and stay history in one place.',restaurant:'Keep an eye on dining reservations and guest service.',housekeeping:'Coordinate room cleaning and turnarounds.',reports:'A clear view of hotel performance and activity.'})[name] || '';
    $('#crumb').textContent=title; $('#secondaryTitle').textContent=title; $('#secondaryPanelTitle').textContent=({bookings:'All reservations',rooms:'Room inventory',guests:'Guest directory',restaurant:'Dining overview',housekeeping:'Housekeeping tasks',reports:'Hotel activity'})[name]||title;
    $('#secondaryDescription').textContent=desc;
    $('#searchInput').placeholder = name === 'rooms' ? 'Search rooms or types' : name === 'housekeeping' ? 'Search tasks or rooms' : 'Search guests or rooms';
    const action=$('#secondaryAction'); action.style.visibility=['bookings','guests'].includes(name)?'visible':'hidden';
    if(name==='rooms'||name==='housekeeping') $('#statusFilter').innerHTML='<option value="all">All status</option><option value="Checked in">Occupied</option><option value="Arriving">Available</option><option value="Checked out">Needs cleaning</option>';
    else $('#statusFilter').innerHTML='<option value="all">All status</option><option value="Checked in">Checked in</option><option value="Arriving">Arriving</option><option value="Checked out">Checked out</option>';
    render(); $('#sidebar').classList.remove('open');
  }
  document.addEventListener('click',e=>{
    const nav=e.target.closest('[data-view]'); if(nav){e.preventDefault();setView(nav.dataset.view);history.replaceState(null,'','#'+nav.dataset.view);return;}
    const notice=e.target.closest('[data-toast]'); if(notice)toast(notice.dataset.toast);
  });
  $('#newBooking').addEventListener('click',()=>dialog.showModal()); $('#secondaryAction').addEventListener('click',()=>dialog.showModal());
  $('#searchInput').addEventListener('input',render); $('#statusFilter').addEventListener('change',render);
  $('#mobileMenu').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
  const themeToggle = $('#themeToggle');
  const setTheme = dark => { document.body.classList.toggle('dark-theme', dark); themeToggle.textContent = dark ? '☀' : '☾'; themeToggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode'; themeToggle.setAttribute('aria-label', themeToggle.title); };
  setTheme(localStorage.getItem('cypherTheme') === 'dark');
  themeToggle.addEventListener('click',()=>{ const dark = !document.body.classList.contains('dark-theme'); setTheme(dark); try { localStorage.setItem('cypherTheme', dark ? 'dark' : 'light'); } catch { toast('Theme changed for this session.'); } });
  document.addEventListener('click',e=>{if(innerWidth<=700 && $('#sidebar').classList.contains('open') && !e.target.closest('#sidebar')&&!e.target.closest('#mobileMenu'))$('#sidebar').classList.remove('open');});
  const today=new Date(); $('#today').textContent=today.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric'}); $('#overviewDate').textContent=today.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'}).toUpperCase(); $('#roomDateLabel').textContent=today.toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long'});
  const inDate=form.elements.checkin, outDate=form.elements.checkout;
  const localDay=d=>{const x=new Date(d.getTime()-d.getTimezoneOffset()*60000);return x.toISOString().slice(0,10);};
  inDate.min=localDay(today); inDate.value=localDay(today); const tomorrow=new Date(today);tomorrow.setDate(today.getDate()+1);outDate.min=localDay(tomorrow);outDate.value=localDay(tomorrow);
  inDate.addEventListener('change',()=>{const after=new Date(inDate.value+'T12:00:00');after.setDate(after.getDate()+1);outDate.min=localDay(after);if(outDate.value<=inDate.value)outDate.value=outDate.min;});
  form.addEventListener('submit',e=>{
    e.preventDefault(); if(!form.reportValidity())return;
    const d=new FormData(form), room=d.get('room'), checkin=d.get('checkin'), checkout=d.get('checkout');
    if(checkout<=checkin){outDate.setCustomValidity('Check-out must be after check-in.');outDate.reportValidity();outDate.setCustomValidity('');return;}
    const nights=Math.max(1,Math.round((new Date(checkout)-new Date(checkin))/86400000));
    const rates={'Deluxe King':18500,'Executive Suite':32000,'Garden Twin':14500,'Premier Suite':42000};
    const type=room.split(' · ')[0];
    bookings.unshift({guest:d.get('guest').trim(),room,stay:`${dateLabel(checkin)} — ${dateLabel(checkout)}`,status:'Arriving',amount:nights*(rates[type]||18500),initials:initials(d.get('guest'))});
    try{localStorage.setItem('cypherBookings',JSON.stringify(bookings));}catch{toast('Reservation added for this session.');}
    form.reset();inDate.value=localDay(today);outDate.value=localDay(tomorrow);render();dialog.close();setView('bookings');toast('Reservation created successfully.');
  });
  $('#roomDate').addEventListener('click',()=>toast('Showing today’s room availability'));
  if(location.hash && location.hash!=='#overview') setView(location.hash.slice(1));
  render();
})();

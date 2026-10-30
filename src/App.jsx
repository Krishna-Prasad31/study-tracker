import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutDashboard, BookOpen, Clock3, CalendarDays, Settings, Plus, Search,
  MoreHorizontal, ChevronRight, Check, Circle, Play, Pause, Square, Sun, Moon,
  Trash2, Pencil, X, Target, Flame, Timer, NotebookPen, ArrowUpRight, Filter,
  GraduationCap, Sparkles, Download, RotateCcw, CheckCircle2, AlertCircle
} from 'lucide-react';

const seed = {
  subjects: [
    { id:'s1', name:'Control Systems', color:'#7667e8', chapters:[
      {id:'c1',name:'Introduction to Control Systems',status:'Completed',priority:'Medium',notes:'Basic definitions and open/closed loop systems.',target:''},
      {id:'c2',name:'Mathematical Modelling',status:'In Progress',priority:'High',notes:'Revise transfer functions.',target:''},
      {id:'c3',name:'Time Response Analysis',status:'Not Started',priority:'High',notes:'',target:''},
      {id:'c4',name:'Root Locus Techniques',status:'Not Started',priority:'Medium',notes:'',target:''}
    ]},
    { id:'s2', name:'Digital Signal Processing', color:'#269c91', chapters:[
      {id:'c5',name:'Discrete-Time Signals',status:'Completed',priority:'Medium',notes:'',target:''},
      {id:'c6',name:'Z-Transform',status:'In Progress',priority:'High',notes:'Practice inverse Z-transform problems.',target:''},
      {id:'c7',name:'DFT and FFT',status:'Not Started',priority:'Low',notes:'',target:''}
    ]},
    { id:'s3', name:'Power Electronics', color:'#df9851', chapters:[
      {id:'c8',name:'Power Semiconductor Devices',status:'Not Started',priority:'Medium',notes:'',target:''},
      {id:'c9',name:'Controlled Rectifiers',status:'Not Started',priority:'High',notes:'',target:''}
    ]}
  ],
  sessions: [], goal: 120, theme: 'light'
};
const uid = () => Math.random().toString(36).slice(2,10);
const read = () => { try { const v=JSON.parse(localStorage.getItem('studyspace-data')); return v && Array.isArray(v.subjects) ? {...structuredClone(seed),...v,sessions:Array.isArray(v.sessions)?v.sessions:[],goal:Number(v.goal)||120} : structuredClone(seed); } catch { return structuredClone(seed); } };
const localDate = () => { const d=new Date(); const offset=d.getTimezoneOffset(); return new Date(d.getTime()-offset*60000).toISOString().slice(0,10); };
const pct = s => s.chapters.length ? Math.round(s.chapters.filter(c=>c.status==='Completed').length/s.chapters.length*100) : 0;
const fmt = mins => `${Math.floor(mins/60)}h ${mins%60}m`;

function Modal({title, onClose, children}) {
  return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal"><div className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose}><X size={18}/></button></div>{children}</div></div>;
}

export default function App() {
  const [data,setData] = useState(read);
  const [page,setPage] = useState('Overview');
  const [selected,setSelected] = useState('s1');
  const [subjectQuery,setSubjectQuery] = useState('');
  const [chapterQuery,setChapterQuery] = useState('');
  const [filter,setFilter] = useState('All');
  const [modal,setModal] = useState(null);
  const [toast,setToast] = useState('');
  const [timer,setTimer] = useState({running:false,seconds:0,subjectId:'',chapter:''});
  const [dark,setDark] = useState(read().theme==='dark');

  useEffect(()=>{localStorage.setItem('studyspace-data',JSON.stringify({...data,theme:dark?'dark':'light'}));},[data,dark]);
  useEffect(()=>{if(!timer.running)return;const t=setInterval(()=>setTimer(v=>({...v,seconds:v.seconds+1})),1000);return()=>clearInterval(t);},[timer.running]);
  useEffect(()=>{if(toast){const t=setTimeout(()=>setToast(''),2600);return()=>clearTimeout(t)}},[toast]);

  const chapters = data.subjects.flatMap(s=>s.chapters.map(c=>({...c,subjectId:s.id,subjectName:s.name})));
  const completed = chapters.filter(c=>c.status==='Completed').length;
  const inProgress = chapters.filter(c=>c.status==='In Progress').length;
  const overall = chapters.length?Math.round(completed/chapters.length*100):0;
  const totalMinutes = data.sessions.reduce((a,s)=>a+s.minutes,0);
  const activeSubject = data.subjects.find(s=>s.id===selected) || data.subjects[0];
  const today = localDate();

  function update(fn){setData(old=>fn(structuredClone(old)));}
  function notify(s){setToast(s);}
  function addSubject(){
    setModal({kind:'subject',title:'Add a subject',value:{name:'',color:'#7667e8'}});
  }
  function editSubject(s){setModal({kind:'subject',title:'Edit subject',id:s.id,value:{name:s.name,color:s.color}});}
  function saveSubject(v,id){
    const name=v.name.trim();
    if(!name)return;
    if(id){
      update(d=>{const subject=d.subjects.find(x=>x.id===id);if(subject)Object.assign(subject,{...v,name});return d;});
    }else{
      const newSubject={id:uid(),name,color:v.color,chapters:[]};
      update(d=>{d.subjects.push(newSubject);return d;});
      setSelected(newSubject.id);
    }
    setModal(null);notify(id?'Subject updated':'Subject added');
  }
  function deleteSubject(id){
    if(!confirm('Delete this subject and all its chapters?'))return;
    update(d=>{d.subjects=d.subjects.filter(s=>s.id!==id);return d;});
    if(selected===id)setSelected(data.subjects.find(s=>s.id!==id)?.id||'');
    notify('Subject deleted');
  }
  function addChapter(subjectId){setModal({kind:'chapter',title:'Add a chapter',subjectId,value:{name:'',status:'Not Started',priority:'Medium',target:'',notes:''}});}
  function editChapter(subjectId,c){setModal({kind:'chapter',title:'Edit chapter',subjectId,id:c.id,value:{...c}});}
  function saveChapter(v,subjectId,id){
    if(!v.name.trim())return;
    update(d=>{const s=d.subjects.find(x=>x.id===subjectId);if(id){const c=s.chapters.find(x=>x.id===id);Object.assign(c,v);}else{s.chapters.push({id:uid(),...v});}return d;});
    setModal(null);notify(id?'Chapter updated':'Chapter added');
  }
  function deleteChapter(subjectId,id){
    if(!confirm('Delete this chapter?'))return;
    update(d=>{const s=d.subjects.find(x=>x.id===subjectId);s.chapters=s.chapters.filter(c=>c.id!==id);return d;});notify('Chapter deleted');
  }
  function changeStatus(subjectId,id,status){
    update(d=>{const subject=d.subjects.find(s=>s.id===subjectId);const chapter=subject?.chapters.find(c=>c.id===id);if(chapter)chapter.status=status;return d;});
  }
  function logSession(){
    if(timer.seconds<1){notify('Start a timer before saving a session');return;}
    const minutes=Math.max(1,Math.round(timer.seconds/60));
    update(d=>{d.sessions.unshift({id:uid(),date:today,minutes,subject:data.subjects.find(s=>s.id===timer.subjectId)?.name||'General study',chapter:timer.chapter||'',note:''});return d;});
    setTimer({running:false,seconds:0,subjectId:'',chapter:''});notify(`${minutes} minutes logged`);
  }
  function exportData(){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='studyspace-backup.json';a.click();URL.revokeObjectURL(url);
  }
  const filteredSubjects = data.subjects.filter(s=>s.name.toLowerCase().includes(subjectQuery.toLowerCase()));
  const nav=[['Overview',LayoutDashboard],['My Subjects',BookOpen],['Study Sessions',Clock3],['Revision Planner',CalendarDays]];
  const themeClass=dark?'app dark':'app';

  return <div className={themeClass}>
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><GraduationCap size={21}/></div><span>studyspace<span className="brand-dot">.</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(([name,Icon])=><button key={name} className={`nav-item ${page===name?'active':''}`} onClick={()=>{if(name==='My Subjects'){setSubjectQuery('');setChapterQuery('');}setPage(name)}}><Icon size={18}/><span>{name}</span>{name==='My Subjects'&&<span className="nav-count">{data.subjects.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="sidebar-tip"><Sparkles size={16}/><b>Small steps, big results.</b><p>Consistency beats cramming. Keep showing up.</p></div>
        <button className="nav-item" onClick={()=>setPage('Settings')}><Settings size={18}/>Settings</button>
        <div className="profile"><div className="avatar">S</div><div><b>My Study Space</b><small>Personal workspace</small></div><MoreHorizontal size={18} className="muted"/></div>
      </div>
    </aside>
    <main className="main">
      <header className="topbar"><div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{page}</b></div><div className="top-actions"><div className="date-label"><CalendarDays size={15}/>{new Date().toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div><button className="icon-btn" onClick={()=>setDark(!dark)} title="Toggle theme">{dark?<Sun size={18}/>:<Moon size={18}/>}</button></div></header>
      <div className="content">
        {page==='Overview'&&<>
          <div className="welcome-row"><div><div className="eyebrow">YOUR PERSONAL ACADEMIC SPACE</div><h1>Good to see you<span className="wave"> ✦</span></h1><p className="subheading">A little progress every day adds up. Here's your study snapshot.</p></div><button className="button primary" onClick={addSubject}><Plus size={17}/> Add subject</button></div>
          <div className="stats-grid">
            <Stat icon={BookOpen} label="Total subjects" value={data.subjects.length} foot="In your workspace" tint="purple"/>
            <Stat icon={NotebookPen} label="Total chapters" value={chapters.length} foot={`${chapters.length-completed} left to complete`} tint="blue"/>
            <Stat icon={CheckCircle2} label="Completed" value={completed} foot={`${overall}% of all chapters`} tint="green"/>
            <Stat icon={Clock3} label="Study time" value={fmt(totalMinutes)} foot="Time logged so far" tint="orange"/>
          </div>
          <div className="overview-grid">
            <section className="panel progress-panel"><div className="section-head"><div><h2>Overall progress</h2><p>Your semester at a glance</p></div><span className="soft-pill"><ArrowUpRight size={14}/> In progress</span></div>
              <div className="progress-main"><div className="progress-number">{overall}<small>%</small></div><div className="progress-copy"><b>You're building momentum.</b><span>{completed} of {chapters.length} chapters completed across all subjects.</span></div></div>
              <div className="progress-track"><div style={{width:`${overall}%`}}/></div>
              <div className="legend"><span><i className="dot done"/>Completed <b>{completed}</b></span><span><i className="dot doing"/>In progress <b>{inProgress}</b></span><span><i className="dot pending"/>Not started <b>{chapters.length-completed-inProgress}</b></span></div>
            </section>
            <section className="panel goal-panel"><div className="section-head"><div><h2>Daily study goal</h2><p>Make time for what matters</p></div><Target size={19} className="muted"/></div>
              <div className="goal-circle" style={{'--progress':`${Math.min(100,(data.sessions.filter(s=>s.date===today).reduce((a,s)=>a+s.minutes,0)/data.goal)*100)}%`}}><div><b>{Math.round(data.sessions.filter(s=>s.date===today).reduce((a,s)=>a+s.minutes,0))}</b><small>of {data.goal} min</small></div></div>
              <div className="goal-bottom"><span>Today's focus</span><button className="text-button" onClick={()=>setModal({kind:'goal',title:'Set daily goal',value:{goal:data.goal}})}>Edit goal</button></div>
            </section>
          </div>
          <section className="panel subjects-panel"><div className="section-head"><div><h2>Your subjects</h2><p>Pick up where you left off</p></div><button className="text-button" onClick={()=>{setSubjectQuery('');setChapterQuery('');setPage('My Subjects')}}>View all <ChevronRight size={15}/></button></div>
            {data.subjects.length?<div className="subject-grid">{data.subjects.slice(0,6).map(s=><SubjectCard key={s.id} subject={s} onClick={()=>{setSelected(s.id);setSubjectQuery('');setChapterQuery('');setPage('My Subjects')}}/>)}</div>:<Empty icon={BookOpen} title="No subjects added yet" text="Create your first subject to start organising your studies." action="Add a subject" onAction={addSubject}/>}
          </section>
          <section className="panel lower-panel"><div className="section-head"><div><h2>Up next</h2><p>Chapters that need your attention</p></div><span className="soft-pill">{chapters.filter(c=>c.status!=='Completed').length} remaining</span></div>
            <ChapterRows items={chapters.filter(c=>c.status!=='Completed').slice(0,4)} onStatus={changeStatus} onEdit={(c)=>editChapter(c.subjectId,data.subjects.find(s=>s.id===c.subjectId).chapters.find(x=>x.id===c.id))}/>
          </section>
        </>}
        {page==='My Subjects'&&<><div className="page-heading"><div><div className="eyebrow">YOUR LEARNING LIBRARY</div><h1>My subjects</h1><p className="subheading">Everything you're studying, all in one place.</p></div><button className="button primary" onClick={addSubject}><Plus size={17}/> Add subject</button></div>
          <div className="search-row"><div className="searchbox"><Search size={17}/><input value={subjectQuery} onChange={e=>setSubjectQuery(e.target.value)} placeholder="Search subjects..."/></div><span className="muted small">{filteredSubjects.length} subjects</span></div>
          <div className="subject-grid full">{filteredSubjects.map(s=><SubjectCard key={s.id} subject={s} onClick={()=>{setSelected(s.id);setChapterQuery('');setFilter('All')}} selected={selected===s.id}/>)}</div>
          {activeSubject&&<section className="panel detail-panel"><div className="detail-title"><div className="subject-symbol" style={{background:activeSubject.color+'18',color:activeSubject.color}}><BookOpen size={22}/></div><div className="detail-name"><h2>{activeSubject.name}</h2><p>{activeSubject.chapters.length} chapters · {pct(activeSubject)}% complete</p></div><div className="detail-actions"><button className="button secondary small-button" onClick={()=>editSubject(activeSubject)}><Pencil size={15}/> Edit</button><button className="icon-btn danger-icon" onClick={()=>deleteSubject(activeSubject.id)}><Trash2 size={17}/></button></div></div>
            <div className="progress-track subject-track"><div style={{width:`${pct(activeSubject)}%`,background:activeSubject.color}}/></div>
            <div className="chapter-toolbar"><div><h3>Chapters</h3><p>Manage your learning progress</p></div><button className="button primary" onClick={()=>addChapter(activeSubject.id)}><Plus size={16}/> Add chapter</button></div>
            <div className="filter-row"><div className="searchbox compact"><Search size={15}/><input placeholder="Find a chapter..." value={chapterQuery} onChange={e=>setChapterQuery(e.target.value)}/></div><select className="select" value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Not Started</option><option>In Progress</option><option>Completed</option></select></div>
            <div className="chapter-list">{activeSubject.chapters.filter(c=>c.name.toLowerCase().includes(chapterQuery.toLowerCase())&&(filter==='All'||c.status===filter)).map(c=><ChapterItem key={c.id} chapter={c} subjectId={activeSubject.id} onStatus={changeStatus} onEdit={editChapter} onDelete={deleteChapter}/>)}{activeSubject.chapters.filter(c=>c.name.toLowerCase().includes(chapterQuery.toLowerCase())&&(filter==='All'||c.status===filter)).length===0&&<div className="empty-inline">No chapters match this filter. Add a chapter or change your search.</div>}</div>
          </section>}
          {!data.subjects.length&&<Empty icon={BookOpen} title="Your study library is empty" text="Add subjects, then break each one into manageable chapters." action="Create your first subject" onAction={addSubject}/>}
        </>}
        {page==='Study Sessions'&&<><div className="page-heading"><div><div className="eyebrow">FOCUS MODE</div><h1>Study sessions</h1><p className="subheading">Track your effort, one focused session at a time.</p></div></div>
          <div className="timer-layout"><section className="panel timer-panel"><div className="timer-label"><Timer size={17}/> FOCUS TIMER</div><div className="timer-display">{String(Math.floor(timer.seconds/3600)).padStart(2,'0')}:{String(Math.floor(timer.seconds/60)%60).padStart(2,'0')}:{String(timer.seconds%60).padStart(2,'0')}</div><p className="muted">Stay focused. You've got this.</p><div className="timer-selects"><select value={timer.subjectId} onChange={e=>setTimer(v=>({...v,subjectId:e.target.value,chapter:''}))}><option value="">Choose subject</option>{data.subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><select value={timer.chapter} onChange={e=>setTimer(v=>({...v,chapter:e.target.value}))}><option value="">Choose chapter (optional)</option>{data.subjects.find(s=>s.id===timer.subjectId)?.chapters.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}</select></div><div className="timer-buttons"><button className="button primary" onClick={()=>setTimer(v=>({...v,running:!v.running}))}>{timer.running?<><Pause size={17}/> Pause</>:<><Play size={17}/> {timer.seconds?'Resume':'Start session'}</>}</button><button className="button secondary" onClick={logSession}><Square size={15}/> Finish & save</button></div></section>
            <section className="panel session-summary"><h2>Study summary</h2><p className="muted">Your recorded learning time</p><div className="summary-big">{fmt(totalMinutes)}</div><div className="summary-line"><span>Sessions logged</span><b>{data.sessions.length}</b></div><div className="summary-line"><span>Today's study time</span><b>{fmt(data.sessions.filter(s=>s.date===today).reduce((a,s)=>a+s.minutes,0))}</b></div></section></div>
          <section className="panel history-panel"><div className="section-head"><div><h2>Session history</h2><p>Your recent focus sessions</p></div></div>{data.sessions.length?data.sessions.map(s=><div className="history-row" key={s.id}><div className="history-icon"><Clock3 size={17}/></div><div className="history-info"><b>{s.subject}</b><small>{s.chapter||'General study'} · {s.date}</small></div><strong>{fmt(s.minutes)}</strong></div>):<Empty icon={Clock3} title="No sessions yet" text="Start a timer and log your first study session."/>}</section>
        </>}
        {page==='Revision Planner'&&<><div className="page-heading"><div><div className="eyebrow">KEEP IT FRESH</div><h1>Revision planner</h1><p className="subheading">Bring important chapters back into focus.</p></div></div>
          <div className="stats-grid three"><Stat icon={RotateCcw} label="To revise" value={chapters.filter(c=>c.status==='Completed'&&!c.target).length} foot="Completed chapters without a date" tint="purple"/><Stat icon={CalendarDays} label="Scheduled" value={chapters.filter(c=>c.target).length} foot="Chapters with target dates" tint="blue"/><Stat icon={CheckCircle2} label="Completed" value={completed} foot="Chapters finished" tint="green"/></div>
          <section className="panel history-panel"><div className="section-head"><div><h2>Revision & target dates</h2><p>Add a target date to any chapter from My Subjects.</p></div></div><ChapterRows items={chapters.filter(c=>c.target||c.status!=='Completed')} onStatus={changeStatus} onEdit={c=>editChapter(c.subjectId,data.subjects.find(s=>s.id===c.subjectId).chapters.find(x=>x.id===c.id))}/>{chapters.length===0&&<Empty icon={CalendarDays} title="Nothing to revise yet" text="Add subjects and chapters to build your revision planner."/>}</section>
        </>}
        {page==='Settings'&&<><div className="page-heading"><div><div className="eyebrow">YOUR PREFERENCES</div><h1>Settings</h1><p className="subheading">Make Studyspace work the way you do.</p></div></div><section className="panel settings-panel"><div className="setting-row"><div><b>Appearance</b><p>Choose a comfortable theme for studying.</p></div><button className="button secondary" onClick={()=>setDark(!dark)}>{dark?<Sun size={16}/>:<Moon size={16}/>} {dark?'Light mode':'Dark mode'}</button></div><div className="setting-row"><div><b>Daily study goal</b><p>Set your target number of study minutes per day.</p></div><button className="button secondary" onClick={()=>setModal({kind:'goal',title:'Set daily goal',value:{goal:data.goal}})}>{data.goal} min <Pencil size={14}/></button></div><div className="setting-row"><div><b>Export your data</b><p>Download a JSON backup of subjects, chapters and sessions.</p></div><button className="button secondary" onClick={exportData}><Download size={16}/> Export backup</button></div><div className="setting-row"><div><b>Reset workspace</b><p>Remove all subjects, chapters and session history.</p></div><button className="button secondary danger-button" onClick={()=>{if(confirm('This will permanently delete all your study data. Continue?')){setData({...seed,subjects:[],sessions:[]});setSelected('');notify('Workspace reset');}}}><Trash2 size={16}/> Reset data</button></div></section><div className="storage-note"><AlertCircle size={16}/> Your data is stored locally in this browser on this device. Export a backup regularly. Clearing browser data may erase your tracker.</div></>}
      </div>
      <footer>Made for focused days and steady progress <span>✦</span></footer>
    </main>
    {toast&&<div className="toast"><Check size={16}/>{toast}</div>}
    {modal&&<Modal title={modal.title} onClose={()=>setModal(null)}>
      {modal.kind==='subject'&&<form className="form" onSubmit={e=>{e.preventDefault();saveSubject({name:e.target.name.value,color:e.target.color.value},modal.id)}}><label>Subject name<input name="name" required maxLength="70" autoFocus defaultValue={modal.value.name} placeholder="e.g. Signals and Systems"/></label><label>Colour<select name="color" defaultValue={modal.value.color}><option value="#7667e8">Violet</option><option value="#269c91">Teal</option><option value="#df9851">Amber</option><option value="#4586c8">Blue</option><option value="#d36e91">Rose</option><option value="#729b5c">Green</option></select></label><div className="modal-actions"><button type="button" className="button secondary" onClick={()=>setModal(null)}>Cancel</button><button className="button primary">Save subject</button></div></form>}
      {modal.kind==='chapter'&&<form className="form" onSubmit={e=>{e.preventDefault();const f=e.target;saveChapter({name:f.name.value,status:f.status.value,priority:f.priority.value,target:f.target.value,notes:f.notes.value},modal.subjectId,modal.id)}}><label>Chapter name<input name="name" required autoFocus maxLength="100" defaultValue={modal.value.name} placeholder="e.g. Fourier Transform"/></label><div className="form-two"><label>Status<select name="status" defaultValue={modal.value.status}><option>Not Started</option><option>In Progress</option><option>Completed</option></select></label><label>Priority<select name="priority" defaultValue={modal.value.priority}><option>Low</option><option>Medium</option><option>High</option></select></label></div><label>Target date <span className="muted">(optional)</span><input name="target" type="date" defaultValue={modal.value.target}/></label><label>Notes <span className="muted">(optional)</span><textarea name="notes" rows="3" defaultValue={modal.value.notes} placeholder="Add formulas, concepts or reminders..."/></label><div className="modal-actions"><button type="button" className="button secondary" onClick={()=>setModal(null)}>Cancel</button><button className="button primary">Save chapter</button></div></form>}
      {modal.kind==='goal'&&<form className="form" onSubmit={e=>{e.preventDefault();const n=Math.max(1,Number(e.target.goal.value));setData(d=>({...d,goal:n}));setModal(null);notify('Daily goal updated')}}><label>Daily goal in minutes<input name="goal" type="number" min="1" max="1440" required defaultValue={modal.value.goal}/></label><div className="modal-actions"><button type="button" className="button secondary" onClick={()=>setModal(null)}>Cancel</button><button className="button primary">Save goal</button></div></form>}
    </Modal>}
  </div>;
}

function Stat({icon:Icon,label,value,foot,tint}){return <div className="panel stat-card"><div className={`stat-icon ${tint}`}><Icon size={18}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>}
function SubjectCard({subject,onClick,selected}){const done=subject.chapters.filter(c=>c.status==='Completed').length;return <button className={`subject-card ${selected?'selected':''}`} onClick={onClick}><div className="subject-card-top"><div className="subject-symbol" style={{background:subject.color+'18',color:subject.color}}><BookOpen size={19}/></div><span className="card-arrow"><ArrowUpRight size={17}/></span></div><h3>{subject.name}</h3><p>{subject.chapters.length} chapters <span>·</span> {done} completed</p><div className="card-progress-label"><span>Progress</span><b>{pct(subject)}%</b></div><div className="progress-track"><div style={{width:`${pct(subject)}%`,background:subject.color}}/></div></button>}
function ChapterItem({chapter:c,subjectId,onStatus,onEdit,onDelete}){return <div className="chapter-item"><div className={`chapter-check ${c.status==='Completed'?'checked':''}`}>{c.status==='Completed'?<Check size={14}/>:c.status==='In Progress'?<span/>:<Circle size={14}/>}</div><div className="chapter-text"><b>{c.name}</b><div className="chapter-meta"><span className={`status status-${c.status.replace(' ','-').toLowerCase()}`}>{c.status}</span><span className={`priority priority-${c.priority.toLowerCase()}`}>{c.priority} priority</span>{c.target&&<span className="date-meta"><CalendarDays size={12}/>{c.target}</span>}</div>{c.notes&&<p>{c.notes}</p>}</div><select aria-label="Chapter status" className="status-select" value={c.status} onChange={e=>onStatus(subjectId,c.id,e.target.value)}><option>Not Started</option><option>In Progress</option><option>Completed</option></select><button className="icon-btn tiny" title="Edit chapter" onClick={()=>onEdit(subjectId,c)}><Pencil size={15}/></button><button className="icon-btn tiny danger-icon" title="Delete chapter" onClick={()=>onDelete(subjectId,c.id)}><Trash2 size={15}/></button></div>}
function ChapterRows({items,onStatus,onEdit}){return <div className="chapter-rows">{items.map(c=><div className="compact-chapter" key={c.id}><div className="mini-status">{c.status==='Completed'?<CheckCircle2 size={17}/>:<Circle size={17}/>}</div><div className="compact-info"><b>{c.name}</b><small>{c.subjectName}{c.target?` · Due ${c.target}`:''}</small></div><span className={`status status-${c.status.replace(' ','-').toLowerCase()}`}>{c.status}</span><button className="icon-btn tiny" onClick={()=>onEdit(c)}><Pencil size={15}/></button></div>)}{!items.length&&<div className="empty-inline">You're all caught up. Add a chapter to keep going.</div>}</div>}
function Empty({icon:Icon,title,text,action,onAction}){return <div className="empty-state"><div className="empty-icon"><Icon size={22}/></div><b>{title}</b><p>{text}</p>{action&&<button className="button primary" onClick={onAction}><Plus size={16}/>{action}</button>}</div>}

// ═══════════════════════════════════════════════
// ASIA SOURCE iCOLLEGE — Portal Script v2
// Improvements:
//   • localStorage persistence for all accounts & grades
//   • Gradebook saves per-quarter (Q1/Q2/Q3/Q4) — not auto-all
//   • Class Record is per-subject (teacher picks one subject)
// ═══════════════════════════════════════════════

// ══════════════════════════════════════════════
// LOCALSTORAGE DATABASE ENGINE
// ══════════════════════════════════════════════
// Version key — bump this if the DB structure changes.
// Any old localStorage with a different version is discarded safely.
var LS_KEY    = "asiasource_db_v3";
var LS_GRADES = "asiasource_grades_v3";

function loadDB(){
  try{
    var r=localStorage.getItem(LS_KEY);
    if(r){
      var parsed=JSON.parse(r);
      // Basic sanity check — must have students and teachers arrays
      if(parsed&&Array.isArray(parsed.students)&&Array.isArray(parsed.teachers))
        return parsed;
    }
  }catch(e){ console.warn("loadDB error:",e); }
  return null;
}
function saveDB(){
  try{ localStorage.setItem(LS_KEY,JSON.stringify(DB)); }catch(e){ console.warn("saveDB error:",e); }
}
function saveGrades(){
  try{
    localStorage.setItem(LS_GRADES,JSON.stringify({
      scoreStore:scoreStore, crStore:crStore, attStore:attStore
    }));
  }catch(e){}
}
function loadGrades(){
  try{
    var r=localStorage.getItem(LS_GRADES);
    if(r){ var d=JSON.parse(r);
      scoreStore=d.scoreStore||{}; crStore=d.crStore||{}; attStore=d.attStore||{}; }
  }catch(e){}
}

// ── DEFAULT DB (seed) ─────────────────────────────
var DEFAULT_DB={
  students:[
    {
      id:"STU-001", emailUser:"juan.delacruz", pass:"2008-03-15",
      name:"Juan dela Cruz", email:"juan.delacruz",
      strand:"G11-STEM-A", bday:"2008-03-15", gender:"male",
      grades:{
        "Filipino":           {q1:85,q2:86,q3:88,q4:87},
        "English":            {q1:90,q2:92,q3:91,q4:93},
        "Mathematics":        {q1:82,q2:84,q3:86,q4:85},
        "Science":            {q1:88,q2:87,q3:89,q4:90},
        "Araling Panlipunan": {q1:83,q2:85,q3:84,q4:86},
        "EsP":                {q1:91,q2:90,q3:92,q4:93},
        "MAPEH":              {q1:87,q2:88,q3:89,q4:90},
        "TLE / TVE":          {q1:89,q2:90,q3:91,q4:92}
      },
      scores:{ww:25,pt:24,qe:36,act:18}
    }
  ],
  teachers:[
    {id:"TCH-001",emailUser:"ana.santos",pass:"1985-06-12",
     name:"Ms. Ana Santos",email:"ana.santos",bday:"1985-06-12"}
  ],
  classRoster:{
    "HUMSS-A":{male:["Jose Santos","Pedro Cruz","Carlos Dela Rosa","Rico Villanueva","Mark Ramos"],female:["Maria Reyes","Ana Gomez","Liza Bautista","Jenny Manalo","Donna Ilagan"]},
    "HUMSS-B":{male:["Luis Torres","Mark Castillo","Dante Ramos","Ivan Morales","Ryan Abad"],female:["Sofia Mendoza","Grace Aquino","Rowena Pascual","Pia Salazar","Carla Basco"]},
    "STEM-A": {male:["Juan dela Cruz","Mikael Lim","Jayson Tan","Paolo Sy","Ben Cruz"],female:["Carla Navarro","Tricia Ong","Rina Chua","Angela Go","Kris Santos"]},
    "STEM-B": {male:["Ryan Soriano","JM Santos","Paul Cruz","Ken Dela Rosa","Leo Torres"],female:["Beth Reyes","Len Gomez","Mia Bautista","Ara Manalo","Nina Aquino"]},
    "HE-HO-A":{male:["Jojo Mendoza","Dodong Aquino","Totoy Salazar","Bong Cruz","Kuya Santos"],female:["Leni Villanueva","Tess Torres","Marites Castillo","Baby Pascual","Nene Ramos"]},
    "HE-HO-B":{male:["Danny Navarro","Ronnie Ong","Edwin Chua","Boy Go","Jun Dela Rosa"],female:["Susan Morales","Cathy Lim","Vicky Tan","Luz Sy","Nora Cruz"]},
    "ICT-A":  {male:["Alex Soriano","Sam Santos","Max Cruz","Jay Manalo","Lex Torres"],female:["Kim Reyes","Ash Gomez","Sky Bautista","Dee Dela Rosa","Pat Aquino"]},
    "ICT-B":  {male:["Chris Villanueva","Taylor Torres","Jordan Castillo","Drew Ramos","Blake Cruz"],female:["Pat Mendoza","Morgan Aquino","Casey Pascual","Avery Salazar","Riley Santos"]},
    "ABM-A":  {male:["Renz Navarro","Franz Ong","Lance Chua","Ace Go","Rey Dela Rosa"],female:["Jasmine Morales","Bea Lim","Jia Tan","Vida Sy","Gem Cruz"]},
    "ABM-B":  {male:["Mark Reyes","Noel Gomez","Ben Bautista","Leo Aquino","Rj Torres"],female:["Rose Soriano","Joy Santos","Leah Cruz","Faith Dela Rosa","Hope Manalo"]}
  },
  subjects:[
    {name:"Filipino",           icon:"FIL",  teacher:"Ms. Aquino"},
    {name:"English",            icon:"ENG",  teacher:"Mr. Torres"},
    {name:"Mathematics",        icon:"MATH", teacher:"Ms. Reyes"},
    {name:"Science",            icon:"SCI",  teacher:"Mr. Castillo"},
    {name:"Araling Panlipunan", icon:"AP",   teacher:"Ms. Garcia"},
    {name:"EsP",                icon:"EsP",  teacher:"Mr. Santos"},
    {name:"MAPEH",              icon:"MPH",  teacher:"Ms. Flores"},
    {name:"TLE / TVE",          icon:"TLE",  teacher:"Mr. Reyes"}
  ],
  crSubjects:["Filipino","English","Mathematics","Science","Araling Panlipunan","EsP","MAPEH","TLE / TVE"],
  crColors:["#b45309","#1e40af","#166534","#0f766e","#6b21a8","#92400e","#9d174d","#374151"],
  strandLabels:{HUMSS:"HUMSS",STEM:"STEM","HE-HO":"H.E-H.O",ICT:"ICT-CP",ABM:"ABM"},
  strandFull:{
    "G11-STEM-A":"Grade 11 - STEM / Section A","G11-STEM-B":"Grade 11 - STEM / Section B",
    "G11-HUMSS-A":"Grade 11 - HUMSS / Section A","G11-HUMSS-B":"Grade 11 - HUMSS / Section B",
    "G11-HEHO-A":"Grade 11 - H.E-H.O / Section A","G11-HEHO-B":"Grade 11 - H.E-H.O / Section B",
    "G11-ICT-A":"Grade 11 - ICT-CP / Section A","G11-ICT-B":"Grade 11 - ICT-CP / Section B",
    "G11-ABM-A":"Grade 11 - ABM / Section A","G11-ABM-B":"Grade 11 - ABM / Section B",
    "G12-STEM-A":"Grade 12 - STEM / Section A","G12-STEM-B":"Grade 12 - STEM / Section B",
    "G12-HUMSS-A":"Grade 12 - HUMSS / Section A","G12-HUMSS-B":"Grade 12 - HUMSS / Section B",
    "G12-HEHO-A":"Grade 12 - H.E-H.O / Section A","G12-HEHO-B":"Grade 12 - H.E-H.O / Section B",
    "G12-ICT-A":"Grade 12 - ICT-CP / Section A","G12-ICT-B":"Grade 12 - ICT-CP / Section B",
    "G12-ABM-A":"Grade 12 - ABM / Section A","G12-ABM-B":"Grade 12 - ABM / Section B"
  },
  months:[
    {name:"JANUARY",days:31},{name:"FEBRUARY",days:28},{name:"MARCH",days:31},
    {name:"APRIL",days:30},{name:"MAY",days:31},{name:"JUNE",days:30},
    {name:"JULY",days:31},{name:"AUGUST",days:31},{name:"SEPTEMBER",days:30},
    {name:"OCTOBER",days:31},{name:"NOVEMBER",days:30},{name:"DECEMBER",days:31}
  ],
  monthColors:["#7a0006","#b45309","#166534","#1e40af","#6b21a8","#0f766e","#92400e","#9d174d","#1e3a5f","#374151","#065f46","#4c1d95"]
};

// ── INIT DB ───────────────────────────────────────
// APPROACH: Always start from DEFAULT_DB for config/roster (fresh).
// Then RESTORE saved students[] and teachers[] on top.
// This way new sign-ups are never lost and config stays current.
var _savedDB = loadDB();
var DB = JSON.parse(JSON.stringify(DEFAULT_DB)); // fresh config base

if(_savedDB && Array.isArray(_savedDB.students) && Array.isArray(_savedDB.teachers)){
  // Restore user accounts from saved DB
  DB.students = _savedDB.students;
  DB.teachers = _savedDB.teachers;
}

// Always ensure the demo seed accounts exist (users can't accidentally delete them)
var _hasSeedStu = false;
for(var _i=0;_i<DB.students.length;_i++) if(DB.students[_i].id==="STU-001"){_hasSeedStu=true;break;}
if(!_hasSeedStu) DB.students.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.students[0])));

var _hasSeedTch = false;
for(var _j=0;_j<DB.teachers.length;_j++) if(DB.teachers[_j].id==="TCH-001"){_hasSeedTch=true;break;}
if(!_hasSeedTch) DB.teachers.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.teachers[0])));

// Persist the merged result immediately
saveDB();

// ── RUNTIME STORES ────────────────────────────────
var scoreStore={}, crStore={}, attStore={};
loadGrades();

// ── STATE ─────────────────────────────────────────
var currentUser=null, currentRole="student";
var currentFolder="HUMSS", currentSection="A";
var currentView="gradebook";
var currentQuarter="q1";   // active quarter for gradebook
var currentSubject=null;   // active subject for class record
var suRole="student", isDark=true;

// ── HELPERS ───────────────────────────────────────
function g(id){return document.getElementById(id);}
function showEl(id){var e=g(id);if(e)e.classList.remove("hidden");}
function hideEl(id){var e=g(id);if(e)e.classList.add("hidden");}
function showAlert(id,msg,type){var e=g(id);if(!e)return;e.textContent=msg;e.className="alert "+(type||"error");}
function hideAlert(id){var e=g(id);if(e)e.className="alert hidden";}

// ── DARK MODE ─────────────────────────────────────
function toggleDark(){
  isDark=!isDark;
  document.documentElement.setAttribute("data-theme",isDark?"dark":"light");
  var icon=isDark?"🌙":"☀️";
  var ni=g("dmNavIcon"),ni2=g("dmNavIcon2");
  if(ni)ni.textContent=icon; if(ni2)ni2.textContent=icon;
}

// ── AUTH TABS ─────────────────────────────────────
function switchAuth(tab){
  if(tab==="login"){
    g("tabLogin").className="auth-tab active"; g("tabSignup").className="auth-tab";
    showEl("authLogin"); hideEl("authSignup");
  } else {
    g("tabLogin").className="auth-tab"; g("tabSignup").className="auth-tab active";
    hideEl("authLogin"); showEl("authSignup");
  }
}

// ── LOGIN ROLE ────────────────────────────────────
function setRole(role){
  currentRole=role; var isT=role==="teacher";
  g("btnStudent").className="role-btn"+(isT?"":" active");
  g("btnTeacher").className="role-btn"+(isT?" active":"");
  g("loginBtn").textContent=isT?"Sign In as Teacher":"Sign In as Student";
  g("userId").placeholder=isT?"e.g. ana.santos":"e.g. juan.delacruz";
  hideAlert("alertBox"); g("userId").value=""; g("password").value="";
}
function togglePass(id){var p=g(id);p.type=p.type==="password"?"text":"password";}

// ── SIGN UP ROLE ──────────────────────────────────
function setSuRole(role){
  suRole=role;
  g("suBtnStu").className="role-btn"+(role==="student"?" active":"");
  g("suBtnTch").className="role-btn"+(role==="teacher"?" active":"");
  if(g("suStrandFg"))g("suStrandFg").style.display=role==="student"?"":"none";
  hideAlert("suAlert"); hideAlert("suSuccess");
}

// ── LOGIN ─────────────────────────────────────────
function handleLogin(e){
  e.preventDefault();
  // Always re-read DB from localStorage before login check
  // so accounts created in the same session are always visible
  var fresh = loadDB();
  if(fresh && Array.isArray(fresh.students) && Array.isArray(fresh.teachers)){
    DB.students = fresh.students;
    DB.teachers = fresh.teachers;
  }

  var eu = g("userId").value.trim().toLowerCase();
  var pw = g("password").value.trim(); // trim whitespace from password too
  hideAlert("alertBox");

  if(!eu||!pw){ showAlert("alertBox","Please fill in all fields."); return; }

  if(currentRole==="student"){
    var stu=null;
    for(var i=0;i<DB.students.length;i++){
      if(DB.students[i].emailUser===eu && DB.students[i].pass===pw){
        stu=DB.students[i]; break;
      }
    }
    if(!stu){
      // Check if email exists but password is wrong (helpful message)
      var emailExists=false;
      for(var i2=0;i2<DB.students.length;i2++) if(DB.students[i2].emailUser===eu){emailExists=true;break;}
      if(emailExists) showAlert("alertBox","Wrong password. Use your birthday: YYYY-MM-DD (e.g. 2005-03-15)");
      else            showAlert("alertBox","Email not found. Check spelling or sign up first.");
      return;
    }
    currentUser=stu; hideEl("loginPage"); loadStudentDash(stu); showEl("studentDash");

  } else {
    var tch=null;
    for(var j=0;j<DB.teachers.length;j++){
      if(DB.teachers[j].emailUser===eu && DB.teachers[j].pass===pw){
        tch=DB.teachers[j]; break;
      }
    }
    if(!tch){
      var tchEmailExists=false;
      for(var j2=0;j2<DB.teachers.length;j2++) if(DB.teachers[j2].emailUser===eu){tchEmailExists=true;break;}
      if(tchEmailExists) showAlert("alertBox","Wrong password. Use your birthday: YYYY-MM-DD");
      else               showAlert("alertBox","Teacher email not found. Check spelling or sign up first.");
      return;
    }
    currentUser=tch; hideEl("loginPage"); loadTeacherDash(tch); showEl("teacherDash");
  }
}

function logout(){
  hideEl("studentDash"); hideEl("teacherDash"); showEl("loginPage");
  currentUser=null; g("userId").value=""; g("password").value="";
}

// ── SIGN UP ───────────────────────────────────────
function handleSignUp(e){
  e.preventDefault();
  hideAlert("suAlert"); hideAlert("suSuccess");

  var name = g("suName").value.trim();
  var eu   = g("suEmail").value.trim().toLowerCase();
  var bday = g("suBirthday").value; // date input always gives YYYY-MM-DD

  // Validate all fields
  if(!name){ showAlert("suAlert","Please enter your full name."); return; }
  if(!eu)  { showAlert("suAlert","Please enter your email username."); return; }
  if(!bday){ showAlert("suAlert","Please pick your birthday using the date picker."); return; }

  // Validate date format strictly YYYY-MM-DD
  if(!/^\d{4}-\d{2}-\d{2}$/.test(bday)){
    showAlert("suAlert","Birthday must be in YYYY-MM-DD format (e.g. 2005-03-15).");
    return;
  }

  // Check duplicate email across both students and teachers
  var allUsers = DB.students.concat(DB.teachers);
  for(var i=0;i<allUsers.length;i++){
    if(allUsers[i].emailUser===eu){
      showAlert("suAlert","Email username already exists. Please choose a different one.");
      return;
    }
  }

  // Build empty grade record using DEFAULT_DB.crSubjects (always available)
  var subjects = DEFAULT_DB.crSubjects;
  var defaultGrades = {};
  for(var s=0;s<subjects.length;s++) defaultGrades[subjects[s]]={q1:"",q2:"",q3:"",q4:""};

  if(suRole==="student"){
    var strand = g("suStrand").value;
    if(!strand){ showAlert("suAlert","Please select your strand and section."); return; }

    var newStu = {
      id:       "STU-"+Date.now(),
      emailUser: eu,
      pass:      bday,        // password = birthday string
      name:      name,
      email:     eu,
      strand:    strand,
      bday:      bday,
      gender:    "",
      grades:    defaultGrades,
      scores:    {ww:"",pt:"",qe:"",act:""}
    };
    DB.students.push(newStu);

  } else {
    var newTch = {
      id:       "TCH-"+Date.now(),
      emailUser: eu,
      pass:      bday,
      name:      name,
      email:     eu,
      bday:      bday
    };
    DB.teachers.push(newTch);
  }

  // Persist to localStorage immediately
  saveDB();

  // Verify save was successful by re-reading
  var verify = loadDB();
  var found = false;
  if(verify){
    var checkList = suRole==="student" ? verify.students : verify.teachers;
    for(var c=0;c<checkList.length;c++){
      if(checkList[c].emailUser===eu){ found=true; break; }
    }
  }

  if(!found){
    showAlert("suAlert","⚠️ Save failed — localStorage may be disabled. Try a different browser.");
    return;
  }

  showAlert("suSuccess",
    "✅ Account created! You can now log in.\n"+
    "Email: "+eu+"@asiasourceicollege.edu.ph\n"+
    "Password (your birthday): "+bday,
    "success"
  );

  document.querySelector("#authSignup form").reset();
  // Auto-switch to login tab after 3 seconds
  setTimeout(function(){ switchAuth("login"); hideAlert("suSuccess"); }, 3000);
}

// ── GRADE HELPERS ─────────────────────────────────
function avgGrade(q1,q2,q3,q4){
  var filled=[q1,q2,q3,q4].filter(function(v){
    return v!==""&&v!==null&&v!==undefined&&!isNaN(Number(v))&&Number(v)>0;
  });
  if(!filled.length)return null;
  return Math.round(filled.reduce(function(a,b){return a+Number(b);},0)/filled.length);
}
function computeGrade(ww,pt,qe){
  if(ww===""||pt===""||qe===""||isNaN(ww)||isNaN(pt)||isNaN(qe))return null;
  var raw=(parseFloat(ww)/30)*30+(parseFloat(pt)/30)*30+(parseFloat(qe)/40)*40;
  return Math.round(Math.min(100,Math.max(60,60+(raw/100)*40)));
}
function getRemarks(gr){
  if(!gr||gr==="")return "-"; gr=Number(gr);
  if(gr>=90)return "Outstanding"; if(gr>=85)return "Very Satisfactory";
  if(gr>=80)return "Satisfactory"; if(gr>=75)return "Fairly Satisfactory";
  return "Did Not Meet Expectations";
}
function badgeClass(gr){
  if(!gr)return ""; gr=Number(gr);
  if(gr>=90)return "badge-outstanding"; if(gr>=85)return "badge-vs";
  if(gr>=80)return "badge-sat"; if(gr>=75)return "badge-fs"; return "badge-fail";
}
function gradeColor(gr){
  if(!gr)return "var(--muted)"; gr=Number(gr);
  if(gr>=90)return "#5dde92"; if(gr>=85)return "#7bc8f5";
  if(gr>=80)return "var(--gold)"; if(gr>=75)return "#f0a050"; return "#ff9090";
}
function darken(hex,amt){
  var n=parseInt(hex.replace("#",""),16);
  var r=Math.max(0,(n>>16)+amt),gg=Math.max(0,((n>>8)&0xFF)+amt),b=Math.max(0,(n&0xFF)+amt);
  return "#"+(((1<<24)|(r<<16)|(gg<<8)|b).toString(16).slice(1));
}
function getSubjColor(subj){
  var idx=DB.crSubjects.indexOf(subj); return idx>=0?DB.crColors[idx]:"#374151";
}

// ══════════════════════════════════════════════════
// STUDENT DASHBOARD
// ══════════════════════════════════════════════════
function loadStudentDash(stu){
  // Refresh from DB so teacher-saved grades show up
  for(var i=0;i<DB.students.length;i++){
    if(DB.students[i].id===stu.id){currentUser=DB.students[i];stu=currentUser;break;}
  }
  g("stuName").textContent=stu.name;
  g("stuProfileName").textContent=stu.name;
  g("stuProfileEmail").textContent=stu.email+"@asiasourceicollege.edu.ph";
  g("stuProfileBday").textContent=stu.bday||"-";
  g("stuProfileLRN").textContent=stu.emailUser;
  g("stuProfileStrand").textContent=DB.strandFull[stu.strand]||stu.strand;

  var list=g("subjectList"); list.innerHTML="";
  for(var i=0;i<DB.subjects.length;i++){
    var sub=DB.subjects[i],gr=stu.grades[sub.name]||{};
    var fg=avgGrade(gr.q1,gr.q2,gr.q3,gr.q4),passed=fg&&fg>=75;
    list.innerHTML+=
      '<div class="subject-card" onclick="openSubjectDetail(\''+sub.name+'\')">'+
      '<div class="subject-left"><div class="subject-icon">'+sub.icon+'</div>'+
      '<div><div class="sub-name">'+sub.name+'</div><div class="sub-teacher">'+sub.teacher+'</div></div></div>'+
      '<div class="subject-grade"><div class="grade-num">'+(fg||"-")+'</div>'+
      '<div class="grade-label">Final</div>'+
      '<div class="grade-pill '+(passed?"pill-pass":"pill-fail")+'">'+getRemarks(fg)+'</div></div></div>';
  }
  var tbody=g("gradeCardBody"); tbody.innerHTML="";
  for(var k=0;k<DB.subjects.length;k++){
    var s=DB.subjects[k],gr2=stu.grades[s.name]||{};
    var fg2=avgGrade(gr2.q1,gr2.q2,gr2.q3,gr2.q4),pass2=fg2&&fg2>=75;
    tbody.innerHTML+="<tr><td>"+s.name+"</td>"+
      "<td>"+(gr2.q1||"-")+"</td><td>"+(gr2.q2||"-")+"</td>"+
      "<td>"+(gr2.q3||"-")+"</td><td>"+(gr2.q4||"-")+"</td>"+
      '<td class="final-col">'+(fg2||"-")+"</td>"+
      '<td><span class="grade-pill '+(pass2?"pill-pass":"pill-fail")+'">'+getRemarks(fg2)+"</span></td></tr>";
  }
}

function openSubjectDetail(subName){
  var sub=null;
  for(var i=0;i<DB.subjects.length;i++) if(DB.subjects[i].name===subName){sub=DB.subjects[i];break;}
  var gr=currentUser.grades[subName]||{};
  var q1=gr.q1||0,q2=gr.q2||0,q3=gr.q3||0,q4=gr.q4||0;
  var fg=avgGrade(q1,q2,q3,q4);
  g("subjectModalTitle").textContent=subName;
  g("subjectModalSub").textContent="Teacher: "+(sub?sub.teacher:"");
  g("subjectModalContent").innerHTML=
    '<table class="comp-table"><thead><tr><th>Quarter</th><th>Grade</th></tr></thead><tbody>'+
    "<tr><td>Q1</td><td>"+(q1||"-")+"</td></tr><tr><td>Q2</td><td>"+(q2||"-")+"</td></tr>"+
    "<tr><td>Q3</td><td>"+(q3||"-")+"</td></tr><tr><td>Q4</td><td>"+(q4||"-")+"</td></tr>"+
    "</tbody></table>"+
    '<div class="comp-step">Final Grade = Average of filled quarters = <strong>'+(fg||"-")+"</strong></div>"+
    '<div class="final-result"><div class="fr-num">'+(fg||"-")+'</div><div class="fr-label">'+getRemarks(fg)+"</div></div>";
  g("subjectModal").classList.remove("hidden");
  document.body.style.overflow="hidden";
}
function closeSubjectModal(){g("subjectModal").classList.add("hidden");document.body.style.overflow="";}

// ══════════════════════════════════════════════════
// TEACHER DASHBOARD
// ══════════════════════════════════════════════════
function loadTeacherDash(tch){
  g("tchName").textContent=tch.name;
  g("tchProfileName").textContent=tch.name;
  g("tchProfileEmail").textContent=tch.email+"@asiasourceicollege.edu.ph";
  currentSubject=DB.crSubjects[0];
  openFolderByStrand("HUMSS");
}
function openFolder(el){
  var strand=el.getAttribute("data-strand");
  var items=document.querySelectorAll(".strand-item");
  for(var i=0;i<items.length;i++) items[i].className="strand-item";
  el.className="strand-item active";
  openFolderByStrand(strand);
}
function openFolderByStrand(strand){
  currentFolder=strand; currentSection="A"; currentView="gradebook"; currentQuarter="q1";
  g("folderTitle").textContent=(DB.strandLabels[strand]||strand)+" — Student List";
  var stabs=document.querySelectorAll(".stab");
  stabs[0].className="stab active"; stabs[1].className="stab";
  var vtabs=document.querySelectorAll(".vtab");
  for(var i=0;i<vtabs.length;i++) vtabs[i].className="vtab";
  g("vtabGradebook").className="vtab active";
  showView("gradebook"); renderGradebook(strand,"A");
}
function switchSection(sec,btn){
  currentSection=sec;
  var tabs=document.querySelectorAll(".stab");
  for(var i=0;i<tabs.length;i++) tabs[i].className="stab";
  btn.className="stab active";
  if(currentView==="gradebook")       renderGradebook(currentFolder,sec);
  else if(currentView==="classrecord") renderClassRecord(currentFolder,sec);
  else                                 renderAttendance(currentFolder,sec);
}
function setView(view,btn){
  currentView=view;
  var vtabs=document.querySelectorAll(".vtab");
  for(var i=0;i<vtabs.length;i++) vtabs[i].className="vtab";
  btn.className="vtab active";
  showView(view);
  if(view==="gradebook")        renderGradebook(currentFolder,currentSection);
  else if(view==="classrecord") renderClassRecord(currentFolder,currentSection);
  else                          renderAttendance(currentFolder,currentSection);
}
function showView(view){
  hideEl("viewGradebook"); hideEl("viewClassRecord"); hideEl("viewAttendance");
  if(view==="gradebook")        showEl("viewGradebook");
  else if(view==="classrecord") showEl("viewClassRecord");
  else                          showEl("viewAttendance");
}

// ══════════════════════════════════════════════════
// GRADEBOOK — Per Quarter
// Teacher selects Q1/Q2/Q3/Q4 → enters WW/PT/QE/Activity
// "Save Q# Grades" button commits computed grade to student DB
// ══════════════════════════════════════════════════
function setGbQuarter(q,btn){
  currentQuarter=q;
  var btns=document.querySelectorAll(".qtr-btn");
  for(var i=0;i<btns.length;i++) btns[i].className="qtr-btn";
  btn.className="qtr-btn active";
  renderGradebook(currentFolder,currentSection);
}

function renderGradebook(strand,section){
  var key=strand+"-"+section;
  var r=DB.classRoster[key]||{male:[],female:[]};
  var tbody=g("gbBody"); tbody.innerHTML="";

  // Toolbar
  var toolbar=g("gbToolbar");
  if(toolbar){
    toolbar.innerHTML=
      '<div class="gb-toolbar-inner">'+
      '<span class="toolbar-lbl">Quarter:</span>'+
      '<div class="qtr-tabs">'+
        ['q1','q2','q3','q4'].map(function(q){
          return '<button class="qtr-btn'+(currentQuarter===q?" active":"")+
                 '" onclick="setGbQuarter(\''+q+'\',this)">'+q.toUpperCase()+'</button>';
        }).join('')+
      '</div>'+
      '<button class="save-qtr-btn" onclick="saveQuarterGrades(\''+key+'\')">'+
        '💾 Save '+currentQuarter.toUpperCase()+' Grades'+
      '</button>'+
      '</div>';
  }

  function makeRows(names,genderLabel){
    tbody.innerHTML+='<tr><td colspan="8" class="cr-gender-row">'+
      (genderLabel==="male"?"👨 MALE":"👩 FEMALE")+"</td></tr>";
    for(var i=0;i<names.length;i++){
      var sk=key+"-"+genderLabel+"-"+i;
      if(!scoreStore[sk]) scoreStore[sk]={ww:{},pt:{},qe:{},act:{}};
      // Ensure sub-objects exist
      ['ww','pt','qe','act'].forEach(function(c){if(!scoreStore[sk][c])scoreStore[sk][c]={};});
      var ww=scoreStore[sk].ww[currentQuarter]||"";
      var pt=scoreStore[sk].pt[currentQuarter]||"";
      var qe=scoreStore[sk].qe[currentQuarter]||"";
      var act=scoreStore[sk].act[currentQuarter]||"";
      var fg=computeGrade(ww,pt,qe);
      var bc=fg?badgeClass(fg):"";
      var ck=genderLabel+"-"+i;
      // Check saved quarter grade in crStore
      var savedGrade=(crStore[key]&&crStore[key][ck])?crStore[key][ck]["__grade_"+currentQuarter]:null;
      var isSaved=savedGrade!==null&&savedGrade!=="";
      tbody.innerHTML+=
        '<tr class="'+(isSaved?"gb-saved-row":"")+'">' +
        "<td>"+(i+1)+"</td>"+
        '<td>'+names[i]+(isSaved?'<span class="sync-dot" title="Saved: '+savedGrade+'">✓ '+savedGrade+'</span>':"")+"</td>"+
        '<td><input class="score-input" type="number" min="0" max="30" value="'+ww+'" placeholder="—"'+
          ' data-sk="'+sk+'" data-comp="ww" data-qtr="'+currentQuarter+'" oninput="handleScoreInput(this)"></td>'+
        '<td><input class="score-input" type="number" min="0" max="30" value="'+pt+'" placeholder="—"'+
          ' data-sk="'+sk+'" data-comp="pt" data-qtr="'+currentQuarter+'" oninput="handleScoreInput(this)"></td>'+
        '<td><input class="score-input" type="number" min="0" max="40" value="'+qe+'" placeholder="—"'+
          ' data-sk="'+sk+'" data-comp="qe" data-qtr="'+currentQuarter+'" oninput="handleScoreInput(this)"></td>'+
        '<td><input class="score-input" type="number" min="0" max="20" value="'+act+'" placeholder="—"'+
          ' data-sk="'+sk+'" data-comp="act" data-qtr="'+currentQuarter+'" oninput="handleScoreInput(this)"></td>'+
        '<td id="fg-'+sk+'">'+(fg?'<span class="final-badge '+bc+'">'+fg+"</span>":"—")+"</td>"+
        '<td id="rem-'+sk+'" style="font-size:11.5px;font-weight:600;color:'+gradeColor(fg)+'">'+getRemarks(fg)+"</td>"+
        "</tr>";
    }
  }
  makeRows(r.male,"male");
  makeRows(r.female,"female");
}

function handleScoreInput(input){
  var sk=input.getAttribute("data-sk");
  var comp=input.getAttribute("data-comp");
  var qtr=input.getAttribute("data-qtr");
  if(!scoreStore[sk]) scoreStore[sk]={ww:{},pt:{},qe:{},act:{}};
  if(!scoreStore[sk][comp]) scoreStore[sk][comp]={};
  scoreStore[sk][comp][qtr]=input.value;
  var ww=scoreStore[sk].ww[qtr]||"";
  var pt=scoreStore[sk].pt[qtr]||"";
  var qe=scoreStore[sk].qe[qtr]||"";
  var fg=computeGrade(ww,pt,qe);
  var fgEl=g("fg-"+sk),remEl=g("rem-"+sk);
  if(fgEl) fgEl.innerHTML=fg?'<span class="final-badge '+badgeClass(fg)+'">'+fg+"</span>":"—";
  if(remEl){remEl.textContent=getRemarks(fg);remEl.style.color=gradeColor(fg);}
  saveGrades();
}

// Save current quarter grades into student DB and crStore
function saveQuarterGrades(classKey){
  var r=DB.classRoster[classKey]||{male:[],female:[]};
  var saved=0,skipped=0;
  function process(names,genderLabel){
    for(var i=0;i<names.length;i++){
      var sk=classKey+"-"+genderLabel+"-"+i;
      var ck=genderLabel+"-"+i;
      if(!scoreStore[sk]){skipped++;continue;}
      var ww=scoreStore[sk].ww?scoreStore[sk].ww[currentQuarter]||"":"";
      var pt=scoreStore[sk].pt?scoreStore[sk].pt[currentQuarter]||"":"";
      var qe=scoreStore[sk].qe?scoreStore[sk].qe[currentQuarter]||"":"";
      if(ww===""&&pt===""&&qe===""){skipped++;continue;}
      var fg=computeGrade(ww,pt,qe);
      if(!fg){skipped++;continue;}
      // Store in crStore
      if(!crStore[classKey]) crStore[classKey]={};
      if(!crStore[classKey][ck]) crStore[classKey][ck]={};
      crStore[classKey][ck]["__grade_"+currentQuarter]=fg;
      // Update matching student's subject grades in DB
      // Grade book computes an "overall" grade; pre-fill subjects where quarter is empty
      var stuName=names[i];
      for(var j=0;j<DB.students.length;j++){
        if(DB.students[j].name===stuName){
          if(!DB.students[j].grades) DB.students[j].grades={};
          for(var s=0;s<DB.crSubjects.length;s++){
            var subj=DB.crSubjects[s];
            if(!DB.students[j].grades[subj]) DB.students[j].grades[subj]={q1:"",q2:"",q3:"",q4:""};
            if(DB.students[j].grades[subj][currentQuarter]===""||
               DB.students[j].grades[subj][currentQuarter]===null||
               DB.students[j].grades[subj][currentQuarter]===undefined){
              DB.students[j].grades[subj][currentQuarter]=fg;
            }
          }
          break;
        }
      }
      saved++;
    }
  }
  process(r.male,"male"); process(r.female,"female");
  saveDB(); saveGrades();
  showToast(
    saved>0
      ? "💾 "+currentQuarter.toUpperCase()+" grades saved for "+saved+" student(s)!"
      : "⚠️ No complete scores found. Fill WW, PT, and QE first.",
    saved>0?"success":"warning"
  );
  renderGradebook(currentFolder,currentSection);
}

// ══════════════════════════════════════════════════
// CLASS RECORD — Per Subject
// Teacher selects one subject, views/edits Q1–Q4 per student
// Grades are saved directly to student DB on input
// ══════════════════════════════════════════════════
function setCrSubject(subj){
  currentSubject=subj;
  renderClassRecord(currentFolder,currentSection);
}

function renderClassRecord(strand,section){
  var key=strand+"-"+section;
  var r=DB.classRoster[key]||{male:[],female:[]};
  if(!currentSubject) currentSubject=DB.crSubjects[0];
  var subjColor=getSubjColor(currentSubject);
  var subjDark=darken(subjColor,-28);

  // ── Subject picker toolbar ──
  var crToolbar=g("crToolbar");
  if(crToolbar){
    var pillsHtml='';
    for(var si=0;si<DB.crSubjects.length;si++){
      var s=DB.crSubjects[si];
      var col=DB.crColors[si];
      var isActive=currentSubject===s;
      pillsHtml+=
        '<button class="subj-btn'+(isActive?" active":"")+'"'+
        ' data-subj="'+s+'"'+
        ' style="'+(isActive?"background:"+col+";border-color:"+col+";color:#fff;":"border-color:"+col+";color:"+col+";")+'"'+
        ' onclick="setCrSubject(this.getAttribute(\'data-subj\'))">'+s+'</button>';
    }
    crToolbar.innerHTML=
      '<div class="cr-toolbar-inner">'+
      '<span class="toolbar-lbl">Subject:</span>'+
      '<div class="subj-pills">'+pillsHtml+'</div>'+
      '<button class="save-qtr-btn" onclick="saveCrGrades(\''+key+'\')">💾 Save Grades</button>'+
      '</div>';
  }

  // ── Table header ──
  var thead=g("crHead");
  if(thead){
    thead.innerHTML=
      '<tr>'+
      '<th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2)">#</th>'+
      '<th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">STUDENT NAME</th>'+
      '<th class="cr-th cr-subj-hdr" colspan="5" style="background:'+subjColor+'">'+currentSubject+'</th>'+
      '</tr>'+
      '<tr>'+
      '<th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q1</th>'+
      '<th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q2</th>'+
      '<th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q3</th>'+
      '<th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q4</th>'+
      '<th class="cr-th cr-final-hdr" style="background:'+subjDark+'">FINAL</th>'+
      '</tr>';
  }

  var tbody=g("crBody"); tbody.innerHTML="";

  function makeCrRows(names,genderLabel){
    tbody.innerHTML+='<tr><td colspan="7" class="cr-gender-row '+
      (genderLabel==="female"?"cr-female-row":"")+'">' +
      (genderLabel==="male"?"👨 MALE":"👩 FEMALE")+"</td></tr>";
    for(var i=0;i<names.length;i++){
      var alt=(i%2!==0)?"cr-alt":"";
      var ck=genderLabel+"-"+i;
      var stuGrades=getStudentGradesByName(names[i],currentSubject);
      var q1=stuGrades.q1||"",q2=stuGrades.q2||"",q3=stuGrades.q3||"",q4=stuGrades.q4||"";
      var fg=avgGrade(q1,q2,q3,q4);
      var da=' data-key="'+key+'" data-ck="'+ck+'" data-subj="'+currentSubject+'" data-stuname="'+names[i]+'"';
      tbody.innerHTML+=
        '<tr class="cr-row '+alt+'">'+
        '<td class="cr-td cr-sticky cr-num-col cr-num-td">'+(i+1)+"</td>"+
        '<td class="cr-td cr-sticky cr-name-col cr-name-td">'+names[i]+"</td>"+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100"'+
          ' value="'+q1+'" placeholder="—"'+da+' data-q="q1" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100"'+
          ' value="'+q2+'" placeholder="—"'+da+' data-q="q2" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100"'+
          ' value="'+q3+'" placeholder="—"'+da+' data-q="q3" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100"'+
          ' value="'+q4+'" placeholder="—"'+da+' data-q="q4" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-final-td" id="crf-'+key+"-"+ck+'">'+
          (fg?'<span class="cr-final-badge '+badgeClass(fg)+'">'+fg+"</span>":"—")+"</td>"+
        "</tr>";
    }
  }
  makeCrRows(r.male,"male");
  makeCrRows(r.female,"female");
}

function getStudentGradesByName(stuName,subj){
  for(var i=0;i<DB.students.length;i++)
    if(DB.students[i].name===stuName)
      return DB.students[i].grades[subj]||{q1:"",q2:"",q3:"",q4:""};
  return {q1:"",q2:"",q3:"",q4:""};
}

function handleCrInput(input){
  var key=input.getAttribute("data-key");
  var ck=input.getAttribute("data-ck");
  var subj=input.getAttribute("data-subj");
  var qkey=input.getAttribute("data-q");
  var stuName=input.getAttribute("data-stuname");
  var val=input.value;
  // Update crStore
  if(!crStore[key]) crStore[key]={};
  if(!crStore[key][ck]) crStore[key][ck]={};
  if(!crStore[key][ck][subj]) crStore[key][ck][subj]={q1:"",q2:"",q3:"",q4:""};
  crStore[key][ck][subj][qkey]=val;
  // Update student DB directly
  for(var i=0;i<DB.students.length;i++){
    if(DB.students[i].name===stuName){
      if(!DB.students[i].grades[subj]) DB.students[i].grades[subj]={q1:"",q2:"",q3:"",q4:""};
      DB.students[i].grades[subj][qkey]=val;
      break;
    }
  }
  // Refresh final badge
  var sd=crStore[key][ck][subj];
  var fg=avgGrade(sd.q1,sd.q2,sd.q3,sd.q4);
  var fEl=g("crf-"+key+"-"+ck);
  if(fEl) fEl.innerHTML=fg?'<span class="cr-final-badge '+badgeClass(fg)+'">'+fg+"</span>":"—";
}

function saveCrGrades(key){
  saveDB(); saveGrades();
  showToast("💾 ["+currentSubject+"] grades saved to all student records!","success");
}

// ══════════════════════════════════════════════════
// ATTENDANCE VIEW
// ══════════════════════════════════════════════════
function renderAttendance(strand,section){
  var key=strand+"-"+section;
  var r=DB.classRoster[key]||{male:[],female:[]};
  if(!attStore[key]) attStore[key]={};
  var mRow=g("attMonthRow"),dRow=g("attDayRow");
  mRow.innerHTML=
    '<th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2);">#</th>'+
    '<th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">NAMES OF LEARNERS</th>'+
    '<th class="cr-th att-total-hdr" colspan="2" style="background:#7a0006;">YEARLY TOTAL</th>';
  dRow.innerHTML=
    '<th class="cr-th att-total-sub" style="background:#9b1c1c;">ABS</th>'+
    '<th class="cr-th att-total-sub" style="background:#14532d;">PRS</th>';
  for(var mi=0;mi<DB.months.length;mi++){
    var mon=DB.months[mi],mbg=DB.monthColors[mi];
    mRow.innerHTML+='<th class="cr-th cr-subj-hdr" colspan="'+(mon.days+2)+'" style="background:'+mbg+'">'+mon.name+"</th>";
    for(var d=1;d<=mon.days;d++) dRow.innerHTML+='<th class="cr-th att-day-hdr" style="background:'+mbg+'">'+d+"</th>";
    dRow.innerHTML+='<th class="cr-th att-sub-hdr" style="background:#374151;">ABS</th>'+
                    '<th class="cr-th att-sub-hdr" style="background:#14532d;">PRS</th>';
  }
  var tbody=g("attBody"); tbody.innerHTML="";
  var totalCols=2+2+DB.months.reduce(function(a,m){return a+m.days+2;},0);
  function makeAttRows(names,genderLabel){
    tbody.innerHTML+='<tr><td colspan="'+totalCols+'" class="cr-gender-row '+
      (genderLabel==="female"?"cr-female-row":"")+'">' +
      (genderLabel==="male"?"👨 MALE":"👩 FEMALE")+"</td></tr>";
    for(var i=0;i<names.length;i++){
      var ak=genderLabel+"-"+i;
      if(!attStore[key][ak]) attStore[key][ak]={};
      var alt=(i%2!==0)?"cr-alt":"";
      var html='<tr class="cr-row '+alt+'">'+
        '<td class="cr-td cr-sticky cr-num-col cr-num-td">'+(i+1)+"</td>"+
        '<td class="cr-td cr-sticky cr-name-col cr-name-td">'+names[i]+"</td>"+
        '<td class="cr-td att-total-cell" id="att-yabs-'+key+"-"+ak+'">—</td>'+
        '<td class="cr-td att-total-cell" id="att-yprs-'+key+"-"+ak+'">—</td>';
      for(var mi=0;mi<DB.months.length;mi++){
        if(!attStore[key][ak][mi]) attStore[key][ak][mi]={};
        var mon=DB.months[mi];
        for(var d=0;d<mon.days;d++){
          var val=attStore[key][ak][mi][d]||"";
          var cc=val==="A"?"att-a-cell":val==="P"?"att-p-cell":val==="L"?"att-l-cell":"";
          html+='<td class="cr-td att-day-cell">'+
            '<input class="att-input '+cc+'" maxlength="1" value="'+val+'"'+
            ' data-key="'+key+'" data-ak="'+ak+'" data-mi="'+mi+'" data-day="'+d+'"'+
            ' oninput="handleAttInput(this)"></td>';
        }
        html+='<td class="cr-td att-count-cell" id="att-abs-'+key+"-"+ak+"-"+mi+'">—</td>'+
              '<td class="cr-td att-count-cell" id="att-prs-'+key+"-"+ak+"-"+mi+'">—</td>';
      }
      tbody.innerHTML+=html+"</tr>";
    }
  }
  makeAttRows(r.male,"male");
  makeAttRows(r.female,"female");
}
function handleAttInput(input){
  updateAtt(
    input.getAttribute("data-key"),input.getAttribute("data-ak"),
    parseInt(input.getAttribute("data-mi"),10),
    parseInt(input.getAttribute("data-day"),10),input
  );
}
function updateAtt(key,ak,mi,day,input){
  var val=input.value.toUpperCase().replace(/[^PAL]/g,"");
  input.value=val;
  if(!attStore[key]) attStore[key]={};
  if(!attStore[key][ak]) attStore[key][ak]={};
  if(!attStore[key][ak][mi]) attStore[key][ak][mi]={};
  attStore[key][ak][mi][day]=val;
  input.className="att-input"+(val==="A"?" att-a-cell":val==="P"?" att-p-cell":val==="L"?" att-l-cell":"");
  recomputeAtt(key,ak); saveGrades();
}
function recomputeAtt(key,ak){
  var data=(attStore[key]&&attStore[key][ak])?attStore[key][ak]:{};
  var yAbs=0,yPrs=0;
  for(var mi=0;mi<DB.months.length;mi++){
    var md=data[mi]||{},abs=0,prs=0;
    for(var d=0;d<DB.months[mi].days;d++){var v=md[d]||"";if(v==="A")abs++;if(v==="P")prs++;}
    yAbs+=abs;yPrs+=prs;
    var ae=g("att-abs-"+key+"-"+ak+"-"+mi),pe=g("att-prs-"+key+"-"+ak+"-"+mi);
    if(ae){ae.textContent=abs||"—";ae.style.color=abs?"#ff9090":"var(--muted)";}
    if(pe){pe.textContent=prs||"—";pe.style.color=prs?"#5dde92":"var(--muted)";}
  }
  var ya=g("att-yabs-"+key+"-"+ak),yp=g("att-yprs-"+key+"-"+ak);
  if(ya){ya.textContent=yAbs||"—";ya.style.color=yAbs?"#ff9090":"var(--muted)";ya.style.fontWeight="800";}
  if(yp){yp.textContent=yPrs||"—";yp.style.color=yPrs?"#5dde92":"var(--muted)";yp.style.fontWeight="800";}
}

// ══════════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════════
function showToast(msg,type){
  var ex=g("mainToast");if(ex)ex.remove();
  var el=document.createElement("div"); el.id="mainToast";
  var bg=type==="success"?"linear-gradient(135deg,#065f46,#14532d)":
         type==="warning"?"linear-gradient(135deg,#92400e,#78350f)":
         "linear-gradient(135deg,#7a0006,#3d0003)";
  var border=type==="success"?"rgba(46,204,113,.4)":type==="warning"?"rgba(212,160,23,.4)":"rgba(192,0,10,.4)";
  el.innerHTML=msg;
  el.style.cssText="position:fixed;bottom:24px;right:24px;z-index:9999;background:"+bg+
    ";color:#fff;padding:13px 22px;border-radius:12px;font-size:13px;font-weight:600;"+
    "box-shadow:0 8px 24px rgba(0,0,0,.5);border:1px solid "+border+";animation:fadeIn .25s ease;max-width:340px;";
  document.body.appendChild(el);
  setTimeout(function(){if(el.parentNode){el.style.opacity="0";el.style.transition="opacity .4s";}},2800);
  setTimeout(function(){if(el.parentNode)el.remove();},3300);
}

// ── KEYBOARD ─────────────────────────────────────
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeSubjectModal();});

// ── INIT ─────────────────────────────────────────
setRole("student"); setSuRole("student");
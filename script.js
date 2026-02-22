// ═══════════════════════════════════════════════
// ASIA SOURCE iCOLLEGE — Portal Script v5 (All Features)
// ═══════════════════════════════════════════════

var LS_KEY      = "asiasource_db_v4";
var LS_GRADES   = "asiasource_grades_v4";
var LS_NOTIFS   = "asiasource_notifs_v4";
var LS_INVITES  = "asiasource_invites_v4";
var LS_STU_SUBJ = "asiasource_stu_subjects_v4";

function loadDB(){
  try{var r=localStorage.getItem(LS_KEY);if(r){var p=JSON.parse(r);if(p&&Array.isArray(p.students)&&Array.isArray(p.teachers))return p;}}catch(e){}
  return null;
}
function saveDB(){ try{localStorage.setItem(LS_KEY,JSON.stringify(DB));}catch(e){} }
function saveGrades(){
  try{localStorage.setItem(LS_GRADES,JSON.stringify({scoreStore:scoreStore,crStore:crStore,attStore:attStore,rosterGrades:rosterGrades}));}catch(e){}
}
function loadGrades(){
  try{var r=localStorage.getItem(LS_GRADES);if(r){var d=JSON.parse(r);scoreStore=d.scoreStore||{};crStore=d.crStore||{};attStore=d.attStore||{};rosterGrades=d.rosterGrades||{};}}catch(e){}
}
function loadNotifs(){ try{var r=localStorage.getItem(LS_NOTIFS);return r?JSON.parse(r):{};}catch(e){return {};} }
function saveNotifs(n){ try{localStorage.setItem(LS_NOTIFS,JSON.stringify(n));}catch(e){} }
function loadInvites(){ try{var r=localStorage.getItem(LS_INVITES);return r?JSON.parse(r):[];}catch(e){return [];} }
function saveInvites(inv){ try{localStorage.setItem(LS_INVITES,JSON.stringify(inv));}catch(e){} }
function loadStuSubjects(){ try{var r=localStorage.getItem(LS_STU_SUBJ);return r?JSON.parse(r):{};}catch(e){return {};} }
function saveStuSubjects(s){ try{localStorage.setItem(LS_STU_SUBJ,JSON.stringify(s));}catch(e){} }

var DEFAULT_DB={
  students:[
    {
      id:"STU-001",emailUser:"juan.delacruz",pass:"2008-03-15",
      name:"Juan dela Cruz",email:"juan.delacruz",strand:"G11-STEM-A",bday:"2008-03-15",gender:"Male",
      studentId:"24-0561",mobile:"09XX-XXX-XXXX",address:"",city:"",
      grades:{"Filipino":{q1:85,q2:86,q3:88,q4:87},"English":{q1:90,q2:92,q3:91,q4:93},"Mathematics":{q1:82,q2:84,q3:86,q4:85},"Science":{q1:88,q2:87,q3:89,q4:90},"Araling Panlipunan":{q1:83,q2:85,q3:84,q4:86},"EsP":{q1:91,q2:90,q3:92,q4:93},"MAPEH":{q1:87,q2:88,q3:89,q4:90},"TLE / TVE":{q1:89,q2:90,q3:91,q4:92}},
      scores:{ww:25,pt:24,qe:36,act:18},
      approvedSubjects:["Filipino","English","Mathematics","Science","Araling Panlipunan","EsP","MAPEH","TLE / TVE"]
    }
  ],
  teachers:[
    {id:"TCH-001",emailUser:"ana.santos",pass:"1985-06-12",name:"Ms. Ana Santos",email:"ana.santos",bday:"1985-06-12",address:""}
  ],
  classRoster:{
    "HUMSS-A":{male:["Jose Santos","Pedro Cruz","Carlos Dela Rosa","Rico Villanueva","Mark Ramos"],female:["Maria Reyes","Ana Gomez","Liza Bautista","Jenny Manalo","Donna Ilagan"]},
    "HUMSS-B":{male:["Luis Torres","Mark Castillo","Dante Ramos","Ivan Morales","Ryan Abad"],female:["Sofia Mendoza","Grace Aquino","Rowena Pascual","Pia Salazar","Carla Basco"]},
    "STEM-A": {male:["Juan dela Cruz","Mikael Lim","Jayson Tan","Paolo Sy","Ben Cruz"],female:["Carla Navarro","Tricia Ong","Rina Chua","Angela Go","Kris Santos"]},
    "STEM-B": {male:["Ryan Soriano","JM Santos","Paul Cruz","Ken Dela Rosa","Leo Torres"],female:["Beth Reyes","Len Gomez","Mia Bautista","Ara Manalo","Nina Aquino"]},
    "HE-HO-A":{male:["Jojo Mendoza","Dodong Aquino","Totoy Salazar","Bong Cruz","Kuya Santos"],female:["Leni Villanueva","Tess Torres","Marites Castillo","Baby Pascual","Nene Ramos"]},
    "HE-HO-B":{male:["Danny Navarro","Ronnie Ong","Edwin Chua","Boy Go","Jun Dela Rosa"],female:["Susan Morales","Cathy Lim","Vicky Tan","Luz Sy","Nora Cruz"]},
    "ICT-A":  {male:["Alex Soriano","Sam Santos","Max Cruz","Jay Manalo","Lex Torres","Chris Villanueva","Taylor Torres","Jordan Castillo","Drew Ramos","Blake Cruz"],female:["Kim Reyes","Ash Gomez","Sky Bautista","Dee Dela Rosa","Pat Aquino","Pat Mendoza","Morgan Aquino","Casey Pascual","Avery Salazar","Riley Santos"]},
    "ABM-A":  {male:["Renz Navarro","Franz Ong","Lance Chua","Ace Go","Rey Dela Rosa","Mark Reyes","Noel Gomez","Ben Bautista","Leo Aquino","Rj Torres"],female:["Jasmine Morales","Bea Lim","Jia Tan","Vida Sy","Gem Cruz","Rose Soriano","Joy Santos","Leah Cruz","Faith Dela Rosa","Hope Manalo"]}
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
    "G11-ICT-A":"Grade 11 - ICT-CP","G11-ABM-A":"Grade 11 - ABM",
    "G12-STEM-A":"Grade 12 - STEM / Section A","G12-STEM-B":"Grade 12 - STEM / Section B",
    "G12-HUMSS-A":"Grade 12 - HUMSS / Section A","G12-HUMSS-B":"Grade 12 - HUMSS / Section B",
    "G12-HEHO-A":"Grade 12 - H.E-H.O / Section A","G12-HEHO-B":"Grade 12 - H.E-H.O / Section B",
    "G12-ICT-A":"Grade 12 - ICT-CP","G12-ABM-A":"Grade 12 - ABM"
  },
  months:[
    {name:"JANUARY",days:31},{name:"FEBRUARY",days:28},{name:"MARCH",days:31},
    {name:"APRIL",days:30},{name:"MAY",days:31},{name:"JUNE",days:30},
    {name:"JULY",days:31},{name:"AUGUST",days:31},{name:"SEPTEMBER",days:30},
    {name:"OCTOBER",days:31},{name:"NOVEMBER",days:30},{name:"DECEMBER",days:31}
  ],
  monthColors:["#7a0006","#b45309","#166534","#1e40af","#6b21a8","#0f766e","#92400e","#9d174d","#1e3a5f","#374151","#065f46","#4c1d95"]
};

var _savedDB=loadDB();
var DB=JSON.parse(JSON.stringify(DEFAULT_DB));
if(_savedDB&&Array.isArray(_savedDB.students)&&Array.isArray(_savedDB.teachers)){
  DB.students=_savedDB.students; DB.teachers=_savedDB.teachers;
}
var _hasSeedStu=false;
for(var _i=0;_i<DB.students.length;_i++) if(DB.students[_i].id==="STU-001"){_hasSeedStu=true;break;}
if(!_hasSeedStu) DB.students.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.students[0])));
var _hasSeedTch=false;
for(var _j=0;_j<DB.teachers.length;_j++) if(DB.teachers[_j].id==="TCH-001"){_hasSeedTch=true;break;}
if(!_hasSeedTch) DB.teachers.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.teachers[0])));
for(var _si=0;_si<DB.students.length;_si++){
  if(!DB.students[_si].grades) DB.students[_si].grades={};
  for(var _subj=0;_subj<DEFAULT_DB.crSubjects.length;_subj++){
    var _sn=DEFAULT_DB.crSubjects[_subj];
    if(!DB.students[_si].grades[_sn]) DB.students[_si].grades[_sn]={q1:"",q2:"",q3:"",q4:""};
  }
}
saveDB();

var scoreStore={},crStore={},attStore={},rosterGrades={};
loadGrades();

// Global state
var currentUser=null,currentRole="student";
var currentFolder="HUMSS",currentSection="A";
var currentGradeLevel="G11";
var currentView="gradebook";
var currentQuarter="q1",currentSubject=null,currentGbSubject=null;
var gbSearchQuery="",suRole="student",isDark=true;
var _tcScrolledToBottom=false,_tcAccepted=false;

// Notifications & invites
var notifications=loadNotifs();
var invites=loadInvites();
var stuSubjects=loadStuSubjects();

function g(id){return document.getElementById(id);}
function showEl(id){var e=g(id);if(e)e.classList.remove("hidden");}
function hideEl(id){var e=g(id);if(e)e.classList.add("hidden");}
function showAlert(id,msg,type){var e=g(id);if(!e)return;e.textContent=msg;e.className="alert "+(type||"error");}
function hideAlert(id){var e=g(id);if(e)e.className="alert hidden";}

function toggleDark(){
  // Only allow toggle when user is logged in (not on login page)
  if(g("loginPage")&&!g("loginPage").classList.contains("hidden")) return;
  isDark=!isDark;
  document.documentElement.setAttribute("data-theme",isDark?"dark":"light");
  var icon=isDark?"🌙":"☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id){var e=g(id);if(e)e.textContent=icon;});
  try{localStorage.setItem("asiasource_dark",isDark?"1":"0");}catch(e){}
}
// Login page is always forced dark
function applyLoginDark(){
  document.documentElement.setAttribute("data-theme","dark");
  isDark=true;
}
function applyUserTheme(){
  // Apply saved theme preference when user logs in
  try{var saved=localStorage.getItem("asiasource_dark");if(saved!==null){isDark=saved==="1";}}catch(e){}
  document.documentElement.setAttribute("data-theme",isDark?"dark":"light");
  var icon=isDark?"🌙":"☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id){var e=g(id);if(e)e.textContent=icon;});
}

function switchAuth(tab){
  if(tab==="login"){
    g("tabLogin").className="auth-tab active";g("tabSignup").className="auth-tab";
    showEl("authLogin");hideEl("authSignup");
  } else {
    g("tabLogin").className="auth-tab";g("tabSignup").className="auth-tab active";
    hideEl("authLogin");showEl("authSignup");
  }
}

function setRole(role){
  currentRole=role;var isT=role==="teacher";
  g("btnStudent").className="role-btn"+(isT?"":" active");
  g("btnTeacher").className="role-btn"+(isT?" active":"");
  g("loginBtn").textContent=isT?"Sign In as Teacher":"Sign In as Student";
  g("userId").placeholder=isT?"e.g. ana.santos":"e.g. juan.delacruz";
  hideAlert("alertBox");g("userId").value="";g("password").value="";
}
function togglePass(id){var p=g(id);p.type=p.type==="password"?"text":"password";}

function setSuRole(role){
  suRole=role;
  g("suBtnStu").className="role-btn"+(role==="student"?" active":"");
  g("suBtnTch").className="role-btn"+(role==="teacher"?" active":"");
  var sfg=g("suStrandFg");if(sfg)sfg.style.display=role==="student"?"":"none";
  hideAlert("suAlert");hideAlert("suSuccess");
}

// ══════════════════════════════════════════════════
// TERMS & CONDITIONS
// ══════════════════════════════════════════════════
function openTcModal(){
  _tcScrolledToBottom=false;
  var modal=g("tcModal"),acceptBtn=g("tcAcceptBtn"),hint=g("tcScrollHint");
  modal.classList.remove("hidden");document.body.style.overflow="hidden";
  acceptBtn.disabled=true;if(hint)hint.style.opacity="1";
  var body=document.getElementById("tcBody");
  if(body){
    body.scrollTop=0;
    body.onscroll=function(){
      if(body.scrollTop+body.clientHeight>=body.scrollHeight-20&&!_tcScrolledToBottom){
        _tcScrolledToBottom=true;acceptBtn.disabled=false;if(hint)hint.style.opacity="0";
      }
    };
  }
}
function closeTcModal(){g("tcModal").classList.add("hidden");document.body.style.overflow="";}
function acceptTc(){_tcAccepted=true;g("suTcCheck").checked=true;onTcCheck();closeTcModal();showToast("✅ Terms & Conditions accepted!","success");}
function onTcCheck(){
  var checked=g("suTcCheck").checked,btn=g("suSubmitBtn");
  if(btn){btn.disabled=!checked;btn.style.opacity=checked?"1":"0.45";btn.style.cursor=checked?"pointer":"not-allowed";}
  if(checked&&!_tcAccepted){g("suTcCheck").checked=false;if(btn){btn.disabled=true;btn.style.opacity="0.45";btn.style.cursor="not-allowed";}openTcModal();}
}

// ══════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════
function handleLogin(e){
  e.preventDefault();
  var fresh=loadDB();
  if(fresh&&Array.isArray(fresh.students)&&Array.isArray(fresh.teachers)){DB.students=fresh.students;DB.teachers=fresh.teachers;}
  var eu=g("userId").value.trim().toLowerCase(),pw=g("password").value.trim();
  hideAlert("alertBox");
  if(!eu||!pw){showAlert("alertBox","Please fill in all fields.");return;}
  if(currentRole==="student"){
    var stu=null;
    for(var i=0;i<DB.students.length;i++){if(DB.students[i].emailUser===eu&&DB.students[i].pass===pw){stu=DB.students[i];break;}}
    if(!stu){
      var emailExists=false;
      for(var i2=0;i2<DB.students.length;i2++) if(DB.students[i2].emailUser===eu){emailExists=true;break;}
      showAlert("alertBox",emailExists?"Wrong password. Use your birthday: YYYY-MM-DD":"Email not found. Check spelling or sign up first.");
      return;
    }
    currentUser=stu;hideEl("loginPage");applyUserTheme();loadStudentDash(stu);showEl("studentDash");
  } else {
    var tch=null;
    for(var j=0;j<DB.teachers.length;j++){if(DB.teachers[j].emailUser===eu&&DB.teachers[j].pass===pw){tch=DB.teachers[j];break;}}
    if(!tch){
      var tchEmailExists=false;
      for(var j2=0;j2<DB.teachers.length;j2++) if(DB.teachers[j2].emailUser===eu){tchEmailExists=true;break;}
      showAlert("alertBox",tchEmailExists?"Wrong password. Use your birthday: YYYY-MM-DD":"Teacher email not found. Check spelling or sign up first.");
      return;
    }
    currentUser=tch;hideEl("loginPage");applyUserTheme();loadTeacherDash(tch);showEl("teacherDash");
  }
}

function logout(){
  hideEl("studentDash");hideEl("teacherDash");showEl("loginPage");
  currentUser=null;g("userId").value="";g("password").value="";
  applyLoginDark(); // Always dark on login page
}

// ══════════════════════════════════════════════════
// SIGN UP — FIXED for both roles
// ══════════════════════════════════════════════════
function handleSignUp(e){
  e.preventDefault();
  hideAlert("suAlert");hideAlert("suSuccess");
  if(!_tcAccepted){showAlert("suAlert","Please read and accept the Terms & Conditions first.");openTcModal();return;}
  var name=g("suName").value.trim(),eu=g("suEmail").value.trim().toLowerCase();
  var bday=g("suBirthday").value;
  if(!name){showAlert("suAlert","Please enter your full name.");return;}
  if(!eu){showAlert("suAlert","Please enter your email username.");return;}
  if(!bday){showAlert("suAlert","Please pick your birthday using the date picker.");return;}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(bday)){showAlert("suAlert","Birthday must be in YYYY-MM-DD format.");return;}
  var allUsers=DB.students.concat(DB.teachers);
  for(var i=0;i<allUsers.length;i++){
    if(allUsers[i].emailUser===eu){showAlert("suAlert","Email username already exists. Please choose a different one.");return;}
  }
  var yr=new Date().getFullYear();
  var defaultGrades={};
  for(var s=0;s<DEFAULT_DB.crSubjects.length;s++) defaultGrades[DEFAULT_DB.crSubjects[s]]={q1:"",q2:"",q3:"",q4:""};

  if(suRole==="student"){
    var strand=g("suStrand").value;
    if(!strand){showAlert("suAlert","Please select your strand and section.");return;}
    var idNum=String(DB.students.length+1).padStart(4,"0");
    var newStu={
      id:"STU-"+Date.now(),emailUser:eu,pass:bday,
      name:name,email:eu,strand:strand,bday:bday,
      gender:"",mobile:"",address:"",city:"",
      studentId:yr+"-"+idNum,
      grades:defaultGrades,scores:{ww:"",pt:"",qe:"",act:""},
      approvedSubjects:[],pendingSubjects:[]
    };
    DB.students.push(newStu);
  } else {
    // TEACHER signup fix
    var newTch={
      id:"TCH-"+Date.now(),emailUser:eu,pass:bday,
      name:name,email:eu,bday:bday,address:"",gender:"",mobile:"",city:""
    };
    DB.teachers.push(newTch);
  }
  saveDB();
  _tcAccepted=false;
  var tcChk=g("suTcCheck");if(tcChk)tcChk.checked=false;
  var suBtn=g("suSubmitBtn");if(suBtn){suBtn.disabled=true;suBtn.style.opacity="0.45";suBtn.style.cursor="not-allowed";}
  var roleLabel=suRole==="student"?"Student":"Teacher";
  showAlert("suSuccess",
    "✅ "+roleLabel+" account created! You can now log in.\n"+
    "Email: "+eu+"@asiasourceicollege.edu.ph\n"+
    "Password (your birthday): "+bday,
    "success"
  );
  document.querySelector("#authSignup form").reset();
  setTimeout(function(){switchAuth("login");hideAlert("suSuccess");},3500);
}

// ══════════════════════════════════════════════════
// GRADE HELPERS
// ══════════════════════════════════════════════════
function avgGrade(q1,q2,q3,q4){
  var filled=[q1,q2,q3,q4].filter(function(v){return v!==""&&v!==null&&v!==undefined&&!isNaN(Number(v))&&Number(v)>0;});
  if(!filled.length)return null;
  return Math.round(filled.reduce(function(a,b){return a+Number(b);},0)/filled.length);
}
function computeDetailedGrade(sc){
  function numArr(vals){return vals.filter(function(v){return v!==""&&!isNaN(Number(v));}).map(Number);}
  var qArr=numArr([sc.quiz1,sc.quiz2,sc.quiz3]);
  var aArr=numArr([sc.act1,sc.act2,sc.act3]);
  var pArr=numArr([sc.proj1,sc.proj2]);
  var eArr=numArr([sc.exam]);
  if(!qArr.length&&!aArr.length&&!pArr.length&&!eArr.length)return null;
  function avg(a){return a.reduce(function(x,y){return x+y;},0)/a.length;}
  var parts=[],w=0;
  if(qArr.length){parts.push((avg(qArr)/20)*100*0.25);w+=0.25;}
  if(aArr.length){parts.push((avg(aArr)/20)*100*0.25);w+=0.25;}
  if(pArr.length){parts.push((avg(pArr)/50)*100*0.25);w+=0.25;}
  if(eArr.length){parts.push((eArr[0]/100)*100*0.25);w+=0.25;}
  if(!w)return null;
  var raw=parts.reduce(function(a,b){return a+b;},0)/w;
  return Math.round(Math.min(100,Math.max(60,60+(raw/100)*40)));
}
function getRemarks(gr){
  if(!gr||gr==="")return "-";gr=Number(gr);
  if(gr>=90)return "Outstanding";if(gr>=85)return "Very Satisfactory";
  if(gr>=80)return "Satisfactory";if(gr>=75)return "Fairly Satisfactory";
  return "Did Not Meet Expectations";
}
function badgeClass(gr){
  if(!gr)return "";gr=Number(gr);
  if(gr>=90)return "badge-outstanding";if(gr>=85)return "badge-vs";
  if(gr>=80)return "badge-sat";if(gr>=75)return "badge-fs";return "badge-fail";
}
function gradeColor(gr){
  if(!gr)return "var(--muted)";gr=Number(gr);
  if(gr>=90)return "#5dde92";if(gr>=85)return "#7bc8f5";
  if(gr>=80)return "var(--gold)";if(gr>=75)return "#f0a050";return "#ff9090";
}
function darken(hex,amt){
  var n=parseInt(hex.replace("#",""),16);
  var r=Math.max(0,(n>>16)+amt),gg=Math.max(0,((n>>8)&0xFF)+amt),b=Math.max(0,(n&0xFF)+amt);
  return "#"+(((1<<24)|(r<<16)|(gg<<8)|b).toString(16).slice(1));
}
function getSubjColor(subj){var idx=DB.crSubjects.indexOf(subj);return idx>=0?DB.crColors[idx]:"#374151";}
function findStudentByName(name){for(var i=0;i<DB.students.length;i++){if(DB.students[i].name===name)return DB.students[i];}return null;}
function findStudentById(id){for(var i=0;i<DB.students.length;i++){if(DB.students[i].id===id)return DB.students[i];}return null;}
function ensureStudentGrades(stu){
  if(!stu.grades)stu.grades={};
  for(var s=0;s<DB.crSubjects.length;s++){var sn=DB.crSubjects[s];if(!stu.grades[sn])stu.grades[sn]={q1:"",q2:"",q3:"",q4:""};}
}
function getScoreStoreKey(classKey,genderLabel,idx){return classKey+"-"+genderLabel+"-"+idx;}
function getScores(sk,subj,qtr){
  if(!scoreStore[sk])return{ww:"",pt:"",qe:"",act:"",quiz1:"",quiz2:"",quiz3:"",act1:"",act2:"",act3:"",proj1:"",proj2:"",exam:""};
  var sd=scoreStore[sk][subj]||{},qd=sd[qtr]||{};
  return{ww:qd.ww!==undefined?qd.ww:"",pt:qd.pt!==undefined?qd.pt:"",qe:qd.qe!==undefined?qd.qe:"",act:qd.act!==undefined?qd.act:"",
    quiz1:qd.quiz1!==undefined?qd.quiz1:"",quiz2:qd.quiz2!==undefined?qd.quiz2:"",quiz3:qd.quiz3!==undefined?qd.quiz3:"",
    act1:qd.act1!==undefined?qd.act1:"",act2:qd.act2!==undefined?qd.act2:"",act3:qd.act3!==undefined?qd.act3:"",
    proj1:qd.proj1!==undefined?qd.proj1:"",proj2:qd.proj2!==undefined?qd.proj2:"",exam:qd.exam!==undefined?qd.exam:""};
}
function setScore(sk,subj,qtr,comp,val){
  if(!scoreStore[sk])scoreStore[sk]={};if(!scoreStore[sk][subj])scoreStore[sk][subj]={};
  if(!scoreStore[sk][subj][qtr])scoreStore[sk][subj][qtr]={};scoreStore[sk][subj][qtr][comp]=val;
}
function getRosterGrade(classKey,stuName,subj,qtr){
  if(!rosterGrades[classKey])return"";if(!rosterGrades[classKey][stuName])return"";
  if(!rosterGrades[classKey][stuName][subj])return"";
  var v=rosterGrades[classKey][stuName][subj][qtr];return(v!==undefined&&v!==null&&v!=="")?v:"";
}
function setRosterGrade(classKey,stuName,subj,qtr,grade){
  if(!rosterGrades[classKey])rosterGrades[classKey]={};
  if(!rosterGrades[classKey][stuName])rosterGrades[classKey][stuName]={};
  if(!rosterGrades[classKey][stuName][subj])rosterGrades[classKey][stuName][subj]={};
  rosterGrades[classKey][stuName][subj][qtr]=grade;
  var stu=findStudentByName(stuName);if(stu){ensureStudentGrades(stu);stu.grades[subj][qtr]=grade;}
}
function getAllRosterGrades(classKey,stuName,subj){
  var out={q1:"",q2:"",q3:"",q4:""};
  if(!rosterGrades[classKey]||!rosterGrades[classKey][stuName]||!rosterGrades[classKey][stuName][subj])return out;
  var qd=rosterGrades[classKey][stuName][subj];
  out.q1=qd.q1||"";out.q2=qd.q2||"";out.q3=qd.q3||"";out.q4=qd.q4||"";return out;
}

// ══════════════════════════════════════════════════
// DYNAMIC ROSTER — merges static + approved students
// ══════════════════════════════════════════════════

// Get grade level from strand code e.g. "G11-STEM-A" → "Grade 11"
function getGradeLevel(strand){
  if(!strand) return "";
  var m=strand.match(/^G(\d+)-/);
  return m ? "Grade "+m[1] : "";
}
// Short indicator e.g. "G11" or "G12"
function getGradeLevelShort(strand){
  if(!strand) return "";
  var m=strand.match(/^G(\d+)-/);
  return m ? "G"+m[1] : "";
}
// Get strand name e.g. "G11-STEM-A" → "STEM"
function getStrandName(strand){
  if(!strand) return "";
  var m=strand.match(/^G\d+-(.+?)-[AB]$|^G\d+-(.+)$/);
  if(m) return (m[1]||m[2]||"").replace("HEHO","H.E-H.O");
  return strand;
}
// Get section e.g. "G11-STEM-A" → "A"
function getSectionLetter(strand){
  if(!strand) return "";
  var m=strand.match(/-([AB])$/);
  return m ? m[1] : "";
}

// Compute the rosterKey for a student strand e.g. "G11-STEM-A" → "G11-STEM-A" (full key with grade)
function strandToRosterKey(strand){
  if(!strand) return null;
  // Normalize: G11-HEHO-A → G11-HE-HO-A
  return strand.replace(/HEHO/,"HE-HO");
}

// Get just the section+strand part without grade: "G11-STEM-A" → "STEM-A"
function strandToClassKey(strand){
  if(!strand) return null;
  var noGrade = strand.replace(/^G\d+-/,"").replace(/^HEHO-/,"HE-HO-");
  return noGrade;
}

// Build roster key from folder strand + grade level + section: e.g. "STEM","G11","A" → "G11-STEM-A"
function buildRosterKey(strand,grade,section){
  return (grade||"G11")+"-"+strand+"-"+(section||"A");
}

// Returns combined roster for a folder selection (grade+strand+section)
// Each entry has: {name, studentId, gender, strand, isRegistered}
function getDynamicRoster(classKey, grade){
  // classKey is like "STEM-A", grade is "G11" or "G12"
  grade = grade||currentGradeLevel||"G11";
  var fullKey = grade+"-"+classKey; // e.g. "G11-STEM-A"
  var legacyBase = DB.classRoster[classKey]||{male:[],female:[]}; // old static roster
  var gradeBase  = DB.classRoster[fullKey]||{male:[],female:[]}; // new per-grade roster

  // Start with merged base (legacy only for G11 to avoid duplication)
  var baseMale   = grade==="G11" ? legacyBase.male.concat(gradeBase.male.filter(function(n){return legacyBase.male.indexOf(n)<0;})) : gradeBase.male.slice();
  var baseFemale = grade==="G11" ? legacyBase.female.concat(gradeBase.female.filter(function(n){return legacyBase.female.indexOf(n)<0;})) : gradeBase.female.slice();

  var result = {
    male:   baseMale.map(function(n){ return {name:n,studentId:null,gender:"male",strand:"",isRegistered:false}; }),
    female: baseFemale.map(function(n){ return {name:n,studentId:null,gender:"female",strand:"",isRegistered:false}; })
  };

  // Overlay registered students whose strand matches this grade+strand+section
  for(var i=0;i<DB.students.length;i++){
    var stu=DB.students[i];
    if(!stu.strand) continue;
    var rk = strandToRosterKey(stu.strand); // e.g. "G11-STEM-A"
    var rkClass = strandToClassKey(stu.strand); // e.g. "STEM-A"
    var stuGrade = getGradeLevelShort(stu.strand); // "G11" or "G12"
    // Must match grade AND classKey
    if(stuGrade!==grade || rkClass!==classKey) continue;
    var gender=stu.gender&&stu.gender.toLowerCase()==="female"?"female":"male";
    var found=false;
    var arr=result[gender];
    for(var j=0;j<arr.length;j++){
      if(arr[j].name===stu.name){
        arr[j].studentId=stu.id;arr[j].strand=stu.strand;arr[j].isRegistered=true;
        found=true;break;
      }
    }
    if(!found){
      var invitesList=loadInvites();
      var isApproved=false;
      for(var k=0;k<invitesList.length;k++){
        if(invitesList[k].studentId===stu.id&&invitesList[k].status==="approved"){isApproved=true;break;}
      }
      if(isApproved||(stu.approvedSubjects&&stu.approvedSubjects.length>0)){
        result[gender].push({name:stu.name,studentId:stu.id,gender:gender,strand:stu.strand,isRegistered:true});
      }
    }
  }
  return result;
}

// Add a student to the class roster using full grade-aware key
function addStudentToStaticRoster(stu){
  var fullKey = strandToRosterKey(stu.strand); // "G11-STEM-A"
  if(!fullKey) return;
  if(!DB.classRoster[fullKey]) DB.classRoster[fullKey]={male:[],female:[]};
  var gender = stu.gender&&stu.gender.toLowerCase()==="female"?"female":"male";
  var arr = DB.classRoster[fullKey][gender];
  for(var i=0;i<arr.length;i++){ if(arr[i]===stu.name) return; }
  arr.push(stu.name);
  saveDB();
}

// Grade level badge HTML
function gradeLevelBadge(strand){
  if(!strand) return "";
  var gl=getGradeLevelShort(strand);
  var sn=getStrandName(strand);
  var sec=getSectionLetter(strand);
  var color=strand.indexOf("G11")>=0?"#0ea5e9":"#10b981";
  return '<span class="gl-badge" style="background:'+color+'22;border-color:'+color+'44;color:'+color+';">'+gl+'</span>'+
         '<span class="strand-badge">'+sn+(sec?" - "+sec:"")+'</span>';
}

// ══════════════════════════════════════════════════
// NOTIFICATION SYSTEM
// ══════════════════════════════════════════════════
function getNotifKey(userId){ return "notifs_"+userId; }

function addNotifForTeacher(teacherId, notif){
  var key = "teacher_notif_"+teacherId;
  var list = JSON.parse(localStorage.getItem(key)||"[]");
  notif.id = Date.now()+"_"+Math.random();
  notif.read = false;
  notif.timestamp = new Date().toISOString();
  list.unshift(notif);
  localStorage.setItem(key, JSON.stringify(list));
}

function getTeacherNotifs(teacherId){
  var key = "teacher_notif_"+teacherId;
  return JSON.parse(localStorage.getItem(key)||"[]");
}

function markTeacherNotifRead(teacherId, notifId){
  var key = "teacher_notif_"+teacherId;
  var list = JSON.parse(localStorage.getItem(key)||"[]");
  list.forEach(function(n){ if(n.id===notifId) n.read=true; });
  localStorage.setItem(key, JSON.stringify(list));
}

function getUnreadTeacherNotifCount(teacherId){
  return getTeacherNotifs(teacherId).filter(function(n){return!n.read;}).length;
}

// Invites: stored globally, each invite has teacherEmail, teacherName, subjectName, studentId, studentName, status (pending/approved/rejected)
function getInvitesForTeacher(teacherEmail){
  return loadInvites().filter(function(inv){ return inv.teacherEmail===teacherEmail && inv.status==="pending"; });
}
function getInvitesForStudent(studentId){
  return loadInvites().filter(function(inv){ return inv.studentId===studentId; });
}
function getApprovedSubjects(studentId){
  return loadInvites().filter(function(inv){ return inv.studentId===studentId && inv.status==="approved"; });
}
function getPendingSubjects(studentId){
  return loadInvites().filter(function(inv){ return inv.studentId===studentId && inv.status==="pending"; });
}

// ══════════════════════════════════════════════════
// STUDENT DASHBOARD
// ══════════════════════════════════════════════════
var SCORE_TYPES=[
  {key:"quiz1",label:"Quiz 1",max:20,group:"quiz"},{key:"quiz2",label:"Quiz 2",max:20,group:"quiz"},{key:"quiz3",label:"Quiz 3",max:20,group:"quiz"},
  {key:"act1",label:"Activity 1",max:20,group:"activity"},{key:"act2",label:"Activity 2",max:20,group:"activity"},{key:"act3",label:"Activity 3",max:20,group:"activity"},
  {key:"proj1",label:"Project 1",max:50,group:"project"},{key:"proj2",label:"Project 2",max:50,group:"project"},
  {key:"exam",label:"Exam",max:100,group:"exam"}
];
var GROUP_COLORS={quiz:"#0ea5e9",activity:"#10b981",project:"#f59e0b",exam:"#e8000f"};
var GROUP_LABELS={quiz:"📝 Quizzes",activity:"🎯 Activities",project:"📁 Projects",exam:"📄 Exam"};
var Q_LABELS={q1:"Quarter 1",q2:"Quarter 2",q3:"Quarter 3",q4:"Quarter 4"};

function loadStudentDash(stu){
  for(var i=0;i<DB.students.length;i++){if(DB.students[i].id===stu.id){currentUser=DB.students[i];stu=currentUser;break;}}
  g("stuName").textContent=stu.name;
  g("stuProfileName").textContent=stu.name;
  g("stuProfileEmail").textContent=stu.email+"@asiasourceicollege.edu.ph";
  g("stuProfileBday").textContent=stu.bday||"-";
  g("stuProfileLRN").textContent=stu.emailUser;
  // Show strand with grade level indicator
  var gl=getGradeLevel(stu.strand);
  var glShort=getGradeLevelShort(stu.strand);
  var sn=getStrandName(stu.strand);
  var sec=getSectionLetter(stu.strand);
  var isG11=stu.strand&&stu.strand.indexOf("G11")>=0;
  var glColor=isG11?"#0ea5e9":"#10b981";
  var strandEl=g("stuProfileStrand");
  if(strandEl){
    strandEl.innerHTML=
      (glShort?'<span style="background:'+glColor+'22;border:1px solid '+glColor+'55;color:'+glColor+';border-radius:20px;padding:1px 8px;font-size:10px;font-weight:800;margin-right:4px;">'+glShort+'</span>':"")+
      (DB.strandFull[stu.strand]||stu.strand);
  }

  // Check for approved subjects
  var approved=getApprovedSubjects(stu.id).map(function(inv){return inv.subjectName;});
  var pending=getPendingSubjects(stu.id).map(function(inv){return inv.subjectName;});
  var seedApproved=stu.approvedSubjects||[];
  // Merge approved
  var allApproved=seedApproved.concat(approved.filter(function(s){return seedApproved.indexOf(s)<0;}));

  var list=g("subjectList");list.innerHTML="";

  // Show pending subjects as pending cards
  pending.forEach(function(subj){
    var sub=null;for(var i=0;i<DB.subjects.length;i++){if(DB.subjects[i].name===subj){sub=DB.subjects[i];break;}}
    var icon=sub?sub.icon:subj.slice(0,3).toUpperCase();
    var teacher=sub?sub.teacher:"";
    list.innerHTML+=
      '<div class="subject-card pending-card">'+
      '<div class="subject-left"><div class="subject-icon" style="opacity:.5;">'+icon+'</div>'+
      '<div><div class="sub-name">'+subj+'</div><div class="sub-teacher">'+teacher+'</div></div></div>'+
      '<div class="subject-grade"><div class="pending-badge">⏳ Awaiting Approval</div></div></div>';
  });

  if(allApproved.length===0&&pending.length===0){
    // No subjects yet — show add button prompt
    list.innerHTML='<div class="no-subjects-msg">'+
      '<div class="no-sub-icon">📚</div>'+
      '<div class="no-sub-text">You have no subjects yet.</div>'+
      '<div class="no-sub-hint">Click the button below to add your subjects.</div>'+
      '</div>';
  }

  for(var si=0;si<DB.subjects.length;si++){
    var sub=DB.subjects[si];
    if(allApproved.indexOf(sub.name)<0) continue;
    var gr=stu.grades[sub.name]||{};
    var fg=avgGrade(gr.q1,gr.q2,gr.q3,gr.q4),passed=fg&&fg>=75;
    list.innerHTML+=
      '<div class="subject-card" onclick="openSubjectDetail(\''+sub.name+'\')" >'+
      '<div class="subject-left"><div class="subject-icon">'+sub.icon+'</div>'+
      '<div><div class="sub-name">'+sub.name+'</div><div class="sub-teacher">'+sub.teacher+'</div></div></div>'+
      '<div class="subject-grade"><div class="grade-num">'+(fg||"-")+'</div>'+
      '<div class="grade-label">Final</div>'+
      '<div class="grade-pill '+(passed?"pill-pass":"pill-fail")+'">'+getRemarks(fg)+'</div></div></div>';
  }

  // Grade card — only show approved subjects
  var tbody=g("gradeCardBody");tbody.innerHTML="";
  for(var k=0;k<DB.subjects.length;k++){
    var s=DB.subjects[k];
    if(allApproved.indexOf(s.name)<0) continue;
    var gr2=stu.grades[s.name]||{};
    var fg2=avgGrade(gr2.q1,gr2.q2,gr2.q3,gr2.q4),pass2=fg2&&fg2>=75;
    tbody.innerHTML+="<tr><td>"+s.name+"</td>"+
      "<td>"+(gr2.q1||"-")+"</td><td>"+(gr2.q2||"-")+"</td>"+
      "<td>"+(gr2.q3||"-")+"</td><td>"+(gr2.q4||"-")+"</td>"+
      '<td class="final-col">'+(fg2||"-")+"</td>"+
      '<td><span class="grade-pill '+(pass2?"pill-pass":"pill-fail")+'">'+getRemarks(fg2)+"</span></td></tr>";
  }
  if(tbody.innerHTML===""){
    tbody.innerHTML='<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:20px;">No approved subjects yet.</td></tr>';
  }
}

// ══════════════════════════════════════════════════
// ADD SUBJECT MODAL — STUDENT
// ══════════════════════════════════════════════════
var selectedSubjectForAdd=null, selectedTeacherForAdd=null;

function openAddSubjectModal(){
  selectedSubjectForAdd=null; selectedTeacherForAdd=null;
  renderAddSubjectStep1();
  g("addSubjectModal").classList.remove("hidden");
  document.body.style.overflow="hidden";
}
function closeAddSubjectModal(){ g("addSubjectModal").classList.add("hidden"); document.body.style.overflow=""; }

function renderAddSubjectStep1(){
  var already = getApprovedSubjects(currentUser.id).map(function(inv){return inv.subjectName;});
  var pending  = getPendingSubjects(currentUser.id).map(function(inv){return inv.subjectName;});
  var seed     = currentUser.approvedSubjects||[];
  var taken    = already.concat(pending).concat(seed);

  var html='<div class="add-subj-step"><div class="add-subj-title">📚 Select Subject</div><div class="add-subj-grid">';
  for(var i=0;i<DB.subjects.length;i++){
    var sub=DB.subjects[i];
    var col=DB.crColors[i]||"#e8000f";
    var isTaken=taken.indexOf(sub.name)>=0;
    if(isTaken){
      html+='<div class="add-subj-card add-subj-taken" title="Already enrolled or pending"><div class="asc-icon" style="background:'+col+'22;color:'+col+';">'+sub.icon+'</div><div class="asc-name">'+sub.name+'</div><div class="asc-status taken">✓ Enrolled</div></div>';
    } else {
      html+='<div class="add-subj-card" onclick="selectSubject(\''+sub.name+'\','+i+')" style="--asc-col:'+col+'"><div class="asc-icon" style="background:'+col+'22;color:'+col+';">'+sub.icon+'</div><div class="asc-name">'+sub.name+'</div><div class="asc-status">Select →</div></div>';
    }
  }
  html+='</div></div>';
  g("addSubjectContent").innerHTML=html;
}

function selectSubject(subj, idx){
  selectedSubjectForAdd=subj;
  var col=DB.crColors[idx]||"#e8000f";
  // Step 2: select teacher
  var html='<div class="add-subj-step">'+
    '<button class="add-subj-back" onclick="renderAddSubjectStep1()">← Back</button>'+
    '<div class="add-subj-title" style="color:'+col+';">'+subj+'</div>'+
    '<div class="add-subj-subtitle">Select Teacher</div>'+
    '<div class="add-subj-teacher-list">';
  for(var i=0;i<DB.teachers.length;i++){
    var t=DB.teachers[i];
    html+='<div class="add-teacher-card" onclick="selectTeacherForSubject(\''+t.id+'\',\''+t.emailUser+'\',this)">'+
      '<div class="atc-avatar">👩‍🏫</div>'+
      '<div class="atc-info"><div class="atc-name">'+t.name+'</div><div class="atc-email">'+t.emailUser+'@asiasourceicollege.edu.ph</div></div>'+
      '<div class="atc-select-ring" id="atcRing_'+t.id+'"></div>'+
      '</div>';
  }
  html+='</div>'+
    '<button class="btn-red" id="addSubjSubmitBtn" style="margin-top:16px;opacity:.45;cursor:not-allowed;" disabled onclick="submitSubjectRequest()">Send Request to Teacher</button>'+
    '</div>';
  g("addSubjectContent").innerHTML=html;
}

function selectTeacherForSubject(tid, temail, el){
  selectedTeacherForAdd=tid;
  document.querySelectorAll(".add-teacher-card").forEach(function(c){c.classList.remove("selected");});
  el.classList.add("selected");
  var btn=g("addSubjSubmitBtn");if(btn){btn.disabled=false;btn.style.opacity="1";btn.style.cursor="pointer";}
}

function submitSubjectRequest(){
  if(!selectedSubjectForAdd||!selectedTeacherForAdd) return;
  // Find teacher
  var teacher=null;for(var i=0;i<DB.teachers.length;i++){if(DB.teachers[i].id===selectedTeacherForAdd){teacher=DB.teachers[i];break;}}
  if(!teacher)return;

  // Create invite
  var invitesList=loadInvites();
  // Check duplicate
  for(var j=0;j<invitesList.length;j++){
    if(invitesList[j].studentId===currentUser.id&&invitesList[j].subjectName===selectedSubjectForAdd&&invitesList[j].status==="pending"){
      showToast("⚠️ You already have a pending request for "+selectedSubjectForAdd,"warning");
      closeAddSubjectModal();return;
    }
  }
  var invite={
    id:"INV-"+Date.now(),
    studentId:currentUser.id,
    studentName:currentUser.name,
    studentEmail:currentUser.emailUser,
    subjectName:selectedSubjectForAdd,
    teacherId:teacher.id,
    teacherEmail:teacher.emailUser,
    teacherName:teacher.name,
    status:"pending",
    timestamp:new Date().toISOString()
  };
  invitesList.push(invite);
  saveInvites(invitesList);

  // Notify teacher
  addNotifForTeacher(teacher.id,{
    type:"subject_request",
    inviteId:invite.id,
    studentName:currentUser.name,
    studentEmail:currentUser.emailUser,
    studentId:currentUser.id,
    subjectName:selectedSubjectForAdd,
    message:currentUser.name+" requested to enroll in "+selectedSubjectForAdd
  });

  closeAddSubjectModal();
  // Show big checkmark + pending message
  showPendingOverlay(selectedSubjectForAdd, teacher.name);
  setTimeout(function(){ loadStudentDash(currentUser); }, 1000);
}

function showPendingOverlay(subj, teacherName){
  var el=document.createElement("div");
  el.id="pendingOverlay";
  el.innerHTML=
    '<div class="pending-overlay-inner">'+
    '<div class="pending-check-anim">✅</div>'+
    '<div class="pending-title">Request Sent!</div>'+
    '<div class="pending-msg">Please wait for approval from<br><strong>'+teacherName+'</strong></div>'+
    '<div class="pending-subj">'+subj+'</div>'+
    '</div>';
  el.style.cssText="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease";
  document.body.appendChild(el);
  setTimeout(function(){el.style.opacity="0";el.style.transition="opacity .5s";},2500);
  setTimeout(function(){if(el.parentNode)el.remove();},3000);
}

function openSubjectDetail(subName){
  var sub=null;for(var i=0;i<DB.subjects.length;i++){if(DB.subjects[i].name===subName){sub=DB.subjects[i];break;}}
  var gr=(currentUser.grades&&currentUser.grades[subName])?currentUser.grades[subName]:{};
  var fg=avgGrade(gr.q1,gr.q2,gr.q3,gr.q4);
  var stuStrand=currentUser.strand||"";
  var classKey=stuStrand.replace(/^G\d+-/,"").replace("HEHO","HE-HO");
  var r=DB.classRoster[classKey]||{male:[],female:[]};
  var stuGender="",stuIdx=-1;
  for(var mi=0;mi<r.male.length;mi++){if(r.male[mi]===currentUser.name){stuGender="male";stuIdx=mi;break;}}
  if(stuIdx===-1){for(var fi=0;fi<r.female.length;fi++){if(r.female[fi]===currentUser.name){stuGender="female";stuIdx=fi;break;}}}
  var sk=(stuIdx>=0)?getScoreStoreKey(classKey,stuGender,stuIdx):null;
  var modalColor=DB.crColors[DB.crSubjects.indexOf(subName)]||"#e8000f";
  var iconTxt=sub?sub.icon:subName.slice(0,3).toUpperCase();
  var teacherTxt=sub?("Teacher: "+sub.teacher):"";
  var html='';
  html+='<div class="sm-hdr" style="border-color:'+modalColor+'44;">';
  html+='<div class="sm-hdr-icon" style="background:'+modalColor+'22;border-color:'+modalColor+'55;color:'+modalColor+';">'+iconTxt+'</div>';
  html+='<div class="sm-hdr-info"><div class="sm-hdr-name">'+subName+'</div><div class="sm-hdr-teacher">'+teacherTxt+'</div></div>';
  html+='<div class="sm-hdr-grade"><div class="sm-hdr-grade-num" style="color:'+(fg?"var(--gold)":"var(--muted)")+';">'+(fg||"—")+'</div><div class="sm-hdr-grade-lbl">Final Grade</div></div></div>';
  html+='<div class="sm-qtabs">';
  ["q1","q2","q3","q4"].forEach(function(q,qi){
    var qg=gr[q]||"";
    html+='<button class="sm-qtab'+(qi===0?" active":"")+" onclick=\"switchSmTab('"+q+"',this)\">";
    html+='<span class="sm-qtab-lbl">'+q.toUpperCase()+'</span>';
    html+=(qg?'<span class="sm-qtab-grade">'+qg+'</span>':'<span class="sm-qtab-empty">—</span>');
    html+='</button>';
  });
  html+='</div>';
  ["q1","q2","q3","q4"].forEach(function(q,qi){
    var qg=gr[q]||"";
    var qData={};
    if(sk&&scoreStore[sk]&&scoreStore[sk][subName]&&scoreStore[sk][subName][q]) qData=scoreStore[sk][subName][q];
    html+='<div class="sm-qpanel'+(qi===0?"":" hidden")+'" id="smPanel-'+q+'">';
    var lastGroup="";
    SCORE_TYPES.forEach(function(st){
      if(st.group!==lastGroup){if(lastGroup)html+='</div></div>';html+='<div class="sm-group"><div class="sm-group-lbl" style="color:'+GROUP_COLORS[st.group]+';">'+GROUP_LABELS[st.group]+'</div><div class="sm-group-rows">';lastGroup=st.group;}
      var val=(qData[st.key]!==undefined&&qData[st.key]!=="")?qData[st.key]:"";
      var pct=(val!==""&&!isNaN(Number(val)))?Math.min(100,Math.round(Number(val)/st.max*100)):0;
      var hasVal=val!=="";
      html+='<div class="sm-row"><div class="sm-row-label">'+st.label+'</div><div class="sm-row-bar-wrap"><div class="sm-row-bar" style="width:'+pct+'%;background:'+GROUP_COLORS[st.group]+';"></div></div><div class="sm-row-score'+(hasVal?"":" sm-row-empty")+'">'+(hasVal?val+'<span class="sm-row-max"> /'+st.max+'</span>':"—")+'</div></div>';
    });
    if(lastGroup)html+='</div></div>';
    html+='<div class="sm-q-footer"><span class="sm-q-footer-lbl">'+Q_LABELS[q]+' Grade</span><span class="sm-q-footer-val '+(qg?badgeClass(qg):"sm-q-none")+'">'+(qg||"Not yet graded")+'</span></div></div>';
  });
  html+='<div class="sm-final-bar"><span class="sm-final-lbl">Final Grade</span><span class="sm-final-num" style="color:'+(fg?gradeColor(fg):"var(--muted)")+';">'+(fg||"—")+'</span><span class="sm-final-rem">'+getRemarks(fg)+'</span></div>';
  g("subjectModalTitle").textContent=subName;g("subjectModalSub").textContent="";g("subjectModalContent").innerHTML=html;
  g("subjectModal").classList.remove("hidden");document.body.style.overflow="hidden";
}

function switchSmTab(q,btn){
  document.querySelectorAll(".sm-qtab").forEach(function(t){t.classList.remove("active");});
  document.querySelectorAll(".sm-qpanel").forEach(function(p){p.classList.add("hidden");});
  btn.classList.add("active");var panel=document.getElementById("smPanel-"+q);if(panel)panel.classList.remove("hidden");
}
function closeSubjectModal(){g("subjectModal").classList.add("hidden");document.body.style.overflow="";}

// ══════════════════════════════════════════════════
// TEACHER DASHBOARD + NOTIFICATIONS
// ══════════════════════════════════════════════════
function loadTeacherDash(tch){
  g("tchName").textContent=tch.name;
  g("tchProfileName").textContent=tch.name;
  g("tchProfileEmail").textContent=tch.email+"@asiasourceicollege.edu.ph";
  currentSubject=DB.crSubjects[0];

  // Render notif badge
  updateTeacherNotifBadge();

  openFolderByStrand("HUMSS","G11");
}

function updateTeacherNotifBadge(){
  var count=getUnreadTeacherNotifCount(currentUser.id);
  var badge=g("tchNotifBadge");
  if(badge){badge.textContent=count>0?count:"";badge.style.display=count>0?"flex":"none";}
}

function openTeacherNotifPanel(){
  var notifs=getTeacherNotifs(currentUser.id);
  var invitesList=getInvitesForTeacher(currentUser.emailUser);
  var html='';

  if(notifs.length===0){
    html='<div class="notif-empty">📭 No notifications yet</div>';
  } else {
    notifs.forEach(function(n){
      var isRead=n.read;
      if(n.type==="subject_request"){
        // Find invite status
        var allInvites=loadInvites();
        var inv=null;for(var i=0;i<allInvites.length;i++){if(allInvites[i].id===n.inviteId){inv=allInvites[i];break;}}
        var status=inv?inv.status:"pending";
        html+='<div class="notif-item'+(isRead?"":" notif-unread")+'" id="notif_'+n.id+'">';
        html+='<div class="notif-avatar">🎓</div>';
        html+='<div class="notif-body">';
        html+='<div class="notif-title">Subject Enrollment Request</div>';
        html+='<div class="notif-msg"><strong>'+n.studentName+'</strong> wants to enroll in <strong>'+n.subjectName+'</strong></div>';
        html+='<div class="notif-email">'+n.studentEmail+'@asiasourceicollege.edu.ph</div>';
        // Show grade level and strand
        var stuInfo=findStudentById(n.studentId);
        if(stuInfo&&stuInfo.strand){
          var gl=getGradeLevelShort(stuInfo.strand),sn=getStrandName(stuInfo.strand),sec=getSectionLetter(stuInfo.strand);
          var isG11=stuInfo.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
          html+='<div class="notif-strand-row">'+
            '<span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span>'+
            '<span class="strand-mini">'+sn+(sec?" - "+sec:"")+'</span>'+
            '</div>';
        }
        if(status==="pending"){
          html+='<div class="notif-actions">'+
            '<button class="notif-approve" onclick="respondToInvite(\''+n.inviteId+'\',\'approved\',\''+n.id+'\')">✅ Approve</button>'+
            '<button class="notif-reject"  onclick="respondToInvite(\''+n.inviteId+'\',\'rejected\',\''+n.id+'\')">✕ Decline</button>'+
            '</div>';
        } else {
          html+='<div class="notif-status '+(status==="approved"?"notif-status-ok":"notif-status-no")+'">'+(status==="approved"?"✅ Approved":"✕ Declined")+'</div>';
        }
        html+='</div></div>';
        // Mark as read
        markTeacherNotifRead(currentUser.id, n.id);
      }
    });
  }

  var panel=g("teacherNotifPanel");
  if(panel){ panel.innerHTML=html; panel.classList.toggle("hidden"); }
  updateTeacherNotifBadge();
}

function respondToInvite(inviteId, decision, notifId){
  var invitesList=loadInvites();
  var inv=null;
  for(var i=0;i<invitesList.length;i++){
    if(invitesList[i].id===inviteId){ inv=invitesList[i]; invitesList[i].status=decision; break; }
  }
  saveInvites(invitesList);

  if(inv && decision==="approved"){
    var stu=findStudentById(inv.studentId);
    if(stu){
      ensureStudentGrades(stu);
      if(!stu.approvedSubjects) stu.approvedSubjects=[];
      if(stu.approvedSubjects.indexOf(inv.subjectName)<0) stu.approvedSubjects.push(inv.subjectName);
      // ★ KEY: Add student into static classRoster so they appear in Gradebook/CR/Attendance
      addStudentToStaticRoster(stu);
      saveDB();
      showToast("✅ "+inv.studentName+" approved for "+inv.subjectName+" — added to gradebook & attendance!","success");
    }
  } else {
    showToast("✕ Declined request for "+(inv?inv.subjectName:""),"warning");
  }

  // Re-render notif panel + refresh current view
  openTeacherNotifPanel();
  updateTeacherNotifBadge();
  // Refresh active view so new student appears immediately
  if(currentView==="gradebook") renderGradebook(currentFolder,currentSection);
  else if(currentView==="classrecord") renderClassRecord(currentFolder,currentSection);
  else renderAttendance(currentFolder,currentSection);
}

// ══════════════════════════════════════════════════
// ADD STUDENT — TEACHER
// ══════════════════════════════════════════════════
function openAddStudentModal(){
  renderAddStudentModal();
  g("addStudentModal").classList.remove("hidden");
  document.body.style.overflow="hidden";
}
function closeAddStudentModal(){g("addStudentModal").classList.add("hidden");document.body.style.overflow="";}

function renderAddStudentModal(){
  var html='<div class="add-stu-modal">'+
    '<div class="add-stu-title">➕ Add Student to Gradebook</div>'+
    '<div class="add-stu-subtitle">Search for a student by name or email</div>'+
    '<div class="add-stu-search-wrap">'+
    '<input class="plain-input" type="text" id="addStuSearch" placeholder="Search student name or email..." oninput="renderAddStudentList()">'+
    '</div>'+
    '<div class="add-stu-list" id="addStuList"></div>'+
    '</div>';
  g("addStudentContent").innerHTML=html;
  renderAddStudentList();
}

function renderAddStudentList(){
  var q=(g("addStuSearch")?g("addStuSearch").value.trim().toLowerCase():"");
  var list=g("addStuList");if(!list)return;
  var html="";
  var shown=0;
  for(var i=0;i<DB.students.length;i++){
    var stu=DB.students[i];
    if(q&&stu.name.toLowerCase().indexOf(q)<0&&stu.emailUser.toLowerCase().indexOf(q)<0) continue;
    shown++;
    var strandLabel=DB.strandFull[stu.strand]||stu.strand||"Unknown";
    var gl=getGradeLevel(stu.strand);
    var glShort=getGradeLevelShort(stu.strand);
    var sn=getStrandName(stu.strand);
    var sec=getSectionLetter(stu.strand);
    var isG11=stu.strand&&stu.strand.indexOf("G11")>=0;
    var glColor=isG11?"#0ea5e9":"#10b981";
    html+='<div class="add-stu-card">'+
      '<div class="astu-avatar">🎓</div>'+
      '<div class="astu-info">'+
      '<div class="astu-name">'+stu.name+
        '<span class="gl-badge" style="margin-left:8px;background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+glShort+'</span>'+
        (sn?'<span class="strand-mini" style="margin-left:4px;">'+sn+(sec?" · "+sec:"")+'</span>':"")+'</div>'+
      '<div class="astu-email">'+stu.emailUser+'@asiasourceicollege.edu.ph</div>'+
      '<div class="astu-strand">'+(gl||"")+(gl&&strandLabel?" · ":"")+(strandLabel||"")+'</div>'+
      '</div>'+
      '<button class="astu-add-btn" onclick="addStudentToGradebook(\''+stu.id+'\')">+ Add</button>'+
      '</div>';
  }
  if(shown===0) html='<div class="add-stu-empty">No students found.</div>';
  list.innerHTML=html;
}

function addStudentToGradebook(stuId){
  var stu=findStudentById(stuId);
  if(!stu){showToast("Student not found.","error");return;}

  // Auto-approve all subjects
  var invitesList=loadInvites();
  DB.crSubjects.forEach(function(subj){
    var exists=false;
    for(var j=0;j<invitesList.length;j++){
      if(invitesList[j].studentId===stuId&&invitesList[j].subjectName===subj&&invitesList[j].status==="approved"){exists=true;break;}
    }
    if(!exists){
      invitesList.push({
        id:"INV-TCH-"+Date.now()+"-"+Math.random().toString(36).slice(2),
        studentId:stuId,studentName:stu.name,studentEmail:stu.emailUser,
        subjectName:subj,
        teacherId:currentUser.id,teacherEmail:currentUser.emailUser,teacherName:currentUser.name,
        status:"approved",timestamp:new Date().toISOString(),addedByTeacher:true
      });
    }
  });
  saveInvites(invitesList);

  // Approve all subjects on student record
  if(!stu.approvedSubjects) stu.approvedSubjects=[];
  DB.crSubjects.forEach(function(s){if(stu.approvedSubjects.indexOf(s)<0)stu.approvedSubjects.push(s);});
  ensureStudentGrades(stu);

  // ★ KEY: Insert student into class roster based on their strand
  addStudentToStaticRoster(stu);
  saveDB();

  var gl=getGradeLevel(stu.strand)||"Unknown Grade";
  var sn=getStrandName(stu.strand)||"Unknown Strand";
  showToast("✅ "+stu.name+" ("+gl+" · "+sn+") added to gradebook, class record & attendance!","success");
  closeAddStudentModal();

  // Refresh current teacher view immediately
  if(currentView==="gradebook") renderGradebook(currentFolder,currentSection);
  else if(currentView==="classrecord") renderClassRecord(currentFolder,currentSection);
  else renderAttendance(currentFolder,currentSection);
}

// ══════════════════════════════════════════════════
// TEACHER FOLDER/VIEW
// ══════════════════════════════════════════════════
function openFolder(el){
  var strand=el.getAttribute("data-strand");
  var grade=el.getAttribute("data-grade")||"G11";
  var items=document.querySelectorAll(".strand-item");
  for(var i=0;i<items.length;i++) items[i].className="strand-item";
  el.className="strand-item active";
  openFolderByStrand(strand,grade);
}
function openFolderByStrand(strand,grade){
  grade=grade||"G11";
  currentFolder=strand;currentGradeLevel=grade;
  var singleSection=(strand==="ICT"||strand==="ABM");
  currentSection="A";currentView="gradebook";currentQuarter="q1";
  currentGbSubject=DB.crSubjects[0];gbSearchQuery="";
  var isG11=grade==="G11";
  var glColor=isG11?"#0ea5e9":"#10b981";
  var glLabel=isG11?"Grade 11":"Grade 12";
  g("folderTitle").innerHTML='<span class="folder-gl-pill" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+grade+'</span> '+(DB.strandLabels[strand]||strand)+" — Student List";
  var secTabsWrap=g("secTabsWrap");if(secTabsWrap)secTabsWrap.style.display=singleSection?"none":"";
  var stabs=document.querySelectorAll(".stab");stabs[0].className="stab active";if(stabs[1])stabs[1].className="stab";
  var vtabs=document.querySelectorAll(".vtab");for(var i=0;i<vtabs.length;i++)vtabs[i].className="vtab";
  g("vtabGradebook").className="vtab active";
  showView("gradebook");renderGradebook(strand,"A");
}
function switchSection(sec,btn){
  currentSection=sec;gbSearchQuery="";
  var tabs=document.querySelectorAll(".stab");for(var i=0;i<tabs.length;i++)tabs[i].className="stab";
  btn.className="stab active";
  if(currentView==="gradebook") renderGradebook(currentFolder,sec);
  else if(currentView==="classrecord") renderClassRecord(currentFolder,sec);
  else renderAttendance(currentFolder,sec);
}
function setView(view,btn){
  currentView=view;var vtabs=document.querySelectorAll(".vtab");for(var i=0;i<vtabs.length;i++)vtabs[i].className="vtab";
  btn.className="vtab active";showView(view);
  if(view==="gradebook") renderGradebook(currentFolder,currentSection);
  else if(view==="classrecord") renderClassRecord(currentFolder,currentSection);
  else renderAttendance(currentFolder,currentSection);
}
function showView(view){
  hideEl("viewGradebook");hideEl("viewClassRecord");hideEl("viewAttendance");
  if(view==="gradebook") showEl("viewGradebook");
  else if(view==="classrecord") showEl("viewClassRecord");
  else showEl("viewAttendance");
}

// ══════════════════════════════════════════════════
// GRADEBOOK
// ══════════════════════════════════════════════════
function setGbQuarter(q,btn){
  currentQuarter=q;var btns=document.querySelectorAll(".qtr-btn");for(var i=0;i<btns.length;i++)btns[i].className="qtr-btn";
  btn.className="qtr-btn active";renderGradebook(currentFolder,currentSection);
}
function setGbSubject(subj){currentGbSubject=subj;gbSearchQuery="";renderGradebook(currentFolder,currentSection);}
function handleGbSearch(val){gbSearchQuery=val.toLowerCase().trim();_renderGbRows(currentFolder+"-"+currentSection);}

function renderGradebook(strand,section){
  var key=strand+"-"+section;
  if(!currentGbSubject) currentGbSubject=DB.crSubjects[0];
  var toolbar=g("gbToolbar");
  if(toolbar){
    var pillsHtml="";
    for(var si=0;si<DB.crSubjects.length;si++){
      var s=DB.crSubjects[si],col=DB.crColors[si],isAct=currentGbSubject===s;
      pillsHtml+='<button class="subj-btn'+(isAct?" active":"")+'" data-subj="'+s+'"'+
        ' style="'+(isAct?"background:"+col+";border-color:"+col+";color:#fff;":"border-color:"+col+";color:"+col+";")+'"'+
        ' onclick="setGbSubject(this.getAttribute(\'data-subj\'))">'+s+'</button>';
    }
    toolbar.innerHTML=
      '<div class="gb-toolbar-inner" style="margin-bottom:10px;">'+
      '<span class="toolbar-lbl">Subject:</span><div class="subj-pills">'+pillsHtml+'</div></div>'+
      '<div class="gb-toolbar-inner">'+
      '<span class="toolbar-lbl">Quarter:</span>'+
      '<div class="qtr-tabs">'+['q1','q2','q3','q4'].map(function(q){return '<button class="qtr-btn'+(currentQuarter===q?" active":"")+"\" onclick=\"setGbQuarter('"+q+"',this)\">"+q.toUpperCase()+'</button>';}).join('')+'</div>'+
      '<div class="gb-search-wrap"><span class="gb-search-icon">🔍</span>'+
      '<input class="gb-search-input" type="text" placeholder="Search student..." value="'+gbSearchQuery+'" oninput="handleGbSearch(this.value)">'+
      (gbSearchQuery?'<button class="gb-search-clear" onclick="handleGbSearch(\'\');document.querySelector(\'.gb-search-input\').value=\'\'">✕</button>':"")+
      '</div>'+
      '<button class="save-qtr-btn" onclick="saveQuarterGrades(\''+key+'\')">💾 Save '+currentQuarter.toUpperCase()+' — '+currentGbSubject+'</button>'+
      '</div>';
  }
  var gbSubjTh=g("gbSubjTh");if(gbSubjTh)gbSubjTh.textContent=currentGbSubject+" Grade ("+currentQuarter.toUpperCase()+")";
  _renderGbRows(key);
}

function _renderGbRows(key){
  var r=getDynamicRoster(key, currentGradeLevel);
  var tbody=g("gbBody");tbody.innerHTML="";
  var q=gbSearchQuery,COLSPAN=14;
  function matchesSearch(name){if(!q)return true;return name.toLowerCase().indexOf(q)>=0;}
  var rowNum=0;
  function inp(comp,val,maxVal,sk){
    var da=' data-sk="'+sk+'" data-subj="'+currentGbSubject+'" data-qtr="'+currentQuarter+'" data-comp="'+comp+'"';
    return '<input class="score-input" type="number" min="0" max="'+maxVal+'" value="'+val+'" placeholder="—"'+da+' oninput="handleScoreInput(this)">';
  }
  function makeRows(entries,genderLabel){
    var filtered=[];
    for(var i=0;i<entries.length;i++){if(matchesSearch(entries[i].name))filtered.push({entry:entries[i],origIdx:i});}
    if(filtered.length===0)return;
    tbody.innerHTML+='<tr><td colspan="'+COLSPAN+'" class="cr-gender-row">'+(genderLabel==="male"?"👨 MALE":"👩 FEMALE")+" ("+filtered.length+")</td></tr>";
    for(var fi=0;fi<filtered.length;fi++){
      var origIdx=filtered[fi].origIdx,entry=filtered[fi].entry,name=entry.name;
      var sk=getScoreStoreKey(key,genderLabel,origIdx);
      var sc=getScores(sk,currentGbSubject,currentQuarter),fg=computeDetailedGrade(sc),bc=fg?badgeClass(fg):"";
      var stuSubjGrade="—",rgVal=getRosterGrade(key,name,currentGbSubject,currentQuarter);
      if(rgVal!=="")stuSubjGrade=rgVal;
      // Grade level badge from registered student strand
      var glBadge="";
      if(entry.isRegistered&&entry.strand){
        var gl=getGradeLevelShort(entry.strand);
        var sn=getStrandName(entry.strand);
        var isG11=entry.strand.indexOf("G11")>=0;
        var glColor=isG11?"#0ea5e9":"#10b981";
        glBadge='<span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span>'+
                '<span class="strand-mini">'+sn+'</span>';
      }
      var displayName=name;
      if(q){var idx=name.toLowerCase().indexOf(q);if(idx>=0)displayName=name.slice(0,idx)+'<mark class="gb-hl">'+name.slice(idx,idx+q.length)+'</mark>'+name.slice(idx+q.length);}
      rowNum++;
      tbody.innerHTML+='<tr>'+
        '<td>'+rowNum+'</td>'+
        '<td class="gb-name-cell"><div class="student-name-wrap">'+displayName+glBadge+'</div></td>'+
        '<td>'+inp("quiz1",sc.quiz1,20,sk)+'</td><td>'+inp("quiz2",sc.quiz2,20,sk)+'</td><td>'+inp("quiz3",sc.quiz3,20,sk)+'</td>'+
        '<td>'+inp("act1",sc.act1,20,sk)+'</td><td>'+inp("act2",sc.act2,20,sk)+'</td><td>'+inp("act3",sc.act3,20,sk)+'</td>'+
        '<td>'+inp("proj1",sc.proj1,50,sk)+'</td><td>'+inp("proj2",sc.proj2,50,sk)+'</td>'+
        '<td>'+inp("exam",sc.exam,100,sk)+'</td>'+
        '<td id="fg-'+sk+"-"+currentGbSubject+"-"+currentQuarter+'">'+(fg!==null?'<span class="final-badge '+bc+'">'+fg+'</span>':"—")+'</td>'+
        '<td id="rem-'+sk+"-"+currentGbSubject+"-"+currentQuarter+'" style="font-size:11px;font-weight:600;color:'+gradeColor(fg)+'">'+getRemarks(fg)+'</td>'+
        '<td class="gb-subj-grade-col"><span class="subj-saved-badge'+(stuSubjGrade!=="—"?" has-grade":"")+'">'+stuSubjGrade+'</span></td>'+
        '</tr>';
    }
  }
  makeRows(r.male,"male");makeRows(r.female,"female");
  if(tbody.innerHTML==="") tbody.innerHTML='<tr><td colspan="'+COLSPAN+'" class="gb-no-results">No students found.</td></tr>';
}

function handleScoreInput(input){
  var sk=input.getAttribute("data-sk"),subj=input.getAttribute("data-subj"),qtr=input.getAttribute("data-qtr"),comp=input.getAttribute("data-comp"),val=input.value;
  setScore(sk,subj,qtr,comp,val);
  var sc=getScores(sk,subj,qtr),fg=computeDetailedGrade(sc);
  var fgEl=g("fg-"+sk+"-"+subj+"-"+qtr),remEl=g("rem-"+sk+"-"+subj+"-"+qtr);
  if(fgEl) fgEl.innerHTML=(fg!==null)?'<span class="final-badge '+badgeClass(fg)+'">'+fg+'</span>':"—";
  if(remEl){remEl.textContent=getRemarks(fg);remEl.style.color=gradeColor(fg);}
  saveGrades();
}
function saveQuarterGrades(classKey){
  var r=getDynamicRoster(classKey, currentGradeLevel);var saved=0,skipped=0;
  function process(entries,genderLabel){for(var i=0;i<entries.length;i++){var sk=getScoreStoreKey(classKey,genderLabel,i),sc=getScores(sk,currentGbSubject,currentQuarter),fg=computeDetailedGrade(sc);if(fg===null){skipped++;continue;}setRosterGrade(classKey,entries[i].name,currentGbSubject,currentQuarter,fg);saved++;}}
  process(r.male,"male");process(r.female,"female");
  saveDB();saveGrades();
  showToast(saved>0?"💾 ["+currentGbSubject+"] "+currentQuarter.toUpperCase()+" — "+saved+" grade(s) saved! ✅":"⚠️ No scores found. Enter scores first.",saved>0?"success":"warning");
  renderGradebook(currentFolder,currentSection);
}

// ══════════════════════════════════════════════════
// CLASS RECORD
// ══════════════════════════════════════════════════
function setCrSubject(subj){currentSubject=subj;renderClassRecord(currentFolder,currentSection);}
function renderClassRecord(strand,section){
  var key=strand+"-"+section,r=getDynamicRoster(key, currentGradeLevel);
  if(!currentSubject)currentSubject=DB.crSubjects[0];
  var subjColor=getSubjColor(currentSubject),subjDark=darken(subjColor,-28);
  var crToolbar=g("crToolbar");
  if(crToolbar){
    var pillsHtml="";
    for(var si=0;si<DB.crSubjects.length;si++){
      var s=DB.crSubjects[si],col=DB.crColors[si],isActive=currentSubject===s;
      pillsHtml+='<button class="subj-btn'+(isActive?" active":"")+'" data-subj="'+s+'"'+
        ' style="'+(isActive?"background:"+col+";border-color:"+col+";color:#fff;":"border-color:"+col+";color:"+col+";")+'"'+
        ' onclick="setCrSubject(this.getAttribute(\'data-subj\'))">'+s+'</button>';
    }
    crToolbar.innerHTML='<div class="cr-toolbar-inner"><span class="toolbar-lbl">Subject:</span><div class="subj-pills">'+pillsHtml+'</div><button class="save-qtr-btn" onclick="saveCrGrades(\''+key+'\')">💾 Save All Quarters</button></div>';
  }
  var thead=g("crHead");
  if(thead){
    thead.innerHTML='<tr><th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2)">#</th><th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">STUDENT NAME</th><th class="cr-th cr-subj-hdr" colspan="5" style="background:'+subjColor+'">'+currentSubject+'</th></tr><tr><th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q1</th><th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q2</th><th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q3</th><th class="cr-th cr-qtr-hdr" style="background:'+subjColor+'">Q4</th><th class="cr-th cr-final-hdr" style="background:'+subjDark+'">FINAL</th></tr>';
  }
  var tbody=g("crBody");tbody.innerHTML="";
  function makeCrRows(entries,genderLabel){
    tbody.innerHTML+='<tr><td colspan="7" class="cr-gender-row '+(genderLabel==="female"?"cr-female-row":"")+'">'+(genderLabel==="male"?"👨 MALE":"👩 FEMALE")+"</td></tr>";
    for(var i=0;i<entries.length;i++){
      var entry=entries[i],name=entry.name;
      var alt=(i%2!==0)?"cr-alt":"",ck=genderLabel+"-"+i;
      var stuSubjQ=getAllRosterGrades(key,name,currentSubject);
      var stuDb=findStudentByName(name);
      if(stuDb){ensureStudentGrades(stuDb);var dbGr=stuDb.grades[currentSubject]||{};if(!stuSubjQ.q1&&dbGr.q1)stuSubjQ.q1=dbGr.q1;if(!stuSubjQ.q2&&dbGr.q2)stuSubjQ.q2=dbGr.q2;if(!stuSubjQ.q3&&dbGr.q3)stuSubjQ.q3=dbGr.q3;if(!stuSubjQ.q4&&dbGr.q4)stuSubjQ.q4=dbGr.q4;}
      var q1=stuSubjQ.q1||"",q2=stuSubjQ.q2||"",q3=stuSubjQ.q3||"",q4=stuSubjQ.q4||"",fg=avgGrade(q1,q2,q3,q4);
      var da=' data-key="'+key+'" data-ck="'+ck+'" data-subj="'+currentSubject+'" data-stuname="'+name+'"';
      // Grade level badge
      var glBadge="";
      if(entry.isRegistered&&entry.strand){
        var gl=getGradeLevelShort(entry.strand),sn=getStrandName(entry.strand);
        var isG11=entry.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
        glBadge='<span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span>'+
                '<span class="strand-mini">'+sn+'</span>';
      }
      tbody.innerHTML+='<tr class="cr-row '+alt+'"><td class="cr-td cr-sticky cr-num-col cr-num-td">'+(i+1)+'</td>'+
        '<td class="cr-td cr-sticky cr-name-col cr-name-td"><div class="student-name-wrap">'+name+glBadge+'</div></td>'+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100" value="'+q1+'" placeholder="—"'+da+' data-q="q1" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100" value="'+q2+'" placeholder="—"'+da+' data-q="q2" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100" value="'+q3+'" placeholder="—"'+da+' data-q="q3" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-score-td"><input class="cr-input" type="number" min="0" max="100" value="'+q4+'" placeholder="—"'+da+' data-q="q4" oninput="handleCrInput(this)"></td>'+
        '<td class="cr-td cr-final-td" id="crf-'+key+"-"+ck+'">'+(fg?'<span class="cr-final-badge '+badgeClass(fg)+'">'+fg+'</span>':"—")+'</td></tr>';
    }
  }
  makeCrRows(r.male,"male");makeCrRows(r.female,"female");
}
function handleCrInput(input){
  var key=input.getAttribute("data-key"),ck=input.getAttribute("data-ck"),subj=input.getAttribute("data-subj"),qkey=input.getAttribute("data-q"),stuName=input.getAttribute("data-stuname"),val=input.value;
  setRosterGrade(key,stuName,subj,qkey,val);
  var allQ=getAllRosterGrades(key,stuName,subj),stu=findStudentByName(stuName);
  if(stu){ensureStudentGrades(stu);var dbGr=stu.grades[subj]||{};if(!allQ.q1&&dbGr.q1)allQ.q1=dbGr.q1;if(!allQ.q2&&dbGr.q2)allQ.q2=dbGr.q2;if(!allQ.q3&&dbGr.q3)allQ.q3=dbGr.q3;if(!allQ.q4&&dbGr.q4)allQ.q4=dbGr.q4;}
  var fg=avgGrade(allQ.q1,allQ.q2,allQ.q3,allQ.q4),fEl=g("crf-"+key+"-"+ck);
  if(fEl)fEl.innerHTML=fg?'<span class="cr-final-badge '+badgeClass(fg)+'">'+fg+'</span>':"—";
  saveDB();saveGrades();
}
function saveCrGrades(key){saveDB();saveGrades();showToast("💾 ["+currentSubject+"] all quarter grades saved! ✅","success");}

// ══════════════════════════════════════════════════
// ATTENDANCE
// ══════════════════════════════════════════════════
function renderAttendance(strand,section){
  var key=strand+"-"+section,r=getDynamicRoster(key);
  if(!attStore[key])attStore[key]={};
  var mRow=g("attMonthRow"),dRow=g("attDayRow");
  mRow.innerHTML='<th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2);">#</th><th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">NAMES OF LEARNERS</th><th class="cr-th att-total-hdr" colspan="2" style="background:#7a0006;">YEARLY TOTAL</th>';
  dRow.innerHTML='<th class="cr-th att-total-sub" style="background:#9b1c1c;">ABS</th><th class="cr-th att-total-sub" style="background:#14532d;">PRS</th>';
  for(var mi=0;mi<DB.months.length;mi++){
    var mon=DB.months[mi],mbg=DB.monthColors[mi];
    mRow.innerHTML+='<th class="cr-th cr-subj-hdr" colspan="'+(mon.days+2)+'" style="background:'+mbg+'">'+mon.name+'</th>';
    for(var d=1;d<=mon.days;d++) dRow.innerHTML+='<th class="cr-th att-day-hdr" style="background:'+mbg+'">'+d+'</th>';
    dRow.innerHTML+='<th class="cr-th att-sub-hdr" style="background:#374151;">ABS</th><th class="cr-th att-sub-hdr" style="background:#14532d;">PRS</th>';
  }
  var tbody=g("attBody");tbody.innerHTML="";
  var totalCols=2+2+DB.months.reduce(function(a,m){return a+m.days+2;},0);
  function makeAttRows(entries,genderLabel){
    tbody.innerHTML+='<tr><td colspan="'+totalCols+'" class="cr-gender-row '+(genderLabel==="female"?"cr-female-row":"")+'">'+(genderLabel==="male"?"👨 MALE":"👩 FEMALE")+"</td></tr>";
    for(var i=0;i<entries.length;i++){
      var entry=entries[i],name=entry.name;
      var ak=genderLabel+"-"+i;if(!attStore[key][ak])attStore[key][ak]={};
      var alt=(i%2!==0)?"cr-alt":"";
      // Grade level badge
      var glBadge="";
      if(entry.isRegistered&&entry.strand){
        var gl=getGradeLevelShort(entry.strand),sn=getStrandName(entry.strand);
        var isG11=entry.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
        glBadge='<span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span>'+
                '<span class="strand-mini">'+sn+'</span>';
      }
      var html='<tr class="cr-row '+alt+'"><td class="cr-td cr-sticky cr-num-col cr-num-td">'+(i+1)+'</td>'+
        '<td class="cr-td cr-sticky cr-name-col cr-name-td"><div class="student-name-wrap">'+name+glBadge+'</div></td>'+
        '<td class="cr-td att-total-cell" id="att-yabs-'+key+"-"+ak+'">—</td><td class="cr-td att-total-cell" id="att-yprs-'+key+"-"+ak+'">—</td>';
      for(var mi=0;mi<DB.months.length;mi++){
        if(!attStore[key][ak][mi])attStore[key][ak][mi]={};var mon=DB.months[mi];
        for(var d=0;d<mon.days;d++){var val=attStore[key][ak][mi][d]||"";var cc=val==="A"?"att-a-cell":val==="P"?"att-p-cell":val==="L"?"att-l-cell":"";html+='<td class="cr-td att-day-cell"><input class="att-input '+cc+'" maxlength="1" value="'+val+'" data-key="'+key+'" data-ak="'+ak+'" data-mi="'+mi+'" data-day="'+d+'" oninput="handleAttInput(this)"></td>';}
        html+='<td class="cr-td att-count-cell" id="att-abs-'+key+"-"+ak+"-"+mi+'">—</td><td class="cr-td att-count-cell" id="att-prs-'+key+"-"+ak+"-"+mi+'">—</td>';
      }
      tbody.innerHTML+=html+"</tr>";
    }
  }
  makeAttRows(r.male,"male");makeAttRows(r.female,"female");
}
function handleAttInput(input){updateAtt(input.getAttribute("data-key"),input.getAttribute("data-ak"),parseInt(input.getAttribute("data-mi"),10),parseInt(input.getAttribute("data-day"),10),input);}
function updateAtt(key,ak,mi,day,input){
  var val=input.value.toUpperCase().replace(/[^PAL]/g,"");input.value=val;
  if(!attStore[key])attStore[key]={};if(!attStore[key][ak])attStore[key][ak]={};if(!attStore[key][ak][mi])attStore[key][ak][mi]={};
  attStore[key][ak][mi][day]=val;
  input.className="att-input"+(val==="A"?" att-a-cell":val==="P"?" att-p-cell":val==="L"?" att-l-cell":"");
  recomputeAtt(key,ak);saveGrades();
}
function recomputeAtt(key,ak){
  var data=(attStore[key]&&attStore[key][ak])?attStore[key][ak]:{},yAbs=0,yPrs=0;
  for(var mi=0;mi<DB.months.length;mi++){var md=data[mi]||{},abs=0,prs=0;for(var d=0;d<DB.months[mi].days;d++){var v=md[d]||"";if(v==="A")abs++;if(v==="P")prs++;}yAbs+=abs;yPrs+=prs;var ae=g("att-abs-"+key+"-"+ak+"-"+mi),pe=g("att-prs-"+key+"-"+ak+"-"+mi);if(ae){ae.textContent=abs||"—";ae.style.color=abs?"#ff9090":"var(--muted)";}if(pe){pe.textContent=prs||"—";pe.style.color=prs?"#5dde92":"var(--muted)";}}
  var ya=g("att-yabs-"+key+"-"+ak),yp=g("att-yprs-"+key+"-"+ak);
  if(ya){ya.textContent=yAbs||"—";ya.style.color=yAbs?"#ff9090":"var(--muted)";ya.style.fontWeight="800";}
  if(yp){yp.textContent=yPrs||"—";yp.style.color=yPrs?"#5dde92":"var(--muted)";yp.style.fontWeight="800";}
}

// ══════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════
function showToast(msg,type){
  var ex=g("mainToast");if(ex)ex.remove();
  var el=document.createElement("div");el.id="mainToast";
  var bg=type==="success"?"linear-gradient(135deg,#065f46,#14532d)":type==="warning"?"linear-gradient(135deg,#92400e,#78350f)":"linear-gradient(135deg,#7a0006,#3d0003)";
  var border=type==="success"?"rgba(46,204,113,.4)":type==="warning"?"rgba(212,160,23,.4)":"rgba(192,0,10,.4)";
  el.innerHTML=msg;
  el.style.cssText="position:fixed;bottom:24px;right:24px;z-index:9999;background:"+bg+";color:#fff;padding:13px 22px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.5);border:1px solid "+border+";animation:fadeIn .25s ease;max-width:380px;";
  document.body.appendChild(el);
  setTimeout(function(){if(el.parentNode){el.style.opacity="0";el.style.transition="opacity .4s";}},3000);
  setTimeout(function(){if(el.parentNode)el.remove();},3500);
}

// ══════════════════════════════════════════════════
// PROFILE MODAL
// ══════════════════════════════════════════════════
function computeAge(bdayStr){
  if(!bdayStr||bdayStr==="")return"—";
  var bday=new Date(bdayStr);if(isNaN(bday.getTime()))return"—";
  var today=new Date(),age=today.getFullYear()-bday.getFullYear(),m=today.getMonth()-bday.getMonth();
  if(m<0||(m===0&&today.getDate()<bday.getDate()))age--;return age+" years old";
}

function openProfileModal(){
  if(!currentUser)return;
  var isTeacher=(currentRole==="teacher");
  g("pmAvatar").textContent=isTeacher?"👩‍🏫":"🎓";
  g("pmName").textContent=currentUser.name||"—";
  g("pmRoleBadge").textContent=isTeacher?"Faculty":"Student";
  g("pmEmailDisplay").textContent=(currentUser.email||currentUser.emailUser)+"@asiasourceicollege.edu.ph";
  if(g("pmInfoStudentId"))g("pmInfoStudentId").textContent=currentUser.studentId||(isTeacher?"N/A":"—");
  if(g("pmInfoGender"))g("pmInfoGender").textContent=currentUser.gender||"—";
  if(g("pmInfoName"))g("pmInfoName").textContent=currentUser.name||"—";
  if(g("pmInfoBday"))g("pmInfoBday").textContent=currentUser.bday||"—";
  if(g("pmInfoEmail"))g("pmInfoEmail").textContent=(currentUser.email||currentUser.emailUser)+"@asiasourceicollege.edu.ph";
  if(g("pmInfoMobile"))g("pmInfoMobile").textContent=currentUser.mobile||"—";
  if(g("pmInfoAge"))g("pmInfoAge").textContent=computeAge(currentUser.bday);
  if(g("pmInfoAddress"))g("pmInfoAddress").textContent=currentUser.address||"—";
  if(g("pmInfoCity"))g("pmInfoCity").textContent=currentUser.city||"—";
  var strandItem=g("pmStrandItem");
  if(isTeacher){if(strandItem)strandItem.style.display="none";}
  else{if(strandItem)strandItem.style.display="";if(g("pmInfoStrand"))g("pmInfoStrand").textContent=DB.strandFull[currentUser.strand]||currentUser.strand||"—";}
  if(g("pmEditName"))g("pmEditName").value=currentUser.name||"";
  if(g("pmEditGender"))g("pmEditGender").value=currentUser.gender||"";
  if(g("pmEditMobile"))g("pmEditMobile").value=currentUser.mobile||"";
  if(g("pmEditAddress"))g("pmEditAddress").value=currentUser.address||"";
  if(g("pmEditCity"))g("pmEditCity").value=currentUser.city||"";
  var strandFg=g("pmEditStrandFg");
  if(isTeacher){if(strandFg)strandFg.style.display="none";}
  else{if(strandFg)strandFg.style.display="";if(g("pmEditStrand"))g("pmEditStrand").value=currentUser.strand||"";}
  hideAlert("pmInfoAlert");hideAlert("pmInfoSuccess");hideAlert("pmPassAlert");hideAlert("pmPassSuccess");
  g("pmCurrPass").value="";g("pmNewPass").value="";g("pmConfPass").value="";
  switchPmTab("info",g("pmTabInfo"));
  g("profileModal").classList.remove("hidden");document.body.style.overflow="hidden";
}
function closeProfileModal(){g("profileModal").classList.add("hidden");document.body.style.overflow="";}
function switchPmTab(tab,btn){
  var tabs=document.querySelectorAll(".pm-tab");for(var i=0;i<tabs.length;i++)tabs[i].className="pm-tab";
  btn.className="pm-tab active";
  g("pmPanelInfo").className="pm-panel hidden";g("pmPanelPass").className="pm-panel hidden";
  if(tab==="info")g("pmPanelInfo").className="pm-panel";else if(tab==="password")g("pmPanelPass").className="pm-panel";
}
function saveProfileInfo(){
  hideAlert("pmInfoAlert");hideAlert("pmInfoSuccess");
  var newName=g("pmEditName").value.trim(),newAddr=g("pmEditAddress").value.trim();
  var newGender=g("pmEditGender")?g("pmEditGender").value:"",newMobile=g("pmEditMobile")?g("pmEditMobile").value.trim():"",newCity=g("pmEditCity")?g("pmEditCity").value.trim():"";
  if(!newName){showAlert("pmInfoAlert","Please enter your full name.");return;}
  var isTeacher=(currentRole==="teacher"),list=isTeacher?DB.teachers:DB.students;
  for(var i=0;i<list.length;i++){
    if(list[i].id===currentUser.id){list[i].name=newName;list[i].address=newAddr;list[i].gender=newGender;list[i].mobile=newMobile;list[i].city=newCity;if(!isTeacher){var ns=g("pmEditStrand").value;if(ns)list[i].strand=ns;}currentUser=list[i];break;}
  }
  saveDB();
  if(g("pmName"))g("pmName").textContent=currentUser.name;if(g("pmInfoName"))g("pmInfoName").textContent=currentUser.name;
  if(g("pmInfoGender"))g("pmInfoGender").textContent=currentUser.gender||"—";if(g("pmInfoMobile"))g("pmInfoMobile").textContent=currentUser.mobile||"—";
  if(g("pmInfoAddress"))g("pmInfoAddress").textContent=currentUser.address||"—";if(g("pmInfoCity"))g("pmInfoCity").textContent=currentUser.city||"—";
  if(!isTeacher&&g("pmInfoStrand"))g("pmInfoStrand").textContent=DB.strandFull[currentUser.strand]||currentUser.strand||"—";
  if(isTeacher){if(g("tchProfileName"))g("tchProfileName").textContent=currentUser.name;if(g("tchName"))g("tchName").textContent=currentUser.name;}
  else{if(g("stuProfileName"))g("stuProfileName").textContent=currentUser.name;if(g("stuName"))g("stuName").textContent=currentUser.name;if(g("stuProfileStrand"))g("stuProfileStrand").textContent=DB.strandFull[currentUser.strand]||currentUser.strand;loadStudentDash(currentUser);}
  showAlert("pmInfoSuccess","✅ Profile saved successfully!","success");showToast("✅ Profile updated!","success");
}
function saveNewPassword(){
  hideAlert("pmPassAlert");hideAlert("pmPassSuccess");
  var curr=g("pmCurrPass").value.trim(),nw=g("pmNewPass").value.trim(),conf=g("pmConfPass").value.trim();
  if(!curr||!nw||!conf){showAlert("pmPassAlert","Please fill in all password fields.");return;}
  if(curr!==currentUser.pass){showAlert("pmPassAlert","❌ Current password is incorrect.");return;}
  if(nw.length<4){showAlert("pmPassAlert","New password must be at least 4 characters.");return;}
  if(nw!==conf){showAlert("pmPassAlert","❌ New passwords do not match.");return;}
  var isTeacher=(currentRole==="teacher"),list=isTeacher?DB.teachers:DB.students;
  for(var i=0;i<list.length;i++){if(list[i].id===currentUser.id){list[i].pass=nw;currentUser=list[i];break;}}
  saveDB();
  g("pmCurrPass").value="";g("pmNewPass").value="";g("pmConfPass").value="";
  showAlert("pmPassSuccess","✅ Password changed! Use your new password next login.","success");showToast("🔐 Password reset successful!","success");
}

document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){closeSubjectModal();closeProfileModal();closeTcModal();closeAddSubjectModal();closeAddStudentModal();var np=g("teacherNotifPanel");if(np&&!np.classList.contains("hidden"))np.classList.add("hidden");}
});

// ══════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════
(function init(){
  setRole("student");setSuRole("student");
  var container=document.getElementById("particles");
  if(container){
    var colors=["#ffb800","#e8000f","#ff6090","#ffffff"];
    for(var i=0;i<40;i++){var p=document.createElement("div");p.className="particle";p.style.cssText=["left:"+(Math.random()*100)+"%","width:"+(Math.random()*3+1)+"px","height:"+(Math.random()*3+1)+"px","background:"+colors[Math.floor(Math.random()*colors.length)],"animation-duration:"+(Math.random()*15+8)+"s","animation-delay:"+(Math.random()*15)+"s","opacity:0"].join(";");container.appendChild(p);}
  }
  document.addEventListener("mousemove",function(e){
    var card=document.querySelector(".lp-card");if(!card)return;
    var rect=card.getBoundingClientRect();if(rect.width===0)return;
    var cx=rect.left+rect.width/2,cy=rect.top+rect.height/2,dx=(e.clientX-cx)/rect.width,dy=(e.clientY-cy)/rect.height,dist=Math.sqrt(dx*dx+dy*dy);
    if(dist<1.5){card.style.transform="rotateY("+(dx*7)+"deg) rotateX("+(-dy*4)+"deg) translateZ(8px)";card.style.transition="transform 0.1s ease";}
    else{card.style.transform="";card.style.transition="transform 0.5s ease";}
  });
  var statCards=document.querySelectorAll(".lp-stat");statCards.forEach(function(el,i){el.style.opacity="0";el.style.transform="translateY(12px)";setTimeout(function(){el.style.transition="opacity 0.4s ease, transform 0.4s ease";el.style.opacity="1";el.style.transform="translateY(0)";},300+i*100);});
  var mottoWrap=document.querySelector(".lp-motto-wrap");
  if(mottoWrap){mottoWrap.style.opacity="0";mottoWrap.style.transform="translateY(20px)";setTimeout(function(){mottoWrap.style.transition="opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)";mottoWrap.style.opacity="1";mottoWrap.style.transform="translateY(0)";},400);}
  var bottomDeco=document.querySelector(".lp-bottom-deco");
  if(bottomDeco){bottomDeco.style.opacity="0";setTimeout(function(){bottomDeco.style.transition="opacity 1s ease";bottomDeco.style.opacity="1";},900);}
  (function initLoginCanvas(){
    var canvas=document.getElementById("loginBgCanvas");if(!canvas)return;
    var ctx=canvas.getContext("2d"),W,H,nodes=[],mouse={x:-999,y:-999};
    function resize(){W=canvas.width=canvas.offsetWidth;H=canvas.height=canvas.offsetHeight;}resize();
    window.addEventListener("resize",function(){resize();spawnNodes();});
    canvas.parentElement.addEventListener("mousemove",function(e){var rect=canvas.getBoundingClientRect();mouse.x=e.clientX-rect.left;mouse.y=e.clientY-rect.top;});
    function spawnNodes(){nodes=[];var count=Math.max(30,Math.floor(W*H/11000));for(var i=0;i<count;i++){nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.8+.6,baseOpacity:Math.random()*.5+.25,pulse:Math.random()*Math.PI*2});}}spawnNodes();
    var tick=0;
    function draw(){
      ctx.clearRect(0,0,W,H);
      var bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,"#080210");bg.addColorStop(.5,"#0d0115");bg.addColorStop(1,"#050008");ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
      var blobs=[{x:W*.12,y:H*.18,r:W*.5,c:"rgba(180,0,20,0.07)"},{x:W*.88,y:H*.85,r:W*.45,c:"rgba(120,0,200,0.05)"},{x:W*.5,y:H*.5,r:W*.4,c:"rgba(232,0,15,0.04)"},{x:W*.75,y:H*.2,r:W*.3,c:"rgba(255,184,0,0.03)"}];
      blobs.forEach(function(b){var g2=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);g2.addColorStop(0,b.c);g2.addColorStop(1,"transparent");ctx.fillStyle=g2;ctx.fillRect(0,0,W,H);});
      ctx.strokeStyle="rgba(232,0,15,0.035)";ctx.lineWidth=.8;var gs=52;
      for(var x=0;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
      for(var y=0;y<H;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
      ctx.strokeStyle="rgba(255,184,0,0.025)";ctx.lineWidth=1;
      for(var k=-8;k<16;k++){ctx.beginPath();ctx.moveTo(k*(W/7)-H,0);ctx.lineTo(k*(W/7),H);ctx.stroke();}
      tick+=.008;
      nodes.forEach(function(n){n.x+=n.vx;n.y+=n.vy;n.pulse+=.02;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;var mx=mouse.x-n.x,my=mouse.y-n.y,md=Math.sqrt(mx*mx+my*my);if(md<120&&md>0){n.x+=mx/md*.3;n.y+=my/md*.3;}var op=n.baseOpacity*(.7+.3*Math.sin(n.pulse));ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fillStyle="rgba(232,0,15,"+op+")";ctx.fill();});
      var maxDist=140;
      for(var i=0;i<nodes.length;i++){for(var j=i+1;j<nodes.length;j++){var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<maxDist){var alpha=(1-dist/maxDist)*.22,nmx=(nodes[i].x+nodes[j].x)/2-mouse.x,nmy=(nodes[i].y+nodes[j].y)/2-mouse.y,nearMouse=Math.sqrt(nmx*nmx+nmy*nmy)<100;ctx.strokeStyle=nearMouse?"rgba(255,184,0,"+(alpha*1.8)+")":"rgba(200,0,20,"+alpha+")";ctx.lineWidth=nearMouse?1.2:.7;ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}}}
      var pulse=(Math.sin(tick*2)+1)/2,ringR=80+pulse*40;ctx.strokeStyle="rgba(232,0,15,"+(0.06+pulse*0.06)+")";ctx.lineWidth=1;ctx.beginPath();ctx.arc(W,0,ringR,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(W,0,ringR*.6,0,Math.PI*2);ctx.stroke();ctx.strokeStyle="rgba(255,184,0,"+(0.04+pulse*0.04)+")";ctx.beginPath();ctx.arc(0,H,ringR*1.2,0,Math.PI*2);ctx.stroke();
      requestAnimationFrame(draw);
    }draw();
  })();
})();

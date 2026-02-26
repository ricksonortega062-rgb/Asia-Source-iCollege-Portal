// Asia Source iCollege — Portal Script (with Configurable Max Scores)
var LS_KEY="asiasource_db_v5",LS_GRADES="asiasource_grades_v5",LS_NOTIFS="asiasource_notifs_v5",LS_INVITES="asiasource_invites_v5";
var LS_SCORE_SETTINGS="asiasource_score_settings_v1";
var LS_TCH_SUBJECTS="asiasource_tch_subjects_v1";

// ══ FULL SUBJECT CATALOG (Senior High School) ══
var ALL_SHS_SUBJECTS = {
  "Core Subjects": [
    "21st Century Literature from the Philippines and the World",
    "Contemporary Philippine Arts from the Regions",
    "Disaster Readiness and Risk Reduction",
    "Earth and Life Science",
    "Earth Science",
    "General Mathematics",
    "Introduction to Philosophy of the Human Person",
    "Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino",
    "Media and Information Literacy",
    "Oral Communication in Context",
    "Pagbasa at Pagsusuri ng Iba't ibang Teksto Tungo sa Pananaliksik",
    "Personal Development",
    "Physical Education and Health (Grade 11)",
    "Physical Education and Health (Grade 12)",
    "Physical Science",
    "Reading and Writing Skills",
    "Statistics and Probability",
    "Understanding Culture, Society and Politics"
  ],
  "Applied Subjects": [
    "Empowerment Technologies",
    "English for Academic and Professional Purposes",
    "Entrepreneurship",
    "Filipino sa Piling Larang (Akademik)",
    "Filipino sa Piling Larang (Isports)",
    "Filipino sa Piling Larang (Sining at Disenyo)",
    "Filipino sa Piling Larang (Teknikal-Bokasyunal)",
    "Inquiries, Investigations and Immersion",
    "Practical Research 1",
    "Practical Research 2"
  ],
  "Specialized — ABM": [
    "Applied Economics",
    "Bus. Ethics and Social Responsibility",
    "Bus. Finance",
    "Bus. Math",
    "Fund. of Accountancy, Bus, and Mgt 1",
    "Fund. of Accountancy, Bus, and Mgt 2",
    "Organization and Management",
    "Principles of Marketing"
  ],
  "Specialized — HUMSS": [
    "Community Engagement, Solidarity and Citizenship",
    "Creative Nonfiction",
    "Creative Writing",
    "Culminating Activity",
    "Disciplines and Ideas in the Applied Social Sciences",
    "Disciplines and Ideas in the Social Sciences",
    "Introduction of World Religions and Belief System",
    "Malikhaing Pagsulat",
    "Philippines Politics and Governance",
    "Trend, Networks, and Critical Thinking in the 21st Century"
  ],
  "Specialized — STEM": [
    "Basic Calculus",
    "Biology 1",
    "Biology 2",
    "General Chemistry 1",
    "General Chemistry 2",
    "General Physics 1",
    "General Physics 2",
    "Pre-Calculus"
  ],
  "Specialized — TVL": [
    "Net Programming 1",
    "Net Programming 2",
    "Bread and Pastry Production",
    "Cookery 11",
    "Cookery 12",
    "Food and Beverage Services"
  ]
};
var TCH_SUBJ_COLORS=["#e8000f","#0ea5e9","#f59e0b","#10b981","#8b5cf6","#f97316","#ec4899","#06b6d4","#14b8a6","#6366f1","#84cc16","#a855f7","#ef4444","#3b82f6","#eab308","#22c55e","#b45309","#1e40af","#166534","#9d174d"];

// ── Teacher subject helpers ──
function getTchSubjectsKey(tchId){ return LS_TCH_SUBJECTS+"_"+tchId; }
function loadTchSubjects(tchId){
  try{ var r=localStorage.getItem(getTchSubjectsKey(tchId)); if(r)return JSON.parse(r); }catch(e){}
  return [];
}
function saveTchSubjects(tchId,list){
  try{ localStorage.setItem(getTchSubjectsKey(tchId),JSON.stringify(list)); }catch(e){}
}
function addTchSubject(tchId,subjectName){
  var list=loadTchSubjects(tchId);
  if(list.indexOf(subjectName)<0){list.push(subjectName);saveTchSubjects(tchId,list);}
}
function removeTchSubject(tchId,subjectName){
  var list=loadTchSubjects(tchId).filter(function(s){return s!==subjectName;});
  saveTchSubjects(tchId,list);
}
function getTchSubjectColor(tchId,subjectName){
  var list=loadTchSubjects(tchId);
  var idx=list.indexOf(subjectName);
  return TCH_SUBJ_COLORS[idx%TCH_SUBJ_COLORS.length]||"#e8000f";
}

// ══ SCORE SETTINGS ══
var DEFAULT_SCORE_SETTINGS = {
  quiz1: 20, quiz2: 20, quiz3: 20,
  act1: 20, act2: 20, act3: 20,
  proj1: 50, proj2: 50,
  exam: 100,
  weight_quiz: 25,
  weight_activity: 25,
  weight_project: 25,
  weight_exam: 25
};
var scoreSettings = JSON.parse(JSON.stringify(DEFAULT_SCORE_SETTINGS));

function loadScoreSettings() {
  try {
    var r = localStorage.getItem(LS_SCORE_SETTINGS);
    if (r) {
      var d = JSON.parse(r);
      for (var k in DEFAULT_SCORE_SETTINGS) {
        if (d[k] !== undefined && !isNaN(Number(d[k])) && Number(d[k]) > 0) {
          scoreSettings[k] = Number(d[k]);
        }
      }
    }
  } catch(e) {}
}
function saveScoreSettings() {
  try { localStorage.setItem(LS_SCORE_SETTINGS, JSON.stringify(scoreSettings)); } catch(e) {}
}
loadScoreSettings();

var SCORE_COMPONENT_DEFS = [
  {key:"quiz1", label:"Quiz 1", group:"quiz", icon:"✏️"},
  {key:"quiz2", label:"Quiz 2", group:"quiz", icon:"✏️"},
  {key:"quiz3", label:"Quiz 3", group:"quiz", icon:"✏️"},
  {key:"act1",  label:"Activity 1", group:"activity", icon:"🎯"},
  {key:"act2",  label:"Activity 2", group:"activity", icon:"🎯"},
  {key:"act3",  label:"Activity 3", group:"activity", icon:"🎯"},
  {key:"proj1", label:"Project 1", group:"project", icon:"📁"},
  {key:"proj2", label:"Project 2", group:"project", icon:"📁"},
  {key:"exam",  label:"Exam", group:"exam", icon:"📝"}
];
var GROUP_COLORS={quiz:"#0ea5e9",activity:"#10b981",project:"#f59e0b",exam:"#e8000f"};
var GROUP_LABELS={quiz:"📝 Quizzes",activity:"🎯 Activities",project:"📁 Projects",exam:"📄 Exam"};
var Q_LABELS={q1:"Quarter 1",q2:"Quarter 2",q3:"Quarter 3",q4:"Quarter 4"};

function getMax(key) { return scoreSettings[key] || DEFAULT_SCORE_SETTINGS[key] || 20; }
function getWeight(group) { return scoreSettings['weight_' + group] || DEFAULT_SCORE_SETTINGS['weight_' + group] || 25; }

function loadDB(){try{var r=localStorage.getItem(LS_KEY);if(r){var p=JSON.parse(r);if(p&&Array.isArray(p.students)&&Array.isArray(p.teachers))return p;}}catch(e){}return null;}
function saveDB(){try{localStorage.setItem(LS_KEY,JSON.stringify(DB));}catch(e){}}
function saveGrades(){try{localStorage.setItem(LS_GRADES,JSON.stringify({scoreStore:scoreStore,crStore:crStore,attStore:attStore,rosterGrades:rosterGrades}));}catch(e){}}
function loadGrades(){try{var r=localStorage.getItem(LS_GRADES);if(r){var d=JSON.parse(r);scoreStore=d.scoreStore||{};crStore=d.crStore||{};attStore=d.attStore||{};rosterGrades=d.rosterGrades||{};}}catch(e){}}

// ══ INVITE / NOTIFICATION HELPERS (Fixed) ══
function loadNotifs(){try{var r=localStorage.getItem(LS_NOTIFS);return r?JSON.parse(r):{};}catch(e){return{};}}
function saveNotifs(n){try{localStorage.setItem(LS_NOTIFS,JSON.stringify(n));}catch(e){}}

function loadInvites(){try{var r=localStorage.getItem(LS_INVITES);return r?JSON.parse(r):[];}catch(e){return[];}}
function saveInvites(inv){try{localStorage.setItem(LS_INVITES,JSON.stringify(inv));}catch(e){}}

// FIX: Strictly filter by status — no stale data
function getApprovedSubjects(studentId){
  return loadInvites().filter(function(inv){
    return inv.studentId===studentId && inv.status==="approved";
  });
}
function getPendingSubjects(studentId){
  return loadInvites().filter(function(inv){
    return inv.studentId===studentId && inv.status==="pending";
  });
}

var DEFAULT_DB={
  students:[{
    id:"STU-001",emailUser:"juan.delacruz",pass:"2008-03-15",
    name:"Juan dela Cruz",email:"juan.delacruz",strand:"G11-STEM-A",bday:"2008-03-15",gender:"Male",
    studentId:"24-0561",mobile:"09XX-XXX-XXXX",address:"",city:"",
    grades:{},
    scores:{ww:25,pt:24,qe:36,act:18},
    approvedSubjects:[]
  }],
  teachers:[{id:"TCH-001",emailUser:"ana.santos",pass:"1985-06-12",name:"Ms. Ana Santos",email:"ana.santos",bday:"1985-06-12",address:""}],
  classRoster:{
    "HUMSS-A":{male:["Jose Santos","Pedro Cruz","Carlos Dela Rosa","Rico Villanueva","Mark Ramos"],female:["Maria Reyes","Ana Gomez","Liza Bautista","Jenny Manalo","Donna Ilagan"]},
    "HUMSS-B":{male:["Luis Torres","Mark Castillo","Dante Ramos","Ivan Morales","Ryan Abad"],female:["Sofia Mendoza","Grace Aquino","Rowena Pascual","Pia Salazar","Carla Basco"]},
    "STEM-A":{male:["Juan dela Cruz","Mikael Lim","Jayson Tan","Paolo Sy","Ben Cruz"],female:["Carla Navarro","Tricia Ong","Rina Chua","Angela Go","Kris Santos"]},
    "STEM-B":{male:["Ryan Soriano","JM Santos","Paul Cruz","Ken Dela Rosa","Leo Torres"],female:["Beth Reyes","Len Gomez","Mia Bautista","Ara Manalo","Nina Aquino"]},
    "HE-HO-A":{male:["Jojo Mendoza","Dodong Aquino","Totoy Salazar","Bong Cruz","Kuya Santos"],female:["Leni Villanueva","Tess Torres","Marites Castillo","Baby Pascual","Nene Ramos"]},
    "HE-HO-B":{male:["Danny Navarro","Ronnie Ong","Edwin Chua","Boy Go","Jun Dela Rosa"],female:["Susan Morales","Cathy Lim","Vicky Tan","Luz Sy","Nora Cruz"]},
    "ICT-A":{male:["Alex Soriano","Sam Santos","Max Cruz","Jay Manalo","Lex Torres"],female:["Kim Reyes","Ash Gomez","Sky Bautista","Dee Dela Rosa","Pat Aquino"]},
    "ABM-A":{male:["Renz Navarro","Franz Ong","Lance Chua","Ace Go","Rey Dela Rosa"],female:["Jasmine Morales","Bea Lim","Jia Tan","Vida Sy","Gem Cruz"]},
    "G11-HUMSS-A":{male:["Jose Santos","Pedro Cruz","Carlos Dela Rosa","Rico Villanueva","Mark Ramos"],female:["Maria Reyes","Ana Gomez","Liza Bautista","Jenny Manalo","Donna Ilagan"]},
    "G11-HUMSS-B":{male:["Luis Torres","Mark Castillo","Dante Ramos","Ivan Morales","Ryan Abad"],female:["Sofia Mendoza","Grace Aquino","Rowena Pascual","Pia Salazar","Carla Basco"]},
    "G11-STEM-A":{male:["Juan dela Cruz","Mikael Lim","Jayson Tan","Paolo Sy","Ben Cruz"],female:["Carla Navarro","Tricia Ong","Rina Chua","Angela Go","Kris Santos"]},
    "G11-STEM-B":{male:["Ryan Soriano","JM Santos","Paul Cruz","Ken Dela Rosa","Leo Torres"],female:["Beth Reyes","Len Gomez","Mia Bautista","Ara Manalo","Nina Aquino"]},
    "G11-HE-HO-A":{male:["Jojo Mendoza","Dodong Aquino","Totoy Salazar","Bong Cruz","Kuya Santos"],female:["Leni Villanueva","Tess Torres","Marites Castillo","Baby Pascual","Nene Ramos"]},
    "G11-HE-HO-B":{male:["Danny Navarro","Ronnie Ong","Edwin Chua","Boy Go","Jun Dela Rosa"],female:["Susan Morales","Cathy Lim","Vicky Tan","Luz Sy","Nora Cruz"]},
    "G11-ICT-A":{male:["Alex Soriano","Sam Santos","Max Cruz","Jay Manalo","Lex Torres"],female:["Kim Reyes","Ash Gomez","Sky Bautista","Dee Dela Rosa","Pat Aquino"]},
    "G11-ABM-A":{male:["Renz Navarro","Franz Ong","Lance Chua","Ace Go","Rey Dela Rosa"],female:["Jasmine Morales","Bea Lim","Jia Tan","Vida Sy","Gem Cruz"]},
    "G12-HUMSS-A":{male:["Jose Santos Jr.","Pedro Cruz Jr.","Carlos Dela Rosa Jr.","Rico Villanueva Jr.","Mark Ramos Jr."],female:["Maria Reyes Jr.","Ana Gomez Jr.","Liza Bautista Jr.","Jenny Manalo Jr.","Donna Ilagan Jr."]},
    "G12-HUMSS-B":{male:["Luis Torres Jr.","Mark Castillo Jr.","Dante Ramos Jr.","Ivan Morales Jr.","Ryan Abad Jr."],female:["Sofia Mendoza Jr.","Grace Aquino Jr.","Rowena Pascual Jr.","Pia Salazar Jr.","Carla Basco Jr."]},
    "G12-STEM-A":{male:["Ryan Soriano Jr.","JM Santos Jr.","Paul Cruz Jr.","Ken Dela Rosa Jr.","Leo Torres Jr."],female:["Beth Reyes Jr.","Len Gomez Jr.","Mia Bautista Jr.","Ara Manalo Jr.","Nina Aquino Jr."]},
    "G12-STEM-B":{male:["Alex Soriano Jr.","Sam Santos Jr.","Max Cruz Jr.","Jay Manalo Jr.","Lex Torres Jr."],female:["Kim Reyes Jr.","Ash Gomez Jr.","Sky Bautista Jr.","Dee Dela Rosa Jr.","Pat Aquino Jr."]},
    "G12-HE-HO-A":{male:["Renz Navarro Jr.","Franz Ong Jr.","Lance Chua Jr.","Ace Go Jr.","Rey Dela Rosa Jr."],female:["Jasmine Morales Jr.","Bea Lim Jr.","Jia Tan Jr.","Vida Sy Jr.","Gem Cruz Jr."]},
    "G12-HE-HO-B":{male:["Danny Navarro Jr.","Ronnie Ong Jr.","Edwin Chua Jr.","Boy Go Jr.","Jun Dela Rosa Jr."],female:["Susan Morales Jr.","Cathy Lim Jr.","Vicky Tan Jr.","Luz Sy Jr.","Nora Cruz Jr."]},
    "G12-ICT-A":{
      male:["Balais, Jefferson","Bangayan, Cedric","Bechayda, Kirk Sean","Caamic, Clyde","Catalan, Tony Rey","Catbagan, Jhanie Kal-El","Cabiles, Mark Lawrence","Cagoyong, Jhonn","De Roy, Mark Laurence","Domalaza, Kaizen Red","Granada, James Benedict","Hernandez, John Lloyd","Lumapinit, Norshad","Mamasaranao, Fahad","Maquinto, Arman Jay","Pateña, Lance","Valdez, Kent Anthony","Alviz, Carl Erielle","Linang, Alvin","Loro, Juan Gabriel","Marquez, John Nornel","Vasquez, Rheyven","Velasquez, Kier"],
      female:["Amante, Trisha","Bañares, Chrislyn","Cabalquinto, Bhea Janina","Cayetano, Jennika","Dela Cruz, Shane Azley","Espiña, Maria Erissa","Mendoza, Jezreel Eve","Merico, Angelica","Ortaliz, Margaret Joyce","Pagaran, Margarette","Saldivar, Ma. Ronisa","Nepomuceno, Alanis Kate"]
    },
    "G12-ABM-A":{male:["Renz Navarro Jr.","Franz Ong Jr.","Lance Chua Jr.","Ace Go Jr.","Rey Dela Rosa Jr."],female:["Jasmine Morales Jr.","Bea Lim Jr.","Jia Tan Jr.","Vida Sy Jr.","Gem Cruz Jr."]}
  },
  subjects:[],
  crSubjects:[],
  crColors:[],
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

function getSubjectsForFolder(strand,grade){ return DB.subjects; }
function getCrSubjectsForFolder(strand,grade){
  if(currentUser&&currentRole==="teacher")return loadTchSubjects(currentUser.id);
  return DB.crSubjects;
}
function getCrColorsForFolder(strand,grade){
  if(currentUser&&currentRole==="teacher"){
    var list=loadTchSubjects(currentUser.id);
    return list.map(function(s,i){return TCH_SUBJ_COLORS[i%TCH_SUBJ_COLORS.length];});
  }
  return DB.crColors;
}

var _savedDB=loadDB();
var DB=JSON.parse(JSON.stringify(DEFAULT_DB));
if(_savedDB&&Array.isArray(_savedDB.students)&&Array.isArray(_savedDB.teachers)){
  DB.students=_savedDB.students;DB.teachers=_savedDB.teachers;
  if(_savedDB.classRoster){for(var _rk in _savedDB.classRoster)DB.classRoster[_rk]=_savedDB.classRoster[_rk];}
  DB.classRoster["G12-ICT-A"]=JSON.parse(JSON.stringify(DEFAULT_DB.classRoster["G12-ICT-A"]));
}
var _hasSeedStu=false;
for(var _i=0;_i<DB.students.length;_i++)if(DB.students[_i].id==="STU-001"){_hasSeedStu=true;break;}
if(!_hasSeedStu)DB.students.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.students[0])));
var _hasSeedTch=false;
for(var _j=0;_j<DB.teachers.length;_j++)if(DB.teachers[_j].id==="TCH-001"){_hasSeedTch=true;break;}
if(!_hasSeedTch)DB.teachers.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.teachers[0])));
for(var _si=0;_si<DB.students.length;_si++){
  if(!DB.students[_si].grades)DB.students[_si].grades={};
  for(var _subj=0;_subj<DEFAULT_DB.crSubjects.length;_subj++){
    var _sn=DEFAULT_DB.crSubjects[_subj];
    if(!DB.students[_si].grades[_sn])DB.students[_si].grades[_sn]={q1:"",q2:"",q3:"",q4:""};
  }
}
saveDB();

var scoreStore={},crStore={},attStore={},rosterGrades={};
loadGrades();

var currentUser=null,currentRole="student";
var currentFolder="HUMSS",currentSection="A",currentGradeLevel="G11";
var currentView="gradebook",currentQuarter="q1",currentSubject=null,currentGbSubject=null;
var gbSearchQuery="",suRole="student",isDark=true,currentSemFilter=0;
var _tcScrolledToBottom=false,_tcAccepted=false;

function g(id){return document.getElementById(id);}
function showEl(id){var e=g(id);if(e)e.classList.remove("hidden");}
function hideEl(id){var e=g(id);if(e)e.classList.add("hidden");}
function showAlert(id,msg,type){var e=g(id);if(!e)return;e.textContent=msg;e.className="alert "+(type||"error");}
function hideAlert(id){var e=g(id);if(e)e.className="alert hidden";}

function toggleDark(){
  if(g("loginPage")&&!g("loginPage").classList.contains("hidden"))return;
  isDark=!isDark;
  document.documentElement.setAttribute("data-theme",isDark?"dark":"light");
  var icon=isDark?"🌙":"☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id){var e=g(id);if(e)e.textContent=icon;});
  try{localStorage.setItem("asiasource_dark",isDark?"1":"0");}catch(e){}
}
function applyLoginDark(){document.documentElement.setAttribute("data-theme","dark");isDark=true;}
function applyUserTheme(){
  try{var saved=localStorage.getItem("asiasource_dark");if(saved!==null)isDark=saved==="1";}catch(e){}
  document.documentElement.setAttribute("data-theme",isDark?"dark":"light");
  var icon=isDark?"🌙":"☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id){var e=g(id);if(e)e.textContent=icon;});
}

// ══ goHome — refreshes dashboard if logged in ══
function goHome() {
  if (currentUser) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (currentRole === 'student') {
      loadStudentDash(currentUser);
    } else {
      loadTeacherDash(currentUser);
    }
    return;
  }
  var stuDash = document.getElementById('studentDash');
  var tchDash = document.getElementById('teacherDash');
  var loginPage = document.getElementById('loginPage');
  if (stuDash) stuDash.classList.add('hidden');
  if (tchDash) tchDash.classList.add('hidden');
  if (loginPage) loginPage.classList.remove('hidden');
  if (typeof applyLoginDark === 'function') applyLoginDark();
}

function switchAuth(tab){
  if(tab==="login"){
    g("tabLogin").className="auth-tab active";g("tabSignup").className="auth-tab";
    showEl("authLogin");hideEl("authSignup");
  }else{
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
      for(var i2=0;i2<DB.students.length;i2++)if(DB.students[i2].emailUser===eu){emailExists=true;break;}
      showAlert("alertBox",emailExists?"Wrong password. Use your birthday: YYYY-MM-DD":"Email not found. Check spelling or sign up first.");return;
    }
    currentUser=stu;hideEl("loginPage");applyUserTheme();loadStudentDash(stu);showEl("studentDash");startStudentPolling();
  }else{
    var tch=null;
    for(var j=0;j<DB.teachers.length;j++){if(DB.teachers[j].emailUser===eu&&DB.teachers[j].pass===pw){tch=DB.teachers[j];break;}}
    if(!tch){
      var tchEmailExists=false;
      for(var j2=0;j2<DB.teachers.length;j2++)if(DB.teachers[j2].emailUser===eu){tchEmailExists=true;break;}
      showAlert("alertBox",tchEmailExists?"Wrong password. Use your birthday: YYYY-MM-DD":"Teacher email not found. Check spelling or sign up first.");return;
    }
    currentUser=tch;hideEl("loginPage");applyUserTheme();loadTeacherDash(tch);showEl("teacherDash");
  }
}
function logout(){
  stopStudentPolling();
  hideEl("studentDash");hideEl("teacherDash");showEl("loginPage");
  currentUser=null;g("userId").value="";g("password").value="";
  applyLoginDark();
}

function handleSignUp(e){
  e.preventDefault();
  hideAlert("suAlert");hideAlert("suSuccess");
  if(!_tcAccepted){showAlert("suAlert","Please read and accept the Terms & Conditions first.");openTcModal();return;}
  var name=g("suName").value.trim(),eu=g("suEmail").value.trim().toLowerCase(),bday=g("suBirthday").value;
  if(!name){showAlert("suAlert","Please enter your full name.");return;}
  if(!eu){showAlert("suAlert","Please enter your email username.");return;}
  if(!bday){showAlert("suAlert","Please pick your birthday using the date picker.");return;}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(bday)){showAlert("suAlert","Birthday must be in YYYY-MM-DD format.");return;}
  var allUsers=DB.students.concat(DB.teachers);
  for(var i=0;i<allUsers.length;i++){if(allUsers[i].emailUser===eu){showAlert("suAlert","Email username already exists. Please choose a different one.");return;}}
  var yr=new Date().getFullYear(),defaultGrades={};
  for(var s=0;s<DEFAULT_DB.crSubjects.length;s++)defaultGrades[DEFAULT_DB.crSubjects[s]]={q1:"",q2:"",q3:"",q4:""};
  if(suRole==="student"){
    var strand=g("suStrand").value;
    if(!strand){showAlert("suAlert","Please select your strand and section.");return;}
    var idNum=String(DB.students.length+1).padStart(4,"0");
    DB.students.push({id:"STU-"+Date.now(),emailUser:eu,pass:bday,name:name,email:eu,strand:strand,bday:bday,gender:"",mobile:"",address:"",city:"",studentId:yr+"-"+idNum,grades:defaultGrades,scores:{ww:"",pt:"",qe:"",act:""},approvedSubjects:[],pendingSubjects:[]});
  }else{
    DB.teachers.push({id:"TCH-"+Date.now(),emailUser:eu,pass:bday,name:name,email:eu,bday:bday,address:"",gender:"",mobile:"",city:""});
  }
  saveDB();
  _tcAccepted=false;
  var tcChk=g("suTcCheck");if(tcChk)tcChk.checked=false;
  var suBtn=g("suSubmitBtn");if(suBtn){suBtn.disabled=true;suBtn.style.opacity="0.45";suBtn.style.cursor="not-allowed";}
  var roleLabel=suRole==="student"?"Student":"Teacher";
  showAlert("suSuccess","✅ "+roleLabel+" account created! You can now log in.\nEmail: "+eu+"@asiasourceicollege.edu.ph\nPassword (your birthday): "+bday,"success");
  document.querySelector("#authSignup form").reset();
  setTimeout(function(){switchAuth("login");hideAlert("suSuccess");},3500);
}

function avgGrade(q1,q2,q3,q4){
  var args=Array.prototype.slice.call(arguments);
  var filled=args.filter(function(v){return v!==""&&v!==null&&v!==undefined&&!isNaN(Number(v))&&Number(v)>0;});
  if(!filled.length)return null;
  return Math.round(filled.reduce(function(a,b){return a+Number(b);},0)/filled.length);
}

// ══ GRADE COMPUTATION with dynamic weights ══
function computeDetailedGrade(sc) {
  function numArr(vals) {
    return vals.filter(function(v) {
      return v !== '' && v !== null && v !== undefined && !isNaN(Number(v));
    }).map(Number);
  }
  var qArr = numArr([sc.quiz1, sc.quiz2, sc.quiz3]);
  var aArr = numArr([sc.act1, sc.act2, sc.act3]);
  var pArr = numArr([sc.proj1, sc.proj2]);
  var eArr = numArr([sc.exam]);
  if (!qArr.length && !aArr.length && !pArr.length && !eArr.length) return null;

  function weightedAvgPct(vals, keys) {
    if (!vals.length) return null;
    var sum = 0;
    for (var i = 0; i < vals.length; i++) {
      var mx = getMax(keys[i]);
      sum += (vals[i] / mx) * 100;
    }
    return sum / vals.length;
  }

  var wQ  = getWeight('quiz')     / 100;
  var wA  = getWeight('activity') / 100;
  var wP  = getWeight('project')  / 100;
  var wE  = getWeight('exam')     / 100;

  var parts = [], totalW = 0;
  if (qArr.length) { parts.push(weightedAvgPct(qArr, ["quiz1","quiz2","quiz3"].slice(0, qArr.length)) * wQ); totalW += wQ; }
  if (aArr.length) { parts.push(weightedAvgPct(aArr, ["act1","act2","act3"].slice(0,  aArr.length)) * wA); totalW += wA; }
  if (pArr.length) { parts.push(weightedAvgPct(pArr, ["proj1","proj2"].slice(0,       pArr.length)) * wP); totalW += wP; }
  if (eArr.length) { parts.push(weightedAvgPct(eArr, ["exam"].slice(0,                eArr.length)) * wE); totalW += wE; }
  if (!totalW) return null;

  var raw = parts.reduce(function(a, b) { return a + b; }, 0) / totalW;
  return Math.round(Math.min(100, Math.max(60, 60 + (raw / 100) * 40)));
}

function getRemarks(gr){
  if(!gr||gr==="")return"-";gr=Number(gr);
  if(gr>=90)return"Outstanding";if(gr>=85)return"Very Satisfactory";
  if(gr>=80)return"Satisfactory";if(gr>=75)return"Fairly Satisfactory";
  return"Did Not Meet Expectations";
}
function badgeClass(gr){
  if(!gr)return"";gr=Number(gr);
  if(gr>=90)return"badge-outstanding";if(gr>=85)return"badge-vs";
  if(gr>=80)return"badge-sat";if(gr>=75)return"badge-fs";return"badge-fail";
}
function gradeColor(gr){
  if(!gr)return"var(--muted)";gr=Number(gr);
  if(gr>=90)return"#5dde92";if(gr>=85)return"#7bc8f5";
  if(gr>=80)return"var(--gold)";if(gr>=75)return"#f0a050";return"#ff9090";
}
function darken(hex,amt){
  var n=parseInt(hex.replace("#",""),16),r=Math.max(0,(n>>16)+amt),gg=Math.max(0,((n>>8)&0xFF)+amt),b=Math.max(0,(n&0xFF)+amt);
  return"#"+(((1<<24)|(r<<16)|(gg<<8)|b).toString(16).slice(1));
}
function getSubjColor(subj){
  var idx=getCrSubjectsForFolder(currentFolder,currentGradeLevel).indexOf(subj);
  var cols=getCrColorsForFolder(currentFolder,currentGradeLevel);
  return idx>=0?cols[idx%cols.length]:"#374151";
}
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
  var stu=findStudentByName(stuName);if(stu){ensureStudentGrades(stu);if(!stu.grades[subj])stu.grades[subj]={};stu.grades[subj][qtr]=grade;}
}
function getAllRosterGrades(classKey,stuName,subj){
  var out={q1:"",q2:"",q3:"",q4:""};
  if(!rosterGrades[classKey]||!rosterGrades[classKey][stuName]||!rosterGrades[classKey][stuName][subj])return out;
  var qd=rosterGrades[classKey][stuName][subj];
  out.q1=qd.q1||"";out.q2=qd.q2||"";out.q3=qd.q3||"";out.q4=qd.q4||"";return out;
}

function getGradeLevel(strand){if(!strand)return"";var m=strand.match(/^G(\d+)-/);return m?"Grade "+m[1]:"";}
function getGradeLevelShort(strand){if(!strand)return"";var m=strand.match(/^G(\d+)-/);return m?"G"+m[1]:"";}
function getStrandName(strand){
  if(!strand)return"";
  var m=strand.match(/^G\d+-(.+?)-[AB]$|^G\d+-(.+)$/);
  if(m)return(m[1]||m[2]||"").replace("HEHO","H.E-H.O");
  return strand;
}
function getSectionLetter(strand){if(!strand)return"";var m=strand.match(/-([AB])$/);return m?m[1]:"";}
function strandToRosterKey(strand){if(!strand)return null;return strand.replace(/HEHO/,"HE-HO");}
function strandToClassKey(strand){if(!strand)return null;return strand.replace(/^G\d+-/,"").replace(/^HEHO-/,"HE-HO-");}

function getDynamicRoster(classKey,grade){
  grade=grade||currentGradeLevel||"G11";
  var fullKey=grade+"-"+classKey;
  var legacyBase=DB.classRoster[classKey]||{male:[],female:[]};
  var gradeBase=DB.classRoster[fullKey]||{male:[],female:[]};
  var baseMale=gradeBase.male.length>0?gradeBase.male.slice():legacyBase.male.slice();
  var baseFemale=gradeBase.female.length>0?gradeBase.female.slice():legacyBase.female.slice();
  var result={
    male:baseMale.map(function(n){return{name:n,studentId:null,gender:"male",strand:"",isRegistered:false};}),
    female:baseFemale.map(function(n){return{name:n,studentId:null,gender:"female",strand:"",isRegistered:false};})
  };
  for(var i=0;i<DB.students.length;i++){
    var stu=DB.students[i];
    if(!stu.strand)continue;
    var rkClass=strandToClassKey(stu.strand),stuGrade=getGradeLevelShort(stu.strand);
    if(stuGrade!==grade||rkClass!==classKey)continue;
    var gender=stu.gender&&stu.gender.toLowerCase()==="female"?"female":"male";
    var found=false,arr=result[gender];
    for(var j=0;j<arr.length;j++){
      if(arr[j].name===stu.name){arr[j].studentId=stu.id;arr[j].strand=stu.strand;arr[j].isRegistered=true;found=true;break;}
    }
    if(!found){
      var invitesList=loadInvites(),isApproved=false;
      for(var k=0;k<invitesList.length;k++){if(invitesList[k].studentId===stu.id&&invitesList[k].status==="approved"){isApproved=true;break;}}
      if(isApproved||(stu.approvedSubjects&&stu.approvedSubjects.length>0)){
        result[gender].push({name:stu.name,studentId:stu.id,gender:gender,strand:stu.strand,isRegistered:true});
      }
    }
  }
  return result;
}
function addStudentToStaticRoster(stu){
  var fullKey=strandToRosterKey(stu.strand);if(!fullKey)return;
  if(!DB.classRoster[fullKey])DB.classRoster[fullKey]={male:[],female:[]};
  var gender=stu.gender&&stu.gender.toLowerCase()==="female"?"female":"male";
  var arr=DB.classRoster[fullKey][gender];
  for(var i=0;i<arr.length;i++){if(arr[i]===stu.name)return;}
  arr.push(stu.name);saveDB();
}

function addNotifForTeacher(teacherId,notif){
  var key="teacher_notif_"+teacherId,list=JSON.parse(localStorage.getItem(key)||"[]");
  notif.id=Date.now()+"_"+Math.random();notif.read=false;notif.timestamp=new Date().toISOString();
  list.unshift(notif);localStorage.setItem(key,JSON.stringify(list));
}
function getTeacherNotifs(teacherId){return JSON.parse(localStorage.getItem("teacher_notif_"+teacherId)||"[]");}
function markTeacherNotifRead(teacherId,notifId){
  var key="teacher_notif_"+teacherId,list=JSON.parse(localStorage.getItem(key)||"[]");
  list.forEach(function(n){if(n.id===notifId)n.read=true;});
  localStorage.setItem(key,JSON.stringify(list));
}
function getUnreadTeacherNotifCount(teacherId){return getTeacherNotifs(teacherId).filter(function(n){return!n.read;}).length;}

function loadStudentPhoto(studentId){try{return localStorage.getItem("asiasource_photo_"+studentId);}catch(e){return null;}}
function applyStudentPhoto(studentId,dataUrl){
  var emojiEl=g("stuAvatarEmoji"),photoWrap=g("stuPcPhotoWrap"),photoImg=g("stuPcPhoto");
  if(dataUrl){
    if(emojiEl)emojiEl.style.display="none";
    if(photoWrap)photoWrap.classList.remove("hidden");
    if(photoImg)photoImg.src=dataUrl;
  }else{
    if(emojiEl)emojiEl.style.display="";
    if(photoWrap)photoWrap.classList.add("hidden");
    if(photoImg)photoImg.src="";
  }
  var pmOverlay=g("pmPhotoOverlay"),pmImg=g("pmPhotoImg"),pmAvatarEmoji=g("pmAvatar");
  if(dataUrl&&currentRole==="student"){
    if(pmOverlay)pmOverlay.classList.remove("hidden");
    if(pmImg)pmImg.src=dataUrl;
    if(pmAvatarEmoji)pmAvatarEmoji.style.opacity="0";
  }else{
    if(pmOverlay)pmOverlay.classList.add("hidden");
    if(pmAvatarEmoji)pmAvatarEmoji.style.opacity="1";
  }
}
var _photoDataUrl=null;
function handlePhotoUpload(event){
  var file=event.target.files[0];if(!file)return;
  if(!file.type.startsWith("image/")){showToast("⚠️ Please select an image file.","warning");return;}
  var reader=new FileReader();
  reader.onload=function(e){
    _photoDataUrl=e.target.result;
    var preview=g("pmPhotoPreviewImg"),placeholder=g("pmPhotoPlaceholder");
    if(preview){preview.src=_photoDataUrl;preview.classList.remove("hidden");}
    if(placeholder)placeholder.style.display="none";
  };
  reader.readAsDataURL(file);
}
function saveProfilePhoto(){
  if(!_photoDataUrl){showToast("⚠️ Please choose a photo first.","warning");return;}
  if(!window.currentUser)return;
  try{localStorage.setItem("asiasource_photo_"+currentUser.id,_photoDataUrl);}catch(e){showToast("⚠️ Photo too large to save. Try a smaller image.","warning");return;}
  applyStudentPhoto(currentUser.id,_photoDataUrl);
  var successEl=g("pmPhotoSuccess");
  if(successEl){successEl.classList.remove("hidden");setTimeout(function(){successEl.classList.add("hidden");},2500);}
  showToast("📷 Profile photo saved!","success");_photoDataUrl=null;
}
function removeProfilePhoto(){
  if(!window.currentUser)return;
  try{localStorage.removeItem("asiasource_photo_"+currentUser.id);}catch(e){}
  applyStudentPhoto(currentUser.id,null);
  var preview=g("pmPhotoPreviewImg"),placeholder=g("pmPhotoPlaceholder");
  if(preview){preview.src="";preview.classList.add("hidden");}
  if(placeholder)placeholder.style.display="";
  showToast("🗑️ Photo removed.","warning");
}

// ══ Student Score Types ══
var SCORE_TYPES=[
  {key:"quiz1",label:"Quiz 1",group:"quiz"},{key:"quiz2",label:"Quiz 2",group:"quiz"},{key:"quiz3",label:"Quiz 3",group:"quiz"},
  {key:"act1",label:"Activity 1",group:"activity"},{key:"act2",label:"Activity 2",group:"activity"},{key:"act3",label:"Activity 3",group:"activity"},
  {key:"proj1",label:"Project 1",group:"project"},{key:"proj2",label:"Project 2",group:"project"},
  {key:"exam",label:"Exam",group:"exam"}
];

// FIX: Build subject objects directly from approved invites + catalog
// DB.subjects is always empty — subjects live in the invite system
function getSubjectsForStudent(stu){
  var CAT_META={
    "Core Subjects":        {color:"#3b82f6",icon:"📗"},
    "Applied Subjects":     {color:"#8b5cf6",icon:"🔧"},
    "Specialized — ABM":   {color:"#f59e0b",icon:"💼"},
    "Specialized — HUMSS": {color:"#ec4899",icon:"🎭"},
    "Specialized — STEM":  {color:"#10b981",icon:"🔬"},
    "Specialized — TVL":   {color:"#f97316",icon:"⚙️"}
  };
  function metaForSubject(name){
    for(var cat in ALL_SHS_SUBJECTS){
      if(ALL_SHS_SUBJECTS[cat].indexOf(name)>=0){
        return CAT_META[cat]||{color:"#e8000f",icon:"📚"};
      }
    }
    return {color:"#e8000f",icon:"📚"};
  }
  var result=[], seen={};
  // 1. From approved invites (has teacher info)
  var invites=loadInvites();
  for(var i=0;i<invites.length;i++){
    var inv=invites[i];
    if(inv.studentId!==stu.id||inv.status!=="approved"||seen[inv.subjectName])continue;
    seen[inv.subjectName]=true;
    var m=metaForSubject(inv.subjectName);
    result.push({name:inv.subjectName,icon:m.icon,color:m.color,teacher:inv.teacherName||"",sem:null});
  }
  // 2. From student.approvedSubjects (seed / teacher-added)
  var seed=stu.approvedSubjects||[];
  for(var j=0;j<seed.length;j++){
    if(seen[seed[j]])continue;
    seen[seed[j]]=true;
    var m2=metaForSubject(seed[j]);
    result.push({name:seed[j],icon:m2.icon,color:m2.color,teacher:"",sem:null});
  }
  return result;
}

// ══ STUDENT DASHBOARD (Fixed: always re-syncs from localStorage) ══
function loadStudentDash(stu){
  // ALWAYS reload DB and invites from localStorage before rendering
  // This ensures cross-tab changes (teacher approvals) are picked up
  var freshDB=loadDB();
  if(freshDB&&Array.isArray(freshDB.students)){
    DB.students=freshDB.students;
    DB.teachers=freshDB.teachers;
  }
  // Re-find the student from the freshly loaded DB
  if(stu&&stu.id){
    for(var si=0;si<DB.students.length;si++){
      if(DB.students[si].id===stu.id){
        currentUser=DB.students[si];
        stu=currentUser;
        break;
      }
    }
  }

  g("stuName").textContent=stu.name;
  g("stuProfileName").textContent=stu.name;
  g("stuProfileEmail").textContent=stu.email+"@asiasourceicollege.edu.ph";
  g("stuProfileBday").textContent=stu.bday||"-";
  g("stuProfileLRN").textContent=stu.emailUser;
  var gl=getGradeLevel(stu.strand),glShort=getGradeLevelShort(stu.strand),sn=getStrandName(stu.strand);
  var isG11=stu.strand&&stu.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
  var strandEl=g("stuProfileStrand");
  if(strandEl){
    strandEl.innerHTML=(glShort?'<span style="background:'+glColor+'22;border:1px solid '+glColor+'55;color:'+glColor+';border-radius:20px;padding:1px 8px;font-size:10px;font-weight:800;margin-right:4px;">'+glShort+'</span>':"")+
      (DB.strandFull[stu.strand]||stu.strand);
  }

  // FIX: Build subject list from approved invites (DB.subjects is always empty)
  var subjectsForStu = getSubjectsForStudent(stu);
  var pendingInvites = getPendingSubjects(stu.id);
  var allApproved    = subjectsForStu.map(function(s){return s.name;});

  var list=g("subjectList");list.innerHTML="";

  // Empty state
  if(pendingInvites.length===0&&allApproved.length===0){
    list.innerHTML='<div class="no-subjects-msg"><div class="no-sub-icon">\u{1F4DA}</div><div class="no-sub-text">You have no subjects yet.</div><div class="no-sub-hint">Click the button below to add your subjects.</div></div>';
  }

  // Pending cards
  pendingInvites.forEach(function(inv){
    var CAT_ICONS={"Core Subjects":"\u{1F4D7}","Applied Subjects":"\u{1F527}","Specialized \u2014 ABM":"\u{1F4BC}","Specialized \u2014 HUMSS":"\u{1F3AD}","Specialized \u2014 STEM":"\u{1F52C}","Specialized \u2014 TVL":"\u2699\uFE0F"};
    var icon="\u{1F4DA}";
    for(var cat in ALL_SHS_SUBJECTS){if(ALL_SHS_SUBJECTS[cat].indexOf(inv.subjectName)>=0){icon=CAT_ICONS[cat]||"\u{1F4DA}";break;}}
    var teacherTxt=inv.teacherName?"Teacher: "+inv.teacherName:"";
    list.innerHTML+='<div class="subject-card pending-card"><div class="subject-left"><div class="subject-icon" style="opacity:.5;">'+icon+'</div><div><div class="sub-name">'+inv.subjectName+'</div><div class="sub-teacher">'+teacherTxt+'</div></div></div><div class="subject-grade"><div class="pending-badge">\u23F3 Waiting Approval</div></div></div>';
  });

  // Approved subject cards
  for(var si2=0;si2<subjectsForStu.length;si2++){
    var sub=subjectsForStu[si2];
    if(!stu.grades)stu.grades={};
    var gr=stu.grades[sub.name]||{},fg=avgGrade(gr.q1,gr.q2,gr.q3,gr.q4),passed=fg&&fg>=75;
    list.innerHTML+='<div class="subject-card" onclick="openSubjectDetail(\''+sub.name.replace(/'/g,"\\'")+'\')">'+
      '<div class="subject-left">'+
      '<div class="subject-icon" style="background:'+sub.color+'22;border:1.5px solid '+sub.color+'55;color:'+sub.color+'">'+sub.icon+'</div>'+
      '<div><div class="sub-name">'+sub.name+'</div>'+
      '<div class="sub-teacher">'+(sub.teacher?"Teacher: "+sub.teacher:"")+'</div></div></div>'+
      '<div class="subject-grade"><div class="grade-num">'+(fg||"-")+'</div><div class="grade-label">Final</div>'+
      '<div class="grade-pill '+(passed?"pill-pass":"pill-fail")+'">'+getRemarks(fg)+'</div></div></div>';
  }

  var tbody=g("gradeCardBody");tbody.innerHTML="";
  var gwaSum=0,gwaCount=0;
  var sem1Subj=[],sem2Subj=[],noSemSubj=[];
  for(var k=0;k<subjectsForStu.length;k++){
    var s=subjectsForStu[k];
    if(s.sem===1)sem1Subj.push(s);else if(s.sem===2)sem2Subj.push(s);else noSemSubj.push(s);
  }

  function renderSemRows(list2,semLabel,semColor){
    if(list2.length===0)return;
    if(semLabel)tbody.innerHTML+='<tr><td colspan="5" style="background:'+semColor+'22;color:'+semColor+';font-weight:800;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:6px 10px;border-bottom:1px solid '+semColor+'33;">'+semLabel+'</td></tr>';
    for(var ki=0;ki<list2.length;ki++){
      var sk=list2[ki];
      if(allApproved.indexOf(sk.name)<0)continue;
      var gr2=stu.grades[sk.name]||{},q1=gr2.q1||"",q2=gr2.q2||"",q3=gr2.q3||"",q4=gr2.q4||"";
      var sem1g=avgGrade(q1,q2),sem2g=avgGrade(q3,q4);
      var fg2;
      if(sk.sem===1)fg2=sem1g;else if(sk.sem===2)fg2=sem2g;else fg2=avgGrade(q1,q2,q3,q4);
      var pass2=fg2&&fg2>=75;
      if(fg2){gwaSum+=fg2;gwaCount++;}
      tbody.innerHTML+="<tr><td>"+sk.name+"</td>"+
        '<td style="background:rgba(14,165,233,0.06);color:'+(sem1g?gradeColor(sem1g):"var(--muted)")+'">'+(sem1g||"-")+"</td>"+
        '<td style="background:rgba(16,185,129,0.06);color:'+(sem2g?gradeColor(sem2g):"var(--muted)")+'">'+(sem2g||"-")+"</td>"+
        '<td class="final-col">'+(fg2||"-")+"</td>"+
        '<td><span class="grade-pill '+(pass2?"pill-pass":"pill-fail")+'">'+getRemarks(fg2)+"</span></td></tr>";
    }
  }
  renderSemRows(sem1Subj,"1st Semester","#38bdf8");
  renderSemRows(sem2Subj,"2nd Semester","#34d399");
  renderSemRows(noSemSubj,"","");
  if(tbody.innerHTML==="")tbody.innerHTML='<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">No approved subjects yet.</td></tr>';
  var gwaBar=g("gwaBar");
  if(gwaBar){
    if(gwaCount>0){
      var gwa=Math.round(gwaSum/gwaCount);
      gwaBar.style.display="flex";
      gwaBar.innerHTML='<span class="gwa-label">General Weighted Average (GWA)</span><span class="gwa-num" style="color:'+gradeColor(gwa)+'">'+gwa+'</span><span class="gwa-rem '+badgeClass(gwa)+'">'+getRemarks(gwa)+'</span>';
    }else gwaBar.style.display="none";
  }
  var photoData=loadStudentPhoto(stu.id);
  applyStudentPhoto(stu.id,photoData);
}

function findStudentScoresInStore(stuName,subjName,qtr){
  if(typeof scoreStore==="undefined"||typeof rosterGrades==="undefined"||typeof DB==="undefined")return null;
  for(var classKey in rosterGrades){
    if(!rosterGrades[classKey]||!rosterGrades[classKey][stuName])continue;
    var genderLabels=["male","female"];
    var gradePrefix="";
    if(window.currentUser&&window.currentUser.strand)gradePrefix=getGradeLevelShort(window.currentUser.strand)||"";
    var rosterKeys=[classKey];
    if(gradePrefix)rosterKeys.push(gradePrefix+"-"+classKey);
    for(var gi=0;gi<genderLabels.length;gi++){
      var gen=genderLabels[gi];
      for(var ri=0;ri<rosterKeys.length;ri++){
        var rkey=rosterKeys[ri];
        if(!DB.classRoster[rkey])continue;
        var arr=DB.classRoster[rkey][gen]||[];
        for(var idx=0;idx<arr.length;idx++){
          if(arr[idx]===stuName){
            var sk=classKey+"-"+gen+"-"+idx;
            if(scoreStore[sk]&&scoreStore[sk][subjName]&&scoreStore[sk][subjName][qtr]){
              var scores=scoreStore[sk][subjName][qtr];
              var hasData=Object.keys(scores).some(function(k){return scores[k]!==""&&scores[k]!==undefined&&scores[k]!==null;});
              if(hasData)return scores;
            }
          }
        }
      }
    }
  }
  return null;
}

function enhanceStudentScorePanels(subName){
  if(!window.currentUser)return;
  var stuName=currentUser.name;
  var SC_GROUP_COLORS={quiz:"#0ea5e9",activity:"#10b981",project:"#f59e0b",exam:"#e8000f"};
  var SC_GROUP_LABELS={quiz:"📝 Quizzes",activity:"🎯 Activities",project:"📁 Projects",exam:"📄 Exam"};
  var SC_GROUPS_ORDER=["quiz","activity","project","exam"];
  var qtrs=["q1","q2","q3","q4"];
  qtrs.forEach(function(qtr){
    var panel=g("smPanel-"+qtr);if(!panel)return;
    var existingGroups=panel.querySelectorAll(".sm-group,.sm-score-group,.sm-no-scores");
    existingGroups.forEach(function(el){el.remove();});
    var scores=findStudentScoresInStore(stuName,subName,qtr);
    var footer=panel.querySelector(".sm-q-footer");
    if(!scores){
      var noEl=document.createElement("div");noEl.className="sm-no-scores";
      noEl.innerHTML='<div class="sm-no-scores-icon">📊</div><div>No scores recorded yet for '+qtr.toUpperCase()+'</div><div style="font-size:11px;margin-top:6px;color:rgba(255,255,255,0.3);">Your teacher will record scores in the gradebook</div>';
      if(footer)panel.insertBefore(noEl,footer);else panel.appendChild(noEl);return;
    }
    var anyGroupRendered=false;
    SC_GROUPS_ORDER.forEach(function(grp){
      var items=SCORE_TYPES.filter(function(s){return s.group===grp;});
      var hasAny=items.some(function(s){var v=scores[s.key];return v!==undefined&&v!==""&&v!==null;});
      if(!hasAny)return;
      anyGroupRendered=true;
      var groupDiv=document.createElement("div");groupDiv.className="sm-score-group";
      var labelDiv=document.createElement("div");labelDiv.className="sm-score-group-label";
      labelDiv.style.color=SC_GROUP_COLORS[grp];labelDiv.textContent=SC_GROUP_LABELS[grp];
      groupDiv.appendChild(labelDiv);
      items.forEach(function(st){
        var val=scores[st.key],hasVal=val!==undefined&&val!==""&&val!==null;
        var mx=getMax(st.key);
        var numVal=hasVal?Number(val):0,pct=hasVal?Math.min(100,Math.round(numVal/mx*100)):0;
        var card=document.createElement("div");card.className="sm-score-card";
        card.style.setProperty("--sc-color",SC_GROUP_COLORS[grp]);
        card.innerHTML='<span class="sm-score-icon">'+(grp==="quiz"?"✏️":grp==="activity"?"🎯":grp==="project"?"📁":"📝")+'</span>'+
          '<span class="sm-score-label">'+st.label+'</span>'+
          '<div class="sm-score-bar-wrap"><div class="sm-score-bar-fill" style="width:0%;background:'+SC_GROUP_COLORS[grp]+';" data-pct="'+pct+'"></div></div>'+
          '<div class="'+(hasVal?"sm-score-value":"sm-score-empty")+'">'+(hasVal?numVal+'<span class="sm-score-max"> /'+mx+'</span>':'—')+'</div>';
        groupDiv.appendChild(card);
      });
      if(footer)panel.insertBefore(groupDiv,footer);else panel.appendChild(groupDiv);
      setTimeout(function(){
        groupDiv.querySelectorAll(".sm-score-bar-fill").forEach(function(bar){
          bar.style.transition="width 0.6s cubic-bezier(0.34,1.2,0.64,1)";
          bar.style.width=bar.getAttribute("data-pct")+"%";
        });
      },80);
    });
    if(!anyGroupRendered){
      var noEl2=document.createElement("div");noEl2.className="sm-no-scores";
      noEl2.innerHTML='<div class="sm-no-scores-icon">📊</div><div>No scores recorded for '+qtr.toUpperCase()+'</div>';
      if(footer)panel.insertBefore(noEl2,footer);else panel.appendChild(noEl2);
    }
  });
}

// ══════════════════════════════════════════════════════════════════
// ADD SUBJECT MODAL
// ══════════════════════════════════════════════════════════════════
var selectedSubjectForAdd=null,selectedTeacherForAdd=null;

function openAddSubjectModal(){
  selectedSubjectForAdd=null;selectedTeacherForAdd=null;
  renderAddSubjectStep1();
  g("addSubjectModal").classList.remove("hidden");document.body.style.overflow="hidden";
}
function closeAddSubjectModal(){g("addSubjectModal").classList.add("hidden");document.body.style.overflow="";}

function renderAddSubjectStep1(){
  // FIX: Use fresh storage reads
  var approved=getApprovedSubjects(currentUser.id).map(function(inv){return inv.subjectName;});
  var pending=getPendingSubjects(currentUser.id).map(function(inv){return inv.subjectName;});
  var seed=currentUser.approvedSubjects||[];
  var taken=approved.concat(pending).concat(seed);

  var totalAvail=0;
  for(var cat in ALL_SHS_SUBJECTS){
    ALL_SHS_SUBJECTS[cat].forEach(function(s){ if(taken.indexOf(s)<0) totalAvail++; });
  }

  var html='<div class="asj-step1">';
  html+='<div class="asj-stats-bar">';
  html+='<div class="asj-stat"><span class="asj-stat-num">'+totalAvail+'</span><span class="asj-stat-lbl">Available</span></div>';
  html+='<div class="asj-stat-div"></div>';
  html+='<div class="asj-stat"><span class="asj-stat-num" style="color:#5dde92;">'+(taken.length)+'</span><span class="asj-stat-lbl">Enrolled</span></div>';
  html+='<div class="asj-stat-div"></div>';
  html+='<div class="asj-stat"><span class="asj-stat-num" style="color:#f0a050;">'+(pending.length)+'</span><span class="asj-stat-lbl">Pending</span></div>';
  html+='</div>';
  html+='<div class="asj-search-wrap">';
  html+='<span class="asj-search-icon">🔍</span>';
  html+='<input class="asj-search-input" type="text" id="asjSearch" placeholder="Search subjects..." oninput="filterAsjCatalog()">';
  html+='<button class="asj-search-clear hidden" id="asjSearchClear" onclick="clearAsjSearch()">✕</button>';
  html+='</div>';
  html+='<div class="asj-catalog" id="asjCatalog">';
  html+=buildAsjCatalog(taken,'');
  html+='</div>';
  html+='</div>';

  g("addSubjectContent").innerHTML=html;
}

function buildAsjCatalog(taken, query){
  var q=query.toLowerCase().trim();
  var html="";
  var catIcons={"Core Subjects":"📗","Applied Subjects":"🔧","Specialized — ABM":"💼","Specialized — HUMSS":"🎭","Specialized — STEM":"🔬","Specialized — TVL":"⚙️"};
  var catColors={"Core Subjects":"#3b82f6","Applied Subjects":"#8b5cf6","Specialized — ABM":"#f59e0b","Specialized — HUMSS":"#ec4899","Specialized — STEM":"#10b981","Specialized — TVL":"#f97316"};
  var totalFound=0;
  for(var cat in ALL_SHS_SUBJECTS){
    var subs=ALL_SHS_SUBJECTS[cat];
    var filtered=q?subs.filter(function(s){return s.toLowerCase().indexOf(q)>=0;}):subs;
    if(filtered.length===0)continue;
    totalFound+=filtered.length;
    var col=catColors[cat]||"#e8000f";
    var ico=catIcons[cat]||"📚";
    var enrolledCount=filtered.filter(function(s){return taken.indexOf(s)>=0;}).length;
    html+='<div class="asj-cat-group">';
    html+='<div class="asj-cat-hdr" style="--cat-color:'+col+';">';
    html+='<span class="asj-cat-icon">'+ico+'</span>';
    html+='<span class="asj-cat-name">'+cat+'</span>';
    html+='<span class="asj-cat-count">'+filtered.length+'</span>';
    if(enrolledCount>0) html+='<span class="asj-cat-enrolled">'+enrolledCount+' enrolled</span>';
    html+='</div>';
    html+='<div class="asj-cat-items">';
    filtered.forEach(function(s){
      var isTaken=taken.indexOf(s)>=0;
      var highlightedName=s;
      if(q){var idx=s.toLowerCase().indexOf(q);if(idx>=0)highlightedName=s.slice(0,idx)+'<mark class="asj-hl">'+s.slice(idx,idx+q.length)+'</mark>'+s.slice(idx+q.length);}
      if(isTaken){
        html+='<div class="asj-item asj-item-taken">';
        html+='<div class="asj-item-check">✓</div>';
        html+='<span class="asj-item-name">'+highlightedName+'</span>';
        html+='<span class="asj-item-tag asj-tag-enrolled">Enrolled</span>';
        html+='</div>';
      } else {
        html+='<div class="asj-item asj-item-avail" onclick="selectSubjectFromCatalog(\''+s.replace(/'/g,"\\'")+'\')" style="--cat-color:'+col+';">';
        html+='<div class="asj-item-dot" style="background:'+col+';"></div>';
        html+='<span class="asj-item-name">'+highlightedName+'</span>';
        html+='<span class="asj-item-tag asj-tag-select">Select →</span>';
        html+='</div>';
      }
    });
    html+='</div></div>';
  }
  if(!html||totalFound===0){
    html='<div class="asj-empty"><div class="asj-empty-icon">🔍</div><div class="asj-empty-text">No subjects found for "'+query+'"</div></div>';
  }
  return html;
}

function filterAsjCatalog(){
  var q=g("asjSearch")?g("asjSearch").value:"";
  var clearBtn=g("asjSearchClear");
  if(clearBtn)clearBtn.classList.toggle("hidden",!q);
  var approved=getApprovedSubjects(currentUser.id).map(function(inv){return inv.subjectName;});
  var pending=getPendingSubjects(currentUser.id).map(function(inv){return inv.subjectName;});
  var seed=currentUser.approvedSubjects||[];
  var taken=approved.concat(pending).concat(seed);
  var cat=g("asjCatalog");if(cat)cat.innerHTML=buildAsjCatalog(taken,q);
}

function clearAsjSearch(){
  var inp=g("asjSearch");if(inp)inp.value="";
  var clearBtn=g("asjSearchClear");if(clearBtn)clearBtn.classList.add("hidden");
  filterAsjCatalog();
}

function selectSubjectFromCatalog(subj){
  selectedSubjectForAdd=subj;
  var html='<div class="asj-step2">';
  html+='<div class="asj-step2-hdr">';
  html+='<button class="asj-back-btn" onclick="renderAddSubjectStep1()"><span>←</span> Back to Subjects</button>';
  html+='</div>';
  html+='<div class="asj-selected-subj-card">';
  html+='<div class="asj-selected-icon">📚</div>';
  html+='<div class="asj-selected-info">';
  html+='<div class="asj-selected-name">'+subj+'</div>';
  html+='<div class="asj-selected-hint">Choose a teacher to send your enrollment request</div>';
  html+='</div></div>';
  html+='<div class="asj-teacher-heading"><span class="asj-teacher-heading-icon">👩‍🏫</span> Select Your Teacher</div>';
  html+='<div class="asj-teacher-list">';
  for(var i=0;i<DB.teachers.length;i++){
    var t=DB.teachers[i];
    html+='<div class="asj-teacher-card" id="asjTcard_'+t.id+'" onclick="selectTeacherForSubject(\''+t.id+'\',\''+t.emailUser+'\',this)">';
    html+='<div class="asj-tcard-avatar">👩‍🏫</div>';
    html+='<div class="asj-tcard-info">';
    html+='<div class="asj-tcard-name">'+t.name+'</div>';
    html+='<div class="asj-tcard-email">'+t.emailUser+'@asiasourceicollege.edu.ph</div>';
    html+='</div>';
    html+='<div class="asj-tcard-radio" id="asjRadio_'+t.id+'"></div>';
    html+='</div>';
  }
  html+='</div>';
  html+='<button class="asj-submit-btn" id="asjSubmitBtn" disabled onclick="submitSubjectRequest()">';
  html+='<span class="asj-submit-icon">📤</span> Send Enrollment Request';
  html+='</button>';
  html+='</div>';
  g("addSubjectContent").innerHTML=html;
}

function selectTeacherForSubject(tid,temail,el){
  selectedTeacherForAdd=tid;
  document.querySelectorAll(".asj-teacher-card").forEach(function(c){c.classList.remove("selected");});
  el.classList.add("selected");
  var btn=g("asjSubmitBtn");if(btn){btn.disabled=false;}
}

// ══ FIXED: submitSubjectRequest ══
function submitSubjectRequest(){
  if(!selectedSubjectForAdd||!selectedTeacherForAdd)return;
  var teacher=null;
  for(var i=0;i<DB.teachers.length;i++){
    if(DB.teachers[i].id===selectedTeacherForAdd){teacher=DB.teachers[i];break;}
  }
  if(!teacher)return;

  var invitesList=loadInvites();

  // Block if already PENDING
  for(var j=0;j<invitesList.length;j++){
    if(invitesList[j].studentId===currentUser.id&&
       invitesList[j].subjectName===selectedSubjectForAdd&&
       invitesList[j].status==="pending"){
      showToast("⚠️ You already have a pending request for "+selectedSubjectForAdd,"warning");
      closeAddSubjectModal();
      return;
    }
  }

  // Block if already APPROVED
  var approvedNames=getApprovedSubjects(currentUser.id).map(function(inv){return inv.subjectName;});
  var seedApproved=currentUser.approvedSubjects||[];
  var allApproved=seedApproved.concat(approvedNames.filter(function(s){return seedApproved.indexOf(s)<0;}));
  if(allApproved.indexOf(selectedSubjectForAdd)>=0){
    showToast("✅ You are already enrolled in "+selectedSubjectForAdd,"success");
    closeAddSubjectModal();
    return;
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
  showPendingOverlay(selectedSubjectForAdd,teacher.name);
  setTimeout(function(){loadStudentDash(currentUser);},1000);
}

function showPendingOverlay(subj,teacherName){
  var el=document.createElement("div");el.id="pendingOverlay";
  el.innerHTML='<div class="pending-overlay-inner"><div class="pending-check-anim">✅</div><div class="pending-title">Request Sent!</div><div class="pending-msg">Please wait for approval from<br><strong>'+teacherName+'</strong></div><div class="pending-subj">'+subj+'</div></div>';
  el.style.cssText="position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease";
  document.body.appendChild(el);
  setTimeout(function(){el.style.opacity="0";el.style.transition="opacity .5s";},2500);
  setTimeout(function(){if(el.parentNode)el.remove();},3000);
}

function openSubjectDetail(subName){
  var subjectsForStu=getSubjectsForStudent(currentUser);
  var sub=null;for(var i=0;i<subjectsForStu.length;i++){if(subjectsForStu[i].name===subName){sub=subjectsForStu[i];break;}}
  var gr=(currentUser.grades&&currentUser.grades[subName])?currentUser.grades[subName]:{};
  var modalColor=DB.crColors[DB.crSubjects.indexOf(subName)]||"#e8000f";
  var iconTxt=sub?sub.icon:subName.slice(0,3).toUpperCase();
  var teacherTxt=sub?"Teacher: "+sub.teacher:"";
  var semBadgeHtml="";
  if(sub&&sub.sem)semBadgeHtml='<div style="margin-bottom:6px;"><span class="sem-badge sem-badge-'+sub.sem+'">'+(sub.sem===1?"1st Semester":"2nd Semester")+'</span></div>';
  var sem1Grade=avgGrade(gr.q1,gr.q2),sem2Grade=avgGrade(gr.q3,gr.q4);
  var finalGrade;
  if(sub&&sub.sem===1)finalGrade=sem1Grade;else if(sub&&sub.sem===2)finalGrade=sem2Grade;else finalGrade=avgGrade(gr.q1,gr.q2,gr.q3,gr.q4);

  var html='<div class="sm-hdr" style="border-color:'+modalColor+'44;">'+
    '<div class="sm-hdr-icon" style="background:'+modalColor+'22;border-color:'+modalColor+'55;color:'+modalColor+';">'+iconTxt+'</div>'+
    '<div class="sm-hdr-info">'+semBadgeHtml+'<div class="sm-hdr-name">'+subName+'</div><div class="sm-hdr-teacher">'+teacherTxt+'</div></div>'+
    '<div class="sm-hdr-grade"><div class="sm-hdr-grade-num" style="color:'+(finalGrade?"var(--gold)":"var(--muted)")+';">'+(finalGrade||"—")+'</div><div class="sm-hdr-grade-lbl">Final Grade</div></div></div>';

  html+='<div class="sm-sem-summary">';
  if(sub&&sub.sem===1){
    html+='<div class="sm-sem-box sm-sem-box-1"><div class="sm-sem-lbl">1st Semester</div><div class="sm-sem-qtrs"><span>Q1: '+(gr.q1||"—")+'</span><span>Q2: '+(gr.q2||"—")+'</span></div><div class="sm-sem-grade" style="color:'+(sem1Grade?gradeColor(sem1Grade):"var(--muted)")+';">'+(sem1Grade||"—")+'</div></div>';
  }else if(sub&&sub.sem===2){
    html+='<div class="sm-sem-box sm-sem-box-2"><div class="sm-sem-lbl">2nd Semester</div><div class="sm-sem-qtrs"><span>Q3: '+(gr.q3||"—")+'</span><span>Q4: '+(gr.q4||"—")+'</span></div><div class="sm-sem-grade" style="color:'+(sem2Grade?gradeColor(sem2Grade):"var(--muted)")+';">'+(sem2Grade||"—")+'</div></div>';
  }else{
    html+='<div class="sm-sem-box sm-sem-box-1"><div class="sm-sem-lbl">1st Semester</div><div class="sm-sem-qtrs"><span>Q1: '+(gr.q1||"—")+'</span><span>Q2: '+(gr.q2||"—")+'</span></div><div class="sm-sem-grade" style="color:'+(sem1Grade?gradeColor(sem1Grade):"var(--muted)")+';">'+(sem1Grade||"—")+'</div></div>';
    html+='<div class="sm-sem-box sm-sem-box-2"><div class="sm-sem-lbl">2nd Semester</div><div class="sm-sem-qtrs"><span>Q3: '+(gr.q3||"—")+'</span><span>Q4: '+(gr.q4||"—")+'</span></div><div class="sm-sem-grade" style="color:'+(sem2Grade?gradeColor(sem2Grade):"var(--muted)")+';">'+(sem2Grade||"—")+'</div></div>';
  }
  html+='</div>';

  var qtrsToShow=sub&&sub.sem===1?["q1","q2"]:sub&&sub.sem===2?["q3","q4"]:["q1","q2","q3","q4"];
  html+='<div class="sm-qtabs">';
  qtrsToShow.forEach(function(q,qi){
    var qg=gr[q]||"";
    html+='<button class="sm-qtab'+(qi===0?" active":"")+" onclick=\"switchSmTab('"+q+"',this)\">";
    html+='<span class="sm-qtab-lbl">'+q.toUpperCase()+'</span>'+(qg?'<span class="sm-qtab-grade">'+qg+'</span>':'<span class="sm-qtab-empty">—</span>');
    html+='</button>';
  });
  html+='</div>';

  qtrsToShow.forEach(function(q,qi){
    var qg=gr[q]||"";
    html+='<div class="sm-qpanel'+(qi===0?"":" hidden")+'" id="smPanel-'+q+'">';
    html+='<div class="sm-q-footer"><span class="sm-q-footer-lbl">'+Q_LABELS[q]+' Grade</span><span class="sm-q-footer-val '+(qg?badgeClass(qg):"sm-q-none")+'">'+(qg||"Not yet graded")+'</span></div></div>';
  });

  html+='<div class="sm-final-bar"><span class="sm-final-lbl">Final Grade</span><span class="sm-final-num" style="color:'+(finalGrade?gradeColor(finalGrade):"var(--muted)")+';">'+(finalGrade||"—")+'</span><span class="sm-final-rem">'+getRemarks(finalGrade)+'</span></div>';
  g("subjectModalTitle").textContent=subName;g("subjectModalSub").textContent="";g("subjectModalContent").innerHTML=html;
  g("subjectModal").classList.remove("hidden");document.body.style.overflow="hidden";
  setTimeout(function(){enhanceStudentScorePanels(subName);},60);
}

function switchSmTab(q,btn){
  document.querySelectorAll(".sm-qtab").forEach(function(t){t.classList.remove("active");});
  document.querySelectorAll(".sm-qpanel").forEach(function(p){p.classList.add("hidden");});
  btn.classList.add("active");var panel=g("smPanel-"+q);if(panel)panel.classList.remove("hidden");
  var subTitle=g("subjectModalTitle");if(subTitle)setTimeout(function(){enhanceStudentScorePanels(subTitle.textContent);},40);
}
function closeSubjectModal(){g("subjectModal").classList.add("hidden");document.body.style.overflow="";}

// ══ Teacher Dashboard ══
function loadTeacherDash(tch){
  g("tchName").textContent=tch.name;
  g("tchProfileName").textContent=tch.name;
  g("tchProfileEmail").textContent=tch.email+"@asiasourceicollege.edu.ph";
  var tchSubjs=loadTchSubjects(tch.id);
  currentSubject=tchSubjs[0]||null;
  currentGbSubject=tchSubjs[0]||null;
  updateTeacherNotifBadge();
  openFolderByStrand("HUMSS","G11");
}
function updateTeacherNotifBadge(){
  var count=getUnreadTeacherNotifCount(currentUser.id);
  var badge=g("tchNotifBadge");
  if(badge){badge.textContent=count>0?count:"";badge.style.display=count>0?"flex":"none";}
}

// ══ TEACHER SUBJECT MANAGER ══
function openTchSubjectMgr(){
  renderTchSubjectMgr();
  g("tchSubjectMgrModal").classList.remove("hidden");
  document.body.style.overflow="hidden";
}
function closeTchSubjectMgr(){
  g("tchSubjectMgrModal").classList.add("hidden");
  document.body.style.overflow="";
}

var _TSM3_STYLES_INJECTED = false;

function _injectTsm3Styles() {
  if (_TSM3_STYLES_INJECTED || document.getElementById('tsm3-styles')) return;
  _TSM3_STYLES_INJECTED = true;
  var style = document.createElement('style');
  style.id = 'tsm3-styles';
  style.textContent = [
    '#tchSubjectMgrModal .modal-card {max-width:740px !important;padding:0 !important;overflow:hidden !important;border-radius:26px !important;max-height:90vh !important;display:flex !important;flex-direction:column !important;}',
    '#tchSubjectMgrModal .modal-card::before { display: none !important; }',
    '#tchSubjectMgrModal .modal-close {position:absolute !important;top:14px !important;right:14px !important;z-index:60 !important;background:rgba(255,255,255,0.15) !important;border:1px solid rgba(255,255,255,0.25) !important;color:#fff !important;}',
    '.tsm3-wrap{display:flex;flex-direction:column;height:100%;overflow:hidden;}',
    '.tsm3-hero{position:relative;overflow:hidden;flex-shrink:0;}',
    '.tsm3-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,rgba(30,64,175,.6) 0%,rgba(109,40,217,.35) 55%,rgba(5,10,30,.95) 100%);}',
    '.tsm3-hero-bg::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse 70% 90% at 75% 50%,rgba(59,130,246,.25),transparent);}',
    '.tsm3-hero-bg::after{content:"";position:absolute;bottom:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,#3b82f6 30%,#a78bfa 65%,transparent);}',
    '.tsm3-hero-inner{position:relative;z-index:1;display:flex;align-items:center;gap:18px;padding:24px 28px 22px;}',
    '.tsm3-hero-icon{width:54px;height:54px;border-radius:16px;background:rgba(59,130,246,.2);border:1.5px solid rgba(59,130,246,.45);display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;box-shadow:0 0 24px rgba(59,130,246,.25);}',
    '.tsm3-hero-text{flex:1;}',
    '.tsm3-hero-title{font-family:"Cinzel",serif;font-size:20px;font-weight:700;color:#fff;margin:0 0 4px;text-shadow:0 0 30px rgba(99,102,241,.6);}',
    '.tsm3-hero-sub{font-size:12px;color:rgba(147,197,253,.65);margin:0;}',
    '.tsm3-hero-counter{display:flex;flex-direction:column;align-items:center;background:rgba(59,130,246,.12);border:1px solid rgba(59,130,246,.3);border-radius:16px;padding:10px 20px;flex-shrink:0;}',
    '.tsm3-counter-num{font-family:"Cinzel",serif;font-size:30px;font-weight:900;color:#93c5fd;line-height:1;transition:all .3s cubic-bezier(.34,1.56,.64,1);}',
    '.tsm3-counter-lbl{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(147,197,253,.45);margin-top:3px;}',
    '.tsm3-current-section{padding:14px 24px 12px;background:rgba(0,0,0,.35);border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;max-height:140px;overflow-y:auto;}',
    '.tsm3-current-section::-webkit-scrollbar{width:3px;}',
    '.tsm3-current-section::-webkit-scrollbar-thumb{background:rgba(59,130,246,.4);border-radius:2px;}',
    '.tsm3-section-label{display:flex;align-items:center;gap:6px;font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.35);margin-bottom:10px;}',
    '.tsm3-label-dot{width:6px;height:6px;border-radius:50%;}',
    '.tsm3-dot-green{background:#22c55e;box-shadow:0 0 8px #22c55e;animation:tsm3GreenPulse 2s infinite;}',
    '@keyframes tsm3GreenPulse{0%,100%{box-shadow:0 0 6px #22c55e;}50%{box-shadow:0 0 14px #22c55e;}}',
    '.tsm3-chips-flow{display:flex;flex-wrap:wrap;gap:7px;}',
    '.tsm3-chip{display:inline-flex;align-items:center;gap:6px;padding:5px 8px 5px 7px;border-radius:20px;border:1.5px solid rgba(255,255,255,.1);background:rgba(0,0,0,.35);animation:tsm3ChipIn .28s cubic-bezier(.34,1.56,.64,1);max-width:230px;transition:border-color .2s;}',
    '.tsm3-chip:hover{border-color:rgba(239,68,68,.4);}',
    '@keyframes tsm3ChipIn{from{transform:scale(.6);opacity:0;}to{transform:scale(1);opacity:1;}}',
    '.tsm3-chip-color{width:8px;height:8px;border-radius:50%;flex-shrink:0;}',
    '.tsm3-chip-text{font-size:11.5px;font-weight:600;color:rgba(255,255,255,.82);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:175px;}',
    '.tsm3-chip-x{width:18px;height:18px;border-radius:50%;border:none;background:rgba(255,255,255,.08);color:rgba(255,255,255,.45);font-size:13px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .15s;flex-shrink:0;font-family:monospace;padding:0;}',
    '.tsm3-chip-x:hover{background:rgba(239,68,68,.55);color:#fff;transform:scale(1.15);}',
    '.tsm3-empty-chips{display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,.015);border:1px dashed rgba(255,255,255,.08);}',
    '.tsm3-empty-chips-icon{font-size:24px;opacity:.35;}',
    '.tsm3-empty-chips-text{font-size:12px;color:rgba(255,255,255,.3);line-height:1.6;}',
    '.tsm3-empty-chips-text span{font-size:10.5px;}',
    '.tsm3-divider{display:flex;align-items:center;gap:12px;padding:11px 24px;background:rgba(0,0,0,.2);flex-shrink:0;}',
    '.tsm3-divider-line{flex:1;height:1px;background:rgba(255,255,255,.07);}',
    '.tsm3-divider-text{font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,.22);white-space:nowrap;}',
    '.tsm3-search-row{display:flex;align-items:center;gap:12px;padding:0 20px 12px;background:rgba(0,0,0,.2);flex-shrink:0;}',
    '.tsm3-search-box{position:relative;flex:1;}',
    '.tsm3-search-ico{position:absolute;left:13px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.4;pointer-events:none;}',
    '.tsm3-search-input{width:100%;padding:10px 36px 10px 40px;border:1.5px solid rgba(59,130,246,.22);border-radius:12px;font-family:"Outfit",sans-serif;font-size:13px;color:var(--text);background:rgba(0,0,0,.4);outline:none;transition:all .2s;box-sizing:border-box;}',
    '.tsm3-search-input:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.14);background:rgba(0,0,0,.55);}',
    '.tsm3-search-input::placeholder{color:rgba(255,255,255,.18);}',
    '.tsm3-search-clear{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:10px;color:var(--muted);transition:all .2s;}',
    '.tsm3-search-clear:hover{background:rgba(239,68,68,.35);color:#fff;}',
    '.tsm3-search-hint{font-size:11px;font-weight:600;color:rgba(255,255,255,.22);white-space:nowrap;flex-shrink:0;}',
    '.tsm3-catalog{flex:1;overflow-y:auto;overflow-x:hidden;padding:8px 20px 20px;scrollbar-width:thin;scrollbar-color:rgba(59,130,246,.4) transparent;}',
    '.tsm3-catalog::-webkit-scrollbar{width:4px;}',
    '.tsm3-catalog::-webkit-scrollbar-thumb{background:rgba(59,130,246,.4);border-radius:2px;}',
    '.tsm3-cat{margin-bottom:10px;border-radius:14px;border:1px solid rgba(255,255,255,.06);overflow:hidden;animation:tsm3CatIn .22s ease;}',
    '@keyframes tsm3CatIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}',
    '.tsm3-cat-hdr{display:flex;align-items:center;gap:8px;padding:10px 15px;background:rgba(0,0,0,.38);border-bottom:1px solid rgba(255,255,255,.05);}',
    '.tsm3-cat-ico{font-size:15px;}',
    '.tsm3-cat-name{flex:1;font-size:10.5px;font-weight:800;text-transform:uppercase;letter-spacing:.7px;}',
    '.tsm3-cat-cnt{font-size:10px;font-weight:700;border-radius:20px;padding:2px 8px;}',
    '.tsm3-cat-added{font-size:10px;font-weight:800;background:rgba(16,185,129,.12);border:1px solid rgba(16,185,129,.3);border-radius:20px;padding:2px 9px;color:#34d399;}',
    '.tsm3-cat-list{background:rgba(0,0,0,.08);}',
    '.tsm3-item{display:flex;align-items:center;justify-content:space-between;padding:9px 14px;border-bottom:1px solid rgba(255,255,255,.022);transition:all .14s;gap:10px;}',
    '.tsm3-item:last-child{border-bottom:none;}',
    '.tsm3-item:hover{background:rgba(255,255,255,.025);padding-left:20px;}',
    '.tsm3-item-added{background:rgba(16,185,129,.025);}',
    '.tsm3-item-added .tsm3-item-name{color:rgba(255,255,255,.38);}',
    '.tsm3-item-left{display:flex;align-items:center;gap:9px;flex:1;min-width:0;}',
    '.tsm3-item-check{width:18px;height:18px;border-radius:50%;border:1.5px solid;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;}',
    '.tsm3-item-dot{width:8px;height:8px;border-radius:50%;border:1.5px solid;flex-shrink:0;opacity:.4;}',
    '.tsm3-item-name{font-size:12.5px;color:rgba(255,255,255,.78);flex:1;min-width:0;line-height:1.4;}',
    '.tsm3-hl{background:rgba(255,184,0,.3);color:#fff;border-radius:3px;padding:0 2px;}',
    '.tsm3-btn{padding:4px 12px;border-radius:20px;font-family:"Outfit",sans-serif;font-size:11px;font-weight:700;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;border:1.5px solid;background:transparent;}',
    '.tsm3-btn-add:hover{filter:brightness(1.3);transform:scale(1.04);}',
    '.tsm3-btn-remove{border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.05);color:rgba(239,68,68,.7);}',
    '.tsm3-btn-remove:hover{background:rgba(239,68,68,.18);color:#f87171;border-color:rgba(239,68,68,.5);}',
    '.tsm3-no-results{text-align:center;padding:40px 20px;color:rgba(255,255,255,.28);font-size:13px;}'
  ].join('\n');
  document.head.appendChild(style);
}

function _countAllSubjects(){
  var c=0;
  for(var cat in ALL_SHS_SUBJECTS)c+=ALL_SHS_SUBJECTS[cat].length;
  return c;
}

function _buildTsm3Catalog(mySubjects,query){
  var CAT_META={
    "Core Subjects":{icon:"📗",color:"#3b82f6"},
    "Applied Subjects":{icon:"🔧",color:"#8b5cf6"},
    "Specialized — ABM":{icon:"💼",color:"#f59e0b"},
    "Specialized — HUMSS":{icon:"🎭",color:"#ec4899"},
    "Specialized — STEM":{icon:"🔬",color:"#10b981"},
    "Specialized — TVL":{icon:"⚙️",color:"#f97316"}
  };
  var q=query.toLowerCase().trim();
  var html='',totalFound=0;
  for(var cat in ALL_SHS_SUBJECTS){
    var subs=ALL_SHS_SUBJECTS[cat];
    var filtered=q?subs.filter(function(s){return s.toLowerCase().indexOf(q)>=0;}):subs;
    if(!filtered.length)continue;
    totalFound+=filtered.length;
    var meta=CAT_META[cat]||{icon:'📚',color:'#e8000f'};
    var addedInCat=filtered.filter(function(s){return mySubjects.indexOf(s)>=0;}).length;
    html+='<div class="tsm3-cat">';
    html+='<div class="tsm3-cat-hdr" style="border-left:3px solid '+meta.color+';">';
    html+='<span class="tsm3-cat-ico">'+meta.icon+'</span>';
    html+='<span class="tsm3-cat-name" style="color:'+meta.color+';">'+cat+'</span>';
    html+='<span class="tsm3-cat-cnt" style="background:'+meta.color+'18;color:'+meta.color+';">'+filtered.length+'</span>';
    if(addedInCat>0)html+='<span class="tsm3-cat-added">✓ '+addedInCat+' added</span>';
    html+='</div>';
    html+='<div class="tsm3-cat-list">';
    filtered.forEach(function(s){
      var added=mySubjects.indexOf(s)>=0;
      var nameHtml=s;
      if(q){var qi=s.toLowerCase().indexOf(q);if(qi>=0)nameHtml=s.slice(0,qi)+'<mark class="tsm3-hl">'+s.slice(qi,qi+q.length)+'</mark>'+s.slice(qi+q.length);}
      html+='<div class="tsm3-item'+(added?' tsm3-item-added':'')+'">';
      html+='<div class="tsm3-item-left">';
      if(added){
        html+='<div class="tsm3-item-check" style="background:'+meta.color+'18;border-color:'+meta.color+'55;color:'+meta.color+';">✓</div>';
      }else{
        html+='<div class="tsm3-item-dot" style="border-color:'+meta.color+'66;"></div>';
      }
      html+='<span class="tsm3-item-name">'+nameHtml+'</span>';
      html+='</div>';
      if(added){
        html+='<button class="tsm3-btn tsm3-btn-remove" onclick="tsm3RemoveSubject(\''+s.replace(/'/g,"\\'")+'\')">✕ Remove</button>';
      }else{
        html+='<button class="tsm3-btn tsm3-btn-add" style="color:'+meta.color+';border-color:'+meta.color+'44;" onclick="tsm3AddSubject(\''+s.replace(/'/g,"\\'")+'\')">＋ Add</button>';
      }
      html+='</div>';
    });
    html+='</div></div>';
  }
  if(!totalFound){
    html='<div class="tsm3-no-results"><div style="font-size:38px;margin-bottom:12px;opacity:.35;">🔍</div><div>No subjects match "<strong>'+query+'"</strong></div></div>';
  }
  return html;
}

function _tsm3RefreshUI(){
  var mySubjects=loadTchSubjects(currentUser.id);
  var ctr=document.getElementById('tsm3CounterNum');
  if(ctr)ctr.textContent=mySubjects.length;
  var hint=document.querySelector('.tsm3-search-hint');
  if(hint)hint.textContent=mySubjects.length+' of '+_countAllSubjects()+' added';
  var section=document.querySelector('.tsm3-current-section');
  if(section){
    var chipsArea=section.querySelector('.tsm3-chips-flow, .tsm3-empty-chips');
    var newHtml;
    if(mySubjects.length===0){
      newHtml='<div class="tsm3-empty-chips"><div class="tsm3-empty-chips-icon">🗂️</div><div class="tsm3-empty-chips-text">No subjects added yet<br><span>Search and add from the catalog below</span></div></div>';
    }else{
      newHtml='<div class="tsm3-chips-flow">';
      mySubjects.forEach(function(s,i){
        var col=TCH_SUBJ_COLORS[i%TCH_SUBJ_COLORS.length];
        newHtml+='<div class="tsm3-chip"><span class="tsm3-chip-color" style="background:'+col+';"></span><span class="tsm3-chip-text" title="'+s+'">'+s+'</span><button class="tsm3-chip-x" onclick="tsm3RemoveSubject(\''+s.replace(/'/g,"\\'")+'\')">×</button></div>';
      });
      newHtml+='</div>';
    }
    if(chipsArea)chipsArea.outerHTML=newHtml;
    else section.insertAdjacentHTML('beforeend',newHtml);
  }
  var q=document.getElementById('tsm3Search')?document.getElementById('tsm3Search').value:'';
  var cat=document.getElementById('tsm3Catalog');
  if(cat)cat.innerHTML=_buildTsm3Catalog(mySubjects,q);
}

function renderTchSubjectMgr(){
  _injectTsm3Styles();
  var mySubjects=loadTchSubjects(currentUser.id);
  var html='<div class="tsm3-wrap">';
  html+='<div class="tsm3-hero"><div class="tsm3-hero-bg"></div><div class="tsm3-hero-inner"><div class="tsm3-hero-icon">📚</div><div class="tsm3-hero-text"><h2 class="tsm3-hero-title">Manage Subjects</h2><p class="tsm3-hero-sub">Configure subjects you teach this semester</p></div><div class="tsm3-hero-counter"><span class="tsm3-counter-num" id="tsm3CounterNum">'+mySubjects.length+'</span><span class="tsm3-counter-lbl">teaching</span></div></div></div>';
  html+='<div class="tsm3-current-section"><div class="tsm3-section-label"><span class="tsm3-label-dot tsm3-dot-green"></span>Currently Teaching</div>';
  if(mySubjects.length===0){
    html+='<div class="tsm3-empty-chips"><div class="tsm3-empty-chips-icon">🗂️</div><div class="tsm3-empty-chips-text">No subjects added yet<br><span>Search and add from the catalog below</span></div></div>';
  }else{
    html+='<div class="tsm3-chips-flow">';
    mySubjects.forEach(function(s,i){
      var col=TCH_SUBJ_COLORS[i%TCH_SUBJ_COLORS.length];
      html+='<div class="tsm3-chip"><span class="tsm3-chip-color" style="background:'+col+';"></span><span class="tsm3-chip-text" title="'+s+'">'+s+'</span><button class="tsm3-chip-x" onclick="tsm3RemoveSubject(\''+s.replace(/'/g,"\\'")+'\')">×</button></div>';
    });
    html+='</div>';
  }
  html+='</div>';
  html+='<div class="tsm3-divider"><div class="tsm3-divider-line"></div><span class="tsm3-divider-text">Subject Catalog</span><div class="tsm3-divider-line"></div></div>';
  html+='<div class="tsm3-search-row"><div class="tsm3-search-box"><span class="tsm3-search-ico">🔍</span><input class="tsm3-search-input" type="text" id="tsm3Search" placeholder="Search subjects..." oninput="tsm3Filter()"><button class="tsm3-search-clear hidden" id="tsm3Clear" onclick="tsm3ClearSearch()">✕</button></div><div class="tsm3-search-hint">'+mySubjects.length+' of '+_countAllSubjects()+' added</div></div>';
  html+='<div class="tsm3-catalog" id="tsm3Catalog">'+_buildTsm3Catalog(mySubjects,'')+'</div>';
  html+='</div>';
  document.getElementById('tchSubjectMgrContent').innerHTML=html;
}

function tsm3Filter(){
  var q=document.getElementById('tsm3Search')?document.getElementById('tsm3Search').value:'';
  var clr=document.getElementById('tsm3Clear');
  if(clr)clr.classList.toggle('hidden',!q);
  var mySubjects=loadTchSubjects(currentUser.id);
  var cat=document.getElementById('tsm3Catalog');
  if(cat)cat.innerHTML=_buildTsm3Catalog(mySubjects,q);
}

function tsm3ClearSearch(){
  var inp=document.getElementById('tsm3Search');
  if(inp)inp.value='';
  var clr=document.getElementById('tsm3Clear');
  if(clr)clr.classList.add('hidden');
  tsm3Filter();
}

function tsm3AddSubject(subjectName){
  addTchSubject(currentUser.id,subjectName);
  _tsm3RefreshUI();
  if(currentView==='gradebook'){currentGbSubject=currentGbSubject||subjectName;renderGradebook(currentFolder,currentSection);}
  else if(currentView==='classrecord'){currentSubject=currentSubject||subjectName;renderClassRecord(currentFolder,currentSection);}
  showToast('📚 '+subjectName+' added!','success');
}

function tsm3RemoveSubject(subjectName){
  removeTchSubject(currentUser.id,subjectName);
  if(currentGbSubject===subjectName){var l=loadTchSubjects(currentUser.id);currentGbSubject=l[0]||null;}
  if(currentSubject===subjectName){var l2=loadTchSubjects(currentUser.id);currentSubject=l2[0]||null;}
  _tsm3RefreshUI();
  if(currentView==='gradebook')renderGradebook(currentFolder,currentSection);
  else if(currentView==='classrecord')renderClassRecord(currentFolder,currentSection);
  showToast('🗑️ '+subjectName+' removed.','warning');
}

// Legacy aliases
var tchAddSubject=tsm3AddSubject;
var tchRemoveSubject=tsm3RemoveSubject;
var filterTsmCatalog=tsm3Filter;

// ══ TEACHER NOTIFICATIONS (Fixed) ══
function openTeacherNotifPanel(){
  var notifs=getTeacherNotifs(currentUser.id);
  var html="";
  if(notifs.length===0)html='<div class="notif-empty">📭 No notifications yet</div>';
  else{
    notifs.forEach(function(n){
      var isRead=n.read;
      if(n.type==="subject_request"){
        // FIX: Always re-read latest invite status from storage
        var allInvites=loadInvites(),inv=null;
        for(var i=0;i<allInvites.length;i++){if(allInvites[i].id===n.inviteId){inv=allInvites[i];break;}}
        var status=inv?inv.status:"pending";
        html+='<div class="notif-item'+(isRead?"":" notif-unread")+'" id="notif_'+n.id+'">';
        html+='<div class="notif-avatar">🎓</div><div class="notif-body">';
        html+='<div class="notif-title">Subject Enrollment Request</div>';
        html+='<div class="notif-msg"><strong>'+n.studentName+'</strong> wants to enroll in <strong>'+n.subjectName+'</strong></div>';
        html+='<div class="notif-email">'+n.studentEmail+'@asiasourceicollege.edu.ph</div>';
        var stuInfo=findStudentById(n.studentId);
        if(stuInfo&&stuInfo.strand){
          var gl=getGradeLevelShort(stuInfo.strand),sn=getStrandName(stuInfo.strand),sec=getSectionLetter(stuInfo.strand);
          var isG11=stuInfo.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
          html+='<div class="notif-strand-row"><span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span><span class="strand-mini">'+sn+(sec?" - "+sec:"")+'</span></div>';
        }
        // FIX: Show action buttons only if STILL pending; otherwise show final status badge
        if(status==="pending"){
          html+='<div class="notif-actions"><button class="notif-approve" onclick="respondToInvite(\''+n.inviteId+'\',\'approved\',\''+n.id+'\')">✅ Approve</button><button class="notif-reject" onclick="respondToInvite(\''+n.inviteId+'\',\'rejected\',\''+n.id+'\')">✕ Decline</button></div>';
        }else{
          html+='<div class="notif-status '+(status==="approved"?"notif-status-ok":"notif-status-no")+'">'+(status==="approved"?"✅ Approved":"✕ Declined")+'</div>';
        }
        html+='</div></div>';
        markTeacherNotifRead(currentUser.id,n.id);
      }
    });
  }
  var panel=g("teacherNotifPanel");
  if(panel){panel.innerHTML=html;panel.classList.toggle("hidden");}
  updateTeacherNotifBadge();
}

// ══ FIXED: respondToInvite ══
function respondToInvite(inviteId,decision,notifId){
  // 1. Load fresh invites from localStorage
  var invitesList=loadInvites();
  var inv=null;
  for(var i=0;i<invitesList.length;i++){
    if(invitesList[i].id===inviteId){
      inv=invitesList[i];
      invitesList[i].status=decision;
      break;
    }
  }
  if(!inv){showToast("⚠️ Request not found.","warning");return;}

  // 2. Save invites FIRST — fires storage event in student tab immediately
  saveInvites(invitesList);

  // 3. Re-load DB fresh from localStorage (student may have registered in another tab)
  var freshDB=loadDB();
  if(freshDB&&Array.isArray(freshDB.students)){
    DB.students=freshDB.students;
    DB.teachers=freshDB.teachers;
  }

  // 4. Update student approvedSubjects if approved
  if(decision==="approved"){
    var stu=null;
    // Search fresh DB
    for(var si=0;si<DB.students.length;si++){
      if(DB.students[si].id===inv.studentId){stu=DB.students[si];break;}
    }
    if(stu){
      ensureStudentGrades(stu);
      if(!stu.approvedSubjects)stu.approvedSubjects=[];
      if(stu.approvedSubjects.indexOf(inv.subjectName)<0){
        stu.approvedSubjects.push(inv.subjectName);
      }
      addStudentToStaticRoster(stu);
      saveDB();
      showToast("✅ "+inv.studentName+" approved for "+inv.subjectName+"!","success");
    }else{
      // Student not found in DB — still save invites so student can see via invite query
      showToast("✅ Approved! Student will see the subject when they refresh.","success");
    }
  }else{
    showToast("✕ Declined: "+(inv.subjectName||""),"warning");
  }

  // 5. Refresh notification panel immediately
  openTeacherNotifPanel();
  updateTeacherNotifBadge();

  // 6. If student is logged in the SAME tab (edge case), refresh directly
  if(currentUser&&currentRole==="student"&&currentUser.id===inv.studentId){
    for(var j=0;j<DB.students.length;j++){
      if(DB.students[j].id===currentUser.id){currentUser=DB.students[j];break;}
    }
    loadStudentDash(currentUser);
  }

  // 7. Refresh teacher views
  if(currentView==="gradebook")renderGradebook(currentFolder,currentSection);
  else if(currentView==="classrecord")renderClassRecord(currentFolder,currentSection);
  else renderAttendance(currentFolder,currentSection);
}

// ══ Add Student Modal ══
function openAddStudentModal(){renderAddStudentModal();g("addStudentModal").classList.remove("hidden");document.body.style.overflow="hidden";}
function closeAddStudentModal(){g("addStudentModal").classList.add("hidden");document.body.style.overflow="";}
function renderAddStudentModal(){
  var html='<div class="add-stu-modal"><div class="add-stu-title">➕ Add Student to Gradebook</div><div class="add-stu-subtitle">Search for a student by name or email</div><div class="add-stu-search-wrap"><input class="plain-input" type="text" id="addStuSearch" placeholder="Search student name or email..." oninput="renderAddStudentList()"></div><div class="add-stu-list" id="addStuList"></div></div>';
  g("addStudentContent").innerHTML=html;renderAddStudentList();
}
function renderAddStudentList(){
  var q=(g("addStuSearch")?g("addStuSearch").value.trim().toLowerCase():"");
  var list=g("addStuList");if(!list)return;
  var html="",shown=0;
  for(var i=0;i<DB.students.length;i++){
    var stu=DB.students[i];
    if(q&&stu.name.toLowerCase().indexOf(q)<0&&stu.emailUser.toLowerCase().indexOf(q)<0)continue;
    shown++;
    var gl=getGradeLevel(stu.strand),glShort=getGradeLevelShort(stu.strand),sn=getStrandName(stu.strand),sec=getSectionLetter(stu.strand);
    var isG11=stu.strand&&stu.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
    var strandLabel=DB.strandFull[stu.strand]||stu.strand||"Unknown";
    html+='<div class="add-stu-card"><div class="astu-avatar">🎓</div><div class="astu-info"><div class="astu-name">'+stu.name+
      '<span class="gl-badge" style="margin-left:8px;background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+glShort+'</span>'+
      (sn?'<span class="strand-mini" style="margin-left:4px;">'+sn+(sec?" · "+sec:"")+'</span>':"")+
      '</div><div class="astu-email">'+stu.emailUser+'@asiasourceicollege.edu.ph</div><div class="astu-strand">'+(gl||"")+(gl&&strandLabel?" · ":"")+(strandLabel||"")+'</div></div>'+
      '<button class="astu-add-btn" onclick="addStudentToGradebook(\''+stu.id+'\')">+ Add</button></div>';
  }
  if(shown===0)html='<div class="add-stu-empty">No students found.</div>';
  list.innerHTML=html;
}
function addStudentToGradebook(stuId){
  var stu=findStudentById(stuId);if(!stu){showToast("Student not found.","error");return;}
  var subjectsToApprove=currentUser?loadTchSubjects(currentUser.id):DB.crSubjects;
  var invitesList=loadInvites();
  subjectsToApprove.forEach(function(subj){
    var exists=false;
    for(var j=0;j<invitesList.length;j++){if(invitesList[j].studentId===stuId&&invitesList[j].subjectName===subj&&invitesList[j].status==="approved"){exists=true;break;}}
    if(!exists)invitesList.push({id:"INV-TCH-"+Date.now()+"-"+Math.random().toString(36).slice(2),studentId:stuId,studentName:stu.name,studentEmail:stu.emailUser,subjectName:subj,teacherId:currentUser.id,teacherEmail:currentUser.emailUser,teacherName:currentUser.name,status:"approved",timestamp:new Date().toISOString(),addedByTeacher:true});
  });
  saveInvites(invitesList);
  if(!stu.approvedSubjects)stu.approvedSubjects=[];
  subjectsToApprove.forEach(function(s){if(stu.approvedSubjects.indexOf(s)<0)stu.approvedSubjects.push(s);});
  ensureStudentGrades(stu);addStudentToStaticRoster(stu);saveDB();
  var gl=getGradeLevel(stu.strand)||"Unknown Grade",sn=getStrandName(stu.strand)||"Unknown Strand";
  showToast("✅ "+stu.name+" ("+gl+" · "+sn+") added to gradebook!","success");
  closeAddStudentModal();
  if(currentView==="gradebook")renderGradebook(currentFolder,currentSection);
  else if(currentView==="classrecord")renderClassRecord(currentFolder,currentSection);
  else renderAttendance(currentFolder,currentSection);
}

// ══ Folder / View ══
function openFolder(el){
  var strand=el.getAttribute("data-strand"),grade=el.getAttribute("data-grade")||"G11";
  var items=document.querySelectorAll(".strand-item");for(var i=0;i<items.length;i++)items[i].className="strand-item";
  el.className="strand-item active";
  openFolderByStrand(strand,grade);
}
function openFolderByStrand(strand,grade){
  grade=grade||"G11";
  currentFolder=strand;currentGradeLevel=grade;
  var singleSection=(strand==="ICT"||strand==="ABM");
  currentSection="A";currentView="gradebook";currentQuarter="q1";
  var crSubjs=getCrSubjectsForFolder(strand,grade);
  currentGbSubject=crSubjs[0];currentSubject=crSubjs[0];
  gbSearchQuery="";currentSemFilter=0;
  var isG11=grade==="G11",glColor=isG11?"#0ea5e9":"#10b981";
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
  if(currentView==="gradebook")renderGradebook(currentFolder,sec);
  else if(currentView==="classrecord")renderClassRecord(currentFolder,sec);
  else renderAttendance(currentFolder,sec);
}
function setView(view,btn){
  currentView=view;var vtabs=document.querySelectorAll(".vtab");for(var i=0;i<vtabs.length;i++)vtabs[i].className="vtab";
  btn.className="vtab active";showView(view);
  if(view==="gradebook")renderGradebook(currentFolder,currentSection);
  else if(view==="classrecord")renderClassRecord(currentFolder,currentSection);
  else renderAttendance(currentFolder,currentSection);
}
function showView(view){
  hideEl("viewGradebook");hideEl("viewClassRecord");hideEl("viewAttendance");
  if(view==="gradebook")showEl("viewGradebook");
  else if(view==="classrecord")showEl("viewClassRecord");
  else showEl("viewAttendance");
}

// ══ SCORE SETTINGS MODAL ══
function openScoreSettingsModal(){
  renderScoreSettingsModal();
  var modal=document.getElementById("scoreSettingsModal");
  if(modal){modal.classList.remove("hidden");document.body.style.overflow="hidden";}
}
function closeScoreSettingsModal(){
  var modal=document.getElementById("scoreSettingsModal");
  if(modal){modal.classList.add("hidden");document.body.style.overflow="";}
}

function renderScoreSettingsModal(){
  var groups=[
    {id:"quiz",label:"📝 Quizzes",color:"#0ea5e9",items:[{key:"quiz1",label:"Quiz 1",desc:"1st quiz"},{key:"quiz2",label:"Quiz 2",desc:"2nd quiz"},{key:"quiz3",label:"Quiz 3",desc:"3rd quiz"}]},
    {id:"activity",label:"🎯 Activities",color:"#10b981",items:[{key:"act1",label:"Activity 1",desc:"1st activity"},{key:"act2",label:"Activity 2",desc:"2nd activity"},{key:"act3",label:"Activity 3",desc:"3rd activity"}]},
    {id:"project",label:"📁 Projects",color:"#f59e0b",items:[{key:"proj1",label:"Project 1",desc:"1st project"},{key:"proj2",label:"Project 2",desc:"2nd project"}]},
    {id:"exam",label:"📄 Exam",color:"#e8000f",items:[{key:"exam",label:"Exam",desc:"Quarter exam"}]}
  ];
  var html='';
  var totalWeight=groups.reduce(function(sum,grp){return sum+getWeight(grp.id);},0);
  var totalOk=totalWeight===100;
  html+='<div class="sm-weight-summary" id="smWeightSummary">';
  html+='<div class="sm-weight-bar-wrap">';
  groups.forEach(function(grp){
    var w=getWeight(grp.id);
    html+='<div class="sm-weight-bar-seg" style="width:'+w+'%;background:'+grp.color+';" title="'+grp.label+': '+w+'%"></div>';
  });
  html+='</div>';
  html+='<div class="sm-weight-total '+(totalOk?'sm-weight-ok':'sm-weight-err')+'" id="smWeightTotal">';
  html+='Total Weight: <strong>'+totalWeight+'%</strong>'+(totalOk?' ✅':' ⚠️ Must equal 100%');
  html+='</div></div>';
  groups.forEach(function(grp){
    var w=getWeight(grp.id);
    html+='<div class="sm-settings-section">';
    html+='<div class="sm-settings-section-hdr" style="color:'+grp.color+';">'+grp.label;
    html+='<div class="sm-weight-input-wrap">';
    html+='<span class="sm-weight-input-label">Weight:</span>';
    html+='<input class="sm-weight-input" type="number" min="0" max="100" value="'+w+'" id="weight_'+grp.id+'" oninput="onWeightChange()" style="border-color:'+grp.color+'55;color:'+grp.color+';">';
    html+='<span class="sm-weight-pct-sign" style="color:'+grp.color+';">%</span>';
    html+='</div></div>';
    html+='<div class="sm-settings-rows">';
    grp.items.forEach(function(item){
      var currentMax=getMax(item.key);
      html+='<div class="sm-settings-row"><div class="sm-settings-row-icon" style="color:'+grp.color+';">✏️</div>';
      html+='<div><div class="sm-settings-row-label">'+item.label+'</div><div class="sm-settings-row-sublabel">'+item.desc+'</div></div>';
      html+='<div class="sm-settings-max-wrap"><span class="sm-settings-max-label">Max Score:</span>';
      html+='<input class="sm-settings-max-input" type="number" min="1" max="9999" value="'+currentMax+'" id="setting_'+item.key+'" oninput="previewSettingChange(\''+item.key+'\', this.value)">';
      html+='</div></div>';
    });
    html+='</div></div>';
  });
  var bodyEl=document.getElementById("scoreSettingsBody");
  if(bodyEl)bodyEl.innerHTML=html;
}

function onWeightChange(){
  var groups=['quiz','activity','project','exam'];
  var total=0;
  groups.forEach(function(g){var inp=document.getElementById('weight_'+g);if(inp)total+=Math.max(0,parseInt(inp.value)||0);});
  var totalEl=document.getElementById('smWeightTotal');
  if(totalEl){
    totalEl.className='sm-weight-total '+(total===100?'sm-weight-ok':'sm-weight-err');
    totalEl.innerHTML='Total Weight: <strong>'+total+'%</strong>'+(total===100?' ✅':' ⚠️ Must equal 100%');
  }
  var barWrap=document.querySelector('.sm-weight-bar-wrap');
  if(barWrap){
    var segs=barWrap.querySelectorAll('.sm-weight-bar-seg');
    groups.forEach(function(grp,i){
      var inp=document.getElementById('weight_'+grp);
      var w=inp?Math.max(0,parseInt(inp.value)||0):0;
      if(segs[i])segs[i].style.width=w+'%';
    });
  }
}
function previewSettingChange(key,val){
  var input=document.getElementById("setting_"+key);
  if(input){
    var n=parseInt(val);
    input.style.borderColor=(n>0)?"#3b82f6":"#e8000f";
    input.style.color=(n>0)?"#fff":"#ff8090";
  }
}
function saveScoreSettingsFromModal(){
  var keys=["quiz1","quiz2","quiz3","act1","act2","act3","proj1","proj2","exam"];
  var weightGroups=['quiz','activity','project','exam'];
  var errors=[],newSettings={};
  keys.forEach(function(key){
    var input=document.getElementById("setting_"+key);
    if(!input)return;
    var val=parseInt(input.value);
    if(isNaN(val)||val<1)errors.push(key);
    else newSettings[key]=val;
  });
  if(errors.length>0){showToast("⚠️ Please enter valid max scores (minimum 1) for all fields.","warning");return;}
  var totalWeight=0;
  weightGroups.forEach(function(grp){
    var inp=document.getElementById('weight_'+grp);
    var w=inp?parseInt(inp.value):0;
    if(isNaN(w)||w<0)w=0;
    totalWeight+=w;
    newSettings['weight_'+grp]=w;
  });
  if(totalWeight!==100){showToast("⚠️ Weights must total exactly 100%. Currently: "+totalWeight+"%","warning");return;}
  for(var k in newSettings)scoreSettings[k]=newSettings[k];
  saveScoreSettings();
  closeScoreSettingsModal();
  if(typeof renderGradebook==='function')renderGradebook(currentFolder,currentSection);
  showToast("⚙️ Score settings saved! Gradebook updated.","success");
}
function resetScoreSettings(){
  scoreSettings=JSON.parse(JSON.stringify(DEFAULT_SCORE_SETTINGS));
  saveScoreSettings();
  renderScoreSettingsModal();
  showToast("🔄 Score settings reset to defaults.","warning");
}

// ══ GRADEBOOK ══
function setGbQuarter(q,btn){
  currentQuarter=q;var btns=document.querySelectorAll(".qtr-btn");for(var i=0;i<btns.length;i++)btns[i].className="qtr-btn";
  btn.className="qtr-btn active";renderGradebook(currentFolder,currentSection);
}
function setGbSubject(subj){currentGbSubject=subj;gbSearchQuery="";renderGradebook(currentFolder,currentSection);}
function handleGbSearch(val){gbSearchQuery=val.toLowerCase().trim();_renderGbRows(currentFolder+"-"+currentSection);}
function setSemFilter(sem){currentSemFilter=sem;currentGbSubject=null;renderGradebook(currentFolder,currentSection);}

function renderGradebook(strand,section){
  var key=strand+"-"+section;
  var crSubjs=getCrSubjectsForFolder(strand,currentGradeLevel);
  var crCols=getCrColorsForFolder(strand,currentGradeLevel);
  if(!currentGbSubject||crSubjs.indexOf(currentGbSubject)<0)currentGbSubject=crSubjs[0]||null;
  var toolbar=g("gbToolbar");
  if(toolbar){
    var pillsHtml="";
    for(var si=0;si<crSubjs.length;si++){
      var s=crSubjs[si],col=crCols[si%crCols.length],isAct=currentGbSubject===s;
      pillsHtml+='<button class="subj-btn'+(isAct?" active":"")+"\" data-subj=\""+s+"\""+
        ' style="'+(isAct?"background:"+col+";border-color:"+col+";color:#fff;":"border-color:"+col+";color:"+col+";")+'"'+
        " onclick=\"setGbSubject(this.getAttribute('data-subj'))\">"+s+'</button>';
    }
    var qtrs=["q1","q2","q3","q4"];
    if(qtrs.indexOf(currentQuarter)<0)currentQuarter=qtrs[0];
    var settingsStripHtml='<div class="gb-settings-strip">'+
      '<span class="gb-settings-strip-label">⚙️ Max Scores:</span>'+
      '<span class="gb-settings-chip" title="Quiz 1">Q1 <strong>/'+getMax("quiz1")+'</strong></span>'+
      '<span class="gb-settings-chip" title="Quiz 2">Q2 <strong>/'+getMax("quiz2")+'</strong></span>'+
      '<span class="gb-settings-chip" title="Quiz 3">Q3 <strong>/'+getMax("quiz3")+'</strong></span>'+
      '<span class="gb-settings-chip-sep">·</span>'+
      '<span class="gb-settings-chip" title="Activity 1">A1 <strong>/'+getMax("act1")+'</strong></span>'+
      '<span class="gb-settings-chip" title="Activity 2">A2 <strong>/'+getMax("act2")+'</strong></span>'+
      '<span class="gb-settings-chip" title="Activity 3">A3 <strong>/'+getMax("act3")+'</strong></span>'+
      '<span class="gb-settings-chip-sep">·</span>'+
      '<span class="gb-settings-chip" title="Project 1">P1 <strong>/'+getMax("proj1")+'</strong></span>'+
      '<span class="gb-settings-chip" title="Project 2">P2 <strong>/'+getMax("proj2")+'</strong></span>'+
      '<span class="gb-settings-chip-sep">·</span>'+
      '<span class="gb-settings-chip" title="Exam">Exam <strong>/'+getMax("exam")+'</strong></span>'+
      '<button class="gb-settings-edit-link" onclick="openScoreSettingsModal()">✏️ Edit</button>'+
      '</div>';
    toolbar.innerHTML=settingsStripHtml+
      '<div class="gb-toolbar-inner" style="margin-bottom:10px;"><span class="toolbar-lbl">Subject:</span><div class="subj-pills">'+pillsHtml+'<button class="subj-add-btn" onclick="openTchSubjectMgr()" title="Manage Subjects">＋ Add Subject</button></div></div>'+
      '<div class="gb-toolbar-inner"><span class="toolbar-lbl">Quarter:</span>'+
      '<div class="qtr-tabs">'+qtrs.map(function(q){return'<button class="qtr-btn'+(currentQuarter===q?" active":"")+"\" onclick=\"setGbQuarter('"+q+"',this)\">"+q.toUpperCase()+'</button>';}).join('')+'</div>'+
      '<div class="gb-search-wrap"><span class="gb-search-icon">🔍</span>'+
      '<input class="gb-search-input" type="text" placeholder="Search student..." value="'+gbSearchQuery+'" oninput="handleGbSearch(this.value)">'+
      (gbSearchQuery?'<button class="gb-search-clear" onclick="handleGbSearch(\'\');document.querySelector(\'.gb-search-input\').value=\'\'">✕</button>':"")+
      '</div>'+
      '<button class="save-qtr-btn" onclick="saveQuarterGrades(\''+key+'\')">💾 Save '+currentQuarter.toUpperCase()+(currentGbSubject?' — '+currentGbSubject:'')+'</button>'+
      '</div>';
  }
  var gbSubjTh=g("gbSubjTh");if(gbSubjTh)gbSubjTh.textContent=currentGbSubject+" Grade ("+currentQuarter.toUpperCase()+")";
  var subHeaders=document.querySelectorAll(".gb-sub-th");
  if(subHeaders.length>=9){
    subHeaders[0].innerHTML='Q1 <span class="gb-dynamic-max">/'+getMax("quiz1")+'</span>';
    subHeaders[1].innerHTML='Q2 <span class="gb-dynamic-max">/'+getMax("quiz2")+'</span>';
    subHeaders[2].innerHTML='Q3 <span class="gb-dynamic-max">/'+getMax("quiz3")+'</span>';
    subHeaders[3].innerHTML='A1 <span class="gb-dynamic-max">/'+getMax("act1")+'</span>';
    subHeaders[4].innerHTML='A2 <span class="gb-dynamic-max">/'+getMax("act2")+'</span>';
    subHeaders[5].innerHTML='A3 <span class="gb-dynamic-max">/'+getMax("act3")+'</span>';
    subHeaders[6].innerHTML='P1 <span class="gb-dynamic-max">/'+getMax("proj1")+'</span>';
    subHeaders[7].innerHTML='P2 <span class="gb-dynamic-max">/'+getMax("proj2")+'</span>';
    subHeaders[8].innerHTML='Exam <span class="gb-dynamic-max">/'+getMax("exam")+'</span>';
  }
  _renderGbRows(key);
}

function _renderGbRows(key){
  var r=getDynamicRoster(key,currentGradeLevel);
  var tbody=g("gbBody");tbody.innerHTML="";
  var q=gbSearchQuery,COLSPAN=14;
  function matchesSearch(name){if(!q)return true;return name.toLowerCase().indexOf(q)>=0;}
  var rowNum=0;
  function inp(comp,val,sk){
    var mx=getMax(comp);
    var da=' data-sk="'+sk+'" data-subj="'+currentGbSubject+'" data-qtr="'+currentQuarter+'" data-comp="'+comp+'" data-max="'+mx+'"';
    return'<div class="score-input-wrap"><input class="score-input" type="number" min="0" max="'+mx+'" value="'+val+'" placeholder="—"'+da+' oninput="handleScoreInput(this)"><span class="score-input-max-hint">/'+mx+'</span></div>';
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
      var glBadge="";
      if(entry.isRegistered&&entry.strand){
        var gl=getGradeLevelShort(entry.strand),sn=getStrandName(entry.strand);
        var isG11=entry.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
        glBadge='<span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span><span class="strand-mini">'+sn+'</span>';
      }
      var displayName=name;
      if(q){var idx=name.toLowerCase().indexOf(q);if(idx>=0)displayName=name.slice(0,idx)+'<mark class="gb-hl">'+name.slice(idx,idx+q.length)+'</mark>'+name.slice(idx+q.length);}
      rowNum++;
      tbody.innerHTML+='<tr>'+
        '<td>'+rowNum+'</td>'+
        '<td class="gb-name-cell"><div class="student-name-wrap">'+displayName+glBadge+'</div></td>'+
        '<td>'+inp("quiz1",sc.quiz1,sk)+'</td><td>'+inp("quiz2",sc.quiz2,sk)+'</td><td>'+inp("quiz3",sc.quiz3,sk)+'</td>'+
        '<td>'+inp("act1",sc.act1,sk)+'</td><td>'+inp("act2",sc.act2,sk)+'</td><td>'+inp("act3",sc.act3,sk)+'</td>'+
        '<td>'+inp("proj1",sc.proj1,sk)+'</td><td>'+inp("proj2",sc.proj2,sk)+'</td>'+
        '<td>'+inp("exam",sc.exam,sk)+'</td>'+
        '<td id="fg-'+sk+"-"+currentGbSubject+"-"+currentQuarter+'">'+(fg!==null?'<span class="final-badge '+bc+'">'+fg+'</span>':"—")+'</td>'+
        '<td id="rem-'+sk+"-"+currentGbSubject+"-"+currentQuarter+'" style="font-size:11px;font-weight:600;color:'+gradeColor(fg)+'">'+getRemarks(fg)+'</td>'+
        '<td class="gb-subj-grade-col"><span class="subj-saved-badge'+(stuSubjGrade!=="—"?" has-grade":"")+'">'+stuSubjGrade+'</span></td>'+
        '</tr>';
    }
  }
  makeRows(r.male,"male");makeRows(r.female,"female");
  if(tbody.innerHTML==="")tbody.innerHTML='<tr><td colspan="'+COLSPAN+'" class="gb-no-results">'+(currentGbSubject?"No students found.":"<div class=\"gb-no-subject-state\">📚 No subject selected yet.<br><small>Click <strong>＋ Add Subject</strong> above to get started.</small></div>")+'</td></tr>';
}

function handleScoreInput(input){
  var sk=input.getAttribute("data-sk"),subj=input.getAttribute("data-subj"),qtr=input.getAttribute("data-qtr"),comp=input.getAttribute("data-comp"),val=input.value;
  var mx=getMax(comp);
  if(val!==""&&Number(val)>mx){input.value=mx;val=String(mx);}
  setScore(sk,subj,qtr,comp,val);
  var sc=getScores(sk,subj,qtr),fg=computeDetailedGrade(sc);
  var fgEl=g("fg-"+sk+"-"+subj+"-"+qtr),remEl=g("rem-"+sk+"-"+subj+"-"+qtr);
  if(fgEl)fgEl.innerHTML=(fg!==null)?'<span class="final-badge '+badgeClass(fg)+'">'+fg+'</span>':"—";
  if(remEl){remEl.textContent=getRemarks(fg);remEl.style.color=gradeColor(fg);}
  saveGrades();
}
function saveQuarterGrades(classKey){
  var r=getDynamicRoster(classKey,currentGradeLevel);var saved=0,skipped=0;
  function process(entries,genderLabel){for(var i=0;i<entries.length;i++){var sk=getScoreStoreKey(classKey,genderLabel,i),sc=getScores(sk,currentGbSubject,currentQuarter),fg=computeDetailedGrade(sc);if(fg===null){skipped++;continue;}setRosterGrade(classKey,entries[i].name,currentGbSubject,currentQuarter,fg);saved++;}}
  process(r.male,"male");process(r.female,"female");
  saveDB();saveGrades();
  showToast(saved>0?"💾 ["+currentGbSubject+"] "+currentQuarter.toUpperCase()+" — "+saved+" grade(s) saved! ✅":"⚠️ No scores found. Enter scores first.",saved>0?"success":"warning");
  renderGradebook(currentFolder,currentSection);
}

// ══ Class Record ══
function setCrSubject(subj){currentSubject=subj;renderClassRecord(currentFolder,currentSection);}
function setCrSemFilter(sem){currentSemFilter=sem;currentSubject=null;renderClassRecord(currentFolder,currentSection);}

function renderClassRecord(strand,section){
  var key=strand+"-"+section,r=getDynamicRoster(key,currentGradeLevel);
  var crSubjs=getCrSubjectsForFolder(strand,currentGradeLevel);
  var crCols=getCrColorsForFolder(strand,currentGradeLevel);
  if(!currentSubject||crSubjs.indexOf(currentSubject)<0)currentSubject=crSubjs[0]||null;
  var subjColor=currentSubject?(crCols[crSubjs.indexOf(currentSubject)%crCols.length]||"#374151"):"#374151";
  var subjDark=darken(subjColor,-28);
  var crToolbar=g("crToolbar");
  if(crToolbar){
    var pillsHtml="";
    for(var si=0;si<crSubjs.length;si++){
      var s=crSubjs[si],col=crCols[si%crCols.length],isActive=currentSubject===s;
      pillsHtml+='<button class="subj-btn'+(isActive?" active":"")+"\" data-subj=\""+s+"\""+
        ' style="'+(isActive?"background:"+col+";border-color:"+col+";color:#fff;":"border-color:"+col+";color:"+col+";")+'"'+
        " onclick=\"setCrSubject(this.getAttribute('data-subj'))\">"+s+'</button>';
    }
    crToolbar.innerHTML='<div class="cr-toolbar-inner"><span class="toolbar-lbl">Subject:</span><div class="subj-pills">'+pillsHtml+'<button class="subj-add-btn" onclick="openTchSubjectMgr()" title="Manage Subjects">＋ Add Subject</button></div><button class="save-qtr-btn" onclick="saveCrGrades(\''+key+'\')">💾 Save All Quarters</button></div>';
  }
  var thead=g("crHead");
  if(thead){
    thead.innerHTML='<tr>'+
      '<th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2)">#</th>'+
      '<th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">STUDENT NAME</th>'+
      '<th class="cr-th cr-subj-hdr" colspan="3" style="background:'+subjColor+'">'+(currentSubject||"No Subject")+'</th></tr>'+
      '<tr>'+
      '<th class="cr-th cr-qtr-hdr" style="background:rgba(14,165,233,0.35);color:#38bdf8;">1st Semester<div style="font-size:9px;opacity:.7;">Q1 + Q2</div></th>'+
      '<th class="cr-th cr-qtr-hdr" style="background:rgba(16,185,129,0.35);color:#34d399;">2nd Semester<div style="font-size:9px;opacity:.7;">Q3 + Q4</div></th>'+
      '<th class="cr-th cr-final-hdr" style="background:'+subjDark+'">FINAL</th></tr>';
  }
  var tbody=g("crBody");tbody.innerHTML="";
  function makeCrRows(entries,genderLabel){
    tbody.innerHTML+='<tr><td colspan="5" class="cr-gender-row '+(genderLabel==="female"?"cr-female-row":"")+'">'+(genderLabel==="male"?"👨 MALE":"👩 FEMALE")+"</td></tr>";
    for(var i=0;i<entries.length;i++){
      var entry=entries[i],name=entry.name,alt=(i%2!==0)?"cr-alt":"",ck=genderLabel+"-"+i;
      var stuSubjQ=getAllRosterGrades(key,name,currentSubject);
      var stuDb=findStudentByName(name);
      if(stuDb){ensureStudentGrades(stuDb);if(stuDb.grades[currentSubject]){var dbGr=stuDb.grades[currentSubject];if(!stuSubjQ.q1&&dbGr.q1)stuSubjQ.q1=dbGr.q1;if(!stuSubjQ.q2&&dbGr.q2)stuSubjQ.q2=dbGr.q2;if(!stuSubjQ.q3&&dbGr.q3)stuSubjQ.q3=dbGr.q3;if(!stuSubjQ.q4&&dbGr.q4)stuSubjQ.q4=dbGr.q4;}}
      var q1=stuSubjQ.q1||"",q2=stuSubjQ.q2||"",q3=stuSubjQ.q3||"",q4=stuSubjQ.q4||"";
      var sem1g=avgGrade(q1,q2),sem2g=avgGrade(q3,q4),fg=avgGrade(q1,q2,q3,q4);
      var da=' data-key="'+key+'" data-ck="'+ck+'" data-subj="'+currentSubject+'" data-stuname="'+name+'"';
      var glBadge="";
      if(entry.isRegistered&&entry.strand){
        var gl=getGradeLevelShort(entry.strand),sn=getStrandName(entry.strand);
        var isG11=entry.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
        glBadge='<span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span><span class="strand-mini">'+sn+'</span>';
      }
      tbody.innerHTML+='<tr class="cr-row '+alt+'"><td class="cr-td cr-sticky cr-num-col cr-num-td">'+(i+1)+'</td>'+
        '<td class="cr-td cr-sticky cr-name-col cr-name-td"><div class="student-name-wrap">'+name+glBadge+'</div></td>'+
        '<td class="cr-td cr-score-td" style="background:rgba(14,165,233,0.06);"><input class="cr-input" type="number" min="0" max="100" value="'+q1+'" placeholder="—"'+da+' data-q="q1" oninput="handleCrInput(this)"> / <input class="cr-input" type="number" min="0" max="100" value="'+q2+'" placeholder="—"'+da+' data-q="q2" oninput="handleCrInput(this)"><div style="font-size:10px;color:'+(sem1g?gradeColor(sem1g):"var(--muted)")+';font-weight:800;margin-top:2px;">'+(sem1g||"—")+'</div></td>'+
        '<td class="cr-td cr-score-td" style="background:rgba(16,185,129,0.06);"><input class="cr-input" type="number" min="0" max="100" value="'+q3+'" placeholder="—"'+da+' data-q="q3" oninput="handleCrInput(this)"> / <input class="cr-input" type="number" min="0" max="100" value="'+q4+'" placeholder="—"'+da+' data-q="q4" oninput="handleCrInput(this)"><div style="font-size:10px;color:'+(sem2g?gradeColor(sem2g):"var(--muted)")+';font-weight:800;margin-top:2px;">'+(sem2g||"—")+'</div></td>'+
        '<td class="cr-td cr-final-td" id="crf-'+key+"-"+ck+'">'+(fg?'<span class="cr-final-badge '+badgeClass(fg)+'">'+fg+'</span>':"—")+'</td></tr>';
    }
  }
  makeCrRows(r.male,"male");makeCrRows(r.female,"female");
}

function handleCrInput(input){
  var key=input.getAttribute("data-key"),ck=input.getAttribute("data-ck"),subj=input.getAttribute("data-subj"),qkey=input.getAttribute("data-q"),stuName=input.getAttribute("data-stuname"),val=input.value;
  setRosterGrade(key,stuName,subj,qkey,val);
  var allQ=getAllRosterGrades(key,stuName,subj);
  var fg=avgGrade(allQ.q1,allQ.q2,allQ.q3,allQ.q4),fEl=g("crf-"+key+"-"+ck);
  if(fEl)fEl.innerHTML=fg?'<span class="cr-final-badge '+badgeClass(fg)+'">'+fg+'</span>':"—";
  saveDB();saveGrades();
  var cell=input.parentElement,semDiv=cell.querySelector("div[style]");
  if(semDiv){
    if(qkey==="q1"||qkey==="q2"){var q1v=getAllRosterGrades(key,stuName,subj).q1||"",q2v=getAllRosterGrades(key,stuName,subj).q2||"",s1=avgGrade(q1v,q2v);semDiv.textContent=s1||"—";semDiv.style.color=s1?gradeColor(s1):"var(--muted)";}
    else{var q3v=getAllRosterGrades(key,stuName,subj).q3||"",q4v=getAllRosterGrades(key,stuName,subj).q4||"",s2=avgGrade(q3v,q4v);semDiv.textContent=s2||"—";semDiv.style.color=s2?gradeColor(s2):"var(--muted)";}
  }
}
function saveCrGrades(key){saveDB();saveGrades();showToast("💾 ["+currentSubject+"] all quarter grades saved! ✅","success");}

// ══ Attendance ══
function renderAttendance(strand,section){
  var key=strand+"-"+section,r=getDynamicRoster(key,currentGradeLevel);
  if(!attStore[key])attStore[key]={};
  var mRow=g("attMonthRow"),dRow=g("attDayRow");
  mRow.innerHTML='<th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2);">#</th><th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">NAMES OF LEARNERS</th><th class="cr-th att-total-hdr" colspan="2" style="background:#7a0006;">YEARLY TOTAL</th>';
  dRow.innerHTML='<th class="cr-th att-total-sub" style="background:#9b1c1c;">ABS</th><th class="cr-th att-total-sub" style="background:#14532d;">PRS</th>';
  for(var mi=0;mi<DB.months.length;mi++){
    var mon=DB.months[mi],mbg=DB.monthColors[mi];
    mRow.innerHTML+='<th class="cr-th cr-subj-hdr" colspan="'+(mon.days+2)+'" style="background:'+mbg+'">'+mon.name+'</th>';
    for(var d=1;d<=mon.days;d++)dRow.innerHTML+='<th class="cr-th att-day-hdr" style="background:'+mbg+'">'+d+'</th>';
    dRow.innerHTML+='<th class="cr-th att-sub-hdr" style="background:#374151;">ABS</th><th class="cr-th att-sub-hdr" style="background:#14532d;">PRS</th>';
  }
  var tbody=g("attBody");tbody.innerHTML="";
  var totalCols=2+2+DB.months.reduce(function(a,m){return a+m.days+2;},0);
  function makeAttRows(entries,genderLabel){
    tbody.innerHTML+='<tr><td colspan="'+totalCols+'" class="cr-gender-row '+(genderLabel==="female"?"cr-female-row":"")+'">'+(genderLabel==="male"?"👨 MALE":"👩 FEMALE")+"</td></tr>";
    for(var i=0;i<entries.length;i++){
      var entry=entries[i],name=entry.name,ak=genderLabel+"-"+i;
      if(!attStore[key][ak])attStore[key][ak]={};
      var alt=(i%2!==0)?"cr-alt":"";
      var glBadge="";
      if(entry.isRegistered&&entry.strand){
        var gl=getGradeLevelShort(entry.strand),sn=getStrandName(entry.strand);
        var isG11=entry.strand.indexOf("G11")>=0,glColor=isG11?"#0ea5e9":"#10b981";
        glBadge='<span class="gl-badge" style="background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+gl+'</span><span class="strand-mini">'+sn+'</span>';
      }
      var html='<tr class="cr-row '+alt+'"><td class="cr-td cr-sticky cr-num-col cr-num-td">'+(i+1)+'</td>'+
        '<td class="cr-td cr-sticky cr-name-col cr-name-td"><div class="student-name-wrap">'+name+glBadge+'</div></td>'+
        '<td class="cr-td att-total-cell" id="att-yabs-'+key+"-"+ak+'">—</td><td class="cr-td att-total-cell" id="att-yprs-'+key+"-"+ak+'">—</td>';
      for(var mi2=0;mi2<DB.months.length;mi2++){
        if(!attStore[key][ak][mi2])attStore[key][ak][mi2]={};var mon2=DB.months[mi2];
        for(var dd=0;dd<mon2.days;dd++){var val=attStore[key][ak][mi2][dd]||"";var cc=val==="A"?"att-a-cell":val==="P"?"att-p-cell":val==="L"?"att-l-cell":"";html+='<td class="cr-td att-day-cell"><input class="att-input '+cc+'" maxlength="1" value="'+val+'" data-key="'+key+'" data-ak="'+ak+'" data-mi="'+mi2+'" data-day="'+dd+'" oninput="handleAttInput(this)"></td>';}
        html+='<td class="cr-td att-count-cell" id="att-abs-'+key+"-"+ak+"-"+mi2+'">—</td><td class="cr-td att-count-cell" id="att-prs-'+key+"-"+ak+"-"+mi2+'">—</td>';
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
  if(currentRole==="student"&&currentUser){
    var photoData=loadStudentPhoto(currentUser.id);
    var preview=g("pmPhotoPreviewImg"),placeholder=g("pmPhotoPlaceholder");
    if(photoData){if(preview){preview.src=photoData;preview.classList.remove("hidden");}if(placeholder)placeholder.style.display="none";}
    else{if(preview){preview.src="";preview.classList.add("hidden");}if(placeholder)placeholder.style.display="";}
    applyStudentPhoto(currentUser.id,photoData);
  }
  var photoTab=g("pmTabPhoto");if(photoTab)photoTab.style.display=isTeacher?"none":"";
  switchPmTab("info",g("pmTabInfo"));
  g("profileModal").classList.remove("hidden");document.body.style.overflow="hidden";
}
function closeProfileModal(){g("profileModal").classList.add("hidden");document.body.style.overflow="";}
function switchPmTab(tab,btn){
  var tabs=document.querySelectorAll(".pm-tab");for(var i=0;i<tabs.length;i++)tabs[i].className="pm-tab";
  btn.className="pm-tab active";
  ["pmPanelInfo","pmPanelPass","pmPanelPhoto"].forEach(function(id){var p=g(id);if(p)p.className="pm-panel hidden";});
  if(tab==="info"&&g("pmPanelInfo"))g("pmPanelInfo").className="pm-panel";
  else if(tab==="password"&&g("pmPanelPass"))g("pmPanelPass").className="pm-panel";
  else if(tab==="photo"&&g("pmPanelPhoto"))g("pmPanelPhoto").className="pm-panel";
}
function saveProfileInfo(){
  hideAlert("pmInfoAlert");hideAlert("pmInfoSuccess");
  var newName=g("pmEditName").value.trim(),newAddr=g("pmEditAddress").value.trim();
  var newGender=g("pmEditGender")?g("pmEditGender").value:"",newMobile=g("pmEditMobile")?g("pmEditMobile").value.trim():"",newCity=g("pmEditCity")?g("pmEditCity").value.trim():"";
  if(!newName){showAlert("pmInfoAlert","Please enter your full name.");return;}
  var isTeacher=(currentRole==="teacher"),list=isTeacher?DB.teachers:DB.students;
  for(var i=0;i<list.length;i++){
    if(list[i].id===currentUser.id){
      list[i].name=newName;list[i].address=newAddr;list[i].gender=newGender;list[i].mobile=newMobile;list[i].city=newCity;
      if(!isTeacher){var ns=g("pmEditStrand").value;if(ns)list[i].strand=ns;}
      currentUser=list[i];break;
    }
  }
  saveDB();
  if(g("pmName"))g("pmName").textContent=currentUser.name;if(g("pmInfoName"))g("pmInfoName").textContent=currentUser.name;
  if(g("pmInfoGender"))g("pmInfoGender").textContent=currentUser.gender||"—";if(g("pmInfoMobile"))g("pmInfoMobile").textContent=currentUser.mobile||"—";
  if(g("pmInfoAddress"))g("pmInfoAddress").textContent=currentUser.address||"—";if(g("pmInfoCity"))g("pmInfoCity").textContent=currentUser.city||"—";
  if(!isTeacher&&g("pmInfoStrand"))g("pmInfoStrand").textContent=DB.strandFull[currentUser.strand]||currentUser.strand||"—";
  if(isTeacher){if(g("tchProfileName"))g("tchProfileName").textContent=currentUser.name;if(g("tchName"))g("tchName").textContent=currentUser.name;}
  else{if(g("stuProfileName"))g("stuProfileName").textContent=currentUser.name;if(g("stuName"))g("stuName").textContent=currentUser.name;loadStudentDash(currentUser);}
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

document.addEventListener("click",function(e){
  var notifPanel=g("teacherNotifPanel");
  if(notifPanel&&!notifPanel.classList.contains("hidden")){
    var notifWrap=notifPanel.closest(".notif-wrap");
    if(notifWrap&&!notifWrap.contains(e.target))notifPanel.classList.add("hidden");
  }
});

// ══════════════════════════════════════════════════════════════════
// REAL-TIME CROSS-TAB SYNC
// When teacher approves/rejects in another tab, student dashboard
// auto-refreshes immediately via the storage event + polling fallback.
// ══════════════════════════════════════════════════════════════════

var _stuPollInterval = null;
var _stuLastInviteSnapshot = null;

function _getInviteSnapshot(studentId) {
  var invites = loadInvites();
  return JSON.stringify(
    invites
      .filter(function(inv) { return inv.studentId === studentId; })
      .map(function(inv) { return { id: inv.id, status: inv.status, subjectName: inv.subjectName }; })
  );
}

function _checkAndRefreshStudentDash() {
  if (!currentUser || currentRole !== 'student') return;

  // Re-sync DB from localStorage (in case teacher updated it in another tab)
  var freshDB = loadDB();
  if (freshDB && Array.isArray(freshDB.students)) {
    DB.students = freshDB.students;
    DB.teachers = freshDB.teachers;
  }

  var newSnapshot = _getInviteSnapshot(currentUser.id);

  if (_stuLastInviteSnapshot === null) {
    _stuLastInviteSnapshot = newSnapshot;
    return;
  }

  if (newSnapshot === _stuLastInviteSnapshot) return;

  // Something changed — figure out what
  var oldData = [];
  try { oldData = JSON.parse(_stuLastInviteSnapshot); } catch(e) {}
  var newData = [];
  try { newData = JSON.parse(newSnapshot); } catch(e) {}

  // Update snapshot FIRST before async UI work
  _stuLastInviteSnapshot = newSnapshot;

  var newlyApproved = [];
  var newlyRejected = [];

  newData.forEach(function(inv) {
    var old = null;
    for (var i = 0; i < oldData.length; i++) {
      if (oldData[i].id === inv.id) { old = oldData[i]; break; }
    }
    if (!old) {
      // Brand new invite entry — not a status change
      return;
    }
    if (old.status !== 'approved' && inv.status === 'approved') {
      newlyApproved.push(inv.subjectName);
    }
    if (old.status !== 'rejected' && inv.status === 'rejected') {
      newlyRejected.push(inv.subjectName);
    }
  });

  // Re-sync currentUser from DB
  for (var i = 0; i < DB.students.length; i++) {
    if (DB.students[i].id === currentUser.id) {
      currentUser = DB.students[i];
      break;
    }
  }

  // Refresh dashboard
  loadStudentDash(currentUser);

  // Show toasts
  newlyApproved.forEach(function(subj) {
    showToast('✅ "' + subj + '" approved! It now appears in your subjects.', 'success');
  });
  newlyRejected.forEach(function(subj) {
    showToast('✕ "' + subj + '" enrollment request was declined.', 'warning');
  });
}

function startStudentPolling() {
  stopStudentPolling();
  if (!currentUser || currentRole !== 'student') return;
  _stuLastInviteSnapshot = _getInviteSnapshot(currentUser.id);
  // Poll every 3 seconds
  _stuPollInterval = setInterval(_checkAndRefreshStudentDash, 3000);
}

function stopStudentPolling() {
  if (_stuPollInterval) {
    clearInterval(_stuPollInterval);
    _stuPollInterval = null;
  }
  _stuLastInviteSnapshot = null;
}

// storage event = instant cross-tab detection (same browser, different tabs)
window.addEventListener('storage', function(e) {
  if (!currentUser) return;

  if (e.key === LS_INVITES && currentRole === 'student') {
    // Re-read and compare
    _checkAndRefreshStudentDash();
  }

  if (e.key === LS_KEY) {
    var freshDB = loadDB();
    if (freshDB && Array.isArray(freshDB.students)) {
      DB.students = freshDB.students;
      DB.teachers = freshDB.teachers;
      if (currentRole === 'student') {
        for (var i = 0; i < DB.students.length; i++) {
          if (DB.students[i].id === currentUser.id) {
            currentUser = DB.students[i];
            break;
          }
        }
        loadStudentDash(currentUser);
      }
    }
  }
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){
    closeSubjectModal();closeProfileModal();closeTcModal();closeAddSubjectModal();closeAddStudentModal();closeScoreSettingsModal();closeTchSubjectMgr();
    var np=g("teacherNotifPanel");if(np&&!np.classList.contains("hidden"))np.classList.add("hidden");
  }
});

// ══ INIT ══
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
      tick+=.008;
      nodes.forEach(function(n){n.x+=n.vx;n.y+=n.vy;n.pulse+=.02;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;var mx=mouse.x-n.x,my=mouse.y-n.y,md=Math.sqrt(mx*mx+my*my);if(md<120&&md>0){n.x+=mx/md*.3;n.y+=my/md*.3;}var op=n.baseOpacity*(.7+.3*Math.sin(n.pulse));ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fillStyle="rgba(232,0,15,"+op+")";ctx.fill();});
      var maxDist=140;
      for(var i=0;i<nodes.length;i++){for(var j=i+1;j<nodes.length;j++){var dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y,dist=Math.sqrt(dx*dx+dy*dy);if(dist<maxDist){var alpha=(1-dist/maxDist)*.22,nmx=(nodes[i].x+nodes[j].x)/2-mouse.x,nmy=(nodes[i].y+nodes[j].y)/2-mouse.y,nearMouse=Math.sqrt(nmx*nmx+nmy*nmy)<100;ctx.strokeStyle=nearMouse?"rgba(255,184,0,"+(alpha*1.8)+")":"rgba(200,0,20,"+alpha+")";ctx.lineWidth=nearMouse?1.2:.7;ctx.beginPath();ctx.moveTo(nodes[i].x,nodes[i].y);ctx.lineTo(nodes[j].x,nodes[j].y);ctx.stroke();}}}
      requestAnimationFrame(draw);
    }draw();
  })();
})();

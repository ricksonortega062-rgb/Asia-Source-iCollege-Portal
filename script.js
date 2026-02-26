/* ============================================================
   Asia Source iCollege — Portal Script (Refactored)
   Sections:
     1.  Constants & Storage Keys
     2.  Subject Catalog & Colors
     3.  Score Settings (DepEd Groups — WW / PT / Exam)
     4.  Database (Default Data, Load/Save)
     5.  Utility Helpers
     6.  Teacher Subject Manager
     7.  Invite / Notification Helpers
     8.  Auth (Login, Signup, Terms)
     9.  Student Dashboard & Subject Detail
    10.  Teacher Dashboard & Notifications
    11.  Folder / View Routing
    12.  Gradebook (Render, Input, Save)
    13.  Class Record
    14.  Attendance
    15.  Score Settings Modal
    16.  Profile Modal
    17.  Real-Time Sync (Polling + Storage Event)
    18.  Init
   ============================================================ */

/* ============================================================
   1. CONSTANTS & STORAGE KEYS
   ============================================================ */
var LS_KEY              = "asiasource_db_v5";
var LS_GRADES           = "asiasource_grades_v5";
var LS_NOTIFS           = "asiasource_notifs_v5";
var LS_INVITES          = "asiasource_invites_v5";
var LS_SCORE_SETTINGS   = "asiasource_score_settings_v1";
var LS_TCH_SUBJECTS     = "asiasource_tch_subjects_v1";
var LS_SCORE_SETTINGS_V2 = "asiasource_score_settings_v2";

/* ============================================================
   2. SUBJECT CATALOG & COLORS
   ============================================================ */
var ALL_SHS_SUBJECTS = {
  "Core Subjects": [
    "21st Century Literature from the Philippines and the World",
    "Contemporary Philippine Arts from the Regions",
    "Disaster Readiness and Risk Reduction",
    "Earth and Life Science", "Earth Science", "General Mathematics",
    "Introduction to Philosophy of the Human Person",
    "Komunikasyon at Pananaliksik sa Wika at Kulturang Pilipino",
    "Media and Information Literacy", "Oral Communication in Context",
    "Pagbasa at Pagsusuri ng Iba't ibang Teksto Tungo sa Pananaliksik",
    "Personal Development",
    "Physical Education and Health (Grade 11)", "Physical Education and Health (Grade 12)",
    "Physical Science", "Reading and Writing Skills", "Statistics and Probability",
    "Understanding Culture, Society and Politics"
  ],
  "Applied Subjects": [
    "Empowerment Technologies", "English for Academic and Professional Purposes",
    "Entrepreneurship",
    "Filipino sa Piling Larang (Akademik)", "Filipino sa Piling Larang (Isports)",
    "Filipino sa Piling Larang (Sining at Disenyo)", "Filipino sa Piling Larang (Teknikal-Bokasyunal)",
    "Inquiries, Investigations and Immersion", "Practical Research 1", "Practical Research 2"
  ],
  "Specialized — ABM": [
    "Applied Economics", "Bus. Ethics and Social Responsibility", "Bus. Finance", "Bus. Math",
    "Fund. of Accountancy, Bus, and Mgt 1", "Fund. of Accountancy, Bus, and Mgt 2",
    "Organization and Management", "Principles of Marketing"
  ],
  "Specialized — HUMSS": [
    "Community Engagement, Solidarity and Citizenship", "Creative Nonfiction", "Creative Writing",
    "Culminating Activity", "Disciplines and Ideas in the Applied Social Sciences",
    "Disciplines and Ideas in the Social Sciences", "Introduction of World Religions and Belief System",
    "Malikhaing Pagsulat", "Philippines Politics and Governance",
    "Trend, Networks, and Critical Thinking in the 21st Century"
  ],
  "Specialized — STEM": [
    "Basic Calculus", "Biology 1", "Biology 2", "General Chemistry 1", "General Chemistry 2",
    "General Physics 1", "General Physics 2", "Pre-Calculus"
  ],
  "Specialized — TVL": [
    "Net Programming 1", "Net Programming 2", "Bread and Pastry Production",
    "Cookery 11", "Cookery 12", "Food and Beverage Services"
  ]
};

var TCH_SUBJ_COLORS = [
  "#e8000f","#0ea5e9","#f59e0b","#10b981","#8b5cf6","#f97316",
  "#ec4899","#06b6d4","#14b8a6","#6366f1","#84cc16","#a855f7",
  "#ef4444","#3b82f6","#eab308","#22c55e","#b45309","#1e40af","#166534","#9d174d"
];

var Q_LABELS = { q1:"Quarter 1", q2:"Quarter 2", q3:"Quarter 3", q4:"Quarter 4" };

/* ============================================================
   3. SCORE SETTINGS — DepEd: Written Works / Performance Tasks / Quarterly Exam
   ============================================================ */

// Group metadata (no "project" — DepEd Table 5)
var GROUP_META = {
  quiz:     { label:"📝 Written Works",     color:"#0ea5e9", defaultLabel:"WW",    defaultMax:20,  short:"WW"   },
  activity: { label:"🎯 Performance Tasks", color:"#10b981", defaultLabel:"PTask", defaultMax:20,  short:"PT"   },
  exam:     { label:"📄 Quarterly Exam",    color:"#e8000f", defaultLabel:"Exam",  defaultMax:100, short:"Exam" }
};

var GROUP_LABELS = {
  quiz:     "📝 Written Works",
  activity: "🎯 Performance Tasks",
  exam:     "📄 Quarterly Exam"
};

// Default groups (DepEd-aligned, no project)
var DEFAULT_SCORE_GROUPS = {
  quiz:     { weight:25, items:[{label:"WW 1",max:20},{label:"WW 2",max:20},{label:"WW 3",max:20}] },
  activity: { weight:50, items:[{label:"PT 1",max:20},{label:"PT 2",max:20},{label:"PT 3",max:20}] },
  exam:     { weight:25, items:[{label:"Exam",max:100}] }
};

var scoreGroups = JSON.parse(JSON.stringify(DEFAULT_SCORE_GROUPS));

function loadScoreGroupSettings() {
  try {
    var raw = localStorage.getItem(LS_SCORE_SETTINGS_V2);
    if (raw) {
      var d = JSON.parse(raw);
      if (d && d.quiz && d.activity) {
        delete d.project;
        if (!d.exam) d.exam = { weight:25, items:[{label:"Exam",max:100}] };
        scoreGroups = d;
        localStorage.setItem(LS_SCORE_SETTINGS_V2, JSON.stringify(scoreGroups));
        return;
      }
    }
  } catch(e) {}
  scoreGroups = JSON.parse(JSON.stringify(DEFAULT_SCORE_GROUPS));
  localStorage.setItem(LS_SCORE_SETTINGS_V2, JSON.stringify(scoreGroups));
}

function saveScoreGroupSettings() {
  try { localStorage.setItem(LS_SCORE_SETTINGS_V2, JSON.stringify(scoreGroups)); } catch(e) {}
}

function getGroupItems(gid) {
  return (scoreGroups[gid] && scoreGroups[gid].items) ? scoreGroups[gid].items : [];
}
function getItemMax(gid, idx) {
  var items = getGroupItems(gid);
  return (items[idx] && items[idx].max) ? items[idx].max : 20;
}

// ── DepEd Table 5 — dynamic weights by strand/subject ──
var CORE_SUBJECTS_LIST = ALL_SHS_SUBJECTS["Core Subjects"] || [];
var SPECIAL_SUBJECTS   = [
  "Inquiries, Investigations and Immersion",
  "Practical Research 1", "Practical Research 2",
  "Empowerment Technologies", "Entrepreneurship", "Work Immersion"
];

function isTVLFolder(folder) {
  if (!folder) return false;
  var f = folder.toUpperCase();
  return f === "HE-HO" || f === "HEHO" || f === "ICT" ||
         f.indexOf("HEHO") >= 0 || f.indexOf("ICT") >= 0;
}

function getDepEdWeights(subjName, strandFolder) {
  var folder = strandFolder || (typeof currentFolder !== 'undefined' ? currentFolder : "") || "";
  if (isTVLFolder(folder)) return { quiz:20, activity:60, exam:20 };
  if (subjName && CORE_SUBJECTS_LIST.indexOf(subjName) >= 0) return { quiz:25, activity:50, exam:25 };
  if (subjName && SPECIAL_SUBJECTS.indexOf(subjName) >= 0)   return { quiz:35, activity:40, exam:25 };
  return { quiz:25, activity:45, exam:30 };
}

function getGroupWeight(gid) {
  var subj   = (typeof currentGbSubject !== 'undefined' && currentGbSubject) ? currentGbSubject
             : (typeof currentSubject   !== 'undefined' && currentSubject)   ? currentSubject : "";
  var folder = (typeof currentFolder !== 'undefined') ? currentFolder : "";
  var w = getDepEdWeights(subj, folder);
  if (gid === 'quiz')     return w.quiz;
  if (gid === 'activity') return w.activity;
  if (gid === 'exam')     return w.exam;
  return 0; // project / unknown → no-op
}

function getAllScoreComponents() {
  var out = [];
  ['quiz','activity','exam'].forEach(function(gid) {
    getGroupItems(gid).forEach(function(item, idx) {
      out.push({ groupId:gid, idx:idx, label:item.label, max:item.max, storeKey:gid+'_'+idx });
    });
  });
  return out;
}

function computeDetailedGrade(sc) {
  var subj   = (typeof currentGbSubject !== 'undefined' && currentGbSubject) ? currentGbSubject
             : (typeof currentSubject   !== 'undefined' && currentSubject)   ? currentSubject : "";
  var folder = (typeof currentFolder !== 'undefined') ? currentFolder : "";
  var weights = getDepEdWeights(subj, folder);

  var parts = [], totalW = 0;
  ['quiz','activity','exam'].forEach(function(gid) {
    var vals = [];
    getGroupItems(gid).forEach(function(item, idx) {
      var v = sc[gid + '_' + idx];
      if (v !== "" && v !== null && v !== undefined && !isNaN(Number(v))) {
        vals.push({ val:Number(v), max:item.max });
      }
    });
    if (!vals.length) return;
    var pct = 0;
    vals.forEach(function(v) { pct += (v.val / v.max) * 100; });
    pct /= vals.length;
    var w = (gid === 'quiz' ? weights.quiz : gid === 'activity' ? weights.activity : weights.exam) / 100;
    parts.push(pct * w);
    totalW += w;
  });

  if (!totalW || !parts.length) return null;
  var raw = parts.reduce(function(a, b) { return a + b; }, 0) / totalW;
  return Math.round(Math.min(100, Math.max(60, 60 + (raw / 100) * 40)));
}

function getScores(sk, subj, qtr) {
  var base = {};
  ['quiz','activity','exam'].forEach(function(gid) {
    getGroupItems(gid).forEach(function(item, idx) { base[gid + '_' + idx] = ''; });
  });
  if (!scoreStore[sk]) return base;
  var qd = (scoreStore[sk][subj] || {})[qtr] || {};
  for (var k in base) { if (qd[k] !== undefined) base[k] = qd[k]; }
  return base;
}

// Legacy score settings (kept for back-compat)
var DEFAULT_SCORE_SETTINGS = {
  quiz1:20, quiz2:20, quiz3:20, act1:20, act2:20, act3:20,
  proj1:50, proj2:50, exam:100,
  weight_quiz:25, weight_activity:25, weight_project:25, weight_exam:25
};
var scoreSettings = JSON.parse(JSON.stringify(DEFAULT_SCORE_SETTINGS));

function loadScoreSettings() {
  try {
    var raw = localStorage.getItem(LS_SCORE_SETTINGS);
    if (raw) {
      var d = JSON.parse(raw);
      for (var k in DEFAULT_SCORE_SETTINGS) {
        if (d[k] !== undefined && !isNaN(Number(d[k])) && Number(d[k]) > 0)
          scoreSettings[k] = Number(d[k]);
      }
    }
  } catch(e) {}
}
function saveScoreSettings() {
  try { localStorage.setItem(LS_SCORE_SETTINGS, JSON.stringify(scoreSettings)); } catch(e) {}
}
function getMax(key)      { return scoreSettings[key] || DEFAULT_SCORE_SETTINGS[key] || 20; }

loadScoreSettings();
loadScoreGroupSettings();

/* ============================================================
   4. DATABASE — DEFAULT DATA, LOAD / SAVE
   ============================================================ */
var DEFAULT_DB = {
  students: [{
    id:"STU-001", emailUser:"juan.delacruz", pass:"2008-03-15",
    name:"Juan dela Cruz", email:"juan.delacruz", strand:"G11-STEM-A", bday:"2008-03-15", gender:"Male",
    studentId:"24-0561", mobile:"09XX-XXX-XXXX", address:"", city:"",
    grades:{}, scores:{ww:25,pt:24,qe:36,act:18}, approvedSubjects:[]
  }],
  teachers: [{
    id:"TCH-001", emailUser:"ana.santos", pass:"1985-06-12",
    name:"Ms. Ana Santos", email:"ana.santos", bday:"1985-06-12", address:""
  }],
  classRoster: {
    "HUMSS-A":  {male:["Jose Santos","Pedro Cruz","Carlos Dela Rosa","Rico Villanueva","Mark Ramos"],female:["Maria Reyes","Ana Gomez","Liza Bautista","Jenny Manalo","Donna Ilagan"]},
    "HUMSS-B":  {male:["Luis Torres","Mark Castillo","Dante Ramos","Ivan Morales","Ryan Abad"],female:["Sofia Mendoza","Grace Aquino","Rowena Pascual","Pia Salazar","Carla Basco"]},
    "STEM-A":   {male:["Juan dela Cruz","Mikael Lim","Jayson Tan","Paolo Sy","Ben Cruz"],female:["Carla Navarro","Tricia Ong","Rina Chua","Angela Go","Kris Santos"]},
    "STEM-B":   {male:["Ryan Soriano","JM Santos","Paul Cruz","Ken Dela Rosa","Leo Torres"],female:["Beth Reyes","Len Gomez","Mia Bautista","Ara Manalo","Nina Aquino"]},
    "HE-HO-A":  {male:["Jojo Mendoza","Dodong Aquino","Totoy Salazar","Bong Cruz","Kuya Santos"],female:["Leni Villanueva","Tess Torres","Marites Castillo","Baby Pascual","Nene Ramos"]},
    "HE-HO-B":  {male:["Danny Navarro","Ronnie Ong","Edwin Chua","Boy Go","Jun Dela Rosa"],female:["Susan Morales","Cathy Lim","Vicky Tan","Luz Sy","Nora Cruz"]},
    "ICT-A":    {male:["Alex Soriano","Sam Santos","Max Cruz","Jay Manalo","Lex Torres"],female:["Kim Reyes","Ash Gomez","Sky Bautista","Dee Dela Rosa","Pat Aquino"]},
    "ABM-A":    {male:["Renz Navarro","Franz Ong","Lance Chua","Ace Go","Rey Dela Rosa"],female:["Jasmine Morales","Bea Lim","Jia Tan","Vida Sy","Gem Cruz"]},
    "G11-HUMSS-A":{male:["Jose Santos","Pedro Cruz","Carlos Dela Rosa","Rico Villanueva","Mark Ramos"],female:["Maria Reyes","Ana Gomez","Liza Bautista","Jenny Manalo","Donna Ilagan"]},
    "G11-HUMSS-B":{male:["Luis Torres","Mark Castillo","Dante Ramos","Ivan Morales","Ryan Abad"],female:["Sofia Mendoza","Grace Aquino","Rowena Pascual","Pia Salazar","Carla Basco"]},
    "G11-STEM-A": {male:["Juan dela Cruz","Mikael Lim","Jayson Tan","Paolo Sy","Ben Cruz"],female:["Carla Navarro","Tricia Ong","Rina Chua","Angela Go","Kris Santos"]},
    "G11-STEM-B": {male:["Ryan Soriano","JM Santos","Paul Cruz","Ken Dela Rosa","Leo Torres"],female:["Beth Reyes","Len Gomez","Mia Bautista","Ara Manalo","Nina Aquino"]},
    "G11-HE-HO-A":{male:["Jojo Mendoza","Dodong Aquino","Totoy Salazar","Bong Cruz","Kuya Santos"],female:["Leni Villanueva","Tess Torres","Marites Castillo","Baby Pascual","Nene Ramos"]},
    "G11-HE-HO-B":{male:["Danny Navarro","Ronnie Ong","Edwin Chua","Boy Go","Jun Dela Rosa"],female:["Susan Morales","Cathy Lim","Vicky Tan","Luz Sy","Nora Cruz"]},
    "G11-ICT-A":  {male:["Alex Soriano","Sam Santos","Max Cruz","Jay Manalo","Lex Torres"],female:["Kim Reyes","Ash Gomez","Sky Bautista","Dee Dela Rosa","Pat Aquino"]},
    "G11-ABM-A":  {male:["Renz Navarro","Franz Ong","Lance Chua","Ace Go","Rey Dela Rosa"],female:["Jasmine Morales","Bea Lim","Jia Tan","Vida Sy","Gem Cruz"]},
    "G12-HUMSS-A":{male:["Jose Santos Jr.","Pedro Cruz Jr.","Carlos Dela Rosa Jr.","Rico Villanueva Jr.","Mark Ramos Jr."],female:["Maria Reyes Jr.","Ana Gomez Jr.","Liza Bautista Jr.","Jenny Manalo Jr.","Donna Ilagan Jr."]},
    "G12-HUMSS-B":{male:["Luis Torres Jr.","Mark Castillo Jr.","Dante Ramos Jr.","Ivan Morales Jr.","Ryan Abad Jr."],female:["Sofia Mendoza Jr.","Grace Aquino Jr.","Rowena Pascual Jr.","Pia Salazar Jr.","Carla Basco Jr."]},
    "G12-STEM-A": {male:["Ryan Soriano Jr.","JM Santos Jr.","Paul Cruz Jr.","Ken Dela Rosa Jr.","Leo Torres Jr."],female:["Beth Reyes Jr.","Len Gomez Jr.","Mia Bautista Jr.","Ara Manalo Jr.","Nina Aquino Jr."]},
    "G12-STEM-B": {male:["Alex Soriano Jr.","Sam Santos Jr.","Max Cruz Jr.","Jay Manalo Jr.","Lex Torres Jr."],female:["Kim Reyes Jr.","Ash Gomez Jr.","Sky Bautista Jr.","Dee Dela Rosa Jr.","Pat Aquino Jr."]},
    "G12-HE-HO-A":{male:["Renz Navarro Jr.","Franz Ong Jr.","Lance Chua Jr.","Ace Go Jr.","Rey Dela Rosa Jr."],female:["Jasmine Morales Jr.","Bea Lim Jr.","Jia Tan Jr.","Vida Sy Jr.","Gem Cruz Jr."]},
    "G12-HE-HO-B":{male:["Danny Navarro Jr.","Ronnie Ong Jr.","Edwin Chua Jr.","Boy Go Jr.","Jun Dela Rosa Jr."],female:["Susan Morales Jr.","Cathy Lim Jr.","Vicky Tan Jr.","Luz Sy Jr.","Nora Cruz Jr."]},
    "G12-ICT-A": {
      male:["Balais, Jefferson","Bangayan, Cedric","Bechayda, Kirk Sean","Caamic, Clyde","Catalan, Tony Rey","Catbagan, Jhanie Kal-El","Cabiles, Mark Lawrence","Cagoyong, Jhonn","De Roy, Mark Laurence","Domalaza, Kaizen Red","Granada, James Benedict","Hernandez, John Lloyd","Lumapinit, Norshad","Mamasaranao, Fahad","Maquinto, Arman Jay","Pateña, Lance","Valdez, Kent Anthony","Alviz, Carl Erielle","Linang, Alvin","Loro, Juan Gabriel","Marquez, John Nornel","Vasquez, Rheyven","Velasquez, Kier"],
      female:["Amante, Trisha","Bañares, Chrislyn","Cabalquinto, Bhea Janina","Cayetano, Jennika","Dela Cruz, Shane Azley","Espiña, Maria Erissa","Mendoza, Jezreel Eve","Merico, Angelica","Ortaliz, Margaret Joyce","Pagaran, Margarette","Saldivar, Ma. Ronisa","Nepomuceno, Alanis Kate"]
    },
    "G12-ABM-A": {male:["Renz Navarro Jr.","Franz Ong Jr.","Lance Chua Jr.","Ace Go Jr.","Rey Dela Rosa Jr."],female:["Jasmine Morales Jr.","Bea Lim Jr.","Jia Tan Jr.","Vida Sy Jr.","Gem Cruz Jr."]}
  },
  subjects:[], crSubjects:[], crColors:[],
  strandLabels:{ HUMSS:"HUMSS", STEM:"STEM", "HE-HO":"H.E-H.O", ICT:"ICT-CP", ABM:"ABM" },
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

function loadDB() {
  try {
    var raw = localStorage.getItem(LS_KEY);
    if (raw) { var p = JSON.parse(raw); if (p && Array.isArray(p.students) && Array.isArray(p.teachers)) return p; }
  } catch(e) {}
  return null;
}
function saveDB()     { try { localStorage.setItem(LS_KEY, JSON.stringify(DB)); } catch(e) {} }
function saveGrades() {
  try { localStorage.setItem(LS_GRADES, JSON.stringify({scoreStore:scoreStore,crStore:crStore,attStore:attStore,rosterGrades:rosterGrades})); } catch(e) {}
}
function loadGrades() {
  try {
    var raw = localStorage.getItem(LS_GRADES);
    if (raw) {
      var d = JSON.parse(raw);
      scoreStore   = d.scoreStore   || {};
      crStore      = d.crStore      || {};
      attStore     = d.attStore     || {};
      rosterGrades = d.rosterGrades || {};
    }
  } catch(e) {}
}

// Bootstrap DB
var _savedDB = loadDB();
var DB = JSON.parse(JSON.stringify(DEFAULT_DB));
if (_savedDB && Array.isArray(_savedDB.students) && Array.isArray(_savedDB.teachers)) {
  DB.students = _savedDB.students;
  DB.teachers = _savedDB.teachers;
  if (_savedDB.classRoster) {
    for (var _rk in _savedDB.classRoster) DB.classRoster[_rk] = _savedDB.classRoster[_rk];
  }
  DB.classRoster["G12-ICT-A"] = JSON.parse(JSON.stringify(DEFAULT_DB.classRoster["G12-ICT-A"]));
}

// Ensure seed records
(function ensureSeedRecords() {
  if (!DB.students.some(function(s) { return s.id === "STU-001"; }))
    DB.students.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.students[0])));
  if (!DB.teachers.some(function(t) { return t.id === "TCH-001"; }))
    DB.teachers.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.teachers[0])));
  DB.students.forEach(function(stu) {
    if (!stu.grades) stu.grades = {};
    DEFAULT_DB.crSubjects.forEach(function(sn) {
      if (!stu.grades[sn]) stu.grades[sn] = {q1:"",q2:"",q3:"",q4:""};
    });
  });
})();
saveDB();

var scoreStore = {}, crStore = {}, attStore = {}, rosterGrades = {};
loadGrades();

/* ============================================================
   5. UTILITY HELPERS
   ============================================================ */

// ── State ──
var currentUser = null, currentRole = "student";
var currentFolder = "HUMSS", currentSection = "A", currentGradeLevel = "G11";
var currentView = "gradebook", currentQuarter = "q1", currentSubject = null, currentGbSubject = null;
var gbSearchQuery = "", suRole = "student", isDark = true, currentSemFilter = 0;
var _tcScrolledToBottom = false, _tcAccepted = false;

// ── DOM ──
function g(id)            { return document.getElementById(id); }
function showEl(id)       { var e = g(id); if (e) e.classList.remove("hidden"); }
function hideEl(id)       { var e = g(id); if (e) e.classList.add("hidden"); }
function showAlert(id, msg, type) { var e = g(id); if (!e) return; e.textContent = msg; e.className = "alert " + (type || "error"); }
function hideAlert(id)    { var e = g(id); if (e) e.className = "alert hidden"; }

// ── Theme ──
function toggleDark() {
  if (g("loginPage") && !g("loginPage").classList.contains("hidden")) return;
  isDark = !isDark;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  var icon = isDark ? "🌙" : "☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id) { var e = g(id); if (e) e.textContent = icon; });
  try { localStorage.setItem("asiasource_dark", isDark ? "1" : "0"); } catch(e) {}
}
function applyLoginDark() { document.documentElement.setAttribute("data-theme","dark"); isDark = true; }
function applyUserTheme() {
  try { var s = localStorage.getItem("asiasource_dark"); if (s !== null) isDark = s === "1"; } catch(e) {}
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  var icon = isDark ? "🌙" : "☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id) { var e = g(id); if (e) e.textContent = icon; });
}

// ── Grade Helpers ──
function avgGrade() {
  var args   = Array.prototype.slice.call(arguments);
  var filled = args.filter(function(v) { return v !== "" && v !== null && v !== undefined && !isNaN(Number(v)) && Number(v) > 0; });
  if (!filled.length) return null;
  return Math.round(filled.reduce(function(a, b) { return a + Number(b); }, 0) / filled.length);
}
function getRemarks(gr) {
  if (!gr || gr === "") return "-"; gr = Number(gr);
  if (gr >= 90) return "Outstanding";
  if (gr >= 85) return "Very Satisfactory";
  if (gr >= 80) return "Satisfactory";
  if (gr >= 75) return "Fairly Satisfactory";
  return "Did Not Meet Expectations";
}
function badgeClass(gr) {
  if (!gr) return ""; gr = Number(gr);
  if (gr >= 90) return "badge-outstanding";
  if (gr >= 85) return "badge-vs";
  if (gr >= 80) return "badge-sat";
  if (gr >= 75) return "badge-fs";
  return "badge-fail";
}
function gradeColor(gr) {
  if (!gr) return "var(--muted)"; gr = Number(gr);
  if (gr >= 90) return "#5dde92";
  if (gr >= 85) return "#7bc8f5";
  if (gr >= 80) return "var(--gold)";
  if (gr >= 75) return "#f0a050";
  return "#ff9090";
}
function darken(hex, amt) {
  var n = parseInt(hex.replace("#",""), 16);
  var r = Math.max(0, (n >> 16) + amt);
  var gg= Math.max(0, ((n >> 8) & 0xFF) + amt);
  var b = Math.max(0, (n & 0xFF) + amt);
  return "#" + (((1 << 24) | (r << 16) | (gg << 8) | b).toString(16).slice(1));
}

// ── Strand / Roster Helpers ──
function getGradeLevel(strand)      { if (!strand) return ""; var m = strand.match(/^G(\d+)-/); return m ? "Grade " + m[1] : ""; }
function getGradeLevelShort(strand) { if (!strand) return ""; var m = strand.match(/^G(\d+)-/); return m ? "G" + m[1] : ""; }
function getStrandName(strand)      { if (!strand) return ""; var m = strand.match(/^G\d+-(.+?)-[AB]$|^G\d+-(.+)$/); if (m) return (m[1] || m[2] || "").replace("HEHO","H.E-H.O"); return strand; }
function getSectionLetter(strand)   { if (!strand) return ""; var m = strand.match(/-([AB])$/); return m ? m[1] : ""; }
function strandToRosterKey(strand)  { if (!strand) return null; return strand.replace(/HEHO/,"HE-HO"); }
function strandToClassKey(strand)   { if (!strand) return null; return strand.replace(/^G\d+-/,"").replace(/^HEHO-/,"HE-HO-"); }

function findStudentByName(name) { for (var i = 0; i < DB.students.length; i++) { if (DB.students[i].name === name) return DB.students[i]; } return null; }
function findStudentById(id)     { for (var i = 0; i < DB.students.length; i++) { if (DB.students[i].id === id)   return DB.students[i]; } return null; }

function ensureStudentGrades(stu) {
  if (!stu.grades) stu.grades = {};
  DB.crSubjects.forEach(function(sn) { if (!stu.grades[sn]) stu.grades[sn] = {q1:"",q2:"",q3:"",q4:""}; });
}
function computeAge(bdayStr) {
  if (!bdayStr || bdayStr === "") return "—";
  var bday = new Date(bdayStr); if (isNaN(bday.getTime())) return "—";
  var today = new Date(), age = today.getFullYear() - bday.getFullYear(), m = today.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--;
  return age + " years old";
}

// ── Score Store ──
function getScoreStoreKey(classKey, genderLabel, idx) { return classKey + "-" + genderLabel + "-" + idx; }
function setScore(sk, subj, qtr, comp, val) {
  if (!scoreStore[sk])             scoreStore[sk] = {};
  if (!scoreStore[sk][subj])       scoreStore[sk][subj] = {};
  if (!scoreStore[sk][subj][qtr]) scoreStore[sk][subj][qtr] = {};
  scoreStore[sk][subj][qtr][comp] = val;
}

// ── Roster Grades ──
function getRosterGrade(classKey, stuName, subj, qtr) {
  if (!rosterGrades[classKey] || !rosterGrades[classKey][stuName] || !rosterGrades[classKey][stuName][subj]) return "";
  var v = rosterGrades[classKey][stuName][subj][qtr];
  return (v !== undefined && v !== null && v !== "") ? v : "";
}
function setRosterGrade(classKey, stuName, subj, qtr, grade) {
  if (!rosterGrades[classKey]) rosterGrades[classKey] = {};
  if (!rosterGrades[classKey][stuName]) rosterGrades[classKey][stuName] = {};
  if (!rosterGrades[classKey][stuName][subj]) rosterGrades[classKey][stuName][subj] = {};
  rosterGrades[classKey][stuName][subj][qtr] = grade;
  var stu = findStudentByName(stuName);
  if (stu) { ensureStudentGrades(stu); if (!stu.grades[subj]) stu.grades[subj] = {}; stu.grades[subj][qtr] = grade; }
}
function getAllRosterGrades(classKey, stuName, subj) {
  var out = {q1:"",q2:"",q3:"",q4:""};
  if (!rosterGrades[classKey] || !rosterGrades[classKey][stuName] || !rosterGrades[classKey][stuName][subj]) return out;
  var qd = rosterGrades[classKey][stuName][subj];
  out.q1 = qd.q1 || ""; out.q2 = qd.q2 || ""; out.q3 = qd.q3 || ""; out.q4 = qd.q4 || "";
  return out;
}

// ── Dynamic Roster ──
function getDynamicRoster(classKey, grade) {
  grade = grade || currentGradeLevel || "G11";
  var fullKey    = grade + "-" + classKey;
  var legacyBase = DB.classRoster[classKey]  || {male:[],female:[]};
  var gradeBase  = DB.classRoster[fullKey]   || {male:[],female:[]};
  var baseMale   = gradeBase.male.length   > 0 ? gradeBase.male.slice()   : legacyBase.male.slice();
  var baseFemale = gradeBase.female.length > 0 ? gradeBase.female.slice() : legacyBase.female.slice();
  var result = {
    male:   baseMale.map(function(n)   { return {name:n,studentId:null,gender:"male",strand:"",isRegistered:false}; }),
    female: baseFemale.map(function(n) { return {name:n,studentId:null,gender:"female",strand:"",isRegistered:false}; })
  };
  DB.students.forEach(function(stu) {
    if (!stu.strand) return;
    var rkClass  = strandToClassKey(stu.strand);
    var stuGrade = getGradeLevelShort(stu.strand);
    if (stuGrade !== grade || rkClass !== classKey) return;
    var gender = (stu.gender && stu.gender.toLowerCase() === "female") ? "female" : "male";
    var arr = result[gender], found = false;
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].name === stu.name) { arr[j].studentId = stu.id; arr[j].strand = stu.strand; arr[j].isRegistered = true; found = true; break; }
    }
    if (!found) {
      var invitesList = loadInvites(), isApproved = false;
      for (var k = 0; k < invitesList.length; k++) {
        if (invitesList[k].studentId === stu.id && invitesList[k].status === "approved") { isApproved = true; break; }
      }
      if (isApproved || (stu.approvedSubjects && stu.approvedSubjects.length > 0)) {
        result[gender].push({name:stu.name,studentId:stu.id,gender:gender,strand:stu.strand,isRegistered:true});
      }
    }
  });
  return result;
}
function addStudentToStaticRoster(stu) {
  var fullKey = strandToRosterKey(stu.strand); if (!fullKey) return;
  if (!DB.classRoster[fullKey]) DB.classRoster[fullKey] = {male:[],female:[]};
  var gender = (stu.gender && stu.gender.toLowerCase() === "female") ? "female" : "male";
  var arr = DB.classRoster[fullKey][gender];
  for (var i = 0; i < arr.length; i++) { if (arr[i] === stu.name) return; }
  arr.push(stu.name); saveDB();
}

// ── Subject List Helpers ──
function getCrSubjectsForFolder() {
  if (currentUser && currentRole === "teacher") return loadTchSubjects(currentUser.id);
  return DB.crSubjects;
}
function getCrColorsForFolder() {
  if (currentUser && currentRole === "teacher") {
    return loadTchSubjects(currentUser.id).map(function(s, i) { return TCH_SUBJ_COLORS[i % TCH_SUBJ_COLORS.length]; });
  }
  return DB.crColors;
}

// ── GL Badge HTML ──
function glBadgeHtml(strand) {
  if (!strand) return "";
  var gl = getGradeLevelShort(strand), sn = getStrandName(strand);
  var glColor = strand.indexOf("G11") >= 0 ? "#0ea5e9" : "#10b981";
  return '<span class="gl-badge" style="background:' + glColor + '22;border-color:' + glColor + '55;color:' + glColor + ';">' + gl + '</span>' +
         '<span class="strand-mini">' + sn + '</span>';
}

// ── Toast ──
function showToast(msg, type) {
  var ex = g("mainToast"); if (ex) ex.remove();
  var el = document.createElement("div"); el.id = "mainToast";
  var bg  = type === "success" ? "linear-gradient(135deg,#065f46,#14532d)"
          : type === "warning" ? "linear-gradient(135deg,#92400e,#78350f)"
          : "linear-gradient(135deg,#7a0006,#3d0003)";
  var bdr = type === "success" ? "rgba(46,204,113,.4)"
          : type === "warning" ? "rgba(212,160,23,.4)"
          : "rgba(192,0,10,.4)";
  el.innerHTML = msg;
  el.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;background:" + bg + ";color:#fff;padding:13px 22px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.5);border:1px solid " + bdr + ";animation:fadeIn .25s ease;max-width:380px;";
  document.body.appendChild(el);
  setTimeout(function() { if (el.parentNode) { el.style.opacity = "0"; el.style.transition = "opacity .4s"; } }, 3000);
  setTimeout(function() { if (el.parentNode) el.remove(); }, 3500);
}

/* ============================================================
   6. TEACHER SUBJECT MANAGER
   ============================================================ */
function getTchSubjectsKey(tchId)       { return LS_TCH_SUBJECTS + "_" + tchId; }
function loadTchSubjects(tchId)         { try { var r = localStorage.getItem(getTchSubjectsKey(tchId)); if (r) return JSON.parse(r); } catch(e) {} return []; }
function saveTchSubjects(tchId, list)   { try { localStorage.setItem(getTchSubjectsKey(tchId), JSON.stringify(list)); } catch(e) {} }
function addTchSubject(tchId, name)     { var l = loadTchSubjects(tchId); if (l.indexOf(name) < 0) { l.push(name); saveTchSubjects(tchId, l); } }
function removeTchSubject(tchId, name) { saveTchSubjects(tchId, loadTchSubjects(tchId).filter(function(s) { return s !== name; })); }

function openTchSubjectMgr()  { renderTchSubjectMgr(); g("tchSubjectMgrModal").classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function closeTchSubjectMgr() { g("tchSubjectMgrModal").classList.add("hidden"); document.body.style.overflow = ""; }

var _TSM3_STYLES_INJECTED = false;
function _injectTsm3Styles() {
  if (_TSM3_STYLES_INJECTED || document.getElementById('tsm3-styles')) return;
  _TSM3_STYLES_INJECTED = true;
  var style = document.createElement('style'); style.id = 'tsm3-styles';
  style.textContent = [
    '#tchSubjectMgrModal .modal-card{max-width:740px!important;padding:0!important;overflow:hidden!important;border-radius:26px!important;max-height:90vh!important;display:flex!important;flex-direction:column!important;}',
    '#tchSubjectMgrModal .modal-card::before{display:none!important;}',
    '#tchSubjectMgrModal .modal-close{position:absolute!important;top:14px!important;right:14px!important;z-index:60!important;background:rgba(255,255,255,0.15)!important;border:1px solid rgba(255,255,255,0.25)!important;color:#fff!important;}',
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

function _countAllSubjects() {
  var c = 0; for (var cat in ALL_SHS_SUBJECTS) c += ALL_SHS_SUBJECTS[cat].length; return c;
}

function _buildTsm3Catalog(mySubjects, query) {
  var CAT_META = {
    "Core Subjects":       {icon:"📗",color:"#3b82f6"},
    "Applied Subjects":    {icon:"🔧",color:"#8b5cf6"},
    "Specialized — ABM":   {icon:"💼",color:"#f59e0b"},
    "Specialized — HUMSS": {icon:"🎭",color:"#ec4899"},
    "Specialized — STEM":  {icon:"🔬",color:"#10b981"},
    "Specialized — TVL":   {icon:"⚙️",color:"#f97316"}
  };
  var q = query.toLowerCase().trim(), html = "", totalFound = 0;
  for (var cat in ALL_SHS_SUBJECTS) {
    var subs     = ALL_SHS_SUBJECTS[cat];
    var filtered = q ? subs.filter(function(s) { return s.toLowerCase().indexOf(q) >= 0; }) : subs;
    if (!filtered.length) continue;
    totalFound += filtered.length;
    var meta        = CAT_META[cat] || {icon:'📚',color:'#e8000f'};
    var addedInCat  = filtered.filter(function(s) { return mySubjects.indexOf(s) >= 0; }).length;
    html += '<div class="tsm3-cat">';
    html += '<div class="tsm3-cat-hdr" style="border-left:3px solid ' + meta.color + ';">';
    html += '<span class="tsm3-cat-ico">' + meta.icon + '</span><span class="tsm3-cat-name" style="color:' + meta.color + ';">' + cat + '</span>';
    html += '<span class="tsm3-cat-cnt" style="background:' + meta.color + '18;color:' + meta.color + ';">' + filtered.length + '</span>';
    if (addedInCat > 0) html += '<span class="tsm3-cat-added">✓ ' + addedInCat + ' added</span>';
    html += '</div><div class="tsm3-cat-list">';
    filtered.forEach(function(s) {
      var added    = mySubjects.indexOf(s) >= 0;
      var nameHtml = s;
      if (q) { var qi = s.toLowerCase().indexOf(q); if (qi >= 0) nameHtml = s.slice(0,qi) + '<mark class="tsm3-hl">' + s.slice(qi, qi + q.length) + '</mark>' + s.slice(qi + q.length); }
      html += '<div class="tsm3-item' + (added ? ' tsm3-item-added' : '') + '">';
      html += '<div class="tsm3-item-left">';
      if (added) html += '<div class="tsm3-item-check" style="background:' + meta.color + '18;border-color:' + meta.color + '55;color:' + meta.color + ';">✓</div>';
      else        html += '<div class="tsm3-item-dot" style="border-color:' + meta.color + '66;"></div>';
      html += '<span class="tsm3-item-name">' + nameHtml + '</span></div>';
      if (added) html += '<button class="tsm3-btn tsm3-btn-remove" onclick="tsm3RemoveSubject(\'' + s.replace(/'/g,"\\'") + '\')">✕ Remove</button>';
      else        html += '<button class="tsm3-btn tsm3-btn-add" style="color:' + meta.color + ';border-color:' + meta.color + '44;" onclick="tsm3AddSubject(\'' + s.replace(/'/g,"\\'") + '\')">＋ Add</button>';
      html += '</div>';
    });
    html += '</div></div>';
  }
  if (!totalFound) html = '<div class="tsm3-no-results"><div style="font-size:38px;margin-bottom:12px;opacity:.35;">🔍</div><div>No subjects match "<strong>' + query + '"</strong></div></div>';
  return html;
}

function _buildTsm3ChipsHtml(mySubjects) {
  if (!mySubjects.length) return '<div class="tsm3-empty-chips"><div class="tsm3-empty-chips-icon">🗂️</div><div class="tsm3-empty-chips-text">No subjects added yet<br><span>Search and add from the catalog below</span></div></div>';
  var html = '<div class="tsm3-chips-flow">';
  mySubjects.forEach(function(s, i) {
    var col = TCH_SUBJ_COLORS[i % TCH_SUBJ_COLORS.length];
    html += '<div class="tsm3-chip"><span class="tsm3-chip-color" style="background:' + col + ';"></span><span class="tsm3-chip-text" title="' + s + '">' + s + '</span><button class="tsm3-chip-x" onclick="tsm3RemoveSubject(\'' + s.replace(/'/g,"\\'") + '\')">×</button></div>';
  });
  return html + '</div>';
}

function _tsm3RefreshUI() {
  var mySubjects = loadTchSubjects(currentUser.id);
  var ctr = document.getElementById('tsm3CounterNum'); if (ctr) ctr.textContent = mySubjects.length;
  var hint = document.querySelector('.tsm3-search-hint'); if (hint) hint.textContent = mySubjects.length + ' of ' + _countAllSubjects() + ' added';
  var section = document.querySelector('.tsm3-current-section');
  if (section) {
    var chipsArea = section.querySelector('.tsm3-chips-flow, .tsm3-empty-chips');
    var newHtml = _buildTsm3ChipsHtml(mySubjects);
    if (chipsArea) chipsArea.outerHTML = newHtml; else section.insertAdjacentHTML('beforeend', newHtml);
  }
  var q   = document.getElementById('tsm3Search') ? document.getElementById('tsm3Search').value : '';
  var cat = document.getElementById('tsm3Catalog'); if (cat) cat.innerHTML = _buildTsm3Catalog(mySubjects, q);
}

function renderTchSubjectMgr() {
  _injectTsm3Styles();
  var mySubjects = loadTchSubjects(currentUser.id);
  var html = '<div class="tsm3-wrap">';
  html += '<div class="tsm3-hero"><div class="tsm3-hero-bg"></div><div class="tsm3-hero-inner"><div class="tsm3-hero-icon">📚</div><div class="tsm3-hero-text"><h2 class="tsm3-hero-title">Manage Subjects</h2><p class="tsm3-hero-sub">Configure subjects you teach this semester</p></div><div class="tsm3-hero-counter"><span class="tsm3-counter-num" id="tsm3CounterNum">' + mySubjects.length + '</span><span class="tsm3-counter-lbl">teaching</span></div></div></div>';
  html += '<div class="tsm3-current-section"><div class="tsm3-section-label"><span class="tsm3-label-dot tsm3-dot-green"></span>Currently Teaching</div>' + _buildTsm3ChipsHtml(mySubjects) + '</div>';
  html += '<div class="tsm3-divider"><div class="tsm3-divider-line"></div><span class="tsm3-divider-text">Subject Catalog</span><div class="tsm3-divider-line"></div></div>';
  html += '<div class="tsm3-search-row"><div class="tsm3-search-box"><span class="tsm3-search-ico">🔍</span><input class="tsm3-search-input" type="text" id="tsm3Search" placeholder="Search subjects..." oninput="tsm3Filter()"><button class="tsm3-search-clear hidden" id="tsm3Clear" onclick="tsm3ClearSearch()">✕</button></div><div class="tsm3-search-hint">' + mySubjects.length + ' of ' + _countAllSubjects() + ' added</div></div>';
  html += '<div class="tsm3-catalog" id="tsm3Catalog">' + _buildTsm3Catalog(mySubjects, '') + '</div></div>';
  document.getElementById('tchSubjectMgrContent').innerHTML = html;
}

function tsm3Filter() {
  var q   = document.getElementById('tsm3Search') ? document.getElementById('tsm3Search').value : '';
  var clr = document.getElementById('tsm3Clear'); if (clr) clr.classList.toggle('hidden', !q);
  var cat = document.getElementById('tsm3Catalog'); if (cat) cat.innerHTML = _buildTsm3Catalog(loadTchSubjects(currentUser.id), q);
}
function tsm3ClearSearch() {
  var inp = document.getElementById('tsm3Search'); if (inp) inp.value = '';
  var clr = document.getElementById('tsm3Clear');  if (clr) clr.classList.add('hidden');
  tsm3Filter();
}
function tsm3AddSubject(name) {
  addTchSubject(currentUser.id, name); _tsm3RefreshUI();
  if (currentView === 'gradebook')       { currentGbSubject = currentGbSubject || name; renderGradebook(currentFolder, currentSection); }
  else if (currentView === 'classrecord') { currentSubject   = currentSubject   || name; renderClassRecord(currentFolder, currentSection); }
  showToast('📚 ' + name + ' added!', 'success');
}
function tsm3RemoveSubject(name) {
  removeTchSubject(currentUser.id, name);
  var l = loadTchSubjects(currentUser.id);
  if (currentGbSubject === name) currentGbSubject = l[0] || null;
  if (currentSubject   === name) currentSubject   = l[0] || null;
  _tsm3RefreshUI();
  if (currentView === 'gradebook')        renderGradebook(currentFolder, currentSection);
  else if (currentView === 'classrecord') renderClassRecord(currentFolder, currentSection);
  showToast('🗑️ ' + name + ' removed.', 'warning');
}

// Legacy aliases
var tchAddSubject = tsm3AddSubject, tchRemoveSubject = tsm3RemoveSubject, filterTsmCatalog = tsm3Filter;

/* ============================================================
   7. INVITE / NOTIFICATION HELPERS
   ============================================================ */
function loadInvites()    { try { var r = localStorage.getItem(LS_INVITES);  return r ? JSON.parse(r) : []; } catch(e) { return []; } }
function saveInvites(inv) { try { localStorage.setItem(LS_INVITES, JSON.stringify(inv)); } catch(e) {} }
function loadNotifs()     { try { var r = localStorage.getItem(LS_NOTIFS);   return r ? JSON.parse(r) : {}; } catch(e) { return {}; } }
function saveNotifs(n)    { try { localStorage.setItem(LS_NOTIFS, JSON.stringify(n)); } catch(e) {} }

function getApprovedSubjects(studentId) { return loadInvites().filter(function(inv) { return inv.studentId === studentId && inv.status === "approved"; }); }
function getPendingSubjects(studentId)  { return loadInvites().filter(function(inv) { return inv.studentId === studentId && inv.status === "pending"; }); }

function addNotifForTeacher(teacherId, notif) {
  var key  = "teacher_notif_" + teacherId;
  var list = JSON.parse(localStorage.getItem(key) || "[]");
  notif.id = Date.now() + "_" + Math.random(); notif.read = false; notif.timestamp = new Date().toISOString();
  list.unshift(notif); localStorage.setItem(key, JSON.stringify(list));
}
function getTeacherNotifs(teacherId)          { return JSON.parse(localStorage.getItem("teacher_notif_" + teacherId) || "[]"); }
function markTeacherNotifRead(teacherId, nid) { var key = "teacher_notif_" + teacherId, list = JSON.parse(localStorage.getItem(key) || "[]"); list.forEach(function(n) { if (n.id === nid) n.read = true; }); localStorage.setItem(key, JSON.stringify(list)); }
function getUnreadTeacherNotifCount(tid)      { return getTeacherNotifs(tid).filter(function(n) { return !n.read; }).length; }

/* ============================================================
   8. AUTH — LOGIN, SIGNUP, TERMS
   ============================================================ */
function goHome() {
  if (currentUser) {
    if (currentRole === 'student') {
      loadStudentDash(currentUser);
    } else {
      document.querySelectorAll(".strand-item").forEach(function(el) {
        el.className = "strand-item";
        if (el.getAttribute("data-strand") === "HUMSS" && el.getAttribute("data-grade") === "G11")
          el.className = "strand-item active";
      });
      openFolderByStrand("HUMSS", "G11");
    }
    setTimeout(function() {
      window.scrollTo({top:0,behavior:'smooth'});
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      ['.dash-body','.stu-main','.tch-main'].forEach(function(sel) {
        var el = document.querySelector(sel); if (el) el.scrollTop = 0;
      });
    }, 150);
    return;
  }
  hideEl("studentDash"); hideEl("teacherDash"); showEl("loginPage"); applyLoginDark();
}

function switchAuth(tab) {
  if (tab === "login") { g("tabLogin").className = "auth-tab active"; g("tabSignup").className = "auth-tab"; showEl("authLogin"); hideEl("authSignup"); }
  else                  { g("tabLogin").className = "auth-tab"; g("tabSignup").className = "auth-tab active"; hideEl("authLogin"); showEl("authSignup"); }
}
function setRole(role) {
  currentRole = role; var isT = role === "teacher";
  g("btnStudent").className = "role-btn" + (isT ? "" : " active");
  g("btnTeacher").className = "role-btn" + (isT ? " active" : "");
  g("loginBtn").textContent = isT ? "Sign In as Teacher" : "Sign In as Student";
  g("userId").placeholder   = isT ? "e.g. ana.santos" : "e.g. juan.delacruz";
  hideAlert("alertBox"); g("userId").value = ""; g("password").value = "";
}
function togglePass(id) { var p = g(id); p.type = p.type === "password" ? "text" : "password"; }
function setSuRole(role) {
  suRole = role;
  g("suBtnStu").className = "role-btn" + (role === "student" ? " active" : "");
  g("suBtnTch").className = "role-btn" + (role === "teacher" ? " active" : "");
  var sfg = g("suStrandFg"); if (sfg) sfg.style.display = role === "student" ? "" : "none";
  hideAlert("suAlert"); hideAlert("suSuccess");
}

function openTcModal() {
  _tcScrolledToBottom = false;
  var modal     = g("tcModal"), acceptBtn = g("tcAcceptBtn"), hint = g("tcScrollHint");
  modal.classList.remove("hidden"); document.body.style.overflow = "hidden";
  acceptBtn.disabled = true; if (hint) hint.style.opacity = "1";
  var body = document.getElementById("tcBody");
  if (body) {
    body.scrollTop = 0;
    body.onscroll = function() {
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 20 && !_tcScrolledToBottom) {
        _tcScrolledToBottom = true; acceptBtn.disabled = false; if (hint) hint.style.opacity = "0";
      }
    };
  }
}
function closeTcModal() { g("tcModal").classList.add("hidden"); document.body.style.overflow = ""; }
function acceptTc()     { _tcAccepted = true; g("suTcCheck").checked = true; onTcCheck(); closeTcModal(); showToast("✅ Terms & Conditions accepted!", "success"); }
function onTcCheck() {
  var checked = g("suTcCheck").checked, btn = g("suSubmitBtn");
  if (btn) { btn.disabled = !checked; btn.style.opacity = checked ? "1" : "0.45"; btn.style.cursor = checked ? "pointer" : "not-allowed"; }
  if (checked && !_tcAccepted) { g("suTcCheck").checked = false; if (btn) { btn.disabled = true; btn.style.opacity = "0.45"; btn.style.cursor = "not-allowed"; } openTcModal(); }
}

function handleLogin(e) {
  e.preventDefault();
  var fresh = loadDB(); if (fresh && Array.isArray(fresh.students)) { DB.students = fresh.students; DB.teachers = fresh.teachers; }
  var eu = g("userId").value.trim().toLowerCase(), pw = g("password").value.trim();
  hideAlert("alertBox");
  if (!eu || !pw) { showAlert("alertBox","Please fill in all fields."); return; }
  if (currentRole === "student") {
    var stu = null;
    for (var i = 0; i < DB.students.length; i++) { if (DB.students[i].emailUser === eu && DB.students[i].pass === pw) { stu = DB.students[i]; break; } }
    if (!stu) { showAlert("alertBox", DB.students.some(function(s) { return s.emailUser === eu; }) ? "Wrong password. Use your birthday: YYYY-MM-DD" : "Email not found. Check spelling or sign up first."); return; }
    currentUser = stu; hideEl("loginPage"); applyUserTheme(); loadStudentDash(stu); showEl("studentDash"); startStudentPolling();
  } else {
    var tch = null;
    for (var j = 0; j < DB.teachers.length; j++) { if (DB.teachers[j].emailUser === eu && DB.teachers[j].pass === pw) { tch = DB.teachers[j]; break; } }
    if (!tch) { showAlert("alertBox", DB.teachers.some(function(t) { return t.emailUser === eu; }) ? "Wrong password. Use your birthday: YYYY-MM-DD" : "Teacher email not found. Check spelling or sign up first."); return; }
    currentUser = tch; hideEl("loginPage"); applyUserTheme(); loadTeacherDash(tch); showEl("teacherDash");
  }
}

function logout() {
  stopStudentPolling();
  hideEl("studentDash"); hideEl("teacherDash"); showEl("loginPage");
  currentUser = null; g("userId").value = ""; g("password").value = ""; applyLoginDark();
}

function handleSignUp(e) {
  e.preventDefault();
  hideAlert("suAlert"); hideAlert("suSuccess");
  if (!_tcAccepted) { showAlert("suAlert","Please read and accept the Terms & Conditions first."); openTcModal(); return; }
  var name = g("suName").value.trim(), eu = g("suEmail").value.trim().toLowerCase(), bday = g("suBirthday").value;
  if (!name) { showAlert("suAlert","Please enter your full name."); return; }
  if (!eu)   { showAlert("suAlert","Please enter your email username."); return; }
  if (!bday) { showAlert("suAlert","Please pick your birthday using the date picker."); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bday)) { showAlert("suAlert","Birthday must be in YYYY-MM-DD format."); return; }
  var allUsers = DB.students.concat(DB.teachers);
  if (allUsers.some(function(u) { return u.emailUser === eu; })) { showAlert("suAlert","Email username already exists. Please choose a different one."); return; }
  var yr = new Date().getFullYear(), defaultGrades = {};
  DEFAULT_DB.crSubjects.forEach(function(s) { defaultGrades[s] = {q1:"",q2:"",q3:"",q4:""}; });
  if (suRole === "student") {
    var strand = g("suStrand").value;
    if (!strand) { showAlert("suAlert","Please select your strand and section."); return; }
    var idNum = String(DB.students.length + 1).padStart(4,"0");
    DB.students.push({id:"STU-"+Date.now(),emailUser:eu,pass:bday,name:name,email:eu,strand:strand,bday:bday,gender:"",mobile:"",address:"",city:"",studentId:yr+"-"+idNum,grades:defaultGrades,scores:{ww:"",pt:"",qe:"",act:""},approvedSubjects:[],pendingSubjects:[]});
  } else {
    DB.teachers.push({id:"TCH-"+Date.now(),emailUser:eu,pass:bday,name:name,email:eu,bday:bday,address:"",gender:"",mobile:"",city:""});
  }
  saveDB();
  _tcAccepted = false;
  var tcChk = g("suTcCheck"); if (tcChk) tcChk.checked = false;
  var suBtn = g("suSubmitBtn"); if (suBtn) { suBtn.disabled = true; suBtn.style.opacity = "0.45"; suBtn.style.cursor = "not-allowed"; }
  showAlert("suSuccess","✅ " + (suRole === "student" ? "Student" : "Teacher") + " account created! You can now log in.\nEmail: " + eu + "@asiasourceicollege.edu.ph\nPassword (your birthday): " + bday,"success");
  document.querySelector("#authSignup form").reset();
  setTimeout(function() { switchAuth("login"); hideAlert("suSuccess"); }, 3500);
}

/* ============================================================
   9. STUDENT DASHBOARD & SUBJECT DETAIL
   ============================================================ */

// ── Photo ──
var _photoDataUrl = null;
function loadStudentPhoto(studentId) { try { return localStorage.getItem("asiasource_photo_" + studentId); } catch(e) { return null; } }
function applyStudentPhoto(studentId, dataUrl) {
  var emojiEl   = g("stuAvatarEmoji"), photoWrap = g("stuPcPhotoWrap"), photoImg = g("stuPcPhoto");
  if (dataUrl) {
    if (emojiEl) emojiEl.style.display = "none";
    if (photoWrap) photoWrap.classList.remove("hidden");
    if (photoImg)  photoImg.src = dataUrl;
  } else {
    if (emojiEl) emojiEl.style.display = "";
    if (photoWrap) photoWrap.classList.add("hidden");
    if (photoImg)  photoImg.src = "";
  }
  var pmOverlay = g("pmPhotoOverlay"), pmImg = g("pmPhotoImg"), pmAvatarEmoji = g("pmAvatar");
  if (dataUrl && currentRole === "student") {
    if (pmOverlay) pmOverlay.classList.remove("hidden");
    if (pmImg)     pmImg.src = dataUrl;
    if (pmAvatarEmoji) pmAvatarEmoji.style.opacity = "0";
  } else {
    if (pmOverlay) pmOverlay.classList.add("hidden");
    if (pmAvatarEmoji) pmAvatarEmoji.style.opacity = "1";
  }
}
function handlePhotoUpload(event) {
  var file = event.target.files[0]; if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("⚠️ Please select an image file.", "warning"); return; }
  var reader = new FileReader();
  reader.onload = function(e) {
    _photoDataUrl = e.target.result;
    var preview = g("pmPhotoPreviewImg"), placeholder = g("pmPhotoPlaceholder");
    if (preview)     { preview.src = _photoDataUrl; preview.classList.remove("hidden"); }
    if (placeholder)   placeholder.style.display = "none";
  };
  reader.readAsDataURL(file);
}
function saveProfilePhoto() {
  if (!_photoDataUrl)   { showToast("⚠️ Please choose a photo first.", "warning"); return; }
  if (!window.currentUser) return;
  try { localStorage.setItem("asiasource_photo_" + currentUser.id, _photoDataUrl); } catch(e) { showToast("⚠️ Photo too large to save. Try a smaller image.", "warning"); return; }
  applyStudentPhoto(currentUser.id, _photoDataUrl);
  var successEl = g("pmPhotoSuccess");
  if (successEl) { successEl.classList.remove("hidden"); setTimeout(function() { successEl.classList.add("hidden"); }, 2500); }
  showToast("📷 Profile photo saved!", "success"); _photoDataUrl = null;
}
function removeProfilePhoto() {
  if (!window.currentUser) return;
  try { localStorage.removeItem("asiasource_photo_" + currentUser.id); } catch(e) {}
  applyStudentPhoto(currentUser.id, null);
  var preview = g("pmPhotoPreviewImg"), placeholder = g("pmPhotoPlaceholder");
  if (preview)     { preview.src = ""; preview.classList.add("hidden"); }
  if (placeholder)   placeholder.style.display = "";
  showToast("🗑️ Photo removed.", "warning");
}

// ── Subject list builder ──
function getSubjectsForStudent(stu) {
  var CAT_META = {
    "Core Subjects":       {color:"#3b82f6",icon:"📗"},
    "Applied Subjects":    {color:"#8b5cf6",icon:"🔧"},
    "Specialized — ABM":   {color:"#f59e0b",icon:"💼"},
    "Specialized — HUMSS": {color:"#ec4899",icon:"🎭"},
    "Specialized — STEM":  {color:"#10b981",icon:"🔬"},
    "Specialized — TVL":   {color:"#f97316",icon:"⚙️"}
  };
  function metaFor(name) {
    for (var cat in ALL_SHS_SUBJECTS) { if (ALL_SHS_SUBJECTS[cat].indexOf(name) >= 0) return CAT_META[cat] || {color:"#e8000f",icon:"📚"}; }
    return {color:"#e8000f",icon:"📚"};
  }
  var result = [], seen = {};
  loadInvites().forEach(function(inv) {
    if (inv.studentId !== stu.id || inv.status !== "approved" || seen[inv.subjectName]) return;
    seen[inv.subjectName] = true; var m = metaFor(inv.subjectName);
    result.push({name:inv.subjectName,icon:m.icon,color:m.color,teacher:inv.teacherName||"",sem:null});
  });
  (stu.approvedSubjects || []).forEach(function(s) {
    if (seen[s]) return; seen[s] = true; var m = metaFor(s);
    result.push({name:s,icon:m.icon,color:m.color,teacher:"",sem:null});
  });
  return result;
}

// ── Student Dashboard ──
function loadStudentDash(stu) {
  var freshDB = loadDB();
  if (freshDB && Array.isArray(freshDB.students)) { DB.students = freshDB.students; DB.teachers = freshDB.teachers; }
  if (stu && stu.id) { for (var si = 0; si < DB.students.length; si++) { if (DB.students[si].id === stu.id) { currentUser = DB.students[si]; stu = currentUser; break; } } }

  g("stuName").textContent        = stu.name;
  g("stuProfileName").textContent = stu.name;
  g("stuProfileEmail").textContent= stu.email + "@asiasourceicollege.edu.ph";
  g("stuProfileBday").textContent = stu.bday || "-";
  g("stuProfileLRN").textContent  = stu.emailUser;

  var glShort  = getGradeLevelShort(stu.strand);
  var glColor  = stu.strand && stu.strand.indexOf("G11") >= 0 ? "#0ea5e9" : "#10b981";
  var strandEl = g("stuProfileStrand");
  if (strandEl) strandEl.innerHTML = (glShort ? '<span style="background:' + glColor + '22;border:1px solid ' + glColor + '55;color:' + glColor + ';border-radius:20px;padding:1px 8px;font-size:10px;font-weight:800;margin-right:4px;">' + glShort + '</span>' : "") + (DB.strandFull[stu.strand] || stu.strand);

  var subjectsForStu = getSubjectsForStudent(stu);
  var pendingInvites = getPendingSubjects(stu.id);
  var allApproved    = subjectsForStu.map(function(s) { return s.name; });
  var list = g("subjectList"); list.innerHTML = "";

  if (!pendingInvites.length && !allApproved.length) {
    list.innerHTML = '<div class="no-subjects-msg"><div class="no-sub-icon">📚</div><div class="no-sub-text">You have no subjects yet.</div><div class="no-sub-hint">Click the button below to add your subjects.</div></div>';
  }
  var CAT_ICONS = {"Core Subjects":"📗","Applied Subjects":"🔧","Specialized — ABM":"💼","Specialized — HUMSS":"🎭","Specialized — STEM":"🔬","Specialized — TVL":"⚙️"};
  pendingInvites.forEach(function(inv) {
    var icon = "📚"; for (var cat in ALL_SHS_SUBJECTS) { if (ALL_SHS_SUBJECTS[cat].indexOf(inv.subjectName) >= 0) { icon = CAT_ICONS[cat] || "📚"; break; } }
    var teacherTxt = inv.teacherName ? "Teacher: " + inv.teacherName : "";
    list.innerHTML += '<div class="subject-card pending-card"><div class="subject-left"><div class="subject-icon" style="opacity:.5;">' + icon + '</div><div><div class="sub-name">' + inv.subjectName + '</div><div class="sub-teacher">' + teacherTxt + '</div></div></div><div class="subject-grade"><div class="pending-badge">⏳ Waiting Approval</div></div></div>';
  });
  subjectsForStu.forEach(function(sub) {
    if (!stu.grades) stu.grades = {};
    var gr = stu.grades[sub.name] || {}, fg = avgGrade(gr.q1, gr.q2, gr.q3, gr.q4), passed = fg && fg >= 75;
    list.innerHTML += '<div class="subject-card" onclick="openSubjectDetail(\'' + sub.name.replace(/'/g,"\\'") + '\')">' +
      '<div class="subject-left">' +
      '<div class="subject-icon" style="background:' + sub.color + '22;border:1.5px solid ' + sub.color + '55;color:' + sub.color + '">' + sub.icon + '</div>' +
      '<div><div class="sub-name">' + sub.name + '</div><div class="sub-teacher">' + (sub.teacher ? "Teacher: " + sub.teacher : "") + '</div></div></div>' +
      '<div class="subject-grade"><div class="grade-num">' + (fg || "-") + '</div><div class="grade-label">Final</div>' +
      '<div class="grade-pill ' + (passed ? "pill-pass" : "pill-fail") + '">' + getRemarks(fg) + '</div></div></div>';
  });

  // Grade Card
  var tbody = g("gradeCardBody"); tbody.innerHTML = ""; var gwaSum = 0, gwaCount = 0;
  var sem1Subj = [], sem2Subj = [], noSemSubj = [];
  subjectsForStu.forEach(function(s) { if (s.sem === 1) sem1Subj.push(s); else if (s.sem === 2) sem2Subj.push(s); else noSemSubj.push(s); });

  function renderSemRows(list2, semLabel, semColor) {
    if (!list2.length) return;
    if (semLabel) tbody.innerHTML += '<tr><td colspan="5" style="background:' + semColor + '22;color:' + semColor + ';font-weight:800;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:6px 10px;border-bottom:1px solid ' + semColor + '33;">' + semLabel + '</td></tr>';
    list2.forEach(function(sk) {
      if (allApproved.indexOf(sk.name) < 0) return;
      var gr2 = stu.grades[sk.name] || {}, q1 = gr2.q1||"", q2 = gr2.q2||"", q3 = gr2.q3||"", q4 = gr2.q4||"";
      var sem1g = avgGrade(q1,q2), sem2g = avgGrade(q3,q4);
      var fg2   = sk.sem === 1 ? sem1g : sk.sem === 2 ? sem2g : avgGrade(q1,q2,q3,q4);
      var pass2 = fg2 && fg2 >= 75;
      if (fg2) { gwaSum += fg2; gwaCount++; }
      tbody.innerHTML += "<tr><td>" + sk.name + "</td>" +
        '<td style="background:rgba(14,165,233,0.06);color:' + (sem1g ? gradeColor(sem1g) : "var(--muted)") + '">' + (sem1g || "-") + "</td>" +
        '<td style="background:rgba(16,185,129,0.06);color:' + (sem2g ? gradeColor(sem2g) : "var(--muted)") + '">' + (sem2g || "-") + "</td>" +
        '<td class="final-col">' + (fg2 || "-") + "</td>" +
        '<td><span class="grade-pill ' + (pass2 ? "pill-pass" : "pill-fail") + '">' + getRemarks(fg2) + "</span></td></tr>";
    });
  }
  renderSemRows(sem1Subj, "1st Semester", "#38bdf8");
  renderSemRows(sem2Subj, "2nd Semester", "#34d399");
  renderSemRows(noSemSubj, "", "");
  if (!tbody.innerHTML) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:20px;">No approved subjects yet.</td></tr>';

  var gwaBar = g("gwaBar");
  if (gwaBar) {
    if (gwaCount > 0) {
      var gwa = Math.round(gwaSum / gwaCount);
      gwaBar.style.display = "flex";
      gwaBar.innerHTML = '<span class="gwa-label">General Weighted Average (GWA)</span><span class="gwa-num" style="color:' + gradeColor(gwa) + '">' + gwa + '</span><span class="gwa-rem ' + badgeClass(gwa) + '">' + getRemarks(gwa) + '</span>';
    } else { gwaBar.style.display = "none"; }
  }
  applyStudentPhoto(stu.id, loadStudentPhoto(stu.id));
}

// ── Add Subject Modal ──
var selectedSubjectForAdd = null, selectedTeacherForAdd = null;
function openAddSubjectModal()  { selectedSubjectForAdd = null; selectedTeacherForAdd = null; renderAddSubjectStep1(); g("addSubjectModal").classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function closeAddSubjectModal() { g("addSubjectModal").classList.add("hidden"); document.body.style.overflow = ""; }

function renderAddSubjectStep1() {
  var approved = getApprovedSubjects(currentUser.id).map(function(inv) { return inv.subjectName; });
  var pending  = getPendingSubjects(currentUser.id).map(function(inv) { return inv.subjectName; });
  var seed     = currentUser.approvedSubjects || [];
  var taken    = approved.concat(pending).concat(seed);
  var totalAvail = 0; for (var cat in ALL_SHS_SUBJECTS) ALL_SHS_SUBJECTS[cat].forEach(function(s) { if (taken.indexOf(s) < 0) totalAvail++; });
  var html = '<div class="asj-step1">';
  html += '<div class="asj-stats-bar"><div class="asj-stat"><span class="asj-stat-num">' + totalAvail + '</span><span class="asj-stat-lbl">Available</span></div><div class="asj-stat-div"></div><div class="asj-stat"><span class="asj-stat-num" style="color:#5dde92;">' + taken.length + '</span><span class="asj-stat-lbl">Enrolled</span></div><div class="asj-stat-div"></div><div class="asj-stat"><span class="asj-stat-num" style="color:#f0a050;">' + pending.length + '</span><span class="asj-stat-lbl">Pending</span></div></div>';
  html += '<div class="asj-search-wrap"><span class="asj-search-icon">🔍</span><input class="asj-search-input" type="text" id="asjSearch" placeholder="Search subjects..." oninput="filterAsjCatalog()"><button class="asj-search-clear hidden" id="asjSearchClear" onclick="clearAsjSearch()">✕</button></div>';
  html += '<div class="asj-catalog" id="asjCatalog">' + buildAsjCatalog(taken, '') + '</div></div>';
  g("addSubjectContent").innerHTML = html;
}

function buildAsjCatalog(taken, query) {
  var catIcons  = {"Core Subjects":"📗","Applied Subjects":"🔧","Specialized — ABM":"💼","Specialized — HUMSS":"🎭","Specialized — STEM":"🔬","Specialized — TVL":"⚙️"};
  var catColors = {"Core Subjects":"#3b82f6","Applied Subjects":"#8b5cf6","Specialized — ABM":"#f59e0b","Specialized — HUMSS":"#ec4899","Specialized — STEM":"#10b981","Specialized — TVL":"#f97316"};
  var q = query.toLowerCase().trim(), html = "", totalFound = 0;
  for (var cat in ALL_SHS_SUBJECTS) {
    var subs     = ALL_SHS_SUBJECTS[cat];
    var filtered = q ? subs.filter(function(s) { return s.toLowerCase().indexOf(q) >= 0; }) : subs;
    if (!filtered.length) continue;
    totalFound += filtered.length;
    var col = catColors[cat] || "#e8000f", ico = catIcons[cat] || "📚";
    var enrolledCount = filtered.filter(function(s) { return taken.indexOf(s) >= 0; }).length;
    html += '<div class="asj-cat-group"><div class="asj-cat-hdr" style="--cat-color:' + col + ';"><span class="asj-cat-icon">' + ico + '</span><span class="asj-cat-name">' + cat + '</span><span class="asj-cat-count">' + filtered.length + '</span>';
    if (enrolledCount > 0) html += '<span class="asj-cat-enrolled">' + enrolledCount + ' enrolled</span>';
    html += '</div><div class="asj-cat-items">';
    filtered.forEach(function(s) {
      var isTaken = taken.indexOf(s) >= 0;
      var nameHtml = s;
      if (q) { var idx = s.toLowerCase().indexOf(q); if (idx >= 0) nameHtml = s.slice(0,idx) + '<mark class="asj-hl">' + s.slice(idx, idx + q.length) + '</mark>' + s.slice(idx + q.length); }
      if (isTaken) {
        html += '<div class="asj-item asj-item-taken"><div class="asj-item-check">✓</div><span class="asj-item-name">' + nameHtml + '</span><span class="asj-item-tag asj-tag-enrolled">Enrolled</span></div>';
      } else {
        html += '<div class="asj-item asj-item-avail" onclick="selectSubjectFromCatalog(\'' + s.replace(/'/g,"\\'") + '\')" style="--cat-color:' + col + ';"><div class="asj-item-dot" style="background:' + col + ';"></div><span class="asj-item-name">' + nameHtml + '</span><span class="asj-item-tag asj-tag-select">Select →</span></div>';
      }
    });
    html += '</div></div>';
  }
  if (!html || !totalFound) html = '<div class="asj-empty"><div class="asj-empty-icon">🔍</div><div class="asj-empty-text">No subjects found for "' + query + '"</div></div>';
  return html;
}

function filterAsjCatalog() {
  var q = g("asjSearch") ? g("asjSearch").value : "";
  var clearBtn = g("asjSearchClear"); if (clearBtn) clearBtn.classList.toggle("hidden", !q);
  var approved = getApprovedSubjects(currentUser.id).map(function(inv) { return inv.subjectName; });
  var pending  = getPendingSubjects(currentUser.id).map(function(inv) { return inv.subjectName; });
  var taken    = approved.concat(pending).concat(currentUser.approvedSubjects || []);
  var cat = g("asjCatalog"); if (cat) cat.innerHTML = buildAsjCatalog(taken, q);
}
function clearAsjSearch() {
  var inp = g("asjSearch"); if (inp) inp.value = "";
  var clearBtn = g("asjSearchClear"); if (clearBtn) clearBtn.classList.add("hidden");
  filterAsjCatalog();
}

function selectSubjectFromCatalog(subj) {
  selectedSubjectForAdd = subj;
  var html = '<div class="asj-step2"><div class="asj-step2-hdr"><button class="asj-back-btn" onclick="renderAddSubjectStep1()"><span>←</span> Back to Subjects</button></div>';
  html += '<div class="asj-selected-subj-card"><div class="asj-selected-icon">📚</div><div class="asj-selected-info"><div class="asj-selected-name">' + subj + '</div><div class="asj-selected-hint">Choose a teacher to send your enrollment request</div></div></div>';
  html += '<div class="asj-teacher-heading"><span class="asj-teacher-heading-icon">👩‍🏫</span> Select Your Teacher</div><div class="asj-teacher-list">';
  DB.teachers.forEach(function(t) {
    html += '<div class="asj-teacher-card" id="asjTcard_' + t.id + '" onclick="selectTeacherForSubject(\'' + t.id + '\',\'' + t.emailUser + '\',this)">' +
      '<div class="asj-tcard-avatar">👩‍🏫</div><div class="asj-tcard-info"><div class="asj-tcard-name">' + t.name + '</div><div class="asj-tcard-email">' + t.emailUser + '@asiasourceicollege.edu.ph</div></div>' +
      '<div class="asj-tcard-radio" id="asjRadio_' + t.id + '"></div></div>';
  });
  html += '</div><button class="asj-submit-btn" id="asjSubmitBtn" disabled onclick="submitSubjectRequest()"><span class="asj-submit-icon">📤</span> Send Enrollment Request</button></div>';
  g("addSubjectContent").innerHTML = html;
}
function selectTeacherForSubject(tid, temail, el) {
  selectedTeacherForAdd = tid;
  document.querySelectorAll(".asj-teacher-card").forEach(function(c) { c.classList.remove("selected"); });
  el.classList.add("selected");
  var btn = g("asjSubmitBtn"); if (btn) btn.disabled = false;
}

function submitSubjectRequest() {
  if (!selectedSubjectForAdd || !selectedTeacherForAdd) return;
  var teacher = null;
  for (var i = 0; i < DB.teachers.length; i++) { if (DB.teachers[i].id === selectedTeacherForAdd) { teacher = DB.teachers[i]; break; } }
  if (!teacher) return;
  var invitesList = loadInvites();
  var alreadyPending = invitesList.some(function(inv) { return inv.studentId === currentUser.id && inv.subjectName === selectedSubjectForAdd && inv.status === "pending"; });
  if (alreadyPending) { showToast("⚠️ You already have a pending request for " + selectedSubjectForAdd, "warning"); closeAddSubjectModal(); return; }
  var approvedNames = getApprovedSubjects(currentUser.id).map(function(inv) { return inv.subjectName; });
  var seedApproved  = currentUser.approvedSubjects || [];
  var allApprovedList = seedApproved.concat(approvedNames.filter(function(s) { return seedApproved.indexOf(s) < 0; }));
  if (allApprovedList.indexOf(selectedSubjectForAdd) >= 0) { showToast("✅ You are already enrolled in " + selectedSubjectForAdd, "success"); closeAddSubjectModal(); return; }
  var invite = {id:"INV-"+Date.now(),studentId:currentUser.id,studentName:currentUser.name,studentEmail:currentUser.emailUser,subjectName:selectedSubjectForAdd,teacherId:teacher.id,teacherEmail:teacher.emailUser,teacherName:teacher.name,status:"pending",timestamp:new Date().toISOString()};
  invitesList.push(invite); saveInvites(invitesList);
  addNotifForTeacher(teacher.id, {type:"subject_request",inviteId:invite.id,studentName:currentUser.name,studentEmail:currentUser.emailUser,studentId:currentUser.id,subjectName:selectedSubjectForAdd,message:currentUser.name+" requested to enroll in "+selectedSubjectForAdd});
  closeAddSubjectModal();
  showPendingOverlay(selectedSubjectForAdd, teacher.name);
  setTimeout(function() { loadStudentDash(currentUser); }, 1000);
}

function showPendingOverlay(subj, teacherName) {
  var el = document.createElement("div"); el.id = "pendingOverlay";
  el.innerHTML = '<div class="pending-overlay-inner"><div class="pending-check-anim">✅</div><div class="pending-title">Request Sent!</div><div class="pending-msg">Please wait for approval from<br><strong>' + teacherName + '</strong></div><div class="pending-subj">' + subj + '</div></div>';
  el.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;animation:fadeIn .3s ease";
  document.body.appendChild(el);
  setTimeout(function() { el.style.opacity = "0"; el.style.transition = "opacity .5s"; }, 2500);
  setTimeout(function() { if (el.parentNode) el.remove(); }, 3000);
}

// ── Subject Detail Modal ──
function openSubjectDetail(subName) {
  var subjectsForStu = getSubjectsForStudent(currentUser);
  var sub = null; for (var i = 0; i < subjectsForStu.length; i++) { if (subjectsForStu[i].name === subName) { sub = subjectsForStu[i]; break; } }
  var gr         = (currentUser.grades && currentUser.grades[subName]) ? currentUser.grades[subName] : {};
  var modalColor = DB.crColors[DB.crSubjects.indexOf(subName)] || "#e8000f";
  var iconTxt    = sub ? sub.icon : subName.slice(0,3).toUpperCase();
  var teacherTxt = sub ? "Teacher: " + sub.teacher : "";
  var semBadgeHtml = sub && sub.sem ? '<div style="margin-bottom:6px;"><span class="sem-badge sem-badge-' + sub.sem + '">' + (sub.sem === 1 ? "1st Semester" : "2nd Semester") + '</span></div>' : "";
  var sem1Grade = avgGrade(gr.q1, gr.q2), sem2Grade = avgGrade(gr.q3, gr.q4);
  var finalGrade = sub && sub.sem === 1 ? sem1Grade : sub && sub.sem === 2 ? sem2Grade : avgGrade(gr.q1, gr.q2, gr.q3, gr.q4);

  var html = '<div class="sm-hdr" style="border-color:' + modalColor + '44;"><div class="sm-hdr-icon" style="background:' + modalColor + '22;border-color:' + modalColor + '55;color:' + modalColor + ';">' + iconTxt + '</div><div class="sm-hdr-info">' + semBadgeHtml + '<div class="sm-hdr-name">' + subName + '</div><div class="sm-hdr-teacher">' + teacherTxt + '</div></div><div class="sm-hdr-grade"><div class="sm-hdr-grade-num" style="color:' + (finalGrade ? "var(--gold)" : "var(--muted)") + ';">' + (finalGrade || "—") + '</div><div class="sm-hdr-grade-lbl">Final Grade</div></div></div>';
  html += '<div class="sm-sem-summary">';
  if (sub && sub.sem === 1) {
    html += '<div class="sm-sem-box sm-sem-box-1"><div class="sm-sem-lbl">1st Semester</div><div class="sm-sem-qtrs"><span>Q1: ' + (gr.q1||"—") + '</span><span>Q2: ' + (gr.q2||"—") + '</span></div><div class="sm-sem-grade" style="color:' + (sem1Grade ? gradeColor(sem1Grade) : "var(--muted)") + ';">' + (sem1Grade||"—") + '</div></div>';
  } else if (sub && sub.sem === 2) {
    html += '<div class="sm-sem-box sm-sem-box-2"><div class="sm-sem-lbl">2nd Semester</div><div class="sm-sem-qtrs"><span>Q3: ' + (gr.q3||"—") + '</span><span>Q4: ' + (gr.q4||"—") + '</span></div><div class="sm-sem-grade" style="color:' + (sem2Grade ? gradeColor(sem2Grade) : "var(--muted)") + ';">' + (sem2Grade||"—") + '</div></div>';
  } else {
    html += '<div class="sm-sem-box sm-sem-box-1"><div class="sm-sem-lbl">1st Semester</div><div class="sm-sem-qtrs"><span>Q1: ' + (gr.q1||"—") + '</span><span>Q2: ' + (gr.q2||"—") + '</span></div><div class="sm-sem-grade" style="color:' + (sem1Grade ? gradeColor(sem1Grade) : "var(--muted)") + ';">' + (sem1Grade||"—") + '</div></div>';
    html += '<div class="sm-sem-box sm-sem-box-2"><div class="sm-sem-lbl">2nd Semester</div><div class="sm-sem-qtrs"><span>Q3: ' + (gr.q3||"—") + '</span><span>Q4: ' + (gr.q4||"—") + '</span></div><div class="sm-sem-grade" style="color:' + (sem2Grade ? gradeColor(sem2Grade) : "var(--muted)") + ';">' + (sem2Grade||"—") + '</div></div>';
  }
  html += '</div>';

  var qtrsToShow = sub && sub.sem === 1 ? ["q1","q2"] : sub && sub.sem === 2 ? ["q3","q4"] : ["q1","q2","q3","q4"];
  html += '<div class="sm-qtabs">';
  qtrsToShow.forEach(function(q, qi) {
    var qg = gr[q] || "";
    html += '<button class="sm-qtab' + (qi === 0 ? " active" : "") + '" onclick="switchSmTab(\'' + q + '\',this)"><span class="sm-qtab-lbl">' + q.toUpperCase() + '</span>' + (qg ? '<span class="sm-qtab-grade">' + qg + '</span>' : '<span class="sm-qtab-empty">—</span>') + '</button>';
  });
  html += '</div>';
  qtrsToShow.forEach(function(q, qi) {
    var qg = gr[q] || "";
    html += '<div class="sm-qpanel' + (qi === 0 ? "" : " hidden") + '" id="smPanel-' + q + '"><div class="sm-q-footer"><span class="sm-q-footer-lbl">' + Q_LABELS[q] + ' Grade</span><span class="sm-q-footer-val ' + (qg ? badgeClass(qg) : "sm-q-none") + '">' + (qg || "Not yet graded") + '</span></div></div>';
  });
  html += '<div class="sm-final-bar"><span class="sm-final-lbl">Final Grade</span><span class="sm-final-num" style="color:' + (finalGrade ? gradeColor(finalGrade) : "var(--muted)") + ';">' + (finalGrade || "—") + '</span><span class="sm-final-rem">' + getRemarks(finalGrade) + '</span></div>';

  g("subjectModalTitle").textContent = subName; g("subjectModalSub").textContent = ""; g("subjectModalContent").innerHTML = html;
  g("subjectModal").classList.remove("hidden"); document.body.style.overflow = "hidden";
  setTimeout(function() { enhanceStudentScorePanels(subName); }, 60);
}

function switchSmTab(q, btn) {
  document.querySelectorAll(".sm-qtab").forEach(function(t)  { t.classList.remove("active"); });
  document.querySelectorAll(".sm-qpanel").forEach(function(p) { p.classList.add("hidden"); });
  btn.classList.add("active");
  var panel = document.getElementById("smPanel-" + q); if (panel) panel.classList.remove("hidden");
  var subTitle = document.getElementById("subjectModalTitle");
  if (subTitle) setTimeout(function() { enhanceStudentScorePanels(subTitle.textContent); }, 40);
}
function closeSubjectModal() { g("subjectModal").classList.add("hidden"); document.body.style.overflow = ""; }

// ── Score panels in subject detail modal ──
function findStudentScoresInStore(stuName, subjName, qtr) {
  var gradePrefix = window.currentUser && window.currentUser.strand ? getGradeLevelShort(window.currentUser.strand) : "";
  var found = null;
  Object.keys(rosterGrades).forEach(function(classKey) {
    if (found) return;
    if (!rosterGrades[classKey] || !rosterGrades[classKey][stuName]) return;
    ['male','female'].forEach(function(gen) {
      if (found) return;
      var rosterKeys = [classKey];
      if (gradePrefix) rosterKeys.push(gradePrefix + "-" + classKey);
      rosterKeys.forEach(function(rkey) {
        if (found) return;
        if (!DB.classRoster[rkey]) return;
        var arr = DB.classRoster[rkey][gen] || [];
        for (var idx = 0; idx < arr.length; idx++) {
          if (arr[idx] === stuName) {
            var sk = classKey + "-" + gen + "-" + idx;
            if (scoreStore[sk] && scoreStore[sk][subjName] && scoreStore[sk][subjName][qtr]) {
              var scores = scoreStore[sk][subjName][qtr];
              var hasData = Object.keys(scores).some(function(k) {
                return scores[k] !== "" && scores[k] !== undefined && scores[k] !== null;
              });
              if (hasData) { found = scores; return; }
            }
          }
        }
      });
    });
  });
  return found;
}

function enhanceStudentScorePanels(subName) {
  if (!window.currentUser) return;
  var stuName = currentUser.name;
  var SC_GC   = {quiz:"#0ea5e9", activity:"#10b981", exam:"#e8000f"};
  var SC_GL   = {quiz:"📝 Written Works", activity:"🎯 Performance Tasks", exam:"📄 Quarterly Exam"};
  var qtrs    = ["q1","q2","q3","q4"];
  var TYPES   = [];
  ['quiz','activity','exam'].forEach(function(gid) {
    getGroupItems(gid).forEach(function(item, idx) { TYPES.push({key:gid+'_'+idx,label:item.label,group:gid}); });
  });
  qtrs.forEach(function(qtr) {
    var panel = g("smPanel-" + qtr); if (!panel) return;
    panel.querySelectorAll(".sm-group,.sm-score-group,.sm-no-scores").forEach(function(el) { el.remove(); });
    var scores = findStudentScoresInStore(stuName, subName, qtr);
    var footer = panel.querySelector(".sm-q-footer");
    if (!scores) {
      var ne = document.createElement("div"); ne.className = "sm-no-scores";
      ne.innerHTML = '<div class="sm-no-scores-icon">📊</div><div>No scores recorded yet for ' + qtr.toUpperCase() + '</div><div style="font-size:11px;margin-top:6px;color:rgba(255,255,255,0.3);">Your teacher will record scores in the gradebook</div>';
      if (footer) panel.insertBefore(ne, footer); else panel.appendChild(ne); return;
    }
    var anyRendered = false;
    ['quiz','activity','exam'].forEach(function(grp) {
      var items  = TYPES.filter(function(s) { return s.group === grp; });
      var hasAny = items.some(function(s) { var v = scores[s.key]; return v !== undefined && v !== "" && v !== null; });
      if (!hasAny) return;
      anyRendered = true;
      var gDiv = document.createElement("div"); gDiv.className = "sm-score-group";
      var lDiv = document.createElement("div"); lDiv.className = "sm-score-group-label"; lDiv.style.color = SC_GC[grp]; lDiv.textContent = SC_GL[grp]; gDiv.appendChild(lDiv);
      items.forEach(function(st) {
        var val = scores[st.key], hasV = val !== undefined && val !== "" && val !== null;
        var mx  = getItemMax(grp, parseInt(st.key.split('_')[1]));
        var num = hasV ? Number(val) : 0, pct = hasV ? Math.min(100, Math.round(num / mx * 100)) : 0;
        var card = document.createElement("div"); card.className = "sm-score-card"; card.style.setProperty("--sc-color", SC_GC[grp]);
        card.innerHTML = '<span class="sm-score-icon">' + (grp === "quiz" ? "✏️" : grp === "activity" ? "🎯" : "📝") + '</span>' +
          '<span class="sm-score-label">' + st.label + '</span>' +
          '<div class="sm-score-bar-wrap"><div class="sm-score-bar-fill" style="width:0%;background:' + SC_GC[grp] + ';" data-pct="' + pct + '"></div></div>' +
          '<div class="' + (hasV ? "sm-score-value" : "sm-score-empty") + '">' + (hasV ? num + '<span class="sm-score-max"> /' + mx + '</span>' : '—') + '</div>';
        gDiv.appendChild(card);
      });
      if (footer) panel.insertBefore(gDiv, footer); else panel.appendChild(gDiv);
      setTimeout(function() {
        gDiv.querySelectorAll(".sm-score-bar-fill").forEach(function(bar) {
          bar.style.transition = "width 0.6s cubic-bezier(0.34,1.2,0.64,1)"; bar.style.width = bar.getAttribute("data-pct") + "%";
        });
      }, 80);
    });
    if (!anyRendered) {
      var ne2 = document.createElement("div"); ne2.className = "sm-no-scores";
      ne2.innerHTML = '<div class="sm-no-scores-icon">📊</div><div>No scores recorded for ' + qtr.toUpperCase() + '</div>';
      if (footer) panel.insertBefore(ne2, footer); else panel.appendChild(ne2);
    }
  });
}

/* ============================================================
   10. TEACHER DASHBOARD & NOTIFICATIONS
   ============================================================ */
function loadTeacherDash(tch) {
  g("tchName").textContent        = tch.name;
  g("tchProfileName").textContent = tch.name;
  g("tchProfileEmail").textContent= tch.email + "@asiasourceicollege.edu.ph";
  var tchSubjs = loadTchSubjects(tch.id);
  currentSubject = tchSubjs[0] || null; currentGbSubject = tchSubjs[0] || null;
  updateTeacherNotifBadge();
  openFolderByStrand("HUMSS", "G11");
}
function updateTeacherNotifBadge() {
  var count = getUnreadTeacherNotifCount(currentUser.id), badge = g("tchNotifBadge");
  if (badge) { badge.textContent = count > 0 ? count : ""; badge.style.display = count > 0 ? "flex" : "none"; }
}

function openTeacherNotifPanel() {
  var notifs = getTeacherNotifs(currentUser.id), html = "";
  if (!notifs.length) html = '<div class="notif-empty">📭 No notifications yet</div>';
  else {
    notifs.forEach(function(n) {
      if (n.type !== "subject_request") return;
      var allInvites = loadInvites(), inv = null;
      for (var i = 0; i < allInvites.length; i++) { if (allInvites[i].id === n.inviteId) { inv = allInvites[i]; break; } }
      var status = inv ? inv.status : "pending";
      html += '<div class="notif-item' + (n.read ? "" : " notif-unread") + '" id="notif_' + n.id + '">';
      html += '<div class="notif-avatar">🎓</div><div class="notif-body">';
      html += '<div class="notif-title">Subject Enrollment Request</div>';
      html += '<div class="notif-msg"><strong>' + n.studentName + '</strong> wants to enroll in <strong>' + n.subjectName + '</strong></div>';
      html += '<div class="notif-email">' + n.studentEmail + '@asiasourceicollege.edu.ph</div>';
      var stuInfo = findStudentById(n.studentId);
      if (stuInfo && stuInfo.strand) {
        var gl = getGradeLevelShort(stuInfo.strand), sn = getStrandName(stuInfo.strand), sec = getSectionLetter(stuInfo.strand);
        var glColor = stuInfo.strand.indexOf("G11") >= 0 ? "#0ea5e9" : "#10b981";
        html += '<div class="notif-strand-row"><span class="gl-badge" style="background:' + glColor + '22;border-color:' + glColor + '55;color:' + glColor + ';">' + gl + '</span><span class="strand-mini">' + sn + (sec ? " - " + sec : "") + '</span></div>';
      }
      if (status === "pending") {
        html += '<div class="notif-actions"><button class="notif-approve" onclick="respondToInvite(\'' + n.inviteId + '\',\'approved\',\'' + n.id + '\')">✅ Approve</button><button class="notif-reject" onclick="respondToInvite(\'' + n.inviteId + '\',\'rejected\',\'' + n.id + '\')">✕ Decline</button></div>';
      } else {
        html += '<div class="notif-status ' + (status === "approved" ? "notif-status-ok" : "notif-status-no") + '">' + (status === "approved" ? "✅ Approved" : "✕ Declined") + '</div>';
      }
      html += '</div></div>';
      markTeacherNotifRead(currentUser.id, n.id);
    });
  }
  var panel = g("teacherNotifPanel");
  if (panel) { panel.innerHTML = html; panel.classList.toggle("hidden"); }
  updateTeacherNotifBadge();
}

function respondToInvite(inviteId, decision, notifId) {
  var invitesList = loadInvites(), inv = null;
  for (var i = 0; i < invitesList.length; i++) { if (invitesList[i].id === inviteId) { inv = invitesList[i]; invitesList[i].status = decision; break; } }
  if (!inv) { showToast("⚠️ Request not found.", "warning"); return; }
  saveInvites(invitesList);
  var freshDB = loadDB(); if (freshDB && Array.isArray(freshDB.students)) { DB.students = freshDB.students; DB.teachers = freshDB.teachers; }
  if (decision === "approved") {
    var stu = null; for (var si = 0; si < DB.students.length; si++) { if (DB.students[si].id === inv.studentId) { stu = DB.students[si]; break; } }
    if (stu) {
      ensureStudentGrades(stu); if (!stu.approvedSubjects) stu.approvedSubjects = [];
      if (stu.approvedSubjects.indexOf(inv.subjectName) < 0) stu.approvedSubjects.push(inv.subjectName);
      addStudentToStaticRoster(stu); saveDB();
      showToast("✅ " + inv.studentName + " approved for " + inv.subjectName + "!", "success");
    } else { showToast("✅ Approved! Student will see the subject when they refresh.", "success"); }
  } else { showToast("✕ Declined: " + (inv.subjectName || ""), "warning"); }
  openTeacherNotifPanel(); updateTeacherNotifBadge();
  if (currentUser && currentRole === "student" && currentUser.id === inv.studentId) {
    for (var j = 0; j < DB.students.length; j++) { if (DB.students[j].id === currentUser.id) { currentUser = DB.students[j]; break; } }
    loadStudentDash(currentUser);
  }
  if (currentView === "gradebook")        renderGradebook(currentFolder, currentSection);
  else if (currentView === "classrecord") renderClassRecord(currentFolder, currentSection);
  else                                    renderAttendance(currentFolder, currentSection);
}

// ── Add Student Modal ──
function openAddStudentModal()  { renderAddStudentModal(); g("addStudentModal").classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function closeAddStudentModal() { g("addStudentModal").classList.add("hidden"); document.body.style.overflow = ""; }
function renderAddStudentModal() {
  g("addStudentContent").innerHTML = '<div class="add-stu-modal"><div class="add-stu-title">➕ Add Student to Gradebook</div><div class="add-stu-subtitle">Search for a student by name or email</div><div class="add-stu-search-wrap"><input class="plain-input" type="text" id="addStuSearch" placeholder="Search student name or email..." oninput="renderAddStudentList()"></div><div class="add-stu-list" id="addStuList"></div></div>';
  renderAddStudentList();
}
function renderAddStudentList() {
  var q    = g("addStuSearch") ? g("addStuSearch").value.trim().toLowerCase() : "";
  var list = g("addStuList"); if (!list) return;
  var html = "", shown = 0;
  DB.students.forEach(function(stu) {
    if (q && stu.name.toLowerCase().indexOf(q) < 0 && stu.emailUser.toLowerCase().indexOf(q) < 0) return;
    shown++;
    var glShort  = getGradeLevelShort(stu.strand), sn = getStrandName(stu.strand), sec = getSectionLetter(stu.strand);
    var glColor  = stu.strand && stu.strand.indexOf("G11") >= 0 ? "#0ea5e9" : "#10b981";
    var strandLabel = DB.strandFull[stu.strand] || stu.strand || "Unknown";
    html += '<div class="add-stu-card"><div class="astu-avatar">🎓</div><div class="astu-info"><div class="astu-name">' + stu.name +
      '<span class="gl-badge" style="margin-left:8px;background:' + glColor + '22;border-color:' + glColor + '55;color:' + glColor + ';">' + glShort + '</span>' +
      (sn ? '<span class="strand-mini" style="margin-left:4px;">' + sn + (sec ? " · " + sec : "") + '</span>' : "") +
      '</div><div class="astu-email">' + stu.emailUser + '@asiasourceicollege.edu.ph</div><div class="astu-strand">' + (getGradeLevel(stu.strand) || "") + (getGradeLevel(stu.strand) && strandLabel ? " · " : "") + (strandLabel || "") + '</div></div>' +
      '<button class="astu-add-btn" onclick="addStudentToGradebook(\'' + stu.id + '\')">+ Add</button></div>';
  });
  list.innerHTML = shown ? html : '<div class="add-stu-empty">No students found.</div>';
}
function addStudentToGradebook(stuId) {
  var stu = findStudentById(stuId); if (!stu) { showToast("Student not found.", "error"); return; }
  var subjectsToApprove = currentUser ? loadTchSubjects(currentUser.id) : DB.crSubjects;
  var invitesList = loadInvites();
  subjectsToApprove.forEach(function(subj) {
    var exists = invitesList.some(function(inv) { return inv.studentId === stuId && inv.subjectName === subj && inv.status === "approved"; });
    if (!exists) invitesList.push({id:"INV-TCH-"+Date.now()+"-"+Math.random().toString(36).slice(2),studentId:stuId,studentName:stu.name,studentEmail:stu.emailUser,subjectName:subj,teacherId:currentUser.id,teacherEmail:currentUser.emailUser,teacherName:currentUser.name,status:"approved",timestamp:new Date().toISOString(),addedByTeacher:true});
  });
  saveInvites(invitesList);
  if (!stu.approvedSubjects) stu.approvedSubjects = [];
  subjectsToApprove.forEach(function(s) { if (stu.approvedSubjects.indexOf(s) < 0) stu.approvedSubjects.push(s); });
  ensureStudentGrades(stu); addStudentToStaticRoster(stu); saveDB();
  showToast("✅ " + stu.name + " (" + (getGradeLevel(stu.strand)||"Unknown Grade") + " · " + (getStrandName(stu.strand)||"Unknown Strand") + ") added to gradebook!", "success");
  closeAddStudentModal();
  if (currentView === "gradebook")        renderGradebook(currentFolder, currentSection);
  else if (currentView === "classrecord") renderClassRecord(currentFolder, currentSection);
  else                                    renderAttendance(currentFolder, currentSection);
}

/* ============================================================
   11. FOLDER / VIEW ROUTING
   ============================================================ */
function openFolder(el) {
  var strand = el.getAttribute("data-strand"), grade = el.getAttribute("data-grade") || "G11";
  document.querySelectorAll(".strand-item").forEach(function(i) { i.className = "strand-item"; });
  el.className = "strand-item active";
  openFolderByStrand(strand, grade);
}
function openFolderByStrand(strand, grade) {
  grade = grade || "G11";
  currentFolder = strand; currentGradeLevel = grade;
  currentSection = "A"; currentView = "gradebook"; currentQuarter = "q1";
  var crSubjs = getCrSubjectsForFolder();
  currentGbSubject = crSubjs[0] || null; currentSubject = crSubjs[0] || null;
  gbSearchQuery = ""; currentSemFilter = 0;
  var glColor = grade === "G11" ? "#0ea5e9" : "#10b981";
  g("folderTitle").innerHTML = '<span class="folder-gl-pill" style="background:' + glColor + '22;border-color:' + glColor + '55;color:' + glColor + ';">' + grade + '</span> ' + (DB.strandLabels[strand] || strand) + " — Student List";
  var singleSection = (strand === "ICT" || strand === "ABM");
  var secTabsWrap = g("secTabsWrap"); if (secTabsWrap) secTabsWrap.style.display = singleSection ? "none" : "";
  var stabs = document.querySelectorAll(".stab"); stabs[0].className = "stab active"; if (stabs[1]) stabs[1].className = "stab";
  document.querySelectorAll(".vtab").forEach(function(t) { t.className = "vtab"; });
  g("vtabGradebook").className = "vtab active";
  showView("gradebook"); renderGradebook(strand, "A");
}
function switchSection(sec, btn) {
  currentSection = sec; gbSearchQuery = "";
  document.querySelectorAll(".stab").forEach(function(t) { t.className = "stab"; });
  btn.className = "stab active";
  if (currentView === "gradebook")        renderGradebook(currentFolder, sec);
  else if (currentView === "classrecord") renderClassRecord(currentFolder, sec);
  else                                    renderAttendance(currentFolder, sec);
}
function setView(view, btn) {
  currentView = view;
  document.querySelectorAll(".vtab").forEach(function(t) { t.className = "vtab"; });
  btn.className = "vtab active"; showView(view);
  if (currentView === "gradebook")        renderGradebook(currentFolder, currentSection);
  else if (currentView === "classrecord") renderClassRecord(currentFolder, currentSection);
  else                                    renderAttendance(currentFolder, currentSection);
}
function showView(view) {
  hideEl("viewGradebook"); hideEl("viewClassRecord"); hideEl("viewAttendance");
  if (view === "gradebook")        showEl("viewGradebook");
  else if (view === "classrecord") showEl("viewClassRecord");
  else                             showEl("viewAttendance");
}

/* ============================================================
   12. GRADEBOOK
   ============================================================ */
function setGbQuarter(q, btn) {
  currentQuarter = q;
  document.querySelectorAll(".qtr-btn").forEach(function(b) { b.className = "qtr-btn"; });
  btn.className = "qtr-btn active"; renderGradebook(currentFolder, currentSection);
}
function setGbSubject(subj) { currentGbSubject = subj; gbSearchQuery = ""; renderGradebook(currentFolder, currentSection); }
function handleGbSearch(val) { gbSearchQuery = val.toLowerCase().trim(); _renderGbRows(currentFolder + "-" + currentSection); }

function renderGradebook(strand, section) {
  var key      = strand + '-' + section;
  var crSubjs  = getCrSubjectsForFolder();
  var crCols   = getCrColorsForFolder();
  if (!currentGbSubject || crSubjs.indexOf(currentGbSubject) < 0) currentGbSubject = crSubjs[0] || null;

  var components = getAllScoreComponents();
  var weights    = getDepEdWeights(currentGbSubject || "", strand);

  // Context label for weights bar
  var weightLabel = isTVLFolder(strand) ? "TVL Track"
    : (currentGbSubject && CORE_SUBJECTS_LIST.indexOf(currentGbSubject) >= 0) ? "Core Subject"
    : (currentGbSubject && SPECIAL_SUBJECTS.indexOf(currentGbSubject) >= 0)   ? "Work Immersion/Research"
    : "Academic — Other Subjects";

  var weightBarHtml = '<div class="gb-settings-strip" style="margin-bottom:8px;">' +
    '<span class="gb-settings-strip-label" style="font-size:9px;white-space:nowrap;">📊 DepEd Weights <span style="color:rgba(255,255,255,0.3);font-weight:400;">(' + weightLabel + ')</span>:</span>' +
    '<span class="gb-settings-chip" style="border-color:#0ea5e933;background:rgba(14,165,233,0.12);color:#7dd3fc;">📝 WW <strong>' + weights.quiz + '%</strong></span>' +
    '<span class="gb-settings-chip-sep">·</span>' +
    '<span class="gb-settings-chip" style="border-color:#10b98133;background:rgba(16,185,129,0.12);color:#6ee7b7;">🎯 PT <strong>' + weights.activity + '%</strong></span>' +
    '<span class="gb-settings-chip-sep">·</span>' +
    '<span class="gb-settings-chip" style="border-color:#e8000f33;background:rgba(232,0,15,0.12);color:#fca5a5;">📄 Exam <strong>' + weights.exam + '%</strong></span>' +
    '<button class="gb-settings-edit-link" onclick="openScoreSettingsModal()">⚙️ Score Settings</button>' +
    '</div>';

  var stripHtml = weightBarHtml + '<div class="gb-settings-strip" style="margin-bottom:0;"><span class="gb-settings-strip-label">⚙️ Max Scores:</span>';
  ['quiz','activity','exam'].forEach(function(gid) {
    var meta = GROUP_META[gid];
    getGroupItems(gid).forEach(function(item) {
      var short = item.label.length > 8 ? item.label.slice(0,7) + '…' : item.label;
      stripHtml += '<span class="gb-settings-chip" style="border-color:' + meta.color + '33;">' + short + ' <strong>/' + item.max + '</strong></span>';
    });
    if (gid !== 'exam') stripHtml += '<span class="gb-settings-chip-sep">·</span>';
  });
  stripHtml += '</div>';

  var pillsHtml = '';
  for (var si = 0; si < crSubjs.length; si++) {
    var s = crSubjs[si], col = crCols[si % crCols.length], isAct = currentGbSubject === s;
    pillsHtml += '<button class="subj-btn' + (isAct ? ' active' : '') + '" data-subj="' + s + '" style="' + (isAct ? 'background:' + col + ';border-color:' + col + ';color:#fff;' : 'border-color:' + col + ';color:' + col + ';') + '" onclick="setGbSubject(this.getAttribute(\'data-subj\'))">' + s + '</button>';
  }

  var qtrs = ['q1','q2','q3','q4']; if (qtrs.indexOf(currentQuarter) < 0) currentQuarter = qtrs[0];
  var toolbar = g("gbToolbar");
  if (toolbar) {
    toolbar.innerHTML = stripHtml +
      '<div class="gb-toolbar-inner" style="margin-bottom:10px;margin-top:10px;"><span class="toolbar-lbl">Subject:</span><div class="subj-pills">' + pillsHtml +
      '<button class="subj-add-btn" onclick="openTchSubjectMgr()" title="Manage Subjects">＋ Add Subject</button></div></div>' +
      '<div class="gb-toolbar-inner"><span class="toolbar-lbl">Quarter:</span>' +
      '<div class="qtr-tabs">' + qtrs.map(function(q) { return '<button class="qtr-btn' + (currentQuarter === q ? ' active' : '') + '" onclick="setGbQuarter(\'' + q + '\',this)">' + q.toUpperCase() + '</button>'; }).join('') + '</div>' +
      '<div class="gb-search-wrap"><span class="gb-search-icon">🔍</span><input class="gb-search-input" type="text" placeholder="Search student..." value="' + gbSearchQuery + '" oninput="handleGbSearch(this.value)">' +
      (gbSearchQuery ? '<button class="gb-search-clear" onclick="handleGbSearch(\'\');document.querySelector(\'.gb-search-input\').value=\'\'">✕</button>' : '') +
      '</div><button class="save-qtr-btn" onclick="saveQuarterGrades(\'' + key + '\')">💾 Save ' + currentQuarter.toUpperCase() + (currentGbSubject ? ' — ' + currentGbSubject : '') + ' </button></div>';
  }

  // Rebuild table header (WW / PT / Exam only)
  var bgMap    = {quiz:'rgba(14,165,233,0.35)', activity:'rgba(16,185,129,0.35)', exam:'rgba(232,0,15,0.35)'};
  var colorMap = {quiz:'#7dd3fc', activity:'#6ee7b7', exam:'#fca5a5'};
  var groupHeaderCells = '', subHeaderCells = '';
  ['quiz','activity','exam'].forEach(function(gid) {
    var meta = GROUP_META[gid], items = getGroupItems(gid);
    groupHeaderCells += '<th colspan="' + items.length + '" class="gb-group-th" style="background:' + bgMap[gid] + ';">' + meta.label + '</th>';
    items.forEach(function(item) { subHeaderCells += '<th class="gb-sub-th" style="color:' + colorMap[gid] + ';">' + item.label + '<span class="gb-dynamic-max">/' + item.max + '</span></th>'; });
  });
  var tableEl = document.querySelector('#viewGradebook .gb-table, #viewGradebook table');
  if (tableEl && tableEl.querySelector('thead')) {
    tableEl.querySelector('thead').innerHTML =
      '<tr><th class="gb-num">#</th><th class="gb-name">Student Name</th>' + groupHeaderCells +
      '<th>Computed</th><th>Remarks</th><th id="gbSubjTh" class="gb-subj-th">' + (currentGbSubject || 'Subject') + ' Grade (' + currentQuarter.toUpperCase() + ')</th></tr>' +
      '<tr class="gb-sub-header"><th></th><th></th>' + subHeaderCells + '<th></th><th></th><th></th></tr>';
  }
  _renderGbRows(key);
}

function _renderGbRows(key) {
  var r          = getDynamicRoster(key, currentGradeLevel);
  var tbody      = g("gbBody"); tbody.innerHTML = '';
  var q          = gbSearchQuery;
  var components = getAllScoreComponents();
  var TOTAL_COLS = 2 + components.length + 3;

  function matchesSearch(name) { return !q || name.toLowerCase().indexOf(q) >= 0; }
  var rowNum = 0;

  function inp(comp, val, sk) {
    return '<div class="score-input-wrap"><input class="score-input" type="number" min="0" max="' + comp.max + '" value="' + val + '" placeholder="—" data-sk="' + sk + '" data-subj="' + currentGbSubject + '" data-qtr="' + currentQuarter + '" data-comp="' + comp.storeKey + '" data-max="' + comp.max + '" oninput="handleScoreInput(this)"><span class="score-input-max-hint">/' + comp.max + '</span></div>';
  }

  function makeRows(entries, genderLabel) {
    var filtered = [];
    entries.forEach(function(entry, i) { if (matchesSearch(entry.name)) filtered.push({entry:entry,origIdx:i}); });
    if (!filtered.length) return;
    tbody.innerHTML += '<tr><td colspan="' + TOTAL_COLS + '" class="cr-gender-row">' + (genderLabel === 'male' ? '👨 MALE' : '👩 FEMALE') + ' (' + filtered.length + ')</td></tr>';
    filtered.forEach(function(item) {
      var origIdx = item.origIdx, entry = item.entry, name = entry.name;
      var sk      = getScoreStoreKey(key, genderLabel, origIdx);
      var sc      = getScores(sk, currentGbSubject, currentQuarter);
      var fg      = computeDetailedGrade(sc), bc = fg ? badgeClass(fg) : '';
      var stuSubjGrade = '—', rgVal = getRosterGrade(key, name, currentGbSubject, currentQuarter);
      if (rgVal !== '') stuSubjGrade = rgVal;
      var badge = (entry.isRegistered && entry.strand) ? glBadgeHtml(entry.strand) : '';
      var displayName = name;
      if (q) { var idx2 = name.toLowerCase().indexOf(q); if (idx2 >= 0) displayName = name.slice(0,idx2) + '<mark class="gb-hl">' + name.slice(idx2, idx2 + q.length) + '</mark>' + name.slice(idx2 + q.length); }
      rowNum++;
      var inputCells = '';
      components.forEach(function(comp) { var val = sc[comp.storeKey] !== undefined ? sc[comp.storeKey] : ''; inputCells += '<td>' + inp(comp, val, sk) + '</td>'; });
      tbody.innerHTML += '<tr>' +
        '<td>' + rowNum + '</td>' +
        '<td class="gb-name-cell"><div class="student-name-wrap">' + displayName + badge + '</div></td>' +
        inputCells +
        '<td id="fg-' + sk + '-' + currentGbSubject + '-' + currentQuarter + '">' + (fg !== null ? '<span class="final-badge ' + bc + '">' + fg + '</span>' : "—") + '</td>' +
        '<td id="rem-' + sk + '-' + currentGbSubject + '-' + currentQuarter + '" style="font-size:11px;font-weight:600;color:' + gradeColor(fg) + '">' + getRemarks(fg) + '</td>' +
        '<td class="gb-subj-grade-col"><span class="subj-saved-badge' + (stuSubjGrade !== '—' ? ' has-grade' : '') + '">' + stuSubjGrade + '</span></td></tr>';
    });
  }
  makeRows(r.male, 'male'); makeRows(r.female, 'female');
  if (!tbody.innerHTML) tbody.innerHTML = '<tr><td colspan="' + TOTAL_COLS + '" class="gb-no-results">' + (currentGbSubject ? 'No students found.' : '<div class="gb-no-subject-state">📚 No subject selected yet.<br><small>Click <strong>＋ Add Subject</strong> above to get started.</small></div>') + '</td></tr>';
}

function handleScoreInput(input) {
  var sk   = input.getAttribute('data-sk'),  subj = input.getAttribute('data-subj');
  var qtr  = input.getAttribute('data-qtr'), comp = input.getAttribute('data-comp');
  var val  = input.value, mx = parseInt(input.getAttribute('data-max') || '100');
  if (val !== '' && Number(val) > mx) { input.value = mx; val = String(mx); }
  setScore(sk, subj, qtr, comp, val);
  var sc = getScores(sk, subj, qtr), fg = computeDetailedGrade(sc);
  var fgEl  = g('fg-'  + sk + '-' + subj + '-' + qtr);
  var remEl = g('rem-' + sk + '-' + subj + '-' + qtr);
  if (fgEl)  fgEl.innerHTML  = fg !== null ? '<span class="final-badge ' + badgeClass(fg) + '">' + fg + '</span>' : "—";
  if (remEl) { remEl.textContent = getRemarks(fg); remEl.style.color = gradeColor(fg); }
  saveGrades();
}
function saveQuarterGrades(classKey) {
  var r = getDynamicRoster(classKey, currentGradeLevel), saved = 0, skipped = 0;
  function process(entries, genderLabel) {
    entries.forEach(function(entry, i) {
      var sk = getScoreStoreKey(classKey, genderLabel, i), sc = getScores(sk, currentGbSubject, currentQuarter);
      var fg = computeDetailedGrade(sc);
      if (fg === null) { skipped++; return; }
      setRosterGrade(classKey, entry.name, currentGbSubject, currentQuarter, fg); saved++;
    });
  }
  process(r.male, 'male'); process(r.female, 'female');
  saveDB(); saveGrades();
  showToast(saved > 0 ? '💾 [' + currentGbSubject + '] ' + currentQuarter.toUpperCase() + ' — ' + saved + ' grade(s) saved! ✅' : '⚠️ No scores found. Enter scores first.', saved > 0 ? 'success' : 'warning');
  renderGradebook(currentFolder, currentSection);
}

/* ============================================================
   13. CLASS RECORD
   ============================================================ */
function setCrSubject(subj) { currentSubject = subj; renderClassRecord(currentFolder, currentSection); }

function renderClassRecord(strand, section) {
  var key     = strand + "-" + section, r = getDynamicRoster(key, currentGradeLevel);
  var crSubjs = getCrSubjectsForFolder(), crCols = getCrColorsForFolder();
  if (!currentSubject || crSubjs.indexOf(currentSubject) < 0) currentSubject = crSubjs[0] || null;
  var subjColor = currentSubject ? (crCols[crSubjs.indexOf(currentSubject) % crCols.length] || "#374151") : "#374151";
  var subjDark  = darken(subjColor, -28);
  var crToolbar = g("crToolbar");
  if (crToolbar) {
    var pillsHtml = '';
    for (var si = 0; si < crSubjs.length; si++) {
      var s = crSubjs[si], col = crCols[si % crCols.length], isActive = currentSubject === s;
      pillsHtml += '<button class="subj-btn' + (isActive ? ' active' : '') + '" data-subj="' + s + '" style="' + (isActive ? 'background:' + col + ';border-color:' + col + ';color:#fff;' : 'border-color:' + col + ';color:' + col + ';') + '" onclick="setCrSubject(this.getAttribute(\'data-subj\'))">' + s + '</button>';
    }
    crToolbar.innerHTML = '<div class="cr-toolbar-inner"><span class="toolbar-lbl">Subject:</span><div class="subj-pills">' + pillsHtml + '<button class="subj-add-btn" onclick="openTchSubjectMgr()" title="Manage Subjects">＋ Add Subject</button></div><button class="save-qtr-btn" onclick="saveCrGrades(\'' + key + '\')">💾 Save All Quarters</button></div>';
  }
  var thead = g("crHead");
  if (thead) {
    thead.innerHTML = '<tr>' +
      '<th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2)">#</th>' +
      '<th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">STUDENT NAME</th>' +
      '<th class="cr-th cr-subj-hdr" colspan="3" style="background:' + subjColor + '">' + (currentSubject || "No Subject") + '</th></tr>' +
      '<tr><th class="cr-th cr-qtr-hdr" style="background:rgba(14,165,233,0.35);color:#38bdf8;">1st Semester<div style="font-size:9px;opacity:.7;">Q1 + Q2</div></th>' +
      '<th class="cr-th cr-qtr-hdr" style="background:rgba(16,185,129,0.35);color:#34d399;">2nd Semester<div style="font-size:9px;opacity:.7;">Q3 + Q4</div></th>' +
      '<th class="cr-th cr-final-hdr" style="background:' + subjDark + '">FINAL</th></tr>';
  }
  var tbody = g("crBody"); tbody.innerHTML = "";
  function makeCrRows(entries, genderLabel) {
    tbody.innerHTML += '<tr><td colspan="5" class="cr-gender-row ' + (genderLabel === "female" ? "cr-female-row" : "") + '">' + (genderLabel === "male" ? "👨 MALE" : "👩 FEMALE") + "</td></tr>";
    entries.forEach(function(entry, i) {
      var name = entry.name, alt = (i % 2 !== 0) ? "cr-alt" : "", ck = genderLabel + "-" + i;
      var stuSubjQ = getAllRosterGrades(key, name, currentSubject);
      var stuDb = findStudentByName(name);
      if (stuDb) {
        ensureStudentGrades(stuDb);
        if (stuDb.grades[currentSubject]) {
          var dbGr = stuDb.grades[currentSubject];
          if (!stuSubjQ.q1 && dbGr.q1) stuSubjQ.q1 = dbGr.q1; if (!stuSubjQ.q2 && dbGr.q2) stuSubjQ.q2 = dbGr.q2;
          if (!stuSubjQ.q3 && dbGr.q3) stuSubjQ.q3 = dbGr.q3; if (!stuSubjQ.q4 && dbGr.q4) stuSubjQ.q4 = dbGr.q4;
        }
      }
      var q1 = stuSubjQ.q1||"", q2 = stuSubjQ.q2||"", q3 = stuSubjQ.q3||"", q4 = stuSubjQ.q4||"";
      var sem1g = avgGrade(q1,q2), sem2g = avgGrade(q3,q4), fg = avgGrade(q1,q2,q3,q4);
      var da = ' data-key="' + key + '" data-ck="' + ck + '" data-subj="' + currentSubject + '" data-stuname="' + name + '"';
      var badge = (entry.isRegistered && entry.strand) ? glBadgeHtml(entry.strand) : '';
      tbody.innerHTML += '<tr class="cr-row ' + alt + '"><td class="cr-td cr-sticky cr-num-col cr-num-td">' + (i+1) + '</td>' +
        '<td class="cr-td cr-sticky cr-name-col cr-name-td"><div class="student-name-wrap">' + name + badge + '</div></td>' +
        '<td class="cr-td cr-score-td" style="background:rgba(14,165,233,0.06);"><input class="cr-input" type="number" min="0" max="100" value="' + q1 + '" placeholder="—"' + da + ' data-q="q1" oninput="handleCrInput(this)"> / <input class="cr-input" type="number" min="0" max="100" value="' + q2 + '" placeholder="—"' + da + ' data-q="q2" oninput="handleCrInput(this)"><div style="font-size:10px;color:' + (sem1g?gradeColor(sem1g):"var(--muted)") + ';font-weight:800;margin-top:2px;">' + (sem1g||"—") + '</div></td>' +
        '<td class="cr-td cr-score-td" style="background:rgba(16,185,129,0.06);"><input class="cr-input" type="number" min="0" max="100" value="' + q3 + '" placeholder="—"' + da + ' data-q="q3" oninput="handleCrInput(this)"> / <input class="cr-input" type="number" min="0" max="100" value="' + q4 + '" placeholder="—"' + da + ' data-q="q4" oninput="handleCrInput(this)"><div style="font-size:10px;color:' + (sem2g?gradeColor(sem2g):"var(--muted)") + ';font-weight:800;margin-top:2px;">' + (sem2g||"—") + '</div></td>' +
        '<td class="cr-td cr-final-td" id="crf-' + key + "-" + ck + '">' + (fg ? '<span class="cr-final-badge ' + badgeClass(fg) + '">' + fg + '</span>' : "—") + '</td></tr>';
    });
  }
  makeCrRows(r.male, "male"); makeCrRows(r.female, "female");
}

function handleCrInput(input) {
  var key  = input.getAttribute("data-key"), ck   = input.getAttribute("data-ck");
  var subj = input.getAttribute("data-subj"), qkey = input.getAttribute("data-q");
  var stuName = input.getAttribute("data-stuname"), val = input.value;
  setRosterGrade(key, stuName, subj, qkey, val);
  var allQ = getAllRosterGrades(key, stuName, subj), fg = avgGrade(allQ.q1, allQ.q2, allQ.q3, allQ.q4);
  var fEl = g("crf-" + key + "-" + ck); if (fEl) fEl.innerHTML = fg ? '<span class="cr-final-badge ' + badgeClass(fg) + '">' + fg + '</span>' : "—";
  saveDB(); saveGrades();
  var cell = input.parentElement, semDiv = cell.querySelector("div[style]");
  if (semDiv) {
    if (qkey === "q1" || qkey === "q2") { var s1 = avgGrade(allQ.q1, allQ.q2); semDiv.textContent = s1 || "—"; semDiv.style.color = s1 ? gradeColor(s1) : "var(--muted)"; }
    else { var s2 = avgGrade(allQ.q3, allQ.q4); semDiv.textContent = s2 || "—"; semDiv.style.color = s2 ? gradeColor(s2) : "var(--muted)"; }
  }
}
function saveCrGrades(key) { saveDB(); saveGrades(); showToast("💾 [" + currentSubject + "] all quarter grades saved! ✅", "success"); }

/* ============================================================
   14. ATTENDANCE
   ============================================================ */
function renderAttendance(strand, section) {
  var key = strand + "-" + section, r = getDynamicRoster(key, currentGradeLevel);
  if (!attStore[key]) attStore[key] = {};
  var mRow = g("attMonthRow"), dRow = g("attDayRow");
  mRow.innerHTML = '<th class="cr-th cr-sticky cr-num-col cr-num-td" rowspan="2" style="background:var(--bg2);">#</th><th class="cr-th cr-sticky cr-name-col cr-name-td" rowspan="2" style="background:var(--bg2);text-align:left;padding:6px 8px;">NAMES OF LEARNERS</th><th class="cr-th att-total-hdr" colspan="2" style="background:#7a0006;">YEARLY TOTAL</th>';
  dRow.innerHTML = '<th class="cr-th att-total-sub" style="background:#9b1c1c;">ABS</th><th class="cr-th att-total-sub" style="background:#14532d;">PRS</th>';
  DB.months.forEach(function(mon, mi) {
    var mbg = DB.monthColors[mi];
    mRow.innerHTML += '<th class="cr-th cr-subj-hdr" colspan="' + (mon.days + 2) + '" style="background:' + mbg + '">' + mon.name + '</th>';
    for (var d = 1; d <= mon.days; d++) dRow.innerHTML += '<th class="cr-th att-day-hdr" style="background:' + mbg + '">' + d + '</th>';
    dRow.innerHTML += '<th class="cr-th att-sub-hdr" style="background:#374151;">ABS</th><th class="cr-th att-sub-hdr" style="background:#14532d;">PRS</th>';
  });
  var tbody = g("attBody"); tbody.innerHTML = "";
  var totalCols = 2 + 2 + DB.months.reduce(function(a, m) { return a + m.days + 2; }, 0);
  function makeAttRows(entries, genderLabel) {
    tbody.innerHTML += '<tr><td colspan="' + totalCols + '" class="cr-gender-row ' + (genderLabel === "female" ? "cr-female-row" : "") + '">' + (genderLabel === "male" ? "👨 MALE" : "👩 FEMALE") + "</td></tr>";
    entries.forEach(function(entry, i) {
      var name = entry.name, ak = genderLabel + "-" + i;
      if (!attStore[key][ak]) attStore[key][ak] = {};
      var badge = (entry.isRegistered && entry.strand) ? glBadgeHtml(entry.strand) : '';
      var html = '<tr class="cr-row ' + (i % 2 !== 0 ? "cr-alt" : "") + '">';
      html += '<td class="cr-td cr-sticky cr-num-col cr-num-td">' + (i+1) + '</td>';
      html += '<td class="cr-td cr-sticky cr-name-col cr-name-td"><div class="student-name-wrap">' + name + badge + '</div></td>';
      html += '<td class="cr-td att-total-cell" id="att-yabs-' + key + "-" + ak + '">—</td><td class="cr-td att-total-cell" id="att-yprs-' + key + "-" + ak + '">—</td>';
      DB.months.forEach(function(mon, mi2) {
        if (!attStore[key][ak][mi2]) attStore[key][ak][mi2] = {};
        for (var dd = 0; dd < mon.days; dd++) {
          var val = attStore[key][ak][mi2][dd] || "";
          var cc  = val === "A" ? "att-a-cell" : val === "P" ? "att-p-cell" : val === "L" ? "att-l-cell" : "";
          html += '<td class="cr-td att-day-cell"><input class="att-input ' + cc + '" maxlength="1" value="' + val + '" data-key="' + key + '" data-ak="' + ak + '" data-mi="' + mi2 + '" data-day="' + dd + '" oninput="handleAttInput(this)"></td>';
        }
        html += '<td class="cr-td att-count-cell" id="att-abs-' + key + "-" + ak + "-" + mi2 + '">—</td><td class="cr-td att-count-cell" id="att-prs-' + key + "-" + ak + "-" + mi2 + '">—</td>';
      });
      tbody.innerHTML += html + "</tr>";
    });
  }
  makeAttRows(r.male, "male"); makeAttRows(r.female, "female");
}
function handleAttInput(input) { updateAtt(input.getAttribute("data-key"), input.getAttribute("data-ak"), parseInt(input.getAttribute("data-mi"),10), parseInt(input.getAttribute("data-day"),10), input); }
function updateAtt(key, ak, mi, day, input) {
  var val = input.value.toUpperCase().replace(/[^PAL]/g,""); input.value = val;
  if (!attStore[key])     attStore[key] = {};
  if (!attStore[key][ak]) attStore[key][ak] = {};
  if (!attStore[key][ak][mi]) attStore[key][ak][mi] = {};
  attStore[key][ak][mi][day] = val;
  input.className = "att-input" + (val === "A" ? " att-a-cell" : val === "P" ? " att-p-cell" : val === "L" ? " att-l-cell" : "");
  recomputeAtt(key, ak); saveGrades();
}
function recomputeAtt(key, ak) {
  var data = (attStore[key] && attStore[key][ak]) ? attStore[key][ak] : {}, yAbs = 0, yPrs = 0;
  DB.months.forEach(function(mon, mi) {
    var md = data[mi] || {}, abs = 0, prs = 0;
    for (var d = 0; d < mon.days; d++) { var v = md[d] || ""; if (v === "A") abs++; if (v === "P") prs++; }
    yAbs += abs; yPrs += prs;
    var ae = g("att-abs-" + key + "-" + ak + "-" + mi), pe = g("att-prs-" + key + "-" + ak + "-" + mi);
    if (ae) { ae.textContent = abs || "—"; ae.style.color = abs ? "#ff9090" : "var(--muted)"; }
    if (pe) { pe.textContent = prs || "—"; pe.style.color = prs ? "#5dde92" : "var(--muted)"; }
  });
  var ya = g("att-yabs-" + key + "-" + ak), yp = g("att-yprs-" + key + "-" + ak);
  if (ya) { ya.textContent = yAbs || "—"; ya.style.color = yAbs ? "#ff9090" : "var(--muted)"; ya.style.fontWeight = "800"; }
  if (yp) { yp.textContent = yPrs || "—"; yp.style.color = yPrs ? "#5dde92" : "var(--muted)"; yp.style.fontWeight = "800"; }
}

/* ============================================================
   15. SCORE SETTINGS MODAL
   ============================================================ */
function openScoreSettingsModal()  { renderScoreSettingsModal(); var m = g("scoreSettingsModal"); if (m) { m.classList.remove("hidden"); document.body.style.overflow = "hidden"; } }
function closeScoreSettingsModal() { var m = g("scoreSettingsModal"); if (m) { m.classList.add("hidden"); document.body.style.overflow = ""; } }

function renderScoreSettingsModal() {
  var subj    = (typeof currentGbSubject !== 'undefined' && currentGbSubject) ? currentGbSubject
              : (typeof currentSubject   !== 'undefined' && currentSubject)   ? currentSubject : "";
  var folder  = (typeof currentFolder !== 'undefined') ? currentFolder : "";
  var weights = getDepEdWeights(subj, folder);
  var contextLabel = isTVLFolder(folder) ? "TVL / Sports / Arts & Design Track"
    : (subj && CORE_SUBJECTS_LIST.indexOf(subj) >= 0) ? "Core Subject — Academic Track"
    : (subj && SPECIAL_SUBJECTS.indexOf(subj) >= 0)   ? "Work Immersion / Research — Academic Track"
    : "All Other Subjects — Academic Track";

  var html = '<div style="padding:16px 28px 12px;background:rgba(30,64,175,0.1);border-bottom:1px solid rgba(59,130,246,0.2);">' +
    '<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(147,197,253,0.6);margin-bottom:8px;">Current Weight Context</div>' +
    '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">' +
    '<span style="background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.3);border-radius:20px;padding:4px 14px;font-size:11.5px;font-weight:700;color:#93c5fd;">📍 ' + contextLabel + '</span>' +
    (subj ? '<span style="background:rgba(255,184,0,0.1);border:1px solid rgba(255,184,0,0.3);border-radius:20px;padding:4px 12px;font-size:11px;font-weight:600;color:var(--gold);">📚 ' + subj + '</span>' : '') +
    '</div><div style="margin-top:10px;font-size:11px;color:rgba(255,255,255,0.3);">⚠️ Weights are fixed per DepEd Table 5 — only item names & max scores are configurable.</div></div>';

  // Weight tiles (read-only)
  var bgC  = {quiz:'rgba(14,165,233,0.1)',  activity:'rgba(16,185,129,0.1)',  exam:'rgba(232,0,15,0.1)'};
  var brC  = {quiz:'rgba(14,165,233,0.3)',  activity:'rgba(16,185,129,0.3)',  exam:'rgba(232,0,15,0.3)'};
  var txtC = {quiz:'#38bdf8', activity:'#34d399', exam:'#fca5a5'};
  var wVals= {quiz:weights.quiz, activity:weights.activity, exam:weights.exam};

  html += '<div style="padding:16px 28px 4px;"><div style="display:flex;gap:8px;margin-bottom:12px;">';
  ['quiz','activity','exam'].forEach(function(gid) {
    var meta = GROUP_META[gid];
    html += '<div style="flex:1;background:' + bgC[gid] + ';border:1px solid ' + brC[gid] + ';border-radius:14px;padding:14px 10px;text-align:center;">' +
      '<div style="font-size:10.5px;font-weight:800;color:' + txtC[gid] + ';margin-bottom:6px;">' + meta.label + '</div>' +
      '<div style="font-family:\'Cinzel\',serif;font-size:26px;font-weight:900;color:' + txtC[gid] + ';line-height:1;">' + wVals[gid] + '</div>' +
      '<div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px;">% weight</div></div>';
  });
  html += '</div>';

  // Weight bar
  html += '<div style="height:10px;border-radius:6px;overflow:hidden;display:flex;gap:2px;margin-bottom:18px;">' +
    '<div style="width:' + weights.quiz + '%;background:#0ea5e9;border-radius:3px;" title="WW"></div>' +
    '<div style="width:' + weights.activity + '%;background:#10b981;border-radius:3px;" title="PT"></div>' +
    '<div style="width:' + weights.exam + '%;background:#e8000f;border-radius:3px;" title="Exam"></div>' +
    '</div></div>';

  // Editable rows: item labels + max scores
  ['quiz','activity','exam'].forEach(function(gid) {
    var meta  = GROUP_META[gid], items = getGroupItems(gid);
    html += '<div class="sm-settings-section">';
    html += '<div class="sm-settings-section-hdr" style="color:' + meta.color + ';display:flex!important;align-items:center!important;justify-content:space-between!important;">' +
      '<span>' + meta.label + '</span><span style="font-size:10px;font-weight:600;color:rgba(255,255,255,0.3);text-transform:none;letter-spacing:0;">' + wVals[gid] + '% (fixed)</span></div>';
    html += '<div class="sm-settings-rows" id="smRows_' + gid + '">';
    items.forEach(function(item, idx) { html += _ssRowHtml(gid, idx, item, meta); });
    html += '</div>';
    if (gid !== 'exam') {
      html += '<div style="padding:8px 16px 14px;"><button class="sm-add-comp-btn" style="border-color:' + meta.color + '44;color:' + meta.color + ';" onclick="addScoreComponent(\'' + gid + '\')">＋ Add ' + meta.defaultLabel + '</button></div>';
    }
    html += '</div>';
  });

  var bodyEl = g("scoreSettingsBody"); if (bodyEl) bodyEl.innerHTML = html;
}

function _ssRowHtml(gid, idx, item, meta) {
  if (!meta) meta = GROUP_META[gid];
  var items = getGroupItems(gid), canDel = (gid !== 'exam' && items.length > 1);
  return '<div class="sm-settings-row" id="smRow_' + gid + '_' + idx + '">' +
    '<div class="sm-settings-row-icon" style="color:' + meta.color + ';">✏️</div>' +
    '<div style="flex:1;"><input class="sm-comp-label-input" type="text" value="' + (item.label||'') + '" id="label_' + gid + '_' + idx + '" placeholder="' + meta.defaultLabel + ' ' + (idx+1) + '" style="border-color:' + meta.color + '33;" oninput="updateCompLabel(\'' + gid + '\',' + idx + ',this.value)"></div>' +
    '<div class="sm-settings-max-wrap"><span class="sm-settings-max-label">Max:</span><input class="sm-settings-max-input" type="number" min="1" max="9999" value="' + item.max + '" id="max_' + gid + '_' + idx + '" oninput="updateCompMax(\'' + gid + '\',' + idx + ',this.value)"></div>' +
    (canDel ? '<button class="sm-del-comp-btn" onclick="deleteScoreComponent(\'' + gid + '\',' + idx + ')" title="Delete">🗑️</button>' : '<div style="width:32px;"></div>') +
    '</div>';
}

function addScoreComponent(gid) {
  if (gid === 'exam')    { showToast('⚠️ Only one Quarterly Exam is allowed.', 'warning'); return; }
  if (gid === 'project') { showToast('⚠️ Projects are not used in this system.', 'warning'); return; }
  var meta = GROUP_META[gid], items = getGroupItems(gid);
  scoreGroups[gid].items.push({label:meta.defaultLabel + ' ' + (items.length+1), max:meta.defaultMax});
  saveScoreGroupSettings();
  var rowsEl = document.getElementById('smRows_' + gid);
  if (rowsEl) { var h = ''; getGroupItems(gid).forEach(function(it, i) { h += _ssRowHtml(gid, i, it, meta); }); rowsEl.innerHTML = h; }
  showToast('➕ ' + meta.defaultLabel + ' ' + (items.length+1) + ' added!', 'success');
}
function deleteScoreComponent(gid, idx) {
  if (gid === 'exam') { showToast('⚠️ Cannot delete the Quarterly Exam.', 'warning'); return; }
  var items = getGroupItems(gid);
  if (items.length <= 1) { showToast('⚠️ At least one ' + GROUP_META[gid].defaultLabel + ' is required.', 'warning'); return; }
  var deleted = scoreGroups[gid].items.splice(idx, 1);
  saveScoreGroupSettings();
  var rowsEl = document.getElementById('smRows_' + gid);
  if (rowsEl) { var h = ''; getGroupItems(gid).forEach(function(it, i) { h += _ssRowHtml(gid, i, it, GROUP_META[gid]); }); rowsEl.innerHTML = h; }
  showToast('🗑️ ' + (deleted[0] ? deleted[0].label : 'Component') + ' removed.', 'warning');
}
function updateCompLabel(gid, idx, val) { if (scoreGroups[gid] && scoreGroups[gid].items[idx]) scoreGroups[gid].items[idx].label = val; }
function updateCompMax(gid, idx, val)   { var n = parseInt(val); if (!isNaN(n) && n > 0 && scoreGroups[gid] && scoreGroups[gid].items[idx]) scoreGroups[gid].items[idx].max = n; }
function onWeightChange() { /* weights are fixed per DepEd Table 5 */ }

function saveScoreSettingsFromModal() {
  var groups = ['quiz','activity','exam'], errors = [];
  groups.forEach(function(gid) {
    getGroupItems(gid).forEach(function(item, idx) {
      var lblEl = document.getElementById('label_' + gid + '_' + idx);
      var maxEl = document.getElementById('max_' + gid + '_' + idx);
      if (lblEl && lblEl.value.trim()) item.label = lblEl.value.trim();
      if (maxEl) { var mx = parseInt(maxEl.value); if (isNaN(mx) || mx < 1) errors.push(gid + '_' + idx); else item.max = mx; }
    });
  });
  if (errors.length) { showToast('⚠️ Please enter valid max scores (min 1) for all fields.', 'warning'); return; }
  saveScoreGroupSettings(); closeScoreSettingsModal();
  if (typeof renderGradebook === 'function') renderGradebook(currentFolder, currentSection);
  showToast('⚙️ Score settings saved! Gradebook updated.', 'success');
}
function resetScoreSettings() {
  scoreGroups = JSON.parse(JSON.stringify(DEFAULT_SCORE_GROUPS));
  saveScoreGroupSettings(); renderScoreSettingsModal();
  showToast('🔄 Score settings reset to defaults.', 'warning');
}

/* ============================================================
   16. PROFILE MODAL
   ============================================================ */
function openProfileModal() {
  if (!currentUser) return;
  var isTeacher = (currentRole === "teacher");
  g("pmAvatar").textContent  = isTeacher ? "👩‍🏫" : "🎓";
  g("pmName").textContent    = currentUser.name || "—";
  g("pmRoleBadge").textContent  = isTeacher ? "Faculty" : "Student";
  g("pmEmailDisplay").textContent = (currentUser.email || currentUser.emailUser) + "@asiasourceicollege.edu.ph";

  var fields = {
    pmInfoStudentId: currentUser.studentId || (isTeacher ? "N/A" : "—"),
    pmInfoGender:    currentUser.gender  || "—",
    pmInfoName:      currentUser.name    || "—",
    pmInfoBday:      currentUser.bday    || "—",
    pmInfoEmail:     (currentUser.email || currentUser.emailUser) + "@asiasourceicollege.edu.ph",
    pmInfoMobile:    currentUser.mobile  || "—",
    pmInfoAge:       computeAge(currentUser.bday),
    pmInfoAddress:   currentUser.address || "—",
    pmInfoCity:      currentUser.city    || "—"
  };
  for (var fid in fields) { if (g(fid)) g(fid).textContent = fields[fid]; }

  var strandItem = g("pmStrandItem");
  if (isTeacher) { if (strandItem) strandItem.style.display = "none"; }
  else { if (strandItem) strandItem.style.display = ""; if (g("pmInfoStrand")) g("pmInfoStrand").textContent = DB.strandFull[currentUser.strand] || currentUser.strand || "—"; }

  if (g("pmEditName"))    g("pmEditName").value    = currentUser.name    || "";
  if (g("pmEditGender"))  g("pmEditGender").value  = currentUser.gender  || "";
  if (g("pmEditMobile"))  g("pmEditMobile").value  = currentUser.mobile  || "";
  if (g("pmEditAddress")) g("pmEditAddress").value = currentUser.address || "";
  if (g("pmEditCity"))    g("pmEditCity").value    = currentUser.city    || "";
  var strandFg = g("pmEditStrandFg");
  if (isTeacher) { if (strandFg) strandFg.style.display = "none"; }
  else { if (strandFg) strandFg.style.display = ""; if (g("pmEditStrand")) g("pmEditStrand").value = currentUser.strand || ""; }

  hideAlert("pmInfoAlert"); hideAlert("pmInfoSuccess"); hideAlert("pmPassAlert"); hideAlert("pmPassSuccess");
  g("pmCurrPass").value = ""; g("pmNewPass").value = ""; g("pmConfPass").value = "";

  if (!isTeacher && currentUser) {
    var photoData   = loadStudentPhoto(currentUser.id);
    var preview     = g("pmPhotoPreviewImg"), placeholder = g("pmPhotoPlaceholder");
    if (photoData) { if (preview) { preview.src = photoData; preview.classList.remove("hidden"); } if (placeholder) placeholder.style.display = "none"; }
    else           { if (preview) { preview.src = ""; preview.classList.add("hidden"); } if (placeholder) placeholder.style.display = ""; }
    applyStudentPhoto(currentUser.id, photoData);
  }
  var photoTab = g("pmTabPhoto"); if (photoTab) photoTab.style.display = isTeacher ? "none" : "";
  switchPmTab("info", g("pmTabInfo"));
  g("profileModal").classList.remove("hidden"); document.body.style.overflow = "hidden";
}
function closeProfileModal() { g("profileModal").classList.add("hidden"); document.body.style.overflow = ""; }
function switchPmTab(tab, btn) {
  document.querySelectorAll(".pm-tab").forEach(function(t) { t.className = "pm-tab"; });
  btn.className = "pm-tab active";
  ["pmPanelInfo","pmPanelPass","pmPanelPhoto"].forEach(function(id) { var p = g(id); if (p) p.className = "pm-panel hidden"; });
  var panelMap = {info:"pmPanelInfo", password:"pmPanelPass", photo:"pmPanelPhoto"};
  var panelEl  = g(panelMap[tab]); if (panelEl) panelEl.className = "pm-panel";
}
function saveProfileInfo() {
  hideAlert("pmInfoAlert"); hideAlert("pmInfoSuccess");
  var newName    = g("pmEditName").value.trim();
  var newAddr    = g("pmEditAddress").value.trim();
  var newGender  = g("pmEditGender")  ? g("pmEditGender").value  : "";
  var newMobile  = g("pmEditMobile")  ? g("pmEditMobile").value.trim()  : "";
  var newCity    = g("pmEditCity")    ? g("pmEditCity").value.trim()    : "";
  if (!newName) { showAlert("pmInfoAlert","Please enter your full name."); return; }
  var isTeacher = (currentRole === "teacher"), list = isTeacher ? DB.teachers : DB.students;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === currentUser.id) {
      list[i].name = newName; list[i].address = newAddr; list[i].gender = newGender;
      list[i].mobile = newMobile; list[i].city = newCity;
      if (!isTeacher) { var ns = g("pmEditStrand").value; if (ns) list[i].strand = ns; }
      currentUser = list[i]; break;
    }
  }
  saveDB();
  if (g("pmName"))        g("pmName").textContent        = currentUser.name;
  if (g("pmInfoName"))    g("pmInfoName").textContent    = currentUser.name;
  if (g("pmInfoGender"))  g("pmInfoGender").textContent  = currentUser.gender  || "—";
  if (g("pmInfoMobile"))  g("pmInfoMobile").textContent  = currentUser.mobile  || "—";
  if (g("pmInfoAddress")) g("pmInfoAddress").textContent = currentUser.address || "—";
  if (g("pmInfoCity"))    g("pmInfoCity").textContent    = currentUser.city    || "—";
  if (!isTeacher && g("pmInfoStrand")) g("pmInfoStrand").textContent = DB.strandFull[currentUser.strand] || currentUser.strand || "—";
  if (isTeacher) {
    if (g("tchProfileName")) g("tchProfileName").textContent = currentUser.name;
    if (g("tchName"))        g("tchName").textContent        = currentUser.name;
  } else {
    if (g("stuProfileName")) g("stuProfileName").textContent = currentUser.name;
    if (g("stuName"))        g("stuName").textContent        = currentUser.name;
    loadStudentDash(currentUser);
  }
  showAlert("pmInfoSuccess","✅ Profile saved successfully!","success");
  showToast("✅ Profile updated!", "success");
}
function saveNewPassword() {
  hideAlert("pmPassAlert"); hideAlert("pmPassSuccess");
  var curr = g("pmCurrPass").value.trim(), nw = g("pmNewPass").value.trim(), conf = g("pmConfPass").value.trim();
  if (!curr || !nw || !conf) { showAlert("pmPassAlert","Please fill in all password fields."); return; }
  if (curr !== currentUser.pass)  { showAlert("pmPassAlert","❌ Current password is incorrect."); return; }
  if (nw.length < 4)              { showAlert("pmPassAlert","New password must be at least 4 characters."); return; }
  if (nw !== conf)                { showAlert("pmPassAlert","❌ New passwords do not match."); return; }
  var isTeacher = (currentRole === "teacher"), list = isTeacher ? DB.teachers : DB.students;
  for (var i = 0; i < list.length; i++) { if (list[i].id === currentUser.id) { list[i].pass = nw; currentUser = list[i]; break; } }
  saveDB(); g("pmCurrPass").value = ""; g("pmNewPass").value = ""; g("pmConfPass").value = "";
  showAlert("pmPassSuccess","✅ Password changed! Use your new password next login.","success");
  showToast("🔐 Password reset successful!", "success");
}

/* ============================================================
   17. REAL-TIME CROSS-TAB SYNC
   ============================================================ */
var _stuPollInterval = null, _stuLastInviteSnapshot = null;

function _getInviteSnapshot(studentId) {
  return JSON.stringify(loadInvites().filter(function(inv) { return inv.studentId === studentId; }).map(function(inv) { return {id:inv.id,status:inv.status,subjectName:inv.subjectName}; }));
}
function _checkAndRefreshStudentDash() {
  if (!currentUser || currentRole !== 'student') return;
  var freshDB = loadDB(); if (freshDB && Array.isArray(freshDB.students)) { DB.students = freshDB.students; DB.teachers = freshDB.teachers; }
  var newSnapshot = _getInviteSnapshot(currentUser.id);
  if (_stuLastInviteSnapshot === null) { _stuLastInviteSnapshot = newSnapshot; return; }
  if (newSnapshot === _stuLastInviteSnapshot) return;
  var oldData = [], newData = [];
  try { oldData = JSON.parse(_stuLastInviteSnapshot); } catch(e) {}
  try { newData = JSON.parse(newSnapshot); } catch(e) {}
  _stuLastInviteSnapshot = newSnapshot;
  var newlyApproved = [], newlyRejected = [];
  newData.forEach(function(inv) {
    var old = null; for (var i = 0; i < oldData.length; i++) { if (oldData[i].id === inv.id) { old = oldData[i]; break; } }
    if (!old) return;
    if (old.status !== 'approved' && inv.status === 'approved') newlyApproved.push(inv.subjectName);
    if (old.status !== 'rejected' && inv.status === 'rejected') newlyRejected.push(inv.subjectName);
  });
  for (var i = 0; i < DB.students.length; i++) { if (DB.students[i].id === currentUser.id) { currentUser = DB.students[i]; break; } }
  loadStudentDash(currentUser);
  newlyApproved.forEach(function(subj) { showToast('✅ "' + subj + '" approved! It now appears in your subjects.', 'success'); });
  newlyRejected.forEach(function(subj) { showToast('✕ "' + subj + '" enrollment request was declined.', 'warning'); });
}
function startStudentPolling() {
  stopStudentPolling(); if (!currentUser || currentRole !== 'student') return;
  _stuLastInviteSnapshot = _getInviteSnapshot(currentUser.id);
  _stuPollInterval = setInterval(_checkAndRefreshStudentDash, 3000);
}
function stopStudentPolling() { if (_stuPollInterval) { clearInterval(_stuPollInterval); _stuPollInterval = null; } _stuLastInviteSnapshot = null; }

window.addEventListener('storage', function(e) {
  if (!currentUser) return;
  if (e.key === LS_INVITES && currentRole === 'student') _checkAndRefreshStudentDash();
  if (e.key === LS_KEY) {
    var freshDB = loadDB();
    if (freshDB && Array.isArray(freshDB.students)) {
      DB.students = freshDB.students; DB.teachers = freshDB.teachers;
      if (currentRole === 'student') {
        for (var i = 0; i < DB.students.length; i++) { if (DB.students[i].id === currentUser.id) { currentUser = DB.students[i]; break; } }
        loadStudentDash(currentUser);
      }
    }
  }
});

document.addEventListener("click", function(e) {
  var notifPanel = g("teacherNotifPanel");
  if (notifPanel && !notifPanel.classList.contains("hidden")) {
    var notifWrap = notifPanel.closest(".notif-wrap");
    if (notifWrap && !notifWrap.contains(e.target)) notifPanel.classList.add("hidden");
  }
});
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeSubjectModal(); closeProfileModal(); closeTcModal();
    closeAddSubjectModal(); closeAddStudentModal(); closeScoreSettingsModal(); closeTchSubjectMgr();
    var np = g("teacherNotifPanel"); if (np && !np.classList.contains("hidden")) np.classList.add("hidden");
  }
});

/* ============================================================
   18. INIT
   ============================================================ */
(function init() {
  setRole("student"); setSuRole("student");

  // Particles
  var container = document.getElementById("particles");
  if (container) {
    var colors = ["#ffb800","#e8000f","#ff6090","#ffffff"];
    for (var i = 0; i < 40; i++) {
      var p = document.createElement("div"); p.className = "particle";
      p.style.cssText = [
        "left:" + (Math.random()*100) + "%",
        "width:" + (Math.random()*3+1) + "px",
        "height:" + (Math.random()*3+1) + "px",
        "background:" + colors[Math.floor(Math.random()*colors.length)],
        "animation-duration:" + (Math.random()*15+8) + "s",
        "animation-delay:" + (Math.random()*15) + "s",
        "opacity:0"
      ].join(";");
      container.appendChild(p);
    }
  }

  // Card tilt
  document.addEventListener("mousemove", function(e) {
    var card = document.querySelector(".lp-card"); if (!card) return;
    var rect = card.getBoundingClientRect(); if (rect.width === 0) return;
    var cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    var dx = (e.clientX - cx) / rect.width, dy = (e.clientY - cy) / rect.height;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 1.5) { card.style.transform = "rotateY(" + (dx*7) + "deg) rotateX(" + (-dy*4) + "deg) translateZ(8px)"; card.style.transition = "transform 0.1s ease"; }
    else            { card.style.transform = ""; card.style.transition = "transform 0.5s ease"; }
  });

  // Motto animation
  var mottoWrap = document.querySelector(".lp-motto-wrap");
  if (mottoWrap) {
    mottoWrap.style.opacity = "0"; mottoWrap.style.transform = "translateY(20px)";
    setTimeout(function() { mottoWrap.style.transition = "opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)"; mottoWrap.style.opacity = "1"; mottoWrap.style.transform = "translateY(0)"; }, 400);
  }

  // Bottom deco
  var bottomDeco = document.querySelector(".lp-bottom-deco");
  if (bottomDeco) { bottomDeco.style.opacity = "0"; setTimeout(function() { bottomDeco.style.transition = "opacity 1s ease"; bottomDeco.style.opacity = "1"; }, 900); }

  // Login background canvas
  (function initLoginCanvas() {
    var canvas = document.getElementById("loginBgCanvas"); if (!canvas) return;
    var ctx = canvas.getContext("2d"), W, H, nodes = [], mouse = {x:-999, y:-999};
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    resize(); window.addEventListener("resize", function() { resize(); spawnNodes(); });
    canvas.parentElement.addEventListener("mousemove", function(e) { var rect = canvas.getBoundingClientRect(); mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; });
    function spawnNodes() {
      nodes = []; var count = Math.max(30, Math.floor(W * H / 11000));
      for (var i = 0; i < count; i++) nodes.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.8+.6,baseOpacity:Math.random()*.5+.25,pulse:Math.random()*Math.PI*2});
    }
    spawnNodes();
    function draw() {
      ctx.clearRect(0, 0, W, H);
      var bg = ctx.createLinearGradient(0,0,W,H); bg.addColorStop(0,"#080210"); bg.addColorStop(.5,"#0d0115"); bg.addColorStop(1,"#050008"); ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
      nodes.forEach(function(n) {
        n.x += n.vx; n.y += n.vy; n.pulse += .02;
        if (n.x < 0 || n.x > W) n.vx *= -1; if (n.y < 0 || n.y > H) n.vy *= -1;
        var mx = mouse.x - n.x, my = mouse.y - n.y, md = Math.sqrt(mx*mx + my*my);
        if (md < 120 && md > 0) { n.x += mx/md*.3; n.y += my/md*.3; }
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = "rgba(232,0,15," + (n.baseOpacity*(.7+.3*Math.sin(n.pulse))) + ")"; ctx.fill();
      });
      var maxDist = 140;
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i+1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y, dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < maxDist) {
            var alpha = (1 - dist/maxDist) * .22;
            var nmx = (nodes[i].x + nodes[j].x)/2 - mouse.x, nmy = (nodes[i].y + nodes[j].y)/2 - mouse.y;
            var nearMouse = Math.sqrt(nmx*nmx + nmy*nmy) < 100;
            ctx.strokeStyle = nearMouse ? "rgba(255,184,0," + (alpha*1.8) + ")" : "rgba(200,0,20," + alpha + ")";
            ctx.lineWidth   = nearMouse ? 1.2 : .7;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  console.log("✅ Asia Source iCollege — Portal Script loaded (DepEd-aligned: WW / PT / Quarterly Exam)");
})();

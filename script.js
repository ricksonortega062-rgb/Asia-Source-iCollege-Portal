/* ============================================================
   Asia Source iCollege — script.js  (FIXED v6)
   DepEd SHS Grading: WW · PT · QA (Table 5 Weights)
   Fixes: VSCode errors, customizable score counts,
          brand click = home, corrected computation
   ============================================================ */

"use strict";

var LS_KEY    = "asiasource_db_v5";
var LS_GRADES = "asiasource_grades_v5";
var LS_NOTIFS = "asiasource_notifs_v5";
var LS_INVITES= "asiasource_invites_v5";

/* ── DB / STORAGE ── */
function loadDB() {
  try {
    var r = localStorage.getItem(LS_KEY);
    if (r) {
      var p = JSON.parse(r);
      if (p && Array.isArray(p.students) && Array.isArray(p.teachers)) return p;
    }
  } catch(e) {}
  return null;
}
function saveDB()     { try { localStorage.setItem(LS_KEY, JSON.stringify(DB)); } catch(e) {} }
function saveGrades() {
  try {
    localStorage.setItem(LS_GRADES, JSON.stringify({
      scoreStore: scoreStore,
      crStore:    crStore,
      attStore:   attStore,
      rosterGrades: rosterGrades,
      subjectConfig: subjectConfig
    }));
  } catch(e) {}
}
function loadGrades() {
  try {
    var r = localStorage.getItem(LS_GRADES);
    if (r) {
      var d = JSON.parse(r);
      scoreStore    = d.scoreStore    || {};
      crStore       = d.crStore       || {};
      attStore      = d.attStore      || {};
      rosterGrades  = d.rosterGrades  || {};
      subjectConfig = d.subjectConfig || {};
    }
  } catch(e) {}
}
function loadNotifs()   { try { var r=localStorage.getItem(LS_NOTIFS);  return r?JSON.parse(r):{};  } catch(e){return{};} }
function saveNotifs(n)  { try { localStorage.setItem(LS_NOTIFS,JSON.stringify(n)); } catch(e) {} }
function loadInvites()  { try { var r=localStorage.getItem(LS_INVITES); return r?JSON.parse(r):[];  } catch(e){return[];} }
function saveInvites(inv){ try { localStorage.setItem(LS_INVITES,JSON.stringify(inv)); } catch(e) {} }

/* ══════════════════════════════════════════════════════════════
   SUBJECT CONFIG — customizable score count per subject/class/qtr
   Structure: subjectConfig[classKey][subj][qtr] = { wwCount, ptCount, qaTotal, quizCount, actCount }
   ══════════════════════════════════════════════════════════════ */
var subjectConfig = {};

function getSubjectConfig(classKey, subj, qtr) {
  if (!subjectConfig[classKey])          subjectConfig[classKey]          = {};
  if (!subjectConfig[classKey][subj])    subjectConfig[classKey][subj]    = {};
  if (!subjectConfig[classKey][subj][qtr]) {
    subjectConfig[classKey][subj][qtr] = {
      wwCount:   5,   /* Written Work items */
      ptCount:   5,   /* Performance Task items */
      qaTotal:   100, /* Quarterly Assessment total */
      quizCount: 5,   /* Extra: Quizzes (counted inside WW) */
      actCount:  5    /* Extra: Activities (counted inside PT) */
    };
  }
  return subjectConfig[classKey][subj][qtr];
}
function setSubjectConfig(classKey, subj, qtr, field, val) {
  var cfg = getSubjectConfig(classKey, subj, qtr);
  cfg[field] = parseInt(val, 10) || cfg[field];
  saveGrades();
}

/* ══════════════════════════════════════════════════════════════
   DepEd GRADING SYSTEM — TABLE 5 (SHS)
   ══════════════════════════════════════════════════════════════ */
var DEPED_WEIGHTS = {
  core:        { ww: 0.25, pt: 0.50, qa: 0.25 },
  applied:     { ww: 0.25, pt: 0.45, qa: 0.30 },
  special:     { ww: 0.35, pt: 0.40, qa: 0.25 },
  tvl:         { ww: 0.20, pt: 0.60, qa: 0.20 },
  tvl_special: { ww: 0.20, pt: 0.60, qa: 0.20 }
};

var SUBJECT_TYPE_MAP = {
  "Filipino":                   "core",
  "English":                    "core",
  "Mathematics":                "core",
  "Science":                    "core",
  "Araling Panlipunan":         "core",
  "EsP":                        "core",
  "MAPEH":                      "core",
  "Media and Information Literacy": "core",
  "Introduction to the Philosophy of the Human Person": "core",
  "Contemporary Philippine Arts from the Regions": "core",
  "Physical Education and Health 3": "core",
  "Physical Education and Health 4": "core",
  "Earth and Life Science":     "core",
  "Physical Science":           "core",
  "Basic Calculus":             "core",
  "Pre-Calculus":               "core",
  "Biology 1":                  "core",
  "Biology 2":                  "core",
  "General Chemistry 1":        "core",
  "General Chemistry 2":        "core",
  "General Physics 1":          "core",
  "General Physics 2":          "core",
  "TLE / TVE":                  "applied",
  "Practical Research 2":       "applied",
  "Enhancement Program 3 - English Proficiency 1": "applied",
  "Enhancement Program 4 - Personality Development": "applied",
  "Empowerment Technologies (Tech-Voc)": "applied",
  "Entrepreneurship":           "applied",
  "Applied Economics":          "applied",
  "Business Ethics and Social Responsibility": "applied",
  "Business Finance":           "applied",
  "Business Math":              "applied",
  "Fundamentals of Accountancy, Bus. and Mgt 1": "applied",
  "Fundamentals of Accountancy, Bus. and Mgt 2": "applied",
  "Organization and Management": "applied",
  "Principles of Marketing":    "applied",
  "Community Engagement, Solidarity and Citizenship": "applied",
  "Creative Nonfiction":        "applied",
  "Creative Writing":           "applied",
  "Culminating Activity":       "applied",
  "Disciplines and Ideas in the Applied Social Sciences": "applied",
  "Disciplines and Ideas in the Social Sciences": "applied",
  "Introduction to World Religions and Belief System": "applied",
  "Malikhaing Pagsulat":        "applied",
  "Philippine Politics and Governance": "applied",
  "Trend, Networks, and Critical Thinking in the 21st Century": "applied",
  "Inquiries, Investigation and Immersion": "special",
  "Work Immersion":             "special",
  "NET Programming 1":          "tvl",
  "NET Programming 2":          "tvl"
};

function getSubjectType(subjectName) {
  if (!subjectName) return "core";
  var mapped = SUBJECT_TYPE_MAP[subjectName];
  if (mapped) return mapped;
  var lower = subjectName.toLowerCase();
  if (lower.indexOf("work immersion") >= 0 || lower.indexOf("exhibit") >= 0 ||
      lower.indexOf("immersion") >= 0) return "special";
  if (lower.indexOf("programming") >= 0 || lower.indexOf("ict") >= 0 ||
      lower.indexOf("technology") >= 0) return "tvl";
  return "applied";
}

function getWeights(subjectName) {
  return DEPED_WEIGHTS[getSubjectType(subjectName)] || DEPED_WEIGHTS.core;
}

/* ── DepEd TRANSMUTATION TABLE ── */
var TRANSMUTATION_TABLE = [
  { from: 100,   to: 100,   result: 100 },
  { from: 98.40, to: 99.99, result: 99  },
  { from: 96.80, to: 98.39, result: 98  },
  { from: 95.20, to: 96.79, result: 97  },
  { from: 93.60, to: 95.19, result: 96  },
  { from: 92.00, to: 93.59, result: 95  },
  { from: 90.40, to: 91.99, result: 94  },
  { from: 88.80, to: 90.39, result: 93  },
  { from: 87.20, to: 88.79, result: 92  },
  { from: 85.60, to: 87.19, result: 91  },
  { from: 84.00, to: 85.59, result: 90  },
  { from: 82.40, to: 83.99, result: 89  },
  { from: 80.80, to: 82.39, result: 88  },
  { from: 79.20, to: 80.79, result: 87  },
  { from: 77.60, to: 79.19, result: 86  },
  { from: 76.00, to: 77.59, result: 85  },
  { from: 74.40, to: 75.99, result: 84  },
  { from: 72.80, to: 74.39, result: 83  },
  { from: 71.20, to: 72.79, result: 82  },
  { from: 69.60, to: 71.19, result: 81  },
  { from: 68.00, to: 69.59, result: 80  },
  { from: 66.40, to: 67.99, result: 79  },
  { from: 64.80, to: 66.39, result: 78  },
  { from: 63.20, to: 64.79, result: 77  },
  { from: 61.60, to: 63.19, result: 76  },
  { from: 60.00, to: 61.59, result: 75  },
  { from: 56.00, to: 59.99, result: 74  },
  { from: 52.00, to: 55.99, result: 73  },
  { from: 48.00, to: 51.99, result: 72  },
  { from: 44.00, to: 47.99, result: 71  },
  { from: 40.00, to: 43.99, result: 70  },
  { from: 36.00, to: 39.99, result: 69  },
  { from: 32.00, to: 35.99, result: 68  },
  { from: 28.00, to: 31.99, result: 67  },
  { from: 24.00, to: 27.99, result: 66  },
  { from: 20.00, to: 23.99, result: 65  },
  { from: 16.00, to: 19.99, result: 64  },
  { from: 12.00, to: 15.99, result: 63  },
  { from: 8.00,  to: 11.99, result: 62  },
  { from: 4.00,  to: 7.99,  result: 61  },
  { from: 0,     to: 3.99,  result: 60  }
];

function transmute(initialGrade) {
  if (initialGrade === null || initialGrade === undefined || isNaN(initialGrade)) return null;
  var g = Number(initialGrade);
  if (g >= 100) return 100;
  if (g < 0)    return 60;
  for (var i = 0; i < TRANSMUTATION_TABLE.length; i++) {
    var row = TRANSMUTATION_TABLE[i];
    if (g >= row.from && g <= row.to) return row.result;
  }
  return 60;
}

/* ── CORRECT DepEd Quarter Grade Computation ──
   Step 1: For each component, compute Percentage Score = (Sum of Scores / Highest Possible Score) × 100
   Step 2: Weighted Score = Percentage Score × Weight
   Step 3: Initial Grade = Sum of Weighted Scores (already normalized since weights sum to 1)
   Step 4: Transmute using DepEd Table
   NOTE: weights apply to all available components, not renormalized to just present ones
         (per DepEd Order No. 8 s. 2015 — all three must be present for a complete grade)
*/
function computeDepEdGrade(wwScores, ptScores, qaScore, subjectName, wwTotal, ptTotal, qaTotal) {
  wwTotal = Number(wwTotal) || 50;
  ptTotal = Number(ptTotal) || 50;
  qaTotal = Number(qaTotal) || 100;

  var weights = getWeights(subjectName);

  function validNums(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(function(v) {
      return v !== "" && v !== null && v !== undefined && !isNaN(Number(v));
    }).map(Number);
  }

  var wwVals = validNums(wwScores);
  var ptVals = validNums(ptScores);
  var hasQA  = (qaScore !== "" && qaScore !== null && qaScore !== undefined && !isNaN(Number(qaScore)));

  if (!wwVals.length && !ptVals.length && !hasQA) return null;

  /* Percentage Score per component = (Sum / Highest Possible) × 100 */
  var wwPS = null, ptPS = null, qaPS = null;

  if (wwVals.length > 0) {
    var wwSum     = wwVals.reduce(function(a, b) { return a + b; }, 0);
    var wwHighest = wwTotal * wwVals.length; /* highest per item × number of items */
    wwPS = (wwHighest > 0) ? (wwSum / wwHighest) * 100 : 0;
  }

  if (ptVals.length > 0) {
    var ptSum     = ptVals.reduce(function(a, b) { return a + b; }, 0);
    var ptHighest = ptTotal * ptVals.length;
    ptPS = (ptHighest > 0) ? (ptSum / ptHighest) * 100 : 0;
  }

  if (hasQA) {
    qaPS = (qaTotal > 0) ? (Number(qaScore) / qaTotal) * 100 : 0;
  }

  /* Initial Grade = weighted sum using only available components,
     but redistribute weights proportionally to present components */
  var totalWeight = 0;
  var weightedSum = 0;

  if (wwPS !== null) { weightedSum += wwPS * weights.ww; totalWeight += weights.ww; }
  if (ptPS !== null) { weightedSum += ptPS * weights.pt; totalWeight += weights.pt; }
  if (qaPS !== null) { weightedSum += qaPS * weights.qa; totalWeight += weights.qa; }

  if (totalWeight === 0) return null;

  /* Normalize: if not all components present, scale to 100 */
  var initialGrade = weightedSum / totalWeight;

  return transmute(initialGrade);
}

/* ── Score store helpers ── */
function getDepEdScores(sk, subj, qtr) {
  if (!scoreStore[sk] || !scoreStore[sk][subj] || !scoreStore[sk][subj][qtr]) {
    return { ww: [], pt: [], qa: "", ww_total: 50, pt_total: 50, qa_total: 100 };
  }
  var qd = scoreStore[sk][subj][qtr];
  return {
    ww:       qd.ww       || [],
    pt:       qd.pt       || [],
    qa:       (qd.qa !== undefined) ? qd.qa : "",
    ww_total: qd.ww_total || 50,
    pt_total: qd.pt_total || 50,
    qa_total: qd.qa_total || 100
  };
}

function setDepEdScore(sk, subj, qtr, field, idx, val) {
  if (!scoreStore[sk])            scoreStore[sk]            = {};
  if (!scoreStore[sk][subj])      scoreStore[sk][subj]      = {};
  if (!scoreStore[sk][subj][qtr]) scoreStore[sk][subj][qtr] = { ww: [], pt: [], qa: "", ww_total: 50, pt_total: 50, qa_total: 100 };
  var qd = scoreStore[sk][subj][qtr];
  if (field === "qa") {
    qd.qa = val;
  } else if (field === "ww_total") {
    qd.ww_total = Number(val);
  } else if (field === "pt_total") {
    qd.pt_total = Number(val);
  } else if (field === "qa_total") {
    qd.qa_total = Number(val);
  } else if (field === "ww") {
    if (!Array.isArray(qd.ww)) qd.ww = [];
    qd.ww[idx] = val;
  } else if (field === "pt") {
    if (!Array.isArray(qd.pt)) qd.pt = [];
    qd.pt[idx] = val;
  }
}

/* ── ICT-12 SUBJECTS ── */
var ICT12_SEM1_SUBJECTS = [
  {code:"ENG5",  name:"Practical Research 2",                               sem:1},
  {code:"EP2",   name:"Enhancement Program 3 - English Proficiency 1",       sem:1},
  {code:"PROG3", name:"NET Programming 1",                                   sem:1},
  {code:"IT1",   name:"Media and Information Literacy",                       sem:1},
  {code:"PE3",   name:"Physical Education and Health 3",                     sem:1},
  {code:"SCH",   name:"Earth and Life Science",                              sem:1},
  {code:"SS4",   name:"Introduction to the Philosophy of the Human Person",  sem:1},
  {code:"SS5",   name:"Contemporary Philippine Arts from the Regions",       sem:1}
];
var ICT12_SEM2_SUBJECTS = [
  {code:"SC12",  name:"Physical Science",                             sem:2},
  {code:"IT2",   name:"Empowerment Technologies (Tech-Voc)",          sem:2},
  {code:"BUS2",  name:"Entrepreneurship",                             sem:2},
  {code:"CP1",   name:"Inquiries, Investigation and Immersion",       sem:2},
  {code:"CP2",   name:"Work Immersion",                               sem:2},
  {code:"PROG4", name:"NET Programming 2",                            sem:2},
  {code:"PE4",   name:"Physical Education and Health 4",              sem:2},
  {code:"PDEV",  name:"Enhancement Program 4 - Personality Development",sem:2}
];
var ICT12_ALL_SUBJECTS  = ICT12_SEM1_SUBJECTS.concat(ICT12_SEM2_SUBJECTS);
var ICT12_SUBJECT_NAMES = ICT12_ALL_SUBJECTS.map(function(s) { return s.name; });
var ICT12_COLORS = [
  "#e8000f","#0ea5e9","#f59e0b","#10b981","#8b5cf6","#06b6d4","#f97316","#ec4899",
  "#14b8a6","#6366f1","#84cc16","#a855f7","#ef4444","#3b82f6","#eab308","#22c55e"
];
var ICT12_SUBJECTS_OBJ = ICT12_ALL_SUBJECTS.map(function(s) {
  return { name: s.name, icon: s.code, teacher: "ICT Faculty", sem: s.sem };
});

/* ── STRAND SUBJECTS ── */
var ABM_SUBJECTS = [
  {name:"Applied Economics",                             icon:"AE",   teacher:"ABM Faculty", sem:1},
  {name:"Business Ethics and Social Responsibility",     icon:"BESR", teacher:"ABM Faculty", sem:1},
  {name:"Business Finance",                              icon:"BF",   teacher:"ABM Faculty", sem:1},
  {name:"Business Math",                                 icon:"BM",   teacher:"ABM Faculty", sem:1},
  {name:"Fundamentals of Accountancy, Bus. and Mgt 1",   icon:"FAB1", teacher:"ABM Faculty", sem:1},
  {name:"Fundamentals of Accountancy, Bus. and Mgt 2",   icon:"FAB2", teacher:"ABM Faculty", sem:2},
  {name:"Organization and Management",                   icon:"OM",   teacher:"ABM Faculty", sem:2},
  {name:"Principles of Marketing",                       icon:"PM",   teacher:"ABM Faculty", sem:2}
];
var HUMSS_SUBJECTS = [
  {name:"Community Engagement, Solidarity and Citizenship", icon:"CES",   teacher:"HUMSS Faculty", sem:1},
  {name:"Creative Nonfiction",                              icon:"CNF",   teacher:"HUMSS Faculty", sem:1},
  {name:"Creative Writing",                                 icon:"CW",    teacher:"HUMSS Faculty", sem:1},
  {name:"Culminating Activity",                             icon:"CA",    teacher:"HUMSS Faculty", sem:2},
  {name:"Disciplines and Ideas in the Applied Social Sciences", icon:"DIASS", teacher:"HUMSS Faculty", sem:1},
  {name:"Disciplines and Ideas in the Social Sciences",     icon:"DISS",  teacher:"HUMSS Faculty", sem:2},
  {name:"Introduction to World Religions and Belief System",icon:"IWRBS", teacher:"HUMSS Faculty", sem:2},
  {name:"Malikhaing Pagsulat",                              icon:"MP",    teacher:"HUMSS Faculty", sem:2},
  {name:"Philippine Politics and Governance",               icon:"PPG",   teacher:"HUMSS Faculty", sem:2},
  {name:"Trend, Networks, and Critical Thinking in the 21st Century", icon:"TNC", teacher:"HUMSS Faculty", sem:2}
];
var STEM_SUBJECTS = [
  {name:"Basic Calculus",       icon:"BC",   teacher:"STEM Faculty", sem:1},
  {name:"Biology 1",            icon:"BIO1", teacher:"STEM Faculty", sem:1},
  {name:"Biology 2",            icon:"BIO2", teacher:"STEM Faculty", sem:2},
  {name:"General Chemistry 1",  icon:"GC1",  teacher:"STEM Faculty", sem:1},
  {name:"General Chemistry 2",  icon:"GC2",  teacher:"STEM Faculty", sem:2},
  {name:"General Physics 1",    icon:"GP1",  teacher:"STEM Faculty", sem:1},
  {name:"General Physics 2",    icon:"GP2",  teacher:"STEM Faculty", sem:2},
  {name:"Pre-Calculus",         icon:"PC",   teacher:"STEM Faculty", sem:1}
];

var ABM_COLORS   = ["#f59e0b","#f97316","#ef4444","#e8000f","#b45309","#92400e","#78350f","#fbbf24"];
var HUMSS_COLORS = ["#8b5cf6","#a855f7","#ec4899","#6366f1","#7c3aed","#db2777","#9333ea","#4f46e5","#be185d","#7e22ce"];
var STEM_COLORS  = ["#0ea5e9","#06b6d4","#10b981","#22c55e","#14b8a6","#38bdf8","#34d399","#84cc16"];

var ABM_SUBJECT_NAMES   = ABM_SUBJECTS.map(function(s)   { return s.name; });
var HUMSS_SUBJECT_NAMES = HUMSS_SUBJECTS.map(function(s) { return s.name; });
var STEM_SUBJECT_NAMES  = STEM_SUBJECTS.map(function(s)  { return s.name; });

function getSubjectsByStrand(strand) {
  if (!strand) return { subjects: DEFAULT_DB ? DEFAULT_DB.subjects : [], colors: DEFAULT_DB ? DEFAULT_DB.crColors : [] };
  var s = strand.toUpperCase();
  if (s === "ABM")   return { subjects: ABM_SUBJECTS,   colors: ABM_COLORS   };
  if (s === "HUMSS") return { subjects: HUMSS_SUBJECTS, colors: HUMSS_COLORS };
  if (s === "STEM")  return { subjects: STEM_SUBJECTS,  colors: STEM_COLORS  };
  return { subjects: DB ? DB.subjects : [], colors: DB ? DB.crColors : [] };
}
function getSubjectNamesByStrand(strand) {
  return getSubjectsByStrand(strand).subjects.map(function(s) { return s.name; });
}

/* ── DEFAULT DATABASE ── */
var DEFAULT_DB = {
  students:[{
    id:"STU-001", emailUser:"juan.delacruz", pass:"2008-03-15",
    name:"Juan dela Cruz", email:"juan.delacruz", strand:"G11-STEM-A", bday:"2008-03-15",
    gender:"Male", studentId:"24-0561", mobile:"09XX-XXX-XXXX", address:"", city:"",
    grades:{
      "Basic Calculus":      {q1:85,q2:86,q3:88,q4:87},
      "Biology 1":           {q1:90,q2:92,q3:91,q4:93},
      "General Chemistry 1": {q1:82,q2:84,q3:86,q4:85},
      "General Physics 1":   {q1:88,q2:87,q3:89,q4:90},
      "Pre-Calculus":        {q1:83,q2:85,q3:84,q4:86}
    },
    scores:{ww:25,pt:24,qe:36,act:18},
    approvedSubjects:["Basic Calculus","Biology 1","General Chemistry 1","General Physics 1","Pre-Calculus"]
  }],
  teachers:[{
    id:"TCH-001", emailUser:"ana.santos", pass:"1985-06-12",
    name:"Ms. Ana Santos", email:"ana.santos", bday:"1985-06-12", address:""
  }],
  classRoster:{
    "HUMSS-A":{male:["Jose Santos","Pedro Cruz","Carlos Dela Rosa","Rico Villanueva","Mark Ramos"],female:["Maria Reyes","Ana Gomez","Liza Bautista","Jenny Manalo","Donna Ilagan"]},
    "HUMSS-B":{male:["Luis Torres","Mark Castillo","Dante Ramos","Ivan Morales","Ryan Abad"],female:["Sofia Mendoza","Grace Aquino","Rowena Pascual","Pia Salazar","Carla Basco"]},
    "STEM-A": {male:["Juan dela Cruz","Mikael Lim","Jayson Tan","Paolo Sy","Ben Cruz"],female:["Carla Navarro","Tricia Ong","Rina Chua","Angela Go","Kris Santos"]},
    "STEM-B": {male:["Ryan Soriano","JM Santos","Paul Cruz","Ken Dela Rosa","Leo Torres"],female:["Beth Reyes","Len Gomez","Mia Bautista","Ara Manalo","Nina Aquino"]},
    "HE-HO-A":{male:["Jojo Mendoza","Dodong Aquino","Totoy Salazar","Bong Cruz","Kuya Santos"],female:["Leni Villanueva","Tess Torres","Marites Castillo","Baby Pascual","Nene Ramos"]},
    "HE-HO-B":{male:["Danny Navarro","Ronnie Ong","Edwin Chua","Boy Go","Jun Dela Rosa"],female:["Susan Morales","Cathy Lim","Vicky Tan","Luz Sy","Nora Cruz"]},
    "ICT-A":  {male:["Alex Soriano","Sam Santos","Max Cruz","Jay Manalo","Lex Torres"],female:["Kim Reyes","Ash Gomez","Sky Bautista","Dee Dela Rosa","Pat Aquino"]},
    "ABM-A":  {male:["Renz Navarro","Franz Ong","Lance Chua","Ace Go","Rey Dela Rosa"],female:["Jasmine Morales","Bea Lim","Jia Tan","Vida Sy","Gem Cruz"]},
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
    "G12-ICT-A":{
      male:["Balais, Jefferson","Bangayan, Cedric","Bechayda, Kirk Sean","Caamic, Clyde","Catalan, Tony Rey","Catbagan, Jhanie Kal-El","Cabiles, Mark Lawrence","Cagoyong, Jhonn","De Roy, Mark Laurence","Domalaza, Kaizen Red","Granada, James Benedict","Hernandez, John Lloyd","Lumapinit, Norshad","Mamasaranao, Fahad","Maquinto, Arman Jay","Pate\u00f1a, Lance","Valdez, Kent Anthony","Alviz, Carl Erielle","Linang, Alvin","Loro, Juan Gabriel","Marquez, John Nornel","Vasquez, Rheyven","Velasquez, Kier"],
      female:["Amante, Trisha","Ba\u00f1ares, Chrislyn","Cabalquinto, Bhea Janina","Cayetano, Jennika","Dela Cruz, Shane Azley","Espi\u00f1a, Maria Erissa","Mendoza, Jezreel Eve","Merico, Angelica","Ortaliz, Margaret Joyce","Pagaran, Margarette","Saldivar, Ma. Ronisa","Nepomuceno, Alanis Kate"]
    },
    "G12-ABM-A":{male:["Renz Navarro Jr.","Franz Ong Jr.","Lance Chua Jr.","Ace Go Jr.","Rey Dela Rosa Jr."],female:["Jasmine Morales Jr.","Bea Lim Jr.","Jia Tan Jr.","Vida Sy Jr.","Gem Cruz Jr."]}
  },
  subjects:[
    {name:"Applied Economics",                                         icon:"AE",    teacher:"ABM Faculty", strand:"ABM"},
    {name:"Business Ethics and Social Responsibility",                 icon:"BESR",  teacher:"ABM Faculty", strand:"ABM"},
    {name:"Business Finance",                                          icon:"BF",    teacher:"ABM Faculty", strand:"ABM"},
    {name:"Business Math",                                             icon:"BM",    teacher:"ABM Faculty", strand:"ABM"},
    {name:"Fundamentals of Accountancy, Bus. and Mgt 1",              icon:"FAB1",  teacher:"ABM Faculty", strand:"ABM"},
    {name:"Fundamentals of Accountancy, Bus. and Mgt 2",              icon:"FAB2",  teacher:"ABM Faculty", strand:"ABM"},
    {name:"Organization and Management",                               icon:"OM",    teacher:"ABM Faculty", strand:"ABM"},
    {name:"Principles of Marketing",                                   icon:"PM",    teacher:"ABM Faculty", strand:"ABM"},
    {name:"Community Engagement, Solidarity and Citizenship",          icon:"CES",   teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Creative Nonfiction",                                       icon:"CNF",   teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Creative Writing",                                          icon:"CW",    teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Culminating Activity",                                      icon:"CA",    teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Disciplines and Ideas in the Applied Social Sciences",      icon:"DIASS", teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Disciplines and Ideas in the Social Sciences",              icon:"DISS",  teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Introduction to World Religions and Belief System",         icon:"IWRBS", teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Malikhaing Pagsulat",                                       icon:"MP",    teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Philippine Politics and Governance",                        icon:"PPG",   teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Trend, Networks, and Critical Thinking in the 21st Century",icon:"TNC",  teacher:"HUMSS Faculty", strand:"HUMSS"},
    {name:"Basic Calculus",      icon:"BC",   teacher:"STEM Faculty", strand:"STEM"},
    {name:"Biology 1",           icon:"BIO1", teacher:"STEM Faculty", strand:"STEM"},
    {name:"Biology 2",           icon:"BIO2", teacher:"STEM Faculty", strand:"STEM"},
    {name:"General Chemistry 1", icon:"GC1",  teacher:"STEM Faculty", strand:"STEM"},
    {name:"General Chemistry 2", icon:"GC2",  teacher:"STEM Faculty", strand:"STEM"},
    {name:"General Physics 1",   icon:"GP1",  teacher:"STEM Faculty", strand:"STEM"},
    {name:"General Physics 2",   icon:"GP2",  teacher:"STEM Faculty", strand:"STEM"},
    {name:"Pre-Calculus",        icon:"PC",   teacher:"STEM Faculty", strand:"STEM"}
  ],
  crSubjects:[
    "Applied Economics","Business Ethics and Social Responsibility","Business Finance","Business Math",
    "Fundamentals of Accountancy, Bus. and Mgt 1","Fundamentals of Accountancy, Bus. and Mgt 2",
    "Organization and Management","Principles of Marketing",
    "Community Engagement, Solidarity and Citizenship","Creative Nonfiction","Creative Writing",
    "Culminating Activity","Disciplines and Ideas in the Applied Social Sciences",
    "Disciplines and Ideas in the Social Sciences","Introduction to World Religions and Belief System",
    "Malikhaing Pagsulat","Philippine Politics and Governance",
    "Trend, Networks, and Critical Thinking in the 21st Century",
    "Basic Calculus","Biology 1","Biology 2","General Chemistry 1","General Chemistry 2",
    "General Physics 1","General Physics 2","Pre-Calculus"
  ],
  crColors:[
    "#f59e0b","#f97316","#ef4444","#e8000f","#b45309","#92400e","#78350f","#fbbf24",
    "#8b5cf6","#a855f7","#ec4899","#6366f1","#7c3aed","#db2777","#9333ea","#4f46e5","#be185d","#7e22ce",
    "#0ea5e9","#06b6d4","#10b981","#22c55e","#14b8a6","#38bdf8","#34d399","#84cc16"
  ],
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

/* ── STRAND HELPERS ── */
function isIct12(strand, grade)              { return strand === "ICT" && grade === "G12"; }
function getSubjectsForFolder(strand, grade) {
  if (isIct12(strand, grade)) return ICT12_SUBJECTS_OBJ;
  var s = (strand||"").toUpperCase();
  if (s === "ABM")   return ABM_SUBJECTS;
  if (s === "HUMSS") return HUMSS_SUBJECTS;
  if (s === "STEM")  return STEM_SUBJECTS;
  return DB.subjects;
}
function getCrSubjectsForFolder(strand, grade) {
  if (isIct12(strand, grade)) return ICT12_SUBJECT_NAMES;
  var s = (strand||"").toUpperCase();
  if (s === "ABM")   return ABM_SUBJECT_NAMES;
  if (s === "HUMSS") return HUMSS_SUBJECT_NAMES;
  if (s === "STEM")  return STEM_SUBJECT_NAMES;
  return DB.crSubjects;
}
function getCrColorsForFolder(strand, grade) {
  if (isIct12(strand, grade)) return ICT12_COLORS;
  var s = (strand||"").toUpperCase();
  if (s === "ABM")   return ABM_COLORS;
  if (s === "HUMSS") return HUMSS_COLORS;
  if (s === "STEM")  return STEM_COLORS;
  return DB.crColors;
}

/* ── BOOT / MERGE DB ── */
var _savedDB = loadDB();
var DB = JSON.parse(JSON.stringify(DEFAULT_DB));
if (_savedDB && Array.isArray(_savedDB.students) && Array.isArray(_savedDB.teachers)) {
  DB.students = _savedDB.students;
  DB.teachers = _savedDB.teachers;
  if (_savedDB.classRoster) {
    for (var _rk in _savedDB.classRoster) {
      DB.classRoster[_rk] = _savedDB.classRoster[_rk];
    }
  }
  DB.classRoster["G12-ICT-A"] = JSON.parse(JSON.stringify(DEFAULT_DB.classRoster["G12-ICT-A"]));
}

var _hasSeedStu = false;
for (var _bi = 0; _bi < DB.students.length; _bi++) {
  if (DB.students[_bi].id === "STU-001") { _hasSeedStu = true; break; }
}
if (!_hasSeedStu) DB.students.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.students[0])));

var _hasSeedTch = false;
for (var _bj = 0; _bj < DB.teachers.length; _bj++) {
  if (DB.teachers[_bj].id === "TCH-001") { _hasSeedTch = true; break; }
}
if (!_hasSeedTch) DB.teachers.unshift(JSON.parse(JSON.stringify(DEFAULT_DB.teachers[0])));

for (var _si = 0; _si < DB.students.length; _si++) {
  if (!DB.students[_si].grades) DB.students[_si].grades = {};
  for (var _sj = 0; _sj < DEFAULT_DB.crSubjects.length; _sj++) {
    var _sn = DEFAULT_DB.crSubjects[_sj];
    if (!DB.students[_si].grades[_sn]) DB.students[_si].grades[_sn] = {q1:"",q2:"",q3:"",q4:""};
  }
}
saveDB();

/* ── GRADE / SCORE STORES ── */
var scoreStore   = {};
var crStore      = {};
var attStore     = {};
var rosterGrades = {};
loadGrades();

/* ── GLOBAL STATE ── */
var currentUser       = null;
var currentRole       = "student";
var currentFolder     = "HUMSS";
var currentSection    = "A";
var currentGradeLevel = "G11";
var currentView       = "gradebook";
var currentQuarter    = "q1";
var currentSubject    = null;
var currentGbSubject  = null;
var gbSearchQuery     = "";
var suRole            = "student";
var isDark            = true;
var currentSemFilter  = 0;
var _tcScrolledToBottom = false;
var _tcAccepted         = false;

/* ── UTILITIES ── */
function g(id)         { return document.getElementById(id); }
function showEl(id)    { var e = g(id); if (e) e.classList.remove("hidden"); }
function hideEl(id)    { var e = g(id); if (e) e.classList.add("hidden"); }
function showAlert(id, msg, type) {
  var e = g(id);
  if (!e) return;
  e.textContent = msg;
  e.className   = "alert " + (type || "error");
}
function hideAlert(id) { var e = g(id); if (e) e.className = "alert hidden"; }

/* ── DARK MODE ── */
function toggleDark() {
  isDark = !isDark;
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  var icon = isDark ? "🌙" : "☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id) {
    var e = g(id);
    if (e) e.textContent = icon;
  });
  try { localStorage.setItem("asiasource_dark", isDark ? "1" : "0"); } catch(e) {}
}
function applyLoginDark() { document.documentElement.setAttribute("data-theme","dark"); isDark = true; }
function applyUserTheme() {
  try {
    var saved = localStorage.getItem("asiasource_dark");
    if (saved !== null) isDark = (saved === "1");
  } catch(e) {}
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
  var icon = isDark ? "🌙" : "☀️";
  ["dmNavIcon","dmNavIcon2"].forEach(function(id) {
    var e = g(id);
    if (e) e.textContent = icon;
  });
}

/* ── AUTH TABS ── */
function switchAuth(tab) {
  if (tab === "login") {
    g("tabLogin").className  = "auth-tab active";
    g("tabSignup").className = "auth-tab";
    showEl("authLogin"); hideEl("authSignup");
  } else {
    g("tabLogin").className  = "auth-tab";
    g("tabSignup").className = "auth-tab active";
    hideEl("authLogin"); showEl("authSignup");
  }
}
function setRole(role) {
  currentRole = role;
  var isT = (role === "teacher");
  g("btnStudent").className = "role-btn" + (isT ? "" : " active");
  g("btnTeacher").className = "role-btn" + (isT ? " active" : "");
  g("loginBtn").textContent = isT ? "Sign In as Teacher" : "Sign In as Student";
  g("userId").placeholder   = isT ? "e.g. ana.santos" : "e.g. juan.delacruz";
  hideAlert("alertBox");
  g("userId").value   = "";
  g("password").value = "";
}
function togglePass(id) { var p = g(id); p.type = (p.type === "password") ? "text" : "password"; }
function setSuRole(role) {
  suRole = role;
  g("suBtnStu").className = "role-btn" + (role === "student" ? " active" : "");
  g("suBtnTch").className = "role-btn" + (role === "teacher" ? " active" : "");
  var sfg = g("suStrandFg");
  if (sfg) sfg.style.display = (role === "student") ? "" : "none";
  hideAlert("suAlert");
  hideAlert("suSuccess");
}

/* ── TERMS & CONDITIONS ── */
function openTcModal() {
  _tcScrolledToBottom = false;
  var modal     = g("tcModal");
  var acceptBtn = g("tcAcceptBtn");
  var hint      = g("tcScrollHint");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  acceptBtn.disabled = true;
  if (hint) hint.style.opacity = "1";
  var body = g("tcBody");
  if (body) {
    body.scrollTop = 0;
    body.onscroll = function() {
      if (!_tcScrolledToBottom && body.scrollTop + body.clientHeight >= body.scrollHeight - 20) {
        _tcScrolledToBottom = true;
        acceptBtn.disabled  = false;
        if (hint) hint.style.opacity = "0";
      }
    };
  }
}
function closeTcModal() { g("tcModal").classList.add("hidden"); document.body.style.overflow = ""; }
function acceptTc() {
  _tcAccepted = true;
  g("suTcCheck").checked = true;
  onTcCheck();
  closeTcModal();
  showToast("✅ Terms & Conditions accepted!", "success");
}
function onTcCheck() {
  var checked = g("suTcCheck").checked;
  var btn     = g("suSubmitBtn");
  if (btn) {
    btn.disabled          = !checked;
    btn.style.opacity     = checked ? "1" : "0.45";
    btn.style.cursor      = checked ? "pointer" : "not-allowed";
  }
  if (checked && !_tcAccepted) {
    g("suTcCheck").checked = false;
    if (btn) { btn.disabled = true; btn.style.opacity = "0.45"; btn.style.cursor = "not-allowed"; }
    openTcModal();
  }
}

/* ── LOGIN ── */
function handleLogin(e) {
  e.preventDefault();
  var fresh = loadDB();
  if (fresh && Array.isArray(fresh.students) && Array.isArray(fresh.teachers)) {
    DB.students = fresh.students;
    DB.teachers = fresh.teachers;
  }
  var eu = g("userId").value.trim().toLowerCase();
  var pw = g("password").value.trim();
  hideAlert("alertBox");
  if (!eu || !pw) { showAlert("alertBox","Please fill in all fields."); return; }

  if (currentRole === "student") {
    var foundStu = null;
    for (var i = 0; i < DB.students.length; i++) {
      if (DB.students[i].emailUser === eu && DB.students[i].pass === pw) { foundStu = DB.students[i]; break; }
    }
    if (!foundStu) {
      var emailExistsStu = false;
      for (var i2 = 0; i2 < DB.students.length; i2++) { if (DB.students[i2].emailUser === eu) { emailExistsStu = true; break; } }
      showAlert("alertBox", emailExistsStu ? "Wrong password. Use your birthday: YYYY-MM-DD" : "Email not found. Check spelling or sign up first.");
      return;
    }
    currentUser = foundStu;
    hideEl("loginPage");
    applyUserTheme();
    loadStudentDash(foundStu);
    showEl("studentDash");
  } else {
    var foundTch = null;
    for (var j = 0; j < DB.teachers.length; j++) {
      if (DB.teachers[j].emailUser === eu && DB.teachers[j].pass === pw) { foundTch = DB.teachers[j]; break; }
    }
    if (!foundTch) {
      var emailExistsTch = false;
      for (var j2 = 0; j2 < DB.teachers.length; j2++) { if (DB.teachers[j2].emailUser === eu) { emailExistsTch = true; break; } }
      showAlert("alertBox", emailExistsTch ? "Wrong password. Use your birthday: YYYY-MM-DD" : "Teacher email not found.");
      return;
    }
    currentUser = foundTch;
    hideEl("loginPage");
    applyUserTheme();
    loadTeacherDash(foundTch);
    showEl("teacherDash");
  }
}

/* ── LOGOUT / GO HOME ── */
function logout() {
  hideEl("studentDash");
  hideEl("teacherDash");
  showEl("loginPage");
  currentUser         = null;
  g("userId").value   = "";
  g("password").value = "";
  applyLoginDark();
}

/* Brand name click → go back to login / home */
function goHome() {
  if (!currentUser) return; /* already on login */
  logout();
}

/* ── SIGN UP ── */
function handleSignUp(e) {
  e.preventDefault();
  hideAlert("suAlert");
  hideAlert("suSuccess");
  if (!_tcAccepted) { showAlert("suAlert","Please read and accept the Terms & Conditions first."); openTcModal(); return; }
  var name  = g("suName").value.trim();
  var eu    = g("suEmail").value.trim().toLowerCase();
  var bday  = g("suBirthday").value;
  if (!name) { showAlert("suAlert","Please enter your full name."); return; }
  if (!eu)   { showAlert("suAlert","Please enter your email username."); return; }
  if (!bday) { showAlert("suAlert","Please pick your birthday using the date picker."); return; }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(bday)) { showAlert("suAlert","Birthday must be in YYYY-MM-DD format."); return; }
  var allUsers = DB.students.concat(DB.teachers);
  for (var i = 0; i < allUsers.length; i++) {
    if (allUsers[i].emailUser === eu) { showAlert("suAlert","Email username already exists."); return; }
  }
  var defaultGrades = {};
  for (var s = 0; s < DEFAULT_DB.crSubjects.length; s++) {
    defaultGrades[DEFAULT_DB.crSubjects[s]] = {q1:"",q2:"",q3:"",q4:""};
  }
  if (suRole === "student") {
    var strand = g("suStrand").value;
    if (!strand) { showAlert("suAlert","Please select your strand and section."); return; }
    var idNum = String(DB.students.length + 1).padStart(4,"0");
    DB.students.push({
      id:"STU-"+Date.now(), emailUser:eu, pass:bday, name:name, email:eu,
      strand:strand, bday:bday, gender:"", mobile:"", address:"", city:"",
      studentId: new Date().getFullYear() + "-" + idNum,
      grades:defaultGrades, scores:{ww:"",pt:"",qe:"",act:""}, approvedSubjects:[], pendingSubjects:[]
    });
  } else {
    DB.teachers.push({
      id:"TCH-"+Date.now(), emailUser:eu, pass:bday, name:name, email:eu,
      bday:bday, address:"", gender:"", mobile:"", city:""
    });
  }
  saveDB();
  _tcAccepted = false;
  var tcChk = g("suTcCheck"); if (tcChk) tcChk.checked = false;
  var suBtn = g("suSubmitBtn");
  if (suBtn) { suBtn.disabled = true; suBtn.style.opacity = "0.45"; suBtn.style.cursor = "not-allowed"; }
  showAlert("suSuccess", "✅ Account created! Email: " + eu + "@asiasourceicollege.edu.ph\nPassword: " + bday, "success");
  document.querySelector("#authSignup form").reset();
  setTimeout(function() { switchAuth("login"); hideAlert("suSuccess"); }, 3500);
}

/* ── GRADE HELPERS ── */
function avgGrade() {
  var args   = Array.prototype.slice.call(arguments);
  var filled = args.filter(function(v) {
    return v !== "" && v !== null && v !== undefined && !isNaN(Number(v)) && Number(v) > 0;
  });
  if (!filled.length) return null;
  return Math.round(filled.reduce(function(a, b) { return a + Number(b); }, 0) / filled.length);
}
function getRemarks(gr) {
  if (!gr || gr === "") return "-";
  gr = Number(gr);
  if (gr >= 90) return "Outstanding";
  if (gr >= 85) return "Very Satisfactory";
  if (gr >= 80) return "Satisfactory";
  if (gr >= 75) return "Fairly Satisfactory";
  return "Did Not Meet Expectations";
}
function badgeClass(gr) {
  if (!gr) return "";
  gr = Number(gr);
  if (gr >= 90) return "badge-outstanding";
  if (gr >= 85) return "badge-vs";
  if (gr >= 80) return "badge-sat";
  if (gr >= 75) return "badge-fs";
  return "badge-fail";
}
function gradeColor(gr) {
  if (!gr) return "var(--text-muted)";
  gr = Number(gr);
  if (gr >= 90) return "#5dde92";
  if (gr >= 85) return "#7bc8f5";
  if (gr >= 80) return "#fbbf24";
  if (gr >= 75) return "#f0a050";
  return "#ff9090";
}
function darken(hex, amt) {
  var n  = parseInt(hex.replace("#",""), 16);
  var r  = Math.max(0, (n >> 16) + amt);
  var gg = Math.max(0, ((n >> 8) & 0xFF) + amt);
  var b  = Math.max(0, (n & 0xFF) + amt);
  return "#" + (((1 << 24) | (r << 16) | (gg << 8) | b).toString(16).slice(1));
}
function getSubjColor(subj) {
  var idx  = getCrSubjectsForFolder(currentFolder, currentGradeLevel).indexOf(subj);
  var cols = getCrColorsForFolder(currentFolder, currentGradeLevel);
  return idx >= 0 ? cols[idx % cols.length] : "#374151";
}
function findStudentByName(name) {
  for (var i = 0; i < DB.students.length; i++) { if (DB.students[i].name === name) return DB.students[i]; }
  return null;
}
function findStudentById(id) {
  for (var i = 0; i < DB.students.length; i++) { if (DB.students[i].id === id) return DB.students[i]; }
  return null;
}
function ensureStudentGrades(stu) {
  if (!stu.grades) stu.grades = {};
  for (var s = 0; s < DB.crSubjects.length; s++) {
    var sn = DB.crSubjects[s];
    if (!stu.grades[sn]) stu.grades[sn] = {q1:"",q2:"",q3:"",q4:""};
  }
}

/* ── ROSTER GRADES ── */
function getRosterGrade(classKey, stuName, subj, qtr) {
  if (!rosterGrades[classKey]) return "";
  if (!rosterGrades[classKey][stuName]) return "";
  if (!rosterGrades[classKey][stuName][subj]) return "";
  var v = rosterGrades[classKey][stuName][subj][qtr];
  return (v !== undefined && v !== null && v !== "") ? v : "";
}
function setRosterGrade(classKey, stuName, subj, qtr, grade) {
  if (!rosterGrades[classKey])                          rosterGrades[classKey]                    = {};
  if (!rosterGrades[classKey][stuName])                 rosterGrades[classKey][stuName]           = {};
  if (!rosterGrades[classKey][stuName][subj])           rosterGrades[classKey][stuName][subj]     = {};
  rosterGrades[classKey][stuName][subj][qtr] = grade;
  var stu = findStudentByName(stuName);
  if (stu) {
    ensureStudentGrades(stu);
    if (!stu.grades[subj]) stu.grades[subj] = {};
    stu.grades[subj][qtr] = grade;
  }
}
function getAllRosterGrades(classKey, stuName, subj) {
  var out = {q1:"",q2:"",q3:"",q4:""};
  if (!rosterGrades[classKey] || !rosterGrades[classKey][stuName] || !rosterGrades[classKey][stuName][subj]) return out;
  var qd = rosterGrades[classKey][stuName][subj];
  out.q1 = qd.q1 || ""; out.q2 = qd.q2 || ""; out.q3 = qd.q3 || ""; out.q4 = qd.q4 || "";
  return out;
}

/* ── STRAND HELPERS ── */
function getGradeLevel(strand)      { if(!strand) return ""; var m=strand.match(/^G(\d+)-/); return m?"Grade "+m[1]:""; }
function getGradeLevelShort(strand) { if(!strand) return ""; var m=strand.match(/^G(\d+)-/); return m?"G"+m[1]:""; }
function getStrandName(strand) {
  if (!strand) return "";
  var m = strand.match(/^G\d+-(.+?)-[AB]$|^G\d+-(.+)$/);
  if (m) return (m[1] || m[2] || "").replace("HEHO","H.E-H.O");
  return strand;
}
function getSectionLetter(strand)  { if(!strand) return ""; var m=strand.match(/-([AB])$/); return m?m[1]:""; }
function strandToRosterKey(strand) { if(!strand) return null; return strand.replace(/HEHO/,"HE-HO"); }
function strandToClassKey(strand)  {
  if (!strand) return null;
  return strand.replace(/^G\d+-/,"").replace(/^HEHO-/,"HE-HO-");
}

/* ── DYNAMIC ROSTER ── */
function getDynamicRoster(classKey, grade) {
  grade         = grade || currentGradeLevel || "G11";
  var fullKey   = grade + "-" + classKey;
  var legacyBase= DB.classRoster[classKey]  || {male:[], female:[]};
  var gradeBase = DB.classRoster[fullKey]   || {male:[], female:[]};
  var baseMale   = gradeBase.male.length   ? gradeBase.male.slice()   : legacyBase.male.slice();
  var baseFemale = gradeBase.female.length ? gradeBase.female.slice() : legacyBase.female.slice();
  var result = {
    male:   baseMale.map(function(n)   { return {name:n, studentId:null, gender:"male",   strand:"", isRegistered:false}; }),
    female: baseFemale.map(function(n) { return {name:n, studentId:null, gender:"female", strand:"", isRegistered:false}; })
  };
  for (var i = 0; i < DB.students.length; i++) {
    var stu = DB.students[i];
    if (!stu.strand) continue;
    var rkClass  = strandToClassKey(stu.strand);
    var stuGrade = getGradeLevelShort(stu.strand);
    if (stuGrade !== grade || rkClass !== classKey) continue;
    var gender = (stu.gender && stu.gender.toLowerCase() === "female") ? "female" : "male";
    var arr    = result[gender];
    var found  = false;
    for (var j = 0; j < arr.length; j++) {
      if (arr[j].name === stu.name) { arr[j].studentId = stu.id; arr[j].strand = stu.strand; arr[j].isRegistered = true; found = true; break; }
    }
    if (!found) {
      var invList    = loadInvites();
      var isApproved = false;
      for (var k = 0; k < invList.length; k++) {
        if (invList[k].studentId === stu.id && invList[k].status === "approved") { isApproved = true; break; }
      }
      if (isApproved || (stu.approvedSubjects && stu.approvedSubjects.length > 0)) {
        result[gender].push({name:stu.name, studentId:stu.id, gender:gender, strand:stu.strand, isRegistered:true});
      }
    }
  }
  return result;
}
function addStudentToStaticRoster(stu) {
  var fullKey = strandToRosterKey(stu.strand);
  if (!fullKey) return;
  if (!DB.classRoster[fullKey]) DB.classRoster[fullKey] = {male:[], female:[]};
  var gender = (stu.gender && stu.gender.toLowerCase() === "female") ? "female" : "male";
  var arr    = DB.classRoster[fullKey][gender];
  for (var i = 0; i < arr.length; i++) { if (arr[i] === stu.name) return; }
  arr.push(stu.name);
  saveDB();
}

/* ── NOTIFICATIONS ── */
function addNotifForTeacher(teacherId, notif) {
  var key  = "teacher_notif_" + teacherId;
  var list = JSON.parse(localStorage.getItem(key) || "[]");
  notif.id        = Date.now() + "_" + Math.random();
  notif.read      = false;
  notif.timestamp = new Date().toISOString();
  list.unshift(notif);
  localStorage.setItem(key, JSON.stringify(list));
}
function getTeacherNotifs(teacherId)              { return JSON.parse(localStorage.getItem("teacher_notif_" + teacherId) || "[]"); }
function markTeacherNotifRead(teacherId, notifId) {
  var key  = "teacher_notif_" + teacherId;
  var list = JSON.parse(localStorage.getItem(key) || "[]");
  list.forEach(function(n) { if (n.id === notifId) n.read = true; });
  localStorage.setItem(key, JSON.stringify(list));
}
function getUnreadTeacherNotifCount(teacherId) {
  return getTeacherNotifs(teacherId).filter(function(n) { return !n.read; }).length;
}
function getApprovedSubjects(studentId) { return loadInvites().filter(function(inv) { return inv.studentId === studentId && inv.status === "approved";  }); }
function getPendingSubjects(studentId)  { return loadInvites().filter(function(inv) { return inv.studentId === studentId && inv.status === "pending";   }); }

/* ── PHOTO ── */
function loadStudentPhoto(studentId) { try { return localStorage.getItem("asiasource_photo_" + studentId); } catch(e) { return null; } }
function applyStudentPhoto(studentId, dataUrl) {
  var emojiEl    = g("stuAvatarEmoji");
  var photoWrap  = g("stuPcPhotoWrap");
  var photoImg   = g("stuPcPhoto");
  if (dataUrl) {
    if (emojiEl)   emojiEl.style.display = "none";
    if (photoWrap) photoWrap.classList.remove("hidden");
    if (photoImg)  photoImg.src = dataUrl;
  } else {
    if (emojiEl)   emojiEl.style.display = "";
    if (photoWrap) photoWrap.classList.add("hidden");
    if (photoImg)  photoImg.src = "";
  }
  var pmOverlay     = g("pmPhotoOverlay");
  var pmImg         = g("pmPhotoImg");
  var pmAvatarEmoji = g("pmAvatar");
  if (dataUrl && currentRole === "student") {
    if (pmOverlay)     pmOverlay.classList.remove("hidden");
    if (pmImg)         pmImg.src = dataUrl;
    if (pmAvatarEmoji) pmAvatarEmoji.style.opacity = "0";
  } else {
    if (pmOverlay)     pmOverlay.classList.add("hidden");
    if (pmAvatarEmoji) pmAvatarEmoji.style.opacity = "1";
  }
}
var _photoDataUrl = null;
function handlePhotoUpload(event) {
  var file = event.target.files[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { showToast("⚠️ Please select an image file.", "warning"); return; }
  var reader   = new FileReader();
  reader.onload = function(e) {
    _photoDataUrl = e.target.result;
    var preview     = g("pmPhotoPreviewImg");
    var placeholder = g("pmPhotoPlaceholder");
    if (preview)     { preview.src = _photoDataUrl; preview.classList.remove("hidden"); }
    if (placeholder)   placeholder.style.display = "none";
  };
  reader.readAsDataURL(file);
}
function saveProfilePhoto() {
  if (!_photoDataUrl) { showToast("⚠️ Please choose a photo first.", "warning"); return; }
  if (!currentUser)   return;
  try { localStorage.setItem("asiasource_photo_" + currentUser.id, _photoDataUrl); }
  catch(e) { showToast("⚠️ Photo too large. Try a smaller image.", "warning"); return; }
  applyStudentPhoto(currentUser.id, _photoDataUrl);
  var successEl = g("pmPhotoSuccess");
  if (successEl) { successEl.classList.remove("hidden"); setTimeout(function() { successEl.classList.add("hidden"); }, 2500); }
  showToast("📷 Profile photo saved!", "success");
  _photoDataUrl = null;
}
function removeProfilePhoto() {
  if (!currentUser) return;
  try { localStorage.removeItem("asiasource_photo_" + currentUser.id); } catch(e) {}
  applyStudentPhoto(currentUser.id, null);
  var preview     = g("pmPhotoPreviewImg");
  var placeholder = g("pmPhotoPlaceholder");
  if (preview)     { preview.src = ""; preview.classList.add("hidden"); }
  if (placeholder)   placeholder.style.display = "";
  showToast("🗑️ Photo removed.", "warning");
}

/* ── STUDENT DASHBOARD ── */
var Q_LABELS = {q1:"Quarter 1", q2:"Quarter 2", q3:"Quarter 3", q4:"Quarter 4"};

function getSubjectsForStudent(stu) {
  if (stu.strand && stu.strand.indexOf("G12") >= 0 && stu.strand.indexOf("ICT") >= 0) return ICT12_SUBJECTS_OBJ;
  return DB.subjects;
}

function loadStudentDash(stu) {
  for (var i = 0; i < DB.students.length; i++) {
    if (DB.students[i].id === stu.id) { currentUser = DB.students[i]; stu = currentUser; break; }
  }
  g("stuName").textContent         = stu.name;
  g("stuProfileName").textContent  = stu.name;
  g("stuProfileEmail").textContent = (stu.email || stu.emailUser) + "@asiasourceicollege.edu.ph";
  g("stuProfileBday").textContent  = stu.bday || "-";
  g("stuProfileLRN").textContent   = stu.emailUser;

  var glShort  = getGradeLevelShort(stu.strand);
  var isG11    = stu.strand && stu.strand.indexOf("G11") >= 0;
  var glColor  = isG11 ? "#0ea5e9" : "#10b981";
  var strandEl = g("stuProfileStrand");
  if (strandEl) {
    strandEl.innerHTML =
      (glShort ? '<span style="background:'+glColor+'22;border:1px solid '+glColor+'55;color:'+glColor+';border-radius:20px;padding:1px 8px;font-size:10px;font-weight:800;margin-right:4px;">'+glShort+'</span>' : "") +
      (DB.strandFull[stu.strand] || stu.strand || "");
  }

  var subjectsForStu = getSubjectsForStudent(stu);
  var approved       = getApprovedSubjects(stu.id).map(function(inv) { return inv.subjectName; });
  var pending        = getPendingSubjects(stu.id).map(function(inv)  { return inv.subjectName; });
  var seed           = stu.approvedSubjects || [];
  var allApproved    = seed.concat(approved.filter(function(s) { return seed.indexOf(s) < 0; }));

  var list = g("subjectList");
  list.innerHTML = "";
  for (var pi = 0; pi < pending.length; pi++) {
    var pSubj = pending[pi];
    var pSub  = null;
    for (var pj = 0; pj < subjectsForStu.length; pj++) { if (subjectsForStu[pj].name === pSubj) { pSub = subjectsForStu[pj]; break; } }
    var pIcon    = pSub ? pSub.icon    : pSubj.slice(0,3).toUpperCase();
    var pTeacher = pSub ? pSub.teacher : "";
    list.innerHTML +=
      '<div class="subject-card pending-card">' +
        '<div class="subject-left">' +
          '<div class="subject-icon" style="opacity:.5;">' + pIcon + '</div>' +
          '<div><div class="sub-name">' + pSubj + '</div><div class="sub-teacher">' + pTeacher + '</div></div>' +
        '</div>' +
        '<div class="subject-grade"><div class="pending-badge">⏳ Waiting Approval</div></div>' +
      '</div>';
  }

  if (allApproved.length === 0 && pending.length === 0) {
    list.innerHTML =
      '<div class="no-subjects-msg">' +
        '<div class="no-sub-icon">📚</div>' +
        '<div class="no-sub-text">You have no subjects yet.</div>' +
        '<div class="no-sub-hint">Click the button above to add your subjects.</div>' +
      '</div>';
  }

  for (var si = 0; si < subjectsForStu.length; si++) {
    var sub = subjectsForStu[si];
    if (allApproved.indexOf(sub.name) < 0) continue;
    var gr     = stu.grades[sub.name] || {};
    var fg     = avgGrade(gr.q1, gr.q2, gr.q3, gr.q4);
    var passed = fg && fg >= 75;
    var semBadge = sub.sem
      ? '<div style="margin-bottom:4px;"><span class="sem-badge sem-badge-'+sub.sem+'">' + (sub.sem===1?"1st Semester":"2nd Semester") + '</span></div>'
      : "";
    var subjType = getSubjectType(sub.name);
    var wts      = DEPED_WEIGHTS[subjType] || DEPED_WEIGHTS.core;
    var wtLabel  = 'WW '+Math.round(wts.ww*100)+'% · PT '+Math.round(wts.pt*100)+'% · QA '+Math.round(wts.qa*100)+'%';
    list.innerHTML +=
      '<div class="subject-card" onclick="openSubjectDetail(\'' + sub.name.replace(/'/g,"\\'") + '\')">' +
        '<div class="subject-left">' +
          '<div class="subject-icon">' + sub.icon + '</div>' +
          '<div>' + semBadge + '<div class="sub-name">' + sub.name + '</div>' +
          '<div class="sub-teacher">' + sub.teacher + '</div>' +
          '<div style="font-size:9px;color:var(--au-300);margin-top:3px;opacity:.7;">' + wtLabel + '</div></div>' +
        '</div>' +
        '<div class="subject-grade">' +
          '<div class="grade-num">' + (fg || "-") + '</div>' +
          '<div class="grade-label">Final</div>' +
          '<div class="grade-pill ' + (passed ? "pill-pass" : "pill-fail") + '">' + getRemarks(fg) + '</div>' +
        '</div>' +
      '</div>';
  }

  var tbody = g("gradeCardBody");
  tbody.innerHTML = "";
  var gwaSum = 0, gwaCount = 0;
  var sem1Subj = [], sem2Subj = [], noSemSubj = [];
  for (var k = 0; k < subjectsForStu.length; k++) {
    var sk = subjectsForStu[k];
    if (allApproved.indexOf(sk.name) < 0) continue;
    if      (sk.sem === 1) sem1Subj.push(sk);
    else if (sk.sem === 2) sem2Subj.push(sk);
    else                   noSemSubj.push(sk);
  }
  function renderSemRows(subList, semLabel, semColor) {
    if (!subList.length) return;
    if (semLabel)
      tbody.innerHTML += '<tr><td colspan="5" style="background:'+semColor+'22;color:'+semColor+';font-weight:800;font-size:11px;letter-spacing:1px;text-transform:uppercase;padding:6px 10px;border-bottom:1px solid '+semColor+'33;">'+semLabel+'</td></tr>';
    for (var ri = 0; ri < subList.length; ri++) {
      var rsk = subList[ri];
      if (allApproved.indexOf(rsk.name) < 0) continue;
      var rGr   = stu.grades[rsk.name] || {};
      var q1=rGr.q1||"", q2=rGr.q2||"", q3=rGr.q3||"", q4=rGr.q4||"";
      var sem1g = avgGrade(q1, q2);
      var sem2g = avgGrade(q3, q4);
      var rfg;
      if      (rsk.sem===1) rfg = sem1g;
      else if (rsk.sem===2) rfg = sem2g;
      else                  rfg = avgGrade(q1, q2, q3, q4);
      var rPass = rfg && rfg >= 75;
      if (rfg) { gwaSum += rfg; gwaCount++; }
      tbody.innerHTML +=
        "<tr>" +
          "<td>" + rsk.name + "</td>" +
          '<td style="background:rgba(14,165,233,0.06);color:' + (sem1g?gradeColor(sem1g):"var(--text-muted)") + '">' + (sem1g||"-") + "</td>" +
          '<td style="background:rgba(16,185,129,0.06);color:' + (sem2g?gradeColor(sem2g):"var(--text-muted)") + '">' + (sem2g||"-") + "</td>" +
          '<td class="final-col">' + (rfg||"-") + "</td>" +
          '<td><span class="grade-pill ' + (rPass?"pill-pass":"pill-fail") + '">' + getRemarks(rfg) + "</span></td>" +
        "</tr>";
    }
  }
  renderSemRows(sem1Subj, "1st Semester", "#38bdf8");
  renderSemRows(sem2Subj, "2nd Semester", "#34d399");
  renderSemRows(noSemSubj, "", "");
  if (!tbody.innerHTML)
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px;">No approved subjects yet.</td></tr>';

  var gwaBar = g("gwaBar");
  if (gwaBar) {
    if (gwaCount > 0) {
      var gwa = Math.round(gwaSum / gwaCount);
      gwaBar.style.display = "flex";
      gwaBar.innerHTML =
        '<span class="gwa-label">General Weighted Average (GWA)</span>' +
        '<span class="gwa-num" style="color:'+gradeColor(gwa)+';">'+gwa+'</span>' +
        '<span class="gwa-rem '+badgeClass(gwa)+'">'+getRemarks(gwa)+'</span>';
    } else {
      gwaBar.style.display = "none";
    }
  }
  applyStudentPhoto(stu.id, loadStudentPhoto(stu.id));
}

/* ── SUBJECT DETAIL MODAL (Student) ── */
function openSubjectDetail(subName) {
  if (!currentUser) return;
  var subjectsForStu = getSubjectsForStudent(currentUser);
  var sub = null;
  for (var i = 0; i < subjectsForStu.length; i++) { if (subjectsForStu[i].name === subName) { sub = subjectsForStu[i]; break; } }
  var gr         = (currentUser.grades && currentUser.grades[subName]) ? currentUser.grades[subName] : {};
  var modalColor = DB.crColors[DB.crSubjects.indexOf(subName)] || "#e8000f";
  var iconTxt    = sub ? sub.icon    : subName.slice(0,3).toUpperCase();
  var teacherTxt = sub ? "Teacher: " + sub.teacher : "";
  var semBadgeHtml = (sub && sub.sem)
    ? '<div style="margin-bottom:6px;"><span class="sem-badge sem-badge-'+sub.sem+'">' + (sub.sem===1?"1st Semester":"2nd Semester") + '</span></div>'
    : "";
  var subjType = getSubjectType(subName);
  var wts      = DEPED_WEIGHTS[subjType] || DEPED_WEIGHTS.core;
  var typeLabel = {core:"Core Subject",applied:"Applied/Academic",special:"Work Immersion/Research",tvl:"TVL/Specialized",tvl_special:"TVL (Immersion/Exhibit)"}[subjType] || "Academic";
  var sem1Grade = avgGrade(gr.q1, gr.q2);
  var sem2Grade = avgGrade(gr.q3, gr.q4);
  var finalGrade;
  if      (sub && sub.sem === 1) finalGrade = sem1Grade;
  else if (sub && sub.sem === 2) finalGrade = sem2Grade;
  else                           finalGrade = avgGrade(gr.q1, gr.q2, gr.q3, gr.q4);

  var html =
    '<div style="display:flex;align-items:center;gap:14px;padding:16px;background:'+modalColor+'11;border:1px solid '+modalColor+'33;border-radius:16px;margin-bottom:12px;">' +
      '<div style="width:52px;height:52px;border-radius:14px;background:'+modalColor+'22;border:1px solid '+modalColor+'55;color:'+modalColor+';display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px;flex-shrink:0;">'+iconTxt+'</div>' +
      '<div style="flex:1;min-width:0;">' + semBadgeHtml + '<div style="font-size:16px;font-weight:800;color:var(--text-primary);">'+subName+'</div><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">'+teacherTxt+'</div></div>' +
      '<div style="text-align:right;">' +
        '<div style="font-size:32px;font-weight:900;font-family:Cormorant Garamond,serif;color:'+(finalGrade?"var(--au-300)":"var(--text-muted)")+'">'+(finalGrade||"—")+'</div>' +
        '<div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:1px;">Final Grade</div>' +
      '</div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);border-radius:12px;margin-bottom:14px;flex-wrap:wrap;">' +
      '<span style="font-size:9.5px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:rgba(251,191,36,.5);">📋 DepEd Weights</span>' +
      '<span style="font-size:10.5px;font-weight:700;color:var(--ww);">WW '+Math.round(wts.ww*100)+'%</span>' +
      '<span style="color:rgba(255,255,255,.2);">·</span>' +
      '<span style="font-size:10.5px;font-weight:700;color:var(--pt);">PT '+Math.round(wts.pt*100)+'%</span>' +
      '<span style="color:rgba(255,255,255,.2);">·</span>' +
      '<span style="font-size:10.5px;font-weight:700;color:var(--qa);">QA '+Math.round(wts.qa*100)+'%</span>' +
      '<span style="margin-left:auto;font-size:9px;color:rgba(251,191,36,.4);">'+typeLabel+'</span>' +
    '</div>';

  html += '<div style="display:flex;gap:10px;margin-bottom:14px;">';
  if (!sub || sub.sem !== 2) {
    html += '<div style="flex:1;background:rgba(14,165,233,.08);border:1px solid rgba(14,165,233,.25);border-radius:14px;padding:14px;">' +
      '<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#38bdf8;margin-bottom:8px;">1st Semester</div>' +
      '<div style="display:flex;gap:8px;font-size:12px;color:var(--text-muted);margin-bottom:8px;"><span>Q1: '+(gr.q1||"—")+'</span><span>Q2: '+(gr.q2||"—")+'</span></div>' +
      '<div style="font-size:22px;font-weight:900;font-family:Cormorant Garamond,serif;color:'+(sem1Grade?gradeColor(sem1Grade):"var(--text-muted)")+'">'+(sem1Grade||"—")+'</div>' +
    '</div>';
  }
  if (!sub || sub.sem !== 1) {
    html += '<div style="flex:1;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.25);border-radius:14px;padding:14px;">' +
      '<div style="font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#34d399;margin-bottom:8px;">2nd Semester</div>' +
      '<div style="display:flex;gap:8px;font-size:12px;color:var(--text-muted);margin-bottom:8px;"><span>Q3: '+(gr.q3||"—")+'</span><span>Q4: '+(gr.q4||"—")+'</span></div>' +
      '<div style="font-size:22px;font-weight:900;font-family:Cormorant Garamond,serif;color:'+(sem2Grade?gradeColor(sem2Grade):"var(--text-muted)")+'">'+(sem2Grade||"—")+'</div>' +
    '</div>';
  }
  html += '</div>';

  var qtrsToShow = (sub && sub.sem===1) ? ["q1","q2"] : (sub && sub.sem===2) ? ["q3","q4"] : ["q1","q2","q3","q4"];
  html += '<div style="display:flex;gap:6px;margin-bottom:14px;">';
  qtrsToShow.forEach(function(q, qi) {
    var qg = gr[q] || "";
    html += '<button class="sm-qtab' + (qi===0?" active":"") + '" onclick="switchSmTab(\''+q+'\',this)" style="flex:1;padding:10px;border-radius:12px;border:1.5px solid '+(qi===0?modalColor+';background:'+modalColor+'22':'var(--border-subtle);background:transparent')+';color:'+(qi===0?modalColor:'var(--text-muted)')+';font-family:DM Sans,sans-serif;font-size:12px;font-weight:700;cursor:pointer;">' +
      '<span>' + q.toUpperCase() + '</span>' +
      (qg ? '<span style="display:block;font-size:18px;font-weight:900;color:'+gradeColor(qg)+';">'+qg+'</span>' : '<span style="display:block;font-size:14px;opacity:.4;">—</span>') +
    '</button>';
  });
  html += '</div>';

  qtrsToShow.forEach(function(q, qi) {
    var qg = gr[q] || "";
    html += '<div class="sm-qpanel' + (qi===0 ? "" : " hidden") + '" id="smPanel-'+q+'">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border-subtle);border-radius:12px;">' +
        '<span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);">'+Q_LABELS[q]+' Grade</span>' +
        '<span style="font-size:20px;font-weight:900;color:'+(qg?gradeColor(qg):"var(--text-muted)")+';">'+(qg||"Not yet graded")+'</span>' +
      '</div>' +
    '</div>';
  });

  html += '<div style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;background:linear-gradient(135deg,rgba(255,184,0,.08),rgba(232,0,15,.05));border:1px solid rgba(255,184,0,.25);border-radius:14px;margin-top:14px;">' +
    '<span style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:var(--au-300);">Final Grade</span>' +
    '<span style="font-size:28px;font-weight:900;font-family:Cormorant Garamond,serif;color:'+(finalGrade?gradeColor(finalGrade):"var(--text-muted)")+';">'+(finalGrade||"—")+'</span>' +
    '<span style="font-size:12px;font-weight:700;padding:4px 14px;border-radius:20px;background:rgba(255,255,255,.06);color:var(--text-muted);">'+getRemarks(finalGrade)+'</span>' +
  '</div>';

  g("subjectModalTitle").textContent = subName;
  g("subjectModalSub").textContent   = "";
  g("subjectModalContent").innerHTML = html;
  g("subjectModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function switchSmTab(q, btn) {
  document.querySelectorAll(".sm-qtab").forEach(function(t) { t.classList.remove("active"); });
  document.querySelectorAll(".sm-qpanel").forEach(function(p) { p.classList.add("hidden"); });
  btn.classList.add("active");
  var panel = g("smPanel-" + q);
  if (panel) panel.classList.remove("hidden");
}
function closeSubjectModal() { g("subjectModal").classList.add("hidden"); document.body.style.overflow = ""; }

/* ── ADD SUBJECT MODAL ── */
var selectedSubjectForAdd = null;
var selectedTeacherForAdd = null;
function openAddSubjectModal()  {
  selectedSubjectForAdd = null;
  selectedTeacherForAdd = null;
  renderAddSubjectStep1();
  g("addSubjectModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeAddSubjectModal() { g("addSubjectModal").classList.add("hidden"); document.body.style.overflow = ""; }

function renderAddSubjectStep1() {
  var subjectsForStu = getSubjectsForStudent(currentUser);
  var already  = getApprovedSubjects(currentUser.id).map(function(inv) { return inv.subjectName; });
  var pending  = getPendingSubjects(currentUser.id).map(function(inv)  { return inv.subjectName; });
  var seed     = currentUser.approvedSubjects || [];
  var taken    = already.concat(pending).concat(seed);
  var isIct12Stu = currentUser.strand && currentUser.strand.indexOf("G12") >= 0 && currentUser.strand.indexOf("ICT") >= 0;

  var html = '<div class="add-subj-step">';
  if (isIct12Stu) {
    html += '<div class="add-subj-title">📚 Select Subject</div>';
    html += '<div style="margin-bottom:8px;"><span class="sem-badge sem-badge-1">1st Semester</span></div>';
    html += '<div class="add-subj-grid" style="margin-bottom:16px;">';
    for (var i = 0; i < ICT12_SEM1_SUBJECTS.length; i++) {
      var sub = ICT12_SEM1_SUBJECTS[i], col = ICT12_COLORS[i] || "#e8000f", isTaken = taken.indexOf(sub.name) >= 0;
      var wts = DEPED_WEIGHTS[getSubjectType(sub.name)] || DEPED_WEIGHTS.core;
      var wtStr = 'WW '+Math.round(wts.ww*100)+'·PT '+Math.round(wts.pt*100)+'·QA '+Math.round(wts.qa*100);
      html += isTaken
        ? '<div class="add-subj-card add-subj-taken"><div class="asc-icon" style="background:'+col+'22;color:'+col+';">'+sub.code+'</div><div class="asc-name">'+sub.name+'</div><div class="asc-status taken">✓ Enrolled</div></div>'
        : '<div class="add-subj-card" onclick="selectSubject(\''+sub.name.replace(/'/g,"\\'")+'\','+i+')"><div class="asc-icon" style="background:'+col+'22;color:'+col+';">'+sub.code+'</div><div class="asc-name">'+sub.name+'</div><div class="asc-status" style="font-size:9px;color:rgba(251,191,36,.6);">'+wtStr+'%</div></div>';
    }
    html += '</div><div style="margin-bottom:8px;"><span class="sem-badge sem-badge-2">2nd Semester</span></div><div class="add-subj-grid">';
    for (var i2 = 0; i2 < ICT12_SEM2_SUBJECTS.length; i2++) {
      var sub2 = ICT12_SEM2_SUBJECTS[i2], col2 = ICT12_COLORS[i2 + 8] || "#10b981", isTaken2 = taken.indexOf(sub2.name) >= 0;
      var wts2 = DEPED_WEIGHTS[getSubjectType(sub2.name)] || DEPED_WEIGHTS.core;
      var wtStr2 = 'WW '+Math.round(wts2.ww*100)+'·PT '+Math.round(wts2.pt*100)+'·QA '+Math.round(wts2.qa*100);
      html += isTaken2
        ? '<div class="add-subj-card add-subj-taken"><div class="asc-icon" style="background:'+col2+'22;color:'+col2+';">'+sub2.code+'</div><div class="asc-name">'+sub2.name+'</div><div class="asc-status taken">✓ Enrolled</div></div>'
        : '<div class="add-subj-card" onclick="selectSubject(\''+sub2.name.replace(/'/g,"\\'")+'\','+(i2+8)+')"><div class="asc-icon" style="background:'+col2+'22;color:'+col2+';">'+sub2.code+'</div><div class="asc-name">'+sub2.name+'</div><div class="asc-status" style="font-size:9px;color:rgba(251,191,36,.6);">'+wtStr2+'%</div></div>';
    }
    html += '</div>';
  } else {
    html += '<div class="add-subj-title">📚 Select Subject</div><div class="add-subj-grid">';
    var _strandKey   = currentUser && currentUser.strand ? currentUser.strand.replace(/G1[12]-/,"").replace(/-[AB]$/,"") : "";
    var _strandSubjs = getSubjectsForFolder(_strandKey, "");
    var _strandCols  = getCrColorsForFolder(_strandKey, "");
    for (var j = 0; j < _strandSubjs.length; j++) {
      var sub3 = _strandSubjs[j], col3 = _strandCols[j] || "#e8000f", isTaken3 = taken.indexOf(sub3.name) >= 0;
      var wts3 = DEPED_WEIGHTS[getSubjectType(sub3.name)] || DEPED_WEIGHTS.core;
      var wtStr3 = 'WW '+Math.round(wts3.ww*100)+'·PT '+Math.round(wts3.pt*100)+'·QA '+Math.round(wts3.qa*100);
      html += isTaken3
        ? '<div class="add-subj-card add-subj-taken"><div class="asc-icon" style="background:'+col3+'22;color:'+col3+';">'+sub3.icon+'</div><div class="asc-name">'+sub3.name+'</div><div class="asc-status taken">✓ Enrolled</div></div>'
        : '<div class="add-subj-card" onclick="selectSubject(\''+sub3.name.replace(/'/g,"\\'")+'\','+j+')"><div class="asc-icon" style="background:'+col3+'22;color:'+col3+';">'+sub3.icon+'</div><div class="asc-name">'+sub3.name+'</div><div class="asc-status" style="font-size:9px;color:rgba(251,191,36,.6);">'+wtStr3+'%</div></div>';
    }
    html += '</div>';
  }
  html += '</div>';
  g("addSubjectContent").innerHTML = html;
}

function selectSubject(subj, idx) {
  selectedSubjectForAdd = subj;
  var allCols = ICT12_COLORS.concat(DB.crColors);
  var col     = allCols[idx % allCols.length] || "#e8000f";
  var html = '<div class="add-subj-step">' +
    '<button class="add-subj-back" onclick="renderAddSubjectStep1()">← Back</button>' +
    '<div class="add-subj-title" style="color:'+col+';">'+subj+'</div>' +
    '<div class="add-subj-subtitle">Select Teacher</div>' +
    '<div class="add-subj-teacher-list">';
  for (var i = 0; i < DB.teachers.length; i++) {
    var t = DB.teachers[i];
    html += '<div class="add-teacher-card" onclick="selectTeacherForSubject(\''+t.id+'\',this)">' +
      '<div class="atc-avatar">👩‍🏫</div>' +
      '<div class="atc-info"><div class="atc-name">' + t.name + '</div><div class="atc-email">' + t.emailUser + '@asiasourceicollege.edu.ph</div></div>' +
      '<div class="atc-select-ring" id="atcRing_'+t.id+'"></div>' +
    '</div>';
  }
  html += '</div>' +
    '<button class="btn-red" id="addSubjSubmitBtn" style="margin-top:16px;opacity:.45;cursor:not-allowed;" disabled onclick="submitSubjectRequest()">Send Request to Teacher</button>' +
    '</div>';
  g("addSubjectContent").innerHTML = html;
}
function selectTeacherForSubject(tid, el) {
  selectedTeacherForAdd = tid;
  document.querySelectorAll(".add-teacher-card").forEach(function(c) { c.classList.remove("selected"); });
  el.classList.add("selected");
  var btn = g("addSubjSubmitBtn");
  if (btn) { btn.disabled = false; btn.style.opacity = "1"; btn.style.cursor = "pointer"; }
}
function submitSubjectRequest() {
  if (!selectedSubjectForAdd || !selectedTeacherForAdd) return;
  var teacher = null;
  for (var i = 0; i < DB.teachers.length; i++) { if (DB.teachers[i].id === selectedTeacherForAdd) { teacher = DB.teachers[i]; break; } }
  if (!teacher) return;
  var invitesList = loadInvites();
  for (var j = 0; j < invitesList.length; j++) {
    if (invitesList[j].studentId === currentUser.id && invitesList[j].subjectName === selectedSubjectForAdd && invitesList[j].status === "pending") {
      showToast("⚠️ You already have a pending request for " + selectedSubjectForAdd, "warning");
      closeAddSubjectModal();
      return;
    }
  }
  var invite = {
    id: "INV-" + Date.now(), studentId:currentUser.id, studentName:currentUser.name, studentEmail:currentUser.emailUser,
    subjectName:selectedSubjectForAdd, teacherId:teacher.id, teacherEmail:teacher.emailUser, teacherName:teacher.name,
    status:"pending", timestamp:new Date().toISOString()
  };
  invitesList.push(invite);
  saveInvites(invitesList);
  addNotifForTeacher(teacher.id, {
    type:"subject_request", inviteId:invite.id, studentName:currentUser.name,
    studentEmail:currentUser.emailUser, studentId:currentUser.id,
    subjectName:selectedSubjectForAdd, message:currentUser.name+" requested to enroll in "+selectedSubjectForAdd
  });
  closeAddSubjectModal();
  showPendingOverlay(selectedSubjectForAdd, teacher.name);
  setTimeout(function() { loadStudentDash(currentUser); }, 1000);
}
function showPendingOverlay(subj, teacherName) {
  var el = document.createElement("div");
  el.innerHTML = '<div class="pending-overlay-inner"><div class="pending-check-anim">✅</div><div class="pending-title">Request Sent!</div><div class="pending-msg">Please wait for approval from<br><strong>'+teacherName+'</strong></div><div class="pending-subj">'+subj+'</div></div>';
  el.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.85);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;";
  document.body.appendChild(el);
  setTimeout(function() { el.style.opacity = "0"; el.style.transition = "opacity .5s"; }, 2500);
  setTimeout(function() { if (el.parentNode) el.remove(); }, 3000);
}

/* ── TEACHER DASHBOARD ── */
function loadTeacherDash(tch) {
  g("tchName").textContent         = tch.name;
  g("tchProfileName").textContent  = tch.name;
  g("tchProfileEmail").textContent = (tch.email || tch.emailUser) + "@asiasourceicollege.edu.ph";
  currentSubject = DB.crSubjects[0];
  updateTeacherNotifBadge();
  openFolderByStrand("HUMSS","G11");
}
function updateTeacherNotifBadge() {
  var count = getUnreadTeacherNotifCount(currentUser.id);
  var badge = g("tchNotifBadge");
  if (badge) { badge.textContent = count > 0 ? count : ""; badge.style.display = count > 0 ? "flex" : "none"; }
}
function openTeacherNotifPanel() {
  var notifs = getTeacherNotifs(currentUser.id);
  var html   = "";
  if (!notifs.length) {
    html = '<div class="notif-empty">📭 No notifications yet</div>';
  } else {
    notifs.forEach(function(n) {
      if (n.type !== "subject_request") return;
      markTeacherNotifRead(currentUser.id, n.id);
      var allInvites = loadInvites(), inv = null;
      for (var i = 0; i < allInvites.length; i++) { if (allInvites[i].id === n.inviteId) { inv = allInvites[i]; break; } }
      var status  = inv ? inv.status : "pending";
      var stuInfo = findStudentById(n.studentId);
      var strandHtml = "";
      if (stuInfo && stuInfo.strand) {
        var gl    = getGradeLevelShort(stuInfo.strand);
        var sn    = getStrandName(stuInfo.strand);
        var sec   = getSectionLetter(stuInfo.strand);
        var isG11 = stuInfo.strand.indexOf("G11") >= 0;
        var glCol = isG11 ? "#0ea5e9" : "#10b981";
        strandHtml = '<div style="margin-bottom:8px;"><span class="gl-badge" style="background:'+glCol+'22;border-color:'+glCol+'55;color:'+glCol+';">'+gl+'</span><span style="margin-left:6px;font-size:11px;color:var(--text-muted);">'+sn+(sec?" - "+sec:"")+'</span></div>';
      }
      var actionsHtml = status === "pending"
        ? '<div class="notif-actions"><button class="notif-approve" onclick="respondToInvite(\''+n.inviteId+'\',\'approved\',\''+n.id+'\')">✅ Approve</button><button class="notif-reject" onclick="respondToInvite(\''+n.inviteId+'\',\'rejected\',\''+n.id+'\')">✕ Decline</button></div>'
        : '<div class="notif-status '+(status==="approved"?"notif-status-ok":"notif-status-no")+'">'+(status==="approved"?"✅ Approved":"✕ Declined")+'</div>';
      html += '<div class="notif-item'+(n.read?"":" notif-unread")+'">' +
        '<div class="notif-avatar">🎓</div>' +
        '<div class="notif-body">' +
          '<div class="notif-title">Subject Enrollment Request</div>' +
          '<div class="notif-msg"><strong>'+n.studentName+'</strong> wants to enroll in <strong>'+n.subjectName+'</strong></div>' +
          '<div class="notif-email">'+n.studentEmail+'@asiasourceicollege.edu.ph</div>' +
          strandHtml + actionsHtml +
        '</div>' +
      '</div>';
    });
  }
  var panel = g("teacherNotifPanel");
  if (panel) { panel.innerHTML = html; panel.classList.toggle("hidden"); }
  updateTeacherNotifBadge();
}
function respondToInvite(inviteId, decision, notifId) {
  var invitesList = loadInvites(), inv = null;
  for (var i = 0; i < invitesList.length; i++) {
    if (invitesList[i].id === inviteId) { inv = invitesList[i]; invitesList[i].status = decision; break; }
  }
  saveInvites(invitesList);
  if (inv && decision === "approved") {
    var stu = findStudentById(inv.studentId);
    if (stu) {
      ensureStudentGrades(stu);
      if (!stu.approvedSubjects) stu.approvedSubjects = [];
      if (stu.approvedSubjects.indexOf(inv.subjectName) < 0) stu.approvedSubjects.push(inv.subjectName);
      addStudentToStaticRoster(stu);
      saveDB();
      showToast("✅ " + inv.studentName + " approved for " + inv.subjectName + " — added to gradebook!", "success");
    }
  } else {
    showToast("✕ Declined request for " + (inv ? inv.subjectName : ""), "warning");
  }
  openTeacherNotifPanel();
  updateTeacherNotifBadge();
  if      (currentView === "gradebook")   renderGradebook(currentFolder, currentSection);
  else if (currentView === "classrecord") renderClassRecord(currentFolder, currentSection);
  else                                    renderAttendance(currentFolder, currentSection);
}

/* ── ADD STUDENT MODAL (Teacher) ── */
function openAddStudentModal()  { renderAddStudentModal(); g("addStudentModal").classList.remove("hidden"); document.body.style.overflow = "hidden"; }
function closeAddStudentModal() { g("addStudentModal").classList.add("hidden"); document.body.style.overflow = ""; }
function renderAddStudentModal() {
  var html = '<div class="add-stu-modal">' +
    '<div style="font-family:Cormorant Garamond,serif;font-size:18px;font-weight:600;color:var(--text-primary);margin-bottom:6px;">➕ Add Student to Gradebook</div>' +
    '<div style="font-size:12px;color:var(--text-muted);margin-bottom:14px;">Search for a student by name or email</div>' +
    '<input class="plain-input" type="text" id="addStuSearch" placeholder="Search student name or email..." oninput="renderAddStudentList()" style="margin-bottom:12px;">' +
    '<div id="addStuList"></div>' +
  '</div>';
  g("addStudentContent").innerHTML = html;
  renderAddStudentList();
}
function renderAddStudentList() {
  var searchEl = g("addStuSearch");
  var q        = searchEl ? searchEl.value.trim().toLowerCase() : "";
  var list     = g("addStuList");
  if (!list) return;
  var html = "", shown = 0;
  for (var i = 0; i < DB.students.length; i++) {
    var stu = DB.students[i];
    if (q && stu.name.toLowerCase().indexOf(q) < 0 && stu.emailUser.toLowerCase().indexOf(q) < 0) continue;
    shown++;
    var glShort = getGradeLevelShort(stu.strand);
    var sn      = getStrandName(stu.strand);
    var sec     = getSectionLetter(stu.strand);
    var isG11   = stu.strand && stu.strand.indexOf("G11") >= 0;
    var glColor = isG11 ? "#0ea5e9" : "#10b981";
    var strandLabel = DB.strandFull[stu.strand] || stu.strand || "Unknown";
    html += '<div style="display:flex;align-items:center;gap:12px;padding:12px 14px;background:rgba(255,255,255,.03);border:1px solid var(--border-subtle);border-radius:12px;margin-bottom:8px;">' +
      '<div style="font-size:24px;">🎓</div>' +
      '<div style="flex:1;min-width:0;">' +
        '<div style="font-size:13px;font-weight:700;color:var(--text-primary);">'+stu.name+
          '<span class="gl-badge" style="margin-left:8px;background:'+glColor+'22;border-color:'+glColor+'55;color:'+glColor+';">'+glShort+'</span>' +
          (sn?'<span style="margin-left:4px;font-size:10px;color:var(--text-muted);">'+sn+(sec?' · '+sec:'')+'</span>':'') +
        '</div>' +
        '<div style="font-size:11px;color:var(--text-muted);">'+stu.emailUser+'@asiasourceicollege.edu.ph</div>' +
        '<div style="font-size:10px;color:var(--text-dim);margin-top:2px;">'+strandLabel+'</div>' +
      '</div>' +
      '<button style="padding:7px 16px;background:linear-gradient(135deg,var(--cr-500),var(--cr-700));color:#fff;border:none;border-radius:10px;font-family:DM Sans,sans-serif;font-size:12px;font-weight:700;cursor:pointer;" onclick="addStudentToGradebook(\''+stu.id+'\')">+ Add</button>' +
    '</div>';
  }
  if (!shown) html = '<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:13px;">No students found.</div>';
  list.innerHTML = html;
}
function addStudentToGradebook(stuId) {
  var stu = findStudentById(stuId);
  if (!stu) { showToast("Student not found.", "error"); return; }
  var isIct12Stu        = stu.strand && stu.strand.indexOf("G12") >= 0 && stu.strand.indexOf("ICT") >= 0;
  var _stuStrand        = (stu.strand||"").replace(/G1[12]-/,"").replace(/-[AB]$/,"");
  var subjectsToApprove = isIct12Stu ? ICT12_SUBJECT_NAMES : getCrSubjectsForFolder(_stuStrand, "");
  var invitesList       = loadInvites();
  subjectsToApprove.forEach(function(subj) {
    var exists = false;
    for (var j = 0; j < invitesList.length; j++) {
      if (invitesList[j].studentId === stuId && invitesList[j].subjectName === subj && invitesList[j].status === "approved") { exists = true; break; }
    }
    if (!exists) {
      invitesList.push({
        id:"INV-TCH-"+Date.now()+"-"+Math.random().toString(36).slice(2),
        studentId:stuId, studentName:stu.name, studentEmail:stu.emailUser,
        subjectName:subj, teacherId:currentUser.id, teacherEmail:currentUser.emailUser, teacherName:currentUser.name,
        status:"approved", timestamp:new Date().toISOString(), addedByTeacher:true
      });
    }
  });
  saveInvites(invitesList);
  if (!stu.approvedSubjects) stu.approvedSubjects = [];
  subjectsToApprove.forEach(function(s) { if (stu.approvedSubjects.indexOf(s) < 0) stu.approvedSubjects.push(s); });
  ensureStudentGrades(stu);
  addStudentToStaticRoster(stu);
  saveDB();
  showToast("✅ " + stu.name + " added to gradebook!", "success");
  closeAddStudentModal();
  if      (currentView === "gradebook")   renderGradebook(currentFolder, currentSection);
  else if (currentView === "classrecord") renderClassRecord(currentFolder, currentSection);
  else                                    renderAttendance(currentFolder, currentSection);
}

/* ── FOLDER / VIEW SWITCHING ── */
function openFolder(el) {
  var strand = el.getAttribute("data-strand");
  var grade  = el.getAttribute("data-grade") || "G11";
  document.querySelectorAll(".strand-item").forEach(function(it) { it.className = "strand-item"; });
  el.className = "strand-item active";
  openFolderByStrand(strand, grade);
}
function openFolderByStrand(strand, grade) {
  grade              = grade || "G11";
  currentFolder      = strand;
  currentGradeLevel  = grade;
  currentSection     = "A";
  currentView        = "gradebook";
  currentQuarter     = "q1";
  currentSemFilter   = 0;
  var crSubjs        = getCrSubjectsForFolder(strand, grade);
  currentGbSubject   = crSubjs[0];
  currentSubject     = crSubjs[0];
  gbSearchQuery      = "";

  var singleSection  = (strand === "ICT" || strand === "ABM");
  var isG11          = (grade === "G11");
  var glColor        = isG11 ? "#0ea5e9" : "#10b981";

  g("folderTitle").innerHTML =
    '<span style="background:'+glColor+'22;border:1px solid '+glColor+'55;color:'+glColor+';border-radius:20px;padding:2px 10px;font-size:11px;font-weight:800;margin-right:8px;">'+grade+'</span>' +
    (DB.strandLabels[strand] || strand) + " — Student List";

  var secTabsWrap = g("secTabsWrap");
  if (secTabsWrap) secTabsWrap.style.display = singleSection ? "none" : "";

  var stabs = document.querySelectorAll(".stab");
  if (stabs[0]) stabs[0].className = "stab active";
  if (stabs[1]) stabs[1].className = "stab";
  document.querySelectorAll(".vtab").forEach(function(vt) { vt.className = "vtab"; });
  g("vtabGradebook").className = "vtab active";

  showView("gradebook");
  renderGradebook(strand, "A");
}
function switchSection(sec, btn) {
  currentSection = sec;
  gbSearchQuery  = "";
  document.querySelectorAll(".stab").forEach(function(t) { t.className = "stab"; });
  btn.className  = "stab active";
  if      (currentView === "gradebook")   renderGradebook(currentFolder, sec);
  else if (currentView === "classrecord") renderClassRecord(currentFolder, sec);
  else                                    renderAttendance(currentFolder, sec);
}
function setView(view, btn) {
  currentView = view;
  document.querySelectorAll(".vtab").forEach(function(vt) { vt.className = "vtab"; });
  btn.className = "vtab active";
  showView(view);
  if      (view === "gradebook")   renderGradebook(currentFolder, currentSection);
  else if (view === "classrecord") renderClassRecord(currentFolder, currentSection);
  else                             renderAttendance(currentFolder, currentSection);
}
function showView(view) {
  hideEl("viewGradebook"); hideEl("viewClassRecord"); hideEl("viewAttendance");
  if      (view === "gradebook")   showEl("viewGradebook");
  else if (view === "classrecord") showEl("viewClassRecord");
  else                             showEl("viewAttendance");
}

/* ══════════════════════════════════════════════════════════════
   GRADEBOOK — DepEd WW / PT / QA with CUSTOMIZABLE counts
   Teacher can set: # of WW items, # of PT items, QA total,
                    # of Quizzes (added to WW), # of Activities (added to PT)
   ══════════════════════════════════════════════════════════════ */

function setGbQuarter(q, btn) {
  currentQuarter = q;
  document.querySelectorAll(".qtr-btn").forEach(function(b) { b.className = "qtr-btn"; });
  btn.className  = "qtr-btn active";
  renderGradebook(currentFolder, currentSection);
}
function setGbSubject(subj)  { currentGbSubject = subj; gbSearchQuery = ""; renderGradebook(currentFolder, currentSection); }
function handleGbSearch(val) { gbSearchQuery = val.toLowerCase().trim(); _renderGbRows(currentFolder + "-" + currentSection); }
function setSemFilter(sem)   { currentSemFilter = sem; currentGbSubject = null; renderGradebook(currentFolder, currentSection); }

/* Open subject config panel */
function openSubjectConfigPanel(classKey, subj, qtr) {
  var cfg = getSubjectConfig(classKey, subj, qtr);
  var overlay = document.createElement("div");
  overlay.id  = "subjConfigOverlay";
  overlay.style.cssText = "position:fixed;inset:0;z-index:8000;background:rgba(0,0,0,.8);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;";
  overlay.innerHTML =
    '<div style="background:linear-gradient(158deg,#0d0222,#120214);border:1px solid rgba(251,191,36,.25);border-radius:22px;padding:28px 32px;width:440px;max-width:96vw;box-shadow:0 40px 100px rgba(0,0,0,.9);">' +
      '<div style="font-family:Cormorant Garamond,serif;font-size:18px;font-weight:600;color:#fff;margin-bottom:4px;">⚙️ Configure Scores</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,.4);margin-bottom:20px;">'+subj+' — '+qtr.toUpperCase()+'</div>' +

      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">' +
        _cfgField("📝 Written Work (WW) Items","wwCount",cfg.wwCount,"Number of WW test items") +
        _cfgField("🎯 Performance Task (PT) Items","ptCount",cfg.ptCount,"Number of PT items") +
        _cfgField("📋 QA Highest Score","qaTotal",cfg.qaTotal,"Max score for quarterly exam") +
        _cfgField("🔍 Quiz Items (within WW)","quizCount",cfg.quizCount,"Quizzes counted in WW") +
        _cfgField("🏃 Activity Items (within PT)","actCount",cfg.actCount,"Activities counted in PT") +
      '</div>' +

      '<div style="font-size:10px;color:rgba(251,191,36,.4);margin-bottom:16px;padding:10px 12px;background:rgba(251,191,36,.04);border:1px dashed rgba(251,191,36,.15);border-radius:10px;">' +
        '⚠️ Quizzes are scored under WW. Activities are scored under PT. They share the same highest-possible-score input per item.' +
      '</div>' +

      '<div style="display:flex;gap:10px;">' +
        '<button onclick="applySubjectConfig(\''+classKey.replace(/'/g,"\\'")+'\',\''+subj.replace(/'/g,"\\'")+'\',\''+qtr+'\')" style="flex:1;padding:12px;background:linear-gradient(135deg,var(--cr-500),var(--cr-700));color:#fff;border:none;border-radius:12px;font-size:13px;font-weight:700;cursor:pointer;">✅ Apply</button>' +
        '<button onclick="document.getElementById(\'subjConfigOverlay\').remove()" style="flex:0 0 auto;padding:12px 18px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.6);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;">Cancel</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(overlay);
}
function _cfgField(label, field, value, hint) {
  return '<div style="background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:12px;">' +
    '<div style="font-size:10px;font-weight:700;color:var(--au-300);margin-bottom:6px;">'+label+'</div>' +
    '<input id="cfgInput_'+field+'" type="number" min="1" max="20" value="'+value+'" style="width:100%;padding:8px 10px;background:rgba(0,0,0,.4);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;font-size:14px;font-weight:700;text-align:center;outline:none;" title="'+hint+'">' +
  '</div>';
}
function applySubjectConfig(classKey, subj, qtr) {
  var fields = ["wwCount","ptCount","qaTotal","quizCount","actCount"];
  fields.forEach(function(f) {
    var el = g("cfgInput_" + f);
    if (el) setSubjectConfig(classKey, subj, qtr, f, el.value);
  });
  var overlay = g("subjConfigOverlay");
  if (overlay) overlay.remove();
  showToast("✅ Score configuration applied!", "success");
  renderGradebook(currentFolder, currentSection);
}

function renderGradebook(strand, section) {
  var key     = strand + "-" + section;
  var crSubjs = getCrSubjectsForFolder(strand, currentGradeLevel);
  var crCols  = getCrColorsForFolder(strand, currentGradeLevel);
  var isIct   = isIct12(strand, currentGradeLevel);
  var filteredSubjs = crSubjs, filteredCols = crCols;
  if (isIct && currentSemFilter > 0) {
    filteredSubjs = []; filteredCols = [];
    for (var fi = 0; fi < ICT12_ALL_SUBJECTS.length; fi++) {
      if (ICT12_ALL_SUBJECTS[fi].sem === currentSemFilter) {
        filteredSubjs.push(ICT12_ALL_SUBJECTS[fi].name);
        filteredCols.push(ICT12_COLORS[fi]);
      }
    }
  }
  if (!currentGbSubject || filteredSubjs.indexOf(currentGbSubject) < 0) currentGbSubject = filteredSubjs[0] || crSubjs[0];
  var qtrs = currentSemFilter===1 ? ["q1","q2"] : currentSemFilter===2 ? ["q3","q4"] : ["q1","q2","q3","q4"];
  if (qtrs.indexOf(currentQuarter) < 0) currentQuarter = qtrs[0];

  var cfg      = getSubjectConfig(key, currentGbSubject, currentQuarter);
  var wts      = getWeights(currentGbSubject);
  var subjType = getSubjectType(currentGbSubject);
  var typeColors = { core:"#38bdf8", applied:"#34d399", special:"#f59e0b", tvl:"#a78bfa", tvl_special:"#ec4899" };
  var typeColor  = typeColors[subjType] || "#38bdf8";

  var toolbar = g("gbToolbar");
  if (toolbar) {
    var pillsHtml = "";
    for (var si = 0; si < filteredSubjs.length; si++) {
      var s       = filteredSubjs[si];
      var col     = filteredCols[si % filteredCols.length];
      var isAct   = (currentGbSubject === s);
      var semMark = "";
      if (isIct) {
        for (var ix = 0; ix < ICT12_ALL_SUBJECTS.length; ix++) {
          if (ICT12_ALL_SUBJECTS[ix].name === s) { semMark = '<span style="font-size:8px;opacity:.7;display:block;">[S'+ICT12_ALL_SUBJECTS[ix].sem+']</span>'; break; }
        }
      }
      pillsHtml += '<button class="subj-btn'+(isAct?" active":"")+'" data-subj="'+s+'"' +
        ' style="'+(isAct?"background:"+col+";border-color:"+col+";color:#fff;":"border-color:"+col+";color:"+col+";")+'"' +
        " onclick=\"setGbSubject(this.getAttribute('data-subj'))\">" +
        semMark + s + '</button>';
    }
    var semFilterHtml = "";
    if (isIct) {
      semFilterHtml = '<div class="sem-filter-row" style="margin-bottom:8px;">' +
        '<span class="toolbar-lbl" style="margin-right:6px;">Semester:</span>' +
        '<button class="sem-filter-btn'+(currentSemFilter===0?" active":"")+'" onclick="setSemFilter(0)">All</button>' +
        '<button class="sem-filter-btn'+(currentSemFilter===1?" active":"")+'" onclick="setSemFilter(1)">1st Semester</button>' +
        '<button class="sem-filter-btn'+(currentSemFilter===2?" active":"")+'" onclick="setSemFilter(2)">2nd Semester</button>' +
      '</div>';
    }

    var weightBar =
      '<div style="display:flex;align-items:center;gap:10px;padding:8px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;margin-bottom:10px;flex-wrap:wrap;">' +
        '<span style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:'+typeColor+';opacity:.7;">📋 DepEd Weights · '+subjType.toUpperCase()+'</span>' +
        '<span style="font-size:11px;font-weight:800;color:var(--ww);">WW '+Math.round(wts.ww*100)+'%</span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="font-size:11px;font-weight:800;color:var(--pt);">PT '+Math.round(wts.pt*100)+'%</span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="font-size:11px;font-weight:800;color:var(--qa);">QA '+Math.round(wts.qa*100)+'%</span>' +
        '<span style="margin-left:4px;font-size:9px;color:rgba(255,255,255,.3);">· Transmuted via DepEd Table 5</span>' +
        '<button onclick="openSubjectConfigPanel(\''+key.replace(/'/g,"\\'")+'\',\''+currentGbSubject.replace(/'/g,"\\'")+'\',\''+currentQuarter+'\')" style="margin-left:auto;padding:5px 14px;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);color:var(--au-300);border-radius:22px;font-size:11px;font-weight:700;cursor:pointer;transition:all .2s;">⚙️ Configure Scores</button>' +
      '</div>' +
      '<div style="display:flex;gap:8px;font-size:11px;padding:7px 12px;background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.06);border-radius:10px;margin-bottom:8px;flex-wrap:wrap;">' +
        '<span style="color:var(--ww);">📝 WW items: <b>'+cfg.wwCount+'</b></span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="color:var(--pt);">🎯 PT items: <b>'+cfg.ptCount+'</b></span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="color:var(--qa);">📋 QA max: <b>'+cfg.qaTotal+'</b></span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="color:#a78bfa;">🔍 Quizzes: <b>'+cfg.quizCount+'</b></span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="color:#f59e0b;">🏃 Activities: <b>'+cfg.actCount+'</b></span>' +
      '</div>';

    toolbar.innerHTML =
      semFilterHtml +
      '<div style="margin-bottom:10px;"><span class="toolbar-lbl">Subject:</span><div class="subj-pills" style="display:inline-flex;flex-wrap:wrap;gap:6px;margin-left:8px;">'+pillsHtml+'</div></div>' +
      weightBar +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">' +
        '<span class="toolbar-lbl">Quarter:</span>' +
        '<div class="qtr-tabs">' +
          qtrs.map(function(q) { return '<button class="qtr-btn'+(currentQuarter===q?" active":"")+'" onclick="setGbQuarter(\''+q+'\',this)">'+q.toUpperCase()+'</button>'; }).join("") +
        '</div>' +
        '<div style="position:relative;">' +
          '<span style="position:absolute;left:11px;top:50%;transform:translateY(-50%);font-size:14px;opacity:.5;">🔍</span>' +
          '<input class="gb-search-input plain-input" type="text" placeholder="Search student..." value="'+gbSearchQuery+'" oninput="handleGbSearch(this.value)" style="padding-left:34px;width:200px;">' +
          (gbSearchQuery ? '<button style="position:absolute;right:8px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--text-muted);font-size:14px;cursor:pointer;" onclick="handleGbSearch(\'\');document.querySelector(\'.gb-search-input\').value=\'\'">✕</button>' : "") +
        '</div>' +
        '<button class="save-qtr-btn" onclick="saveQuarterGrades(\''+key+'\')">💾 Save '+currentQuarter.toUpperCase()+' — '+currentGbSubject+'</button>' +
      '</div>';
  }

  /* Build dynamic table head based on config */
  var thead = g("gbThead");
  if (thead) {
    /* Collect all columns */
    var wwCols  = []; for (var wi = 0; wi < cfg.wwCount;   wi++) wwCols.push("WW"+(wi+1));
    var qzCols  = []; for (var qi = 0; qi < cfg.quizCount; qi++) qzCols.push("Quiz"+(qi+1));
    var ptCols  = []; for (var pi = 0; pi < cfg.ptCount;   pi++) ptCols.push("PT"+(pi+1));
    var acCols  = []; for (var ai = 0; ai < cfg.actCount;  ai++) acCols.push("Act"+(ai+1));
    var allWW   = wwCols.concat(qzCols);   /* WW + Quizzes */
    var allPT   = ptCols.concat(acCols);   /* PT + Activities */
    var totalCols = 2 + allWW.length + allPT.length + 1 + 2 + 1; /* #, Name, WW*, PT*, QA, Initial, Transmuted, Remarks */

    var row1 = '<tr>' +
      '<th style="min-width:36px;">#</th>' +
      '<th style="text-align:left;min-width:180px;">STUDENT NAME</th>' +
      '<th class="th-ww" colspan="'+allWW.length+'" style="text-align:center;">📝 WRITTEN WORK + QUIZZES — '+Math.round(wts.ww*100)+'%<div style="font-size:9px;font-weight:400;opacity:.7;">'+allWW.length+' items (WW: '+cfg.wwCount+' / Quiz: '+cfg.quizCount+')</div></th>' +
      '<th class="th-pt" colspan="'+allPT.length+'" style="text-align:center;">🎯 PERFORMANCE TASKS + ACTIVITIES — '+Math.round(wts.pt*100)+'%<div style="font-size:9px;font-weight:400;opacity:.7;">'+allPT.length+' items (PT: '+cfg.ptCount+' / Act: '+cfg.actCount+')</div></th>' +
      '<th class="th-qa" style="text-align:center;">📋 QA — '+Math.round(wts.qa*100)+'%<div style="font-size:9px;font-weight:400;opacity:.7;">Out of '+cfg.qaTotal+'</div></th>' +
      '<th class="th-grade" style="text-align:center;">INITIAL</th>' +
      '<th class="th-grade" style="text-align:center;background:rgba(224,0,18,0.12)!important;">TRANSMUTED<div style="font-size:9px;opacity:.7;">DepEd Table</div></th>' +
      '<th style="min-width:100px;text-align:center;">REMARKS</th>' +
    '</tr>';

    var row2 = '<tr><th></th><th></th>';
    allWW.forEach(function(lbl, li) {
      row2 += '<th class="th-ww" style="font-size:9px;' + (li >= cfg.wwCount ? "background:rgba(167,139,250,.15) !important;color:#a78bfa !important;" : "") + '">' + lbl + '</th>';
    });
    allPT.forEach(function(lbl, li) {
      row2 += '<th class="th-pt" style="font-size:9px;' + (li >= cfg.ptCount ? "background:rgba(245,158,11,.15) !important;color:#f59e0b !important;" : "") + '">' + lbl + '</th>';
    });
    row2 += '<th class="th-qa" style="font-size:9px;">Score</th><th class="th-grade" style="font-size:9px;">Grade</th><th style="font-size:9px;background:rgba(224,0,18,0.12);">Grade</th><th style="font-size:9px;"></th></tr>';

    /* Highest Possible Score row */
    var row3 = '<tr style="background:rgba(255,255,255,.03);">' +
      '<td colspan="2" style="font-size:9.5px;font-weight:800;color:var(--au-300);padding:5px 12px;text-align:right;">Highest Possible / item →</td>' +
      '<td class="th-ww" colspan="'+allWW.length+'" style="text-align:center;">' +
        '<input class="score-input" type="number" min="1" max="1000" placeholder="e.g. 50"' +
        ' id="wwTotalInput_'+key+'" value="'+getMaxScoreForSubj(key, currentGbSubject, currentQuarter, "ww_total", 50)+'"' +
        ' onchange="setSubjMaxScore(\''+key+'\',\''+currentGbSubject+'\',\''+currentQuarter+'\',\'ww_total\',this.value)"' +
        ' style="width:72px;font-size:11px;" title="Highest possible score per WW/Quiz item">' +
        '<span style="font-size:9px;color:rgba(255,255,255,.3);"> /item</span>' +
      '</td>' +
      '<td class="th-pt" colspan="'+allPT.length+'" style="text-align:center;">' +
        '<input class="score-input" type="number" min="1" max="1000" placeholder="e.g. 50"' +
        ' id="ptTotalInput_'+key+'" value="'+getMaxScoreForSubj(key, currentGbSubject, currentQuarter, "pt_total", 50)+'"' +
        ' onchange="setSubjMaxScore(\''+key+'\',\''+currentGbSubject+'\',\''+currentQuarter+'\',\'pt_total\',this.value)"' +
        ' style="width:72px;font-size:11px;" title="Highest possible score per PT/Activity item">' +
        '<span style="font-size:9px;color:rgba(255,255,255,.3);"> /item</span>' +
      '</td>' +
      '<td class="th-qa" style="text-align:center;font-size:10px;color:var(--qa);">/ '+cfg.qaTotal+'</td>' +
      '<td></td><td></td><td></td>' +
    '</tr>';

    thead.innerHTML = row1 + row2 + row3;
  }
  _renderGbRows(key);
}

function getMaxScoreForSubj(classKey, subj, qtr, field, defaultVal) {
  if (!scoreStore) return defaultVal;
  for (var sk in scoreStore) {
    if (sk.indexOf(classKey) === 0) {
      if (scoreStore[sk][subj] && scoreStore[sk][subj][qtr] && scoreStore[sk][subj][qtr][field] !== undefined) {
        return scoreStore[sk][subj][qtr][field];
      }
    }
  }
  return defaultVal;
}
function setSubjMaxScore(classKey, subj, qtr, field, val) {
  var r = getDynamicRoster(classKey, currentGradeLevel);
  function applyToEntries(entries, genderLabel) {
    for (var i = 0; i < entries.length; i++) {
      var sk = getScoreStoreKey(classKey, genderLabel, i);
      setDepEdScore(sk, subj, qtr, field, 0, Number(val));
    }
  }
  applyToEntries(r.male,   "male");
  applyToEntries(r.female, "female");
  saveGrades();
  _recomputeAllGbRows(classKey);
}

function _computeInitial(sc, subj, classKey, qtr) {
  subj     = subj     || currentGbSubject;
  classKey = classKey || (currentFolder + "-" + currentSection);
  qtr      = qtr      || currentQuarter;
  var cfg  = getSubjectConfig(classKey, subj, qtr);

  function validNums(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.filter(function(v) {
      return v !== "" && v !== null && v !== undefined && !isNaN(Number(v));
    }).map(Number);
  }

  /* WW = ww scores + quiz scores (same highest-possible) */
  var allWWRaw = (sc.ww || []).slice(0, cfg.wwCount).concat((sc.quiz || []).slice(0, cfg.quizCount));
  /* PT = pt scores + activity scores (same highest-possible) */
  var allPTRaw = (sc.pt || []).slice(0, cfg.ptCount).concat((sc.act || []).slice(0, cfg.actCount));

  var wwVals = validNums(allWWRaw);
  var ptVals = validNums(allPTRaw);
  var hasQA  = (sc.qa !== "" && sc.qa !== null && sc.qa !== undefined && !isNaN(Number(sc.qa)));

  if (!wwVals.length && !ptVals.length && !hasQA) return null;

  var weights = getWeights(subj);
  var wwTotal = Number(sc.ww_total) || 50;
  var ptTotal = Number(sc.pt_total) || 50;
  var qaTotal = Number(sc.qa_total) || cfg.qaTotal || 100;

  function pctScore(vals, highestPerItem) {
    if (!vals.length || !highestPerItem) return null;
    var sum     = vals.reduce(function(a, b) { return a + b; }, 0);
    var highest = highestPerItem * vals.length;
    return (sum / highest) * 100;
  }

  var wwPS = pctScore(wwVals, wwTotal);
  var ptPS = pctScore(ptVals, ptTotal);
  var qaPS = hasQA ? (Number(sc.qa) / qaTotal) * 100 : null;

  var totalWeight = 0, weightedSum = 0;
  if (wwPS !== null) { weightedSum += wwPS * weights.ww; totalWeight += weights.ww; }
  if (ptPS !== null) { weightedSum += ptPS * weights.pt; totalWeight += weights.pt; }
  if (qaPS !== null) { weightedSum += qaPS * weights.qa; totalWeight += weights.qa; }

  if (!totalWeight) return null;
  return weightedSum / totalWeight;
}

function _recomputeAllGbRows(classKey) {
  var r = getDynamicRoster(classKey, currentGradeLevel);
  function recompute(entries, genderLabel) {
    for (var i = 0; i < entries.length; i++) {
      var sk  = getScoreStoreKey(classKey, genderLabel, i);
      var sc  = getDepEdScores(sk, currentGbSubject, currentQuarter);
      var ig  = _computeInitial(sc, currentGbSubject, classKey, currentQuarter);
      var tg  = ig !== null ? transmute(ig) : null;
      var fgEl  = g("fg-"  + sk + "-" + currentGbSubject + "-" + currentQuarter);
      var tgEl  = g("tg-"  + sk + "-" + currentGbSubject + "-" + currentQuarter);
      var remEl = g("rem-" + sk + "-" + currentGbSubject + "-" + currentQuarter);
      if (fgEl)  fgEl.innerHTML  = (ig !== null) ? ig.toFixed(1) : "—";
      if (tgEl)  tgEl.innerHTML  = (tg !== null) ? '<span class="grade-cell '+badgeClass(tg)+'">'+tg+'</span>' : "—";
      if (remEl) { remEl.textContent = getRemarks(tg); remEl.style.color = gradeColor(tg); }
    }
  }
  recompute(r.male,   "male");
  recompute(r.female, "female");
}

function _renderGbRows(key) {
  var cfg   = getSubjectConfig(key, currentGbSubject, currentQuarter);
  var r     = getDynamicRoster(key, currentGradeLevel);
  var tbody = g("gbBody");
  tbody.innerHTML = "";
  var q     = gbSearchQuery;

  var wwCount  = cfg.wwCount;
  var qzCount  = cfg.quizCount;
  var ptCount  = cfg.ptCount;
  var acCount  = cfg.actCount;
  var allWWLen = wwCount + qzCount;
  var allPTLen = ptCount + acCount;

  function matchSearch(name) { return !q || name.toLowerCase().indexOf(q) >= 0; }

  function makeInput(field, idx, val, sk, isQuiz, isAct) {
    var extraStyle = isQuiz ? "border-color:rgba(167,139,250,.5);background:rgba(167,139,250,.08);" :
                    isAct  ? "border-color:rgba(245,158,11,.5);background:rgba(245,158,11,.08);" : "";
    return '<input class="score-input deped-score-input" type="number" min="0" step="any" value="'+val+'" placeholder="—"' +
      ' data-sk="'+sk+'" data-subj="'+currentGbSubject+'" data-qtr="'+currentQuarter+'" data-field="'+field+'" data-idx="'+idx+'"' +
      ' data-key="'+key+'"' +
      ' oninput="handleDepEdInput(this)" style="width:44px;'+extraStyle+'">';
  }

  var rowNum = 0;
  function makeRows(entries, genderLabel) {
    var filtered = [];
    for (var i = 0; i < entries.length; i++) { if (matchSearch(entries[i].name)) filtered.push({entry:entries[i], origIdx:i}); }
    if (!filtered.length) return;
    tbody.innerHTML += '<tr><td colspan="'+(4 + allWWLen + allPTLen)+'" class="cr-gender-row">'+(genderLabel==="male"?"👨 MALE":"👩 FEMALE")+" ("+filtered.length+")</td></tr>";
    for (var fi = 0; fi < filtered.length; fi++) {
      var origIdx = filtered[fi].origIdx;
      var entry   = filtered[fi].entry;
      var name    = entry.name;
      var sk      = getScoreStoreKey(key, genderLabel, origIdx);
      var sc      = getDepEdScores(sk, currentGbSubject, currentQuarter);
      var ig      = _computeInitial(sc, currentGbSubject, key, currentQuarter);
      var tg      = ig !== null ? transmute(ig) : null;
      var bc      = tg ? badgeClass(tg) : "";

      var glBadge = "";
      if (entry.isRegistered && entry.strand) {
        var gl    = getGradeLevelShort(entry.strand);
        var sn    = getStrandName(entry.strand);
        var isG11 = entry.strand.indexOf("G11") >= 0;
        var glCol = isG11 ? "#0ea5e9" : "#10b981";
        glBadge   = '<span class="gl-badge" style="background:'+glCol+'22;border-color:'+glCol+'55;color:'+glCol+';">'+gl+'</span><span style="margin-left:4px;font-size:10px;color:var(--text-muted);">'+sn+'</span>';
      }
      var displayName = name;
      if (q) {
        var ixq = name.toLowerCase().indexOf(q);
        if (ixq >= 0) displayName = name.slice(0,ixq) + '<mark style="background:rgba(255,184,0,.3);color:var(--text-primary);border-radius:3px;">'+name.slice(ixq,ixq+q.length)+'</mark>' + name.slice(ixq+q.length);
      }
      rowNum++;

      var ww   = sc.ww   || [];
      var quiz = sc.quiz || [];
      var pt   = sc.pt   || [];
      var act  = sc.act  || [];

      var row = '<tr>' +
        '<td>'+rowNum+'</td>' +
        '<td class="gb-name-cell"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'+displayName+glBadge+'</div></td>';

      /* WW columns */
      for (var wi = 0; wi < wwCount; wi++) {
        row += '<td>' + makeInput("ww", wi, ww[wi]||"", sk, false, false) + '</td>';
      }
      /* Quiz columns */
      for (var qi2 = 0; qi2 < qzCount; qi2++) {
        row += '<td>' + makeInput("quiz", qi2, quiz[qi2]||"", sk, true, false) + '</td>';
      }
      /* PT columns */
      for (var pii = 0; pii < ptCount; pii++) {
        row += '<td>' + makeInput("pt", pii, pt[pii]||"", sk, false, false) + '</td>';
      }
      /* Activity columns */
      for (var aii = 0; aii < acCount; aii++) {
        row += '<td>' + makeInput("act", aii, act[aii]||"", sk, false, true) + '</td>';
      }

      row +=
        '<td><input class="score-input deped-score-input" type="number" min="0" max="'+cfg.qaTotal+'" step="any" value="'+(sc.qa||"")+'" placeholder="—"' +
          ' data-sk="'+sk+'" data-subj="'+currentGbSubject+'" data-qtr="'+currentQuarter+'" data-field="qa" data-idx="0" data-key="'+key+'"' +
          ' oninput="handleDepEdInput(this)" style="width:56px;"></td>' +
        '<td id="fg-'+sk+'-'+currentGbSubject+'-'+currentQuarter+'" style="text-align:center;font-size:11px;color:var(--text-muted);">'+(ig !== null ? ig.toFixed(1) : "—")+'</td>' +
        '<td id="tg-'+sk+'-'+currentGbSubject+'-'+currentQuarter+'" style="text-align:center;">'+(tg !== null ? '<span class="grade-cell '+bc+'">'+tg+'</span>' : "—")+'</td>' +
        '<td id="rem-'+sk+'-'+currentGbSubject+'-'+currentQuarter+'" style="font-size:11px;font-weight:600;color:'+gradeColor(tg)+';">'+getRemarks(tg)+'</td>' +
      '</tr>';

      tbody.innerHTML += row;
    }
  }
  makeRows(r.male,   "male");
  makeRows(r.female, "female");
  if (!tbody.innerHTML)
    tbody.innerHTML = '<tr><td colspan="'+(4+allWWLen+allPTLen)+'" style="text-align:center;color:var(--text-muted);padding:20px;">No students found.</td></tr>';
}

function handleDepEdInput(input) {
  var sk    = input.getAttribute("data-sk");
  var subj  = input.getAttribute("data-subj");
  var qtr   = input.getAttribute("data-qtr");
  var field = input.getAttribute("data-field");
  var idx   = parseInt(input.getAttribute("data-idx"), 10);
  var cKey  = input.getAttribute("data-key") || (currentFolder + "-" + currentSection);
  var val   = input.value;

  /* Store extended fields (quiz, act) similarly to ww/pt */
  if (!scoreStore[sk])            scoreStore[sk]            = {};
  if (!scoreStore[sk][subj])      scoreStore[sk][subj]      = {};
  if (!scoreStore[sk][subj][qtr]) scoreStore[sk][subj][qtr] = { ww:[], pt:[], quiz:[], act:[], qa:"", ww_total:50, pt_total:50, qa_total:100 };
  var qd = scoreStore[sk][subj][qtr];

  if (field === "qa") {
    qd.qa = val;
  } else if (field === "ww") {
    if (!Array.isArray(qd.ww)) qd.ww = []; qd.ww[idx] = val;
  } else if (field === "pt") {
    if (!Array.isArray(qd.pt)) qd.pt = []; qd.pt[idx] = val;
  } else if (field === "quiz") {
    if (!Array.isArray(qd.quiz)) qd.quiz = []; qd.quiz[idx] = val;
  } else if (field === "act") {
    if (!Array.isArray(qd.act)) qd.act = []; qd.act[idx] = val;
  }

  var sc    = getDepEdScores(sk, subj, qtr);
  /* merge quiz/act for computation */
  sc.quiz   = qd.quiz || [];
  sc.act    = qd.act  || [];
  var ig    = _computeInitial(sc, subj, cKey, qtr);
  var tg    = ig !== null ? transmute(ig) : null;
  var fgEl  = g("fg-"  + sk + "-" + subj + "-" + qtr);
  var tgEl  = g("tg-"  + sk + "-" + subj + "-" + qtr);
  var remEl = g("rem-" + sk + "-" + subj + "-" + qtr);
  if (fgEl)  fgEl.innerHTML  = (ig !== null) ? ig.toFixed(1) : "—";
  if (tgEl)  tgEl.innerHTML  = (tg !== null) ? '<span class="grade-cell '+badgeClass(tg)+'">'+tg+'</span>' : "—";
  if (remEl) { remEl.textContent = getRemarks(tg); remEl.style.color = gradeColor(tg); }
  saveGrades();
}

function getScoreStoreKey(classKey, genderLabel, idx) { return classKey + "-" + genderLabel + "-" + idx; }

function saveQuarterGrades(classKey) {
  var r     = getDynamicRoster(classKey, currentGradeLevel);
  var saved = 0;
  function process(entries, genderLabel) {
    for (var i = 0; i < entries.length; i++) {
      var sk  = getScoreStoreKey(classKey, genderLabel, i);
      var sc  = getDepEdScores(sk, currentGbSubject, currentQuarter);
      var qd2 = scoreStore[sk] && scoreStore[sk][currentGbSubject] && scoreStore[sk][currentGbSubject][currentQuarter];
      if (qd2) { sc.quiz = qd2.quiz || []; sc.act = qd2.act || []; }
      var ig  = _computeInitial(sc, currentGbSubject, classKey, currentQuarter);
      if (ig === null) continue;
      var tg  = transmute(ig);
      setRosterGrade(classKey, entries[i].name, currentGbSubject, currentQuarter, tg);
      saved++;
    }
  }
  process(r.male,   "male");
  process(r.female, "female");
  saveDB(); saveGrades();
  showToast(saved > 0
    ? "💾 ["+currentGbSubject+"] "+currentQuarter.toUpperCase()+" — "+saved+" transmuted grade(s) saved! ✅"
    : "⚠️ No scores found. Enter WW/PT/QA scores first.",
    saved > 0 ? "success" : "warning");
  renderGradebook(currentFolder, currentSection);
}

/* ── CLASS RECORD ── */
function setCrSubject(subj)   { currentSubject = subj; renderClassRecord(currentFolder, currentSection); }
function setCrSemFilter(sem)  { currentSemFilter = sem; currentSubject = null; renderClassRecord(currentFolder, currentSection); }

function renderClassRecord(strand, section) {
  var key     = strand + "-" + section;
  var r       = getDynamicRoster(key, currentGradeLevel);
  var crSubjs = getCrSubjectsForFolder(strand, currentGradeLevel);
  var crCols  = getCrColorsForFolder(strand, currentGradeLevel);
  var isIct   = isIct12(strand, currentGradeLevel);
  var filteredSubjs = crSubjs, filteredCols = crCols;
  if (isIct && currentSemFilter > 0) {
    filteredSubjs = []; filteredCols = [];
    for (var fi = 0; fi < ICT12_ALL_SUBJECTS.length; fi++) {
      if (ICT12_ALL_SUBJECTS[fi].sem === currentSemFilter) {
        filteredSubjs.push(ICT12_ALL_SUBJECTS[fi].name);
        filteredCols.push(ICT12_COLORS[fi]);
      }
    }
  }
  if (!currentSubject || filteredSubjs.indexOf(currentSubject) < 0) currentSubject = filteredSubjs[0] || crSubjs[0];
  var subjColor = crCols[crSubjs.indexOf(currentSubject) % crCols.length] || "#374151";
  var subjDark  = darken(subjColor, -28);
  var wts       = getWeights(currentSubject);

  var crToolbar = g("crToolbar");
  if (crToolbar) {
    var pillsHtml = "";
    for (var si = 0; si < filteredSubjs.length; si++) {
      var s     = filteredSubjs[si];
      var col   = filteredCols[si % filteredCols.length];
      var isAct = (currentSubject === s);
      pillsHtml += '<button class="subj-btn'+(isAct?" active":"")+'" data-subj="'+s+'"' +
        ' style="'+(isAct?"background:"+col+";border-color:"+col+";color:#fff;":"border-color:"+col+";color:"+col+";")+'"' +
        " onclick=\"setCrSubject(this.getAttribute('data-subj'))\">" + s + '</button>';
    }
    var crSemFilterHtml = "";
    if (isIct) {
      crSemFilterHtml = '<div class="sem-filter-row" style="margin-bottom:8px;">' +
        '<span class="toolbar-lbl" style="margin-right:6px;">Semester:</span>' +
        '<button class="sem-filter-btn'+(currentSemFilter===0?" active":"")+'" onclick="setCrSemFilter(0)">All</button>' +
        '<button class="sem-filter-btn'+(currentSemFilter===1?" active":"")+'" onclick="setCrSemFilter(1)">1st Semester</button>' +
        '<button class="sem-filter-btn'+(currentSemFilter===2?" active":"")+'" onclick="setCrSemFilter(2)">2nd Semester</button>' +
      '</div>';
    }
    crToolbar.innerHTML =
      crSemFilterHtml +
      '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px;">' +
        '<span class="toolbar-lbl">Subject:</span><div class="subj-pills" style="display:inline-flex;flex-wrap:wrap;gap:6px;">'+pillsHtml+'</div>' +
        '<button class="save-qtr-btn" onclick="saveCrGrades(\''+key+'\')">💾 Save All Quarters</button>' +
      '</div>' +
      '<div style="display:flex;gap:10px;padding:8px 14px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;">' +
        '<span style="font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;color:var(--au-300);opacity:.7;">📋 DepEd Weights — '+currentSubject+'</span>' +
        '<span style="font-size:11px;font-weight:800;color:var(--ww);">WW '+Math.round(wts.ww*100)+'%</span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="font-size:11px;font-weight:800;color:var(--pt);">PT '+Math.round(wts.pt*100)+'%</span>' +
        '<span style="color:rgba(255,255,255,.2);">·</span>' +
        '<span style="font-size:11px;font-weight:800;color:var(--qa);">QA '+Math.round(wts.qa*100)+'%</span>' +
      '</div>';
  }

  var thead = g("crHead");
  if (thead) {
    thead.innerHTML =
      '<tr>' +
        '<th class="cr-th" rowspan="2" style="background:var(--bg-raised);min-width:36px;">#</th>' +
        '<th class="cr-th" rowspan="2" style="background:var(--bg-raised);text-align:left;padding:6px 8px;min-width:160px;">STUDENT NAME</th>' +
        '<th class="cr-th" colspan="3" style="background:'+subjColor+';">'+currentSubject+
          '<div style="font-size:9px;font-weight:400;opacity:.75;">WW '+Math.round(wts.ww*100)+'% · PT '+Math.round(wts.pt*100)+'% · QA '+Math.round(wts.qa*100)+'%</div>' +
        '</th>' +
      '</tr><tr>' +
        '<th class="cr-th" style="background:rgba(14,165,233,.35);color:#38bdf8;">1st Semester<div style="font-size:9px;opacity:.7;">Q1 + Q2</div></th>' +
        '<th class="cr-th" style="background:rgba(16,185,129,.35);color:#34d399;">2nd Semester<div style="font-size:9px;opacity:.7;">Q3 + Q4</div></th>' +
        '<th class="cr-th" style="background:'+subjDark+';">FINAL</th>' +
      '</tr>';
  }

  var tbody = g("crBody");
  tbody.innerHTML = "";
  function makeCrRows(entries, genderLabel) {
    tbody.innerHTML += '<tr><td colspan="5" class="cr-gender-row'+(genderLabel==="female"?" cr-female-row":"")+'">'+
      (genderLabel==="male"?"👨 MALE":"👩 FEMALE") + '</td></tr>';
    for (var i = 0; i < entries.length; i++) {
      var entry    = entries[i], name = entry.name;
      var alt      = (i % 2 !== 0) ? "cr-alt" : "";
      var stuSubjQ = getAllRosterGrades(key, name, currentSubject);
      var stuDb    = findStudentByName(name);
      if (stuDb) {
        ensureStudentGrades(stuDb);
        var dbGr = stuDb.grades[currentSubject];
        if (dbGr) {
          if (!stuSubjQ.q1 && dbGr.q1) stuSubjQ.q1 = dbGr.q1;
          if (!stuSubjQ.q2 && dbGr.q2) stuSubjQ.q2 = dbGr.q2;
          if (!stuSubjQ.q3 && dbGr.q3) stuSubjQ.q3 = dbGr.q3;
          if (!stuSubjQ.q4 && dbGr.q4) stuSubjQ.q4 = dbGr.q4;
        }
      }
      var q1 = stuSubjQ.q1 || "", q2 = stuSubjQ.q2 || "", q3 = stuSubjQ.q3 || "", q4 = stuSubjQ.q4 || "";
      var sem1g = avgGrade(q1, q2), sem2g = avgGrade(q3, q4), fg = avgGrade(q1, q2, q3, q4);
      var da = ' data-key="'+key+'" data-ck="'+genderLabel+'-'+i+'" data-subj="'+currentSubject+'" data-stuname="'+name+'"';
      var glBadge = "";
      if (entry.isRegistered && entry.strand) {
        var gl    = getGradeLevelShort(entry.strand);
        var sn    = getStrandName(entry.strand);
        var isG11 = entry.strand.indexOf("G11") >= 0;
        var glCol = isG11 ? "#0ea5e9" : "#10b981";
        glBadge   = '<span class="gl-badge" style="background:'+glCol+'22;border-color:'+glCol+'55;color:'+glCol+';">'+gl+'</span><span style="margin-left:4px;font-size:10px;color:var(--text-muted);">'+sn+'</span>';
      }
      tbody.innerHTML +=
        '<tr class="cr-row '+alt+'">' +
          '<td class="cr-td" style="text-align:center;">'+(i+1)+'</td>' +
          '<td class="cr-td" style="min-width:160px;"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'+name+glBadge+'</div></td>' +
          '<td class="cr-td" style="background:rgba(14,165,233,.06);">' +
            '<div style="display:flex;gap:4px;align-items:center;">' +
              '<input class="cr-input plain-input" type="number" min="0" max="100" value="'+q1+'" placeholder="Q1"'+da+' data-q="q1" oninput="handleCrInput(this)" style="width:54px;text-align:center;padding:5px;">' +
              '<input class="cr-input plain-input" type="number" min="0" max="100" value="'+q2+'" placeholder="Q2"'+da+' data-q="q2" oninput="handleCrInput(this)" style="width:54px;text-align:center;padding:5px;">' +
            '</div>' +
            '<div id="crSem1-'+key+'-'+genderLabel+'-'+i+'" style="font-size:10px;color:'+(sem1g?gradeColor(sem1g):"var(--text-muted)")+';font-weight:800;margin-top:3px;">'+(sem1g||"—")+'</div>' +
          '</td>' +
          '<td class="cr-td" style="background:rgba(16,185,129,.06);">' +
            '<div style="display:flex;gap:4px;align-items:center;">' +
              '<input class="cr-input plain-input" type="number" min="0" max="100" value="'+q3+'" placeholder="Q3"'+da+' data-q="q3" oninput="handleCrInput(this)" style="width:54px;text-align:center;padding:5px;">' +
              '<input class="cr-input plain-input" type="number" min="0" max="100" value="'+q4+'" placeholder="Q4"'+da+' data-q="q4" oninput="handleCrInput(this)" style="width:54px;text-align:center;padding:5px;">' +
            '</div>' +
            '<div id="crSem2-'+key+'-'+genderLabel+'-'+i+'" style="font-size:10px;color:'+(sem2g?gradeColor(sem2g):"var(--text-muted)")+';font-weight:800;margin-top:3px;">'+(sem2g||"—")+'</div>' +
          '</td>' +
          '<td class="cr-td" id="crf-'+key+'-'+genderLabel+'-'+i+'">'+(fg?'<span class="grade-cell '+badgeClass(fg)+'">'+fg+'</span>':"—")+'</td>' +
        '</tr>';
    }
  }
  makeCrRows(r.male,   "male");
  makeCrRows(r.female, "female");
}

function handleCrInput(input) {
  var key     = input.getAttribute("data-key");
  var ck      = input.getAttribute("data-ck");
  var subj    = input.getAttribute("data-subj");
  var qkey    = input.getAttribute("data-q");
  var stuName = input.getAttribute("data-stuname");
  var val     = input.value;
  setRosterGrade(key, stuName, subj, qkey, val);
  var allQ  = getAllRosterGrades(key, stuName, subj);
  var fg    = avgGrade(allQ.q1, allQ.q2, allQ.q3, allQ.q4);
  var fEl   = g("crf-" + key + "-" + ck);
  if (fEl) fEl.innerHTML = fg ? '<span class="grade-cell ' + badgeClass(fg) + '">' + fg + '</span>' : "—";
  var sem1El = g("crSem1-" + key + "-" + ck);
  var sem2El = g("crSem2-" + key + "-" + ck);
  if (qkey === "q1" || qkey === "q2") {
    var s1 = avgGrade(allQ.q1, allQ.q2);
    if (sem1El) { sem1El.textContent = s1 || "—"; sem1El.style.color = s1 ? gradeColor(s1) : "var(--text-muted)"; }
  } else {
    var s2 = avgGrade(allQ.q3, allQ.q4);
    if (sem2El) { sem2El.textContent = s2 || "—"; sem2El.style.color = s2 ? gradeColor(s2) : "var(--text-muted)"; }
  }
  saveDB(); saveGrades();
}
function saveCrGrades(key) { saveDB(); saveGrades(); showToast("💾 [" + currentSubject + "] all quarter grades saved! ✅", "success"); }

/* ── ATTENDANCE ── */
function renderAttendance(strand, section) {
  var key = strand + "-" + section;
  var r   = getDynamicRoster(key, currentGradeLevel);
  if (!attStore[key]) attStore[key] = {};

  var mRow = g("attMonthRow"), dRow = g("attDayRow");
  mRow.innerHTML =
    '<th class="cr-th" rowspan="2" style="background:var(--bg-raised);min-width:36px;">#</th>' +
    '<th class="cr-th" rowspan="2" style="background:var(--bg-raised);text-align:left;padding:6px 8px;min-width:160px;">NAMES OF LEARNERS</th>' +
    '<th class="cr-th" colspan="2" style="background:#7a0006;">YEARLY TOTAL</th>';
  dRow.innerHTML =
    '<th class="cr-th" style="background:#9b1c1c;">ABS</th>' +
    '<th class="cr-th" style="background:#14532d;">PRS</th>';

  for (var mi = 0; mi < DB.months.length; mi++) {
    var mon = DB.months[mi], mbg = DB.monthColors[mi];
    mRow.innerHTML += '<th class="cr-th" colspan="'+(mon.days+2)+'" style="background:'+mbg+';">'+mon.name+'</th>';
    for (var dd = 1; dd <= mon.days; dd++)
      dRow.innerHTML += '<th class="cr-th" style="background:'+mbg+';min-width:28px;">'+dd+'</th>';
    dRow.innerHTML +=
      '<th class="cr-th" style="background:#374151;">ABS</th>' +
      '<th class="cr-th" style="background:#14532d;">PRS</th>';
  }

  var tbody    = g("attBody");
  tbody.innerHTML = "";
  var totalCols = 4 + DB.months.reduce(function(a, m) { return a + m.days + 2; }, 0);

  function makeAttRows(entries, genderLabel) {
    tbody.innerHTML += '<tr><td colspan="'+totalCols+'" class="cr-gender-row'+(genderLabel==="female"?" cr-female-row":"")+'">'+
      (genderLabel==="male"?"👨 MALE":"👩 FEMALE") + '</td></tr>';
    for (var i = 0; i < entries.length; i++) {
      var entry = entries[i], name = entry.name;
      var ak    = genderLabel + "-" + i;
      if (!attStore[key][ak]) attStore[key][ak] = {};
      var alt   = (i % 2 !== 0) ? "cr-alt" : "";
      var glBadge = "";
      if (entry.isRegistered && entry.strand) {
        var gl    = getGradeLevelShort(entry.strand);
        var sn    = getStrandName(entry.strand);
        var isG11 = entry.strand.indexOf("G11") >= 0;
        var glCol = isG11 ? "#0ea5e9" : "#10b981";
        glBadge   = '<span class="gl-badge" style="background:'+glCol+'22;border-color:'+glCol+'55;color:'+glCol+';">'+gl+'</span><span style="margin-left:4px;font-size:10px;color:var(--text-muted);">'+sn+'</span>';
      }
      var html =
        '<tr class="cr-row '+alt+'">' +
          '<td class="cr-td" style="text-align:center;">'+(i+1)+'</td>' +
          '<td class="cr-td" style="min-width:160px;"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">'+name+glBadge+'</div></td>' +
          '<td class="cr-td" id="att-yabs-'+key+'-'+ak+'" style="text-align:center;font-weight:800;color:var(--text-muted);">—</td>' +
          '<td class="cr-td" id="att-yprs-'+key+'-'+ak+'" style="text-align:center;font-weight:800;color:var(--text-muted);">—</td>';
      for (var mi2 = 0; mi2 < DB.months.length; mi2++) {
        if (!attStore[key][ak][mi2]) attStore[key][ak][mi2] = {};
        var mon2 = DB.months[mi2];
        for (var dayIdx = 0; dayIdx < mon2.days; dayIdx++) {
          var val = attStore[key][ak][mi2][dayIdx] || "";
          var cc  = val==="A"?" att-a-val":val==="P"?" att-p-val":val==="L"?" att-l-val":"";
          html += '<td class="cr-td att-cell"><input class="att-input'+cc+'" maxlength="1" value="'+val+'"' +
            ' data-key="'+key+'" data-ak="'+ak+'" data-mi="'+mi2+'" data-day="'+dayIdx+'"' +
            ' oninput="handleAttInput(this)" style="width:24px;text-align:center;background:rgba(0,0,0,.3);border:1px solid var(--border-subtle);border-radius:4px;color:var(--text-primary);font-size:11px;font-weight:700;padding:2px;"></td>';
        }
        html +=
          '<td class="cr-td" id="att-abs-'+key+'-'+ak+'-'+mi2+'" style="text-align:center;font-size:11px;color:var(--text-muted);">—</td>' +
          '<td class="cr-td" id="att-prs-'+key+'-'+ak+'-'+mi2+'" style="text-align:center;font-size:11px;color:var(--text-muted);">—</td>';
      }
      html += '</tr>';
      tbody.innerHTML += html;
      recomputeAtt(key, ak);
    }
  }
  makeAttRows(r.male,   "male");
  makeAttRows(r.female, "female");
}
function handleAttInput(input) {
  var key = input.getAttribute("data-key");
  var ak  = input.getAttribute("data-ak");
  var mi  = parseInt(input.getAttribute("data-mi"),  10);
  var day = parseInt(input.getAttribute("data-day"), 10);
  var val = input.value.toUpperCase().replace(/[^PAL]/g,"");
  input.value = val;
  if (!attStore[key])           attStore[key]           = {};
  if (!attStore[key][ak])       attStore[key][ak]       = {};
  if (!attStore[key][ak][mi])   attStore[key][ak][mi]   = {};
  attStore[key][ak][mi][day] = val;
  input.className = "att-input" + (val==="A"?" att-a-val":val==="P"?" att-p-val":val==="L"?" att-l-val":"");
  recomputeAtt(key, ak);
  saveGrades();
}
function recomputeAtt(key, ak) {
  var data  = (attStore[key] && attStore[key][ak]) ? attStore[key][ak] : {};
  var yAbs  = 0, yPrs = 0;
  for (var mi = 0; mi < DB.months.length; mi++) {
    var md = data[mi] || {}, abs = 0, prs = 0;
    for (var d = 0; d < DB.months[mi].days; d++) {
      var v = md[d] || "";
      if (v==="A") abs++;
      if (v==="P") prs++;
    }
    yAbs += abs; yPrs += prs;
    var ae = g("att-abs-" + key + "-" + ak + "-" + mi);
    var pe = g("att-prs-" + key + "-" + ak + "-" + mi);
    if (ae) { ae.textContent = abs || "—"; ae.style.color = abs ? "#ff9090" : "var(--text-muted)"; }
    if (pe) { pe.textContent = prs || "—"; pe.style.color = prs ? "#5dde92" : "var(--text-muted)"; }
  }
  var ya = g("att-yabs-" + key + "-" + ak);
  var yp = g("att-yprs-" + key + "-" + ak);
  if (ya) { ya.textContent = yAbs || "—"; ya.style.color = yAbs ? "#ff9090" : "var(--text-muted)"; ya.style.fontWeight = "800"; }
  if (yp) { yp.textContent = yPrs || "—"; yp.style.color = yPrs ? "#5dde92" : "var(--text-muted)"; yp.style.fontWeight = "800"; }
}

/* ── TOAST ── */
function showToast(msg, type) {
  var ex = g("mainToast"); if (ex) ex.remove();
  var el = document.createElement("div");
  el.id  = "mainToast";
  var bg     = type==="success" ? "linear-gradient(135deg,#065f46,#14532d)" : type==="warning" ? "linear-gradient(135deg,#92400e,#78350f)" : "linear-gradient(135deg,#7a0006,#3d0003)";
  var border = type==="success" ? "rgba(46,204,113,.4)" : type==="warning" ? "rgba(212,160,23,.4)" : "rgba(192,0,10,.4)";
  el.innerHTML = msg;
  el.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:9999;background:"+bg+";color:#fff;padding:13px 22px;border-radius:12px;font-size:13px;font-weight:600;box-shadow:0 8px 24px rgba(0,0,0,.5);border:1px solid "+border+";max-width:380px;pointer-events:none;";
  document.body.appendChild(el);
  setTimeout(function() { if (el.parentNode) { el.style.opacity = "0"; el.style.transition = "opacity .4s"; } }, 3000);
  setTimeout(function() { if (el.parentNode) el.remove(); }, 3500);
}

/* ── PROFILE MODAL ── */
function computeAge(bdayStr) {
  if (!bdayStr || bdayStr === "") return "—";
  var bday = new Date(bdayStr);
  if (isNaN(bday.getTime())) return "—";
  var today = new Date();
  var age   = today.getFullYear() - bday.getFullYear();
  var m     = today.getMonth() - bday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--;
  return age + " years old";
}
function openProfileModal() {
  if (!currentUser) return;
  var isTeacher = (currentRole === "teacher");
  g("pmAvatar").textContent = isTeacher ? "👩‍🏫" : "🎓";
  g("pmName").textContent   = currentUser.name || "—";
  g("pmRoleBadge").textContent    = isTeacher ? "Faculty" : "Student";
  g("pmEmailDisplay").textContent = (currentUser.email || currentUser.emailUser) + "@asiasourceicollege.edu.ph";
  if (g("pmInfoStudentId")) g("pmInfoStudentId").textContent = currentUser.studentId || (isTeacher ? "N/A" : "—");
  if (g("pmInfoGender"))    g("pmInfoGender").textContent    = currentUser.gender || "—";
  if (g("pmInfoName"))      g("pmInfoName").textContent      = currentUser.name   || "—";
  if (g("pmInfoBday"))      g("pmInfoBday").textContent      = currentUser.bday   || "—";
  if (g("pmInfoEmail"))     g("pmInfoEmail").textContent     = (currentUser.email || currentUser.emailUser) + "@asiasourceicollege.edu.ph";
  if (g("pmInfoMobile"))    g("pmInfoMobile").textContent    = currentUser.mobile  || "—";
  if (g("pmInfoAge"))       g("pmInfoAge").textContent       = computeAge(currentUser.bday);
  if (g("pmInfoAddress"))   g("pmInfoAddress").textContent   = currentUser.address || "—";
  if (g("pmInfoCity"))      g("pmInfoCity").textContent      = currentUser.city    || "—";
  var strandItem = g("pmStrandItem");
  if (isTeacher) {
    if (strandItem) strandItem.style.display = "none";
  } else {
    if (strandItem) strandItem.style.display = "";
    if (g("pmInfoStrand")) g("pmInfoStrand").textContent = DB.strandFull[currentUser.strand] || currentUser.strand || "—";
  }
  if (g("pmEditName"))    g("pmEditName").value    = currentUser.name    || "";
  if (g("pmEditGender"))  g("pmEditGender").value  = currentUser.gender  || "";
  if (g("pmEditMobile"))  g("pmEditMobile").value  = currentUser.mobile  || "";
  if (g("pmEditAddress")) g("pmEditAddress").value = currentUser.address || "";
  if (g("pmEditCity"))    g("pmEditCity").value    = currentUser.city    || "";
  var strandFg = g("pmEditStrandFg");
  if (isTeacher) {
    if (strandFg) strandFg.style.display = "none";
  } else {
    if (strandFg) strandFg.style.display = "";
    if (g("pmEditStrand")) g("pmEditStrand").value = currentUser.strand || "";
  }
  hideAlert("pmInfoAlert"); hideAlert("pmInfoSuccess"); hideAlert("pmPassAlert"); hideAlert("pmPassSuccess");
  if (g("pmCurrPass")) g("pmCurrPass").value = "";
  if (g("pmNewPass"))  g("pmNewPass").value  = "";
  if (g("pmConfPass")) g("pmConfPass").value = "";
  if (!isTeacher && currentUser) {
    var photoData = loadStudentPhoto(currentUser.id);
    var preview   = g("pmPhotoPreviewImg"), placeholder = g("pmPhotoPlaceholder");
    if (photoData) {
      if (preview)     { preview.src = photoData; preview.classList.remove("hidden"); }
      if (placeholder)   placeholder.style.display = "none";
    } else {
      if (preview)     { preview.src = ""; preview.classList.add("hidden"); }
      if (placeholder)   placeholder.style.display = "";
    }
    applyStudentPhoto(currentUser.id, photoData);
  }
  var photoTab = g("pmTabPhoto");
  if (photoTab) photoTab.style.display = isTeacher ? "none" : "";
  switchPmTab("info", g("pmTabInfo"));
  g("profileModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeProfileModal() { g("profileModal").classList.add("hidden"); document.body.style.overflow = ""; }
function switchPmTab(tab, btn) {
  document.querySelectorAll(".pm-tab").forEach(function(t) { t.className = "pm-tab"; });
  btn.className = "pm-tab active";
  ["pmPanelInfo","pmPanelPass","pmPanelPhoto"].forEach(function(id) { var p = g(id); if (p) p.className = "pm-panel hidden"; });
  if      (tab==="info"     && g("pmPanelInfo"))  g("pmPanelInfo").className  = "pm-panel";
  else if (tab==="password" && g("pmPanelPass"))  g("pmPanelPass").className  = "pm-panel";
  else if (tab==="photo"    && g("pmPanelPhoto")) g("pmPanelPhoto").className = "pm-panel";
}
function saveProfileInfo() {
  hideAlert("pmInfoAlert"); hideAlert("pmInfoSuccess");
  var newName   = g("pmEditName")    ? g("pmEditName").value.trim()    : "";
  var newAddr   = g("pmEditAddress") ? g("pmEditAddress").value.trim() : "";
  var newGender = g("pmEditGender")  ? g("pmEditGender").value         : "";
  var newMobile = g("pmEditMobile")  ? g("pmEditMobile").value.trim()  : "";
  var newCity   = g("pmEditCity")    ? g("pmEditCity").value.trim()    : "";
  if (!newName) { showAlert("pmInfoAlert","Please enter your full name."); return; }
  var isTeacher = (currentRole === "teacher");
  var list      = isTeacher ? DB.teachers : DB.students;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === currentUser.id) {
      list[i].name = newName; list[i].address = newAddr; list[i].gender = newGender;
      list[i].mobile = newMobile; list[i].city = newCity;
      if (!isTeacher) { var ns = g("pmEditStrand") ? g("pmEditStrand").value : ""; if (ns) list[i].strand = ns; }
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
  showToast("✅ Profile updated!","success");
}
function saveNewPassword() {
  hideAlert("pmPassAlert"); hideAlert("pmPassSuccess");
  var curr = g("pmCurrPass") ? g("pmCurrPass").value.trim() : "";
  var nw   = g("pmNewPass")  ? g("pmNewPass").value.trim()  : "";
  var conf = g("pmConfPass") ? g("pmConfPass").value.trim() : "";
  if (!curr || !nw || !conf) { showAlert("pmPassAlert","Please fill in all password fields."); return; }
  if (curr !== currentUser.pass) { showAlert("pmPassAlert","❌ Current password is incorrect."); return; }
  if (nw.length < 4)            { showAlert("pmPassAlert","New password must be at least 4 characters."); return; }
  if (nw !== conf)              { showAlert("pmPassAlert","❌ New passwords do not match."); return; }
  var isTeacher = (currentRole === "teacher");
  var list      = isTeacher ? DB.teachers : DB.students;
  for (var i = 0; i < list.length; i++) { if (list[i].id === currentUser.id) { list[i].pass = nw; currentUser = list[i]; break; } }
  saveDB();
  if (g("pmCurrPass")) g("pmCurrPass").value = "";
  if (g("pmNewPass"))  g("pmNewPass").value  = "";
  if (g("pmConfPass")) g("pmConfPass").value = "";
  showAlert("pmPassSuccess","✅ Password changed! Use your new password next login.","success");
  showToast("🔐 Password reset successful!","success");
}

/* ── GLOBAL EVENT LISTENERS ── */
document.addEventListener("click", function(e) {
  var notifPanel = g("teacherNotifPanel");
  if (notifPanel && !notifPanel.classList.contains("hidden")) {
    var notifWrap = notifPanel.closest ? notifPanel.closest(".notif-wrap") : null;
    if (notifWrap && !notifWrap.contains(e.target)) notifPanel.classList.add("hidden");
  }
});
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape") {
    closeSubjectModal();
    closeProfileModal();
    closeTcModal();
    closeAddSubjectModal();
    closeAddStudentModal();
    var overlay = g("subjConfigOverlay");
    if (overlay) overlay.remove();
    var np = g("teacherNotifPanel");
    if (np && !np.classList.contains("hidden")) np.classList.add("hidden");
  }
});

/* ── INIT ── */
(function init() {
  setRole("student");
  setSuRole("student");

  var container = g("particles");
  if (container) {
    var colors = ["#ffb800","#e8000f","#ff6090","#ffffff"];
    for (var i = 0; i < 40; i++) {
      var p = document.createElement("div");
      p.className = "particle";
      p.style.cssText = [
        "left:"+(Math.random()*100)+"%",
        "width:"+(Math.random()*3+1)+"px",
        "height:"+(Math.random()*3+1)+"px",
        "background:"+colors[Math.floor(Math.random()*colors.length)],
        "animation-duration:"+(Math.random()*15+8)+"s",
        "animation-delay:"+(Math.random()*15)+"s",
        "opacity:0"
      ].join(";");
      container.appendChild(p);
    }
  }

  document.addEventListener("mousemove", function(e) {
    var card = document.querySelector(".lp-card");
    if (!card) return;
    var rect = card.getBoundingClientRect();
    if (!rect.width) return;
    var cx   = rect.left + rect.width  / 2;
    var cy   = rect.top  + rect.height / 2;
    var dx   = (e.clientX - cx) / rect.width;
    var dy   = (e.clientY - cy) / rect.height;
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (dist < 1.5) {
      card.style.transform  = "rotateY("+(dx*7)+"deg) rotateX("+(-dy*4)+"deg) translateZ(8px)";
      card.style.transition = "transform 0.1s ease";
    } else {
      card.style.transform  = "";
      card.style.transition = "transform 0.5s ease";
    }
  });

  var mottoWrap = document.querySelector(".lp-motto-wrap");
  if (mottoWrap) {
    mottoWrap.style.opacity   = "0";
    mottoWrap.style.transform = "translateY(20px)";
    setTimeout(function() {
      mottoWrap.style.transition = "opacity 0.8s ease, transform 0.8s cubic-bezier(0.34,1.56,0.64,1)";
      mottoWrap.style.opacity    = "1";
      mottoWrap.style.transform  = "translateY(0)";
    }, 400);
  }
})();

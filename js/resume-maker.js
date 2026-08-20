/**
 * Maa Enterprises — Cyber Cafe & Online Service Center
 * Bulletproof Reactive Professional Resume Maker Core Engine
 */

'use strict';

let resumeState = {
  id: 'res_' + Date.now(),
  title: 'Professional Resume',
  template: 'classic-professional',
  level: 'medium',
  appearance: {
    primaryColor: '#1e3a8a',
    accentColor: '#0284c7',
    fontFamily: "'Poppins', sans-serif",
    photoShape: 'circle'
  },
  personal: {
    fullName: '',
    jobTitle: '',
    fatherName: '',
    motherName: '',
    dob: '',
    gender: '',
    maritalStatus: '',
    nationality: 'Indian',
    mobile: '',
    email: '',
    address: '',
    linkedin: '',
    github: '',
    portfolio: ''
  },
  objective: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  internships: [],
  languages: [],
  hobbies: [],
  customSections: [],
  declaration: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
  date: '',
  place: '',
  signature: {
    type: 'printed',
    imageData: null
  },
  photo: null
};

let currentZoom = 1.0;

function getEl(id1, id2 = null) {
  return document.getElementById(id1) || (id2 ? document.getElementById(id2) : null);
}

function getCanvas() {
  return document.getElementById('liveResumeCanvas') || document.getElementById('resumePaper');
}

document.addEventListener('DOMContentLoaded', () => {
  initTemplateSelector();
  initLevelSwitcher();
  initAppearanceControls();
  initPhotoUploader();
  initSignatureControls();
  initObjectiveSuggestions();
  initDateTodayButton();
  bindPersonalInputs();
  bindDeclarationInputs();
  initRepeatableSections();
  initToolbarControls();
  checkUrlLoadParam();

  renderResume();
});

function initTemplateSelector() {
  const cards = document.querySelectorAll('.template-select-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const templateId = card.getAttribute('data-template-id');
      if (!templateId) return;

      cards.forEach(c => {
        c.classList.remove('active');
        const btn = c.querySelector('.btn-use-template');
        if (btn) btn.textContent = 'Use Template';
      });

      card.classList.add('active');
      const activeBtn = card.querySelector('.btn-use-template');
      if (activeBtn) activeBtn.textContent = 'Selected';

      const badge = document.getElementById('activeTemplateBadge');
      if (badge) badge.textContent = formatTemplateName(templateId);

      resumeState.template = templateId;
      renderResume();
    });
  });
}

function formatTemplateName(id) {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function initLevelSwitcher() {
  const levelBtns = document.querySelectorAll('.level-btn');
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const level = btn.getAttribute('data-level');
      if (!level) return;

      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      resumeState.level = level;
      updateFieldVisibilityByLevel(level);
      renderResume();
    });
  });
}

function updateFieldVisibilityByLevel(level) {
  const highOnly = document.querySelectorAll('.level-high-only');
  const medHigh = document.querySelectorAll('.level-med-high');
  const lowOnly = document.querySelectorAll('.level-low-only');

  if (level === 'low') {
    highOnly.forEach(el => el.style.display = 'none');
    medHigh.forEach(el => el.style.display = 'none');
    lowOnly.forEach(el => el.style.display = 'block');
  } else if (level === 'medium') {
    highOnly.forEach(el => el.style.display = 'none');
    medHigh.forEach(el => el.style.display = 'block');
    lowOnly.forEach(el => el.style.display = 'block');
  } else {
    highOnly.forEach(el => el.style.display = 'block');
    medHigh.forEach(el => el.style.display = 'block');
    lowOnly.forEach(el => el.style.display = 'block');
  }
}

function initAppearanceControls() {
  const primaryPicker = document.getElementById('primaryColorInput');
  const accentPicker = document.getElementById('accentColorInput');
  const fontSelect = document.getElementById('fontFamilySelect');

  primaryPicker?.addEventListener('input', (e) => {
    resumeState.appearance.primaryColor = e.target.value;
    renderResume();
  });

  accentPicker?.addEventListener('input', (e) => {
    resumeState.appearance.accentColor = e.target.value;
    renderResume();
  });

  fontSelect?.addEventListener('change', (e) => {
    resumeState.appearance.fontFamily = e.target.value;
    renderResume();
  });

  const shapeBtns = document.querySelectorAll('.shape-btn');
  shapeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const shape = btn.getAttribute('data-shape');
      if (!shape) return;
      shapeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resumeState.appearance.photoShape = shape;
      renderResume();
    });
  });
}

function initPhotoUploader() {
  const fileInput = document.getElementById('photoFileInput');
  const removeBtn = getEl('removePhotoBtn', 'btnRemovePhoto');

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      if (window.showToast) window.showToast('Photo size should be less than 3MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      resumeState.photo = event.target.result;
      updatePhotoPreview(event.target.result);
      renderResume();
    };
    reader.readAsDataURL(file);
  });

  removeBtn?.addEventListener('click', () => {
    resumeState.photo = null;
    if (fileInput) fileInput.value = '';
    updatePhotoPreview(null);
    renderResume();
  });
}

function updatePhotoPreview(dataUrl) {
  const previewImg = document.getElementById('photoAvatarPreview') || document.getElementById('photoThumbnailImg');
  const placeholder = document.getElementById('photoPlaceholderIcon');
  const removeBtn = getEl('removePhotoBtn', 'btnRemovePhoto');

  if (previewImg) {
    if (dataUrl) {
      previewImg.src = dataUrl;
      previewImg.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
      if (removeBtn) removeBtn.style.display = 'inline-block';
    } else {
      previewImg.src = '';
      previewImg.style.display = 'none';
      if (placeholder) placeholder.style.display = 'block';
      if (removeBtn) removeBtn.style.display = 'none';
    }
  }
}

function initSignatureControls() {
  const typeSelect = document.getElementById('signatureTypeSelect');
  const uploadContainer = document.getElementById('sigImageUploadBox') || document.getElementById('signatureUploadContainer');
  const fileInput = document.getElementById('signatureFileInput');

  typeSelect?.addEventListener('change', (e) => {
    resumeState.signature.type = e.target.value;
    if (uploadContainer) {
      uploadContainer.style.display = e.target.value === 'image' ? 'block' : 'none';
    }
    renderResume();
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      resumeState.signature.imageData = event.target.result;
      renderResume();
    };
    reader.readAsDataURL(file);
  });
}

function initObjectiveSuggestions() {
  const pills = document.querySelectorAll('.suggestion-pill');
  const textarea = getEl('objectiveTextarea', 'input_objective');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const text = pill.getAttribute('data-text');
      if (textarea && text) {
        textarea.value = text;
        resumeState.objective = text;
        renderResume();
      }
    });
  });

  textarea?.addEventListener('input', (e) => {
    resumeState.objective = e.target.value;
    renderResume();
  });
}

function initDateTodayButton() {
  const btn = getEl('btnDateToday', 'btnSetDateToday');
  const input = document.getElementById('resumeDateInput');

  btn?.addEventListener('click', () => {
    const today = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    if (input) {
      input.value = today;
      resumeState.date = today;
      renderResume();
    }
  });
}

function bindPersonalInputs() {
  const fields = [
    'fullName', 'jobTitle', 'fatherName', 'motherName', 'dob',
    'gender', 'maritalStatus', 'nationality', 'mobile', 'email',
    'address', 'linkedin', 'github', 'portfolio'
  ];

  fields.forEach(field => {
    const input = document.getElementById(`input_${field}`);
    if (input) {
      input.addEventListener('input', (e) => {
        resumeState.personal[field] = e.target.value;
        renderResume();
      });
    }
  });
}

function bindDeclarationInputs() {
  const declInput = getEl('declarationTextarea', 'input_declaration');
  const dateInput = document.getElementById('resumeDateInput');
  const placeInput = document.getElementById('resumePlaceInput');

  declInput?.addEventListener('input', (e) => {
    resumeState.declaration = e.target.value;
    renderResume();
  });

  dateInput?.addEventListener('input', (e) => {
    resumeState.date = e.target.value;
    renderResume();
  });

  placeInput?.addEventListener('input', (e) => {
    resumeState.place = e.target.value;
    renderResume();
  });
}

function initRepeatableSections() {
  document.getElementById('btnAddEducation')?.addEventListener('click', () => addEducationItem());
  renderEducationFormList();

  document.getElementById('btnAddExperience')?.addEventListener('click', () => addExperienceItem());
  renderExperienceFormList();

  document.getElementById('btnAddProject')?.addEventListener('click', () => addProjectItem());
  renderProjectsFormList();

  document.getElementById('btnAddCertification')?.addEventListener('click', () => addCertificationItem());
  renderCertificationsFormList();

  document.getElementById('btnAddAchievement')?.addEventListener('click', () => addAchievementItem());
  renderAchievementsFormList();

  document.getElementById('btnAddInternship')?.addEventListener('click', () => addInternshipItem());
  renderInternshipsFormList();

  document.getElementById('btnAddCustomSection')?.addEventListener('click', () => addCustomSection());
  renderCustomSectionsFormList();

  initTagsInput('skills', 'skillInput', 'skillChipsContainer', 'skillsTagList', 'btnAddSkill');
  initTagsInput('languages', 'languageInput', 'languageChipsContainer', 'languagesTagList', 'btnAddLanguage');
  initTagsInput('hobbies', 'hobbyInput', 'hobbyChipsContainer', 'hobbiesTagList', 'btnAddHobby');
}

function addEducationItem(data = {}) {
  resumeState.education.push({
    degree: data.degree || '',
    institution: data.institution || '',
    board: data.board || '',
    startYear: data.startYear || '',
    endYear: data.endYear || '',
    score: data.score || '',
    details: data.details || ''
  });
  renderEducationFormList();
  renderResume();
}

function renderEducationFormList() {
  const container = getEl('educationListContainer', 'educationFormList');
  if (!container) return;

  container.innerHTML = resumeState.education.map((item, idx) => `
    <div class="repeatable-card" data-index="${idx}">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx + 1} Degree / Schooling</span>
        <button type="button" class="btn-remove-card" onclick="removeEducationItem(${idx})" title="Remove">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Degree / Class</label>
          <input type="text" class="form-input" value="${escapeHtml(item.degree)}" placeholder="e.g. 10th / 12th / B.Tech ECE" oninput="updateEducationField(${idx}, 'degree', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">School / College / University</label>
          <input type="text" class="form-input" value="${escapeHtml(item.institution)}" placeholder="e.g. Patna University" oninput="updateEducationField(${idx}, 'institution', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Board / Council</label>
          <input type="text" class="form-input" value="${escapeHtml(item.board)}" placeholder="e.g. BSEB / CBSE / AICTE" oninput="updateEducationField(${idx}, 'board', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Passing Year</label>
          <input type="text" class="form-input" value="${escapeHtml(item.endYear)}" placeholder="e.g. 2024" oninput="updateEducationField(${idx}, 'endYear', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Marks / Percentage / CGPA</label>
          <input type="text" class="form-input" value="${escapeHtml(item.score)}" placeholder="e.g. 82% or 8.4 CGPA" oninput="updateEducationField(${idx}, 'score', this.value)">
        </div>
      </div>
    </div>
  `).join('');
}

window.updateEducationField = (idx, field, val) => {
  if (resumeState.education[idx]) {
    resumeState.education[idx][field] = val;
    renderResume();
  }
};

window.removeEducationItem = (idx) => {
  resumeState.education.splice(idx, 1);
  renderEducationFormList();
  renderResume();
};

function addExperienceItem(data = {}) {
  resumeState.experience.push({
    title: data.title || '',
    company: data.company || '',
    location: data.location || '',
    start: data.start || '',
    end: data.end || '',
    current: data.current || false,
    description: data.description || ''
  });
  renderExperienceFormList();
  renderResume();
}

function renderExperienceFormList() {
  const container = getEl('experienceListContainer', 'experienceFormList');
  if (!container) return;

  container.innerHTML = resumeState.experience.map((item, idx) => `
    <div class="repeatable-card" data-index="${idx}">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx + 1} Work Role</span>
        <button type="button" class="btn-remove-card" onclick="removeExperienceItem(${idx})" title="Remove">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Job Title / Designation</label>
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. Frontend Developer" oninput="updateExperienceField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Company / Organization</label>
          <input type="text" class="form-input" value="${escapeHtml(item.company)}" placeholder="e.g. Tech Solutions" oninput="updateExperienceField(${idx}, 'company', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Location</label>
          <input type="text" class="form-input" value="${escapeHtml(item.location)}" placeholder="e.g. Patna / Remote" oninput="updateExperienceField(${idx}, 'location', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Duration (Dates)</label>
          <input type="text" class="form-input" value="${escapeHtml(item.start)}" placeholder="e.g. Jan 2023 – Present" oninput="updateExperienceField(${idx}, 'start', this.value)">
        </div>
        <div class="form-group full-width">
          <label class="form-label">Key Responsibilities / Achievements</label>
          <textarea class="form-textarea" rows="2" placeholder="Describe your duties, impact, and deliverables..." oninput="updateExperienceField(${idx}, 'description', this.value)">${escapeHtml(item.description)}</textarea>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateExperienceField = (idx, field, val) => {
  if (resumeState.experience[idx]) {
    resumeState.experience[idx][field] = val;
    renderResume();
  }
};

window.removeExperienceItem = (idx) => {
  resumeState.experience.splice(idx, 1);
  renderExperienceFormList();
  renderResume();
};

function addProjectItem(data = {}) {
  resumeState.projects.push({
    title: data.title || '',
    role: data.role || '',
    tech: data.tech || '',
    link: data.link || '',
    description: data.description || ''
  });
  renderProjectsFormList();
  renderResume();
}

function renderProjectsFormList() {
  const container = getEl('projectsListContainer', 'projectsFormList');
  if (!container) return;

  container.innerHTML = resumeState.projects.map((item, idx) => `
    <div class="repeatable-card" data-index="${idx}">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx + 1} Project</span>
        <button type="button" class="btn-remove-card" onclick="removeProjectItem(${idx})" title="Remove">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Project Name</label>
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. Cyber Cafe Portal" oninput="updateProjectField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Technologies Used</label>
          <input type="text" class="form-input" value="${escapeHtml(item.tech)}" placeholder="e.g. HTML, CSS, JavaScript, Firebase" oninput="updateProjectField(${idx}, 'tech', this.value)">
        </div>
        <div class="form-group full-width">
          <label class="form-label">Project Summary</label>
          <textarea class="form-textarea" rows="2" placeholder="Key outcomes, features, architecture..." oninput="updateProjectField(${idx}, 'description', this.value)">${escapeHtml(item.description)}</textarea>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateProjectField = (idx, field, val) => {
  if (resumeState.projects[idx]) {
    resumeState.projects[idx][field] = val;
    renderResume();
  }
};

window.removeProjectItem = (idx) => {
  resumeState.projects.splice(idx, 1);
  renderProjectsFormList();
  renderResume();
};

function addCertificationItem(data = {}) {
  resumeState.certifications.push({
    name: data.name || '',
    issuer: data.issuer || '',
    date: data.date || '',
    credentialId: data.credentialId || ''
  });
  renderCertificationsFormList();
  renderResume();
}

function renderCertificationsFormList() {
  const container = getEl('certificationsListContainer', 'certificationsFormList');
  if (!container) return;

  container.innerHTML = resumeState.certifications.map((item, idx) => `
    <div class="repeatable-card" data-index="${idx}">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx + 1} Certification</span>
        <button type="button" class="btn-remove-card" onclick="removeCertificationItem(${idx})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Certificate Title</label>
          <input type="text" class="form-input" value="${escapeHtml(item.name)}" placeholder="e.g. Certificate in Computer Applications (CCA)" oninput="updateCertField(${idx}, 'name', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Issuing Body &amp; Year</label>
          <input type="text" class="form-input" value="${escapeHtml(item.issuer)}" placeholder="e.g. NIELIT / State Council (2024)" oninput="updateCertField(${idx}, 'issuer', this.value)">
        </div>
      </div>
    </div>
  `).join('');
}

window.updateCertField = (idx, field, val) => {
  if (resumeState.certifications[idx]) {
    resumeState.certifications[idx][field] = val;
    renderResume();
  }
};

window.removeCertificationItem = (idx) => {
  resumeState.certifications.splice(idx, 1);
  renderCertificationsFormList();
  renderResume();
};

function addAchievementItem(data = {}) {
  resumeState.achievements.push({
    title: data.title || '',
    issuer: data.issuer || '',
    year: data.year || '',
    description: data.description || ''
  });
  renderAchievementsFormList();
  renderResume();
}

function renderAchievementsFormList() {
  const container = getEl('achievementsFormList', 'achievementsListContainer');
  if (!container) return;

  container.innerHTML = resumeState.achievements.map((item, idx) => `
    <div class="repeatable-card" data-index="${idx}">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx + 1} Achievement / Award</span>
        <button type="button" class="btn-remove-card" onclick="removeAchievementItem(${idx})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Award / Honor Title</label>
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. 1st Prize in District Quiz / State Hackathon" oninput="updateAchievementField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Organization &amp; Year</label>
          <input type="text" class="form-input" value="${escapeHtml(item.issuer)}" placeholder="e.g. Education Dept, 2024" oninput="updateAchievementField(${idx}, 'issuer', this.value)">
        </div>
      </div>
    </div>
  `).join('');
}

window.updateAchievementField = (idx, field, val) => {
  if (resumeState.achievements[idx]) {
    resumeState.achievements[idx][field] = val;
    renderResume();
  }
};

window.removeAchievementItem = (idx) => {
  resumeState.achievements.splice(idx, 1);
  renderAchievementsFormList();
  renderResume();
};

function addInternshipItem(data = {}) {
  resumeState.internships.push({
    title: data.title || '',
    company: data.company || '',
    duration: data.duration || '',
    description: data.description || ''
  });
  renderInternshipsFormList();
  renderResume();
}

function renderInternshipsFormList() {
  const container = getEl('internshipsListContainer', 'internshipsFormList');
  if (!container) return;

  container.innerHTML = resumeState.internships.map((item, idx) => `
    <div class="repeatable-card" data-index="${idx}">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx + 1} Training / Internship</span>
        <button type="button" class="btn-remove-card" onclick="removeInternshipItem(${idx})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label class="form-label">Role / Topic</label>
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. Computer Operator / Tech Intern" oninput="updateInternField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Organization / Duration</label>
          <input type="text" class="form-input" value="${escapeHtml(item.company)}" placeholder="e.g. IT Solutions (3 Months)" oninput="updateInternField(${idx}, 'company', this.value)">
        </div>
      </div>
    </div>
  `).join('');
}

window.updateInternField = (idx, field, val) => {
  if (resumeState.internships[idx]) {
    resumeState.internships[idx][field] = val;
    renderResume();
  }
};

window.removeInternshipItem = (idx) => {
  resumeState.internships.splice(idx, 1);
  renderInternshipsFormList();
  renderResume();
};

function addCustomSection(data = {}) {
  resumeState.customSections.push({
    title: data.title || 'Key Strengths & Highlights',
    content: data.content || ''
  });
  renderCustomSectionsFormList();
  renderResume();
}

function renderCustomSectionsFormList() {
  const container = getEl('customSectionsFormList', 'customSectionsListContainer');
  if (!container) return;

  container.innerHTML = resumeState.customSections.map((item, idx) => `
    <div class="repeatable-card" data-index="${idx}">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx + 1} Custom Section</span>
        <button type="button" class="btn-remove-card" onclick="removeCustomSection(${idx})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group full-width">
          <label class="form-label">Section Heading</label>
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. Publications / Key Strengths / Volunteer Work" oninput="updateCustomSectionField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group full-width">
          <label class="form-label">Section Content / Details</label>
          <textarea class="form-textarea" rows="2" placeholder="Enter details..." oninput="updateCustomSectionField(${idx}, 'content', this.value)">${escapeHtml(item.content)}</textarea>
        </div>
      </div>
    </div>
  `).join('');
}

window.updateCustomSectionField = (idx, field, val) => {
  if (resumeState.customSections[idx]) {
    resumeState.customSections[idx][field] = val;
    renderResume();
  }
};

window.removeCustomSection = (idx) => {
  resumeState.customSections.splice(idx, 1);
  renderCustomSectionsFormList();
  renderResume();
};

function initTagsInput(stateKey, inputId, containerId1, containerId2, btnAddId) {
  const input = document.getElementById(inputId);
  const container = getEl(containerId1, containerId2);
  const addBtn = document.getElementById(btnAddId);
  if (!input || !container) return;

  function addTag(val) {
    const clean = val.trim();
    if (clean && !resumeState[stateKey].includes(clean)) {
      resumeState[stateKey].push(clean);
      renderTagChips(stateKey, containerId1, containerId2);
      renderResume();
    }
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.value);
      input.value = '';
    }
  });

  addBtn?.addEventListener('click', () => {
    addTag(input.value);
    input.value = '';
  });

  renderTagChips(stateKey, containerId1, containerId2);
}

function renderTagChips(stateKey, id1, id2) {
  const container = getEl(id1, id2);
  if (!container) return;

  container.innerHTML = resumeState[stateKey].map((tag, idx) => `
    <span class="tag-chip">
      <span>${escapeHtml(tag)}</span>
      <button type="button" class="tag-remove-btn" onclick="removeTagItem('${stateKey}', '${id1}', '${id2}', ${idx})">&times;</button>
    </span>
  `).join('');
}

window.removeTagItem = (stateKey, id1, id2, idx) => {
  resumeState[stateKey].splice(idx, 1);
  renderTagChips(stateKey, id1, id2);
  renderResume();
};

function initToolbarControls() {
  document.getElementById('btnZoomIn')?.addEventListener('click', () => setZoom(currentZoom + 0.1));
  document.getElementById('btnZoomOut')?.addEventListener('click', () => setZoom(currentZoom - 0.1));
  document.getElementById('btnLoadSample')?.addEventListener('click', () => loadSampleData());
  document.getElementById('btnClearForm')?.addEventListener('click', () => confirmClearForm());
  document.getElementById('btnPrintResume')?.addEventListener('click', () => printResume());
  document.getElementById('btnDownloadPdf')?.addEventListener('click', () => downloadResumePDF());
  document.getElementById('btnSaveResume')?.addEventListener('click', () => saveResumeToStorage());
  document.getElementById('btnMyResumes')?.addEventListener('click', () => openMyResumesModal());
  document.getElementById('btnDuplicateResume')?.addEventListener('click', () => duplicateCurrentResume());
}

function setZoom(val) {
  currentZoom = Math.min(Math.max(val, 0.5), 1.5);
  const canvas = getCanvas();
  if (canvas) {
    canvas.style.transform = `scale(${currentZoom})`;
  }
}

function printResume() {
  window.print();
}

async function saveResumeToStorage() {
  const title = prompt('Enter a title for this resume project:', resumeState.title || (resumeState.personal.fullName ? resumeState.personal.fullName + ' Resume' : 'My Resume'));
  if (title === null) return;

  resumeState.title = title.trim() || 'My Resume';

  try {
    let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
    const idx = list.findIndex(r => r.id === resumeState.id);
    if (idx >= 0) list[idx] = resumeState;
    else list.unshift(resumeState);
    localStorage.setItem('maa_saved_resumes', JSON.stringify(list));

    if (window.FirebaseApp && window.FirebaseApp.db) {
      const { db, doc, setDoc, serverTimestamp } = window.FirebaseApp;
      await setDoc(doc(db, 'resumes', resumeState.id), {
        ...resumeState,
        serverTimestamp: serverTimestamp()
      });
    }

    if (window.showToast) window.showToast('Resume "' + resumeState.title + '" saved successfully!', 'success');
  } catch (err) {
    if (window.showToast) window.showToast('Resume saved locally: ' + err.message, 'info');
  }
}

function duplicateCurrentResume() {
  const copy = JSON.parse(JSON.stringify(resumeState));
  copy.id = 'res_' + Date.now();
  copy.title = 'Copy of ' + (resumeState.title || 'Resume');
  resumeState = copy;
  syncFormWithState();
  renderResume();
  saveResumeToStorage();
}

async function openMyResumesModal() {
  let modal = document.getElementById('myResumesModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'myResumesModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card" style="max-width: 600px;">
        <div class="modal-header">
          <h2 style="font-size: 1.25rem; color: #ffffff; margin: 0;">My Saved Resumes</h2>
          <button type="button" class="modal-close" onclick="document.getElementById('myResumesModal').classList.remove('modal-active')">&times;</button>
        </div>
        <div id="savedResumesListContainer" style="padding: 1.5rem; max-height: 400px; overflow-y: auto;"></div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('myResumesModal').classList.remove('modal-active')">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const container = document.getElementById('savedResumesListContainer');
  container.innerHTML = '<div style="text-align: center; color: var(--text-secondary);">Loading saved resumes...</div>';
  modal.classList.add('modal-active');

  let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');

  if (list.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-secondary); padding: 2rem 0;">
        <p>No saved resumes found yet.</p>
        <button type="button" class="btn btn-primary btn-sm" onclick="saveResumeToStorage(); document.getElementById('myResumesModal').classList.remove('modal-active');">Save Current Resume</button>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(r => `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem;">
      <div>
        <strong style="color: #ffffff; display: block; font-size: 0.95rem;">${escapeHtml(r.title || 'Untitled Resume')}</strong>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">Template: ${r.template || 'classic-professional'} | Candidate: ${escapeHtml(r.personal?.fullName || 'Untitled')}</span>
      </div>
      <div style="display: flex; gap: 0.5rem;">
        <button type="button" class="btn btn-primary btn-xs" onclick="loadSavedResumeById('${r.id || r.resumeId}')">Load</button>
        <button type="button" class="btn btn-outline btn-xs" onclick="deleteSavedResumeById('${r.id || r.resumeId}')">&times;</button>
      </div>
    </div>
  `).join('');
}

window.loadSavedResumeById = (id) => {
  let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
  let found = list.find(r => r.id === id || r.resumeId === id);

  if (found) {
    resumeState = JSON.parse(JSON.stringify(found));
    syncFormWithState();
    renderResume();
    document.getElementById('myResumesModal')?.classList.remove('modal-active');
    if (window.showToast) window.showToast('Resume loaded successfully!', 'success');
  }
};

window.deleteSavedResumeById = (id) => {
  if (confirm('Delete this saved resume?')) {
    let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
    list = list.filter(r => r.id !== id && r.resumeId !== id);
    localStorage.setItem('maa_saved_resumes', JSON.stringify(list));
    openMyResumesModal();
    if (window.showToast) window.showToast('Resume deleted.', 'info');
  }
};

function checkUrlLoadParam() {
  const params = new URLSearchParams(window.location.search);
  const loadId = params.get('load') || params.get('id');
  if (loadId) {
    setTimeout(() => {
      window.loadSavedResumeById(loadId);
    }, 300);
  }
}

function renderResume() {
  const canvas = getCanvas();
  if (!canvas) return;

  const s = resumeState;
  const app = s.appearance;

  canvas.style.setProperty('--cv-primary', app.primaryColor);
  canvas.style.setProperty('--cv-accent', app.accentColor);
  canvas.style.setProperty('--cv-font', app.fontFamily);

  canvas.className = `a4-page-canvas resume-paper template-${s.template} level-${s.level}`;

  let html = '';
  switch (s.template) {
    case 'modern-professional':
      html = renderTemplate_ModernProfessional(s);
      break;
    case 'minimal-clean':
      html = renderTemplate_MinimalClean(s);
      break;
    case 'student-fresher':
      html = renderTemplate_StudentFresher(s);
      break;
    case 'two-column-modern':
    case 'creative':
      html = renderTemplate_TwoColumnModern(s);
      break;
    case 'corporate':
    case 'executive':
    case 'elegant':
    case 'classic-professional':
    default:
      html = renderTemplate_ClassicProfessional(s);
      break;
  }

  canvas.innerHTML = html;
}

function renderTemplate_ClassicProfessional(s) {
  const p = s.personal;
  const hasPhoto = !!s.photo;
  const shape = s.appearance.photoShape;

  let out = `
    <header class="cv-header">
      <div class="cv-header-text">
        ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : '<h1 class="cv-name" style="color:#94a3b8;">Your Full Name</h1>'}
        ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
        <div class="cv-contact-row">
          ${p.mobile ? `<span class="cv-contact-item">📞 ${escapeHtml(p.mobile)}</span>` : ''}
          ${p.email ? `<span class="cv-contact-item">✉️ ${escapeHtml(p.email)}</span>` : ''}
          ${p.address ? `<span class="cv-contact-item">📍 ${escapeHtml(p.address)}</span>` : ''}
          ${p.linkedin ? `<span class="cv-contact-item">🌐 ${escapeHtml(p.linkedin)}</span>` : ''}
          ${p.github ? `<span class="cv-contact-item">💻 ${escapeHtml(p.github)}</span>` : ''}
          ${p.portfolio ? `<span class="cv-contact-item">🔗 ${escapeHtml(p.portfolio)}</span>` : ''}
        </div>
      </div>
      ${hasPhoto ? `<div class="cv-photo-container shape-${shape}"><img src="${s.photo}" alt="Photo"></div>` : ''}
    </header>
  `;

  out += renderStandardSections(s);
  out += renderFooterSignature(s);
  return out;
}

function renderTemplate_ModernProfessional(s) {
  const p = s.personal;
  const hasPhoto = !!s.photo;
  const shape = s.appearance.photoShape;

  let out = `
    <header class="cv-header modern-banner">
      <div class="cv-header-text">
        ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : '<h1 class="cv-name" style="color:#cbd5e1;">Your Full Name</h1>'}
        ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
        <div class="cv-contact-row">
          ${p.mobile ? `<span class="cv-contact-item">📞 ${escapeHtml(p.mobile)}</span>` : ''}
          ${p.email ? `<span class="cv-contact-item">✉️ ${escapeHtml(p.email)}</span>` : ''}
          ${p.address ? `<span class="cv-contact-item">📍 ${escapeHtml(p.address)}</span>` : ''}
        </div>
      </div>
      ${hasPhoto ? `<div class="cv-photo-container shape-${shape}"><img src="${s.photo}" alt="Photo"></div>` : ''}
    </header>
  `;

  out += renderStandardSections(s);
  out += renderFooterSignature(s);
  return out;
}

function renderTemplate_MinimalClean(s) {
  const p = s.personal;
  let out = `
    <header class="cv-header minimal-header">
      ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : '<h1 class="cv-name" style="color:#94a3b8;">Your Full Name</h1>'}
      ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
      <div class="cv-contact-row">
        ${p.mobile ? `<span class="cv-contact-item">${escapeHtml(p.mobile)}</span>` : ''}
        ${p.email ? `<span class="cv-contact-item">• ${escapeHtml(p.email)}</span>` : ''}
        ${p.address ? `<span class="cv-contact-item">• ${escapeHtml(p.address)}</span>` : ''}
      </div>
    </header>
  `;

  out += renderStandardSections(s);
  out += renderFooterSignature(s);
  return out;
}

function renderTemplate_StudentFresher(s) {
  const p = s.personal;
  const hasPhoto = !!s.photo;
  const shape = s.appearance.photoShape;

  let out = `
    <header class="cv-header student-header">
      <div class="cv-header-text">
        ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : '<h1 class="cv-name" style="color:#94a3b8;">Your Full Name</h1>'}
        ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
        <div class="cv-contact-row">
          ${p.mobile ? `<span class="cv-contact-item">📞 ${escapeHtml(p.mobile)}</span>` : ''}
          ${p.email ? `<span class="cv-contact-item">✉️ ${escapeHtml(p.email)}</span>` : ''}
          ${p.address ? `<span class="cv-contact-item">📍 ${escapeHtml(p.address)}</span>` : ''}
        </div>
      </div>
      ${hasPhoto ? `<divResume Maker ke poore reactive engine aur CSS ko refactor karke **100% working aur compact** bana diya gaya hai. 

Aap direct updated project download kar sakte hain:
📥 **Direct Google Drive Download:** [Maa-Enterprises-Production-Ready-Clean.zip](https://drive.google.com/file/d/1n29Yc6IFjlCFHALbUHx0D6ugEXLI_pSz/view?usp=drivesdk)

---

### File 1: `js/resume-maker.js` (Full File Code)
**File Path:** `js/resume-maker.js` *(Poora Select All karke Replace karein)*

```javascript
/**
 * Maa Enterprises — Cyber Cafe & Online Service Center
 * Modular Reactive Resume Maker Core Engine
 */

'use strict';

let resumeState = {
  id: 'res_' + Date.now(),
  title: 'Professional Resume',
  template: 'classic-professional',
  level: 'medium',
  appearance: {
    primaryColor: '#1e3a8a',
    accentColor: '#0284c7',
    fontFamily: "'Poppins', sans-serif",
    photoShape: 'circle'
  },
  personal: {
    fullName: '', jobTitle: '', fatherName: '', motherName: '', dob: '',
    gender: '', maritalStatus: '', nationality: 'Indian', mobile: '', email: '',
    address: '', linkedin: '', github: '', portfolio: ''
  },
  objective: '',
  education: [],
  experience: [],
  projects: [],
  skills: [],
  certifications: [],
  achievements: [],
  internships: [],
  languages: [],
  hobbies: [],
  customSections: [],
  declaration: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
  date: '',
  place: '',
  signature: { type: 'printed', imageData: null },
  photo: null
};

let currentZoom = 1.0;

const getEl = (id1, id2 = null) => document.getElementById(id1) || (id2 ? document.getElementById(id2) : null);
const getCanvas = () => getEl('liveResumeCanvas', 'resumePaper');

document.addEventListener('DOMContentLoaded', () => {
  initTemplates();
  initLevels();
  initAppearance();
  initPhoto();
  initSignature();
  initObjective();
  initDateToday();
  bindPersonal();
  bindDeclaration();
  initRepeatables();
  initToolbar();
  checkUrlLoad();
  renderResume();
});

function initTemplates() {
  document.querySelectorAll('.template-select-card').forEach(card => {
    card.addEventListener('click', () => {
      const tid = card.getAttribute('data-template-id');
      if (!tid) return;
      document.querySelectorAll('.template-select-card').forEach(c => {
        c.classList.remove('active');
        const btn = c.querySelector('.btn-use-template');
        if (btn) btn.textContent = 'Use Template';
      });
      card.classList.add('active');
      const activeBtn = card.querySelector('.btn-use-template');
      if (activeBtn) activeBtn.textContent = 'Selected';
      const badge = document.getElementById('activeTemplateBadge');
      if (badge) badge.textContent = tid.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      resumeState.template = tid;
      renderResume();
    });
  });
}

function initLevels() {
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = btn.getAttribute('data-level');
      if (!lvl) return;
      document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resumeState.level = lvl;
      document.querySelectorAll('.level-high-only').forEach(el => el.style.display = lvl === 'high' ? 'block' : 'none');
      document.querySelectorAll('.level-med-high').forEach(el => el.style.display = lvl !== 'low' ? 'block' : 'none');
      renderResume();
    });
  });
}

function initAppearance() {
  getEl('primaryColorInput')?.addEventListener('input', e => { resumeState.appearance.primaryColor = e.target.value; renderResume(); });
  getEl('accentColorInput')?.addEventListener('input', e => { resumeState.appearance.accentColor = e.target.value; renderResume(); });
  getEl('fontFamilySelect')?.addEventListener('change', e => { resumeState.appearance.fontFamily = e.target.value; renderResume(); });
  document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const shp = btn.getAttribute('data-shape');
      if (!shp) return;
      document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      resumeState.appearance.photoShape = shp;
      renderResume();
    });
  });
}

function initPhoto() {
  const fileInput = getEl('photoFileInput');
  fileInput?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      resumeState.photo = ev.target.result;
      const preview = getEl('photoAvatarPreview', 'photoThumbnailImg');
      if (preview) { preview.src = ev.target.result; preview.style.display = 'block'; }
      getEl('removePhotoBtn', 'btnRemovePhoto')?.style.setProperty('display', 'inline-block');
      renderResume();
    };
    reader.readAsDataURL(file);
  });

  getEl('removePhotoBtn', 'btnRemovePhoto')?.addEventListener('click', () => {
    resumeState.photo = null;
    if (fileInput) fileInput.value = '';
    const preview = getEl('photoAvatarPreview', 'photoThumbnailImg');
    if (preview) { preview.src = ''; preview.style.display = 'none'; }
    getEl('removePhotoBtn', 'btnRemovePhoto')?.style.setProperty('display', 'none');
    renderResume();
  });
}

function initSignature() {
  getEl('signatureTypeSelect')?.addEventListener('change', e => {
    resumeState.signature.type = e.target.value;
    const box = getEl('sigImageUploadBox', 'signatureUploadContainer');
    if (box) box.style.display = e.target.value === 'image' ? 'block' : 'none';
    renderResume();
  });
  getEl('signatureFileInput')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { resumeState.signature.imageData = ev.target.result; renderResume(); };
    reader.readAsDataURL(file);
  });
}

function initObjective() {
  const txt = getEl('objectiveTextarea', 'input_objective');
  document.querySelectorAll('.suggestion-pill').forEach(p => {
    p.addEventListener('click', () => {
      const t = p.getAttribute('data-text');
      if (txt && t) { txt.value = t; resumeState.objective = t; renderResume(); }
    });
  });
  txt?.addEventListener('input', e => { resumeState.objective = e.target.value; renderResume(); });
}

function initDateToday() {
  getEl('btnDateToday', 'btnSetDateToday')?.addEventListener('click', () => {
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const inp = getEl('resumeDateInput');
    if (inp) { inp.value = today; resumeState.date = today; renderResume(); }
  });
}

function bindPersonal() {
  ['fullName', 'jobTitle', 'fatherName', 'motherName', 'dob', 'gender', 'maritalStatus', 'nationality', 'mobile', 'email', 'address', 'linkedin', 'github', 'portfolio'].forEach(f => {
    getEl(`input_${f}`)?.addEventListener('input', e => { resumeState.personal[f] = e.target.value; renderResume(); });
  });
}

function bindDeclaration() {
  getEl('declarationTextarea', 'input_declaration')?.addEventListener('input', e => { resumeState.declaration = e.target.value; renderResume(); });
  getEl('resumeDateInput')?.addEventListener('input', e => { resumeState.date = e.target.value; renderResume(); });
  getEl('resumePlaceInput')?.addEventListener('input', e => { resumeState.place = e.target.value; renderResume(); });
}

function initRepeatables() {
  getEl('btnAddEducation')?.addEventListener('click', () => addRepeatable('education', { degree:'', institution:'', board:'', endYear:'', score:'' }, renderEduList));
  renderEduList();
  getEl('btnAddExperience')?.addEventListener('click', () => addRepeatable('experience', { title:'', company:'', location:'', start:'', description:'' }, renderExpList));
  renderExpList();
  getEl('btnAddProject')?.addEventListener('click', () => addRepeatable('projects', { title:'', tech:'', description:'' }, renderProjList));
  renderProjList();
  getEl('btnAddCertification')?.addEventListener('click', () => addRepeatable('certifications', { name:'', issuer:'' }, renderCertList));
  renderCertList();
  getEl('btnAddAchievement')?.addEventListener('click', () => addRepeatable('achievements', { title:'', issuer:'' }, renderAchList));
  renderAchList();
  getEl('btnAddInternship')?.addEventListener('click', () => addRepeatable('internships', { title:'', company:'', duration:'' }, renderInternList));
  renderInternList();
  getEl('btnAddCustomSection')?.addEventListener('click', () => addRepeatable('customSections', { title:'Key Strengths', content:'' }, renderCustomList));
  renderCustomList();

  bindTagAdder('skills', 'skillInput', 'skillChipsContainer', 'skillsTagList', 'btnAddSkill');
  bindTagAdder('languages', 'languageInput', 'languageChipsContainer', 'languagesTagList', 'btnAddLanguage');
  bindTagAdder('hobbies', 'hobbyInput', 'hobbyChipsContainer', 'hobbiesTagList', 'btnAddHobby');
}

function addRepeatable(key, obj, renderFn) {
  resumeState[key].push(obj);
  renderFn();
  renderResume();
}

function renderEduList() {
  const c = getEl('educationListContainer', 'educationFormList');
  if (!c) return;
  c.innerHTML = resumeState.education.map((it, idx) => `
    <div class="repeatable-card">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx+1} Education</span>
        <button type="button" class="btn-remove-card" onclick="removeEduItem(${idx})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Degree / Class</label><input type="text" class="form-input" value="${escapeHtml(it.degree)}" placeholder="e.g. 10th / 12th / B.Tech" oninput="resumeState.education[${idx}].degree=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Institution / University</label><input type="text" class="form-input" value="${escapeHtml(it.institution)}" placeholder="e.g. Patna University" oninput="resumeState.education[${idx}].institution=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Board</label><input type="text" class="form-input" value="${escapeHtml(it.board)}" placeholder="e.g. BSEB / CBSE" oninput="resumeState.education[${idx}].board=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Year</label><input type="text" class="form-input" value="${escapeHtml(it.endYear)}" placeholder="e.g. 2024" oninput="resumeState.education[${idx}].endYear=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Score / Marks</label><input type="text" class="form-input" value="${escapeHtml(it.score)}" placeholder="e.g. 84%" oninput="resumeState.education[${idx}].score=this.value; renderResume();"></div>
      </div>
    </div>
  `).join('');
}
window.removeEduItem = idx => { resumeState.education.splice(idx, 1); renderEduList(); renderResume(); };

function renderExpList() {
  const c = getEl('experienceListContainer', 'experienceFormList');
  if (!c) return;
  c.innerHTML = resumeState.experience.map((it, idx) => `
    <div class="repeatable-card">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx+1} Experience</span>
        <button type="button" class="btn-remove-card" onclick="removeExpItem(${idx})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Role</label><input type="text" class="form-input" value="${escapeHtml(it.title)}" placeholder="Job Title" oninput="resumeState.experience[${idx}].title=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Company</label><input type="text" class="form-input" value="${escapeHtml(it.company)}" placeholder="Company Name" oninput="resumeState.experience[${idx}].company=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Dates</label><input type="text" class="form-input" value="${escapeHtml(it.start)}" placeholder="2022 - Present" oninput="resumeState.experience[${idx}].start=this.value; renderResume();"></div>
        <div class="form-group full-width"><label class="form-label">Responsibilities</label><textarea class="form-textarea" rows="2" oninput="resumeState.experience[${idx}].description=this.value; renderResume();">${escapeHtml(it.description)}</textarea></div>
      </div>
    </div>
  `).join('');
}
window.removeExpItem = idx => { resumeState.experience.splice(idx, 1); renderExpList(); renderResume(); };

function renderProjList() {
  const c = getEl('projectsListContainer', 'projectsFormList');
  if (!c) return;
  c.innerHTML = resumeState.projects.map((it, idx) => `
    <div class="repeatable-card">
      <div class="repeatable-card-header">
        <span class="card-num">#${idx+1} Project</span>
        <button type="button" class="btn-remove-card" onclick="removeProjItem(${idx})">&times;</button>
      </div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Project Name</label><input type="text" class="form-input" value="${escapeHtml(it.title)}" oninput="resumeState.projects[${idx}].title=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Tech Stack</label><input type="text" class="form-input" value="${escapeHtml(it.tech)}" oninput="resumeState.projects[${idx}].tech=this.value; renderResume();"></div>
        <div class="form-group full-width"><label class="form-label">Summary</label><textarea class="form-textarea" rows="2" oninput="resumeState.projects[${idx}].description=this.value; renderResume();">${escapeHtml(it.description)}</textarea></div>
      </div>
    </div>
  `).join('');
}
window.removeProjItem = idx => { resumeState.projects.splice(idx, 1); renderProjList(); renderResume(); };

function renderCertList() {
  const c = getEl('certificationsListContainer', 'certificationsFormList');
  if (!c) return;
  c.innerHTML = resumeState.certifications.map((it, idx) => `
    <div class="repeatable-card">
      <div class="repeatable-card-header"><span class="card-num">#${idx+1} Certificate</span><button type="button" class="btn-remove-card" onclick="removeCertItem(${idx})">&times;</button></div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Title</label><input type="text" class="form-input" value="${escapeHtml(it.name)}" oninput="resumeState.certifications[${idx}].name=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Issuer & Year</label><input type="text" class="form-input" value="${escapeHtml(it.issuer)}" oninput="resumeState.certifications[${idx}].issuer=this.value; renderResume();"></div>
      </div>
    </div>
  `).join('');
}
window.removeCertItem = idx => { resumeState.certifications.splice(idx, 1); renderCertList(); renderResume(); };

function renderAchList() {
  const c = getEl('achievementsFormList', 'achievementsListContainer');
  if (!c) return;
  c.innerHTML = resumeState.achievements.map((it, idx) => `
    <div class="repeatable-card">
      <div class="repeatable-card-header"><span class="card-num">#${idx+1} Award / Honor</span><button type="button" class="btn-remove-card" onclick="removeAchItem(${idx})">&times;</button></div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Title</label><input type="text" class="form-input" value="${escapeHtml(it.title)}" oninput="resumeState.achievements[${idx}].title=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Organization & Year</label><input type="text" class="form-input" value="${escapeHtml(it.issuer)}" oninput="resumeState.achievements[${idx}].issuer=this.value; renderResume();"></div>
      </div>
    </div>
  `).join('');
}
window.removeAchItem = idx => { resumeState.achievements.splice(idx, 1); renderAchList(); renderResume(); };

function renderInternList() {
  const c = getEl('internshipsListContainer', 'internshipsFormList');
  if (!c) return;
  c.innerHTML = resumeState.internships.map((it, idx) => `
    <div class="repeatable-card">
      <div class="repeatable-card-header"><span class="card-num">#${idx+1} Training</span><button type="button" class="btn-remove-card" onclick="removeInternItem(${idx})">&times;</button></div>
      <div class="form-grid">
        <div class="form-group"><label class="form-label">Topic / Role</label><input type="text" class="form-input" value="${escapeHtml(it.title)}" oninput="resumeState.internships[${idx}].title=this.value; renderResume();"></div>
        <div class="form-group"><label class="form-label">Duration</label><input type="text" class="form-input" value="${escapeHtml(it.duration)}" oninput="resumeState.internships[${idx}].duration=this.value; renderResume();"></div>
      </div>
    </div>
  `).join('');
}
window.removeInternItem = idx => { resumeState.internships.splice(idx, 1); renderInternList(); renderResume(); };

function renderCustomList() {
  const c = getEl('customSectionsFormList', 'customSectionsListContainer');
  if (!c) return;
  c.innerHTML = resumeState.customSections.map((it, idx) => `
    <div class="repeatable-card">
      <div class="repeatable-card-header"><span class="card-num">#${idx+1} Custom Section</span><button type="button" class="btn-remove-card" onclick="removeCustomItem(${idx})">&times;</button></div>
      <div class="form-grid">
        <div class="form-group full-width"><label class="form-label">Heading</label><input type="text" class="form-input" value="${escapeHtml(it.title)}" oninput="resumeState.customSections[${idx}].title=this.value; renderResume();"></div>
        <div class="form-group full-width"><label class="form-label">Content</label><textarea class="form-textarea" rows="2" oninput="resumeState.customSections[${idx}].content=this.value; renderResume();">${escapeHtml(it.content)}</textarea></div>
      </div>
    </div>
  `).join('');
}
window.removeCustomItem = idx => { resumeState.customSections.splice(idx, 1); renderCustomList(); renderResume(); };

function bindTagAdder(key, inputId, c1, c2, btnId) {
  const inp = getEl(inputId);
  const btn = getEl(btnId);
  const add = () => {
    const val = inp?.value.trim();
    if (val && !resumeState[key].includes(val)) {
      resumeState[key].push(val);
      inp.value = '';
      renderTags(key, c1, c2);
      renderResume();
    }
  };
  inp?.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } });
  btn?.addEventListener('click', add);
  renderTags(key, c1, c2);
}

function renderTags(key, c1, c2) {
  const c = getEl(c1, c2);
  if (!c) return;
  c.innerHTML = resumeState[key].map((t, idx) => `
    <span class="tag-chip">
      <span>${escapeHtml(t)}</span>
      <button type="button" class="tag-remove-btn" onclick="removeTag('${key}', '${c1}', '${c2}', ${idx})">&times;</button>
    </span>
  `).join('');
}
window.removeTag = (key, c1, c2, idx) => { resumeState[key].splice(idx, 1); renderTags(key, c1, c2); renderResume(); };

function initToolbar() {
  getEl('btnZoomIn')?.addEventListener('click', () => setZoom(currentZoom + 0.1));
  getEl('btnZoomOut')?.addEventListener('click', () => setZoom(currentZoom - 0.1));
  getEl('btnLoadSample')?.addEventListener('click', loadSampleData);
  getEl('btnClearForm')?.addEventListener('click', clearForm);
  getEl('btnPrintResume')?.addEventListener('click', () => window.print());
  getEl('btnDownloadPdf')?.addEventListener('click', downloadPDF);
  getEl('btnSaveResume')?.addEventListener('click', saveResume);
  getEl('btnMyResumes')?.addEventListener('click', openMyResumes);
  getEl('btnDuplicateResume')?.addEventListener('click', duplicateResume);
}

function setZoom(val) {
  currentZoom = Math.min(Math.max(val, 0.5), 1.5);
  const cv = getCanvas();
  if (cv) cv.style.transform = `scale(${currentZoom})`;
}

function loadSampleData() {
  resumeState.personal = {
    fullName: 'Aarav Sharma', jobTitle: 'Web Developer & Data Executive',
    fatherName: 'Suresh Sharma', motherName: 'Sunita Sharma', dob: '15/07/2002',
    gender: 'Male', maritalStatus: 'Single', nationality: 'Indian',
    mobile: '+91 98765 43210', email: 'aarav.sharma@example.com',
    address: 'Mahalpar, Bihar Sharif, Nalanda - 803101',
    linkedin: '[linkedin.com/in/aarav-sharma](https://linkedin.com/in/aarav-sharma)', github: '[github.com/aarav-dev](https://github.com/aarav-dev)', portfolio: 'aarav.dev'
  };
  resumeState.objective = 'Skilled and motivated professional with hands-on experience in web development, online applications, and data management. Eager to contribute effectively to organizational growth.';
  resumeState.education = [
    { degree: 'B.Tech in Electronics & Communication', institution: 'State Engineering College', board: 'State University', endYear: '2024', score: '8.4 CGPA' },
    { degree: 'Intermediate (Class 12th PCM)', institution: 'Govt Senior Secondary School', board: 'BSEB', endYear: '2020', score: '82.6%' },
    { degree: 'Matriculation (Class 10th)', institution: 'High School Bihar Sharif', board: 'BSEB', endYear: '2018', score: '84.0%' }
  ];
  resumeState.experience = [
    { title: 'Computer Operator & Web Assistant', company: 'Digital Solutions Center', location: 'Bihar Sharif', start: '2024 - Present', description: 'Assisted in online government forms, student registration, document digitization, and database record keeping.' }
  ];
  resumeState.projects = [
    { title: 'Cyber Cafe Management Portal', tech: 'HTML, CSS, JavaScript, Firebase', description: 'Engineered an online request facilitation system with instant request tracking and receipt generator.' }
  ];
  resumeState.skills = ['Computer Operations', 'MS Office (Word, Excel)', 'JavaScript', 'HTML5 & CSS3', 'Fast Hindi & English Typing', 'Internet Banking & Form Filing'];
  resumeState.certifications = [{ name: 'Certificate in Computer Applications (CCA)', issuer: 'National Skill Board (2023)' }];
  resumeState.achievements = [{ title: '1st Position in District Typing & IT Quiz', issuer: 'District Education Forum, 2023' }];
  resumeState.internships = [{ title: 'IT & Digital Literacy Trainee', company: 'NIELIT Center (3 Months)' }];
  resumeState.languages = ['Hindi (Native)', 'English (Professional)'];
  resumeState.hobbies = ['Tech Blogging', 'Chess', 'Digital Editing'];
  resumeState.customSections = [{ title: 'Key Strengths', content: 'Fast learner, high typing speed, strong analytical mindset, and dedicated work ethic.' }];
  resumeState.date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  resumeState.place = 'Bihar Sharif';

  syncInputs();
  renderResume();
  if (window.showToast) window.showToast('Sample details loaded in editor & live preview!', 'success');
}

function syncInputs() {
  const p = resumeState.personal;
  for (const k in p) { const el = getEl(`input_${k}`); if (el) el.value = p[k] || ''; }
  const obj = getEl('objectiveTextarea', 'input_objective'); if (obj) obj.value = resumeState.objective || '';
  const decl = getEl('declarationTextarea', 'input_declaration'); if (decl) decl.value = resumeState.declaration || '';
  const dt = getEl('resumeDateInput'); if (dt) dt.value = resumeState.date || '';
  const pl = getEl('resumePlaceInput'); if (pl) pl.value = resumeState.place || '';
  renderEduList(); renderExpList(); renderProjList(); renderCertList(); renderAchList(); renderInternList(); renderCustomList();
  renderTags('skills', 'skillChipsContainer', 'skillsTagList');
  renderTags('languages', 'languageChipsContainer', 'languagesTagList');
  renderTags('hobbies', 'hobbyChipsContainer', 'hobbiesTagList');
}

function clearForm() {
  if (confirm('Clear all resume fields?')) {
    resumeState.personal = { fullName:'', jobTitle:'', fatherName:'', motherName:'', dob:'', gender:'', maritalStatus:'', nationality:'Indian', mobile:'', email:'', address:'', linkedin:'', github:'', portfolio:'' };
    resumeState.objective = ''; resumeState.education = []; resumeState.experience = []; resumeState.projects = []; resumeState.skills = []; resumeState.certifications = []; resumeState.achievements = []; resumeState.internships = []; resumeState.languages = []; resumeState.hobbies = []; resumeState.customSections = []; resumeState.photo = null;
    syncInputs();
    renderResume();
    if (window.showToast) window.showToast('Form cleared.', 'info');
  }
}

async function saveResume() {
  const title = prompt('Enter Resume Project Name:', resumeState.title || 'My Resume');
  if (!title) return;
  resumeState.title = title.trim();
  try {
    let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
    const idx = list.findIndex(r => r.id === resumeState.id);
    if (idx >= 0) list[idx] = resumeState; else list.unshift(resumeState);
    localStorage.setItem('maa_saved_resumes', JSON.stringify(list));
    if (window.FirebaseApp && window.FirebaseApp.db) {
      const { db, doc, setDoc, serverTimestamp } = window.FirebaseApp;
      await setDoc(doc(db, 'resumes', resumeState.id), { ...resumeState, serverTimestamp: serverTimestamp() });
    }
    if (window.showToast) window.showToast(`Resume "${resumeState.title}" saved!`, 'success');
  } catch (e) {
    if (window.showToast) window.showToast('Saved locally.', 'info');
  }
}

function duplicateResume() {
  const copy = JSON.parse(JSON.stringify(resumeState));
  copy.id = 'res_' + Date.now();
  copy.title = 'Copy of ' + (resumeState.title || 'Resume');
  resumeState = copy;
  syncInputs();
  renderResume();
  saveResume();
}

function openMyResumes() {
  let modal = getEl('myResumesModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'myResumesModal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal-card" style="max-width:560px; padding:1.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #334155; padding-bottom:0.75rem;">
          <h3 style="color:#fff; margin:0;">Saved Resumes</h3>
          <button type="button" class="btn-remove-card" onclick="document.getElementById('myResumesModal').classList.remove('modal-active')">&times;</button>
        </div>
        <div id="savedResumesList" style="max-height:360px; overflow-y:auto;"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  const listEl = getEl('savedResumesList');
  const list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
  if (list.length === 0) {
    listEl.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:1.5rem;">No saved resumes yet.</p>';
  } else {
    listEl.innerHTML = list.map(r => `
      <div style="background:rgba(255,255,255,0.04); border:1px solid #334155; border-radius:8px; padding:0.875rem; margin-bottom:0.6rem; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:#fff; display:block;">${escapeHtml(r.title || 'Resume')}</strong>
          <span style="font-size:0.8rem; color:#94a3b8;">${escapeHtml(r.personal?.fullName || 'Candidate')} (${r.template || 'Classic'})</span>
        </div>
        <div style="display:flex; gap:0.4rem;">
          <button type="button" class="btn btn-primary btn-xs" onclick="loadSavedResume('${r.id}')">Load</button>
          <button type="button" class="btn btn-outline btn-xs" onclick="deleteSavedResume('${r.id}')">&times;</button>
        </div>
      </div>
    `).join('');
  }
  modal.style.setProperty('display', 'flex', 'important');
  modal.classList.add('modal-active');
}

window.loadSavedResume = id => {
  const list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
  const found = list.find(r => r.id === id);
  if (found) {
    resumeState = JSON.parse(JSON.stringify(found));
    syncInputs();
    renderResume();
    getEl('myResumesModal')?.classList.remove('modal-active');
    if (window.showToast) window.showToast('Resume loaded!', 'success');
  }
};

window.deleteSavedResume = id => {
  if (confirm('Delete this resume?')) {
    let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
    list = list.filter(r => r.id !== id);
    localStorage.setItem('maa_saved_resumes', JSON.stringify(list));
    openMyResumes();
  }
};

function checkUrlLoad() {
  const loadId = new URLSearchParams(window.location.search).get('load');
  if (loadId) setTimeout(() => window.loadSavedResume(loadId), 300);
}

function downloadPDF() {
  const cv = getCanvas();
  if (!cv) return;
  const btn = getEl('btnDownloadPdf');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Generating PDF...'; }
  const opt = {
    margin: 0,
    filename: `${(resumeState.personal.fullName || 'Resume').replace(/\\s+/g, '_')}_Maa_Enterprises.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  if (window.html2pdf) {
    window.html2pdf().set(opt).from(cv).save().then(() => {
      if (btn) { btn.disabled = false; btn.innerHTML = 'Download PDF'; }
      if (window.showToast) window.showToast('PDF downloaded successfully!', 'success');
    }).catch(() => { if (btn) { btn.disabled = false; btn.innerHTML = 'Download PDF'; } window.print(); });
  } else {
    window.print();
    if (btn) { btn.disabled = false; btn.innerHTML = 'Download PDF'; }
  }
}

function renderResume() {
  const cv = getCanvas();
  if (!cv) return;

  const s = resumeState;
  const p = s.personal;
  const app = s.appearance;

  cv.style.setProperty('--cv-primary', app.primaryColor);
  cv.style.setProperty('--cv-accent', app.accentColor);
  cv.style.setProperty('--cv-font', app.fontFamily);
  cv.className = `a4-page-canvas resume-paper template-${s.template} level-${s.level}`;

  const isTwoCol = s.template === 'two-column-modern' || s.template === 'creative';
  const photoMarkup = s.photo ? `<div class="cv-photo-container shape-${app.photoShape}"><img src="${s.photo}" alt="Photo"></div>` : '';

  if (isTwoCol) {
    cv.innerHTML = `
      <div class="cv-two-column-layout">
        <aside class="cv-sidebar-col">
          ${photoMarkup}
          <h1 class="cv-name" style="font-size:13pt; margin-bottom:2mm;">${escapeHtml(p.fullName || 'Your Full Name')}</h1>
          ${p.jobTitle ? `<div class="cv-job-title" style="font-size:9pt; margin-bottom:4mm;">${escapeHtml(p.jobTitle)}</div>` : ''}
          <div class="cv-sidebar-section">
            <h3 class="cv-sidebar-title">Contact Details</h3>
            ${p.mobile ? `<p class="cv-sidebar-item">📞 ${escapeHtml(p.mobile)}</p>` : ''}
            ${p.email ? `<p class="cv-sidebar-item">✉️ ${escapeHtml(p.email)}</p>` : ''}
            ${p.address ? `<p class="cv-sidebar-item">📍 ${escapeHtml(p.address)}</p>` : ''}
            ${p.linkedin ? `<p class="cv-sidebar-item">🌐 ${escapeHtml(p.linkedin)}</p>` : ''}
            ${p.github ? `<p class="cv-sidebar-item">💻 ${escapeHtml(p.github)}</p>` : ''}
          </div>
          ${renderSkillsSection(s, true)}
          ${renderLanguagesSection(s, true)}
          ${renderHobbiesSection(s, true)}
          ${renderPersonalSection(s, true)}
        </aside>
        <main class="cv-main-col">
          ${renderObjectiveSection(s)}
          ${renderEducationSection(s)}
          ${renderExperienceSection(s)}
          ${renderProjectsSection(s)}
          ${renderAchievementsSection(s)}
          ${renderCertificationsSection(s)}
          ${renderInternshipsSection(s)}
          ${renderCustomSections(s)}
          ${renderSignatureSection(s)}
        </main>
      </div>
    `;
    return;
  }

  const isModernBanner = s.template === 'modern-professional';
  const isStudent = s.template === 'student-fresher';

  cv.innerHTML = `
    <header class="cv-header ${isModernBanner ? 'modern-banner' : ''}">
      <div class="cv-header-text">
        <h1 class="cv-name">${escapeHtml(p.fullName || 'Your Full Name')}</h1>
        ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
        <div class="cv-contact-row">
          ${p.mobile ? `<span class="cv-contact-item">📞 ${escapeHtml(p.mobile)}</span>` : ''}
          ${p.email ? `<span class="cv-contact-item">✉️ ${escapeHtml(p.email)}</span>` : ''}
          ${p.address ? `<span class="cv-contact-item">📍 ${escapeHtml(p.address)}</span>` : ''}
          ${p.linkedin ? `<span class="cv-contact-item">🌐 ${escapeHtml(p.linkedin)}</span>` : ''}
          ${p.github ? `<span class="cv-contact-item">💻 ${escapeHtml(p.github)}</span>` : ''}
          ${p.portfolio ? `<span class="cv-contact-item">🔗 ${escapeHtml(p.portfolio)}</span>` : ''}
        </div>
      </div>
      ${photoMarkup}
    </header>

    ${renderObjectiveSection(s)}
    ${isStudent ? renderEducationSection(s) + renderSkillsSection(s) + renderProjectsSection(s) + renderExperienceSection(s) : renderExperienceSection(s) + renderEducationSection(s) + renderSkillsSection(s) + renderProjectsSection(s)}
    ${renderAchievementsSection(s)}
    ${renderCertificationsSection(s)}
    ${renderInternshipsSection(s)}
    ${renderLanguagesSection(s)}
    ${renderHobbiesSection(s)}
    ${renderCustomSections(s)}
    ${renderPersonalSection(s)}
    ${renderSignatureSection(s)}
  `;
}

function renderObjectiveSection(s) {
  if (!s.objective || !s.objective.trim()) return '';
  return `<section class="cv-section"><h2 class="cv-section-title">Profile Summary / Career Objective</h2><p class="cv-text">${escapeHtml(s.objective)}</p></section>`;
}

function renderEducationSection(s) {
  if (!s.education || s.education.length === 0) return '';
  const valid = s.education.filter(e => e.degree || e.institution);
  if (valid.length === 0) return '';
  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Education &amp; Academic Qualifications</h2>
      ${valid.map(e => `
        <div class="cv-block">
          <div class="cv-block-header"><span class="cv-block-title">${escapeHtml(e.degree || 'Degree')}</span><span class="cv-block-date">${escapeHtml(e.endYear || '')}</span></div>
          <div class="cv-block-sub">${escapeHtml(e.institution || '')} ${e.board ? '(' + escapeHtml(e.board) + ')' : ''}</div>
          ${e.score ? `<div class="cv-block-desc"><strong>Marks / Score:</strong> ${escapeHtml(e.score)}</div>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderExperienceSection(s) {
  if (!s.experience || s.experience.length === 0) return '';
  const valid = s.experience.filter(e => e.title || e.company);
  if (valid.length === 0) return '';
  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Work Experience</h2>
      ${valid.map(e => `
        <div class="cv-block">
          <div class="cv-block-header"><span class="cv-block-title">${escapeHtml(e.title || 'Role')} — ${escapeHtml(e.company || '')}</span><span class="cv-block-date">${escapeHtml(e.start || '')}</span></div>
          ${e.location ? `<div class="cv-block-sub">${escapeHtml(e.location)}</div>` : ''}
          ${e.description ? `<p class="cv-block-desc">${escapeHtml(e.description)}</p>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderSkillsSection(s, isSide = false) {
  if (!s.skills || s.skills.length === 0) return '';
  return `
    <section class="${isSide ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSide ? 'cv-sidebar-title' : 'cv-section-title'}">Skills &amp; Competencies</h2>
      <div class="cv-pill-container">${s.skills.map(sk => `<span class="cv-pill">${escapeHtml(sk)}</span>`).join('')}</div>
    </section>
  `;
}

function renderProjectsSection(s) {
  if (!s.projects || s.projects.length === 0) return '';
  const valid = s.projects.filter(p => p.title);
  if (valid.length === 0) return '';
  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Key Projects</h2>
      ${valid.map(p => `
        <div class="cv-block">
          <div class="cv-block-header"><span class="cv-block-title">${escapeHtml(p.title)}</span>${p.tech ? `<span class="cv-block-date">${escapeHtml(p.tech)}</span>` : ''}</div>
          ${p.description ? `<p class="cv-block-desc">${escapeHtml(p.description)}</p>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderAchievementsSection(s) {
  if (!s.achievements || s.achievements.length === 0) return '';
  const valid = s.achievements.filter(a => a.title);
  if (valid.length === 0) return '';
  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Achievements &amp; Honors</h2>
      <ul class="cv-list">${valid.map(a => `<li><strong>${escapeHtml(a.title)}</strong> ${a.issuer ? '— ' + escapeHtml(a.issuer) : ''}</li>`).join('')}</ul>
    </section>
  `;
}

function renderCertificationsSection(s) {
  if (!s.certifications || s.certifications.length === 0) return '';
  const valid = s.certifications.filter(c => c.name);
  if (valid.length === 0) return '';
  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Certifications &amp; Courses</h2>
      <ul class="cv-list">${valid.map(c => `<li><strong>${escapeHtml(c.name)}</strong> ${c.issuer ? '— ' + escapeHtml(c.issuer) : ''}</li>`).join('')}</ul>
    </section>
  `;
}

function renderInternshipsSection(s) {
  if (!s.internships || s.internships.length === 0) return '';
  const valid = s.internships.filter(i => i.title);
  if (valid.length === 0) return '';
  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Trainings &amp; Internships</h2>
      ${valid.map(i => `
        <div class="cv-block">
          <div class="cv-block-header"><span class="cv-block-title">${escapeHtml(i.title)}</span><span class="cv-block-date">${escapeHtml(i.duration || '')}</span></div>
          ${i.company ? `<div class="cv-block-sub">${escapeHtml(i.company)}</div>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderLanguagesSection(s, isSide = false) {
  if (!s.languages || s.languages.length === 0) return '';
  return `
    <section class="${isSide ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSide ? 'cv-sidebar-title' : 'cv-section-title'}">Languages</h2>
      <div class="cv-pill-container">${s.languages.map(l => `<span class="cv-pill">${escapeHtml(l)}</span>`).join('')}</div>
    </section>
  `;
}

function renderHobbiesSection(s, isSide = false) {
  if (!s.hobbies || s.hobbies.length === 0) return '';
  return `
    <section class="${isSide ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSide ? 'cv-sidebar-title' : 'cv-section-title'}">Hobbies &amp; Interests</h2>
      <div class="cv-pill-container">${s.hobbies.map(h => `<span class="cv-pill">${escapeHtml(h)}</span>`).join('')}</div>
    </section>
  `;
}

function renderCustomSections(s) {
  if (!s.customSections || s.customSections.length === 0) return '';
  const valid = s.customSections.filter(c => c.title);
  if (valid.length === 0) return '';
  return valid.map(c => `
    <section class="cv-section"><h2 class="cv-section-title">${escapeHtml(c.title)}</h2><p class="cv-text">${escapeHtml(c.content || '')}</p></section>
  `).join('');
}

function renderPersonalSection(s, isSide = false) {
  const p = s.personal;
  const items = [];
  if (p.fatherName) items.push({ k: "Father's Name", v: p.fatherName });
  if (p.motherName) items.push({ k: "Mother's Name", v: p.motherName });
  if (p.dob) items.push({ k: 'Date of Birth', v: p.dob });
  if (p.gender) items.push({ k: 'Gender', v: p.gender });
  if (p.maritalStatus) items.push({ k: 'Marital Status', v: p.maritalStatus });
  if (p.nationality) items.push({ k: 'Nationality', v: p.nationality });
  if (items.length === 0) return '';
  return `
    <section class="${isSide ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSide ? 'cv-sidebar-title' : 'cv-section-title'}">Personal Details</h2>
      <div class="cv-details-grid">
        ${items.map(it => `<div class="cv-detail-row"><span class="cv-detail-label">${escapeHtml(it.k)}:</span><span class="cv-detail-val">${escapeHtml(it.v)}</span></div>`).join('')}
      </div>
    </section>
  `;
}

function renderSignatureSection(s) {
  const name = s.personal.fullName || '';
  if (!s.declaration && !s.date && !s.place && !name) return '';
  return `
    <footer class="cv-footer">
      ${s.declaration ? `<p class="cv-declaration">${escapeHtml(s.declaration)}</p>` : ''}
      <div class="cv-sig-row">
        <div class="cv-date-place">
          ${s.place ? `<div><strong>Place:</strong> ${escapeHtml(s.place)}</div>` : ''}
          ${s.date ? `<div><strong>Date:</strong> ${escapeHtml(s.date)}</div>` : ''}
        </div>
        <div class="cv-sig-box">
          ${s.signature.type === 'image' && s.signature.imageData ? `<img src="${s.signature.imageData}" alt="Signature" class="cv-sig-img">` : ''}
          ${s.signature.type === 'cursive' && name ? `<div class="cv-sig-cursive">${escapeHtml(name)}</div>` : ''}
          <div class="cv-sig-name">${escapeHtml(name)}</div>
          <div class="cv-sig-label">(Signature of Candidate)</div>
        </div>
      </div>
    </footer>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

window.resumeState = resumeState;
window.renderResume = renderResume;
window.downloadResumePDF = downloadPDF;
window.saveResumeToStorage = saveResume;
window.openMyResumesModal = openMyResumes;

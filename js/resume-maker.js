/**
 * Maa Enterprises — Cyber Cafe & Online Service Center
 * Integrated Professional Resume Maker Core Engine (9 Templates & Multi-Level Support)
 */

'use strict';

/**
 * Central Reactive Resume State
 */
let resumeState = {
  id: 'res_' + Date.now(),
  title: 'My Professional Resume',
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

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('liveResumeCanvas')) return;

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

      resumeState.template = templateId;
      renderResume();
    });
  });
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
  const highOnlyFields = document.querySelectorAll('.level-high-only');
  const mediumFields = document.querySelectorAll('.level-med-high');
  const lowFields = document.querySelectorAll('.level-low-only');

  if (level === 'low') {
    highOnlyFields.forEach(el => el.style.display = 'none');
    mediumFields.forEach(el => el.style.display = 'none');
    lowFields.forEach(el => el.style.display = 'block');
  } else if (level === 'medium') {
    highOnlyFields.forEach(el => el.style.display = 'none');
    mediumFields.forEach(el => el.style.display = 'block');
    lowFields.forEach(el => el.style.display = 'block');
  } else {
    highOnlyFields.forEach(el => el.style.display = 'block');
    mediumFields.forEach(el => el.style.display = 'block');
    lowFields.forEach(el => el.style.display = 'block');
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
  const removeBtn = document.getElementById('btnRemovePhoto');

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      if (window.showToast) window.showToast('Photo size should be less than 2MB.', 'warning');
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
  const previewImg = document.getElementById('photoThumbnailImg');
  const placeholder = document.getElementById('photoPlaceholderIcon');
  const removeBtn = document.getElementById('btnRemovePhoto');

  if (dataUrl) {
    if (previewImg) {
      previewImg.src = dataUrl;
      previewImg.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';
    if (removeBtn) removeBtn.style.display = 'inline-block';
  } else {
    if (previewImg) {
      previewImg.src = '';
      previewImg.style.display = 'none';
    }
    if (placeholder) placeholder.style.display = 'block';
    if (removeBtn) removeBtn.style.display = 'none';
  }
}

function initSignatureControls() {
  const typeSelect = document.getElementById('signatureTypeSelect');
  const uploadContainer = document.getElementById('signatureUploadContainer');
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
  const textarea = document.getElementById('input_objective');

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
  const btn = document.getElementById('btnSetDateToday');
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
  const declInput = document.getElementById('input_declaration');
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
  // Education
  document.getElementById('btnAddEducation')?.addEventListener('click', () => addEducationItem());
  renderEducationFormList();

  // Experience
  document.getElementById('btnAddExperience')?.addEventListener('click', () => addExperienceItem());
  renderExperienceFormList();

  // Projects
  document.getElementById('btnAddProject')?.addEventListener('click', () => addProjectItem());
  renderProjectsFormList();

  // Certifications
  document.getElementById('btnAddCertification')?.addEventListener('click', () => addCertificationItem());
  renderCertificationsFormList();

  // Achievements
  document.getElementById('btnAddAchievement')?.addEventListener('click', () => addAchievementItem());
  renderAchievementsFormList();

  // Internships
  document.getElementById('btnAddInternship')?.addEventListener('click', () => addInternshipItem());
  renderInternshipsFormList();

  // Custom Sections
  document.getElementById('btnAddCustomSection')?.addEventListener('click', () => addCustomSection());
  renderCustomSectionsFormList();

  // Tags
  initTagsInput('skills', 'skillInput', 'skillsTagList');
  initTagsInput('languages', 'languageInput', 'languagesTagList');
  initTagsInput('hobbies', 'hobbyInput', 'hobbiesTagList');
}

/* Repeatable items logic */
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
  const container = document.getElementById('educationFormList');
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
  const container = document.getElementById('experienceFormList');
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
  const container = document.getElementById('projectsFormList');
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
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. E-Commerce Web Portal" oninput="updateProjectField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Technologies Used</label>
          <input type="text" class="form-input" value="${escapeHtml(item.tech)}" placeholder="e.g. React, Node.js, Firebase" oninput="updateProjectField(${idx}, 'tech', this.value)">
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
  const container = document.getElementById('certificationsFormList');
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
          <input type="text" class="form-input" value="${escapeHtml(item.name)}" placeholder="e.g. AWS Certified Developer" oninput="updateCertField(${idx}, 'name', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Issuing Body / Year</label>
          <input type="text" class="form-input" value="${escapeHtml(item.issuer)}" placeholder="e.g. Amazon Web Services (2024)" oninput="updateCertField(${idx}, 'issuer', this.value)">
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
  const container = document.getElementById('achievementsFormList');
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
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. 1st Prize in State Coding Hackathon" oninput="updateAchievementField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Organization &amp; Year</label>
          <input type="text" class="form-input" value="${escapeHtml(item.issuer)}" placeholder="e.g. Govt Technical Council, 2024" oninput="updateAchievementField(${idx}, 'issuer', this.value)">
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
  const container = document.getElementById('internshipsFormList');
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
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. Python Developer Intern" oninput="updateInternField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group">
          <label class="form-label">Organization / Duration</label>
          <input type="text" class="form-input" value="${escapeHtml(item.company)}" placeholder="e.g. NIELIT (3 Months)" oninput="updateInternField(${idx}, 'company', this.value)">
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
    title: data.title || 'Special Activities / Publications',
    content: data.content || ''
  });
  renderCustomSectionsFormList();
  renderResume();
}

function renderCustomSectionsFormList() {
  const container = document.getElementById('customSectionsFormList');
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
          <input type="text" class="form-input" value="${escapeHtml(item.title)}" placeholder="e.g. Publications / Volunteer Work" oninput="updateCustomSectionField(${idx}, 'title', this.value)">
        </div>
        <div class="form-group full-width">
          <label class="form-label">Section Details / Content</label>
          <textarea class="form-textarea" rows="2" placeholder="Enter bullet points or descriptive text..." oninput="updateCustomSectionField(${idx}, 'content', this.value)">${escapeHtml(item.content)}</textarea>
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

function initTagsInput(stateKey, inputId, containerId) {
  const input = document.getElementById(inputId);
  const container = document.getElementById(containerId);
  if (!input || !container) return;

  function addTag(val) {
    const clean = val.trim();
    if (clean && !resumeState[stateKey].includes(clean)) {
      resumeState[stateKey].push(clean);
      renderTagChips(stateKey, containerId);
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

  renderTagChips(stateKey, containerId);
}

function renderTagChips(stateKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = resumeState[stateKey].map((tag, idx) => `
    <span class="tag-chip">
      <span>${escapeHtml(tag)}</span>
      <button type="button" class="tag-remove-btn" onclick="removeTagItem('${stateKey}', '${containerId}', ${idx})">&times;</button>
    </span>
  `).join('');
}

window.removeTagItem = (stateKey, containerId, idx) => {
  resumeState[stateKey].splice(idx, 1);
  renderTagChips(stateKey, containerId);
  renderResume();
};

/* Toolbar Controls */
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
  const canvas = document.getElementById('liveResumeCanvas');
  if (canvas) {
    canvas.style.transform = `scale(${currentZoom})`;
  }
}

function printResume() {
  window.print();
}

/**
 * Save resume state to Firestore & LocalStorage
 */
async function saveResumeToStorage() {
  const title = prompt('Enter a title for this resume project:', resumeState.title || (resumeState.personal.fullName ? resumeState.personal.fullName + ' Resume' : 'My Professional Resume'));
  if (title === null) return; // user cancelled

  resumeState.title = title.trim() || 'My Resume';

  try {
    if (window.AuthService && typeof window.AuthService.saveUserResume === 'function') {
      await window.AuthService.saveUserResume(resumeState);
    } else {
      let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
      const idx = list.findIndex(r => r.id === resumeState.id);
      if (idx >= 0) list[idx] = resumeState;
      else list.unshift(resumeState);
      localStorage.setItem('maa_saved_resumes', JSON.stringify(list));
    }
    if (window.showToast) window.showToast('Resume "' + resumeState.title + '" saved successfully!', 'success');
  } catch (err) {
    if (window.showToast) window.showToast('Failed to save resume: ' + err.message, 'error');
  }
}

/**
 * Duplicate Current Resume Project
 */
function duplicateCurrentResume() {
  const copy = JSON.parse(JSON.stringify(resumeState));
  copy.id = 'res_' + Date.now();
  copy.title = 'Copy of ' + (resumeState.title || 'Resume');
  resumeState = copy;
  syncFormWithState();
  renderResume();
  saveResumeToStorage();
}

/**
 * Open Modal with Saved Resumes
 */
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

  let list = [];
  try {
    if (window.AuthService && typeof window.AuthService.getUserResumes === 'function') {
      const user = window.AuthService.currentUser ? window.AuthService.currentUser() : null;
      list = await window.AuthService.getUserResumes(user);
    } else {
      list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
    }
  } catch (e) {
    list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
  }

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

window.loadSavedResumeById = async (id) => {
  let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
  let found = list.find(r => r.id === id || r.resumeId === id);

  if (!found && window.AuthService) {
    const user = window.AuthService.currentUser ? window.AuthService.currentUser() : null;
    const all = await window.AuthService.getUserResumes(user);
    found = all.find(r => r.id === id || r.resumeId === id);
  }

  if (found) {
    resumeState = JSON.parse(JSON.stringify(found));
    syncFormWithState();
    renderResume();
    document.getElementById('myResumesModal')?.classList.remove('modal-active');
    if (window.showToast) window.showToast('Resume "' + (found.title || 'Resume') + '" loaded!', 'success');
  }
};

window.deleteSavedResumeById = async (id) => {
  if (confirm('Delete this saved resume?')) {
    if (window.AuthService && typeof window.AuthService.deleteUserResume === 'function') {
      await window.AuthService.deleteUserResume(id);
    } else {
      let list = JSON.parse(localStorage.getItem('maa_saved_resumes') || '[]');
      list = list.filter(r => r.id !== id && r.resumeId !== id);
      localStorage.setItem('maa_saved_resumes', JSON.stringify(list));
    }
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

/**
 * Main Render Engine for Live Canvas
 */
function renderResume() {
  const canvas = document.getElementById('liveResumeCanvas');
  if (!canvas) return;

  const s = resumeState;
  const app = s.appearance;

  canvas.style.setProperty('--cv-primary', app.primaryColor);
  canvas.style.setProperty('--cv-accent', app.accentColor);
  canvas.style.setProperty('--cv-font', app.fontFamily);

  canvas.className = `a4-page-canvas template-${s.template} level-${s.level}`;

  let html = '';
  switch (s.template) {
    case 'modern-professional':
      html = renderTemplate_ModernProfessional(s);
      break;
    case 'minimal-clean':
      html = renderTemplate_MinimalClean(s);
      break;
    case 'corporate':
      html = renderTemplate_Corporate(s);
      break;
    case 'elegant':
      html = renderTemplate_Elegant(s);
      break;
    case 'creative':
      html = renderTemplate_Creative(s);
      break;
    case 'executive':
      html = renderTemplate_Executive(s);
      break;
    case 'student-fresher':
      html = renderTemplate_StudentFresher(s);
      break;
    case 'two-column-modern':
      html = renderTemplate_TwoColumnModern(s);
      break;
    case 'classic-professional':
    default:
      html = renderTemplate_ClassicProfessional(s);
      break;
  }

  canvas.innerHTML = html;
}

/* ==========================================================================
   TEMPLATE RENDERERS (9 Standardized Templates)
   ========================================================================== */

function renderTemplate_ClassicProfessional(s) {
  const p = s.personal;
  const hasPhoto = !!s.photo;
  const shape = s.appearance.photoShape;

  let out = `
    <header class="cv-header">
      <div class="cv-header-text">
        ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : ''}
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
      ${hasPhoto ? `<div class="cv-photo-container shape-${shape}"><img src="${s.photo}" alt="${escapeHtml(p.fullName || 'Photo')}"></div>` : ''}
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
        ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : ''}
        ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
        <div class="cv-contact-row">
          ${p.mobile ? `<span class="cv-contact-item">📞 ${escapeHtml(p.mobile)}</span>` : ''}
          ${p.email ? `<span class="cv-contact-item">✉️ ${escapeHtml(p.email)}</span>` : ''}
          ${p.address ? `<span class="cv-contact-item">📍 ${escapeHtml(p.address)}</span>` : ''}
        </div>
      </div>
      ${hasPhoto ? `<div class="cv-photo-container shape-${shape}"><img src="${s.photo}" alt="${escapeHtml(p.fullName || 'Photo')}"></div>` : ''}
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
      ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : ''}
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

function renderTemplate_Corporate(s) {
  return renderTemplate_ClassicProfessional(s);
}

function renderTemplate_Elegant(s) {
  return renderTemplate_ClassicProfessional(s);
}

function renderTemplate_Creative(s) {
  return renderTemplate_TwoColumnModern(s);
}

function renderTemplate_Executive(s) {
  return renderTemplate_ClassicProfessional(s);
}

function renderTemplate_StudentFresher(s) {
  const p = s.personal;
  const hasPhoto = !!s.photo;
  const shape = s.appearance.photoShape;

  let out = `
    <header class="cv-header student-header">
      <div class="cv-header-text">
        ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : ''}
        ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
        <div class="cv-contact-row">
          ${p.mobile ? `<span class="cv-contact-item">📞 ${escapeHtml(p.mobile)}</span>` : ''}
          ${p.email ? `<span class="cv-contact-item">✉️ ${escapeHtml(p.email)}</span>` : ''}
          ${p.address ? `<span class="cv-contact-item">📍 ${escapeHtml(p.address)}</span>` : ''}
        </div>
      </div>
      ${hasPhoto ? `<div class="cv-photo-container shape-${shape}"><img src="${s.photo}" alt="${escapeHtml(p.fullName || 'Photo')}"></div>` : ''}
    </header>
  `;

  // Student emphasizes Objective, Education, Skills, Projects, Achievements first
  if (s.objective) {
    out += `<section class="cv-section"><h2 class="cv-section-title">Career Objective</h2><p class="cv-text">${escapeHtml(s.objective)}</p></section>`;
  }
  out += renderEducationBlock(s);
  out += renderSkillsBlock(s);
  out += renderProjectsBlock(s);
  out += renderAchievementsBlock(s);
  out += renderCertificationsBlock(s);
  out += renderInternshipsBlock(s);
  out += renderExperienceBlock(s);
  out += renderLanguagesBlock(s);
  out += renderHobbiesBlock(s);
  out += renderCustomSectionsBlock(s);
  out += renderPersonalDetailsBlock(s);
  out += renderFooterSignature(s);
  return out;
}

function renderTemplate_TwoColumnModern(s) {
  const p = s.personal;
  const hasPhoto = !!s.photo;
  const shape = s.appearance.photoShape;

  return `
    <div class="cv-two-column-layout">
      <aside class="cv-sidebar-col">
        ${hasPhoto ? `<div class="cv-photo-container shape-${shape}"><img src="${s.photo}" alt="${escapeHtml(p.fullName || 'Photo')}"></div>` : ''}
        ${p.fullName ? `<h1 class="cv-name">${escapeHtml(p.fullName)}</h1>` : ''}
        ${p.jobTitle ? `<div class="cv-job-title">${escapeHtml(p.jobTitle)}</div>` : ''}
        
        <div class="cv-sidebar-section">
          <h3 class="cv-sidebar-title">Contact</h3>
          ${p.mobile ? `<p class="cv-sidebar-item">📞 ${escapeHtml(p.mobile)}</p>` : ''}
          ${p.email ? `<p class="cv-sidebar-item">✉️ ${escapeHtml(p.email)}</p>` : ''}
          ${p.address ? `<p class="cv-sidebar-item">📍 ${escapeHtml(p.address)}</p>` : ''}
        </div>

        ${renderSkillsBlock(s, true)}
        ${renderLanguagesBlock(s, true)}
        ${renderHobbiesBlock(s, true)}
        ${renderPersonalDetailsBlock(s, true)}
      </aside>

      <main class="cv-main-col">
        ${s.objective ? `<section class="cv-section"><h2 class="cv-section-title">Profile Summary</h2><p class="cv-text">${escapeHtml(s.objective)}</p></section>` : ''}
        ${renderExperienceBlock(s)}
        ${renderEducationBlock(s)}
        ${renderProjectsBlock(s)}
        ${renderAchievementsBlock(s)}
        ${renderCertificationsBlock(s)}
        ${renderInternshipsBlock(s)}
        ${renderCustomSectionsBlock(s)}
        ${renderFooterSignature(s)}
      </main>
    </div>
  `;
}

/* ==========================================================================
   BLOCK RENDERERS (Modular Section Builders)
   ========================================================================== */

function renderStandardSections(s) {
  let out = '';
  if (s.objective && s.objective.trim()) {
    out += `
      <section class="cv-section">
        <h2 class="cv-section-title">Profile Summary</h2>
        <p class="cv-text">${escapeHtml(s.objective)}</p>
      </section>
    `;
  }

  out += renderExperienceBlock(s);
  out += renderEducationBlock(s);
  out += renderSkillsBlock(s);
  out += renderProjectsBlock(s);
  out += renderCertificationsBlock(s);
  out += renderAchievementsBlock(s);
  out += renderInternshipsBlock(s);
  out += renderLanguagesBlock(s);
  out += renderHobbiesBlock(s);
  out += renderCustomSectionsBlock(s);
  out += renderPersonalDetailsBlock(s);

  return out;
}

function renderExperienceBlock(s) {
  if (!s.experience || s.experience.length === 0) return '';
  const validExp = s.experience.filter(e => e.company || e.title);
  if (validExp.length === 0) return '';

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Work Experience</h2>
      ${validExp.map(e => `
        <div class="cv-block">
          <div class="cv-block-header">
            <span class="cv-block-title">${escapeHtml(e.title || 'Role')} — ${escapeHtml(e.company || 'Company')}</span>
            <span class="cv-block-date">${escapeHtml(e.start || '')} ${e.end ? '– ' + escapeHtml(e.end) : ''}</span>
          </div>
          ${e.location ? `<div class="cv-block-sub">${escapeHtml(e.location)}</div>` : ''}
          ${e.description ? `<p class="cv-block-desc">${escapeHtml(e.description)}</p>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderEducationBlock(s) {
  if (!s.education || s.education.length === 0) return '';
  const validEdu = s.education.filter(ed => ed.degree || ed.institution);
  if (validEdu.length === 0) return '';

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Education &amp; Qualifications</h2>
      ${validEdu.map(ed => `
        <div class="cv-block">
          <div class="cv-block-header">
            <span class="cv-block-title">${escapeHtml(ed.degree || 'Degree')}</span>
            <span class="cv-block-date">${escapeHtml(ed.startYear || '')} ${ed.endYear ? '– ' + escapeHtml(ed.endYear) : ''}</span>
          </div>
          <div class="cv-block-sub">${escapeHtml(ed.institution || '')} ${ed.board ? '(' + escapeHtml(ed.board) + ')' : ''}</div>
          ${ed.score ? `<div class="cv-block-desc"><strong>Score / Marks:</strong> ${escapeHtml(ed.score)}</div>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderSkillsBlock(s, isSidebar = false) {
  if (!s.skills || s.skills.length === 0) return '';
  return `
    <section class="${isSidebar ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSidebar ? 'cv-sidebar-title' : 'cv-section-title'}">Skills &amp; Competencies</h2>
      <div class="cv-pill-container">
        ${s.skills.map(sk => `<span class="cv-pill">${escapeHtml(sk)}</span>`).join('')}
      </div>
    </section>
  `;
}

function renderProjectsBlock(s) {
  if (!s.projects || s.projects.length === 0) return '';
  const validProj = s.projects.filter(p => p.title);
  if (validProj.length === 0) return '';

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Key Projects</h2>
      ${validProj.map(p => `
        <div class="cv-block">
          <div class="cv-block-header">
            <span class="cv-block-title">${escapeHtml(p.title)}</span>
            ${p.tech ? `<span class="cv-block-date">${escapeHtml(p.tech)}</span>` : ''}
          </div>
          ${p.description ? `<p class="cv-block-desc">${escapeHtml(p.description)}</p>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderCertificationsBlock(s) {
  if (!s.certifications || s.certifications.length === 0) return '';
  const validCerts = s.certifications.filter(c => c.name);
  if (validCerts.length === 0) return '';

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Certifications &amp; Courses</h2>
      <ul class="cv-list">
        ${validCerts.map(c => `
          <li><strong>${escapeHtml(c.name)}</strong> — ${escapeHtml(c.issuer || '')}</li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderAchievementsBlock(s) {
  if (!s.achievements || s.achievements.length === 0) return '';
  const validAch = s.achievements.filter(a => a.title);
  if (validAch.length === 0) return '';

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Achievements &amp; Awards</h2>
      <ul class="cv-list">
        ${validAch.map(a => `
          <li><strong>${escapeHtml(a.title)}</strong> ${a.issuer ? '— ' + escapeHtml(a.issuer) : ''}</li>
        `).join('')}
      </ul>
    </section>
  `;
}

function renderInternshipsBlock(s) {
  if (!s.internships || s.internships.length === 0) return '';
  const validInt = s.internships.filter(i => i.title);
  if (validInt.length === 0) return '';

  return `
    <section class="cv-section">
      <h2 class="cv-section-title">Training &amp; Internships</h2>
      ${validInt.map(i => `
        <div class="cv-block">
          <div class="cv-block-header">
            <span class="cv-block-title">${escapeHtml(i.title)}</span>
            <span class="cv-block-date">${escapeHtml(i.duration || '')}</span>
          </div>
          ${i.company ? `<div class="cv-block-sub">${escapeHtml(i.company)}</div>` : ''}
        </div>
      `).join('')}
    </section>
  `;
}

function renderLanguagesBlock(s, isSidebar = false) {
  if (!s.languages || s.languages.length === 0) return '';
  return `
    <section class="${isSidebar ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSidebar ? 'cv-sidebar-title' : 'cv-section-title'}">Languages</h2>
      <div class="cv-pill-container">
        ${s.languages.map(l => `<span class="cv-pill">${escapeHtml(l)}</span>`).join('')}
      </div>
    </section>
  `;
}

function renderHobbiesBlock(s, isSidebar = false) {
  if (!s.hobbies || s.hobbies.length === 0) return '';
  return `
    <section class="${isSidebar ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSidebar ? 'cv-sidebar-title' : 'cv-section-title'}">Hobbies &amp; Interests</h2>
      <div class="cv-pill-container">
        ${s.hobbies.map(h => `<span class="cv-pill">${escapeHtml(h)}</span>`).join('')}
      </div>
    </section>
  `;
}

function renderCustomSectionsBlock(s) {
  if (!s.customSections || s.customSections.length === 0) return '';
  const validCustom = s.customSections.filter(c => c.title);
  if (validCustom.length === 0) return '';

  return validCustom.map(c => `
    <section class="cv-section">
      <h2 class="cv-section-title">${escapeHtml(c.title)}</h2>
      <p class="cv-text">${escapeHtml(c.content || '')}</p>
    </section>
  `).join('');
}

function renderPersonalDetailsBlock(s, isSidebar = false) {
  const p = s.personal;
  const items = [];

  if (p.fatherName) items.push({ label: "Father's Name", val: p.fatherName });
  if (p.motherName) items.push({ label: "Mother's Name", val: p.motherName });
  if (p.dob) items.push({ label: 'Date of Birth', val: p.dob });
  if (p.gender) items.push({ label: 'Gender', val: p.gender });
  if (p.maritalStatus) items.push({ label: 'Marital Status', val: p.maritalStatus });
  if (p.nationality) items.push({ label: 'Nationality', val: p.nationality });

  if (items.length === 0) return '';

  return `
    <section class="${isSidebar ? 'cv-sidebar-section' : 'cv-section'}">
      <h2 class="${isSidebar ? 'cv-sidebar-title' : 'cv-section-title'}">Personal Details</h2>
      <div class="cv-details-grid">
        ${items.map(it => `
          <div class="cv-detail-row">
            <span class="cv-detail-label">${escapeHtml(it.label)}:</span>
            <span class="cv-detail-val">${escapeHtml(it.val)}</span>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderFooterSignature(s) {
  const hasDecl = !!(s.declaration && s.declaration.trim());
  const hasMeta = !!(s.date || s.place);
  const sig = s.signature;
  const name = s.personal.fullName || '';

  if (!hasDecl && !hasMeta && !name) return '';

  return `
    <footer class="cv-footer">
      ${hasDecl ? `<p class="cv-declaration">${escapeHtml(s.declaration)}</p>` : ''}
      <div class="cv-sig-row">
        <div class="cv-date-place">
          ${s.place ? `<div><strong>Place:</strong> ${escapeHtml(s.place)}</div>` : ''}
          ${s.date ? `<div><strong>Date:</strong> ${escapeHtml(s.date)}</div>` : ''}
        </div>
        <div class="cv-sig-box">
          ${sig.type === 'image' && sig.imageData ? `<img src="${sig.imageData}" alt="Signature" class="cv-sig-img">` : ''}
          ${sig.type === 'cursive' && name ? `<div class="cv-sig-cursive">${escapeHtml(name)}</div>` : ''}
          <div class="cv-sig-name">${escapeHtml(name)}</div>
          <div class="cv-sig-label">(Signature of Candidate)</div>
        </div>
      </div>
    </footer>
  `;
}

/**
 * Generate PDF Download via html2pdf
 */
function downloadResumePDF() {
  const canvas = document.getElementById('liveResumeCanvas');
  if (!canvas) return;

  const btn = document.getElementById('btnDownloadPdf');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Generating PDF...';
  }

  const opt = {
    margin: 0,
    filename: `${(resumeState.personal.fullName || 'Resume').replace(/\s+/g, '_')}_Maa_Enterprises.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  if (window.html2pdf) {
    window.html2pdf().set(opt).from(canvas).save().then(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF';
      }
      if (window.showToast) window.showToast('PDF downloaded successfully!', 'success');
    }).catch(err => {
      console.error(err);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Download PDF';
      }
      window.print();
    });
  } else {
    window.print();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = 'Download PDF';
    }
  }
}

/**
 * Load Sample Neutral Demo Candidate Data
 */
function loadSampleData() {
  resumeState = {
    id: 'res_' + Date.now(),
    title: 'Aarav Sharma — Full Stack Developer Resume',
    template: resumeState.template || 'classic-professional',
    level: 'high',
    appearance: {
      primaryColor: '#1e3a8a',
      accentColor: '#0284c7',
      fontFamily: "'Poppins', sans-serif",
      photoShape: 'circle'
    },
    personal: {
      fullName: 'Aarav Sharma',
      jobTitle: 'Full Stack Web Developer & UI Engineer',
      fatherName: 'Suresh Sharma',
      motherName: 'Sunita Sharma',
      dob: '15/07/2002',
      gender: 'Male',
      maritalStatus: 'Single',
      nationality: 'Indian',
      mobile: '+91 98765 43210',
      email: 'aarav.sharma@example.com',
      address: 'Station Road, Model Town, City Center - 110001',
      linkedin: 'linkedin.com/in/aarav-dev-sample',
      github: 'github.com/aarav-sample',
      portfolio: 'aaravsharma.dev'
    },
    objective: 'Motivated Full Stack Developer with strong hands-on expertise in JavaScript, HTML5, CSS3, and modern backend architecture, seeking to build high-performance, user-friendly digital solutions.',
    education: [
      {
        degree: 'Bachelor of Technology (B.Tech in ECE)',
        institution: 'National Institute of Engineering',
        board: 'State Technical University',
        startYear: '2020',
        endYear: '2024',
        score: '8.4 CGPA'
      },
      {
        degree: 'Higher Secondary School Certificate (Class 12th PCM)',
        institution: 'Central Senior Secondary School',
        board: 'CBSE',
        startYear: '2018',
        endYear: '2020',
        score: '86.4%'
      }
    ],
    experience: [
      {
        title: 'Junior Web Developer',
        company: 'Apex Digital Solutions',
        location: 'Patna, Bihar',
        start: 'Jul 2024',
        end: 'Present',
        current: true,
        description: 'Developed responsive client web portals, integrated RESTful APIs, and optimized page load speed across mobile devices.'
      }
    ],
    projects: [
      {
        title: 'Cyber Cafe Management Portal',
        role: 'Full Stack Developer',
        tech: 'JavaScript, Firebase, CSS3',
        link: 'https://github.com/example',
        description: 'Built a real-time tracking application handling online customer service requests with automated status updates.'
      }
    ],
    skills: ['JavaScript (ES6+)', 'HTML5 & CSS3', 'React.js', 'Firebase / Firestore', 'Python', 'Git & GitHub', 'REST APIs'],
    certifications: [
      { name: 'Certified Web Application Developer', issuer: 'Govt National Skill Council (2024)' }
    ],
    achievements: [
      { title: '1st Prize in State Level Web Development Hackathon', issuer: 'Technical Education Board, 2024' }
    ],
    internships: [
      { title: 'Web Development Trainee', company: 'NIELIT Center', duration: '6 Months (2023)' }
    ],
    languages: ['Hindi (Native)', 'English (Professional)'],
    hobbies: ['Coding Open Source', 'Tech Blogging', 'Chess'],
    customSections: [
      {
        title: 'Key Strengths',
        content: 'Fast learner with excellent problem-solving ability, proactive team collaboration, and strong communication skills.'
      }
    ],
    declaration: 'I hereby declare that all the information provided above is true and correct to the best of my knowledge and belief.',
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    place: 'Bihar Sharif',
    signature: {
      type: 'printed',
      imageData: null
    },
    photo: null
  };

  syncFormWithState();
  renderResume();
  if (window.showToast) window.showToast('Sample resume data loaded.', 'info');
}

function syncFormWithState() {
  const p = resumeState.personal;
  for (const k in p) {
    const el = document.getElementById(`input_${k}`);
    if (el) el.value = p[k] || '';
  }

  const objEl = document.getElementById('input_objective');
  if (objEl) objEl.value = resumeState.objective || '';

  const declEl = document.getElementById('input_declaration');
  if (declEl) declEl.value = resumeState.declaration || '';

  const dateEl = document.getElementById('resumeDateInput');
  if (dateEl) dateEl.value = resumeState.date || '';

  const placeEl = document.getElementById('resumePlaceInput');
  if (placeEl) placeEl.value = resumeState.place || '';

  const primaryEl = document.getElementById('primaryColorInput');
  if (primaryEl) primaryEl.value = resumeState.appearance.primaryColor || '#1e3a8a';

  const accentEl = document.getElementById('accentColorInput');
  if (accentEl) accentEl.value = resumeState.appearance.accentColor || '#0284c7';

  renderEducationFormList();
  renderExperienceFormList();
  renderProjectsFormList();
  renderCertificationsFormList();
  renderAchievementsFormList();
  renderInternshipsFormList();
  renderCustomSectionsFormList();

  renderTagChips('skills', 'skillsTagList');
  renderTagChips('languages', 'languagesTagList');
  renderTagChips('hobbies', 'hobbiesTagList');
}

function confirmClearForm() {
  if (confirm('Are you sure you want to reset all fields and start fresh?')) {
    resumeState = {
      id: 'res_' + Date.now(),
      title: 'My Resume',
      template: resumeState.template || 'classic-professional',
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
    syncFormWithState();
    renderResume();
    if (window.showToast) window.showToast('Form cleared.', 'info');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Global Exports
window.resumeState = resumeState;
window.renderResume = renderResume;
window.downloadResumePDF = downloadResumePDF;
window.saveResumeToStorage = saveResumeToStorage;
window.openMyResumesModal = openMyResumesModal;

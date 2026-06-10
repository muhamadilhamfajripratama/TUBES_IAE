const VACANCY_API = "http://localhost:4002/";
const APPLICANT_API = "http://localhost:4003/";
const INTERVIEW_API = "http://localhost:4004/";

let selectedVacancyId = null;

// --- 1. Fungsi Halaman Dashboard (Cari Lowongan) ---
async function loadPelamarDashboard() {
    const userName = localStorage.getItem('userName') || 'Pelamar';
    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = userName;

    const query = `{ getVacancies { id, title, department, status } }`;
    try {
        const res = await fetch(VACANCY_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query }) });
        const jobs = (await res.json()).data.getVacancies;
        
        const tbody = document.getElementById('availableJobsBody');
        if (!tbody) return; 
        
        tbody.innerHTML = '';
        jobs.forEach(job => {
            if(job.status === 'Open' || job.status === 'Closed') {
                tbody.innerHTML += `<tr>
                    <td><strong>${job.title}</strong></td>
                    <td>${job.department}</td>
                    <td><span class="badge badge-active">${job.status}</span></td>
                    <td>
                        <button class="btn-primary" style="padding: 8px 15px; font-size: 13px;" onclick="openApplyModal(${job.id}, '${job.title}')">Apply Now</button>
                    </td>
                </tr>`;
            }
        });
    } catch (err) { console.error("Gagal load lowongan:", err); }
}

// --- 2. Fungsi Modal Apply CV ---
function openApplyModal(vacancyId, jobTitle) {
    selectedVacancyId = vacancyId;
    document.getElementById('modalJobTitle').innerText = `Apply for: ${jobTitle}`;
    document.getElementById('applyName').value = localStorage.getItem('userName') || '';
    document.getElementById('applyModal').style.display = 'flex';
}

function closeApplyModal() {
    document.getElementById('applyModal').style.display = 'none';
    selectedVacancyId = null;
}

async function submitApplication(event) {
    event.preventDefault();
    const userId = localStorage.getItem('userId');
    const cvFile = document.getElementById('applyCV').files[0];
    if(!userId) return window.location.href = 'login.html';
    if(!cvFile) return alert("Harap unggah CV (PDF)!");

    const mutation = `mutation { applyJob(user_id: ${userId}, vacancy_id: ${selectedVacancyId}, cv: "${cvFile.name}") { id } }`;
    try {
        const submitBtn = document.getElementById('submitApplyBtn');
        submitBtn.innerText = "Mengirim..."; submitBtn.disabled = true;
        await fetch(APPLICANT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: mutation }) });
        
        alert("Berhasil! Lamaran dikirim ke HR.");
        closeApplyModal();
        submitBtn.innerText = "Submit Application"; submitBtn.disabled = false;
        document.getElementById('applicationForm').reset();
    } catch (err) { alert("Terjadi kesalahan."); }
}

// --- 3. Fungsi Halaman My Applications ---
async function loadMyApplications() {
    const userId = localStorage.getItem('userId');
    if(!userId) return window.location.href = 'login.html';
    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = localStorage.getItem('userName');

    try {
        // Ambil Data Lamaran
        const appRes = await fetch(APPLICANT_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getApplicants { id user_id vacancy_id status } }`})});
        const allApps = (await appRes.json()).data.getApplicants;
        const myApps = allApps.filter(a => a.user_id == userId); // Filter milik user ini saja

        // Ambil Data Lowongan (Untuk menampilkan Nama Pekerjaan)
        const vacRes = await fetch(VACANCY_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getVacancies { id title department } }`})});
        const vacancies = (await vacRes.json()).data.getVacancies;

        const tbody = document.getElementById('myApplicationsBody');
        if(!tbody) return;
        tbody.innerHTML = '';

        myApps.forEach(app => {
            const job = vacancies.find(v => v.id == app.vacancy_id);
            tbody.innerHTML += `<tr>
                <td>#APP-${app.id}</td>
                <td><strong>${job ? job.title : 'Position Closed'}</strong></td>
                <td>${job ? job.department : '-'}</td>
                <td><span class="badge" style="background: rgba(255,112,67,0.1); color: var(--accent-orange);">${app.status}</span></td>
            </tr>`;
        });
    } catch(err) { console.error(err); }
}

// --- 4. Fungsi Halaman My Interviews ---
async function loadMyInterviews() {
    const userId = localStorage.getItem('userId');
    if(!userId) return window.location.href = 'login.html';
    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = localStorage.getItem('userName');

    try {
        // 1. Cari ID Lamaran (Applicant ID) milik User ini
        const appRes = await fetch(APPLICANT_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getApplicants { id user_id vacancy_id } }`})});
        const myApps = (await appRes.json()).data.getApplicants.filter(a => a.user_id == userId);
        const myAppIds = myApps.map(a => Number(a.id));

        // 2. Ambil jadwal Interview yang Applicant ID-nya cocok
        const intRes = await fetch(INTERVIEW_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getInterviews { id applicant_id scheduled_at interviewer } }`})});
        const myInts = (await intRes.json()).data.getInterviews.filter(i => myAppIds.includes(Number(i.applicant_id)));

        // 3. Ambil judul loker
        const vacRes = await fetch(VACANCY_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getVacancies { id title } }`})});
        const vacancies = (await vacRes.json()).data.getVacancies;

        const tbody = document.getElementById('myInterviewsBody');
        if(!tbody) return;
        tbody.innerHTML = '';

        myInts.forEach(inv => {
            const relatedApp = myApps.find(a => a.id == inv.applicant_id);
            const job = relatedApp ? vacancies.find(v => v.id == relatedApp.vacancy_id) : null;

            tbody.innerHTML += `<tr>
                <td><strong>${job ? job.title : '-'}</strong></td>
                <td>${inv.scheduled_at}</td>
                <td>${inv.interviewer}</td>
                <td><span class="badge badge-active">Scheduled</span></td>
            </tr>`;
        });
    } catch(err) { console.error(err); }
}

// Eksekusi otomatis berdasarkan halaman mana yang sedang dibuka
window.onload = () => {
    if(document.getElementById('availableJobsBody')) loadPelamarDashboard();
    if(document.getElementById('myApplicationsBody')) loadMyApplications();
    if(document.getElementById('myInterviewsBody')) loadMyInterviews();
};

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const fileInput =
            document.getElementById(
                "applyCV"
            );

        if (!fileInput) return;

        fileInput.addEventListener(
            "change",
            function () {

                const file =
                    this.files[0];

                const fileText =
                    document.getElementById(
                        "fileText"
                    );

                if (file) {

                    fileText.innerHTML =
                        `
                        <strong>
                        ${file.name}
                        </strong>
                        <br>
                        ${(file.size / 1024).toFixed(2)}
                        KB
                        `;

                } else {

                    fileText.innerHTML =
                        "Click to browse files or drag and drop";

                }
            }
        );
    }
);
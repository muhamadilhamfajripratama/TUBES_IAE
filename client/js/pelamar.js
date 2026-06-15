const VACANCY_API = "http://localhost:4002/";
const APPLICANT_API = "http://localhost:4003/";
const INTERVIEW_API = "http://localhost:4004/";

let selectedVacancyId = null;

// --- 1. Fungsi Halaman Dashboard (Cari Lowongan) ---
async function loadPelamarDashboard() {
    const userName = localStorage.getItem('userName') || 'Pelamar';
    const userId = localStorage.getItem('userId');
    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = userName;

    const queryVacancies = `{ getVacancies { id, title, department, status } }`;
    const queryApplications = `{ getApplicantsByUser(user_id: ${userId}) { vacancy_id } }`;

    try {
        const resVacancies = await fetch(VACANCY_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: queryVacancies }) });
        const jobs = (await resVacancies.json()).data.getVacancies;
        
        let appliedVacancyIds = [];
        if (userId) {
            const resApps = await fetch(APPLICANT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: queryApplications }) });
            const appsData = await resApps.json();
            if (appsData.data && appsData.data.getApplicantsByUser) {
                appliedVacancyIds = appsData.data.getApplicantsByUser.map(app => Number(app.vacancy_id));
            }
        }
        
        const tbody = document.getElementById('availableJobsBody');
        if (!tbody) return; 
        
        tbody.innerHTML = '';
        jobs.forEach(job => {
            if(job.status === 'Open' || job.status === 'Closed') {
                const hasApplied = appliedVacancyIds.includes(Number(job.id));
                
                let actionButton = '';
                if (hasApplied) {
                    actionButton = `<button class="btn-primary" style="padding: 8px 15px; font-size: 13px; background-color: #9ca3af; cursor: not-allowed; border-color: #9ca3af;" disabled>Applied</button>`;
                } else {
                    actionButton = `<button class="btn-primary" style="padding: 8px 15px; font-size: 13px;" onclick="openApplyModal(${job.id}, '${job.title}')">Apply Now</button>`;
                }

                tbody.innerHTML += `<tr>
                    <td><strong>${job.title}</strong></td>
                    <td>${job.department}</td>
                    <td><span class="badge badge-active">${job.status}</span></td>
                    <td>
                        ${actionButton}
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
    const submitBtn = document.getElementById('submitApplyBtn');
    
    // 1. Loading State
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengunggah...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    try {
        // Simulasi delay jaringan (1.5 detik) agar UI loading terlihat oleh user
        await new Promise(resolve => setTimeout(resolve, 1500));

        const res = await fetch(APPLICANT_API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: mutation }) });
        const result = await res.json();
        
        if(result.errors) {
            throw new Error(result.errors[0].message);
        }
        
        // 2. Success State
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> File Berhasil Diunggah';
        submitBtn.style.backgroundColor = '#10b981'; // Warna hijau sukses
        submitBtn.style.opacity = '1';
        
        // Tampilkan feedback sukses sejenak sebelum menutup modal
        setTimeout(() => {
            alert(`Berhasil! Dokumen "${cvFile.name}" telah dikirim ke HR.`);
            closeApplyModal();
            // Kembalikan tombol ke state awal
            submitBtn.innerHTML = originalBtnText; 
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = ''; // Hapus inline style agar kembali ke CSS default
            document.getElementById('applicationForm').reset();
            const fileText = document.getElementById("fileText");
            if (fileText) fileText.innerHTML = "Click to browse files or drag and drop";
            
            // Reload dashboard untuk memperbarui status tombol menjadi Applied
            if (document.getElementById('availableJobsBody')) {
                loadPelamarDashboard();
            }
        }, 800);
        
    } catch (err) { 
        // 3. Error State
        submitBtn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Gagal Mengunggah';
        submitBtn.style.backgroundColor = '#ef4444'; // Warna merah error
        setTimeout(() => {
            alert(err.message);
            submitBtn.innerHTML = originalBtnText; 
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = '';
        }, 1000);
    }
}

// --- 3. Fungsi Halaman My Applications ---
async function loadMyApplications() {
    const userId = localStorage.getItem('userId');
    if(!userId) return window.location.href = 'login.html';
    if(document.getElementById('profileName')) document.getElementById('profileName').innerText = localStorage.getItem('userName');

    try {
        // Ambil Data Lamaran
        const appRes = await fetch(APPLICANT_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getApplicants { id user_id vacancy_id status administrasi_status } }`})});
        const allApps = (await appRes.json()).data.getApplicants;
        const myApps = allApps.filter(a => a.user_id == userId); // Filter milik user ini saja

        // Ambil Data Lowongan (Untuk menampilkan Nama Pekerjaan)
        const vacRes = await fetch(VACANCY_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getVacancies { id title department } }`})});
        const vacancies = (await vacRes.json()).data.getVacancies;

        const tbody = document.getElementById('myApplicationsBody');
        if(!tbody) return;
        tbody.innerHTML = '';

        myApps.forEach((app, index) => {
            const job = vacancies.find(v => v.id == app.vacancy_id);
            
            // Dynamic badge color for main status
            let badgeStyle = app.status === 'Applied' 
                ? 'background: rgba(59, 130, 246, 0.1); color: #3b82f6;' 
                : app.status === 'Reject' 
                    ? 'background: rgba(239, 68, 68, 0.1); color: #ef4444;'
                    : 'background: rgba(107, 114, 128, 0.1); color: #6b7280;';
            
            // Dynamic badge color for administrasi status
            let adminStatus = app.administrasi_status || 'Pending';
            let adminBadgeStyle = adminStatus === 'Lolos' 
                ? 'background: rgba(16, 185, 129, 0.1); color: #10b981;' 
                : adminStatus === 'Tolak'
                    ? 'background: rgba(239, 68, 68, 0.1); color: #ef4444;'
                    : 'background: rgba(107, 114, 128, 0.1); color: #6b7280;';
            
            tbody.innerHTML += `<tr>
                <td>#APP-${app.id}</td>
                <td><strong>${job ? job.title : 'Position Closed'}</strong></td>
                <td>${job ? job.department : '-'}</td>
                <td><span class="badge" style="${adminBadgeStyle}">${adminStatus}</span></td>
                <td><span class="badge" style="${badgeStyle}">${app.status}</span></td>
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
        const intRes = await fetch(INTERVIEW_API, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({query: `{ getInterviews { id applicant_id scheduled_at interviewer result notes } }`})});
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

            let statusBadge = '<span style="padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 13px; background: rgba(59, 130, 246, 0.1); color: #3b82f6;">Scheduled</span>';
            
            if(inv.result === 'Lolos') {
                statusBadge = '<span style="padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 13px; background: rgba(16, 185, 129, 0.1); color: #10b981;">Lolos Interview</span>';
            } else if (inv.result === 'Tidak Lolos') {
                statusBadge = '<span style="padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 13px; background: rgba(239, 68, 68, 0.1); color: #ef4444;">Tidak Lolos</span>';
            }

            tbody.innerHTML += `<tr>
                <td><strong>${job ? job.title : '-'}</strong></td>
                <td>${inv.scheduled_at}</td>
                <td>${inv.interviewer}</td>
                <td>${statusBadge}</td>
            </tr>`;
        });
    } catch(err) { console.error(err); }
}

// Eksekusi otomatis berdasarkan halaman mana yang sedang dibuka
window.onload = () => {
    if(document.getElementById('availableJobsBody')) loadPelamarDashboard();
    if(document.getElementById('myApplicationsBody')) {
        loadMyApplications();
        // Polling (SWR Concept) to get real-time updates every 5 seconds
        setInterval(loadMyApplications, 5000); 
    }
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
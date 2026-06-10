const APPLICANT_API = "http://localhost:4003/";
const USER_API = "http://localhost:4001/";
const VACANCY_API = "http://localhost:4002/";

/* =========================
   PELAMAR APPLY JOB
========================= */
async function handleApplyJob(vacancyId) {

    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Sesi habis, silakan login ulang!");
        return;
    }

    const mutation = `
    mutation {
        applyJob(
            user_id:${userId},
            vacancy_id:${vacancyId}
        ){
            id
        }
    }`;

    try {

        const response = await fetch(APPLICANT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: mutation
            })
        });

        const result = await response.json();

        if (result.errors) {
            console.log(result.errors);
            return alert("Gagal melamar pekerjaan");
        }

        alert("Berhasil melamar pekerjaan!");

    } catch (err) {
        console.error(err);
        alert("Server Applicant tidak dapat diakses");
    }
}

/* =========================
   LOAD USERS DROPDOWN
========================= */
async function loadUsersDropdown() {

    const query = `
    {
        getUsers {
            id
            name
        }
    }`;

    try {

        const res = await fetch(USER_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        });

        const result = await res.json();

        const users = result.data?.getUsers || [];

        const select =
            document.getElementById("appUserId");

        if (!select) return;

        select.innerHTML = "";

        users.forEach(user => {

            select.innerHTML += `
            <option value="${user.id}">
                ${user.name}
            </option>`;
        });

    } catch (err) {
        console.error("Load Users Error:", err);
    }
}

/* =========================
   LOAD VACANCIES DROPDOWN
========================= */
async function loadVacanciesDropdown() {

    const query = `
    {
        getVacancies {
            id
            title
        }
    }`;

    try {

        const res = await fetch(VACANCY_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        });

        const result = await res.json();

        const vacancies =
            result.data?.getVacancies || [];

        const select =
            document.getElementById("appVacancyId");

        if (!select) return;

        select.innerHTML = "";

        vacancies.forEach(vacancy => {

            select.innerHTML += `
            <option value="${vacancy.id}">
                ${vacancy.title}
            </option>`;
        });

    } catch (err) {
        console.error("Load Vacancies Error:", err);
    }
}

/* =========================
   HR CREATE APPLICANT
========================= */
async function handleAddApplicant() {

    const userId =
        document.getElementById("appUserId").value;

    const vacancyId =
        document.getElementById("appVacancyId").value;

    if (!userId || !vacancyId) {
        return alert("Pilih User dan Vacancy terlebih dahulu");
    }

    const mutation = `
    mutation {
        applyJob(
            user_id:${userId},
            vacancy_id:${vacancyId},
            cv:"manual_entry_cv.pdf"
        ){
            id
        }
    }`;

    try {

        const res = await fetch(APPLICANT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: mutation
            })
        });

        const result = await res.json();

        if (result.errors) {
            console.log(result.errors);
            return alert("Gagal menambah applicant");
        }

        alert("Applicant berhasil ditambahkan");

        fetchApplicantsHR();

    } catch (err) {

        console.error(err);
        alert("Server Applicant Error");

    }
}

/* =========================
   GET ALL APPLICANTS
========================= */
async function fetchApplicantsHR() {

    const query = `
    {
        getApplicants {
            id
            user_id
            user_name
            vacancy_id
            vacancy_title
            cv
            administrasi_status
            status
        }
    }`;

    try {

        const res = await fetch(APPLICANT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        });

        const result = await res.json();

        const applicants =
            result.data?.getApplicants || [];

        const tbody =
            document.getElementById("applicantsTableBody");

        if (!tbody) return;

        tbody.innerHTML = "";

        applicants.forEach(app => {
            // Render CV column
            let cvCell = "-";
            if (app.cv) {
                cvCell = `
                    <a href="../uploads/sample_cv.pdf" target="_blank" style="color: #3b82f6; text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; gap: 4px;">
                        <i class="fa-solid fa-file-pdf" style="color: #ef4444; font-size: 16px;"></i>
                        <span>${app.cv}</span>
                    </a>
                `;
            }

            // Render Tahapan Administrasi column with buttons or static text badge
            let adminCell = "";
            let adminStatus = app.administrasi_status || 'Pending';
            if (adminStatus === 'Pending') {
                adminCell = `
                    <div style="display: flex; gap: 8px;">
                        <button onclick="updateAdministrasiStatus(${app.id}, 'Lolos')" style="background: #10b981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 13px; transition: all 0.2s;">
                            <i class="fa-solid fa-check"></i> Lolos
                        </button>
                        <button onclick="updateAdministrasiStatus(${app.id}, 'Tolak')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; font-size: 13px; transition: all 0.2s;">
                            <i class="fa-solid fa-xmark"></i> Tolak
                        </button>
                    </div>
                `;
            } else {
                let badgeStyle = adminStatus === 'Lolos' 
                    ? 'background: rgba(16, 185, 129, 0.1); color: #10b981;' 
                    : 'background: rgba(239, 68, 68, 0.1); color: #ef4444;';
                adminCell = `
                    <span style="padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block; ${badgeStyle}">
                        ${adminStatus}
                    </span>
                `;
            }

            // Render original Status column (Plain text badge, no buttons)
            let badgeStyle = app.status === 'Applied' 
                ? 'background: rgba(59, 130, 246, 0.1); color: #3b82f6;' 
                : app.status === 'Reject' 
                    ? 'background: rgba(239, 68, 68, 0.1); color: #ef4444;'
                    : 'background: rgba(107, 114, 128, 0.1); color: #6b7280;';
            let statusCell = `
                <span style="padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 13px; display: inline-block; ${badgeStyle}">
                    ${app.status}
                </span>
            `;

            tbody.innerHTML += `
            <tr>
                <td>#${app.id}</td>
                <td>${app.user_name || app.user_id}</td>
                <td>${app.vacancy_title || app.vacancy_id}</td>
                <td>${cvCell}</td>
                <td>${adminCell}</td>
                <td>${statusCell}</td>
            </tr>`;
        });

    } catch (err) {

        console.error("Fetch Applicant Error:", err);

    }
}

/* =========================
   UPDATE APPLICANT STATUS
========================= */
async function updateApplicantStatus(id, status) {
    const mutation = `
    mutation {
        updateApplicantStatus(
            id:${id},
            status:"${status}"
        ){
            id
            status
        }
    }`;

    try {
        const response = await fetch(APPLICANT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: mutation
            })
        });

        const result = await response.json();

        if (result.errors) {
            console.error(result.errors);
            return alert("Gagal mengubah status applicant");
        }

        alert(`Status applicant #${id} berhasil diubah menjadi ${status}!`);
        fetchApplicantsHR();

    } catch (err) {
        console.error("Update status error:", err);
        alert("Server Applicant Error");
    }
}

/* =========================
   UPDATE ADMINISTRASI STATUS
========================= */
async function updateAdministrasiStatus(id, status) {
    const mutation = `
    mutation {
        updateAdministrasiStatus(
            id:${id},
            status:"${status}"
        ){
            id
            administrasi_status
        }
    }`;

    try {
        const response = await fetch(APPLICANT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query: mutation
            })
        });

        const result = await response.json();

        if (result.errors) {
            console.error(result.errors);
            return alert("Gagal mengubah status administrasi");
        }

        alert(`Status administrasi applicant #${id} berhasil diubah menjadi ${status}!`);
        fetchApplicantsHR();

    } catch (err) {
        console.error("Update administrasi status error:", err);
        alert("Server Applicant Error");
    }
}

/* =========================
   AUTO LOAD PAGE
========================= */
window.onload = () => {

    fetchApplicantsHR();

    loadUsersDropdown();

    loadVacanciesDropdown();

};
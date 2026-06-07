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
            vacancy_id:${vacancyId}
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
            vacancy_id
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

            tbody.innerHTML += `
            <tr>
                <td>#${app.id}</td>
                <td>${app.user_id}</td>
                <td>${app.vacancy_id}</td>
                <td>${app.status}</td>
            </tr>`;
        });

    } catch (err) {

        console.error("Fetch Applicant Error:", err);

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
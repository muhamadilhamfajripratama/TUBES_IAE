// ======================================
// VACANCY SERVICE
// ======================================

const VACANCY_API = "http://localhost:4002/";

/* =====================================
   GET ALL VACANCIES (HR)
===================================== */
async function fetchVacanciesHR() {

    const query = `
    {
        getVacancies {
            id
            title
            department
            status
        }
    }`;

    try {

        const res = await fetch(
            VACANCY_API,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    query
                })
            }
        );

        const result =
            await res.json();

        console.log(
            "VACANCIES RESPONSE:",
            result
        );

        const vacancies =
            result.data?.getVacancies || [];

        const tbody =
            document.getElementById(
                "vacanciesTableBody"
            );

        if (!tbody) return;

        tbody.innerHTML = "";

        vacancies.forEach(job => {

            let badgeClass =
                "badge-active";

            if (
                job.status &&
                job.status.toLowerCase() ===
                "closed"
            ) {
                badgeClass =
                    "badge-warning";
            }

            tbody.innerHTML += `
            <tr>
                <td>#${job.id}</td>

                <td>
                    <strong>
                        ${job.title}
                    </strong>
                </td>

                <td>
                    ${job.department}
                </td>

                <td>
                    <span class="${badgeClass}">
                        ${job.status}
                    </span>
                </td>
            </tr>`;
        });

    } catch (err) {

        console.error(
            "FETCH VACANCIES ERROR:",
            err
        );

    }
}

/* =====================================
   CREATE VACANCY
===================================== */
async function handleCreateVacancy() {

    const title =
        document
            .getElementById(
                "vacTitle"
            )
            .value
            .trim();

    const department =
        document
            .getElementById(
                "vacDept"
            )
            .value;

    if (!title) {

        return alert(
            "Job Title wajib diisi!"
        );

    }

    console.log(
        "TITLE:",
        title
    );

    console.log(
        "DEPARTMENT:",
        department
    );

    const mutation = `
    mutation {
        createVacancy(
            title: "${title}",
            department: "${department}",
            description: "Belum ada deskripsi",
            status: "Open"
        ) {
            id
            title
            department
            status
        }
    }`;

    console.log(
        "GRAPHQL MUTATION:"
    );

    console.log(
        mutation
    );

    try {

        const res = await fetch(
            VACANCY_API,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                    query: mutation
                })
            }
        );

        const result =
            await res.json();

        console.log(
            "CREATE RESPONSE:",
            result
        );

        if (result.errors) {

            console.error(
                result.errors
            );

            return alert(
                "Gagal membuat vacancy!"
            );

        }

        alert(
            "Vacancy berhasil ditambahkan!"
        );

        // Reset Form

        document
            .getElementById(
                "vacTitle"
            )
            .value = "";

        document
            .getElementById(
                "vacDept"
            )
            .selectedIndex = 0;

        // Refresh Table

        await fetchVacanciesHR();

    } catch (err) {

        console.error(
            "CREATE VACANCY ERROR:",
            err
        );

        alert(
            "Server Vacancy tidak dapat diakses!"
        );

    }
}

/* =====================================
   APPLICANT PAGE
===================================== */
async function fetchVacanciesApplicant() {

    const query = `
    {
        getVacancies {
            id
            title
            department
            status
        }
    }`;

    try {

        const res = await fetch(
            VACANCY_API,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                    query
                })
            }
        );

        const result =
            await res.json();

        const vacancies =
            result.data?.getVacancies || [];

        const list =
            document.getElementById(
                "jobList"
            );

        if (!list) return;

        list.innerHTML = "";

        vacancies.forEach(job => {

            if (
                job.status !== "Open"
            ) return;

            list.innerHTML += `
            <div
                class="card"
                style="
                    margin-bottom:15px;
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                "
            >

                <div>
                    <h4>
                        ${job.title}
                    </h4>

                    <p>
                        ${job.department}
                    </p>
                </div>

                <button
                    class="btn-primary"
                    style="
                        width:auto;
                        margin:0;
                    "
                    onclick="
                        handleApplyJob(
                            ${job.id}
                        )
                    "
                >
                    Lamar Posisi Ini
                </button>

            </div>
            `;
        });

    } catch (err) {

        console.error(
            "FETCH APPLICANT VACANCIES ERROR:",
            err
        );

    }
}

/* =====================================
   AUTO LOAD
===================================== */
window.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Vacancy Page Loaded"
        );

        fetchVacanciesHR();

        fetchVacanciesApplicant();

    }
);
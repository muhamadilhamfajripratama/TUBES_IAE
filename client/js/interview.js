// ======================================
// INTERVIEW SERVICE
// ======================================

const INTERVIEW_API = "http://localhost:4004/";
const APPLICANT_API = "http://localhost:4003/";

/* =====================================
   LOAD APPLICANT DROPDOWN
===================================== */
async function loadApplicantsDropdown() {

    const query = `
    {
        getApplicants {
            id
            user_id
            user_name
            vacancy_id
            vacancy_title
            status
        }
    }`;

    try {

        const res = await fetch(APPLICANT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query })
        });

        const result = await res.json();

        console.log("Applicant Response:", result);

        const applicants =
            result.data?.getApplicants || [];

        const select =
            document.getElementById("invAppId");

        if (!select) return;

        select.innerHTML = "";

        applicants.forEach(app => {

            select.innerHTML += `
                <option value="${app.id}">
                    ${app.user_name || 'User ' + app.user_id} (Apply ID #${app.id})
                </option>
            `;
        });

    } catch (err) {

        console.error(
            "Load Applicant Dropdown Error:",
            err
        );

    }
}

/* =====================================
   GET ALL INTERVIEWS
===================================== */
async function fetchInterviewsHR() {

    const query = `
    {
        getInterviews {
            id
            applicant_id
            applicant_name
            scheduled_at
            interviewer
        }
    }`;

    try {

        const res = await fetch(INTERVIEW_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                query
            })
        });

        const result = await res.json();

        console.log("=== INTERVIEW API RESPONSE ===");
        console.log(result);

        const interviews =
            result.data?.getInterviews || [];

        console.table(interviews);

        const tbody =
            document.getElementById(
                "interviewsTableBody"
            );

        if (!tbody) return;

        tbody.innerHTML = "";

        interviews.forEach(inv => {

            console.log(
                "Interview Row:",
                inv.id,
                inv.scheduled_at,
                typeof inv.scheduled_at
            );

            let displayDate =
                inv.scheduled_at;

            // Format DATETIME MySQL tanpa konversi timezone
            if (displayDate) {

                displayDate = displayDate
                    .replace("T", " ")
                    .replace(".000Z", "");

                const parts =
                    displayDate.split(" ");

                if (parts.length === 2) {

                    const datePart =
                        parts[0];

                    const timePart =
                        parts[1];

                    const [
                        year,
                        month,
                        day
                    ] = datePart.split("-");

                    displayDate =
                        `${day}/${month}/${year} ${timePart}`;
                }
            }

            tbody.innerHTML += `
            <tr>
                <td>#${inv.id}</td>
                <td>${inv.applicant_name || 'Applicant #' + inv.applicant_id}</td>
                <td>${displayDate}</td>
                <td>${inv.interviewer}</td>
            </tr>`;
        });

    } catch (err) {

        console.error(
            "Fetch Interview Error:",
            err
        );

    }
}

/* =====================================
   CREATE INTERVIEW
===================================== */
async function handleScheduleInterview() {

    const applicantId =
        document.getElementById(
            "invAppId"
        ).value;

    const date =
        document.getElementById(
            "invDate"
        ).value;

    const time =
        document.getElementById(
            "invTime"
        ).value;

    const interviewer =
        document.getElementById(
            "invInterviewer"
        ).value;

    if (
        !applicantId ||
        !date ||
        !time ||
        !interviewer
    ) {

        return alert(
            "Semua kolom wajib diisi!"
        );

    }

    const scheduledAt =
        `${date} ${time}:00`;

    console.log("=== CREATE INTERVIEW ===");
    console.log("Applicant :", applicantId);
    console.log("Date      :", date);
    console.log("Time      :", time);
    console.log("Final     :", scheduledAt);

    const mutation = `
    mutation {
        scheduleInterview(
            applicant_id:${applicantId},
            scheduled_at:"${scheduledAt}",
            interviewer:"${interviewer}"
        ){
            id
            applicant_id
            scheduled_at
            interviewer
        }
    }`;

    try {

        const response =
            await fetch(
                INTERVIEW_API,
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
            await response.json();

        console.log(
            "Mutation Response:",
            result
        );

        if (result.errors) {

            console.error(
                result.errors
            );

            return alert(
                "Gagal membuat jadwal interview!"
            );
        }

        alert(
            "Jadwal Interview berhasil dibuat!"
        );

        // Reset Form

        document.getElementById(
            "invAppId"
        ).selectedIndex = 0;

        document.getElementById(
            "invDate"
        ).value = "";

        document.getElementById(
            "invTime"
        ).value = "";

        document.getElementById(
            "invInterviewer"
        ).value = "";

        await fetchInterviewsHR();

    } catch (err) {

        console.error(
            "Schedule Interview Error:",
            err
        );

        alert(
            "Server Interview tidak dapat diakses!"
        );

    }
}

/* =====================================
   AUTO LOAD PAGE
===================================== */
window.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "Interview Page Loaded"
        );

        fetchInterviewsHR();

        loadApplicantsDropdown();

    }
);
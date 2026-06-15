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
        getApplicantsByAdministrasiStatus(status: "Lolos") {
            id
            user_id
            user_name
            vacancy_id
            vacancy_title
            administrasi_status
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
        console.log("Applicant Filtered Response:", result);

        const applicants = result.data?.getApplicantsByAdministrasiStatus || [];

        const select = document.getElementById("invAppId");
        if (!select) return;

        select.innerHTML = '<option value="" disabled selected>-- Pilih Pelamar Lolos --</option>';

        applicants.forEach(app => {
            select.innerHTML += `
                <option value="${app.id}">
                    ${app.user_name || 'User ' + app.user_id} - ${app.vacancy_title} (Apply ID #${app.id})
                </option>
            `;
        });

    } catch (err) {
        console.error("Load Applicant Dropdown Error:", err);
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
            result
            notes
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

            // Result & Notes Formatting
            let resultBadge = '-';
            if(inv.result === 'Lolos') {
                resultBadge = `<span style="padding: 4px 8px; border-radius: 4px; background: rgba(16, 185, 129, 0.1); color: #10b981; font-weight: bold; font-size: 12px;">Lolos</span>`;
            } else if (inv.result === 'Tidak Lolos') {
                resultBadge = `<span style="padding: 4px 8px; border-radius: 4px; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-weight: bold; font-size: 12px;">Tidak Lolos</span>`;
            } else {
                resultBadge = `<span style="padding: 4px 8px; border-radius: 4px; background: rgba(107, 114, 128, 0.1); color: #6b7280; font-weight: bold; font-size: 12px;">Pending</span>`;
            }
            let notesText = inv.notes ? `<br><small style="color: #64748b; margin-top: 4px; display: block;">${inv.notes}</small>` : '';

            // Action Button
            let actionBtn = '';
            if(!inv.result || inv.result === 'Pending') {
                actionBtn = `<button onclick="openValidationModal(${inv.id}, ${inv.applicant_id})" style="background: var(--primary-blue); color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; display: flex; align-items: center; gap: 4px;"><i class="fa-solid fa-check-to-slot"></i> Validasi</button>`;
            }

            tbody.innerHTML += `
            <tr>
                <td>#${inv.id}</td>
                <td>${inv.applicant_name || 'Applicant #' + inv.applicant_id}</td>
                <td>${displayDate}</td>
                <td>${inv.interviewer}</td>
                <td>${resultBadge} ${notesText}</td>
                <td>${actionBtn}</td>
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
   VALIDATION MODAL HANDLERS
===================================== */
function openValidationModal(interviewId, applicantId) {
    document.getElementById('valInterviewId').value = interviewId;
    document.getElementById('valApplicantId').value = applicantId;
    document.getElementById('valResult').value = "";
    document.getElementById('valNotes').value = "";
    document.getElementById('validationModal').style.display = 'flex';
}

function closeValidationModal() {
    document.getElementById('validationModal').style.display = 'none';
}

async function submitInterviewValidation(event) {
    event.preventDefault();
    const interviewId = document.getElementById('valInterviewId').value;
    const applicantId = document.getElementById('valApplicantId').value;
    const result = document.getElementById('valResult').value;
    const notes = document.getElementById('valNotes').value;

    if(!result || !notes) return alert("Pilih status kelulusan dan masukkan catatan!");

    const submitBtn = document.getElementById('submitValidationBtn');
    submitBtn.innerText = "Menyimpan...";
    submitBtn.disabled = true;

    try {
        // 1. Update Interview Result
        const intMutation = `mutation { updateInterviewResult(id: ${interviewId}, result: "${result}", notes: """${notes}""") { id } }`;
        const intRes = await fetch(INTERVIEW_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: intMutation })
        });
        const intData = await intRes.json();
        if(intData.errors) throw new Error("Gagal mengupdate hasil interview");

        // 2. Update Applicant Main Status
        const newAppStatus = result === 'Lolos' ? 'Lolos Interview' : 'Reject';
        const appMutation = `mutation { updateApplicantStatus(id: ${applicantId}, status: "${newAppStatus}") { id } }`;
        const appRes = await fetch(APPLICANT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: appMutation })
        });
        const appData = await appRes.json();
        if(appData.errors) console.error("Gagal update status pelamar:", appData.errors);

        alert("Hasil interview berhasil divalidasi!");
        closeValidationModal();
        fetchInterviewsHR();

    } catch (err) {
        console.error("Validation error:", err);
        alert(err.message || "Terjadi kesalahan server");
    } finally {
        submitBtn.innerText = "Simpan Validasi";
        submitBtn.disabled = false;
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
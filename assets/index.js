const SURAHS = Quran.surahs;

const list = document.getElementById("surah-list");
const greeting = document.getElementById("greeting");

if (greeting) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 4 ? "malam" : hour < 11 ? "pagi" : hour < 15 ? "siang" : hour < 18 ? "sore" : "malam";
    greeting.innerHTML = 'Selamat <span class="time-greeting">' + timeGreeting + "</span>";
}

function row(surah) {
    const [number, arabic, latin, ayahs] = surah;
    return (
        '<li class="surah-item">' +
        '<a class="surah-link" href="' +
        Quran.surahPath(number) +
        '" aria-label="Surah ' +
        number +
        " " +
        latin +
        '">' +
        '<span class="surah-number">' +
        String(number).padStart(3, "0") +
        "</span>" +
        '<span class="surah-body">' +
        '<span class="surah-latin">' +
        latin +
        "</span>" +
        '<span class="surah-meta">' +
        ayahs +
        " ayat</span>" +
        "</span>" +
        '<span class="surah-arabic" lang="ar" dir="rtl">' +
        arabic +
        "</span>" +
        "</a>" +
        "</li>"
    );
}

list.innerHTML = SURAHS.map(row).join("");

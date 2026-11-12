const reader = document.getElementById("reader");
const state = document.getElementById("state");

const params = new URLSearchParams(window.location.search);
const surahNumber = Number(params.get("surah"));

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatText(value) {
  if (!value) {
    return "Teks tidak tersedia.";
  }
  return escapeHtml(value).replace(/\n/g, "<br>");
}

const ARABIC_WORD = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;
const TOKEN_SPLIT = /([\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+|[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]+)/g;
const ARABIC_CHAR = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_SKIP = ["على", "الى", "الا"];
const INDONESIAN_SKIP = [
  "yang", "dan", "dengan", "untuk", "dari", "pada", "dalam", "adalah",
  "akan", "tidak", "telah", "sudah", "juga", "atau", "karena", "maka",
  "bagi", "oleh", "sebagai", "mereka", "kami", "kita", "para", "orang",
  "secara", "dapat", "bisa", "agar", "supaya", "setelah", "sebelum",
  "ketika", "saat", "serta", "bahwa", "hanya", "lebih", "sangat", "semua",
  "segala", "antara", "tanpa", "masih", "belum", "bila", "jika", "kalau",
  "namun", "tetapi", "tapi", "kepada", "terhadap", "tentang", "seperti",
  "yaitu", "yakni", "ialah", "merupakan", "dapat", "tersebut", "demikian",
  "kalian", "beliau", "dia", "ini", "itu", "apa", "jika"
];

function normalizeArabic(word) {
  return word
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u08D3-\u08FF\u0640]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي");
}

function ayahWords(ayahText) {
  const words = {};
  const matches = ayahText.match(ARABIC_WORD) || [];
  matches.forEach(function (word) {
    const key = normalizeArabic(word);
    if (key.length >= 3 && ARABIC_SKIP.indexOf(key) === -1) {
      words[key] = true;
    }
  });
  return words;
}

function translationWords(text) {
  const words = {};
  const matches = (text || "").match(/[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]+/g) || [];
  matches.forEach(function (word) {
    const key = word.toLowerCase();
    if (key.length >= 4 && INDONESIAN_SKIP.indexOf(key) === -1) {
      words[key] = true;
    }
  });
  return words;
}

function formatTafsir(value, ayahText, translationText) {
  if (!value) {
    return "Tafsir tidak tersedia.";
  }
  const arabicWords = ayahWords(ayahText);
  const translationKeys = translationWords(translationText);
  return value
    .split(TOKEN_SPLIT)
    .map(function (part, index) {
      if (index % 2 === 1) {
        if (ARABIC_CHAR.test(part)) {
          if (arabicWords[normalizeArabic(part)]) {
            return '<mark class="tafsir-mark">' + escapeHtml(part) + "</mark>";
          }
        } else if (translationKeys[part.toLowerCase()]) {
          return '<mark class="tafsir-mark">' + escapeHtml(part) + "</mark>";
        }
      }
      return escapeHtml(part).replace(/\n/g, "<br>");
    })
    .join("");
}

function showError(message) {
  state.className = "state";
  state.innerHTML =
    "<span>" + escapeHtml(message) + "</span>" +
    '<a class="state-link" href="../">Kembali ke daftar surah</a>';
}

function ayahBlock(ayah, arabic, translation, tafsir) {
  return (
    '<li class="ayah" data-ayah="' + ayah + '">' +
    '<div class="ayah-bar">' +
    '<span class="ayah-number">' + ayah + "</span>" +
    '<button class="tafsir-toggle" type="button" aria-expanded="false">' +
    '<span>Tafsir</span>' +
    '<span class="icon icon-chevron-down" aria-hidden="true"></span>' +
    "</button>" +
    "</div>" +
    '<div class="ayah-arabic-wrap">' +
    '<button class="eye-button arab-eye" type="button" data-reveal="arab" aria-label="Tampilkan teks Arab ayat ini" aria-pressed="false">' +
    '<span class="icon icon-eye" aria-hidden="true"></span>' +
    "</button>" +
    '<p class="ayah-arabic" lang="ar" dir="rtl">' + formatText(arabic) + "</p>" +
    "</div>" +
    '<div class="ayah-translation-wrap">' +
    '<button class="eye-button translation-eye" type="button" data-reveal="translation" aria-label="Tampilkan terjemahan ayat ini" aria-pressed="false">' +
    '<span class="icon icon-eye" aria-hidden="true"></span>' +
    "</button>" +
    '<p class="ayah-translation">' + formatText(translation) + "</p>" +
    "</div>" +
    '<div class="tafsir" hidden>' + formatTafsir(tafsir, arabic, translation) + "</div>" +
    "</li>"
  );
}

function navLink(number, label, direction) {
  if (!number) {
    return '<span class="nav-item nav-disabled"></span>';
  }
  const icon =
    '<span class="icon icon-chevron-' + direction + '" aria-hidden="true"></span>';
  const body =
    '<span class="nav-label">' +
    '<span class="nav-kicker">' + label + "</span>" +
    '<span class="nav-name">Surah ' + number + "</span>" +
    "</span>";
  return (
    '<a class="nav-item" href="?surah=' + number + '">' +
    (direction === "back" ? icon + body : body + icon) +
    "</a>"
  );
}

function render(surah) {
  const number = Number(surah.number);
  const translation = surah.translations && surah.translations.id;
  const tafsir =
    surah.tafsir && surah.tafsir.id && surah.tafsir.id.kemenag
      ? surah.tafsir.id.kemenag.text
      : {};
  const ayahCount = Number(surah.number_of_ayah);

  document.title = surah.name_latin + " - Al-Qur'an";

  const ayahs = [];
  for (let i = 1; i <= ayahCount; i += 1) {
    ayahs.push(
      ayahBlock(
        i,
        surah.text[i],
        translation ? translation.text[i] : "",
        tafsir[i] || "Tafsir tidak tersedia."
      )
    );
  }

  reader.innerHTML =
    '<section class="surah-head">' +
    '<p class="surah-index">Surah ' + number + "</p>" +
    '<h1 class="surah-name" lang="ar" dir="rtl">' + escapeHtml(surah.name) + "</h1>" +
    '<p class="surah-latin">' + escapeHtml(surah.name_latin) + "</p>" +
    '<p class="surah-meta">' + ayahCount + " ayat &middot; " +
    escapeHtml(translation ? translation.name : "") + "</p>" +
    "</section>" +
    '<ol class="ayah-list">' + ayahs.join("") + "</ol>" +
    '<nav class="surah-nav">' +
    navLink(number > 1 ? number - 1 : null, "Sebelumnya", "back") +
    navLink(number < 114 ? number + 1 : null, "Berikutnya", "forward") +
    "</nav>" +
    '<div class="to-top"><a href="#"><span class="icon icon-arrow-up" aria-hidden="true"></span>Kembali ke atas</a></div>';

  if (typeof document.dispatchEvent === "function" && typeof CustomEvent === "function") {
    document.dispatchEvent(new CustomEvent("quran:rendered"));
  }

  const initialAyah = Number(new URLSearchParams(window.location.search).get("ayah"));
  if (Number.isInteger(initialAyah) && initialAyah >= 1 && initialAyah <= ayahCount) {
    window.setTimeout(function () {
      focusAyah(initialAyah);
    }, 120);
  }
}

function focusAyah(ayah) {
  const block = reader.querySelector('.ayah[data-ayah="' + ayah + '"]');
  if (!block) {
    return false;
  }
  if (typeof block.scrollIntoView === "function") {
    block.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  block.classList.remove("blink");
  block.offsetWidth;
  block.classList.add("blink");
  window.setTimeout(function () {
    block.classList.remove("blink");
  }, 2400);
  return true;
}

window.Quran.focusAyah = focusAyah;

function toggleTafsir(event) {
  const button = event.target.closest(".tafsir-toggle");
  if (!button) {
    return;
  }
  const block = button.closest(".ayah").querySelector(".tafsir");
  const open = block.hidden;
  block.hidden = !open;
  button.setAttribute("aria-expanded", String(open));
  button.querySelector("span").textContent = open ? "Tutup" : "Tafsir";
}

reader.addEventListener("click", toggleTafsir);

if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
  showError("Surah tidak ditemukan.");
} else {
  fetch("../data/ayat/" + surahNumber + ".json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("failed");
      }
      return response.text();
    })
    .then(function (raw) {
      const data = JSON.parse(raw);
      const surah = data[String(surahNumber)];
      if (!surah) {
        throw new Error("missing");
      }
      render(surah);
    })
    .catch(function () {
      showError("Data surah ini tidak dapat dibaca.");
    });
}

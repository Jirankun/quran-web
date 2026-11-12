const SURAHS = Quran.surahs;

const list = document.getElementById("surah-list");
const search = document.getElementById("search");
const count = document.getElementById("result-count");
const empty = document.getElementById("empty");

function row(surah) {
  const [number, arabic, latin, ayahs] = surah;
  return (
    '<li class="surah-item">' +
    '<a class="surah-link" href="' + Quran.surahPath(number) + '" aria-label="Surah ' + number + " " + latin + '">' +
    '<span class="surah-number">' + String(number).padStart(3, "0") + "</span>" +
    '<span class="surah-body">' +
    '<span class="surah-latin">' + latin + "</span>" +
    '<span class="surah-meta">' + ayahs + " ayat</span>" +
    "</span>" +
    '<span class="surah-arabic" lang="ar" dir="rtl">' + arabic + "</span>" +
    "</a>" +
    "</li>"
  );
}

function render(query) {
  const q = query.trim().toLowerCase();
  const results = q
    ? SURAHS.filter(function (surah) {
        return (
          surah[1].indexOf(q) !== -1 ||
          surah[2].toLowerCase().indexOf(q) !== -1 ||
          String(surah[0]) === q
        );
      })
    : SURAHS;

  list.innerHTML = results.map(row).join("");
  count.textContent = results.length + " / 114";
  empty.hidden = results.length > 0;
}

search.addEventListener("input", function () {
  render(search.value);
});

render("");

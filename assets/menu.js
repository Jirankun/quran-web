(function () {
    const menuButton = document.getElementById("menu-button");
    if (!menuButton || !window.Quran) {
        return;
    }

    const layer = document.createElement("div");
    layer.className = "menu-layer";
    layer.innerHTML =
        '<div class="menu-dropdown" hidden>' +
        '<div class="menu-view menu-main">' +
        '<button class="menu-item" type="button" data-menu-view="search">Cari ayat</button>' +
        '<button class="menu-item" type="button" data-menu-view="settings">Pengaturan</button>' +
        "</div>" +
        '<div class="menu-view menu-search" hidden>' +
        '<p class="menu-title">Cari ayat</p>' +
        '<div class="menu-search-row">' +
        '<input id="ayah-search" type="search" inputmode="numeric" placeholder="Contoh: 2:255" autocomplete="off" aria-label="Cari ayat">' +
        '<button class="menu-ok" id="ayah-ok" type="button" disabled>Oke</button>' +
        "</div>" +
        '<p class="menu-hint" id="ayah-hint">Ketik surah:ayat, misalnya 2:255.</p>' +
        '<ul class="suggestions" id="ayah-suggestions" hidden></ul>' +
        "</div>" +
        "</div>" +
        '<div class="settings-backdrop" hidden>' +
        '<section class="settings-popup" role="dialog" aria-modal="true" aria-label="Pengaturan">' +
        '<div class="settings-head"><h2 class="settings-title">Pengaturan</h2></div>' +
        '<div class="settings-body">' +
        '<p class="settings-label">Mode</p>' +
        '<div class="mode-group" role="group" aria-label="Mode baca">' +
        '<button class="mode-option is-active" type="button" data-mode="baca" aria-pressed="true">Baca</button>' +
        '<button class="mode-option" type="button" data-mode="hafalan" aria-pressed="false">Hafalan</button>' +
        "</div>" +
        '<div class="hafalan-options" hidden>' +
        '<label class="check-row"><input type="checkbox" id="blur-arab"> <span>Arab</span></label>' +
        '<label class="check-row"><input type="checkbox" id="blur-translation"> <span>Terjemahan</span></label>' +
        "</div>" +
        '<p class="settings-label settings-label-gap">Tampilan</p>' +
        '<label class="slider-row">' +
        '<span class="slider-top"><span>Ukuran arab</span><span id="size-arab-value"></span></span>' +
        '<input id="size-arab" type="range" min="28" max="48" step="2">' +
        "</label>" +
        '<label class="slider-row">' +
        '<span class="slider-top"><span>Ukuran arti</span><span id="size-translation-value"></span></span>' +
        '<input id="size-translation" type="range" min="16" max="30" step="1">' +
        "</label>" +
        '<label class="slider-row">' +
        '<span class="slider-top"><span>Ukuran tafsir</span><span id="size-tafsir-value"></span></span>' +
        '<input id="size-tafsir" type="range" min="16" max="30" step="1">' +
        "</label>" +
        "</div>" +
        '<div class="settings-foot"><button class="settings-close" id="settings-close" type="button">Tutup</button></div>' +
        "</section>" +
        "</div>";
    document.body.appendChild(layer);

    const dropdown = layer.querySelector(".menu-dropdown");
    const mainView = layer.querySelector(".menu-main");
    const searchView = layer.querySelector(".menu-search");
    const input = layer.querySelector("#ayah-search");
    const okButton = layer.querySelector("#ayah-ok");
    const hint = layer.querySelector("#ayah-hint");
    const suggestions = layer.querySelector("#ayah-suggestions");
    const backdrop = layer.querySelector(".settings-backdrop");
    const settingsClose = layer.querySelector("#settings-close");
    const hafalanOptions = layer.querySelector(".hafalan-options");
    const blurArab = layer.querySelector("#blur-arab");
    const blurTranslation = layer.querySelector("#blur-translation");
    const sizeArab = layer.querySelector("#size-arab");
    const sizeTranslation = layer.querySelector("#size-translation");
    const sizeTafsir = layer.querySelector("#size-tafsir");
    const sizeArabValue = layer.querySelector("#size-arab-value");
    const sizeTranslationValue = layer.querySelector("#size-translation-value");
    const sizeTafsirValue = layer.querySelector("#size-tafsir-value");
    const modeButtons = layer.querySelectorAll(".mode-option");

    const STORAGE_KEY = "quran-settings";
    const defaults = {
        mode: "baca",
        arab: 34,
        translation: 22,
        tafsir: 20,
        blurArab: false,
        blurTranslation: false,
    };

    function clamp(value, min, max, fallback) {
        const number = Number(value);
        if (!Number.isFinite(number)) {
            return fallback;
        }
        return Math.min(max, Math.max(min, Math.round(number)));
    }

    function loadSettings() {
        const loaded = {};
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                if (data && typeof data === "object") {
                    if (data.mode === "hafalan" || data.mode === "baca") {
                        loaded.mode = data.mode;
                    }
                    loaded.arab = clamp(data.arab, 28, 48, defaults.arab);
                    loaded.translation = clamp(data.translation, 16, 30, defaults.translation);
                    loaded.tafsir = clamp(data.tafsir, 16, 30, defaults.tafsir);
                    loaded.blurArab = Boolean(data.blurArab);
                    loaded.blurTranslation = Boolean(data.blurTranslation);
                }
            }
        } catch (error) {
            loaded.mode = defaults.mode;
        }
        return {
            mode: loaded.mode || defaults.mode,
            arab: loaded.arab || defaults.arab,
            translation: loaded.translation || defaults.translation,
            tafsir: loaded.tafsir || defaults.tafsir,
            blurArab: Boolean(loaded.blurArab),
            blurTranslation: Boolean(loaded.blurTranslation),
        };
    }

    const settings = loadSettings();

    function saveSettings() {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        } catch (error) {
            return;
        }
    }

    function applySettings() {
        const hafalan = settings.mode === "hafalan";
        document.documentElement.style.setProperty("--arab-size", settings.arab + "px");
        document.documentElement.style.setProperty("--translation-size", settings.translation + "px");
        document.documentElement.style.setProperty("--tafsir-size", settings.tafsir + "px");
        document.body.classList.toggle("hafalan-mode", hafalan);
        document.body.classList.toggle("hafalan-arab", hafalan && settings.blurArab);
        document.body.classList.toggle("hafalan-terjemahan", hafalan && settings.blurTranslation);

        if (!hafalan) {
            document.querySelectorAll(".ayah.arab-open, .ayah.translation-open").forEach(function (ayah) {
                ayah.classList.remove("arab-open");
                ayah.classList.remove("translation-open");
            });
        } else {
            if (!settings.blurArab) {
                document.querySelectorAll(".ayah.arab-open").forEach(function (ayah) {
                    ayah.classList.remove("arab-open");
                });
            }
            if (!settings.blurTranslation) {
                document.querySelectorAll(".ayah.translation-open").forEach(function (ayah) {
                    ayah.classList.remove("translation-open");
                });
            }
        }

        hafalanOptions.hidden = !hafalan;
        blurArab.checked = settings.blurArab;
        blurTranslation.checked = settings.blurTranslation;
        sizeArab.value = String(settings.arab);
        sizeTranslation.value = String(settings.translation);
        sizeTafsir.value = String(settings.tafsir);
        sizeArabValue.textContent = settings.arab + " px";
        sizeTranslationValue.textContent = settings.translation + " px";
        sizeTafsirValue.textContent = settings.tafsir + " px";

        modeButtons.forEach(function (button) {
            const active = button.getAttribute("data-mode") === settings.mode;
            button.classList.toggle("is-active", active);
            button.setAttribute("aria-pressed", String(active));
        });

        document.querySelectorAll(".arab-eye, .translation-eye").forEach(function (eye) {
            const type = eye.getAttribute("data-reveal");
            const block = eye.closest(".ayah");
            const open = Boolean(block && block.classList.contains(type + "-open"));
            const label = type === "arab" ? "teks Arab" : "terjemahan";
            eye.querySelector(".icon").className = "icon " + (open ? "icon-eye-off" : "icon-eye");
            eye.setAttribute("aria-pressed", String(open));
            eye.setAttribute("aria-label", (open ? "Sembunyikan " : "Tampilkan ") + label + " ayat ini");
        });
    }

    function openMenu() {
        dropdown.hidden = false;
        menuButton.setAttribute("aria-expanded", "true");
        mainView.hidden = false;
        searchView.hidden = true;
    }

    function closeMenu() {
        dropdown.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
    }

    function openSettings() {
        closeMenu();
        backdrop.hidden = false;
        applySettings();
        settingsClose.focus();
    }

    function closeSettings() {
        backdrop.hidden = true;
        menuButton.focus();
    }

    function parseInput(value) {
        const match = String(value)
            .trim()
            .match(/^(\d{1,3})\s*[:.\s]\s*(\d{1,3})$/);
        if (!match) {
            return null;
        }
        const surah = Number(match[1]);
        const ayah = Number(match[2]);
        if (surah < 1 || surah > 114) {
            return { surah: surah, ayah: ayah, valid: false, message: "Surah harus 1–114." };
        }
        const count = Quran.surahs[surah - 1][3];
        if (ayah < 1 || ayah > count) {
            return {
                surah: surah,
                ayah: ayah,
                valid: false,
                message: "Surah " + surah + " hanya " + count + " ayat.",
            };
        }
        return {
            surah: surah,
            ayah: ayah,
            valid: true,
            message: Quran.surahs[surah - 1][2] + ", ayat " + ayah + ".",
        };
    }

    function suggest(value) {
        const raw = String(value).trim();
        let surah = 0;
        let prefix = "";
        let match = raw.match(/^(\d{1,3})\s*[:.\s]\s*(\d{0,3})$/);
        if (match) {
            surah = Number(match[1]);
            prefix = match[2];
        } else {
            match = raw.match(/^(\d{1,3})$/);
            if (!match) {
                return [];
            }
            surah = Number(match[1]);
        }
        if (surah < 1 || surah > 114) {
            return [];
        }
        const count = Quran.surahs[surah - 1][3];
        const latin = Quran.surahs[surah - 1][2];
        const list = [];
        for (let ayah = 1; ayah <= count && list.length < 8; ayah += 1) {
            if (String(ayah).indexOf(prefix) === 0) {
                list.push({ surah: surah, ayah: ayah, latin: latin });
            }
        }
        return list;
    }

    function renderSuggestions() {
        const items = suggest(input.value);
        if (!items.length) {
            suggestions.hidden = true;
            suggestions.innerHTML = "";
            return;
        }
        suggestions.innerHTML = items
            .map(function (item) {
                return (
                    '<li><button class="suggestion" type="button" data-value="' +
                    item.surah +
                    ":" +
                    item.ayah +
                    '">' +
                    '<span class="suggestion-number">' +
                    item.surah +
                    ":" +
                    item.ayah +
                    "</span>" +
                    '<span class="suggestion-name">' +
                    item.latin +
                    "</span>" +
                    "</button></li>"
                );
            })
            .join("");
        suggestions.hidden = false;
    }

    function updateSearch() {
        const value = input.value.trim();
        const parsed = parseInput(value);
        okButton.disabled = !parsed || !parsed.valid;
        if (!value) {
            hint.textContent = "Ketik surah:ayat, misalnya 2:255.";
        } else if (parsed) {
            hint.textContent = parsed.message;
        } else {
            hint.textContent = "Ketik surah:ayat, misalnya 2:255.";
        }
        renderSuggestions();
    }

    function goToAyah() {
        const parsed = parseInput(input.value);
        if (!parsed || !parsed.valid) {
            return;
        }
        closeMenu();
        const isReader = Boolean(document.getElementById("reader"));
        const currentSurah = Number(new URLSearchParams(window.location.search).get("surah"));
        if (
            isReader &&
            currentSurah === parsed.surah &&
            typeof Quran.focusAyah === "function" &&
            Quran.focusAyah(parsed.ayah)
        ) {
            return;
        }
        if (isReader) {
            window.location.search = "?surah=" + parsed.surah + "&ayah=" + parsed.ayah;
            return;
        }
        window.location.href = Quran.surahPath(parsed.surah) + "&ayah=" + parsed.ayah;
    }

    menuButton.addEventListener("click", function () {
        if (dropdown.hidden) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    layer.querySelector('[data-menu-view="search"]').addEventListener("click", function () {
        mainView.hidden = true;
        searchView.hidden = false;
        input.focus();
        updateSearch();
    });

    layer.querySelector('[data-menu-view="settings"]').addEventListener("click", function () {
        openSettings();
    });

    input.addEventListener("input", updateSearch);

    input.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            goToAyah();
        }
    });

    okButton.addEventListener("click", goToAyah);

    suggestions.addEventListener("click", function (event) {
        const item = event.target.closest(".suggestion");
        if (!item) {
            return;
        }
        input.value = item.getAttribute("data-value");
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
        updateSearch();
        suggestions.hidden = true;
    });

    settingsClose.addEventListener("click", closeSettings);

    modeButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            settings.mode = button.getAttribute("data-mode");
            applySettings();
            saveSettings();
        });
    });

    blurArab.addEventListener("change", function () {
        settings.blurArab = blurArab.checked;
        applySettings();
        saveSettings();
    });

    blurTranslation.addEventListener("change", function () {
        settings.blurTranslation = blurTranslation.checked;
        applySettings();
        saveSettings();
    });

    sizeArab.addEventListener("input", function () {
        settings.arab = clamp(sizeArab.value, 28, 48, defaults.arab);
        applySettings();
        saveSettings();
    });

    sizeTranslation.addEventListener("input", function () {
        settings.translation = clamp(sizeTranslation.value, 16, 30, defaults.translation);
        applySettings();
        saveSettings();
    });

    sizeTafsir.addEventListener("input", function () {
        settings.tafsir = clamp(sizeTafsir.value, 16, 30, defaults.tafsir);
        applySettings();
        saveSettings();
    });

    document.addEventListener("click", function (event) {
        if (!dropdown.hidden && !dropdown.contains(event.target) && !menuButton.contains(event.target)) {
            closeMenu();
        }
        if (event.target === backdrop) {
            closeSettings();
        }
        const eye = event.target.closest(".eye-button");
        if (eye) {
            const block = eye.closest(".ayah");
            const type = eye.getAttribute("data-reveal");
            if (block && type) {
                block.classList.toggle(type + "-open");
                applySettings();
            }
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") {
            return;
        }
        if (!backdrop.hidden) {
            closeSettings();
        } else if (!dropdown.hidden) {
            closeMenu();
        }
    });

    document.addEventListener("quran:rendered", applySettings);

    applySettings();
})();

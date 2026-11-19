(function () {
    const menuButton = document.getElementById("menu-button");
    if (!menuButton || !window.Quran) {
        return;
    }

    const layer = document.createElement("div");
    const infoPath = document.getElementById("reader") ? "../informasi/" : "./informasi/";
    layer.className = "menu-layer";
    layer.innerHTML =
        '<div class="menu-dropdown" hidden>' +
        '<div class="menu-view menu-main">' +
        '<button class="menu-item" type="button" data-menu-view="search"><span class="icon icon-search" aria-hidden="true"></span><span>Cari</span></button>' +
        '<button class="menu-item" type="button" data-menu-view="bookmarks"><span class="icon icon-bookmarks" aria-hidden="true"></span><span>Bookmark</span></button>' +
        '<button class="menu-item" type="button" data-menu-view="settings"><span class="icon icon-settings" aria-hidden="true"></span><span>Pengaturan</span></button>' +
        '<a class="menu-item" href="' +
        infoPath +
        '"><span class="icon icon-information" aria-hidden="true"></span><span>Info</span></a>' +
        "</div>" +
        '<div class="menu-view menu-search" hidden>' +
        '<p class="menu-title">Cari</p>' +
        '<div class="menu-search-row">' +
        '<input id="ayah-search" type="search" inputmode="numeric" placeholder="Contoh: 2.255" autocomplete="off" aria-label="Cari">' +
        '<button class="menu-ok" id="ayah-ok" type="button" disabled>Cari</button>' +
        "</div>" +
        '<p class="menu-hint" id="ayah-hint">Ketik surah.ayat, misalnya 2.255.</p>' +
        '<ul class="suggestions" id="ayah-suggestions" hidden></ul>' +
        "</div>" +
        '<div class="menu-view menu-bookmarks" hidden>' +
        '<p class="menu-title">Bookmark</p>' +
        '<ul class="bookmark-list" id="bookmark-list"></ul>' +
        '<p class="menu-hint" id="bookmark-hint"></p>' +
        "</div>" +
        "</div>" +
        '<div class="settings-backdrop" hidden>' +
        '<section class="settings-popup" role="dialog" aria-modal="true" aria-label="Pengaturan">' +
        '<div class="settings-head"><h2 class="settings-title">Pengaturan</h2></div>' +
        '<div class="settings-body">' +
        '<p class="settings-label">Akun</p>' +
        '<div class="account-panel">' +
        '<div class="account-signed" id="account-signed" hidden>' +
        '<span class="icon icon-person account-signed-icon" aria-hidden="true"></span>' +
        '<span class="account-signed-name" id="account-signed-name"></span>' +
        '<button class="account-logout" id="account-logout" type="button">Keluar</button>' +
        "</div>" +
        '<form class="account-form" id="account-form">' +
        '<input class="account-input" id="account-input" type="text" maxlength="40" autocomplete="off" autocapitalize="words" placeholder="Nama atau kode identitas" aria-label="Nama atau kode identitas">' +
        '<button class="account-submit" id="account-submit" type="submit">Masuk</button>' +
        "</form>" +
        '<p class="account-warning" id="account-warning" hidden>Mohon jangan gunakan alamat Email</p>' +
        '<p class="account-hint" id="account-hint">Identitas dipakai untuk menyimpan bookmark dan bacaan terakhir.</p>' +
        "</div>" +
        '<p class="settings-label settings-label-gap">Mode</p>' +
        '<div class="mode-group" role="group" aria-label="Mode baca">' +
        '<button class="mode-option is-active" type="button" data-mode="baca" aria-pressed="true">Baca</button>' +
        '<button class="mode-option" type="button" data-mode="hafalan" aria-pressed="false">Hafalan</button>' +
        "</div>" +
        '<div class="hafalan-options" hidden>' +
        '<label class="check-row"><input type="checkbox" id="blur-arab"> <span>Arab</span></label>' +
        '<label class="check-row"><input type="checkbox" id="blur-translation"> <span>Terjemahan</span></label>' +
        "</div>" +
        '<p class="settings-label settings-label-gap">Tampilan</p>' +
        '<button class="settings-action" id="open-size" type="button">Atur ukuran huruf</button>' +
        "</div>" +
        '<div class="settings-foot"><button class="settings-close" id="settings-close" type="button">Tutup</button></div>' +
        "</section>" +
        "</div>" +
        '<div class="size-backdrop" hidden>' +
        '<section class="size-sheet" role="dialog" aria-modal="true" aria-label="Atur ukuran huruf">' +
        '<div class="size-head">' +
        '<button class="size-back" id="size-back" type="button" aria-label="Kembali">' +
        '<span class="icon icon-chevron-back" aria-hidden="true"></span>' +
        "</button>" +
        '<h2 class="size-title">Atur ukuran huruf</h2>' +
        "</div>" +
        '<div class="size-tabs" role="tablist" aria-label="Bagian ukuran huruf">' +
        '<button class="size-tab is-active" type="button" role="tab" data-size-tab="arab" aria-selected="true">Arab</button>' +
        '<button class="size-tab" type="button" role="tab" data-size-tab="translation" aria-selected="false">Arti</button>' +
        '<button class="size-tab" type="button" role="tab" data-size-tab="tafsir" aria-selected="false">Tafsir</button>' +
        "</div>" +
        '<div class="size-body">' +
        '<div class="size-slider-row">' +
        '<div class="size-control">' +
        '<div class="size-ticks" id="size-ticks" aria-hidden="true"></div>' +
        '<input id="size-range" class="size-range" type="range" min="28" max="48" step="2" aria-label="Ukuran arab">' +
        "</div>" +
        '<span class="size-value" id="size-value"></span>' +
        "</div>" +
        "</div>" +
        "</section>" +
        "</div>";
    document.body.appendChild(layer);

    const dropdown = layer.querySelector(".menu-dropdown");
    const mainView = layer.querySelector(".menu-main");
    const searchView = layer.querySelector(".menu-search");
    const bookmarksView = layer.querySelector(".menu-bookmarks");
    const bookmarkList = layer.querySelector("#bookmark-list");
    const bookmarkHint = layer.querySelector("#bookmark-hint");
    const input = layer.querySelector("#ayah-search");
    const okButton = layer.querySelector("#ayah-ok");
    const hint = layer.querySelector("#ayah-hint");
    const suggestions = layer.querySelector("#ayah-suggestions");
    const backdrop = layer.querySelector(".settings-backdrop");
    const settingsClose = layer.querySelector("#settings-close");
    const hafalanOptions = layer.querySelector(".hafalan-options");
    const blurArab = layer.querySelector("#blur-arab");
    const blurTranslation = layer.querySelector("#blur-translation");
    const openSizeButton = layer.querySelector("#open-size");
    const sizeBackdrop = layer.querySelector(".size-backdrop");
    const sizeBack = layer.querySelector("#size-back");
    const sizeTabs = layer.querySelectorAll(".size-tab");
    const sizeRange = layer.querySelector("#size-range");
    const sizeTicks = layer.querySelector("#size-ticks");
    const sizeValue = layer.querySelector("#size-value");
    const accountSigned = layer.querySelector("#account-signed");
    const accountSignedName = layer.querySelector("#account-signed-name");
    const accountForm = layer.querySelector("#account-form");
    const accountInput = layer.querySelector("#account-input");
    const accountSubmit = layer.querySelector("#account-submit");
    const accountLogout = layer.querySelector("#account-logout");
    const accountHint = layer.querySelector("#account-hint");
    const accountWarning = layer.querySelector("#account-warning");
    const modeButtons = layer.querySelectorAll(".mode-option");

    const sizeFields = {
        arab: { label: "Ukuran arab", min: 28, max: 48, step: 2 },
        translation: { label: "Ukuran arti", min: 16, max: 30, step: 1 },
        tafsir: { label: "Ukuran tafsir", min: 16, max: 30, step: 1 },
    };
    let activeSizeField = "arab";
    let lastVibrate = 0;

    const STORAGE_KEY = "quran-settings";
    const defaults = {
        mode: "baca",
        arab: 34,
        translation: 22,
        tafsir: 20,
        blurArab: false,
        blurTranslation: false,
    };

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

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

    function applySizeField() {
        const field = sizeFields[activeSizeField];
        const value = settings[activeSizeField];
        const steps = Math.round((field.max - field.min) / field.step);
        const fill = steps === 0 ? 100 : ((value - field.min) / (field.max - field.min)) * 100;

        sizeRange.min = String(field.min);
        sizeRange.max = String(field.max);
        sizeRange.step = String(field.step);
        sizeRange.value = String(value);
        sizeRange.setAttribute("aria-label", field.label);
        sizeRange.style.setProperty("--fill", fill + "%");
        sizeValue.textContent = value + " px";

        let ticks = "";
        for (let i = 0; i <= steps; i += 1) {
            ticks += '<span class="size-tick"></span>';
        }
        sizeTicks.innerHTML = ticks;

        sizeTabs.forEach(function (tab) {
            const active = tab.getAttribute("data-size-tab") === activeSizeField;
            tab.classList.toggle("is-active", active);
            tab.setAttribute("aria-selected", String(active));
        });
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
        applySizeField();

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
        bookmarksView.hidden = true;
    }

    function closeMenu() {
        dropdown.hidden = true;
        menuButton.setAttribute("aria-expanded", "false");
    }

    function openSettings() {
        closeMenu();
        backdrop.hidden = false;
        applySettings();
        syncAccountUI();
        settingsClose.focus();
    }

    const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[^\s@]+/;

    function updateAccountWarning() {
        const isEmail = EMAIL_PATTERN.test(accountInput.value);
        accountWarning.hidden = !isEmail;
        return isEmail;
    }

    function syncAccountUI() {
        const account = window.QuranAccount;
        const name = account ? account.getName() : "";
        const        signed = Boolean(name);
        accountSigned.hidden = !signed;
        accountForm.hidden = signed;
        accountSignedName.textContent = name;
        if (signed) {
            accountHint.classList.remove("is-error");
            accountHint.textContent = "Bookmark dan bacaan terakhir tersimpan untuk identitas ini.";
        } else {
            accountHint.classList.remove("is-error");
            accountHint.textContent = "Identitas dipakai untuk menyimpan bookmark dan bacaan terakhir.";
        }
    }

    function renderBookmarks() {
        const account = window.QuranAccount;
        const name = account ? account.getName() : "";
        const items = account ? account.getState().bookmarks : [];
        if (!name) {
            bookmarkList.innerHTML = "";
            bookmarkHint.textContent = "Masuk lewat Pengaturan → Akun untuk menyimpan bookmark.";
            return;
        }
        if (!items.length) {
            bookmarkList.innerHTML = "";
            bookmarkHint.textContent = "Belum ada bookmark. Tandai ayat dengan ikon bookmark.";
            return;
        }
        bookmarkHint.textContent = items.length + " dari 50 bookmark.";
        bookmarkList.innerHTML = items
            .map(function (item) {
                const surah = Quran.surahs[item.surah - 1];
                const surahName = surah ? surah[2] : "Surah " + item.surah;
                const href = account.ayahHref(item.surah, item.ayah);
                return (
                    '<li class="bookmark-item">' +
                    '<a class="bookmark-link" href="' +
                    href +
                    '">' +
                    '<span class="bookmark-name">' +
                    escapeHtml(surahName) +
                    "</span>" +
                    '<span class="bookmark-meta">Ayat ' +
                    item.ayah +
                    "</span>" +
                    "</a>" +
                    '<button class="bookmark-remove" type="button" data-bookmark-surah="' +
                    item.surah +
                    '" data-bookmark-ayah="' +
                    item.ayah +
                    '" aria-label="Hapus bookmark ' +
                    escapeHtml(surahName) +
                    " ayat " +
                    item.ayah +
                    '"><span class="icon icon-close" aria-hidden="true"></span></button>' +
                    "</li>"
                );
            })
            .join("");
    }

    function closeSettings() {
        backdrop.hidden = true;
        menuButton.focus();
    }

    function openSize() {
        backdrop.hidden = true;
        sizeBackdrop.hidden = false;
        applySettings();
        sizeBack.focus();
    }

    function closeSize() {
        sizeBackdrop.hidden = true;
        backdrop.hidden = false;
        applySettings();
        openSizeButton.focus();
    }

    function parseInput(value) {
        const match = String(value)
            .trim()
            .match(/^(\d{1,3})\s*\.\s*(\d{1,3})$/);
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
        let match = raw.match(/^(\d{1,3})\s*\.\s*(\d{0,3})$/);
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
        const list = [];
        for (let ayah = 1; ayah <= count; ayah += 1) {
            if (String(ayah).indexOf(prefix) === 0) {
                list.push({ surah: surah, ayah: ayah });
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
                    "." +
                    item.ayah +
                    '">' +
                    '<span class="suggestion-number">' +
                    item.surah +
                    "." +
                    item.ayah +
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
        const match = value.match(/^(\d{1,3})(?:\s*\.\s*\d{0,3})?$/);
        const surahNumber = match ? Number(match[1]) : 0;
        const surah = surahNumber >= 1 && surahNumber <= 114 ? Quran.surahs[surahNumber - 1] : null;
        okButton.disabled = !parsed || !parsed.valid;
        if (!value) {
            hint.textContent = "Ketik surah.ayat, misalnya 2.255.";
        } else if (parsed) {
            hint.textContent = surah[2] + ": " + surah[3] + " ayat. Ayat " + parsed.ayah + " dipilih.";
        } else if (surah) {
            hint.textContent = surah[2] + ": " + surah[3] + " ayat. Pilih nomor ayat.";
        } else {
            hint.textContent = "Ketik surah.ayat, misalnya 2.255.";
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
            window.history.pushState(
                null,
                "",
                "?surah=" + parsed.surah + "&ayah=" + parsed.ayah + "#ayah-" + parsed.ayah,
            );
            return;
        }
        if (isReader) {
            window.location.href = "?surah=" + parsed.surah + "&ayah=" + parsed.ayah + "#ayah-" + parsed.ayah;
            return;
        }
        window.location.href = Quran.surahPath(parsed.surah, parsed.ayah);
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
        bookmarksView.hidden = true;
        input.focus();
        updateSearch();
    });

    layer.querySelector('[data-menu-view="bookmarks"]').addEventListener("click", function () {
        mainView.hidden = true;
        searchView.hidden = true;
        bookmarksView.hidden = false;
        renderBookmarks();
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
        updateSearch();
        goToAyah();
    });

    settingsClose.addEventListener("click", closeSettings);

    accountInput.addEventListener("input", updateAccountWarning);

    accountForm.addEventListener("submit", function (event) {
        event.preventDefault();
        if (!window.QuranAccount) {
            return;
        }
        const name = accountInput.value.trim();
        if (!name) {
            accountInput.focus();
            return;
        }
        if (updateAccountWarning()) {
            accountInput.focus();
            return;
        }
        accountSubmit.disabled = true;
        accountSubmit.textContent = "Memeriksa...";
        accountHint.classList.remove("is-error");
        accountHint.textContent = "Memeriksa identitas...";
        window.QuranAccount.identify(name)
            .then(function (state) {
                accountInput.value = "";
                updateAccountWarning();
                syncAccountUI();
                accountHint.textContent = "Masuk sebagai " + state.name + ".";
            })
            .catch(function (error) {
                accountHint.classList.add("is-error");
                accountHint.textContent =
                    error && error.message ? error.message : "Gagal masuk. Coba lagi.";
            })
            .finally(function () {
                accountSubmit.disabled = false;
                accountSubmit.textContent = "Masuk";
            });
    });

    accountLogout.addEventListener("click", function () {
        if (window.QuranAccount) {
            window.QuranAccount.logout();
        }
        accountInput.value = "";
        updateAccountWarning();
        syncAccountUI();
        accountHint.textContent = "Kamu sudah keluar.";
    });

    bookmarkList.addEventListener("click", function (event) {
        const remove = event.target.closest(".bookmark-remove");
        if (remove) {
            event.preventDefault();
            const surah = Number(remove.getAttribute("data-bookmark-surah"));
            const ayah = Number(remove.getAttribute("data-bookmark-ayah"));
            if (window.QuranAccount) {
                window.QuranAccount.toggleBookmark(surah, ayah);
            }
            return;
        }
        if (event.target.closest(".bookmark-link")) {
            closeMenu();
        }
    });

    document.addEventListener("account:changed", function () {
        syncAccountUI();
        renderBookmarks();
    });

    document.addEventListener("account:need-login", function () {
        openSettings();
        window.setTimeout(function () {
            accountInput.focus();
        }, 0);
    });

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

    openSizeButton.addEventListener("click", openSize);

    sizeBack.addEventListener("click", closeSize);

    sizeTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            activeSizeField = tab.getAttribute("data-size-tab");
            applySizeField();
        });
    });

    sizeRange.addEventListener("input", function () {
        const field = sizeFields[activeSizeField];
        const nextValue = clamp(sizeRange.value, field.min, field.max, defaults[activeSizeField]);
        const now = Date.now();
        if (
            nextValue !== settings[activeSizeField] &&
            now - lastVibrate > 30 &&
            typeof navigator !== "undefined" &&
            typeof navigator.vibrate === "function"
        ) {
            navigator.vibrate(10);
            lastVibrate = now;
        }
        settings[activeSizeField] = nextValue;
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
        if (event.target === sizeBackdrop) {
            closeSize();
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
        if (!sizeBackdrop.hidden) {
            closeSize();
        } else if (!backdrop.hidden) {
            closeSettings();
        } else if (!dropdown.hidden) {
            closeMenu();
        }
    });

    document.addEventListener("quran:rendered", applySettings);

    applySettings();
})();

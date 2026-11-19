(function () {
    const WORKER_URL = "https://quran-worker.zhyllanfyllah.my.id";
    const IDENTITY_KEY = "quran-identity";
    const CACHE_KEY = "quran-account-state";
    const MAX_BOOKMARKS = 50;
    const isReader = Boolean(document.getElementById("reader"));

    let identity = "";
    let account = { name: "", lastRead: null, bookmarks: [] };
    let toastTimer = 0;

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function normalizeState(value, fallbackName) {
        const source = value && typeof value === "object" ? value : {};
        const last = source.lastRead;
        const lastRead =
            last && Number.isInteger(Number(last.surah)) && Number.isInteger(Number(last.ayah))
                ? { surah: Number(last.surah), ayah: Number(last.ayah), at: Number(last.at) || Date.now() }
                : null;
        const bookmarks = Array.isArray(source.bookmarks)
            ? source.bookmarks
                  .filter(function (item) {
                      return item && Number.isInteger(Number(item.surah)) && Number.isInteger(Number(item.ayah));
                  })
                  .map(function (item) {
                      return {
                          surah: Number(item.surah),
                          ayah: Number(item.ayah),
                          at: Number(item.at) || 0,
                      };
                  })
                  .slice(0, MAX_BOOKMARKS)
            : [];
        return {
            name: typeof source.name === "string" && source.name ? source.name : fallbackName || "",
            lastRead: lastRead,
            bookmarks: bookmarks,
        };
    }

    function mergeServer(server, local, options) {
        const removed = options && options.removed;
        const removedId = removed ? removed.surah + ":" + removed.ayah : "";
        const map = {};
        server.bookmarks.concat(local.bookmarks).forEach(function (item) {
            const id = item.surah + ":" + item.ayah;
            if (id === removedId) {
                return;
            }
            if (!map[id] || map[id].at < item.at) {
                map[id] = item;
            }
        });
        const bookmarks = Object.keys(map)
            .map(function (id) {
                return map[id];
            })
            .sort(function (a, b) {
                return b.at - a.at;
            })
            .slice(0, MAX_BOOKMARKS);
        let lastRead = server.lastRead || local.lastRead || null;
        if (server.lastRead && local.lastRead && local.lastRead.at > server.lastRead.at) {
            lastRead = local.lastRead;
        }
        return {
            name: server.name || local.name || identity,
            lastRead: lastRead,
            bookmarks: bookmarks,
        };
    }

    function saveCache() {
        try {
            if (!identity) {
                window.localStorage.removeItem(CACHE_KEY);
                return;
            }
            window.localStorage.setItem(CACHE_KEY, JSON.stringify(account));
        } catch (error) {
            return;
        }
    }

    function loadCache() {
        try {
            const storedIdentity = window.localStorage.getItem(IDENTITY_KEY);
            if (!storedIdentity) {
                return;
            }
            identity = storedIdentity;
            const raw = window.localStorage.getItem(CACHE_KEY);
            if (raw) {
                account = normalizeState(JSON.parse(raw), identity);
            } else {
                account = normalizeState({ name: identity }, identity);
            }
        } catch (error) {
            identity = "";
            account = { name: "", lastRead: null, bookmarks: [] };
        }
    }

    async function api(path, options) {
        const init = {
            method: (options && options.method) || "GET",
            headers: {},
        };
        if (options && options.body) {
            init.headers["Content-Type"] = "application/json";
            init.body = JSON.stringify(options.body);
        }
        const controller = typeof AbortController === "function" ? new AbortController() : null;
        let timer = 0;
        if (controller) {
            timer = window.setTimeout(function () {
                controller.abort();
            }, 12000);
            init.signal = controller.signal;
        }
        try {
            const response = await window.fetch(WORKER_URL + path, init);
            let data = null;
            try {
                data = await response.json();
            } catch (error) {
                data = null;
            }
            if (!response.ok || !data || data.ok !== true) {
                throw new Error((data && data.error) || "Tidak dapat terhubung ke server.");
            }
            return data;
        } finally {
            if (timer) {
                window.clearTimeout(timer);
            }
        }
    }

    function announce() {
        renderResume();
        document.dispatchEvent(
            new CustomEvent("account:changed", {
                detail: { name: identity, account: account },
            }),
        );
    }

    function toast(message) {
        let element = document.getElementById("account-toast");
        if (!element) {
            element = document.createElement("div");
            element.id = "account-toast";
            element.className = "account-toast";
            element.setAttribute("role", "status");
            document.body.appendChild(element);
        }
        element.textContent = message;
        element.classList.add("is-visible");
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(function () {
            element.classList.remove("is-visible");
        }, 2800);
    }

    function needLogin() {
        toast("Silahkan Login Terlebih dahulu");
        document.dispatchEvent(new CustomEvent("account:need-login"));
    }

    function ayahHref(surah, ayah) {
        const query = "?surah=" + surah + "&ayah=" + ayah + "#ayah-" + ayah;
        return isReader ? query : "surah/" + query;
    }

    function timeAgo(value) {
        const time = Number(value);
        if (!time) {
            return "Baru saja";
        }
        const diff = Math.max(0, Date.now() - time);
        const minutes = Math.floor(diff / 60000);
        if (minutes < 1) {
            return "Baru saja";
        }
        if (minutes < 60) {
            return minutes + " menit lalu";
        }
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return hours + " jam lalu";
        }
        const days = Math.floor(hours / 24);
        if (days < 30) {
            return days + " hari lalu";
        }
        try {
            return new Date(time).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch (error) {
            return "Sebelumnya";
        }
    }

    function renderResume() {
        const resume = document.getElementById("resume");
        if (!resume) {
            return;
        }
        const last = account.lastRead;
        if (!identity || !last) {
            resume.hidden = true;
            resume.innerHTML = "";
            return;
        }
        const surah = window.Quran && window.Quran.surahs ? window.Quran.surahs[last.surah - 1] : null;
        const name = surah ? surah[2] : "Surah " + last.surah;
        const arabic = surah ? surah[1] : "";
        resume.hidden = false;
        resume.innerHTML =
            '<a class="resume-link" href="' +
            ayahHref(last.surah, last.ayah) +
            '">' +
            '<span class="resume-copy">' +
            '<span class="resume-kicker">Lanjut baca</span>' +
            '<span class="resume-title">' +
            escapeHtml(name) +
            ' <span class="resume-ayah">&middot; Ayat ' +
            last.ayah +
            "</span></span>" +
            '<span class="resume-meta">' +
            escapeHtml(identity) +
            " &middot; " +
            escapeHtml(timeAgo(last.at)) +
            "</span>" +
            "</span>" +
            '<span class="resume-arabic" lang="ar" dir="rtl">' +
            escapeHtml(arabic) +
            "</span>" +
            '<span class="icon icon-chevron-forward resume-arrow" aria-hidden="true"></span>' +
            "</a>";
    }

    async function identify(rawName) {
        const name = String(rawName == null ? "" : rawName)
            .trim()
            .replace(/\s+/g, " ");
        if (name.length < 2) {
            throw new Error("Identitas minimal 2 karakter.");
        }
        if (name.length > 40) {
            throw new Error("Identitas maksimal 40 karakter.");
        }
        const data = await api("/identify", { method: "POST", body: { name: name } });
        identity = data.user.name;
        account = normalizeState(data.user, identity);
        try {
            window.localStorage.setItem(IDENTITY_KEY, identity);
        } catch (error) {
            // Tetap lanjut walau penyimpanan lokal tidak tersedia.
        }
        saveCache();
        announce();
        return account;
    }

    async function refresh() {
        if (!identity) {
            return;
        }
        try {
            const data = await api("/state?name=" + encodeURIComponent(identity));
            account = mergeServer(normalizeState(data.user, identity), account);
            saveCache();
            announce();
        } catch (error) {
            return;
        }
    }

    function logout() {
        identity = "";
        account = { name: "", lastRead: null, bookmarks: [] };
        try {
            window.localStorage.removeItem(IDENTITY_KEY);
            window.localStorage.removeItem(CACHE_KEY);
        } catch (error) {
            return;
        }
        announce();
    }

    function setLastRead(surah, ayah) {
        if (!identity) {
            needLogin();
            return false;
        }
        const nextSurah = Number(surah);
        const nextAyah = Number(ayah);
        if (!Number.isInteger(nextSurah) || !Number.isInteger(nextAyah)) {
            return false;
        }
        account.lastRead = { surah: nextSurah, ayah: nextAyah, at: Date.now() };
        saveCache();
        announce();
        api("/last-read", {
            method: "POST",
            body: { name: identity, surah: nextSurah, ayah: nextAyah },
        })
            .then(function (data) {
                account = mergeServer(normalizeState(data.user, identity), account);
                saveCache();
                announce();
            })
            .catch(function () {
                toast("Tersimpan di perangkat. Server belum tersambung.");
            });
        return true;
    }

    function toggleBookmark(surah, ayah) {
        if (!identity) {
            needLogin();
            return null;
        }
        const nextSurah = Number(surah);
        const nextAyah = Number(ayah);
        if (!Number.isInteger(nextSurah) || !Number.isInteger(nextAyah)) {
            return null;
        }
        const index = account.bookmarks.findIndex(function (item) {
            return item.surah === nextSurah && item.ayah === nextAyah;
        });
        const added = index === -1;
        if (added && account.bookmarks.length >= MAX_BOOKMARKS) {
            toast("Bookmark sudah mencapai batas " + MAX_BOOKMARKS + ".");
            return null;
        }
        if (added) {
            account.bookmarks.unshift({ surah: nextSurah, ayah: nextAyah, at: Date.now() });
        } else {
            account.bookmarks.splice(index, 1);
        }
        saveCache();
        announce();
        api("/bookmarks", {
            method: "POST",
            body: {
                name: identity,
                surah: nextSurah,
                ayah: nextAyah,
                action: added ? "add" : "remove",
            },
        })
            .then(function (data) {
                account = mergeServer(normalizeState(data.user, identity), account, {
                    removed: added ? null : { surah: nextSurah, ayah: nextAyah },
                });
                saveCache();
                announce();
            })
            .catch(function () {
                toast("Perubahan tersimpan di perangkat. Server belum tersambung.");
            });
        return added;
    }

    function isBookmarked(surah, ayah) {
        const nextSurah = Number(surah);
        const nextAyah = Number(ayah);
        return account.bookmarks.some(function (item) {
            return item.surah === nextSurah && item.ayah === nextAyah;
        });
    }

    function isLastRead(surah, ayah) {
        return Boolean(
            account.lastRead && account.lastRead.surah === Number(surah) && account.lastRead.ayah === Number(ayah),
        );
    }

    window.QuranAccount = {
        identify: identify,
        refresh: refresh,
        logout: logout,
        setLastRead: setLastRead,
        toggleBookmark: toggleBookmark,
        isBookmarked: isBookmarked,
        isLastRead: isLastRead,
        ayahHref: ayahHref,
        needLogin: needLogin,
        toast: toast,
        getName: function () {
            return identity;
        },
        getState: function () {
            return account;
        },
    };

    loadCache();
    renderResume();
    window.setTimeout(function () {
        announce();
        if (identity) {
            refresh();
        }
    }, 0);
})();

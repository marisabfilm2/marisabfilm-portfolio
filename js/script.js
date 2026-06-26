// ==========================================================================
// TRANSICIÓN DE ENTRADA (Manejada por CSS de forma segura para Safari)
// ==========================================================================
const transition = ".6s cubic-bezier(.22,1,.36,1)"

// Nota: Se ha removido el bloque 'opacity = 0' y 'window.onload' para evitar pantallas en blanco.

// --------------------------------------------------------------------------
// IMPORTANTE: cada bloque de abajo va envuelto en su propio try/catch.
// Antes, si una sola línea fallaba en Safari (p. ej. un selector vacío o
// una API no soportada), TODO el código que venía después en este mismo
// archivo dejaba de ejecutarse (incluyendo el autoplay del vídeo de la boda
// y las transiciones de página, que estaban más abajo en el archivo).
// Aislando cada bloque, un fallo puntual ya no puede tumbar el resto.
// --------------------------------------------------------------------------

try {
    const header = document.querySelector(".header")

    if (header) {
        window.addEventListener(
            "scroll",
            () => {
                if (window.scrollY > 50) {
                    header.classList.add("scrolled")
                } else {
                    header.classList.remove("scrolled")
                }
            }
        )
    }
} catch (e) {
    console.error("Error en header scroll:", e)
}

try {
    const heroTitle = document.querySelector(".hero-title")
    const heroSubtitle = document.querySelector(".hero-subtitle")
    const heroVideo = document.querySelector(".video-container")
    const scrollText = document.querySelector(".scroll")
    const scrollLine = document.getElementById("scroll-line")

    if (heroTitle && heroSubtitle && heroVideo) {
        let naturalHeight = 0
        let targetProgress = 0
        let currentProgress = 0
        let targetScroll = 0
        let currentScroll = 0

        const easeOutCubic = t => 1 - Math.pow(1 - t, 3)

        // IMPORTANTE: usamos "const nombre = () => {}" en vez de
        // "function nombre() {}". Safari/WebKit tiene un bug conocido con
        // funciones declaradas (function) dentro de bloques anidados
        // (if dentro de try) en el ámbito global: pierde la conexión con
        // las const del bloque que las envuelve (aquí, heroSubtitle).
        // Las funciones-expresión no sufren ese problema.
        const measure = () => {
            naturalHeight = heroSubtitle.offsetHeight
        }

        const updateTarget = () => {
            targetScroll = window.scrollY
            const maxScroll = window.innerHeight * 0.7
            let p = targetScroll / maxScroll

            if (p > 1) p = 1
            if (p < 0) p = 0

            targetProgress = p
        }

        const animate = () => {
            currentProgress += (targetProgress - currentProgress) * 0.1
            currentScroll += (targetScroll - currentScroll) * 0.1

            const eased = easeOutCubic(currentProgress)
            const offset = (naturalHeight / 2) * (1 - eased)

            // translate3d en vez de translateY: fuerza una capa de composición
            // GPU en Safari y evita animaciones a tirones o que no se pinten.
            heroTitle.style.transform = `translate3d(0, ${offset}px, 0)`
            heroSubtitle.style.opacity = eased
            heroSubtitle.style.transform = `translate3d(0, ${20 * (1 - eased)}px, 0)`

            const videoStart = window.innerHeight * 0.7
            const videoEnd = window.innerHeight
            let videoProgress = (currentScroll - videoStart) / (videoEnd - videoStart)

            if (videoProgress > 1) videoProgress = 1
            if (videoProgress < 0) videoProgress = 0

            const videoEased = easeOutCubic(videoProgress)

            heroVideo.style.opacity = 1 - videoEased
            heroVideo.style.transform = `translate3d(0, ${currentScroll * .12}px, 0)`

            const bgThreshold = window.innerHeight * 0.85
            if (currentScroll >= bgThreshold) {
                document.body.classList.add("light-mode")
            } else {
                document.body.classList.remove("light-mode")
            }

            const fade = currentProgress > 0.1 ? 0 : 1

            if (scrollText) scrollText.style.opacity = fade
            if (scrollLine) scrollLine.style.opacity = fade * 0.8

            requestAnimationFrame(animate)
        }

        measure()

        window.addEventListener("resize", measure)
        window.addEventListener("scroll", updateTarget)
        window.addEventListener("load", measure)

        requestAnimationFrame(animate)
    }
} catch (e) {
    console.error("Error en animación del hero:", e)
}

// =========================
// FADE IN DE ELEMENTOS
// =========================
try {
    const revealItems = document.querySelectorAll(".projects-header, .project-info, .photo-box")

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = "1"
                        entry.target.style.transform = "translate3d(0,0,0)"
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
        )

        revealItems.forEach((item, i) => {
            item.style.opacity = "0"
            item.style.transform = "translate3d(0, 40px, 0)"
            item.style.transition = `opacity .7s ease ${i * 0.07}s, transform .7s ease ${i * 0.07}s`
            observer.observe(item)
        })
    } else {
        // Sin IntersectionObserver disponible: mostramos los elementos directamente
        revealItems.forEach((item) => {
            item.style.opacity = "1"
        })
    }
} catch (e) {
    console.error("Error en fade-in de elementos:", e)
}

// =========================
// TRANSICIONES DE PÁGINA (Al salir de la página)
// =========================
try {
    const links = document.querySelectorAll("a")

    links.forEach(
        (link) => {
            const href = link.getAttribute("href")
            if (href && !href.startsWith("#") && !href.startsWith("mailto:") && !href.startsWith("tel:")) {
                link.addEventListener(
                    "click",
                    (e) => {
                        // Respeta clics con modificador (abrir en pestaña nueva, etc.)
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return

                        e.preventDefault()
                        document.body.style.transition = "opacity .25s ease"
                        document.body.style.opacity = "0"
                        setTimeout(
                            () => { window.location = href },
                            250
                        )
                    }
                )
            }
        }
    )
} catch (e) {
    console.error("Error en transiciones de página:", e)
}

// =========================
// AUTOPLAY VIDEO BODA
// =========================
try {
    const videoBoda = document.getElementById('videoBoda')

    if (videoBoda) {
        // Refuerzo: Safari es más estricto cuando el .play() se dispara
        // desde JS (en vez de solo por el atributo autoplay del HTML).
        videoBoda.muted = true
        videoBoda.setAttribute('muted', '')
        videoBoda.playsInline = true

        if ("IntersectionObserver" in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        videoBoda.muted = true
                        const playPromise = videoBoda.play()
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.log("El navegador bloqueó el autoplay temporalmente:", error)
                            })
                        }
                    } else {
                        videoBoda.pause()
                    }
                })
            }, {
                threshold: 0.3
            })

            videoObserver.observe(videoBoda)
        }
    }
} catch (e) {
    console.error("Error en autoplay del video de boda:", e)
}

try {
    document.addEventListener("DOMContentLoaded", () => {
        // Seleccionamos todos los elementos maquetados para el efecto
        const fadeElements = document.querySelectorAll(".fade-in-element");

        if (!fadeElements.length) return
        if (!("IntersectionObserver" in window)) {
            fadeElements.forEach(el => el.classList.add("is-visible"))
            return
        }

        // Configuración del observador de scroll
        const observerOptions = {
            root: null, // Usa el viewport del navegador
            rootMargin: "0px",
            threshold: 0.15 // Se activa cuando el 15% del elemento es visible
        };

        const scrollObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                // Si el elemento entra en el rango de visión
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    // Una vez que aparece, dejamos de observarlo para optimizar rendimiento
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Activamos el observador para cada elemento encontrado
        fadeElements.forEach(element => {
            scrollObserver.observe(element);
        });
    });
} catch (e) {
    console.error("Error en fade-in-element:", e)
}

// CONTROL EXACTO DEL BUCLE DEL VÍDEO ECLIPSO (Segundos 9 al 36)
try {
    const eclipsoVideo = document.getElementById('eclipsoVideo');
    if (eclipsoVideo) {
        eclipsoVideo.muted = true
        eclipsoVideo.setAttribute('muted', '')
        eclipsoVideo.addEventListener('timeupdate', function () {
            if (this.currentTime >= 36) {
                this.currentTime = 9;
                this.play();
            }
        });
    }
} catch (e) {
    console.error("Error en loop de video eclipso:", e)
}

// CONTROL EXACTO DEL BUCLE DEL VÍDEO ZARA (Segundos 3 al 46)
try {
    const zaraVideo = document.getElementById('zaraVideo');
    if (zaraVideo) {
        zaraVideo.muted = true
        zaraVideo.setAttribute('muted', '')
        zaraVideo.addEventListener('timeupdate', function () {
            if (this.currentTime >= 46) {
                this.currentTime = 3;
                this.play();
            }
        });
    }
} catch (e) {
    console.error("Error en loop de video zara:", e)
}

// Lightbox galería
try {
    (function () {
        const lightbox = document.getElementById('lightbox');
        if (!lightbox) return;

        const lbImg = document.getElementById('lightbox-img');
        const lbClose = document.getElementById('lightbox-close');
        const lbPrev = document.getElementById('lightbox-prev');
        const lbNext = document.getElementById('lightbox-next');
        const items = Array.from(document.querySelectorAll('.masonry-item:not(.masonry-color-block)'));
        let current = 0;

        function open(index) {
            current = index;
            lbImg.src = items[current].dataset.src;
            lightbox.classList.add('is-open');
            lightbox.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
        }

        function close() {
            lightbox.classList.remove('is-open');
            lightbox.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }

        function prev() { open((current - 1 + items.length) % items.length); }
        function next() { open((current + 1) % items.length); }

        items.forEach((item, i) => item.addEventListener('click', () => open(i)));
        if (lbClose) lbClose.addEventListener('click', close);
        if (lbPrev) lbPrev.addEventListener('click', prev);
        if (lbNext) lbNext.addEventListener('click', next);
        lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

        document.addEventListener('keydown', e => {
            if (!lightbox.classList.contains('is-open')) return;
            if (e.key === 'Escape') close();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        });
    })();
} catch (e) {
    console.error("Error en lightbox:", e)
}

// Fade-in aleatorio de la galería masonry
try {
    document.addEventListener('DOMContentLoaded', function () {
        const items = Array.from(document.querySelectorAll('.masonry-item'));
        if (!items.length) return;

        if (!("IntersectionObserver" in window)) {
            items.forEach(item => item.classList.add('is-visible'))
            return
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = Math.random() * 600; // entre 0 y 600ms aleatorio
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                    }, delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        items.forEach(item => observer.observe(item));
    });
} catch (e) {
    console.error("Error en fade-in de galería masonry:", e)
}

// HAMBURGUESA — menú móvil
try {
    var btn = document.querySelector('.hamburger');
    var overlay = document.querySelector('.nav-mobile-overlay');
    if (btn && overlay) {
        btn.addEventListener('click', function () {
            var isOpen = overlay.classList.toggle('is-open');
            btn.classList.toggle('is-open', isOpen);
            btn.setAttribute('aria-expanded', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
        overlay.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                overlay.classList.remove('is-open');
                btn.classList.remove('is-open');
                btn.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            });
        });
    }
} catch (e) { console.error('Hamburguesa:', e); }
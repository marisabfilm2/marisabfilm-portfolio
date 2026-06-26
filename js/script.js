const transition = ".6s cubic-bezier(.22,1,.36,1)"

document.body.style.opacity = "0"

window.addEventListener(
    "load",
    () => {
        document.body.style.transition = "opacity .8s, background-color .6s ease"
        document.body.style.opacity = "1"
    }
)

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

    function measure() {
        naturalHeight = heroSubtitle.offsetHeight
    }

    function updateTarget() {
        targetScroll = window.scrollY
        const maxScroll = window.innerHeight * 0.7
        let p = targetScroll / maxScroll

        if (p > 1) p = 1
        if (p < 0) p = 0

        targetProgress = p
    }

    function animate() {
        currentProgress += (targetProgress - currentProgress) * 0.1
        currentScroll += (targetScroll - currentScroll) * 0.1

        const eased = easeOutCubic(currentProgress)
        const offset = (naturalHeight / 2) * (1 - eased)

        heroTitle.style.transform = `translateY(${offset}px)`
        heroSubtitle.style.opacity = eased
        heroSubtitle.style.transform = `translateY(${20 * (1 - eased)}px)`

        const videoStart = window.innerHeight * 0.7
        const videoEnd = window.innerHeight
        let videoProgress = (currentScroll - videoStart) / (videoEnd - videoStart)

        if (videoProgress > 1) videoProgress = 1
        if (videoProgress < 0) videoProgress = 0

        const videoEased = easeOutCubic(videoProgress)

        heroVideo.style.opacity = 1 - videoEased
        heroVideo.style.transform = `translateY(${currentScroll * .12}px)`

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

// =========================
// FADE IN DE ELEMENTOS
// =========================
const revealItems = document.querySelectorAll(".projects-header, .project-info, .photo-box")

const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1"
                entry.target.style.transform = "translateY(0)"
                observer.unobserve(entry.target)
            }
        })
    },
    { threshold: 0.05, rootMargin: "0px 0px -60px 0px" }
)

revealItems.forEach((item, i) => {
    item.style.opacity = "0"
    item.style.transform = "translateY(40px)"
    item.style.transition = `opacity .7s ease ${i * 0.07}s, transform .7s ease ${i * 0.07}s`
    observer.observe(item)
})

// =========================
// TRANSICIONES DE PÁGINA
// =========================
const links = document.querySelectorAll("a")

links.forEach(
    (link) => {
        const href = link.getAttribute("href")
        if (href && !href.startsWith("#")) {
            link.addEventListener(
                "click",
                (e) => {
                    e.preventDefault()
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

// =========================
// AUTOPLAY VIDEO BODA
// =========================
const videoBoda = document.getElementById('videoBoda')

if (videoBoda) {
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                videoBoda.play().catch(error => {
                    console.log("El navegador bloqueó el autoplay temporalmente:", error)
                })
            } else {
                videoBoda.pause()
            }
        })
    }, {
        threshold: 0.3
    })

    videoObserver.observe(videoBoda)
}


document.addEventListener("DOMContentLoaded", () => {
    // Seleccionamos todos los elementos maquetados para el efecto
    const fadeElements = document.querySelectorAll(".fade-in-element");

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

// CONTROL EXACTO DEL BUCLE DEL VÍDEO ECLIPSO (Segundos 9 al 36)
const eclipsoVideo = document.getElementById('eclipsoVideo');
if (eclipsoVideo) {
    eclipsoVideo.addEventListener('timeupdate', function () {
        if (this.currentTime >= 36) {
            this.currentTime = 9;
            this.play();
        }
    });
}

// CONTROL EXACTO DEL BUCLE DEL VÍDEO ZARA (Segundos 3 al 46)
const zaraVideo = document.getElementById('zaraVideo');
if (zaraVideo) {
    zaraVideo.addEventListener('timeupdate', function () {
        if (this.currentTime >= 46) {
            this.currentTime = 3;
            this.play();
        }
    });
}

// Lightbox galería
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
    lbClose.addEventListener('click', close);
    lbPrev.addEventListener('click', prev);
    lbNext.addEventListener('click', next);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });

    document.addEventListener('keydown', e => {
        if (!lightbox.classList.contains('is-open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') prev();
        if (e.key === 'ArrowRight') next();
    });
})();

// Fade-in aleatorio de la galería masonry
document.addEventListener('DOMContentLoaded', function () {
    const items = Array.from(document.querySelectorAll('.masonry-item'));
    if (!items.length) return;

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



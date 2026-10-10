/* Portfolio Mounir — fonctionnalités du site */
document.addEventListener("DOMContentLoaded", () => {
    // Icônes
    if (window.lucide) window.lucide.createIcons();

    // Année du copyright
    const year = document.querySelector("#current-year");
    if (year) year.textContent = new Date().getFullYear();

    // Navigation mobile
    const menuToggle = document.querySelector("#menu-toggle");
    const navLinks = document.querySelector("#main-menu");
    if (menuToggle && navLinks) {
        const closeMenu = () => {
            navLinks.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Ouvrir le menu");
        };
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("active");
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute("aria-label", isOpen ? "Fermer le menu" : "Ouvrir le menu");
        });
        navLinks.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMenu));
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeMenu();
        });
        window.addEventListener("resize", () => {
            if (window.innerWidth > 900) closeMenu();
        });
    }

    // Filtrage des projets
    const filterButtons = document.querySelectorAll(".filter-btn");
    const projectCards = document.querySelectorAll(".project-card");
    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(other => other.classList.toggle("active", other === button));
            const filter = button.dataset.filter;
            projectCards.forEach(card => {
                card.hidden = filter !== "all" && card.dataset.category !== filter;
            });
        });
    });

    // Onglets accessibles du parcours
    const tabs = Array.from(document.querySelectorAll(".journey-tab"));
    const panels = Array.from(document.querySelectorAll(".journey-panel"));
    function activateTab(tab) {
        const panel = document.getElementById(tab.getAttribute("aria-controls"));
        if (!panel) return;
        tabs.forEach(button => {
            const active = button === tab;
            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
            button.tabIndex = active ? 0 : -1;
        });
        panels.forEach(item => {
            item.hidden = item !== panel;
            item.classList.toggle("active", item === panel);
        });
    }
    tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => activateTab(tab));
        tab.addEventListener("keydown", event => {
            let next;
            if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
            else if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
            else if (event.key === "Home") next = 0;
            else if (event.key === "End") next = tabs.length - 1;
            else return;
            event.preventDefault();
            activateTab(tabs[next]);
            tabs[next].focus();
        });
    });

    // Animations d'apparition : n'animer que les éléments visibles des onglets
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealElements = document.querySelectorAll(
        ".about-content, .info-card, .skill-card, .project-card, .contact-info, .contact-form-wrapper"
    );
    if (!reducedMotion && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        revealElements.forEach(element => {
            element.classList.add("reveal");
            observer.observe(element);
        });
    }

    // Effet d'écriture (une seule fois)
    const typingElement = document.querySelector("#typing-text");
    if (typingElement && !reducedMotion) {
        const text = typingElement.textContent.trim();
        let index = 0;
        typingElement.textContent = "";
        function typeNext() {
            if (index >= text.length) return;
            typingElement.textContent += text.charAt(index++);
            setTimeout(typeNext, 65);
        }
        typeNext();
    }

    // Formulaire Web3Forms (remplace l'ancien gestionnaire mailto)
    const form = document.querySelector("#contact-form");
    const result = document.querySelector("#form-result");
    if (form && result) {
        form.addEventListener("submit", async event => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const button = form.querySelector('button[type="submit"]');
            if (!button) return;
            const initialText = button.textContent;
            button.disabled = true;
            button.textContent = "Envoi en cours...";
            result.textContent = "";
            result.className = "";
            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form)
                });
                const payload = await response.json();
                if (!response.ok || !payload.success) {
                    throw new Error(payload.message || "Échec de l'envoi");
                }
                result.textContent = "Votre message a été envoyé avec succès.";
                result.className = "form-success";
                form.reset();
            } catch (error) {
                result.textContent = "L'envoi a échoué. Veuillez réessayer.";
                result.className = "form-error";
                console.error("Erreur formulaire :", error);
            } finally {
                button.disabled = false;
                button.textContent = initialText;
            }
        });
    }
});

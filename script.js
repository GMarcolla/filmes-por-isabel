document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Atualizar Ano no Footer ---
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- 2. Menu Mobile ---
    const menuBtn = document.querySelector('.menu-btn');
    const nav = document.getElementById('nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuBtn && nav) {
        menuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            // Alternar ícone (hambúrguer para fechar)
            const icon = menuBtn.querySelector('i');
            if (nav.classList.contains('active')) {
                icon.classList.replace('ph-list', 'ph-x');
            } else {
                icon.classList.replace('ph-x', 'ph-list');
            }
        });

        // Fecha apenas o menu mobile (se existir) na hora do clique
        navLinks.forEach(link => {
            link.addEventListener('click', function () {
                if (nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    const icon = menuBtn.querySelector('i');
                    if (icon) icon.classList.replace('ph-x', 'ph-list');
                }
            });
        });
    }

    // --- 2.b Scroll Suave Genérico ---
    // Aplana suporte tanto para desktop quanto mobile para a classe .nav-link
    const allInternalLinks = document.querySelectorAll('a[href^="#"]');
    const pageHeader = document.getElementById('header');

    allInternalLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                e.preventDefault();

                const headerHeight = pageHeader ? pageHeader.offsetHeight : 80;
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 3. Header Scrolled ---
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // --- 4. Intersection Observer (Animações CSS) ---
    // Seleciona elementos que devem ser animados
    const animatedElements = document.querySelectorAll('.hidden, .fade-in, .fade-in-up, .slide-in-left, .slide-in-right, .slide-up');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15 // Dispara quando 15% do elemento estiver visível
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Adiciona a classe 'visible' para iniciar a animação
                entry.target.classList.add('visible');
                // Adiciona um delay se especificado no inline style (ex: style="--delay: 0.2s")
                const delay = entry.target.style.getPropertyValue('--delay');
                if (delay) {
                    entry.target.style.transitionDelay = delay;
                }
                // Para de observar após a animação (opcional: comente para animar sempre que escrolar)
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // --- 5. Modal de Vídeo (Portfólio) ---
    const portfolioCards = document.querySelectorAll('.portfolio-card');
    const modal = document.getElementById('videoModal');
    const modalVideo = document.getElementById('modalVideo');
    const closeModalBtn = document.querySelector('.close-modal');

    // --- 5.1 Preview Automático nos Cards quando visíveis ---
    portfolioCards.forEach(card => {
        const videoSrc = card.getAttribute('data-video');
        const thumbSrc = card.getAttribute('data-thumb');
        const thumbDiv = card.querySelector('.portfolio-thumb');
        
        if (videoSrc && thumbDiv) {
            // Criar elemento de vídeo para preview
            const previewVideo = document.createElement('video');
            previewVideo.src = videoSrc;
            previewVideo.muted = true;
            previewVideo.playsInline = true;
            previewVideo.preload = 'auto';
            previewVideo.setAttribute('webkit-playsinline', 'true');
            thumbDiv.appendChild(previewVideo);

            let hasPlayed = false;
            let pauseTimeout;
            let playTimeout;

            // Função para voltar à thumbnail
            const voltarParaThumbnail = () => {
                previewVideo.pause();
                previewVideo.currentTime = 0;
                previewVideo.classList.remove('playing');
            };

            // Observer para detectar quando o card está visível
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !hasPlayed) {
                        // Aguarda 1 segundo e inicia o preview
                        playTimeout = setTimeout(() => {
                            if (entry.isIntersecting) {
                                previewVideo.currentTime = 0;
                                
                                // Tentar reproduzir o vídeo
                                const playPromise = previewVideo.play();
                                
                                if (playPromise !== undefined) {
                                    playPromise.then(() => {
                                        // Vídeo começou a tocar
                                        previewVideo.classList.add('playing');
                                        hasPlayed = true;

                                        // Para o vídeo após 15 segundos
                                        pauseTimeout = setTimeout(() => {
                                            voltarParaThumbnail();
                                        }, 15000);
                                    }).catch(error => {
                                        // Autoplay foi bloqueado (comum no mobile)
                                        console.log('Autoplay bloqueado:', error);
                                    });
                                }
                            }
                        }, 1000);
                    } else if (!entry.isIntersecting) {
                        // Limpar timeouts se o card sair da tela
                        clearTimeout(playTimeout);
                        clearTimeout(pauseTimeout);
                    }
                });
            }, {
                threshold: 0.5 // Inicia quando 50% do card está visível
            });

            // Quando o vídeo terminar naturalmente, voltar à thumbnail
            previewVideo.addEventListener('ended', voltarParaThumbnail);

            cardObserver.observe(card);
        }
    });

    if (modal && modalVideo) {
        // Abrir Modal
        portfolioCards.forEach(card => {
            card.addEventListener('click', () => {
                const videoSrc = card.getAttribute('data-video');
                if (videoSrc) {
                    modalVideo.src = videoSrc;
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Evitar scroll no body
                    modalVideo.play();
                }
            });
        });

        // Fechar Modal (Botão ou clicando fora)
        const fecharModal = () => {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // Restaurar scroll
            modalVideo.pause();
            modalVideo.src = ''; // Limpar source
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', fecharModal);
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                fecharModal();
            }
        });

        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                fecharModal();
            }
        });
    }

    // --- 6. Active Link Scroll Spy ---
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

});

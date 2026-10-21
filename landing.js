(() => {
    "use strict";

    const canvas = document.querySelector("[data-field-canvas]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isGateway = document.body.classList.contains("gateway-page");
    const isIntro = document.body.classList.contains("intro-page");

    document.documentElement.classList.add("has-js");
    requestAnimationFrame(() => document.body.classList.add("is-ready"));

    if (canvas && !isIntro && !isGateway) {
        const context = canvas.getContext("2d", { alpha: true });
        const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
        let width = 0;
        let height = 0;
        let dpr = 1;
        let frame = 0;
        let running = true;

        const resize = () => {
            const bounds = canvas.getBoundingClientRect();
            width = Math.max(1, bounds.width);
            height = Math.max(1, bounds.height);
            dpr = Math.min(window.devicePixelRatio || 1, 1.75);
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            context.setTransform(dpr, 0, 0, dpr, 0, 0);
            draw(performance.now(), true);
        };

        const updatePointer = (event) => {
            pointer.targetX = (event.clientX / Math.max(width, 1) - 0.5) * 2;
            pointer.targetY = (event.clientY / Math.max(height, 1) - 0.5) * 2;
        };

        const drawContour = (time, index, total) => {
            const phase = time * 0.000085;
            const lane = index / Math.max(total - 1, 1) - 0.5;
            const centerX = width * (isGateway ? 0.72 : 0.75);
            const centerY = height * (isGateway ? 0.32 : 0.50);
            const extentX = Math.max(width * 0.34, 300);
            const extentY = Math.max(height * 0.62, 360);

            context.beginPath();
            for (let step = 0; step <= 92; step += 1) {
                const u = step / 92;
                const angle = u * Math.PI * 2;
                const depth = 0.44 + index / total * 0.78;
                const breathing = 1 + Math.sin(phase * 2.2 + index * 0.31) * 0.024;
                const pinch = 0.72 + 0.28 * Math.cos(angle * 2);
                const wave = Math.sin(angle * 3 + phase * 3 + index * 0.18) * 0.028;
                const x = centerX
                    + Math.cos(angle) * extentX * depth * breathing * (0.88 + wave)
                    + pointer.x * 16 * pinch;
                const y = centerY
                    + Math.sin(angle) * extentY * depth * pinch * (0.76 + wave)
                    + lane * 16
                    + pointer.y * 12;

                if (step === 0) context.moveTo(x, y);
                else context.lineTo(x, y);
            }
            context.closePath();

            const alpha = 0.018 + (1 - Math.abs(lane)) * 0.032;
            context.strokeStyle = `rgba(190, 213, 225, ${alpha})`;
            context.lineWidth = index % 7 === 0 ? 0.9 : 0.42;
            context.stroke();
        };

        const drawSpine = (time) => {
            const phase = time * 0.00013;
            const x = width * (isGateway ? 0.74 : 0.76) + pointer.x * 12;
            const y = height * (isGateway ? 0.32 : 0.50) + pointer.y * 8;
            const radius = Math.min(width, height) * (isGateway ? 0.13 : 0.19);
            const gradient = context.createRadialGradient(x, y, 0, x, y, radius * 2.2);
            gradient.addColorStop(0, "rgba(202, 225, 236, 0.16)");
            gradient.addColorStop(0.32, "rgba(124, 170, 195, 0.055)");
            gradient.addColorStop(1, "rgba(5, 6, 7, 0)");
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(x, y, radius * 2.2, 0, Math.PI * 2);
            context.fill();

            context.save();
            context.translate(x, y);
            context.rotate(phase * 0.32);
            for (let i = 0; i < 3; i += 1) {
                context.rotate(Math.PI / 3);
                context.beginPath();
                context.ellipse(0, 0, radius * (1.06 + i * 0.13), radius * (0.25 + i * 0.035), 0, 0, Math.PI * 2);
                context.strokeStyle = `rgba(211, 227, 234, ${0.10 - i * 0.018})`;
                context.lineWidth = i === 0 ? 1.0 : 0.55;
                context.stroke();
            }
            context.restore();

            context.beginPath();
            context.moveTo(x, y - radius * 1.55);
            context.bezierCurveTo(
                x - radius * 0.18,
                y - radius * 0.65,
                x + radius * 0.18,
                y + radius * 0.65,
                x,
                y + radius * 1.55
            );
            context.strokeStyle = "rgba(224, 235, 239, 0.22)";
            context.lineWidth = 0.75;
            context.stroke();
        };

        const draw = (time, staticFrame = false) => {
            if (!context || !width || !height) return;
            context.clearRect(0, 0, width, height);
            pointer.x += (pointer.targetX - pointer.x) * 0.025;
            pointer.y += (pointer.targetY - pointer.y) * 0.025;

            context.save();
            context.globalCompositeOperation = "screen";
            const total = width < 620 ? 24 : 42;
            for (let index = 0; index < total; index += 1) {
                drawContour(staticFrame ? 0 : time, index, total);
            }
            drawSpine(staticFrame ? 0 : time);
            context.restore();
        };

        const animate = (time) => {
            if (!running) return;
            if (!reducedMotion.matches) {
                frame += 1;
                if (frame % 2 === 0) draw(time);
                requestAnimationFrame(animate);
            } else {
                draw(0, true);
            }
        };

        window.addEventListener("resize", resize, { passive: true });
        window.addEventListener("pointermove", updatePointer, { passive: true });
        document.addEventListener("visibilitychange", () => {
            running = !document.hidden;
            if (running && !reducedMotion.matches) requestAnimationFrame(animate);
        });
        reducedMotion.addEventListener?.("change", () => {
            running = true;
            requestAnimationFrame(animate);
        });

        resize();
        requestAnimationFrame(animate);
    }

    const entryLink = document.querySelector("[data-entry-trigger]");
    const latticeVideo = document.querySelector("[data-entry-lattice-video]");
    const latticeObjectVideo = document.querySelector("[data-entry-lattice-object-video]");
    const gatewayHeroLattice = document.querySelector(".gateway-hero-lattice");
    const gatewayHeroVideo = document.querySelector(".gateway-hero-lattice-video");
    const entryAnnouncer = document.querySelector("[data-entry-announcer]");
    let entryPreviewActive = false;
    let entryPreviewSounding = false;
    let entryTransitioning = false;
    let entryFlashTimer = 0;
    let entryFallbackTimer = 0;
    let entryVolumeFrame = 0;
    const entryCycleFallbackMs = 6041.667;
    const entryBaseVolume = 0.58;

    const safePlay = (video = latticeVideo) => {
        if (!video) return;
        const playAttempt = video.play();
        playAttempt?.catch(() => {
            video.muted = true;
            video.play().catch(() => {});
        });
    };

    if (gatewayHeroVideo && gatewayHeroLattice && !reducedMotion.matches) {
        gatewayHeroVideo.muted = true;
        gatewayHeroVideo.currentTime = 0;
        gatewayHeroVideo.addEventListener("playing", () => {
            gatewayHeroLattice.classList.add("is-playing");
        });
        safePlay(gatewayHeroVideo);
    }

    const stopEntryVolumeEnvelope = () => {
        if (entryVolumeFrame) cancelAnimationFrame(entryVolumeFrame);
        entryVolumeFrame = 0;
    };

    const runEntryVolumeEnvelope = () => {
        if (!latticeVideo || latticeVideo.muted || (!entryPreviewActive && !entryTransitioning)) {
            entryVolumeFrame = 0;
            return;
        }
        const duration = Number.isFinite(latticeVideo.duration) && latticeVideo.duration > 0
            ? latticeVideo.duration
            : entryCycleFallbackMs / 1000;
        const fadeInSeconds = 0.08;
        const fadeOutSeconds = 0.62;
        const fadeInGain = Math.min(1, latticeVideo.currentTime / fadeInSeconds);
        const fadeOutGain = Math.min(1, Math.max(0, duration - latticeVideo.currentTime) / fadeOutSeconds);
        latticeVideo.volume = entryBaseVolume * Math.min(fadeInGain, fadeOutGain);
        entryVolumeFrame = requestAnimationFrame(runEntryVolumeEnvelope);
    };

    const startEntryVolumeEnvelope = () => {
        stopEntryVolumeEnvelope();
        entryVolumeFrame = requestAnimationFrame(runEntryVolumeEnvelope);
    };

    const resetEntryVideos = () => {
        [latticeVideo, latticeObjectVideo].forEach((video) => {
            if (!video) return;
            video.pause();
            video.currentTime = 0;
            video.loop = true;
        });
        stopEntryVolumeEnvelope();
        if (latticeVideo) latticeVideo.volume = entryBaseVolume;
    };

    const startEntryPreview = async () => {
        if (!latticeVideo || reducedMotion.matches || entryTransitioning || entryPreviewActive) return;
        entryPreviewActive = true;
        entryPreviewSounding = false;
        document.body.classList.remove("entry-experience-active");
        void document.body.offsetWidth;
        document.body.classList.add("entry-preview");
        resetEntryVideos();
        latticeVideo.volume = entryBaseVolume;
        latticeVideo.muted = false;
        if (latticeObjectVideo) {
            latticeObjectVideo.muted = true;
            latticeObjectVideo.currentTime = 0;
        }
        safePlay(latticeObjectVideo);
        try {
            await latticeVideo.play();
            entryPreviewSounding = !latticeVideo.muted;
            if (entryPreviewSounding) startEntryVolumeEnvelope();
        } catch (_error) {
            latticeVideo.muted = true;
            safePlay();
        }
        if (entryAnnouncer) {
            entryAnnouncer.textContent = "Entry preview active. Activate Enter Renaissance Field Lite once to enter.";
        }
    };

    const stopEntryPreview = () => {
        if (!latticeVideo || !entryPreviewActive || entryTransitioning) return;
        entryPreviewActive = false;
        entryPreviewSounding = false;
        document.body.classList.remove("entry-preview", "entry-experience-active", "entry-final-flash");
        resetEntryVideos();
        latticeVideo.muted = true;
        if (entryAnnouncer) {
            entryAnnouncer.textContent = "Entry preview stopped. Hover or focus to preview; activate once to enter.";
        }
    };

    const finishEntryTransition = (target) => {
        if (!entryTransitioning) return;
        window.clearTimeout(entryFlashTimer);
        window.clearTimeout(entryFallbackTimer);
        document.body.classList.add("is-leaving");
        window.setTimeout(() => {
            window.location.href = target;
        }, 620);
    };

    const unlockEntryTransition = async (target) => {
        if (!latticeVideo || reducedMotion.matches || entryTransitioning) return;
        entryTransitioning = true;
        entryPreviewActive = true;
        document.body.classList.remove("entry-preview");
        document.body.classList.add("entry-experience-active");
        const continueAudiblePreview =
            entryPreviewSounding &&
            !latticeVideo.muted &&
            !latticeVideo.paused &&
            latticeVideo.currentTime > 0.03;

        if (!continueAudiblePreview) {
            resetEntryVideos();
        }

        latticeVideo.loop = false;
        latticeVideo.muted = false;
        latticeVideo.volume = entryBaseVolume;
        if (latticeObjectVideo) {
            latticeObjectVideo.loop = true;
            latticeObjectVideo.muted = true;
        }

        try {
            await latticeVideo.play();
            entryPreviewSounding = true;
            startEntryVolumeEnvelope();
        } catch (_error) {
            entryPreviewSounding = false;
            latticeVideo.muted = true;
            safePlay();
        }
        safePlay(latticeObjectVideo);

        const durationSeconds = Number.isFinite(latticeVideo.duration) && latticeVideo.duration > 0
            ? latticeVideo.duration
            : entryCycleFallbackMs / 1000;
        const remainingMs = Math.max(480, (durationSeconds - latticeVideo.currentTime) * 1000);
        entryFlashTimer = window.setTimeout(() => {
            document.body.classList.add("entry-final-flash");
        }, Math.max(0, remainingMs - 980));
        entryFallbackTimer = window.setTimeout(() => {
            finishEntryTransition(target);
        }, remainingMs + 450);
        latticeVideo.addEventListener("ended", () => finishEntryTransition(target), { once: true });

        if (entryAnnouncer) {
            entryAnnouncer.textContent = "Entry transition active. The complete sound and lattice sequence will finish before Page 2 opens.";
        }
    };

    if (entryLink && latticeVideo) {
        entryLink.addEventListener("pointerenter", (event) => {
            if (event.pointerType === "mouse") startEntryPreview();
        });
        entryLink.addEventListener("pointerleave", (event) => {
            if (event.pointerType === "mouse") stopEntryPreview();
        });
        entryLink.addEventListener("focus", startEntryPreview);
        entryLink.addEventListener("blur", stopEntryPreview);
        entryLink.addEventListener("click", (event) => {
            if (
                event.defaultPrevented ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                reducedMotion.matches
            ) {
                return;
            }
            const target = entryLink.getAttribute("href");
            if (!target) return;
            event.preventDefault();
            unlockEntryTransition(target);
        });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && entryPreviewActive) stopEntryPreview();
        });
        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                latticeVideo.pause();
                latticeObjectVideo?.pause();
            } else if (entryPreviewActive || entryTransitioning) {
                safePlay();
                safePlay(latticeObjectVideo);
            }
        });
    }

    document.querySelectorAll("[data-page-transition]").forEach((link) => {
        link.addEventListener("click", (event) => {
            if (link === entryLink) return;
            if (
                event.defaultPrevented ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                reducedMotion.matches
            ) {
                return;
            }

            const target = link.getAttribute("href");
            if (!target) return;
            event.preventDefault();
            document.body.classList.add("is-leaving");
            window.setTimeout(() => {
                window.location.href = target;
            }, 620);
        });
    });
})();

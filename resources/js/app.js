import './bootstrap';
import Alpine from 'alpinejs';
import Konva from 'konva';
import 'konva/lib/filters/Sepia';
import 'konva/lib/filters/Grayscale';
import 'konva/lib/filters/Brighten';
import 'konva/lib/filters/Contrast';

window.Alpine = Alpine;
Alpine.start();

document.addEventListener('DOMContentLoaded', () => {
    initToast();
    initBookmarkTip();
    initTabs();
    initGuestEditor();
    initGuestVideoUploader();
    initGuestInfiniteScroll();
    initModerationDeck();
    initSettingsSlugPreview();
    initGalleryLightbox();
});

const toastState = {
    timeout: null,
};

function initToast() {
    const root = document.getElementById('toast-root');
    if (root?.dataset.message) {
        showToast(root.dataset.message);
    }
}

function showToast(message) {
    if (!message) {
        return;
    }

    if (toastState.timeout) {
        clearTimeout(toastState.timeout);
        document.querySelectorAll('.toast-container').forEach((node) => node.remove());
    }

    const container = document.createElement('div');
    container.className = 'toast-container';

    const bubble = document.createElement('div');
    bubble.className = 'toast-bubble';
    bubble.textContent = message;

    container.appendChild(bubble);
    document.body.appendChild(container);

    toastState.timeout = setTimeout(() => {
        container.remove();
        toastState.timeout = null;
    }, 3800);
}

window.showToast = showToast;

function initBookmarkTip() {
    const button = document.querySelector('[data-bookmark]');
    const tip = document.getElementById('bookmark-tip');

    if (!button || !tip) {
        return;
    }

    button.addEventListener('click', () => {
        tip.classList.toggle('hidden');
    });
}

function initTabs() {
    document.querySelectorAll('.tab-button').forEach((button) => {
        button.addEventListener('click', () => {
            const parent = button.closest('.card');
            if (!parent) return;

            parent.querySelectorAll('.tab-button').forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');

            const name = button.dataset.tab;
            parent.querySelectorAll('.tab-panel').forEach((panel) => {
                panel.classList.toggle('hidden', panel.dataset.panel !== name);
            });
        });
    });
}

function initGuestEditor() {
    const wrapper = document.getElementById('guest-editor');
    const stageContainer = document.getElementById('editor-stage');

    if (!wrapper || !stageContainer || typeof Konva === 'undefined') {
        return;
    }

    const containerId = 'editor-stage';

    const stage = new Konva.Stage({
        container: containerId,
        width: stageContainer.clientWidth,
        height: stageContainer.clientWidth * 1.2,
    });

    const backgroundLayer = new Konva.Layer();
    const elementsLayer = new Konva.Layer();
    stage.add(backgroundLayer);
    stage.add(elementsLayer);

    const backgroundRect = new Konva.Rect({
        x: 0,
        y: 0,
        width: stage.width(),
        height: stage.height(),
        fill: '#FAF6F1',
        listening: false,
    });
    backgroundLayer.add(backgroundRect);

    let backgroundImage = null;
    let activeTextNode = null;
    let activeSticker = null;
    let pinchState = null;

    const state = {
        currentFilter: 'none',
        textColor: '#C86B5A',
        textFont: "'Boho Script', cursive",
        strokeColor: '#FFFFFF',
        strokeWidth: 0,
        sourceWidth: null,
        sourceHeight: null,
    };

    const form = document.getElementById('editor-form');
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');
    const textInput = document.getElementById('text-input');
    const colorDots = wrapper.querySelectorAll('[data-color]');
    const stickers = wrapper.querySelectorAll('[data-sticker]');
    const filterButtons = wrapper.querySelectorAll('[data-filter]');
    const actionButtons = wrapper.querySelectorAll('[data-action]');
    const hiddenImageInput = document.getElementById('image_data');
    const overlayInput = document.getElementById('overlay_json');
    const filtersInput = document.getElementById('applied_filters');
    const thumbInput = document.getElementById('thumb_data');
    const strokeDots = wrapper.querySelectorAll('[data-stroke]');
    if (filtersInput) {
        filtersInput.value = JSON.stringify({ filter: 'none' });
    }

    const resizeStage = () => {
        const width = stageContainer.clientWidth || window.innerWidth - 32;
        const height = width * 1.2;
        stage.width(width);
        stage.height(height);
        backgroundRect.width(width);
        backgroundRect.height(height);
        if (backgroundImage) {
            fitBackground();
        }
        stage.batchDraw();
    };

    window.addEventListener('resize', debounce(resizeStage, 200));
    resizeStage();

    const beginPinch = (node, touches) => {
        if (!node || !touches || touches.length < 2) {
            return;
        }

        pinchState = {
            node,
            initialDistance: getTouchDistance(touches),
            initialScale: node.scaleX() || 1,
        };
    };

    stage.on('touchstart', (event) => {
        const touches = event.evt.touches;
        if (!touches || touches.length < 2) {
            return;
        }

        let targetNode = null;
        const target = event.target;

        if (target && target.getClassName && target.getClassName() === 'Image' && target.getLayer() === elementsLayer) {
            targetNode = target;
            activeSticker = target;
            activeTextNode = null;
        } else if (activeSticker) {
            targetNode = activeSticker;
        }

        if (targetNode) {
            event.evt.preventDefault();
            beginPinch(targetNode, touches);
            targetNode.draggable(false);
        }
    });

    stage.on('touchmove', (event) => {
        if (!pinchState || !pinchState.initialDistance) {
            return;
        }

        const touches = event.evt.touches;
        if (!touches || touches.length < 2) {
            return;
        }

        event.evt.preventDefault();
        const newDistance = getTouchDistance(touches);
        if (!newDistance) {
            return;
        }

        const factor = newDistance / pinchState.initialDistance;
        const nextScale = Math.max(0.25, Math.min(4, pinchState.initialScale * factor));
        pinchState.node.scale({ x: nextScale, y: nextScale });
        elementsLayer.batchDraw();
    });

    stage.on('touchend', (event) => {
        const touches = event.evt.touches;
        if (!touches || touches.length < 2) {
            if (pinchState?.node) {
                pinchState.node.draggable(true);
            }
            pinchState = null;
        }
    });

    [cameraInput, galleryInput].forEach((input) => {
        if (!input) return;
        input.addEventListener('change', (event) => {
            const target = event.target;
            const file = target?.files?.[0];
            if (!file) return;
            if (!file.type.startsWith('image/')) {
                showToast('Selecciona una imagen válida');
                return;
            }
            if (file.size > 8 * 1024 * 1024) {
                showToast('La imagen debe pesar menos de 8MB');
                return;
            }
            const reader = new FileReader();
            reader.onload = () => {
                loadBackgroundImage(reader.result);
                if (target) {
                    target.value = '';
                }
            };
            reader.readAsDataURL(file);
        });
    });

    colorDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            colorDots.forEach((item) => item.classList.remove('active'));
            dot.classList.add('active');
            state.textColor = dot.dataset.color || '#C86B5A';
            applyStylesToText(activeTextNode);
            elementsLayer.batchDraw();
        });
    });

    strokeDots.forEach((dot) => {
        dot.addEventListener('click', () => {
            strokeDots.forEach((item) => item.classList.remove('active'));
            dot.classList.add('active');
            if (dot.dataset.stroke === 'none') {
                state.strokeWidth = 0;
                state.strokeColor = '#FFFFFF';
            } else {
                state.strokeColor = dot.dataset.stroke || '#FFFFFF';
                state.strokeWidth = 0.1;
            }
            applyStylesToText(activeTextNode);
            elementsLayer.batchDraw();
        });
    });

    elementsLayer.on('click tap', (event) => {
        const target = event.target;
        if (target && target.getClassName && target.getClassName() === 'Text') {
            activeTextNode = target;
            activeSticker = null;
        } else if (target && target.getClassName && target.getClassName() === 'Image') {
            activeSticker = target;
            activeTextNode = null;
        } else {
            activeTextNode = null;
            activeSticker = null;
        }
    });

    const isDataUrl = (value) => typeof value === 'string' && value.startsWith('data:');

    stickers.forEach((button) => {
        button.addEventListener('click', () => {
            const src = button.dataset.sticker;
            if (!src) return;
            Konva.Image.fromURL(
                src,
                (node) => {
                    node.setAttrs({
                        x: stage.width() / 2 - 60,
                        y: stage.height() / 2 - 60,
                        draggable: true,
                        listening: true,
                    });
                    node.scale({ x: 0.8, y: 0.8 });
                    attachStickerInteractions(node);
                    elementsLayer.add(node);
                    elementsLayer.draw();
                },
                { crossOrigin: 'anonymous' },
            );
        });
    });

    filterButtons.forEach((button) => {
        button.addEventListener('click', () => {
            filterButtons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            applyFilter(button.dataset.filter || 'none');
        });
    });

    actionButtons.forEach((button) => {
        button.addEventListener('click', () => handleEditorAction(button.dataset.action));
    });

    function handleEditorAction(action) {
        switch (action) {
            case 'add-text':
                addTextbox();
                break;
            case 'clear-text':
                elementsLayer.find('Text').forEach((node) => node.destroy());
                activeTextNode = null;
                elementsLayer.draw();
                break;
            case 'reset-canvas':
                elementsLayer.destroyChildren();
                if (backgroundImage) {
                    backgroundImage.destroy();
                    backgroundImage = null;
                }
                state.currentFilter = 'none';
                backgroundLayer.draw();
                hiddenImageInput.value = '';
                overlayInput.value = '';
                filtersInput.value = JSON.stringify({ filter: 'none' });
                if (thumbInput) {
                    thumbInput.value = '';
                }
                state.textFont = "'Boho Script', cursive";
                state.strokeWidth = 0;
                state.strokeColor = '#FFFFFF';
                break;
            case 'save':
                saveCanvas();
                break;
            default:
        }
    }

    function addTextbox() {
        const text = textInput?.value.trim();
        if (!text) {
            showToast('Escribe un texto para agregarlo');
            return;
        }

        const textbox = new Konva.Text({
            text,
            x: stage.width() / 2 - 60,
            y: stage.height() / 2 - 30,
            fontFamily: state.textFont,
            fontSize: 32,
            fontStyle: '600',
            draggable: true,
        });

        applyStylesToText(textbox);
        activeTextNode = textbox;
        elementsLayer.add(textbox);
        elementsLayer.draw();
    }

    function applyStylesToText(node) {
        if (!node) {
            return;
        }

        node.fontFamily(state.textFont);
        node.fill(state.textColor);
        if (state.strokeWidth > 0) {
            node.stroke(state.strokeColor);
        } else {
            node.stroke(null);
        }
        node.strokeWidth(state.strokeWidth);
    }

    function getTouchDistance(touches) {
        if (!touches || touches.length < 2) {
            return 0;
        }

        const [first, second] = touches;
        const dx = first.clientX - second.clientX;
        const dy = first.clientY - second.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function attachStickerInteractions(node) {
        node.on('click tap', () => {
            activeSticker = node;
            activeTextNode = null;
        });

        node.on('touchstart', () => {
            activeSticker = node;
            activeTextNode = null;
            if (pinchState) {
                node.draggable(false);
            }
        });

        node.on('dragstart', () => {
            if (pinchState) {
                node.stopDrag();
                return;
            }
            activeSticker = node;
            activeTextNode = null;
        });

        node.on('dragend', () => {
            if (!pinchState) {
                node.draggable(true);
            }
        });
    }

    function loadBackgroundImage(source) {
        const image = new window.Image();
        if (!isDataUrl(source)) {
            image.crossOrigin = 'anonymous';
        }
        image.onload = () => {
            state.sourceWidth = image.width;
            state.sourceHeight = image.height;
            if (backgroundImage) {
                backgroundImage.destroy();
            }
            backgroundImage = new Konva.Image({
                image,
                listening: false,
            });
            backgroundLayer.add(backgroundImage);
            backgroundImage.moveToTop();
            fitBackground();
            applyFilter(state.currentFilter, true);
            backgroundLayer.draw();
        };
        image.onerror = () => showToast('No pudimos cargar esta imagen');
        image.src = source;
    }

    function fitBackground() {
        if (!backgroundImage) {
            return;
        }
        const img = backgroundImage.image();
        if (!img) {
            return;
        }
        const width = stage.width();
        const height = stage.height();
        const scale = Math.max(width / img.width, height / img.height);
        backgroundImage.width(img.width * scale);
        backgroundImage.height(img.height * scale);
        backgroundImage.position({
            x: (width - backgroundImage.width()) / 2,
            y: (height - backgroundImage.height()) / 2,
        });
    }

    function applyFilter(filter) {
        state.currentFilter = filter;
        if (filtersInput) {
            filtersInput.value = JSON.stringify({ filter });
        }

        if (!backgroundImage) {
            return;
        }

        const resetAdjustments = () => {
            if (typeof backgroundImage.red === 'function') {
                backgroundImage.red(0);
                backgroundImage.green(0);
                backgroundImage.blue(0);
            }
            if (typeof backgroundImage.brightness === 'function') {
                backgroundImage.brightness(0);
            }
            if (typeof backgroundImage.contrast === 'function') {
                backgroundImage.contrast(0);
            }
            if (typeof backgroundImage.noise === 'function') {
                backgroundImage.noise(0);
            }
        };

        if (filter === 'none') {
            backgroundImage.filters([]);
            if (backgroundImage.clearCache) {
                backgroundImage.clearCache();
            }
            backgroundLayer.batchDraw();
            return;
        }

        const filters = [];

        resetAdjustments();

        switch (filter) {
            case 'sepia':
                filters.push(Konva.Filters.Sepia);
                break;
            case 'grayscale':
                filters.push(Konva.Filters.Grayscale);
                break;
            case 'enhance':
                filters.push(Konva.Filters.Contrast, Konva.Filters.Brighten);
                if (typeof backgroundImage.contrast === 'function') {
                    backgroundImage.contrast(0.25);
                }
                if (typeof backgroundImage.brightness === 'function') {
                    backgroundImage.brightness(0.08);
                }
                break;
            case 'vintage':
                filters.push(Konva.Filters.Sepia, Konva.Filters.Brighten);
                if (typeof backgroundImage.brightness === 'function') {
                    backgroundImage.brightness(-0.04);
                }
                if (typeof backgroundImage.noise === 'function') {
                    backgroundImage.noise(6);
                }
                break;
            default:
                filters.length = 0;
        }

        backgroundImage.filters(filters);
        if (backgroundImage.cache) {
            backgroundImage.cache({ pixelRatio: 1 });
        }
        backgroundLayer.batchDraw();
    }

    function saveCanvas() {
        if (!backgroundImage) {
            showToast('Primero selecciona una foto');
            return;
        }

        const sourceWidth = state.sourceWidth || stage.width();
        const desiredRatio = sourceWidth / stage.width();
        const maxRatio = 6;
        const pixelRatio = Math.max(1, Math.min(desiredRatio, maxRatio));

        const dataUrl = stage.toDataURL({
            mimeType: 'image/jpeg',
            quality: 0.9,
            pixelRatio,
        });

        const thumbUrl = stage.toDataURL({
            mimeType: 'image/jpeg',
            quality: 0.75,
            pixelRatio: Math.min(1, 300 / stage.width()),
        });

        hiddenImageInput.value = dataUrl;
        overlayInput.value = stage.toJSON();
        if (thumbInput) {
            thumbInput.value = thumbUrl;
        }
        form?.submit();
    }
}

function initGuestVideoUploader() {
    const wrapper = document.getElementById('guest-video-uploader');
    if (!wrapper) {
        return;
    }

    const fileInput = document.getElementById('video-input');
    const triggerButtons = wrapper.querySelectorAll('[data-video-trigger]');
    const preview = document.getElementById('video-preview');
    const placeholder = document.getElementById('video-placeholder');
    const thumbnailInput = document.getElementById('video_thumbnail_data');
    const submitBtn = document.getElementById('video-submit');
    const form = document.getElementById('video-form');
    const progressBar = document.getElementById('video-progress-bar');
    const progressLabel = document.getElementById('video-progress-label');

    let currentFile = null;
    let currentUrl = null;

    const resetPreview = () => {
        preview?.classList.add('hidden');
        placeholder?.classList.remove('hidden');
        if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
            currentUrl = null;
        }
        preview.removeAttribute('src');
        preview.load();
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    };

    const handleFile = async (file) => {
        if (!file) {
            resetPreview();
            return;
        }

        if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
            showToast('Formato de video no soportado');
            resetPreview();
            return;
        }

        currentFile = file;
        if (currentUrl) {
            URL.revokeObjectURL(currentUrl);
        }
        currentUrl = URL.createObjectURL(file);

        preview.src = currentUrl;
        preview.classList.remove('hidden');
        placeholder?.classList.add('hidden');
        preview.load();
        if (submitBtn) {
            submitBtn.disabled = false;
        }

        try {
            const thumbnail = await generateVideoThumbnail(file);
            if (thumbnailInput) {
                thumbnailInput.value = thumbnail;
            }
        } catch {
            thumbnailInput.value = '';
        }
    };

    triggerButtons.forEach((button) => {
        button.addEventListener('click', () => {
            if (!fileInput) {
                return;
            }

            if (button.dataset.videoTrigger === 'camera') {
                fileInput.setAttribute('capture', 'environment');
            } else {
                fileInput.removeAttribute('capture');
            }

            fileInput.click();
        });
    });

    fileInput?.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        handleFile(file);
    });

    form?.addEventListener('submit', (event) => {
        if (!currentFile) {
            event.preventDefault();
            showToast('Primero selecciona un video');
            return;
        }

        if (form.dataset.uploading === '1') {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        uploadVideo(new FormData(form));
    });

    const generateVideoThumbnail = (file) =>
        new Promise((resolve, reject) => {
            const video = document.createElement('video');
            const url = URL.createObjectURL(file);
            video.src = url;
            video.preload = 'metadata';
            video.muted = true;
            video.playsInline = true;

            const cleanup = () => URL.revokeObjectURL(url);

            video.addEventListener(
                'seeked',
                () => {
                    const canvas = document.createElement('canvas');
                    const targetWidth = 800;
                    const aspect = video.videoWidth && video.videoHeight ? video.videoHeight / video.videoWidth : 9 / 16;
                    canvas.width = targetWidth;
                    canvas.height = targetWidth * aspect;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    cleanup();
                    resolve(canvas.toDataURL('image/jpeg', 0.85));
                },
                { once: true },
            );

            video.addEventListener(
                'loadedmetadata',
                () => {
                    const targetTime = Math.min(0.1, (video.duration || 1) * 0.1);
                    video.currentTime = targetTime;
                },
                { once: true },
            );

            video.addEventListener(
                'error',
                () => {
                    cleanup();
                    reject();
                },
                { once: true },
            );
        });
    function uploadVideo(formData) {
        const request = new XMLHttpRequest();
        request.open('POST', form.getAttribute('action'), true);
        request.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        request.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]').content);
        form.dataset.uploading = '1';
        submitBtn.disabled = true;

        request.upload.addEventListener('progress', (event) => {
            if (!event.lengthComputable) return;
            const percent = Math.round((event.loaded / event.total) * 100);
            updateProgress(percent);
        });

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status >= 200 && request.status < 300) {
                    window.location.href = request.responseURL || form.getAttribute('action');
                } else if (request.status === 422) {
                    const response = JSON.parse(request.responseText);
                    const errors = Object.values(response.errors || {})
                        .flat()
                        .join(' ');
                    showToast(errors || 'Error al subir video.');
                    resetUploadState();
                } else {
                    showToast('Algo salió mal al subir el video.');
                    resetUploadState();
                }
            }
        };

        request.send(formData);
    }

    function resetUploadState() {
        form.dataset.uploading = '0';
        submitBtn.disabled = false;
        updateProgress(0);
    }

    function updateProgress(percent) {
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }
        if (progressLabel) {
            progressLabel.textContent = `${percent}%`;
        }
    }
}

function initModerationDeck() {
    const deck = document.getElementById('moderation-deck');
    if (!deck) return;

    const card = deck.querySelector('.moderation-card');
    const image = document.getElementById('moderation-image');
    const meta = document.getElementById('moderation-meta');
    const approveIndicator = card?.querySelector('.swipe-approve');
    const rejectIndicator = card?.querySelector('.swipe-reject');
    const endpoint = deck.dataset.endpoint;
    const approveTemplate = deck.dataset.approve;
    const rejectTemplate = deck.dataset.reject;

    let currentPhoto = parseData(deck.dataset.photo);
    let startX = 0;
    let deltaX = 0;
    let isDragging = false;

    const updateView = (photo) => {
        currentPhoto = photo;
        if (photo) {
            image.src = photo.image_url;
            meta.textContent = `Subida ${photo.created_at}`;
        } else {
            image.removeAttribute('src');
            meta.textContent = 'No hay fotos pendientes. 🎉';
        }
        resetCard();
    };

    const fetchNext = () => {
        window.axios
            .get(endpoint)
            .then(({ data }) => updateView(data.photo))
            .catch(() => showToast('No pudimos cargar la siguiente foto'));
    };

    const handleAction = (action) => {
        if (!currentPhoto) {
            showToast('No hay fotos para moderar');
            return;
        }
        const template = action === 'approve' ? approveTemplate : rejectTemplate;
        const url = template.replace('__ID__', currentPhoto.id);
        window.axios
            .post(url)
            .then(({ data }) => {
                updateView(data.photo);
                showToast(action === 'approve' ? 'Foto aprobada' : 'Foto rechazada');
            })
            .catch(() => showToast('Algo salió mal, intenta de nuevo'));
    };

    deck.querySelectorAll('[data-action]').forEach((button) => {
        button.addEventListener('click', () => handleAction(button.dataset.action));
    });

    const resetCard = () => {
        if (!card) return;
        card.style.transform = '';
        approveIndicator?.classList.remove('visible');
        rejectIndicator?.classList.remove('visible');
    };

    if (card) {
        card.addEventListener('touchstart', (event) => {
            startX = event.touches[0].clientX;
            isDragging = true;
            deltaX = 0;
        });

        card.addEventListener('touchmove', (event) => {
            if (!isDragging) return;
            deltaX = event.touches[0].clientX - startX;
            card.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 20}deg)`;
            if (deltaX > 40) {
                approveIndicator?.classList.add('visible');
                rejectIndicator?.classList.remove('visible');
            } else if (deltaX < -40) {
                rejectIndicator?.classList.add('visible');
                approveIndicator?.classList.remove('visible');
            } else {
                approveIndicator?.classList.remove('visible');
                rejectIndicator?.classList.remove('visible');
            }
        });

        card.addEventListener('touchend', () => {
            if (!isDragging) return;
            isDragging = false;
            if (Math.abs(deltaX) > 100) {
                handleAction(deltaX > 0 ? 'approve' : 'reject');
            }
            deltaX = 0;
            resetCard();
            if (!currentPhoto) {
                fetchNext();
            }
        });
    }

    updateView(currentPhoto);

    const nextInterval = setInterval(fetchNext, 60000);
    window.addEventListener('beforeunload', () => clearInterval(nextInterval));

    function parseData(value) {
        if (!value) return null;
        try {
            return JSON.parse(value);
        } catch {
            return null;
        }
    }
}

function initSettingsSlugPreview() {
    const input = document.querySelector('input[name="guest_url_slug"]');
    const target = document.querySelector('[data-slug]');
    if (!input || !target) return;

    input.addEventListener('input', () => {
        target.textContent = input.value || 'invitados';
    });
}

function initGuestInfiniteScroll() {
    const grid = document.getElementById('gallery-grid');
    const loader = document.getElementById('gallery-loader');

    if (!grid || !loader) {
        return;
    }

    let nextPage = grid.dataset.nextPage || '';
    let loading = false;

    loader.classList.add('hidden');

    const sentinel = document.createElement('div');
    sentinel.id = 'gallery-sentinel';
    sentinel.style.height = '1px';
    grid.parentNode?.insertBefore(sentinel, loader);

    const observer = new IntersectionObserver(
        (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                fetchNextPage();
            }
        },
        { rootMargin: '200px' },
    );

    if (nextPage) {
        observer.observe(sentinel);
    } else {
        loader.classList.add('hidden');
    }

    function fetchNextPage() {
        if (!nextPage || loading) {
            return;
        }

        loading = true;
        loader.classList.remove('hidden');

        fetch(nextPage, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                Accept: 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network error');
                }
                return response.json();
            })
            .then((data) => {
                appendPhotos(data.photos || []);
                nextPage = data.next_page_url || '';
                grid.dataset.nextPage = nextPage;

                if (!nextPage) {
                    loader.classList.add('hidden');
                    observer.unobserve(sentinel);
                }
            })
            .catch(() => showToast('No pudimos cargar más fotos'))
            .finally(() => {
                loader.classList.add('hidden');
                loading = false;
            });
    }

    function appendPhotos(photos) {
        if (!photos.length) {
            return;
        }

        const fragment = document.createDocumentFragment();
        photos.forEach((photo) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'gallery-thumb';
            button.dataset.fullSrc = photo.full;
            button.dataset.mediaType = photo.type || 'photo';
            button.setAttribute('aria-label', 'Ver elemento completo');

            const img = document.createElement('img');
            img.src = photo.thumb;
            img.alt = 'Foto invitado';
            img.loading = 'lazy';
            img.className = 'aspect-square object-cover rounded-xl shadow-soft';

            button.appendChild(img);

            if ((photo.type || 'photo') === 'video') {
                const icon = document.createElement('span');
                icon.className = 'gallery-play-icon';
                icon.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                `;
                button.appendChild(icon);
            }

            fragment.appendChild(button);
        });

        grid.appendChild(fragment);
    }
}

function initGalleryLightbox() {
    const overlay = document.getElementById('gallery-lightbox');
    const image = document.getElementById('gallery-lightbox-img');
    const videoElement = document.getElementById('gallery-lightbox-video');
    const closeButton = document.getElementById('gallery-lightbox-close');
    const downloadBtn = document.getElementById('gallery-download-btn');
    const counter = document.getElementById('gallery-counter');
    const nextButton = document.getElementById('gallery-next');
    const prevButton = document.getElementById('gallery-prev');

    if (!overlay || !image) {
        return;
    }

    let currentIndex = 0;

    const getTriggers = () => Array.from(document.querySelectorAll('[data-full-src]'));

    const updateCounter = () => {
        if (!counter) return;
        const total = getTriggers().length;
        if (!total) {
            counter.textContent = '0/0';
            return;
        }

        const displayIndex = Math.min(currentIndex + 1, total);
        counter.textContent = `${displayIndex}/${total}`;
    };

    const open = (src, type = 'photo') => {
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        if (downloadBtn) {
            downloadBtn.href = src;
        }

        if (type === 'video') {
            image.classList.add('hidden');
            videoElement?.classList.remove('hidden');
            if (videoElement) {
                videoElement.src = src;
                videoElement.load();
                videoElement.play().catch(() => {});
            }
        } else {
            videoElement?.classList.add('hidden');
            if (videoElement) {
                videoElement.pause();
                videoElement.removeAttribute('src');
            }
            image.classList.remove('hidden');
            image.src = src;
        }

        updateCounter();
    };

    const close = () => {
        overlay.classList.add('hidden');
        image.src = '';
        if (videoElement) {
            videoElement.pause();
            videoElement.removeAttribute('src');
            videoElement.classList.add('hidden');
        }
        document.body.style.overflow = '';
    };

    const showImageAt = (index) => {
        const triggers = getTriggers();
        const total = triggers.length;
        if (!total) return;
        currentIndex = (index + total) % total;
        const trigger = triggers[currentIndex];
        if (!trigger) {
            return;
        }
        const src = trigger.dataset?.fullSrc;
        if (src) {
            open(src, trigger.dataset?.mediaType || 'photo');
        }
    };

    const showNext = () => showImageAt(currentIndex + 1);
    const showPrev = () => showImageAt(currentIndex - 1);

    document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-full-src]');
        if (!trigger) {
            return;
        }

        event.preventDefault();
        const triggers = getTriggers();
        const index = triggers.indexOf(trigger);
        if (index === -1) {
            return;
        }
        showImageAt(index);
    });

    closeButton?.addEventListener('click', close);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            close();
        }
    });

    downloadBtn?.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    let startX = 0;
    let startY = 0;
    overlay.addEventListener('touchstart', (event) => {
        const touch = event.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    });

    overlay.addEventListener('touchend', (event) => {
        const touch = event.changedTouches[0];
        const diffX = touch.clientX - startX;
        const diffY = touch.clientY - startY;
        if (Math.sqrt(diffX ** 2 + diffY ** 2) > 60) {
            if (diffX > 0) {
                showPrev();
            } else {
                showNext();
            }
        }
    });

    window.addEventListener('keyup', (event) => {
        if (overlay.classList.contains('hidden')) return;
        if (event.key === 'Escape') {
            close();
        }
        if (event.key === 'ArrowRight') {
            showNext();
        }
        if (event.key === 'ArrowLeft') {
            showPrev();
        }
    });

    nextButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        showNext();
    });

    prevButton?.addEventListener('click', (event) => {
        event.stopPropagation();
        showPrev();
    });
}

function debounce(fn, delay = 200) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

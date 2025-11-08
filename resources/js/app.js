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

    const state = {
        currentFilter: 'none',
        textColor: '#C86B5A',
        textFont: "'Boho Script', cursive",
        strokeColor: '#FFFFFF',
        strokeWidth: 0,
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
        } else {
            activeTextNode = null;
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

    function loadBackgroundImage(source) {
        const image = new window.Image();
        if (!isDataUrl(source)) {
            image.crossOrigin = 'anonymous';
        }
        image.onload = () => {
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

        const maxExport = 1280;
        const longestSide = Math.max(stage.width(), stage.height());
        const pixelRatio = longestSide > maxExport ? maxExport / longestSide : 1;

        const dataUrl = stage.toDataURL({
            mimeType: 'image/jpeg',
            quality: 0.88,
            pixelRatio,
        });

        hiddenImageInput.value = dataUrl;
        overlayInput.value = stage.toJSON();
        form?.submit();
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

function initGalleryLightbox() {
    const overlay = document.getElementById('gallery-lightbox');
    const image = document.getElementById('gallery-lightbox-img');
    const closeButton = document.getElementById('gallery-lightbox-close');
    const downloadBtn = document.getElementById('gallery-download-btn');
    const counter = document.getElementById('gallery-counter');
    const nextButton = document.getElementById('gallery-next');
    const prevButton = document.getElementById('gallery-prev');
    const triggers = document.querySelectorAll('[data-full-image]');

    if (!overlay || !image || !triggers.length) {
        return;
    }

    let currentIndex = 0;

    const updateCounter = () => {
        if (!counter) return;
        const total = triggers.length;
        counter.textContent = `${currentIndex + 1}/${total}`;
    };

    const open = (src) => {
        image.src = src;
        if (downloadBtn) {
            downloadBtn.href = src;
        }
        updateCounter();
        overlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    };

    const close = () => {
        overlay.classList.add('hidden');
        image.src = '';
        document.body.style.overflow = '';
    };

    const showImageAt = (index) => {
        const total = triggers.length;
        if (!total) return;
        currentIndex = (index + total) % total;
        const nextImage = triggers[currentIndex]?.dataset?.fullImage;
        if (nextImage) {
            open(nextImage);
        }
        updateCounter();
    };

    const showNext = () => showImageAt(currentIndex + 1);
    const showPrev = () => showImageAt(currentIndex - 1);

    triggers.forEach((trigger, index) => {
        trigger.addEventListener('click', () => {
            showImageAt(index);
        });
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

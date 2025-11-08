import './bootstrap';
import Alpine from 'alpinejs';
import * as fabric from 'fabric';

window.Alpine = Alpine;
Alpine.start();

document.addEventListener('DOMContentLoaded', () => {
    initToast();
    initBookmarkTip();
    initTabs();
    initGuestEditor();
    initModerationDeck();
    initSettingsSlugPreview();
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
    const canvasElement = document.getElementById('editor-canvas');

    if (!wrapper || !canvasElement || typeof fabric === 'undefined') {
        return;
    }

    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = '#C86B5A';
    fabric.Object.prototype.cornerStyle = 'circle';

    const state = {
        backgroundImage: null,
        currentFilter: 'none',
        textColor: '#C86B5A',
    };

    const canvas = new fabric.Canvas(canvasElement, {
        selectionColor: 'rgba(200,107,90,0.15)',
        preserveObjectStacking: true,
        backgroundColor: '#FAF6F1',
    });

    const resizeCanvas = () => {
        const width = canvasElement.parentElement?.clientWidth || window.innerWidth - 32;
        canvas.setWidth(width);
        canvas.setHeight(width * 1.2);
        canvas.requestRenderAll();
        if (state.backgroundImage) {
            scaleBackground(state.backgroundImage);
        }
    };

    window.addEventListener('resize', debounce(resizeCanvas, 200));
    resizeCanvas();

    const form = document.getElementById('editor-form');
    const cameraInput = document.getElementById('camera-input');
    const galleryInput = document.getElementById('gallery-input');
    const textInput = document.getElementById('text-input');
    const colorDots = wrapper.querySelectorAll('.color-dot');
    const stickers = wrapper.querySelectorAll('[data-sticker]');
    const filterButtons = wrapper.querySelectorAll('[data-filter]');
    const actionButtons = wrapper.querySelectorAll('[data-action]');
    const hiddenImageInput = document.getElementById('image_data');
    const overlayInput = document.getElementById('overlay_json');
    const filtersInput = document.getElementById('applied_filters');

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
        });
    });

    stickers.forEach((button) => {
        button.addEventListener('click', () => {
            const src = button.dataset.sticker;
            if (!src) return;
            fabric.Image.fromURL(
                src,
                (img) => {
                    img.scaleToWidth(140);
                    img.set({
                        left: canvas.getWidth() / 2,
                        top: canvas.getHeight() / 2,
                        originX: 'center',
                        originY: 'center',
                    });
                    canvas.add(img);
                    canvas.setActiveObject(img);
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
                canvas.getObjects('textbox').forEach((object) => canvas.remove(object));
                break;
            case 'reset-canvas':
                canvas.clear();
                canvas.setBackgroundColor('#FAF6F1', canvas.requestRenderAll.bind(canvas));
                state.backgroundImage = null;
                state.currentFilter = 'none';
                hiddenImageInput.value = '';
                overlayInput.value = '';
                filtersInput.value = '';
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
        const textbox = new fabric.Textbox(text, {
            fill: state.textColor,
            fontSize: 36,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 600,
            left: canvas.getWidth() / 2,
            top: canvas.getHeight() / 2,
            originX: 'center',
            originY: 'center',
            editable: true,
        });
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
    }

    function loadBackgroundImage(dataUrl) {
        fabric.Image.fromURL(
            dataUrl,
            (img) => {
                state.backgroundImage = img;
                img.set({ selectable: false, evented: false });
                canvas.setBackgroundImage(img, () => {
                    scaleBackground(img);
                    applyFilter(state.currentFilter);
                    canvas.renderAll();
                });
            },
            { crossOrigin: 'anonymous' },
        );
    }

    function scaleBackground(image) {
        const width = canvas.getWidth();
        const height = canvas.getHeight();
        const scale = Math.max(width / image.width, height / image.height);
        image.scale(scale);
        image.set({
            left: width / 2,
            top: height / 2,
            originX: 'center',
            originY: 'center',
        });
    }

    function applyFilter(filter) {
        state.currentFilter = filter;
        if (!state.backgroundImage) {
            return;
        }

        const filters = [];
        switch (filter) {
            case 'sepia':
                filters.push(new fabric.Image.filters.Sepia());
                break;
            case 'grayscale':
                filters.push(new fabric.Image.filters.Grayscale());
                break;
            case 'vintage':
                filters.push(new fabric.Image.filters.Brownie());
                break;
            case 'warm':
                filters.push(new fabric.Image.filters.Sepia());
                filters.push(
                    new fabric.Image.filters.BlendColor({
                        color: '#E7B99A',
                        mode: 'multiply',
                        alpha: 0.25,
                    }),
                );
                break;
            default:
                filters.length = 0;
        }

        state.backgroundImage.filters = filters;
        state.backgroundImage.applyFilters();
        canvas.requestRenderAll();
    }

    function saveCanvas() {
        if (!state.backgroundImage) {
            showToast('Primero selecciona una foto');
            return;
        }
        canvas.discardActiveObject();
        canvas.renderAll();
        hiddenImageInput.value = canvas.toDataURL({
            format: 'png',
            quality: 1,
        });
        overlayInput.value = JSON.stringify(canvas.toJSON());
        filtersInput.value = JSON.stringify({ filter: state.currentFilter });
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

function debounce(fn, delay = 200) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

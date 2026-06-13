/**
 * Carrito temporal de pedido — localStorage, sin backend.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'negocio-pedido-v1';
  var STORAGE_VERSION = 1;
  var MAX_ITEMS = 50;
  var MAX_NAME_LENGTH = 200;
  var TOAST_MS = 2600;

  var root;
  var toastEl;
  var toggleBtn;
  var panelEl;
  var listEl;
  var emptyEl;
  var errorEl;
  var sendLink;
  var clearBtn;
  var closeBtn;
  var countEls;
  var totalEls;
  var qtyTotalEl;
  var whatsappPhone;
  var toastTimer;

  function formatPrice(value) {
    if (value == null || Number.isNaN(value)) return null;
    return '$' + Number(value).toLocaleString('es-AR', { maximumFractionDigits: 0 });
  }

  function sanitizeName(name) {
    return String(name || '')
      .trim()
      .slice(0, MAX_NAME_LENGTH);
  }

  function parsePrice(raw) {
    if (raw == null || raw === '') return null;
    var num = Number(raw);
    return Number.isFinite(num) && num >= 0 ? num : null;
  }

  function loadCart() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      var data = JSON.parse(raw);
      if (!data || data.version !== STORAGE_VERSION || !Array.isArray(data.items)) {
        return [];
      }

      return data.items
        .filter(function (item) {
          return item && item.key && item.name;
        })
        .map(function (item) {
          return {
            key: String(item.key),
            type: item.type === 'promo' ? 'promo' : 'producto',
            name: sanitizeName(item.name),
            price: parsePrice(item.price),
            quantity: Math.max(1, Math.min(99, parseInt(item.quantity, 10) || 1)),
          };
        });
    } catch (_err) {
      return [];
    }
  }

  function saveCart(items) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          items: items,
          updatedAt: Date.now(),
        })
      );
      return true;
    } catch (_err) {
      showError('No se pudo guardar el pedido. Verificá el espacio del navegador.');
      return false;
    }
  }

  function getTotals(items) {
    var qty = 0;
    var total = 0;
    var hasPriced = false;

    items.forEach(function (item) {
      qty += item.quantity;
      if (item.price != null) {
        total += item.price * item.quantity;
        hasPriced = true;
      }
    });

    return { qty: qty, total: hasPriced ? total : null };
  }

  function buildWhatsAppMessage(items) {
    var businessName = String(root.getAttribute('data-business-name') || '').trim();
    var configuredIntro = String(root.getAttribute('data-whatsapp-intro') || '').trim();
    var intro = configuredIntro
      || (businessName
        ? 'Hola, quiero hacer un pedido en ' + businessName + ':'
        : 'Hola, me gustaría realizar el siguiente pedido:');
    var lines = [intro, ''];
    var totals = getTotals(items);

    items.forEach(function (item) {
      var label = item.name;
      if (item.quantity > 1) {
        label += ' x' + item.quantity;
      }

      if (item.price != null) {
        var lineTotal = item.price * item.quantity;
        lines.push('- ' + label + ' (' + formatPrice(lineTotal) + ')');
      } else {
        lines.push('- ' + label);
      }
    });

    lines.push('');

    if (totals.total != null) {
      lines.push('Total estimado: ' + formatPrice(totals.total));
      lines.push('');
    }

    lines.push('¿Podrían confirmarme disponibilidad?');
    lines.push('');
    lines.push('Gracias.');

    return lines.join('\n');
  }

  function buildWhatsAppUrl(message) {
    var text = encodeURIComponent(message);
    if (whatsappPhone) {
      return 'https://wa.me/' + whatsappPhone + '?text=' + text;
    }
    return 'https://wa.me/?text=' + text;
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.hidden = true;
    }, TOAST_MS);
  }

  function showError(message) {
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    } else {
      errorEl.textContent = '';
      errorEl.hidden = true;
    }
  }

  function setPanelOpen(open) {
    if (!panelEl || !toggleBtn) return;
    panelEl.hidden = !open;
    toggleBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    root.classList.toggle('order-cart--open', open);
    document.body.classList.toggle('order-cart-open', open);
  }

  function renderCart() {
    var items = loadCart();
    var totals = getTotals(items);
    var hasItems = items.length > 0;

    root.hidden = !hasItems;
    root.setAttribute('aria-hidden', hasItems ? 'false' : 'true');
    document.body.classList.toggle('has-order-cart', hasItems);

    if (!hasItems) {
      setPanelOpen(false);
      listEl.innerHTML = '';
      emptyEl.hidden = true;
      showError('');
      updateSendLink([]);
      updateCounters(0, null);
      return;
    }

    listEl.innerHTML = items
      .map(function (item) {
        var priceLabel =
          item.price != null
            ? formatPrice(item.price * item.quantity)
            : 'Consultar precio';
        var qtyLabel = item.quantity > 1 ? ' <span class="order-cart__item-qty">x' + item.quantity + '</span>' : '';

        return (
          '<li class="order-cart__item">' +
          '<div class="order-cart__item-info">' +
          '<span class="order-cart__item-name">' +
          escapeHtml(item.name) +
          qtyLabel +
          '</span>' +
          '<span class="order-cart__item-price">' +
          escapeHtml(priceLabel) +
          '</span>' +
          '</div>' +
          '<button type="button" class="order-cart__item-remove" data-remove-key="' +
          escapeHtml(item.key) +
          '" aria-label="Quitar ' +
          escapeHtml(item.name) +
          ' del pedido">' +
          '&times;' +
          '</button>' +
          '</li>'
        );
      })
      .join('');

    emptyEl.hidden = hasItems;
    updateCounters(totals.qty, totals.total);
    updateSendLink(items);
    showError('');
  }

  function updateCounters(qty, total) {
    var totalLabel = total != null ? formatPrice(total) : 'Consultar';
    countEls.forEach(function (el) {
      el.textContent = String(qty);
    });
    totalEls.forEach(function (el) {
      el.textContent = totalLabel;
    });
    if (qtyTotalEl) {
      qtyTotalEl.textContent = String(qty);
    }
  }

  function updateSendLink(items) {
    if (!sendLink) return;

    if (!items.length) {
      sendLink.href = '#';
      sendLink.setAttribute('aria-disabled', 'true');
      sendLink.classList.add('is-disabled');
      return;
    }

    if (!whatsappPhone) {
      sendLink.href = '#';
      sendLink.setAttribute('aria-disabled', 'true');
      sendLink.classList.add('is-disabled');
      showError('WhatsApp no configurado. Contactá al negocio por otro medio.');
      return;
    }

    sendLink.href = buildWhatsAppUrl(buildWhatsAppMessage(items));
    sendLink.setAttribute('aria-disabled', 'false');
    sendLink.classList.remove('is-disabled');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function addItemFromButton(button) {
    var key = button.getAttribute('data-order-key');
    var name = sanitizeName(button.getAttribute('data-order-name'));
    var type = button.getAttribute('data-order-type') === 'promo' ? 'promo' : 'producto';
    var price = parsePrice(button.getAttribute('data-order-price'));

    if (!key || !name) {
      showToast('No se pudo agregar este producto.');
      return;
    }

    var items = loadCart();
    var existing = items.find(function (item) {
      return item.key === key;
    });

    if (existing) {
      if (existing.quantity >= 99) {
        showToast('Cantidad máxima alcanzada para este producto.');
        return;
      }
      existing.quantity += 1;
    } else {
      if (items.length >= MAX_ITEMS) {
        showToast('Alcanzaste el máximo de productos distintos en el pedido.');
        return;
      }
      items.push({
        key: key,
        type: type,
        name: name,
        price: price,
        quantity: 1,
      });
    }

    if (!saveCart(items)) return;

    renderCart();
    setPanelOpen(true);
    showToast(name + ' agregado al pedido');
    button.classList.add('is-added');
    setTimeout(function () {
      button.classList.remove('is-added');
    }, 600);
  }

  function removeItem(key) {
    var items = loadCart().filter(function (item) {
      return item.key !== key;
    });
    saveCart(items);
    renderCart();
    showToast('Producto eliminado del pedido');
  }

  function clearCart() {
    if (!loadCart().length) return;
    saveCart([]);
    renderCart();
    showToast('Pedido vaciado');
  }

  function handleSendClick(event) {
    if (sendLink.getAttribute('aria-disabled') === 'true') {
      event.preventDefault();
      if (!whatsappPhone) {
        showError('WhatsApp no configurado. Contactá al negocio por otro medio.');
      }
    }
  }

  function bindEvents() {
    document.addEventListener('click', function (event) {
      var addBtn = event.target.closest('.js-add-to-order');
      if (addBtn) {
        event.preventDefault();
        addItemFromButton(addBtn);
        return;
      }

      var removeBtn = event.target.closest('[data-remove-key]');
      if (removeBtn && root.contains(removeBtn)) {
        event.preventDefault();
        removeItem(removeBtn.getAttribute('data-remove-key'));
        return;
      }
    });

    toggleBtn.addEventListener('click', function () {
      var isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
      setPanelOpen(!isOpen);
    });

    closeBtn.addEventListener('click', function () {
      setPanelOpen(false);
    });

    clearBtn.addEventListener('click', function () {
      clearCart();
    });

    sendLink.addEventListener('click', handleSendClick);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && root.classList.contains('order-cart--open')) {
        setPanelOpen(false);
      }
    });
  }

  function init() {
    root = document.getElementById('order-cart');
    if (!root) return;

    toastEl = document.getElementById('order-cart-toast');
    toggleBtn = document.getElementById('order-cart-toggle');
    panelEl = document.getElementById('order-cart-panel');
    listEl = document.getElementById('order-cart-list');
    emptyEl = document.getElementById('order-cart-empty');
    errorEl = document.getElementById('order-cart-error');
    sendLink = document.getElementById('order-cart-send');
    clearBtn = document.getElementById('order-cart-clear');
    closeBtn = document.getElementById('order-cart-close');
    qtyTotalEl = document.getElementById('order-cart-qty-total');

    countEls = [
      document.getElementById('order-cart-count'),
      qtyTotalEl,
    ].filter(Boolean);

    totalEls = [
      document.getElementById('order-cart-total'),
      document.getElementById('order-cart-total-compact'),
    ].filter(Boolean);

    whatsappPhone = String(root.getAttribute('data-whatsapp-phone') || '').replace(/\D/g, '');

    bindEvents();
    renderCart();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

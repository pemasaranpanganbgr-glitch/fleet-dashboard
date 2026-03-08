(function() {
  'use strict';

  const CONFIG = {
    WEB_APP_URL: 'https://script.google.com/macros/s/AKfycbzikbUH9ULVZ2A5kuY8Z157IyVcAXbBjtDdsqm168a3KkwYPQVe9-0wFPHoW5g_SIge1A/exec'
  };

  const State = {
    backendPayload: null,
    activeKomoditi: 'semua',
    charts: {},
    refreshTimer: null,
    isRefreshing: false,
    tvMode: false
  };

  const DOM = {
    get: (id) => document.getElementById(id),
    updateText: (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    },
    showRefreshIndicator: (show) => {
      const el = document.getElementById('refreshIndicator');
      if (!el) return;
      show ? el.classList.add('show') : el.classList.remove('show');
    },
    showMessage: (type, msg, duration = 2500) => {
      const msgEl = document.getElementById('messageContainer');
      const errEl = document.getElementById('errorContainer');

      if (type === 'error') {
        if (!errEl) return;
        errEl.style.display = 'block';
        errEl.style.padding = '10px';
        errEl.style.marginTop = '10px';
        errEl.style.background = 'rgba(231,76,60,0.2)';
        errEl.style.borderRadius = '10px';
        errEl.style.color = '#e74c3c';
        errEl.textContent = '❌ ' + msg;
        setTimeout(() => { errEl.style.display = 'none'; }, duration);
      } else {
        if (!msgEl) return;
        msgEl.style.color = '#2ecc71';
        msgEl.textContent = '✅ ' + msg;
        setTimeout(() => { msgEl.textContent = ''; }, duration);
      }
    }
  };

  const Utils = {
    formatNumber: (num) => new Intl.NumberFormat('id-ID').format(Math.round(Number(num || 0))),
    formatDecimal: (num, dec = 1) => new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    }).format(Number(num || 0)),
    formatDate: (val) => {
      if (!val) return '-';
      const d = new Date(val);
      if (isNaN(d)) return '-';
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(d);
    },
    formatDateTime: (val) => {
      if (!val) return '-';
      const d = new Date(val);
      if (isNaN(d)) return '-';
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(d);
    },
    getStatusClass: (status) => {
      const s = String(status || '').toUpperCase();
      if (s === 'DELIVERED') return 'status-delivered';
      if (s === 'ON_DELIVERY') return 'status-ondelivery';
      if (s === 'PROGRESS') return 'status-progress';
      if (s === 'CANCEL') return 'status-cancel';
      if (s === 'PARTIAL') return 'status-partial';
      return '';
    },
    getBadgeClass: (status) => {
      const s = String(status || '').toUpperCase();
      if (s === 'DELIVERED') return 'badge-delivered';
      if (s === 'ON_DELIVERY') return 'badge-ondelivery';
      if (s === 'PROGRESS') return 'badge-progress';
      if (s === 'CANCEL') return 'badge-cancel';
      if (s === 'PARTIAL') return 'badge-partial';
      return '';
    }
  };

  const LiveStatus = {
    setConnected() {
      const el = DOM.get('liveStatus');
      if (!el) return;
      el.textContent = '🟢 Live';
      el.className = 'connected';
    },
    setChecking() {
      const el = DOM.get('liveStatus');
      if (!el) return;
      el.textContent = '🟡 Checking...';
      el.className = 'checking';
    },
    setOffline() {
      const el = DOM.get('liveStatus');
      if (!el) return;
      el.textContent = '🔴 Offline';
      el.className = 'disconnected';
    }
  };

  const Renderer = {
    masterSummary(masterStats, filters) {
      DOM.updateText('masterTotalOrders', Utils.formatNumber(masterStats.totalOrders));
      DOM.updateText('masterTotalQty', Utils.formatNumber(masterStats.totalQty));
      DOM.updateText('masterAvgQty', Utils.formatDecimal(masterStats.avgQty, 1));
      DOM.updateText('masterTotalKomoditi', String(masterStats.totalKomoditi || 2));

      const from = filters?.from ? Utils.formatDate(filters.from) : '-';
      const to = filters?.to ? Utils.formatDate(filters.to) : '-';
      DOM.updateText('masterPeriode', `${from} - ${to}`);
    },

    komoditiSummary(summary) {
      DOM.updateText('gulaOrderCount', `${Utils.formatNumber(summary?.gula?.orders || 0)} order`);
      DOM.updateText('gulaTotalQty', Utils.formatNumber(summary?.gula?.qty || 0));
      DOM.updateText('gulaProgress', `${Utils.formatNumber(summary?.gula?.progress || 0)} order`);
      DOM.updateText('minyakOrderCount', `${Utils.formatNumber(summary?.minyak?.orders || 0)} order`);
      DOM.updateText('minyakTotalQty', Utils.formatNumber(summary?.minyak?.qty || 0));
      DOM.updateText('minyakProgress', `${Utils.formatNumber(summary?.minyak?.progress || 0)} order`);
    },

    renderProgressContainer(progressStats, totalOrders) {
      const kpiContainer = DOM.get('kpiContainer');
      if (!kpiContainer) return;

      let progressCard = document.getElementById('containerProgress');
      if (!progressCard) {
        progressCard = document.createElement('div');
        progressCard.id = 'containerProgress';
        progressCard.className = 'kpi';
        kpiContainer.prepend(progressCard);
      }

      const percentage = totalOrders ? ((Number(progressStats.count || 0) / Number(totalOrders)) * 100) : 0;
      progressCard.className = `kpi ${(progressStats.count || 0) > 0 ? 'glow-active' : 'glow-inactive'}`;
      progressCard.style.borderTop = '4px solid #f1c40f';
      progressCard.style.setProperty('--glow-color', '#f1c40f80');

      progressCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <span style="font-weight:700;">PROGRESS</span>
          <span>⏳</span>
        </div>
        <div class="main-value">${Utils.formatNumber(progressStats.count || 0)}</div>
        <div class="qty-value">${Utils.formatNumber(progressStats.qty || 0)} Qty</div>
        <div>${Utils.formatDecimal(percentage, 1)}% dari total</div>
        <div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">
          Rata-rata: ${Utils.formatDecimal(progressStats.avgProcessingTime || 0, 1)} hari
        </div>
      `;
    },

    renderPartialContainer(partialStats) {
      const container = DOM.get('partialContainer');
      const pill = DOM.get('partialPill');
      if (!container || !pill) return;

      const count = partialStats?.count || 0;
      pill.textContent = count === 0 ? 'Tidak ada' : `${Utils.formatNumber(count)} order`;

      if (count === 0) {
        container.innerHTML = '<p class="note">✨ Semua order memiliki status tunggal</p>';
        return;
      }

      let html = `
        <div class="partial-detail">
          <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
            <p style="font-weight:700; color:#9b59b6;">⚡ ${Utils.formatNumber(count)} Order dengan Status Campuran</p>
            <span class="badge badge-partial">Total: ${Utils.formatNumber(partialStats.qty || 0)} Qty</span>
          </div>
      `;

      (partialStats.details || []).slice(0, 5).forEach(detail => {
        html += `
          <div style="margin-top:12px; padding:10px; background:rgba(0,0,0,0.2); border-radius:8px;">
            <div style="font-weight:700; margin-bottom:8px;">📋 ${detail.orderCode || '-'}</div>
            <div style="display:flex; flex-wrap:wrap; gap:12px;">
        `;

        (detail.breakdown || []).forEach(b => {
          html += `
            <div>
              <span class="badge ${Utils.getBadgeClass(b.status)}">${b.status}</span>
              <span style="font-size:11px;">${Utils.formatNumber(b.qty)} Qty</span>
            </div>
          `;
        });

        html += `</div></div>`;
      });

      if ((partialStats.details || []).length > 5) {
        html += `<div class="note" style="margin-top:8px;">... dan ${(partialStats.details || []).length - 5} lainnya</div>`;
      }

      html += `</div>`;
      container.innerHTML = html;
    },

    renderDeliveredCard(deliveredStats, totalOrders) {
      let card = document.getElementById('containerDelivered');
      if (!card) {
        card = document.createElement('div');
        card.id = 'containerDelivered';
        card.className = 'kpi';
      }

      const count = deliveredStats?.totalOrdersWithDelivered || 0;
      const qty = deliveredStats?.totalDeliveredQty || 0;
      const pure = deliveredStats?.pureDelivered?.count || 0;
      const mixed = deliveredStats?.mixedDelivered?.count || 0;
      const percentage = totalOrders ? (count / totalOrders) * 100 : 0;

      card.className = `kpi ${count > 0 ? 'glow-active' : 'glow-inactive'}`;
      card.style.borderTop = '4px solid #2ecc71';
      card.style.setProperty('--glow-color', '#2ecc7180');

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <span style="font-weight:700;">DELIVERED</span>
          <span>✅</span>
        </div>
        <div class="main-value">${Utils.formatNumber(count)}</div>
        <div class="qty-value">${Utils.formatNumber(qty)} Qty</div>
        <div>${Utils.formatDecimal(percentage, 1)}% dari total</div>
        <div style="margin-top:8px; font-size:11px; color:#2ecc71;">✅ Murni: ${Utils.formatNumber(pure)} order</div>
        ${mixed > 0 ? `<div style="font-size:11px; color:#f1c40f;">🔄 Campuran: ${Utils.formatNumber(mixed)} order</div>` : ''}
      `;
      return card;
    },

    renderCancelCard(cancelStats, totalOrders) {
      let card = document.getElementById('containerCancel');
      if (!card) {
        card = document.createElement('div');
        card.id = 'containerCancel';
        card.className = 'kpi';
      }

      const count = cancelStats?.totalOrdersWithCancel || 0;
      const qty = cancelStats?.totalCancelQty || 0;
      const pure = cancelStats?.pureCancel?.count || 0;
      const mixed = cancelStats?.mixedCancel?.count || 0;
      const percentage = totalOrders ? (count / totalOrders) * 100 : 0;

      card.className = `kpi ${count > 0 ? 'glow-active' : 'glow-inactive'}`;
      card.style.borderTop = '4px solid #e74c3c';
      card.style.setProperty('--glow-color', '#e74c3c80');

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <span style="font-weight:700;">CANCEL</span>
          <span>⛔</span>
        </div>
        <div class="main-value">${Utils.formatNumber(count)}</div>
        <div class="qty-value">${Utils.formatNumber(qty)} Qty</div>
        <div>${Utils.formatDecimal(percentage, 1)}% dari total</div>
        <div style="margin-top:8px; font-size:11px; color:#e74c3c;">⛔ Murni: ${Utils.formatNumber(pure)} order</div>
        ${mixed > 0 ? `<div style="font-size:11px; color:#f1c40f;">🔄 Campuran: ${Utils.formatNumber(mixed)} order</div>` : ''}
      `;
      return card;
    },

    kpi(stats, deliveredStats, cancelStats) {
      const topContainer = DOM.get('kpiContainer');
      const bottomContainer = DOM.get('kpiBottomContainer');
      if (!topContainer || !bottomContainer) return;

      const progressCard = document.getElementById('containerProgress');
      topContainer.innerHTML = '';
      if (progressCard) topContainer.appendChild(progressCard);

      const topList = [
        { label: 'ON DELIVERY', icon: '🚚', color: '#3498db', data: stats?.onDelivery || {} },
        { label: 'PARSIAL', icon: '⚡', color: '#9b59b6', data: stats?.partial || {} }
      ];

      topList.forEach(item => {
        const count = item.data.count || 0;
        const qty = item.data.qty || 0;
        const percentage = item.data.percentage || 0;

        const card = document.createElement('div');
        card.className = `kpi ${count > 0 ? 'glow-active' : 'glow-inactive'}`;
        card.style.borderTop = `4px solid ${item.color}`;
        card.style.setProperty('--glow-color', `${item.color}80`);

        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span style="font-weight:700;">${item.label}</span>
            <span>${item.icon}</span>
          </div>
          <div class="main-value">${Utils.formatNumber(count)}</div>
          <div class="qty-value">${Utils.formatNumber(qty)} Qty</div>
          <div>${Utils.formatDecimal(percentage, 1)}%</div>
        `;
        topContainer.appendChild(card);
      });

      bottomContainer.innerHTML = '';
      bottomContainer.appendChild(Renderer.renderDeliveredCard(deliveredStats, stats?.totalOrders || 0));
      bottomContainer.appendChild(Renderer.renderCancelCard(cancelStats, stats?.totalOrders || 0));
    },

    chartsFromBackend(charts, stats) {
      Object.values(State.charts).forEach(c => c && c.destroy());
      State.charts = {};

      const ctxStatus = DOM.get('chartStatus')?.getContext('2d');
      if (ctxStatus) {
        State.charts.status = new Chart(ctxStatus, {
          type: 'doughnut',
          data: {
            labels: (charts?.status || []).map(i => i.label),
            datasets: [{
              data: (charts?.status || []).map(i => i.value),
              backgroundColor: ['#f1c40f', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6'],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'right',
                labels: { color: '#e9f1fb', font: { size: 11 } }
              }
            },
            cutout: '70%'
          }
        });
      }

      DOM.updateText('statusNote', `Total ${Utils.formatNumber(stats?.totalOrders || 0)} order • Total QTY: ${Utils.formatNumber(stats?.totalQty || 0)}`);

      const ctxCity = DOM.get('chartCity')?.getContext('2d');
      if (ctxCity && (charts?.kota || []).length) {
        State.charts.city = new Chart(ctxCity, {
          type: 'bar',
          data: {
            labels: charts.kota.map(i => i.label),
            datasets: [{
              label: 'QTY',
              data: charts.kota.map(i => i.value),
              backgroundColor: 'rgba(52,152,219,0.7)',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#e9f1fb', maxRotation: 45 } },
              y: { ticks: { color: '#e9f1fb' } }
            }
          }
        });
      }

      const ctxFactory = DOM.get('chartFactory')?.getContext('2d');
      if (ctxFactory && (charts?.pabrik || []).length) {
        State.charts.factory = new Chart(ctxFactory, {
          type: 'bar',
          data: {
            labels: charts.pabrik.map(i => i.label),
            datasets: [{
              label: 'QTY',
              data: charts.pabrik.map(i => i.value),
              backgroundColor: 'rgba(255,176,0,0.7)',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              x: { ticks: { color: '#e9f1fb', maxRotation: 45 } },
              y: { ticks: { color: '#e9f1fb' } }
            }
          }
        });
      }
    },

    realTimeTable(data) {
      const tbody = DOM.get('rtBody');
      if (!tbody) return;

      tbody.innerHTML = '';
      if (!data || !data.length) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:20px;">Tidak ada data</td></tr>';
        return;
      }

      data.forEach(item => {
        const row = tbody.insertRow();
        row.insertCell().innerHTML = `<span class="badge ${item.komoditi === 'GULA' ? 'badge-gula' : 'badge-minyak'}">${item.komoditi || '-'}</span>`;
        row.insertCell().textContent = item.noPolisi || '-';
        row.insertCell().textContent = item.kota || '-';

        const st = row.insertCell();
        st.textContent = item.status || item.statusCategory || '-';
        st.className = Utils.getStatusClass(item.statusCategory);

        row.insertCell().textContent = Utils.formatNumber(item.qty || 0);
        row.insertCell().textContent = Utils.formatDate(item.tglMuat || item.rencanaMuat || item.tglOrder);
      });
    },

    ringkasanData(stats, masterStats, payload) {
      DOM.updateText('totalRowsDetail', `${Utils.formatNumber(stats?.totalRows || 0)} baris`);
      DOM.updateText('totalOrdersDetail', `${Utils.formatNumber(stats?.totalOrders || 0)} order`);
      DOM.updateText('masterInfoDetail', `${Utils.formatNumber(masterStats?.totalOrders || 0)} order (${Utils.formatNumber(masterStats?.totalQty || 0)} QTY)`);
      DOM.updateText('totalQtyDetail', Utils.formatNumber(stats?.totalQty || 0));
      DOM.updateText('avgQtyDetail', Utils.formatDecimal(stats?.avgQtyPerOrder || 0, 1));

      const refreshSec = DOM.get('refreshSec')?.value || '0';
      DOM.updateText('refreshStatus', refreshSec === '0' ? 'Off' : `${refreshSec}s`);
      DOM.updateText('dataStatus', '✅ Backend Apps Script • ✅ Frontend HTML');
      DOM.updateText('lastUpdateTime', Utils.formatDateTime(payload?.generatedAt || new Date()));
      DOM.updateText('lastUpdate', Utils.formatDateTime(payload?.generatedAt || new Date()));
    }
  };

  const DataFetcher = {
    async fetchAllData() {
      if (State.isRefreshing) return null;

      State.isRefreshing = true;
      DOM.showRefreshIndicator(true);
      LiveStatus.setChecking();

      try {
        const from = DOM.get('fromDate')?.value || '';
        const to = DOM.get('toDate')?.value || '';
        const komoditi = State.activeKomoditi || 'semua';
        const url = `${CONFIG.WEB_APP_URL}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&komoditi=${encodeURIComponent(komoditi)}`;

        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Backend error');

        State.backendPayload = json;
        LiveStatus.setConnected();
        return json;
      } catch (err) {
        console.error(err);
        LiveStatus.setOffline();
        DOM.showMessage('error', 'Gagal mengambil data dari Apps Script');
        return null;
      } finally {
        DOM.showRefreshIndicator(false);
        State.isRefreshing = false;
      }
    }
  };

  const AutoRefresh = {
    setup() {
      if (State.refreshTimer) clearInterval(State.refreshTimer);
      const sec = Number(DOM.get('refreshSec')?.value || 0);
      if (sec > 0) {
        State.refreshTimer = setInterval(() => App.refresh(), sec * 1000);
      }
    }
  };

  const TVMode = {
    toggle() {
      State.tvMode = !State.tvMode;
      document.body.classList.toggle('tv-mode', State.tvMode);
      const btn = DOM.get('btnDisplay');
      if (btn) {
        btn.textContent = State.tvMode ? '📺 TV Mode ON' : '📺 Display Mode';
        btn.classList.toggle('active', State.tvMode);
      }
    }
  };

  function setKomoditi(active) {
    State.activeKomoditi = active;
    DOM.get('btnSemua')?.classList.remove('active');
    DOM.get('btnGula')?.classList.remove('active');
    DOM.get('btnMinyak')?.classList.remove('active');

    if (active === 'semua') DOM.get('btnSemua')?.classList.add('active');
    if (active === 'GULA') DOM.get('btnGula')?.classList.add('active');
    if (active === 'MINYAK') DOM.get('btnMinyak')?.classList.add('active');

    App.refresh();
  }

  const App = {
    updateDisplay() {
      const payload = State.backendPayload;
      if (!payload) return;

      Renderer.masterSummary(payload.masterStats || {}, payload.filters || {});
      Renderer.komoditiSummary(payload.komoditiSummary || {});
      Renderer.renderProgressContainer(payload.progressStats || {}, payload.stats?.totalOrders || 0);
      Renderer.renderPartialContainer(payload.partialStats || {});
      Renderer.kpi(payload.stats || {}, payload.deliveredStats || {}, payload.cancelStats || {});
      Renderer.chartsFromBackend(payload.charts || {}, payload.stats || {});
      Renderer.realTimeTable(payload.realtime || []);
      Renderer.ringkasanData(payload.stats || {}, payload.masterStats || {}, payload);
    },

    async refresh() {
      const data = await DataFetcher.fetchAllData();
      if (data) {
        App.updateDisplay();
        DOM.showMessage('success', 'Data dashboard berhasil diperbarui');
      }
    },

    initDefaultDate() {
      const today = new Date();
      const janFirst = new Date(today.getFullYear(), 0, 1);
      DOM.get('fromDate').value = janFirst.toISOString().split('T')[0];
      DOM.get('toDate').value = today.toISOString().split('T')[0];
    },

    bindEvents() {
      DOM.get('btnRefresh')?.addEventListener('click', () => App.refresh());
      DOM.get('btnDisplay')?.addEventListener('click', TVMode.toggle);
      DOM.get('refreshSec')?.addEventListener('change', AutoRefresh.setup);
      DOM.get('fromDate')?.addEventListener('change', () => App.refresh());
      DOM.get('toDate')?.addEventListener('change', () => App.refresh());
      DOM.get('btnSemua')?.addEventListener('click', () => setKomoditi('semua'));
      DOM.get('btnGula')?.addEventListener('click', () => setKomoditi('GULA'));
      DOM.get('btnMinyak')?.addEventListener('click', () => setKomoditi('MINYAK'));
    },

    async init() {
      App.initDefaultDate();
      App.bindEvents();
      await App.refresh();
      AutoRefresh.setup();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', App.init);
  } else {
    App.init();
  }
})();

(function() {
  'use strict';

  // ============================================
  // DATA DUMMY LENGKAP (LANGSUNG DI FRONTEND)
  // ============================================
  const DUMMY_DATA = {
    success: true,
    generatedAt: new Date().toISOString(),
    filters: { from: '2026-01-01', to: '2026-03-08', komoditi: 'semua' },
    
    masterStats: {
      totalOrders: 157,
      totalQty: 98750,
      avgQty: 629,
      totalKomoditi: 2
    },
    
    komoditiSummary: {
      gula: {
        orders: 98,
        qty: 62400,
        progress: 23
      },
      minyak: {
        orders: 59,
        qty: 36350,
        progress: 15
      }
    },
    
    stats: {
      totalOrders: 145,
      totalQty: 89750,
      avgQtyPerOrder: 619,
      totalRows: 168,
      
      progress: {
        count: 38,
        qty: 22450,
        percentage: 26.2
      },
      
      onDelivery: {
        count: 22,
        qty: 13800,
        percentage: 15.2
      },
      
      partial: {
        count: 12,
        qty: 7650,
        percentage: 8.3
      }
    },
    
    progressStats: {
      count: 38,
      qty: 22450,
      avgProcessingTime: 2.8
    },
    
    partialStats: {
      count: 12,
      qty: 7650,
      details: [
        {
          orderCode: 'ORD-2026-001',
          breakdown: [
            { status: 'DELIVERED', qty: 500 },
            { status: 'PROGRESS', qty: 300 }
          ]
        },
        {
          orderCode: 'ORD-2026-015',
          breakdown: [
            { status: 'DELIVERED', qty: 400 },
            { status: 'ON_DELIVERY', qty: 250 }
          ]
        },
        {
          orderCode: 'ORD-2026-032',
          breakdown: [
            { status: 'PROGRESS', qty: 350 },
            { status: 'CANCEL', qty: 150 }
          ]
        }
      ]
    },
    
    deliveredStats: {
      totalOrdersWithDelivered: 73,
      totalDeliveredQty: 45800,
      pureDelivered: { count: 61 },
      mixedDelivered: { count: 12 }
    },
    
    cancelStats: {
      totalOrdersWithCancel: 18,
      totalCancelQty: 11200,
      pureCancel: { count: 14 },
      mixedCancel: { count: 4 }
    },
    
    charts: {
      status: [
        { label: 'PROGRESS', value: 38 },
        { label: 'ON DELIVERY', value: 22 },
        { label: 'DELIVERED', value: 73 },
        { label: 'CANCEL', value: 18 },
        { label: 'PARTIAL', value: 12 }
      ],
      
      kota: [
        { label: 'JAKARTA', value: 24500 },
        { label: 'BANDUNG', value: 18700 },
        { label: 'SURABAYA', value: 15600 },
        { label: 'MEDAN', value: 12400 },
        { label: 'SEMARANG', value: 8900 },
        { label: 'MAKASSAR', value: 7600 },
        { label: 'PALEMBANG', value: 5400 },
        { label: 'BALIKPAPAN', value: 4300 }
      ],
      
      pabrik: [
        { label: 'PABRIK A', value: 18700 },
        { label: 'PABRIK B', value: 16200 },
        { label: 'PABRIK C', value: 14800 },
        { label: 'PABRIK D', value: 12300 },
        { label: 'PABRIK E', value: 9800 },
        { label: 'PABRIK F', value: 7600 }
      ]
    },
    
    realtime: [
      { komoditi: 'GULA', noPolisi: 'B 1234 ABC', kota: 'JAKARTA', status: 'DELIVERED', statusCategory: 'DELIVERED', qty: 1000, tglMuat: '2026-03-08' },
      { komoditi: 'MINYAK', noPolisi: 'B 5678 DEF', kota: 'BANDUNG', status: 'ON_DELIVERY', statusCategory: 'ON_DELIVERY', qty: 500, tglMuat: '2026-03-08' },
      { komoditi: 'GULA', noPolisi: 'B 9012 GHI', kota: 'SURABAYA', status: 'PROGRESS', statusCategory: 'PROGRESS', qty: 750, tglMuat: '2026-03-07' },
      { komoditi: 'GULA', noPolisi: 'B 3456 JKL', kota: 'MEDAN', status: 'DELIVERED', statusCategory: 'DELIVERED', qty: 1200, tglMuat: '2026-03-07' },
      { komoditi: 'MINYAK', noPolisi: 'B 7890 MNO', kota: 'SEMARANG', status: 'DELIVERED', statusCategory: 'DELIVERED', qty: 600, tglMuat: '2026-03-06' },
      { komoditi: 'GULA', noPolisi: 'B 2345 PQR', kota: 'JAKARTA', status: 'PARTIAL', statusCategory: 'PARTIAL', qty: 800, tglMuat: '2026-03-06' },
      { komoditi: 'MINYAK', noPolisi: 'B 6789 STU', kota: 'BANDUNG', status: 'CANCEL', statusCategory: 'CANCEL', qty: 450, tglMuat: '2026-03-05' },
      { komoditi: 'GULA', noPolisi: 'B 0123 VWX', kota: 'SURABAYA', status: 'DELIVERED', statusCategory: 'DELIVERED', qty: 900, tglMuat: '2026-03-05' },
      { komoditi: 'MINYAK', noPolisi: 'B 4567 YZA', kota: 'MEDAN', status: 'PROGRESS', statusCategory: 'PROGRESS', qty: 550, tglMuat: '2026-03-04' },
      { komoditi: 'GULA', noPolisi: 'B 8901 BCD', kota: 'PALEMBANG', status: 'DELIVERED', statusCategory: 'DELIVERED', qty: 1100, tglMuat: '2026-03-04' }
    ]
  };

  const State = {
    backendPayload: DUMMY_DATA, // LANGSUNG PAKAI DATA DUMMY
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
        errEl.innerHTML = '❌ ' + msg;
        setTimeout(() => { errEl.style.display = 'none'; }, duration);
      } else {
        if (!msgEl) return;
        msgEl.innerHTML = '✅ ' + msg;
        setTimeout(() => { msgEl.innerHTML = ''; }, duration);
      }
    }
  };

  const Utils = {
    formatNumber: (num) => {
      const n = Number(num || 0);
      return new Intl.NumberFormat('id-ID').format(Math.round(n));
    },
    formatDecimal: (num, dec = 1) => {
      const n = Number(num || 0);
      return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: dec,
        maximumFractionDigits: dec
      }).format(n);
    },
    formatDate: (val) => {
      if (!val) return '-';
      try {
        const d = new Date(val);
        if (isNaN(d)) return '-';
        return new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(d);
      } catch {
        return '-';
      }
    },
    formatDateTime: (val) => {
      if (!val) return '-';
      try {
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
      } catch {
        return '-';
      }
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
      el.textContent = '🟢 Live (Data Dummy)';
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
      DOM.updateText('masterTotalOrders', Utils.formatNumber(masterStats?.totalOrders));
      DOM.updateText('masterTotalQty', Utils.formatNumber(masterStats?.totalQty));
      DOM.updateText('masterAvgQty', Utils.formatDecimal(masterStats?.avgQty, 1));
      DOM.updateText('masterTotalKomoditi', String(masterStats?.totalKomoditi || 2));

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

      const count = progressStats?.count || 0;
      const percentage = totalOrders ? ((count / Number(totalOrders)) * 100) : 0;
      
      progressCard.className = `kpi ${count > 0 ? 'glow-active' : 'glow-inactive'}`;
      progressCard.style.borderTop = '4px solid #f1c40f';
      progressCard.style.setProperty('--glow-color', '#f1c40f80');

      progressCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
          <span style="font-weight:700;">PROGRESS</span>
          <span>⏳</span>
        </div>
        <div class="main-value">${Utils.formatNumber(count)}</div>
        <div class="qty-value">${Utils.formatNumber(progressStats?.qty || 0)} Qty</div>
        <div>${Utils.formatDecimal(percentage, 1)}% dari total</div>
        <div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">
          Rata-rata: ${Utils.formatDecimal(progressStats?.avgProcessingTime || 0, 1)} hari
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
            <span class="badge badge-partial">Total: ${Utils.formatNumber(partialStats?.qty || 0)} Qty</span>
          </div>
      `;

      (partialStats?.details || []).slice(0, 5).forEach(detail => {
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

      if ((partialStats?.details || []).length > 5) {
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
        { label: 'PARTIAL', icon: '⚡', color: '#9b59b6', data: stats?.partial || {} }
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
      bottomContainer.appendChild(this.renderDeliveredCard(deliveredStats, stats?.totalOrders || 0));
      bottomContainer.appendChild(this.renderCancelCard(cancelStats, stats?.totalOrders || 0));
    },

    chartsFromBackend(charts, stats) {
      Object.values(State.charts).forEach(c => {
        if (c && typeof c.destroy === 'function') c.destroy();
      });
      State.charts = {};

      const ctxStatus = DOM.get('chartStatus')?.getContext('2d');
      if (ctxStatus && charts?.status) {
        State.charts.status = new Chart(ctxStatus, {
          type: 'doughnut',
          data: {
            labels: charts.status.map(i => i.label),
            datasets: [{
              data: charts.status.map(i => i.value),
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
      if (ctxCity && charts?.kota?.length) {
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
      if (ctxFactory && charts?.pabrik?.length) {
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
        row.insertCell().textContent = Utils.formatDate(item.tglMuat || item.rencanaMuat);
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
      DOM.updateText('dataStatus', '✅ Data Dummy • Siap digunakan');
      DOM.updateText('lastUpdateTime', Utils.formatDateTime(payload?.generatedAt || new Date()));
      DOM.updateText('lastUpdate', Utils.formatDateTime(payload?.generatedAt || new Date()));
    },

    renderAll() {
      const payload = State.backendPayload;
      if (!payload) return;

      console.log('Rendering with payload:', payload);
      
      this.masterSummary(payload.masterStats, payload.filters);
      this.komoditiSummary(payload.komoditiSummary);
      this.renderProgressContainer(payload.progressStats, payload.stats?.totalOrders);
      this.renderPartialContainer(payload.partialStats);
      this.kpi(payload.stats, payload.deliveredStats, payload.cancelStats);
      this.chartsFromBackend(payload.charts, payload.stats);
      this.realTimeTable(payload.realtime);
      this.ringkasanData(payload.stats, payload.masterStats, payload);
      
      LiveStatus.setConnected();
      DOM.showMessage('success', 'Dashboard siap (Data Dummy)');
    }
  };

  const App = {
    initDefaultDate() {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), 0, 1);
      
      const fromInput = DOM.get('fromDate');
      const toInput = DOM.get('toDate');
      
      if (fromInput) fromInput.value = firstDay.toISOString().split('T')[0];
      if (toInput) toInput.value = today.toISOString().split('T')[0];
    },

    bindEvents() {
      DOM.get('btnRefresh')?.addEventListener('click', () => {
        Renderer.renderAll();
        DOM.showMessage('success', 'Data di-refresh');
      });
      
      DOM.get('btnDisplay')?.addEventListener('click', () => {
        State.tvMode = !State.tvMode;
        document.body.classList.toggle('tv-mode', State.tvMode);
        const btn = DOM.get('btnDisplay');
        if (btn) {
          btn.textContent = State.tvMode ? '📺 TV Mode ON' : '📺 Display Mode';
          btn.classList.toggle('active', State.tvMode);
        }
      });

      DOM.get('btnSemua')?.addEventListener('click', () => {
        State.activeKomoditi = 'semua';
        document.querySelectorAll('.commodity-btn').forEach(b => b.classList.remove('active'));
        DOM.get('btnSemua')?.classList.add('active');
        Renderer.renderAll();
      });

      DOM.get('btnGula')?.addEventListener('click', () => {
        State.activeKomoditi = 'GULA';
        document.querySelectorAll('.commodity-btn').forEach(b => b.classList.remove('active'));
        DOM.get('btnGula')?.classList.add('active');
        Renderer.renderAll();
      });

      DOM.get('btnMinyak')?.addEventListener('click', () => {
        State.activeKomoditi = 'MINYAK';
        document.querySelectorAll('.commodity-btn').forEach(b => b.classList.remove('active'));
        DOM.get('btnMinyak')?.classList.add('active');
        Renderer.renderAll();
      });
    },

    init() {
      console.log('Initializing with dummy data...');
      this.initDefaultDate();
      this.bindEvents();
      Renderer.renderAll();
    }
  };

  // Start app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }
})();

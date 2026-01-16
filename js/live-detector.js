// Sistema simple para mostrar/ocultar botón de LIVE

class LiveButtonController {
  constructor() {
    this.apiUrl = '/api/live-status.php'; // ajusta la ruta según tu estructura
    this.normalButtons = document.getElementById('normal-buttons');
    this.liveButton = document.getElementById('cta-live-yt');
    this.pollInterval = 30000; // 30 segundos
    this.pollTimer = null;
  }

  async checkLiveStatus() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Error al consultar estado');
      
      const data = await response.json();
      this.updateButtons(data);
      
      return data;
    } catch (error) {
      console.error('Error checking live status:', error);
      this.hideLiveButton();
      return null;
    }
  }

  updateButtons(data) {
    if (data.live === true && data.videoId) {
      // HAY LIVE: mostrar botón y configurar link
      const watchUrl = `https://www.youtube.com/watch?v=${data.videoId}`;
      this.liveButton.href = watchUrl;
      this.showLiveButton();
    } else {
      // NO HAY LIVE: ocultar botón
      this.hideLiveButton();
    }
  }

  showLiveButton() {
    if (!this.liveButton) return;
    
    // Ocultar botones normales
    if (this.normalButtons) {
      this.normalButtons.style.display = 'none';
    }
    
    // Mostrar botón de live
    this.liveButton.style.display = 'inline-flex';
  }

  hideLiveButton() {
    if (!this.liveButton) return;
    
    // Mostrar botones normales
    if (this.normalButtons) {
      this.normalButtons.style.display = 'flex';
    }
    
    // Ocultar botón de live
    this.liveButton.style.display = 'none';
  }

  startPolling() {
    // Chequeo inicial inmediato
    this.checkLiveStatus();
    
    // Polling periódico
    this.pollTimer = setInterval(() => {
      this.checkLiveStatus();
    }, this.pollInterval);
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', () => {
  const controller = new LiveButtonController();
  controller.startPolling();
  
  // Limpiar al salir
  window.addEventListener('beforeunload', () => {
    controller.stopPolling();
  });
});
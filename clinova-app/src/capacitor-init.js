import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';

/**
 * Inicializa los plugins nativos de Capacitor.
 * Solo se ejecuta cuando la app corre dentro del contenedor nativo.
 */
export async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) {
    return; // No hacer nada en el navegador web
  }

  // Marcar body para CSS nativo
  document.body.classList.add('capacitor-app');

  // StatusBar
  try {
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#1A36A8' });
  } catch (e) {
    console.warn('StatusBar plugin no disponible:', e);
  }

  // Keyboard: ajustar scroll al abrir teclado
  try {
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.setProperty('--keyboard-height', '0px');
    });
  } catch (e) {
    console.warn('Keyboard plugin no disponible:', e);
  }

  // Manejar botón de "atrás" en Android
  CapApp.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      CapApp.exitApp();
    }
  });
}

/**
 * Obtiene info de la app (versión, build, etc.)
 * Útil para mostrar versión en Settings y chequear actualizaciones.
 */
export async function getAppInfo() {
  if (!Capacitor.isNativePlatform()) {
    return { version: '1.0.0', build: '1', name: 'Clinova', id: 'com.clinova.app' };
  }
  try {
    return await CapApp.getInfo();
  } catch {
    return { version: '1.0.0', build: '1', name: 'Clinova', id: 'com.clinova.app' };
  }
}

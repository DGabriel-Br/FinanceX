import { useState, useEffect } from 'react';

// Estado global simples para comunicação entre OfflineModal e OfflineStatusBar
let modalDismissedListeners: Set<(dismissed: boolean) => void> = new Set();
let isModalDismissed = false;

const notifyListeners = () => {
  modalDismissedListeners.forEach(listener => listener(isModalDismissed));
};

export const setOfflineModalDismissed = (dismissed: boolean) => {
  isModalDismissed = dismissed;
  notifyListeners();
};

export const getOfflineModalDismissed = () => isModalDismissed;

export const useOfflineModalState = () => {
  const [dismissed, setDismissed] = useState(isModalDismissed);

  useEffect(() => {
    const listener = (value: boolean) => setDismissed(value);
    modalDismissedListeners.add(listener);
    return () => {
      modalDismissedListeners.delete(listener);
    };
  }, []);

  return {
    modalDismissed: dismissed,
    setModalDismissed: setOfflineModalDismissed,
  };
};

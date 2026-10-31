'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kapela_jede_pin_unlocked';

export function usePinAuth() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('Ověření PINu');
  const [modalDescription, setModalDescription] = useState<string>(
    'Pro zápis a úpravy jízd zadejte 4místný kapelní PIN.'
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') {
        setIsUnlocked(true);
      }
    } catch (e) {
      console.warn('Nelze načíst stav PINu z localStorage:', e);
    }
  }, []);

  const expectedPin = process.env.NEXT_PUBLIC_APP_PIN || '1234';

  const unlockWithPin = useCallback(
    (enteredPin: string): boolean => {
      if (enteredPin.trim() === expectedPin.trim()) {
        setIsUnlocked(true);
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch (e) {
          console.warn('Nelze uložit stav PINu do localStorage:', e);
        }

        setIsModalOpen(false);

        // Pokud byla akce pozastavena, vykonáme ji
        if (pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
        return true;
      }
      return false;
    },
    [expectedPin, pendingAction]
  );

  const lock = useCallback(() => {
    setIsUnlocked(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Nelze smazat PIN z localStorage:', e);
    }
  }, []);

  const executeProtectedAction = useCallback(
    (action: () => void, customTitle?: string, customDesc?: string) => {
      if (isUnlocked) {
        action();
      } else {
        setPendingAction(() => action);
        if (customTitle) setModalTitle(customTitle);
        if (customDesc) setModalDescription(customDesc);
        setIsModalOpen(true);
      }
    },
    [isUnlocked]
  );

  const openUnlockModal = useCallback((title?: string, desc?: string) => {
    if (title) setModalTitle(title);
    if (desc) setModalDescription(desc);
    setIsModalOpen(true);
  }, []);

  const closeUnlockModal = useCallback(() => {
    setIsModalOpen(false);
    setPendingAction(null);
  }, []);

  return {
    isUnlocked,
    isModalOpen,
    modalTitle,
    modalDescription,
    unlockWithPin,
    lock,
    executeProtectedAction,
    openUnlockModal,
    closeUnlockModal,
  };
}

import { useEffect, useRef } from 'react';

/**
 * Hook aksesibilitas modal:
 * 1. Tutup modal dengan tombol Esc
 * 2. Kunci fokus keyboard di dalam modal (Focus Trap)
 * 3. Kembalikan fokus ke elemen pemicu saat modal ditutup
 */
export function useModalAccessibility(
  isOpen: boolean,
  onClose: () => void,
  modalRef: React.RefObject<HTMLElement | null>
) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Simpan elemen yang sedang aktif sebelum modal terbuka
    if (typeof document !== 'undefined') {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    }

    // Cari elemen yang dapat menerima fokus di dalam modal
    const getFocusableElements = (): HTMLElement[] => {
      if (!modalRef.current) return [];
      const selector =
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(modalRef.current.querySelectorAll<HTMLElement>(selector)).filter(
        (el) => el.offsetParent !== null && !el.hasAttribute('disabled')
      );
    };

    // Set fokus ke elemen pertama dalam modal
    const timer = setTimeout(() => {
      const focusables = getFocusableElements();
      if (focusables.length > 0) {
        focusables[0].focus();
      } else if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Esc key untuk menutup modal
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.stopPropagation();
        onClose();
        return;
      }

      // 2. Tab key focus trap
      if (e.key === 'Tab') {
        const focusables = getFocusableElements();
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey) {
          // Shift + Tab: jika di elemen pertama, lompat ke elemen terakhir
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab biasa: jika di elemen terakhir, lompat ke elemen pertama
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      // Kembalikan fokus ke pemicu awal
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose, modalRef]);
}

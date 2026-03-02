import { useState } from 'react';

interface UseModalOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseModalReturn {
  isOpen: boolean;
  loading: boolean;
  error: string;
  open: () => void;
  close: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  handleSubmit: <T>(
    apiCall: () => Promise<T>,
    options?: UseModalOptions
  ) => Promise<T | undefined>;
}

/**
 * Reusable modal hook that handles common modal state and operations
 *
 * Eliminates duplicate code across all modal components by providing:
 * - Open/close state management
 * - Loading state management
 * - Error state management
 * - Standardized submit handler with try-catch
 * - Automatic cleanup on close
 *
 * @example
 * ```tsx
 * const modal = useModal();
 *
 * const handleSave = async (formData) => {
 *   await modal.handleSubmit(
 *     () => createAppointment(formData),
 *     {
 *       onSuccess: () => {
 *         refetch();
 *         showToast('Created successfully');
 *       }
 *     }
 *   );
 * };
 *
 * return (
 *   <Modal isOpen={modal.isOpen} onClose={modal.close}>
 *     {modal.error && <ErrorMessage>{modal.error}</ErrorMessage>}
 *     <form onSubmit={handleSave}>
 *       <button disabled={modal.loading}>
 *         {modal.loading ? 'Saving...' : 'Save'}
 *       </button>
 *     </form>
 *   </Modal>
 * );
 * ```
 */
export function useModal(): UseModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const open = () => {
    setIsOpen(true);
    setError(''); // Clear previous errors when opening
  };

  const close = () => {
    setIsOpen(false);
    setError(''); // Clear errors on close
    setLoading(false); // Reset loading state
  };

  /**
   * Standardized submit handler with automatic loading/error management
   * @param apiCall - The API function to call
   * @param options - Optional success/error callbacks
   * @returns The API response, or undefined if an error occurred
   */
  const handleSubmit = async <T,>(
    apiCall: () => Promise<T>,
    options?: UseModalOptions
  ): Promise<T | undefined> => {
    setLoading(true);
    setError('');

    try {
      const result = await apiCall();

      // Close modal on success
      close();

      // Call success callback if provided
      if (options?.onSuccess) {
        options.onSuccess();
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);

      // Call error callback if provided
      if (options?.onError) {
        options.onError(errorMessage);
      }

      return undefined;
    } finally {
      setLoading(false);
    }
  };

  return {
    isOpen,
    loading,
    error,
    open,
    close,
    setLoading,
    setError,
    handleSubmit,
  };
}

export default useModal;

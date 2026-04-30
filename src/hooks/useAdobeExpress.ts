import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    CCEverywhere: any;
  }
}

const ADOBE_CLIENT_ID = 'd391f99e70284818b9536b68a5ebc63c';

export const useAdobeExpress = () => {
  const [ccEverywhere, setCcEverywhere] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initSDK = async () => {
      if (!window.CCEverywhere) {
        console.error('Adobe Express SDK not found in window');
        return;
      }

      try {
        const instance = await window.CCEverywhere.initialize({
          clientId: ADOBE_CLIENT_ID,
          appName: 'ThumbForge',
          appVersion: { major: 1, minor: 0 },
          platformCategory: 'web',
        });
        setCcEverywhere(instance);
        setIsInitialized(true);
        console.log('Adobe Express SDK initialized');
      } catch (error) {
        console.error('Failed to initialize Adobe Express SDK:', error);
      }
    };

    if (window.CCEverywhere && !isInitialized) {
      initSDK();
    } else {
      // Wait for script to load if not already there
      const checkInterval = setInterval(() => {
        if (window.CCEverywhere && !isInitialized) {
          initSDK();
          clearInterval(checkInterval);
        }
      }, 500);
      return () => clearInterval(checkInterval);
    }
  }, [isInitialized]);

  const generateWithFirefly = useCallback(async (prompt: string): Promise<string | null> => {
    if (!ccEverywhere) {
      toast.error('Adobe Express lädt noch. Bitte kurz warten.');
      return null;
    }

    return new Promise((resolve) => {
      // In SDK v2 ist Firefly (Text-to-Image) kein QuickAction, sondern Teil des Editors.
      // Wir öffnen daher den Editor. Der User kann dort Firefly nutzen.
      ccEverywhere.createDesign({
        inputParams: {
          canvasSize: { width: 1280, height: 720 }
        },
        callbacks: {
          onCancel: () => {
            console.log('Adobe Express abgebrochen');
            resolve(null);
          },
          onError: (err: any) => {
            console.error('Adobe Express Fehler:', err);
            toast.error('Adobe Express konnte nicht geladen werden.');
            resolve(null);
          },
          onPublish: (publishParams: any) => {
            const { asset } = publishParams;
            if (asset.data instanceof Blob) {
              const url = URL.createObjectURL(asset.data);
              resolve(url);
            } else {
              resolve(asset.data);
            }
          },
        },
      });
    });
  }, [ccEverywhere]);

  const editInAdobe = useCallback(async (imageUrl: string): Promise<string | null> => {
    if (!ccEverywhere) {
      toast.error('Adobe Express is still loading.');
      return null;
    }

    return new Promise((resolve) => {
      ccEverywhere.createDesign({
        inputParams: {
          asset: {
            data: imageUrl,
            dataType: 'url', // or 'base64'
            type: 'image',
          },
        },
        callbacks: {
          onCancel: () => {
            resolve(null);
          },
          onError: (err: any) => {
            console.error('Adobe Express Error:', err);
            toast.error('Adobe Express failed.');
            resolve(null);
          },
          onPublish: (publishParams: any) => {
            const { asset } = publishParams;
            if (asset.data instanceof Blob) {
              const url = URL.createObjectURL(asset.data);
              resolve(url);
            } else {
              resolve(asset.data);
            }
          },
        },
      });
    });
  }, [ccEverywhere]);

  return {
    isInitialized,
    generateWithFirefly,
    editInAdobe,
  };
};

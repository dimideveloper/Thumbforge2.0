import { useState, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useMagnific = () => {
  const [isLoading, setIsLoading] = useState(false);

  const pollTask = async (taskId: string, endpoint: string): Promise<string> => {
    const maxRetries = 60; 
    let retries = 0;

    while (retries < maxRetries) {
      const { data, error } = await supabase.functions.invoke("magnific-ai", {
        body: {
          action: "poll",
          endpoint: endpoint,
          taskId: taskId,
        },
      });

      if (error) {
        console.error("Polling error from Supabase:", error);
        throw new Error(`Polling failed: ${error.message}`);
      }

      const status = data.data?.status || data.status;
      console.log("Magnific Polling Status:", status, data);

      if (status === "COMPLETED" || status === "success") {
        const url = data.data?.generated?.[0] || data.result?.images?.[0]?.url || data.data?.images?.[0]?.url;
        if (url) return url;
        throw new Error("Bild-URL in der Antwort nicht gefunden.");
      }

      if (status === "FAILED" || status === "error") {
        const errorDetail = data.data?.error || data.error;
        throw new Error(errorDetail?.message || data.message || "AI generation failed.");
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      retries++;
    }

    throw new Error("Task timed out.");
  };

  const generateWithMagnific = useCallback(async (prompt: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("magnific-ai", {
        body: {
          action: "start",
          endpoint: "mystic",
          payload: {
            prompt,
            aspect_ratio: "widescreen_16_9",
          },
        },
      });

      if (error) throw new Error(error.message);
      
      console.log("Magnific Start Response (Mystic):", data);

      const taskId = data.data?.task_id || data.task_id || data.id;
      if (!taskId) {
        const errorMsg = data.error?.message || data.message || "Keine Task-ID erhalten.";
        throw new Error(errorMsg);
      }

      toast.info("Magnific is working on your thumbnail...");
      return await pollTask(taskId, "mystic");
    } catch (error: any) {
      console.error("Magnific Generation Error:", error);
      toast.error(`Generation failed: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const editWithMagnific = useCallback(async (imageUrl: string, prompt: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      // WIR NUTZEN JETZT MYSTIC FÜR ECHTES REMIXING STATT NUR UPSCALING
      const { data, error } = await supabase.functions.invoke("magnific-ai", {
        body: {
          action: "start",
          endpoint: "mystic", // Wechsel zu Mystic für echte Veränderungen
          payload: {
            prompt: `Remix this thumbnail: ${prompt}`,
            aspect_ratio: "widescreen_16_9",
            structure_reference_url: imageUrl, // Wir schicken die URL an den Proxy
          },
        },
      });

      if (error) throw new Error(error.message);

      console.log("Magnific Remix Response (Mystic):", data);

      const taskId = data.data?.task_id || data.task_id || data.id;
      if (!taskId) {
        const errorMsg = data.error?.message || data.message || "Keine Task-ID erhalten.";
        throw new Error(errorMsg);
      }

      toast.info("Magnific is remixing your design...");
      return await pollTask(taskId, "mystic");
    } catch (error: any) {
      console.error("Magnific Edit Error:", error);
      toast.error(`Remix failed: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateWithMagnific,
    editWithMagnific,
    isMagnificLoading: isLoading,
  };
};


import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAssistantResponse = async (
  userMessage: string, 
  context: string
): Promise<string> => {
  try {
    // Select the recommended model for Basic Text Tasks based on the guidelines
    const model = 'gemini-3-flash-preview';
    
    const systemInstruction = `
      Eres el Asistente Virtual para la Fuerza de Ventas de CredicardPOS.
      Tu objetivo es ayudar a los vendedores a cerrar Leads, gestionar su Cartera de Clientes y resolver dudas sobre productos.

      Contexto actual: ${context}
      
      Base de Conocimiento (Reglas de Negocio):
      - **Nueva Afiliación (Leads):** Requiere validar RIF en SENIAT, seleccionar banco, validar si el comercio es apto y firma de contrato.
      - **Cliente Existente (Cartera):** Se pueden solicitar terminales adicionales, insumos o cambios de plan. Requiere validar deuda previa.
      - **Inventario:** Los vendedores tienen un stock asignado (en su vehículo/poder) para entrega inmediata.
      - **Precios:** Planes desde $15 (Básico) hasta $32 (Corporativo).
      
      Estilo de respuesta:
      - Sé breve y motivador, enfocado en el cierre de la venta.
      - Si preguntan por un error, da la solución técnica rápida.
      - Si preguntan por un Lead, sugiere acciones de seguimiento (llamar, visitar).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    // Access the extracted text directly via the .text property
    return response.text || "Lo siento, no pude procesar tu solicitud de venta en este momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error de conexión con el asistente de ventas.";
  }
};

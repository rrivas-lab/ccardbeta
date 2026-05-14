// ============================================================================
// CredicardPOS CRM — Asistente Virtual (MOCK LOCAL DETERMINÍSTICO)
// ----------------------------------------------------------------------------
// Antes este archivo invocaba al SDK @google/genai. Para que el prototipo sea
// autónomo y empaquetable sin API Keys de IA, la generación se reemplaza por
// una función determinística que devuelve respuestas mock basadas en reglas.
// No requiere conexión a internet, no requiere claves, no usa LLM.
// ============================================================================

interface AssistantRule {
  match: RegExp;
  reply: (msg: string, context: string) => string;
}

// Base de Conocimiento (Reglas de Negocio) — se mantiene tal cual estaba
// disponible para la fuerza de ventas, pero ahora se sirve localmente.
const KNOWLEDGE = {
  affiliation: 'Nueva Afiliación (Leads): valida RIF en SENIAT (mock), selecciona banco, verifica si el comercio es apto y firma el contrato.',
  portfolio: 'Cliente Existente (Cartera): puedes solicitar terminales adicionales, insumos o cambios de plan. Recuerda validar deuda previa.',
  inventory: 'Inventario: los vendedores cuentan con stock asignado en su vehículo para entrega inmediata. Aplica PEPS/FIFO.',
  pricing: 'Planes desde $15 (Básico) hasta $32 (Corporativo).',
  otp: 'El OTP es obligatorio para formalizar la venta y también la actualización de datos y número de contacto.',
  terminals: 'Reglas finales de autorización de terminales según CRM DEF V.5 — algunos bancos requieren autorización desde 0 terminales (100% Banco, Agrícola, Banca Amiga, BNC). El resto tiene tope entre 5 y 10.',
  inactivity: 'Alerta automática si un equipo no registra transacciones en 15 días. El umbral de 30 días queda como escalamiento parametrizable.',
  programming: 'Cuando el programador certifica la operatividad y registra la carga en AS/400, el sistema cambia el estado del equipo a "Operativo para Entrega".',
  comodato: 'En Comodato no se factura: se registra movimiento entre almacenes, se actualiza inventario en SAP HANA y Odoo (mock), se genera contrato, el cliente acepta términos y se envía bienvenida.'
};

const RULES: AssistantRule[] = [
  { match: /lead|afiliaci[oó]n|nuevo cliente|alta/i,         reply: () => KNOWLEDGE.affiliation },
  { match: /cartera|cliente existente|recompra|adicional/i,  reply: () => KNOWLEDGE.portfolio },
  { match: /inventario|stock|peps|fifo/i,                    reply: () => KNOWLEDGE.inventory },
  { match: /precio|plan|tarifa|cu[aá]nto cuesta/i,           reply: () => KNOWLEDGE.pricing },
  { match: /otp|c[oó]digo de seguridad/i,                    reply: () => KNOWLEDGE.otp },
  { match: /terminal|autorizaci[oó]n|tope/i,                 reply: () => KNOWLEDGE.terminals },
  { match: /inactiv|sin transar|15 d[ií]as|30 d[ií]as/i,     reply: () => KNOWLEDGE.inactivity },
  { match: /programador|as.?400|operativo/i,                 reply: () => KNOWLEDGE.programming },
  { match: /comodato|contrato/i,                             reply: () => KNOWLEDGE.comodato },
  { match: /hola|buen[oa]s|saludos/i,                        reply: () => 'Hola, soy tu asistente de CredicardPOS (mock local). Pregúntame sobre afiliaciones, cartera, inventario, OTP, terminales o comodato.' },
  { match: /gracias/i,                                        reply: () => '¡Con gusto! Recuerda que estoy aquí para ayudarte a cerrar más rápido.' },
  { match: /ayuda|qu[eé] puedes hacer/i,                     reply: () => 'Puedo orientarte en: afiliaciones, cartera, inventario, precios, OTP, reglas de terminal, inactividad, programación AS/400 y comodato.' }
];

const FALLBACK = (context: string) =>
  'No tengo una respuesta automatizada para esa consulta en el modo mock local. ' +
  'Vista actual: ' + (context || 'general') + '. ' +
  'Intenta preguntar por: afiliación, cartera, inventario, OTP, terminales, inactividad, programación o comodato.';

export const generateAssistantResponse = async (
  userMessage: string,
  context: string
): Promise<string> => {
  // Latencia simulada (UX) — no usa red.
  await new Promise(r => setTimeout(r, 400));
  const text = (userMessage || '').trim();
  if (!text) return 'Escribe tu consulta y te oriento.';
  for (const rule of RULES) {
    if (rule.match.test(text)) return rule.reply(text, context);
  }
  return FALLBACK(context);
};

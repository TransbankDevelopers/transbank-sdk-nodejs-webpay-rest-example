module.exports =  class DeferredConstants {
    static INCREASE_AUTHORIZATION_DATE_STEP = {
        step: "Incrementar Plazo para Capturar Monto",
        stepDescription:
        "En este paso podemos aumentar de manera directa el plazo para llevar a cabo la captura de monto previamente autorizado (todas las veces que se necesite). " +
        "Solo es soportado por tarjetas VISA/MASTERCARD (AMEX retornara un error 'Unsupported Operation')"
    };
    static REVERSE_PRE_AUTHORIZATION_AMOUNT_STEP = {
        step: "Reversar Monto Pre-autorizado",
        stepDescription:
        "A diferencia del método refund, esta operación actúa sobre los montos pre-autorizados y no sobre los montos ya capturados. " +
        "Por lo tanto, esta operación permitirá disminuir de manera directa el monto previamente autorizado, tanto de forma parcial (todas las veces que lo necesite), como total. " +
        "Solo es soportado por tarjetas VISA/MASTERCARD (AMEX retornara un error 'Unsupported Operation')"
    };
    static INCREASE_AMOUNT_STEP = {
        step: "Incrementar Monto Pre-autorizado",
        stepDescription:
        "En este paso podemos aumentar de manera directa el monto previamente pre-autorizado (todas las veces que se necesite). " +
        "La transacción no debe haber sido capturada. Solo es soportado por tarjetas VISA/MASTERCARD (AMEX retornara un error 'Unsupported Operation')"
    };
    static DEFERRED_cAPTURE_HISTORY_STEP = {
        step: "Historial de transacciones captura diferida",
        stepDescription:
        "Permite visualizar el historial de operaciones ejecutadas sobre una pre-autorización de captura diferida",
    }
}


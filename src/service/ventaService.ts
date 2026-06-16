// src/services/ventaService.ts
import type {
    CreatePagoDto,
    CreateVentaDto,
    PagoResponse,
    VentaResponse,
    ProcesamientoVenta,
    DesgloseBilletes,
    ProductoCarrito,
} from '../types/venta.types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ───────────────────────────────────────────────────────────────
// ERROR HANDLER
// ───────────────────────────────────────────────────────────────
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || errorData.error || `Error ${response.status}: ${response.statusText}`;
        throw new Error(message);
    }
    return response.json();
};

// ───────────────────────────────────────────────────────────────
// 1. CREAR PAGO (POST /pago)
// ───────────────────────────────────────────────────────────────
export const crearPago = async (pagoDto: CreatePagoDto): Promise<PagoResponse> => {
    const response = await fetch(`${API_URL}/pago`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pagoDto),
    });
    return handleResponse<PagoResponse>(response);
};

// ───────────────────────────────────────────────────────────────
// 2. CREAR VENTA (POST /venta)
// ───────────────────────────────────────────────────────────────
export const crearVenta = async (ventaDto: CreateVentaDto): Promise<VentaResponse> => {
    const response = await fetch(`${API_URL}/venta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaDto),
    });
    return handleResponse<VentaResponse>(response);
};

// ───────────────────────────────────────────────────────────────
// 3. PROCESAR VENTA COMPLETA (Pago + Venta + Stock + Kardex)
//    Esta función orquesta TODO el flujo
// ───────────────────────────────────────────────────────────────
export interface ProcesarVentaParams {
    // Datos del pago
    metodoPago: 'efectivo' | 'transferencia' | 'credito';
    montoPagado: number;
    desglose?: DesgloseBilletes;
    montoPagar?: number;
    cambio?: number;
    clienteId?: string;  // Para crédito

    // Datos de la venta
    clienteIdVenta: string;  // ID del cliente para la venta
    productosCarrito: ProductoCarrito[];
    subtotal: number;
    descuentoTotal: number;
    impuesto: number;
}

export const procesarVentaCompleta = async (
    params: ProcesarVentaParams
): Promise<ProcesamientoVenta> => {
    try {
        // ── PASO 1: Crear el Pago ──────────────────────────────
        const pagoDto: CreatePagoDto = {
            metodoPago: params.metodoPago,
            monto_pagado: params.montoPagado,
        };

        // Agregar campos específicos según método
        if (params.metodoPago === 'efectivo') {
            if (!params.desglose || !params.montoPagar || params.cambio === undefined) {
                return {
                    exito: false,
                    mensaje: 'Faltan datos para el pago en efectivo (desglose, monto a pagar o cambio)',
                };
            }
            pagoDto.desglose = params.desglose;
            pagoDto.monto_pagar = params.montoPagar;
            pagoDto.cambio = params.cambio;
        } else if (params.metodoPago === 'credito') {
            if (!params.clienteId) {
                return {
                    exito: false,
                    mensaje: 'El cliente es obligatorio para pagos a crédito',
                };
            }
            pagoDto.clienteId = params.clienteId;
        }

        const pagoCreado = await crearPago(pagoDto);

        // ── PASO 2: Preparar items de venta ───────────────────
        const itemsVenta = params.productosCarrito.map(item => ({
            productoId: item.id,
            cantidad: item.cantidad,
            descuentoMonto: item.precio * item.cantidad * (item.descuento / 100),
        }));

        // ── PASO 3: Crear la Venta ─────────────────────────────
        const ventaDto: CreateVentaDto = {
            clienteId: params.clienteIdVenta,
            productos: itemsVenta,
            subtotal_venta: params.subtotal,
            descuento_total: params.descuentoTotal,
            impuesto: params.impuesto,
            pago: pagoCreado._id,
        };

        const ventaCreada = await crearVenta(ventaDto);

        // ── ÉXITO ──────────────────────────────────────────────
        return {
            exito: true,
            mensaje: 'Venta procesada exitosamente',
            venta: ventaCreada,
            pago: pagoCreado,
        };

    } catch (error) {
        const mensaje = error instanceof Error ? error.message : 'Error desconocido al procesar la venta';
        return {
            exito: false,
            mensaje,
        };
    }
};

// ───────────────────────────────────────────────────────────────
// 4. HELPERS: Convertir datos del frontend al formato DTO
// ───────────────────────────────────────────────────────────────

/**
 * Convierte el desglose de billetes del dialog al formato del backend
 */
export const convertirDesgloseBilletes = (
    pagoData: Record<string, string>  // keys como 'billetes_5000', etc.
): DesgloseBilletes => ({
    billete5000: parseInt(pagoData['billestes_5000'] || '0'),
    billete2000: parseInt(pagoData['billetes_2000'] || '0'),
    billete1000: parseInt(pagoData['billetes_1000'] || '0'),
    billete500: parseInt(pagoData['billetes_500'] || '0'),
    billete200: parseInt(pagoData['billetes_200'] || '0'),
    billete100: parseInt(pagoData['billetes_100'] || '0'),
    billete50: parseInt(pagoData['billetes_50'] || '0'),
    billete20: parseInt(pagoData['billetes_20'] || '0'),
    billete10: parseInt(pagoData['billetes_10'] || '0'),
    billete5: parseInt(pagoData['billetes_5'] || '0'),
    billete3: parseInt(pagoData['billetes_3'] || '0'),
    billete1: parseInt(pagoData['billetes_1'] || '0'),
});

/**
 * Calcula el total de un desglose de billetes
 */
export const calcularTotalDesglose = (desglose: DesgloseBilletes): number => {
    return (
        (desglose.billete5000 || 0) * 5000 +
        (desglose.billete2000 || 0) * 2000 +
        (desglose.billete1000 || 0) * 1000 +
        (desglose.billete500 || 0) * 500 +
        (desglose.billete200 || 0) * 200 +
        (desglose.billete100 || 0) * 100 +
        (desglose.billete50 || 0) * 50 +
        (desglose.billete20 || 0) * 20 +
        (desglose.billete10 || 0) * 10 +
        (desglose.billete5 || 0) * 5 +
        (desglose.billete3 || 0) * 3 +
        (desglose.billete1 || 0) * 1
    );
};

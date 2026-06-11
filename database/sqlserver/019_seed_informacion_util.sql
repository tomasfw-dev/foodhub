/*
  Bendita-Comida — Datos iniciales de información útil
  Ejecutar después de 018_schema_informacion_util.sql
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ZonasEntrega)
BEGIN
    INSERT INTO dbo.ZonasEntrega (nombre_zona, descripcion, costo_envio, activo, orden)
    VALUES
        (N'Centro', N'Entrega en el microcentro y alrededores.', 1500.00, 1, 1),
        (N'Zona Norte', N'Barrios del norte de la ciudad.', 2500.00, 1, 2),
        (N'Zona Sur', N'Consultá disponibilidad por WhatsApp.', 3000.00, 1, 3);

    PRINT 'Zonas de entrega de ejemplo insertadas.';
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.FormasPago)
BEGIN
    INSERT INTO dbo.FormasPago (nombre, descripcion, activo, orden)
    VALUES
        (N'Efectivo', N'Pagás al recibir tu pedido.', 1, 1),
        (N'Transferencia', N'Te enviamos alias/CBU al confirmar el pedido.', 1, 2),
        (N'Mercado Pago', N'Link de pago seguro antes o al momento de la entrega.', 1, 3);

    PRINT 'Formas de pago de ejemplo insertadas.';
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.PreguntasFrecuentes)
BEGIN
    INSERT INTO dbo.PreguntasFrecuentes (pregunta, respuesta, activo, orden)
    VALUES
        (
            N'¿Cuánto tarda la entrega?',
            N'El tiempo estimado es de 45 a 90 minutos según la zona y la demanda del momento.',
            1,
            1
        ),
        (
            N'¿Puedo retirar el pedido?',
            N'Sí, podés retirar en nuestro local sin costo de envío. Coordiná el horario por WhatsApp.',
            1,
            2
        ),
        (
            N'¿Hacen pedidos para eventos?',
            N'Consultanos con anticipación por WhatsApp para armar un menú a medida.',
            1,
            3
        );

    PRINT 'Preguntas frecuentes de ejemplo insertadas.';
END
GO

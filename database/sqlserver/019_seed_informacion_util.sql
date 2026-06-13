/*
  Información útil — datos demo neutros
  Ejecutar después de 018_schema_informacion_util.sql
*/

SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ZonasEntrega)
BEGIN
    INSERT INTO dbo.ZonasEntrega (nombre_zona, descripcion, costo_envio, activo, orden)
    VALUES
        (N'Zona 1', N'Consultá cobertura con el local.', 1500.00, 1, 1),
        (N'Zona 2', N'Consultá cobertura con el local.', 2500.00, 1, 2);

    PRINT 'Zonas de entrega demo insertadas.';
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.FormasPago)
BEGIN
    INSERT INTO dbo.FormasPago (nombre, descripcion, activo, orden)
    VALUES
        (N'Efectivo', N'Pagás al recibir tu pedido.', 1, 1),
        (N'Transferencia', N'Te enviamos los datos al confirmar el pedido.', 1, 2),
        (N'Mercado Pago', N'Link de pago seguro.', 1, 3);

    PRINT 'Formas de pago demo insertadas.';
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.PreguntasFrecuentes)
BEGIN
    INSERT INTO dbo.PreguntasFrecuentes (pregunta, respuesta, activo, orden)
    VALUES
        (
            N'¿Cómo hago un pedido?',
            N'Elegí productos del menú y envianos tu pedido por WhatsApp.',
            1,
            1
        ),
        (
            N'¿Puedo retirar en el local?',
            N'Sí, coordiná el horario de retiro por WhatsApp.',
            1,
            2
        ),
        (
            N'¿Cuáles son los medios de pago?',
            N'Consultá la sección Formas de pago o escribinos por WhatsApp.',
            1,
            3
        );

    PRINT 'Preguntas frecuentes demo insertadas.';
END
GO

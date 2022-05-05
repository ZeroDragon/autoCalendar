Autocalendar
=============

Cansado de que te pongan juntas en el mismo día? Ya tienes un calendario de google y quieres que
se bloquee para que no te puedan poner eventos en el mismo día?

Este script lee tu calendario de google y luego determina que horas tienes aun libres en el día.
Si encuentra horarios libres en tu calendario principal para en algún momento en el resto del día
corriente, generará eventos de una hora en cada espacio disponible para el resto del día.

Esto no afecta algún día a futuro, solo afecta el día corriente

## Instalación
- Necesitas una cuenta de oauth de google y node
- Descarga tu secrets.json de google cloud config y guárdalo como `secrets.json` en la raíz del repo
- `npm install`

## Forma de uso
Para iniciar, solo typea `node index.js`
Si es la primera vez, el script te pedirá que hagas login y luego el código de validación

Después de eso, ya no hay que hacer nada, cada día entra y corre `node index.js` y te rellenará
el calendario con eventos para el resto del día

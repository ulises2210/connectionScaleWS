#!/bin/bash

# Obtener la dirección del dispositivo USB de la impresora Zebra
IMPRESORA=$(lpinfo -v | grep "usb://Zebra")

# Reemplazar la cadena 'direct ' por una cadena vacía
PRINTER="${IMPRESORA/direct /}"

# Eliminar la impresora existente, si existe
lpadmin -x zebra_local

# Instalar la impresora con el archivo PPD correspondiente
lpadmin -p zebra_local -E -v "$PRINTER" -m drv:///sample.drv/zebraep2.ppd -o media=oe_w288h216_4x3in

echo "Impresora instalada"




# IMPRESORA=lpinfo -v | grep "usb://Zebra"
# REPLACE=""

# echo "${IMPRESORA/direct /$REPLACE}"

# PRINTER="${IMPRESORA/direct /$REPLACE}"

# lpadmin -x zebra_local

# INSTALAR=lpadmin -p zebra_local -E -v $PRINTER -m drv:///sample.drv/zebraep2.ppd -o media=oe_w288h216_4x3in
# # usb://Zebra%20Technologies/ZTC%20ZD421-203dpi%20ZPL?serial=D6N233751384

# echo "$INSTALAR"

# echo "impresora instalada"
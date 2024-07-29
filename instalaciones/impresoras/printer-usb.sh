#!/bin/bash
IMPRESORA=`lpinfo -v | grep "usb://Zebra"`
REPLACE=""

echo "${IMPRESORA/direct /$REPLACE}"

PRINTER="${IMPRESORA/direct /$REPLACE}"

lpadmin -x zebra_local

INSTALAR=`lpadmin -p zebra_local -E -v $PRINTER -m drv:///sample.drv/zebraep2.ppd -o media=oe_w288h216_4x3in`

echo "$INSTALAR"

echo "impresora instalada"
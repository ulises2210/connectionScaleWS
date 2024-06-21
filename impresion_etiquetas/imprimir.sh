#!/bin/bash

#Nota: eliminar impresora : lpadmin -x "zebraInspeccionPlano1" (nombre imprsora, cambiar a la quie esta instalada) 


# nota : instalar impresora por drivers , cambiar el nombre de la impresora
lpadmin -p zebraTermicaRfidTrade -E -v socket://192.168.23.86:9100 -m drv:///sample.drv/zebraep2.ppd

#nota : mandar a imprimir a la impresora 
lp -d zebraTermicaTestOfi -o fit-to-page /home/developer/connectionScaleWS/etiquetasSkyYarn
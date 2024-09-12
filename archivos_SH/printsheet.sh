#!/bin/bash
cupsenable sheetLocal
sleep 1
cupsdisable sheetLocal
sleep 1
cupsenable sheetLocal
sleep 1
lp -d sheetLocal -o fit-to-page -q 100  /home/developer/conexion-bascula/public/sheet.pdf
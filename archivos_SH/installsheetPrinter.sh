#!/bin/bash

# lpadmin -x sheetLocal

lpadmin -x sheetLocal
sleep 1
lpadmin -p sheetLocal -E -v ipp://HP%20LaserJet%20M406._ipp._tcp.local/ -m drv:///sample.drv/generic.ppd 
# lpadmin -p sheetLocal -E -v ipp://HP%20LaserJet%20M406._ipp._tcp.local/ -m everywhere 
sleep 1
cupsenable sheetLocal


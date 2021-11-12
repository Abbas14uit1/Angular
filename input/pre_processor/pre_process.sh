#!/bin/sh
/usr/bin/python baseball/preprocess_baseball.py -u ../TAMU/Baseball/ -o ../TAMU/Baseball_Preprocessed/ -t MBA > ../TAMU/Baseball_Preprocessed/run.log 
/usr/bin/python baseball/preprocess_baseball.py -u ../TAMU/Softball/ -o ../TAMU/Softball_Preprocessed/ -t WSB > ../TAMU/Softball_Preprocessed/run.log 
/usr/bin/python football/preprocess_football.py -u ../TAMU/Football/ -o ../TAMU/Football_Preprocessed/ -t MFB > ../TAMU/Football_Preprocessed/run.log 
/usr/bin/python basketball/preprocess_basketball.py -u  ../TAMU/MenBasketball/ -o ../TAMU/MenBasketball_Preprocessed/ -c MBB > ../TAMU/MenBasketball_Preprocessed/run.log
/usr/bin/python basketball/preprocess_basketball.py -u  ../TAMU/WomenBasketball/ -o ../TAMU/WomenBasketball_Preprocessed/ -c WBB > ../TAMU/WomenBasketball_Preprocessed/run.log

/usr/bin/python baseball/preprocess_baseball.py -u ../UA/Baseball/ -o ../UA/Baseball_Preprocessed/ -t MBA > ../UA/Baseball_Preprocessed/run.log 
/usr/bin/python baseball/preprocess_baseball.py -u ../UA/Softball/ -o ../UA/Softball_Preprocessed/ -t WSB > ../UA/Softball_Preprocessed/run.log 
/usr/bin/python football/preprocess_football.py -u ../UA/Football/ -o ../UA/Football_Preprocessed/ -t MFB > ../UA/Football_Preprocessed/run.log 
/usr/bin/python basketball/preprocess_basketball.py -u  ../UA/MenBasketball/ -o ../UA/MenBasketball_Preprocessed/ -c MBB > ../UA/MenBasketball_Preprocessed/run.log
# /usr/bin/python basketball/preprocess_basketball.py -u  ../TAMU/WomenBasketball/ -o ../TAMU/WomenBasketball_Preprocessed/ -c WBB > ../TAMU/WomenBasketball_Preprocessed/run.log


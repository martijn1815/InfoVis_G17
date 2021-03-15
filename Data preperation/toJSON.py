#!/usr/bin/python3
"""
Created on 15/03/2021
Author: Martijn Schendstok
"""

import sys
import csv


def main(argv):
    with open('Data/filtered_data.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count == 0:
                print("{}".format(", ".join(row)))
                line_count += 1
            else:
                line_count += 1
        print(f'Processed {line_count} lines.')


if __name__ == "__main__":
    main(sys.argv)

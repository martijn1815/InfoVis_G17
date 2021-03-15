#!/usr/bin/python3
"""
Created on 15/03/2021
Author: Martijn Schendstok
"""

import sys
import pandas as pd


def main(argv):
    df = pd.read_csv('Data/Merged_Verkiezingsuitslag.csv')
    df = df.groupby(['Year', 'OuderRegioNaam']).sum()

    json_text = '{\n' \
                '"name": "verkiezingsuitslag",\n' \
                '"children": [\n'

    year = 0
    for index, row in df.iterrows():
        #print(index[0], index[1])
        if index[0] != year:
            if year != 0:
                json_text += '\n]\n},\n'
            json_text += '{{\n' \
                         '"name": "{0}",\n' \
                         '"children": [\n'.format(index[0])
            year = index[0]
        else:
            json_text += ',\n'

        json_text += '{{\n' \
                     '"name": "{0}",\n' \
                     '"children": ['.format(index[1])

        json_text += ']\n}'

    json_text += '\n]\n}\n]\n}'

    print(json_text)

    with open("data.json", "w+") as f:
        f.write(json_text)


if __name__ == "__main__":
    main(sys.argv)

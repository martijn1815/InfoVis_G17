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

    columns = list(df.columns)
    info_columns = columns[:6]
    party_columns = columns[6:]

    json_text = '{\n' \
                '"name": "verkiezingsuitslag",\n' \
                '"children": [\n'

    year = 0
    for index, row in df.iterrows():
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
                     '"name": "{0}",\n'.format(index[1])

        for column in info_columns:
            json_text += '"{0}": {1},\n'.format(column, row[column])

        json_text += '"children": ['

        for column in party_columns:
            #if row[column] != 0:  # Can set a threshold here
                json_text += '\n{{"name": "{0}", "votes": {1}}},'.format(column, row[column])

        json_text = json_text[:-1] + '\n]\n}'

    json_text += '\n]\n}\n]\n}'

    with open("data.json", "w+") as f:
        f.write(json_text)


if __name__ == "__main__":
    main(sys.argv)

#!/usr/bin/python3
"""
Created on 15/03/2021
Author: Martijn Schendstok
"""

import sys
import pandas as pd
from collections import defaultdict


def main(argv):
    print("Loading Data:", end="\t")

    df = pd.read_csv('Data/merged_verkiezingsuitslag1.csv')
    df = df.groupby(['Year', 'OuderRegioNaam']).sum()

    parties = defaultdict(list)
    with open("parties.csv", "r", encoding='utf-8-sig') as f:
        for line in f:
            elements = line.strip().split(";")
            parties[elements[1]].append(elements[0])

    columns = list(df.columns)
    info_columns = columns[:6]
    party_columns = columns[6:]

    print("Done")
    print("Making JSON-File:", end="\t")

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
            if column == "GeldigeStemmen":
                json_text += '"votes": {1},\n'.format(column, row[column])
            json_text += '"{0}": {1},\n'.format(column, row[column])

        json_text += '"children": ['

        #for column in party_columns:
        #    #if row[column] != 0:  # Can set a threshold here
        #        json_text += '\n{{"name": "{0}", "votes": {1}}},'.format(column, row[column])

        for key in parties:
            votes_count = 0
            json_text += '\n{{\n' \
                         '"name": "{0}",\n' \
                         '"children": ['.format(key)

            for party in parties[key]:
                json_text += '\n{{"name": "{0}", "votes": {1}, "votes2": {1}}},'.format(party, row[party])
                votes_count += row[party]

            json_text = json_text[:-1] + '\n],\n'
            json_text += '"votes": {0}\n}},'.format(votes_count)

        json_text = json_text[:-1] + '\n]\n}'

    json_text += '\n]\n}\n]\n}'

    print("Done")
    print("Writing JSON-File:", end="\t")

    with open("data.json", "w+") as f:
        f.write(json_text)

    print("Done")


if __name__ == "__main__":
    main(sys.argv)

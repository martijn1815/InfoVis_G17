from flask import render_template, request, jsonify
import os, json

from decimal import Decimal

import pandas as pd
import numpy as np

from app import data
from . import main


@main.route('/', methods=['GET'])
def index():
	return render_template("home.html")





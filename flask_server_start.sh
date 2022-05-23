#!/bin/bash

cd ${FLASK_PATH}

${PYTHON_PATH} /home/irisowner/.local/bin/gunicorn --bind "0.0.0.0:8080" wsgi:app -w 4 2>&1

exit 1
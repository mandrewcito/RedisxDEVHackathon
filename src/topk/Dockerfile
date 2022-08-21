FROM python:3.10-alpine3.16

WORKDIR /code

RUN apk update
RUN apk add build-base

RUN pip install --upgrade pip

COPY ./requirements.txt /code/requirements.txt

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./ /code/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "80"]
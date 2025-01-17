FROM python:3.12 AS python-with-poetry
RUN pip install poetry==1.8.3

FROM python-with-poetry AS build-confmod-lib
WORKDIR /confmod/lib
COPY confmod/ .
RUN poetry install
RUN poetry build

FROM python-with-poetry AS build-confmod-app
WORKDIR /confmod/app
COPY --from=build-confmod-lib /confmod/lib/ /confmod
COPY confmod-app/backend .
RUN poetry install
EXPOSE 8080
CMD [ "poetry", "run", "python", "main.py" ]
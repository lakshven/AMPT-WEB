#!/bin/bash

export DATABASE_URL=$(az keyvault secret show \
--vault-name ecslkeyvault \
--name database-url \
--query value -o tsv)

pm2 restart AMPT-backend

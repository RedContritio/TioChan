# TioChan
Tio Chan as QQ robot

## Install 

```bash
sudo apt-get install docker.io
sudo apt-get install nodejs 
# Assert your nodejs version is 16.x
npm install -g typescript ts-node

npm install
npm run docker:build
```

## Execute

```bash
# foreground
npm start

# background
npm run docker:deploy
```

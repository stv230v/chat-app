FROM node:24-alpine

WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./
# yarnを使用する場合
# COPY yarn.lock ./

# 依存関係をインストール
RUN npm install
# yarnを使用する場合
# RUN yarn install

# ソースコードをコピー
COPY . .

# 開発用サーバーを起動
CMD ["npm", "run", "dev"]
# yarnを使用する場合
# CMD ["yarn", "dev"]
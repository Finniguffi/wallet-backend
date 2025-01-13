FROM node:23-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

FROM node:23-alpine

WORKDIR /app

COPY --from=build /app /app

EXPOSE 3000

CMD ["yarn", "start:prod"]

build:
	docker build -t telegram-bot .

run:
	docker run -d -p 5000:5000 --name tgbot --rm telegram-bot
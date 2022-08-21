run:
	docker-compose -p "my-hack-redis" up --build

clean:
	@find . -name "*.pyc" -exec rm -f '{}' +
	@find . -name "__pycache__" -exec rm -R -f '{}' +
	@echo "Done!"
SHELL := /bin/sh

PORT ?= 9393
PID_FILE := .app.pid
LOG_FILE := .app.log

.PHONY: install start stop status

install:
	@echo "Installing gems..."
	@asdf exec bundle install

start: install
	@if [ -f "$(PID_FILE)" ] && kill -0 "$$(cat "$(PID_FILE)")" 2>/dev/null; then \
		echo "App already running (pid $$(cat "$(PID_FILE)")) on port $(PORT)"; \
		exit 0; \
	fi
	@echo "Starting app on port $(PORT)..."
	@nohup asdf exec bundle exec rackup -p $(PORT) > "$(LOG_FILE)" 2>&1 & echo $$! > "$(PID_FILE)"
	@sleep 1
	@if kill -0 "$$(cat "$(PID_FILE)")" 2>/dev/null; then \
		echo "App started (pid $$(cat "$(PID_FILE)"))"; \
		echo "Logs: $(LOG_FILE)"; \
	else \
		echo "Failed to start app. Check $(LOG_FILE)"; \
		rm -f "$(PID_FILE)"; \
		exit 1; \
	fi

stop:
	@if [ ! -f "$(PID_FILE)" ]; then \
		echo "App not running (no PID file)"; \
		exit 0; \
	fi
	@PID="$$(cat "$(PID_FILE)")"; \
	if kill -0 "$$PID" 2>/dev/null; then \
		echo "Stopping app (pid $$PID)..."; \
		kill "$$PID"; \
		rm -f "$(PID_FILE)"; \
		echo "App stopped"; \
	else \
		echo "Process $$PID not running; cleaning stale PID file"; \
		rm -f "$(PID_FILE)"; \
	fi

status:
	@if [ -f "$(PID_FILE)" ] && kill -0 "$$(cat "$(PID_FILE)")" 2>/dev/null; then \
		echo "App running (pid $$(cat "$(PID_FILE)"))"; \
	else \
		echo "App not running"; \
	fi

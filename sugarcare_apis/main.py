import uvicorn
import logging
from pathlib import Path
import sys
import os
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))
from config.settings import settings
from config.logger import initialize_logging, get_logger
from api.updated_routes import create_app
initialize_logging()
logger = get_logger(__name__)
app = create_app()

def main():
    try:
        config_errors = settings.validate_config()
        if config_errors:
            logger.error('Configuration validation failed:')
            for error in config_errors:
                logger.error(f'  - {error}')
            sys.exit(1)
        settings.create_directories()
        app = create_app()
        logger.info('=' * 50)
        logger.info('SugarCare Backend API Starting')
        logger.info('=' * 50)
        logger.info(f'Environment: {settings.ENVIRONMENT}')
        logger.info(f'Debug Mode: {settings.DEBUG}')
        logger.info(f'API Host: {settings.API_HOST}')
        logger.info(f'API Port: {settings.API_PORT}')
        logger.info(f'API Prefix: {settings.API_PREFIX}')
        logger.info('=' * 50)
        uvicorn.run(app, host=settings.API_HOST, port=settings.API_PORT, log_level=settings.LOG_LEVEL.lower(), access_log=True, reload=settings.DEBUG, workers=1 if settings.DEBUG else 4)
    except KeyboardInterrupt:
        logger.info('Application interrupted by user')
    except Exception as e:
        logger.error(f'Failed to start application: {str(e)}', exc_info=True)
        sys.exit(1)

def create_development_server():
    logger.info('Starting development server with hot reload')
    app = create_app()
    config = uvicorn.Config(app, host=settings.API_HOST, port=settings.API_PORT, log_level=settings.LOG_LEVEL.lower(), reload=True, reload_dirs=[str(current_dir)], access_log=True)
    server = uvicorn.Server(config)
    return server

def run_linting():
    import subprocess
    import sys
    logger.info('Running code linting...')
    try:
        result = subprocess.run([sys.executable, '-m', 'flake8', '.', '--max-line-length=100', '--ignore=E203,W503'], cwd=current_dir)
        if result.returncode == 0:
            logger.info('Linting passed!')
        else:
            logger.error('Linting failed!')
            sys.exit(result.returncode)
    except Exception as e:
        logger.error(f'Error running linting: {str(e)}')
        sys.exit(1)

def run_formatting():
    import subprocess
    import sys
    logger.info('Running code formatting...')
    try:
        result = subprocess.run([sys.executable, '-m', 'black', '.', '--line-length=100'], cwd=current_dir)
        if result.returncode == 0:
            logger.info('Code formatting completed!')
        else:
            logger.error('Code formatting failed!')
            sys.exit(result.returncode)
    except Exception as e:
        logger.error(f'Error running formatting: {str(e)}')
        sys.exit(1)

def show_help():
    help_text = '\nSugarCare Backend API\n\nUsage: python main.py [command]\n\nCommands:\n  run          Start the API server (default)\n  dev          Start development server with hot reload\n  test         Run the test suite\n  lint         Run code linting\n  format       Run code formatting\n  help         Show this help message\n\nEnvironment Variables:\n  DEBUG                Enable debug mode (default: False)\n  ENVIRONMENT          Environment (development/production)\n  API_HOST             API host (default: 0.0.0.0)\n  API_PORT             API port (default: 8000)\n  DATABASE_URL         Database connection URL\n  REDIS_URL            Redis connection URL\n  SECRET_KEY           Secret key for JWT tokens\n  LOG_LEVEL            Logging level (default: INFO)\n\nExamples:\n  python main.py                    # Start production server\n  python main.py dev                # Start development server\n  python main.py test               # Run tests\n  DEBUG=True python main.py dev     # Start debug mode\n  API_PORT=9000 python main.py      # Start on port 9000\n'
    print(help_text)
if __name__ == '__main__':
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        if command == 'dev':
            server = create_development_server()
            server.run()
        elif command == 'lint':
            run_linting()
        elif command == 'format':
            run_formatting()
        elif command == 'help':
            show_help()
        else:
            print(f'Unknown command: {command}')
            show_help()
            sys.exit(1)
    else:
        main()
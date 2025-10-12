package config

import (
	"fmt"
	"log"
	"os"
	"sync"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL string
	RedisURL    string
	Port        string
}

var (
	config *Config
	once   sync.Once
)

// Load initializes the configuration by loading the .env file.
// It uses a singleton pattern to ensure the .env file is loaded only once.
func Load() *Config {
	once.Do(func() {
		// Load .env file from config directory
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found")
		}
		

		config = &Config{
			DatabaseURL:  os.Getenv("DATABASE_URL"),
			RedisURL:    os.Getenv("REDIS_URL",),
			Port:        os.Getenv("PORT",),
		}
		fmt.Println(config)
		// Validate required variables
		if config.DatabaseURL == "" {
			log.Fatal("DATABASE_URL is required")
		}
	})

	return config
}
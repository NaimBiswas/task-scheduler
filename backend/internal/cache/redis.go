package cache

import (
	"context"
	"encoding/json"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	Client *redis.Client
}

type DashboardMetrics struct {
	TotalEvents int64 `json:"total_events"`
	Completed   int64 `json:"completed"`
	Overdue     int64 `json:"overdue"`
}

func NewRedisCache(addr string) *RedisCache {
	client := redis.NewClient(&redis.Options{
		Addr: addr,
	})
	return &RedisCache{Client: client}
}

func (c *RedisCache) GetDashboardMetrics(ctx context.Context) (*DashboardMetrics, error) {
	val, err := c.Client.Get(ctx, "dashboard_metrics").Result()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var metrics DashboardMetrics
	if err := json.Unmarshal([]byte(val), &metrics); err != nil {
		return nil, err
	}
	return &metrics, nil
}

func (c *RedisCache) SetDashboardMetrics(ctx context.Context, metrics *DashboardMetrics, ttl time.Duration) error {
	data, err := json.Marshal(metrics)
	if err != nil {
		return err
	}
	return c.Client.Set(ctx, "dashboard_metrics", data, ttl).Err()
}

func (c *RedisCache) Close() error {
	return c.Client.Close()
}
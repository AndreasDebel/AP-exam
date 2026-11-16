using Npgsql;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// OpenTelemetry
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService("eventbooking-api"))
    .WithMetrics(m => m
        .AddMeter("Microsoft.AspNetCore.Hosting") // tager de HTTP-metrics med, som ASP.NET Core selv måler
        .AddPrometheusExporter());

// The Blazor UI runs on another port, so the browser only lets it call us if we allow it (CORS).
// Dropped on purpose: any origin is allowed. Production would allow only the UI's address.
builder.Services.AddCors();

var app = builder.Build();
app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());

// Prometheus
app.MapPrometheusScrapingEndpoint() // serverer /metrics
    .DisableHttpMetrics(); // gør, at Prometheus’ egne scrapes af /metrics ikke tælles med i vores request-tal

// Router: section id -> connection string
var router = builder.Configuration.GetSection("Sections").Get<Dictionary<string, string>>()!;

// Cache switch: issue #10 flips it to compare cache off/on.
var cacheEnabled = builder.Configuration.GetValue<bool>("CacheEnabled");

// One Redis connection, opened once at startup and shared by every request.
// Unlike the Postgres connections below (one per request), this is how StackExchange.Redis is meant to be used.
// Dropped on purpose: connecting only when the cache is on. So the API needs Redis to start, even with the cache off.
var redis = ConnectionMultiplexer.Connect(builder.Configuration["Redis"]!).GetDatabase();

app.MapGet("/sections/{id:int}", async (int id) =>
{
    var key = $"availability:{id}";

    if (cacheEnabled)
    {
        // LOOK HERE! Asks the shared Redis pod (k8s/deployments/redis.yaml, reached through k8s/services/redis.yaml).
        var cached = await redis.StringGetAsync(key);
        if (cached.HasValue)
        {
            return Results.Ok(new { id, free = (int)cached });
        }
    }

    await using var conn = new NpgsqlConnection(router[id.ToString()]);
    await conn.OpenAsync();

    await using var cmd = new NpgsqlCommand("SELECT capacity - sold FROM section WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("id", id);
    var free = (int)(await cmd.ExecuteScalarAsync())!;

    if (cacheEnabled)
    {
        // The 2-second expiry is the only invalidation: buy does not clear this key.
        // That is safe: a stale number can only make buy answer 409, because buy re-checks Postgres under a row lock.
        await redis.StringSetAsync(key, free, TimeSpan.FromSeconds(2));
    }

    return Results.Ok(new { id, free });
});

app.MapPost("/sections/{id:int}/buy", async (int id, BuyRequest req) =>
{
    await using var conn = new NpgsqlConnection(router[id.ToString()]);
    await conn.OpenAsync();
    await using var tx = await conn.BeginTransactionAsync();

    // Buy deliberately reads Postgres, never Redis: the row lock (FOR UPDATE) is what prevents overselling.
    await using var select = new NpgsqlCommand("SELECT capacity - sold FROM section WHERE id = @id FOR UPDATE", conn, tx);
    select.Parameters.AddWithValue("id", id);
    var free = (int)(await select.ExecuteScalarAsync())!;

    if (free < req.Count)
    {
        await tx.RollbackAsync();
        return Results.Conflict($"only {free} places left");
    }

    await using var update = new NpgsqlCommand("UPDATE section SET sold = sold + @n WHERE id = @id", conn, tx);
    update.Parameters.AddWithValue("n", req.Count);
    update.Parameters.AddWithValue("id", id);
    await update.ExecuteNonQueryAsync();

    await tx.CommitAsync();
    return Results.Ok();
});

app.Run();

record BuyRequest(int Count);
using Npgsql;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;

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

app.MapGet("/sections/{id:int}", async (int id) =>
{
    await using var conn = new NpgsqlConnection(router[id.ToString()]);
    await conn.OpenAsync();

    await using var cmd = new NpgsqlCommand("SELECT capacity - sold FROM section WHERE id = @id", conn);
    cmd.Parameters.AddWithValue("id", id);
    var free = (int)(await cmd.ExecuteScalarAsync())!;

    return Results.Ok(new { id, free });
});

app.MapPost("/sections/{id:int}/buy", async (int id, BuyRequest req) =>
{
    await using var conn = new NpgsqlConnection(router[id.ToString()]);
    await conn.OpenAsync();
    await using var tx = await conn.BeginTransactionAsync();

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
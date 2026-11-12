using System.Collections.Concurrent;   
using System.Diagnostics;              
using System.Net.Http.Json;

var mode = args[0];                  // "reads" eller "writes"
var workers = int.Parse(args[1]);       // antal parallelle workers
var seconds = int.Parse(args[2]);       // varighed i sekunder
var baseUrl = args[3];               // fx "http://localhost:5133"

var http = new HttpClient { BaseAddress = new Uri(baseUrl) };
var end = DateTime.UtcNow.AddSeconds(seconds);

var times = new ConcurrentBag<double>();   // svartider i ms
var refusals = 0;                          // antal 409

var tasks = Enumerable.Range(0, workers).Select(async worker =>
{
    while (DateTime.UtcNow < end)
    {
        var section = Random.Shared.Next(1, 5);   // 1–4

        var sw = Stopwatch.StartNew();
        HttpResponseMessage response;

        if (mode == "reads")
        {
            response = await http.GetAsync($"/sections/{section}");
        }
        else
        {
            // LOOK HERE! POST /sections/{id}/buy
            response = await http.PostAsJsonAsync($"/sections/{section}/buy", new { name = $"worker-{worker}", count = 1 });
        }

        sw.Stop();                                      
        times.Add(sw.Elapsed.TotalMilliseconds);
        if ((int)response.StatusCode == 409)
            Interlocked.Increment(ref refusals);
    }
}).ToArray();

await Task.WhenAll(tasks);

var sorted = times.OrderBy(t => t).ToArray();
var p95 = sorted[(int)(sorted.Length * 0.95)];

Console.WriteLine($"Requests:  {sorted.Length}");
Console.WriteLine($"Req/s:     {sorted.Length / (double)seconds:F1}");
Console.WriteLine($"Average:   {sorted.Average():F1} ms");
Console.WriteLine($"95th pct:  {p95:F1} ms");
Console.WriteLine($"Refusals:  {refusals}");
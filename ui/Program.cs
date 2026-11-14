using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using EventBooking.Ui;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

// Book is the only page, so it is the root component: it renders inside <div id="app"> in wwwroot/index.html.
builder.RootComponents.Add<Book>("#app");

// One HttpClient for the whole app, pointed at the API. The address comes from wwwroot/appsettings.json.
// Book.razor receives this client through @inject.
var apiBaseAddress = builder.Configuration["ApiBaseAddress"]!;
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(apiBaseAddress) });

await builder.Build().RunAsync();

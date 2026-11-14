using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using EventBooking.Ui;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

// Book is the only page, so it is the root component: it renders inside <div id="app"> in wwwroot/index.html.
builder.RootComponents.Add<Book>("#app");

// One HttpClient for the whole app, pointed at the API. Book.razor receives it through @inject.
// The address comes from wwwroot/appsettings.json:
//   - In the cluster it is "/": the page calls the address it was loaded from, and nginx forwards to the API (ui/nginx.conf).
//   - With "dotnet run" the environment is Development, so appsettings.Development.json wins: http://localhost:5133.
// Combining with the page's own address turns "/" into e.g. http://127.0.0.1:54321/ and leaves a full address as it is.
var apiBaseAddress = builder.Configuration["ApiBaseAddress"]!;
var pageAddress = new Uri(builder.HostEnvironment.BaseAddress);
builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(pageAddress, apiBaseAddress) });

await builder.Build().RunAsync();

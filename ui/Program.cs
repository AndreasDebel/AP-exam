using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using EventBooking.Ui;

var builder = WebAssemblyHostBuilder.CreateDefault(args);

// Book is the only page, so it is the root component: it renders inside <div id="app"> in wwwroot/index.html.
builder.RootComponents.Add<Book>("#app");

await builder.Build().RunAsync();

# Builds the booking UI into an image: nginx serving the Blazor files.
# Build from the repo root: docker build -t mortenj91/eventbooking-ui ui

# Step 1: compile the Blazor app into plain static files (html, js, wasm).
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish EventBooking.Ui.csproj -c Release -o /publish

# Step 2: nginx serves those files. The browser downloads them and runs the app itself.
FROM nginx:1.27
COPY --from=build /publish/wwwroot /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
